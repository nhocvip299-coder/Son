#!/usr/bin/env node
// Xuat khung hinh timeline de nguoi dung DUYET truoc khi render: moi item 1 khung (luc hien day du), co moc giay + ten.
// Dung: node scripts/refedit/timeline-frames.mjs <plan.json> <out-prefix> [--cols 5]
import path from "node:path"; import fs from "node:fs"; import { spawnSync } from "node:child_process";
import { bundle } from "@remotion/bundler"; import { renderStill, selectComposition } from "@remotion/renderer";
import { BROWSER, ROOT, parseArgs } from "../pipeline/lib.mjs";
const { pos, opts } = parseArgs(process.argv.slice(2));
const [planP, outPrefix] = pos; const COLS = Number(opts.cols ?? 5); const ROWS = 3;
const plan = JSON.parse(fs.readFileSync(planP, "utf8"));
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), publicDir: path.join(ROOT, "public") });
const common = { browserExecutable: BROWSER, chromiumOptions: { gl: "swangle" }, logLevel: "error" };
const composition = await selectComposition({ serveUrl, id: "RefEdit", inputProps: { plan }, ...common });
const name = (it) => (it.punch ?? it.label ?? it.title ?? it.text ?? it.head ?? it.neg ?? (it.cards ? "the vang" : it.bars ? "cot gia" : it.left ? "so sanh VS" : it.pills ? "the kinh" : it.from ? "gia giam" : "")).toString();
const shots = plan.items.filter((i) => !["leak", "flare"].includes(i.type)).map((it) => {
  const dur = (it.endMs - it.startMs) / 1000;
  // chup luc hien DAY DU: sau khi chu do vao (punchAt), cuoi item voi do hoa nhieu buoc
  const full = it.type === "setupPunch" ? dur - 0.25 : ["cards", "versus", "bars", "priceDrop", "pills"].includes(it.type) ? dur - 0.25 : it.type === "stepBadge" ? (it.labelAt ?? 0) + 0.8 : 1.0;
  const t = it.startMs / 1000 + Math.min(dur - 0.12, full);
  return { t, label: `${t.toFixed(1)}s ${it.type} - ${name(it)}`.replace(/[':\\]/g, "") };
});
const tmp = path.join(path.dirname(outPrefix), "_tl"); fs.mkdirSync(tmp, { recursive: true });
const tiles = [];
for (const [i, s] of shots.entries()) {
  const f = path.join(tmp, `f${i}.jpg`);
  await renderStill({ serveUrl, composition, inputProps: { plan }, frame: Math.round(s.t * plan.fps), output: f, scale: 0.3, imageFormat: "jpeg", jpegQuality: 88, ...common });
  const g = path.join(tmp, `g${i}.jpg`);
  fs.writeFileSync(path.join(tmp, `l${i}.txt`), `${i + 1}. ${s.label}`);
  // --safe: to vung bi giao dien TikTok/Reels che (tren 220px, duoi tu 1400px, cot nut phai x>940 tu 0.45H) — toa do da nhan 0.3
  const safe = opts.safe ? "drawbox=x=0:y=0:w=324:h=66:color=red@0.28:t=fill,drawbox=x=0:y=420:w=324:h=156:color=red@0.28:t=fill,drawbox=x=282:y=259:w=42:h=161:color=red@0.28:t=fill," : "";
  spawnSync("ffmpeg", ["-v", "error", "-y", "-i", f, "-vf", `${safe}pad=324:616:0:0:black,drawtext=textfile=${path.join(tmp, `l${i}.txt`)}:x=6:y=584:fontsize=17:fontcolor=yellow`, g]);
  tiles.push(g);
}
const per = COLS * ROWS; const outs = [];
for (let p = 0; p * per < tiles.length; p++) {
  const part = tiles.slice(p * per, (p + 1) * per);
  const out = `${outPrefix}-${p + 1}.jpg`;
  const layout = part.map((_, i) => `${(i % COLS) * 324}_${Math.floor(i / COLS) * 616}`).join("|");
  spawnSync("ffmpeg", ["-v", "error", "-y", ...part.flatMap((f) => ["-i", f]), "-filter_complex", `${part.map((_, i) => `[${i}]`).join("")}xstack=inputs=${part.length}:layout=${layout}:fill=black`, "-q:v", "3", out]);
  outs.push(out);
}
console.log(outs.join("\n"));
