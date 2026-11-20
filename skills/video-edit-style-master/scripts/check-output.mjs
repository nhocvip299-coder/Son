#!/usr/bin/env node
// Kiem tra MP4 dau ra: dung lai scripts/pipeline/qc.mjs (kich thuoc, fps, den, dung hinh, LUFS, true peak, dong bo)
// + ve khung VUNG AN TOAN len 6 khung hinh de soat chu bang mat -> <video>.safe.jpg
// Dung: node skills/video-edit-style-master/scripts/check-output.mjs <video.mp4> [--fps 60] [--duration 83]
import { spawnSync } from "node:child_process";
const [video, ...rest] = process.argv.slice(2);
if (!video) { console.error("Dung: check-output.mjs <video.mp4> [--fps N] [--duration S]"); process.exit(2); }
const qc = spawnSync("node", ["scripts/pipeline/qc.mjs", video, ...rest], { encoding: "utf8" });
process.stdout.write(qc.stdout.split("\n").filter((l) => /✅|⚠️|❌|KET QUA/.test(l)).join("\n") + "\n");
const dur = Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], { encoding: "utf8" }).stdout);
const ts = [0.12, 0.3, 0.45, 0.6, 0.75, 0.9].map((k) => (dur * k).toFixed(2));
const inputs = ts.flatMap((t) => ["-ss", t, "-i", video]);
const box = "scale=540:960,drawbox=x=75:y=110:w=390:h=590:color=red@0.9:t=2";
const fc = ts.map((_, i) => `[${i}:v]${box},trim=end_frame=1[v${i}]`).join(";") + ";" + ts.map((_, i) => `[v${i}]`).join("") + `hstack=${ts.length}`;
spawnSync("ffmpeg", ["-nostdin", "-v", "error", "-y", ...inputs, "-filter_complex", fc, "-frames:v", "1", `${video}.safe.jpg`]);
console.log(`Anh vung an toan: ${video}.safe.jpg`);
process.exit(qc.status ?? 1);
