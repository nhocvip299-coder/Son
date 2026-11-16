#!/usr/bin/env node
/**
 * AI VIDEO EDITOR — mot lenh chay toan bo quy trinh:
 * Nhan video goc -> Phan tich -> Nhan dien loi noi -> Lap ke hoach dung -> Chon canh (cat theo nhip noi)
 * -> Typography + animation (Remotion) -> Dong bo SFX -> Render -> Master am thanh -> QC -> Xuat MP4
 *
 * Dung:
 *   node scripts/edit.mjs <video-goc> [--style hong-dang] [--fps 30|60] [--model large-v3-turbo]
 *                         [--lang vi] [--out out/ten.mp4] [--plan-only] [--music music/bed-ambient.wav]
 *
 * File goc KHONG bao gio bi sua/xoa: chi tao ban lien ket/sao chep trong public/inputs/.
 */
import fs from "node:fs";
import path from "node:path";
import { analyze } from "./pipeline/analyze.mjs";
import { ROOT, log, parseArgs, slugify, workDir, writeJson } from "./pipeline/lib.mjs";
import { buildPlan } from "./pipeline/plan.mjs";
import { renderComposition, renderPreviews } from "./pipeline/render.mjs";
import { transcribeFile } from "./pipeline/transcribe.mjs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const { pos, opts } = parseArgs(process.argv.slice(2));
const input = pos[0];
if (!input || !fs.existsSync(input)) {
  console.error("Cach dung: node scripts/edit.mjs <video-goc.mp4> --style hong-dang");
  process.exit(2);
}
const styleId = opts.style ?? "hong-dang";
const fps = Number(opts.fps ?? 30);
const base = slugify(path.basename(input, path.extname(input)));
const slug = `${base}-${styleId}`;
const dir = workDir(slug);
const outFile = path.resolve(opts.out ?? path.join(ROOT, "out", `${slug}.mp4`));
fs.mkdirSync(path.dirname(outFile), { recursive: true });
const t0 = Date.now();

// 0. Dua video goc vao public/ (hard link neu duoc, khong thi sao chep) — khong dong vao file goc
const st = fs.statSync(input);
const fid = createHash("sha1").update(`${path.resolve(input)}|${st.size}|${st.mtimeMs}`).digest("hex").slice(0, 8);
const pubRel = `inputs/${base}-${fid}${path.extname(input).toLowerCase()}`;
const pubAbs = path.join(ROOT, "public", pubRel);
fs.mkdirSync(path.dirname(pubAbs), { recursive: true });
if (!fs.existsSync(pubAbs)) {
  try {
    fs.linkSync(path.resolve(input), pubAbs);
  } catch {
    fs.copyFileSync(input, pubAbs);
  }
}

log("1/7 phan-tich", input);
const analysis = analyze(pubAbs, path.join(dir, "analysis.json"));

log("2/7 giong-noi", "Nhan dien loi noi...");
const captions = analysis.hasAudio
  ? await transcribeFile(pubAbs, dir, { model: opts.model, language: opts.lang ?? "vi" })
  : [];
if (!captions.length) log("2/7 giong-noi", "Khong co loi noi -> giu nguyen video, khong co phu de");

log("3/7 ke-hoach", `Style: ${styleId}`);
const plan = buildPlan({ analysis, captions, styleId, sourcePublicPath: pubRel, fps, music: opts.music });
writeJson(path.join(dir, "plan.json"), plan);
if (plan._meta.styleStatus === "placeholder") {
  log("3/7 ke-hoach", `⚠️  Style "${styleId}" dang la KHUNG CHO (chua hoc tu video mau) — ket qua chi la phong cach mac dinh.`);
}
if (opts["plan-only"]) {
  log("xong", `Ke hoach: ${path.join(dir, "plan.json")}`);
  process.exit(0);
}

log("4-6/7 render", "Dung typography, animation, SFX bang Remotion...");
const raw = path.join(dir, "render-raw.mp4");
await renderComposition({ id: "AutoEdit", inputProps: { plan }, output: raw });

log("7/7 master+qc", "Chuan hoa am luong, kiem tra chat luong...");
const m = spawnSync("node", [path.join(ROOT, "scripts/pipeline/master-audio.mjs"), raw, outFile], { stdio: "inherit" });
if (m.status !== 0) process.exit(1);
const qc = spawnSync(
  "node",
  [path.join(ROOT, "scripts/pipeline/qc.mjs"), outFile, "--fps", String(fps), "--duration", String(plan._meta.outputMs / 1000), "--json", path.join(dir, "qc.json")],
  { stdio: "inherit" },
);

// Anh xem truoc (contact sheet) de duyet nhanh tren dien thoai
const total = Math.round((plan._meta.outputMs / 1000) * fps);
const frames = [0.08, 0.25, 0.42, 0.58, 0.75, 0.92].map((r) => Math.floor(total * r));
const stills = await renderPreviews({ id: "AutoEdit", inputProps: { plan }, framesList: frames, outPattern: path.join(dir, "preview-%d.jpg") });
const sheet = outFile.replace(/\.mp4$/, "-preview.jpg");
spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...stills.flatMap((s) => ["-i", s]), "-filter_complex", `${stills.map((_, i) => `[${i}]`).join("")}hstack=${stills.length}`, sheet]);

const report = [
  `# Bao cao dung: ${path.basename(input)}`,
  `- Style: ${styleId} (${plan._meta.styleStatus})`,
  `- Goc: ${(analysis.durationMs / 1000).toFixed(1)}s -> Thanh pham: ${(plan._meta.outputMs / 1000).toFixed(1)}s (cat ${(plan._meta.removedMs / 1000).toFixed(1)}s khoang lang)`,
  `- So doan cat: ${plan.segments.length}, tieu de nhan manh: ${plan.titles.length}, tu phu de: ${plan.captions.length}`,
  `- QC: ${qc.status === 0 ? "PASS" : "FAIL"} (chi tiet: qc.json)`,
  `- File: ${outFile}`,
  `- Xem truoc: ${sheet}`,
  `- Loi thoai nhan dien: transcript.txt / transcript.srt (sua roi chay lai voi --captions neu can)`,
  `- Thoi gian xu ly: ${((Date.now() - t0) / 1000).toFixed(0)}s`,
].join("\n");
fs.writeFileSync(path.join(dir, "report.md"), report + "\n");
console.log("\n" + report);
process.exit(qc.status ?? 1);
