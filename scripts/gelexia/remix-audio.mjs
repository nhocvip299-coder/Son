#!/usr/bin/env node
// Tron lai am thanh (giong + sfx[] cua project) cho video da render, giu nguyen hinh — dung khi chi doi SFX.
// Dung: node scripts/gelexia/remix-audio.mjs <project.json> <video-in.mp4> <out.mp4>
import fs from "node:fs";
import { spawnSync } from "node:child_process";
const [pf, vin, out] = process.argv.slice(2);
const p = JSON.parse(fs.readFileSync(pf, "utf8"));
const args = ["-v", "error", "-y", "-i", vin, "-i", `public/${p.voice}`];
const f = ["[1:a]aresample=48000,aformat=channel_layouts=stereo[a0]"];
p.sfx.forEach((s, i) => {
  args.push("-i", `public/${s.file}`);
  f.push(`[${i + 2}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${s.volume ?? 1},adelay=${s.atMs}|${s.atMs}[a${i + 1}]`);
});
const n = p.sfx.length + 1;
f.push(Array.from({ length: n }, (_, i) => `[a${i}]`).join("") + `amix=inputs=${n}:normalize=0:duration=first,apad[aout]`);
args.push("-filter_complex", f.join(";"), "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-shortest", out);
const r = spawnSync("ffmpeg", args, { stdio: "inherit" });
console.log(r.status === 0 ? `OK ${out}` : "LOI");
process.exit(r.status ?? 1);
