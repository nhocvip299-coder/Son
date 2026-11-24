#!/usr/bin/env node
// Ghep nen video (khong chu) tu danh sach canh cua plan (srcStartMs/srcEndMs/rate) -> MP4 1080x1920, tat am goc.
// Moi canh ma hoa rieng bang -ss (tiet kiem bo nho), roi noi bang concat demuxer.
// Dung: node scripts/gelexia/build-base.mjs <plan.json> <source.mp4> <out.mp4> <totalMs> [fps=60]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
const [planF, src, out, totalMs, fpsArg] = process.argv.slice(2);
const fps = Number(fpsArg ?? 60);
const plan = JSON.parse(fs.readFileSync(planF, "utf8"));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gx-base-"));
const run = (args) => { const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" }); if (r.status !== 0) { console.log("LOI"); process.exit(1); } };
const list = [];
plan.shots.forEach((s, i) => {
  const f = path.join(tmp, `s${String(i).padStart(3, "0")}.mp4`);
  const dur = (s.srcEndMs - s.srcStartMs) / 1000;
  run(["-ss", String(s.srcStartMs / 1000), "-t", String(dur), "-i", src, "-vf", `setpts=(PTS-STARTPTS)/${s.rate},fps=${fps},scale=1080:1920,setsar=1`, "-an", "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-pix_fmt", "yuv420p", "-threads", "2", f]);
  list.push(`file '${f}'`);
});
fs.writeFileSync(path.join(tmp, "list.txt"), list.join("\n"));
run(["-f", "concat", "-safe", "0", "-i", path.join(tmp, "list.txt"), "-vf", `tpad=stop_mode=clone:stop_duration=2,trim=duration=${Number(totalMs) / 1000},setpts=PTS-STARTPTS`, "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-pix_fmt", "yuv420p", "-an", out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`OK ${out} (${plan.shots.length} canh, cat ${Number(totalMs) / 1000}s)`);
