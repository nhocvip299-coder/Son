#!/usr/bin/env node
// Master am thanh chuan mang xa hoi: loudnorm 2-pass (-14 LUFS, true peak -1.5 dBTP).
// Luong hinh duoc COPY nguyen (khong ma hoa lai) -> khong giam chat luong hinh.
// Dung: node scripts/pipeline/master-audio.mjs in.mp4 out.mp4 [--lufs -14]
import { spawnSync } from "node:child_process";

const [input, output] = process.argv.slice(2);
const li = process.argv.indexOf("--lufs");
const I = li > 0 ? process.argv[li + 1] : "-14";
const target = `I=${I}:TP=-1.5:LRA=11`;
const p1 = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", input, "-af", `loudnorm=${target}:print_format=json`, "-f", "null", "-"], {
  encoding: "utf8",
});
const m = JSON.parse(p1.stderr.slice(p1.stderr.lastIndexOf("{")));
const vdur = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", input], {
  encoding: "utf8",
}).stdout.trim();
const af = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;
const p2 = spawnSync(
  "ffmpeg",
  ["-hide_banner", "-loglevel", "error", "-y", "-i", input, "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "320k", "-t", vdur, "-movflags", "+faststart", output],
  { encoding: "utf8" },
);
if (p2.status !== 0) {
  console.error(p2.stderr);
  process.exit(1);
}
console.log(`Master xong: ${m.input_i} LUFS -> ${I} LUFS, video copy nguyen -> ${output}`);
