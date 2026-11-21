#!/usr/bin/env node
// So sanh anh tinh: khung goc (video mau) | khung dung lai (RefEdit) tai cung moc thoi gian.
// Dung: node scripts/refedit/compare-stills.mjs <plan.json> <out.jpg> t1 t2 ... (t = giay trong video GOC)
import path from "node:path";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { BROWSER, ROOT } from "../pipeline/lib.mjs";

const [planPath, out, ...ts] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
const tmp = path.join(path.dirname(out), "_cmp");
fs.mkdirSync(tmp, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), publicDir: path.join(ROOT, "public") });
const common = { browserExecutable: BROWSER, chromiumOptions: { gl: "swangle" }, logLevel: "error" };
const composition = await selectComposition({ serveUrl, id: "RefEdit", inputProps: { plan }, ...common });
const tiles = [];
for (const t of ts.map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round((t - plan.origStart) * plan.fps));
  const mine = path.join(tmp, `m_${t}.jpg`);
  await renderStill({ serveUrl, composition, inputProps: { plan }, frame, output: mine, scale: 0.5, imageFormat: "jpeg", jpegQuality: 85, ...common });
  const orig = path.join(tmp, `o_${t}.jpg`);
  spawnSync("ffmpeg", ["-v", "error", "-y", "-ss", String(t), "-i", path.join(ROOT, "reference/mau-ref-01.mp4"), "-frames:v", "1", "-vf", "scale=540:960", orig]);
  const pair = path.join(tmp, `p_${t}.jpg`);
  spawnSync("ffmpeg", ["-v", "error", "-y", "-i", orig, "-i", mine, "-filter_complex",
    `[0]drawtext=text='GOC ${t}s':x=10:y=10:fontsize=30:fontcolor=yellow:box=1:boxcolor=black@0.6[a];[1]drawtext=text='DUNG LAI':x=10:y=10:fontsize=30:fontcolor=cyan:box=1:boxcolor=black@0.6[b];[a][b]hstack,scale=540:-2`, pair]);
  tiles.push(pair);
}
const cols = Math.min(4, tiles.length);
const rows = Math.ceil(tiles.length / cols);
const inputs = tiles.flatMap((f) => ["-i", f]);
const layout = tiles.map((_, i) => `${(i % cols) * 540}_${Math.floor(i / cols) * 480}`).join("|");
spawnSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", `${tiles.map((_, i) => `[${i}]`).join("")}xstack=inputs=${tiles.length}:layout=${layout}:fill=black`, out]);
console.log("ok", out, `${cols}x${rows}`);
