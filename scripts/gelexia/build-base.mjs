#!/usr/bin/env node
// Ghep nen video (khong chu) tu danh sach canh cua plan (srcStartMs/srcEndMs/rate) -> MP4 1080x1920, tat am goc.
// Dung: node scripts/gelexia/build-base.mjs <plan.json> <source.mp4> <out.mp4> <totalMs> [fps=60]
import fs from "node:fs";
import { spawnSync } from "node:child_process";
const [planF, src, out, totalMs, fpsArg] = process.argv.slice(2);
const fps = Number(fpsArg ?? 60);
const plan = JSON.parse(fs.readFileSync(planF, "utf8"));
const parts = [];
let acc = 0;
plan.shots.forEach((s, i) => {
  const d = (s.srcEndMs - s.srcStartMs) / s.rate;
  parts.push(`[0:v]trim=start=${s.srcStartMs / 1000}:end=${s.srcEndMs / 1000},setpts=(PTS-STARTPTS)/${s.rate},fps=${fps},scale=1080:1920,setsar=1[v${i}]`);
  acc += d;
});
const n = plan.shots.length;
const fc = parts.join(";") + ";" + Array.from({ length: n }, (_, i) => `[v${i}]`).join("") + `concat=n=${n}:v=1:a=0,tpad=stop_mode=clone:stop_duration=2,trim=duration=${Number(totalMs) / 1000}[v]`;
const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-filter_complex", fc, "-map", "[v]", "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-pix_fmt", "yuv420p", "-an", out], { stdio: "inherit" });
console.log(r.status === 0 ? `OK ${out} (${(acc / 1000).toFixed(2)}s canh, cat ${Number(totalMs) / 1000}s)` : "LOI");
process.exit(r.status ?? 1);
