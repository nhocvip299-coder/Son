#!/usr/bin/env node
// Kiem tra chat luong MP4 sau render bang FFprobe/FFmpeg.
// Dung: node scripts/pipeline/qc.mjs out/video.mp4 [--duration 15] [--fps 30] [--w 1080] [--h 1920] [--json out/qc.json]
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";

const args = process.argv.slice(2);
const file = args[0];
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : d;
};
if (!file || !fs.existsSync(file)) {
  console.error("Khong thay file:", file);
  process.exit(2);
}

const probe = JSON.parse(
  execFileSync("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-count_frames", "-of", "json", file]).toString(),
);
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const ff = (filter, extra = []) =>
  spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, ...extra, "-af", filter, "-f", "null", "-"], {
    encoding: "utf8",
  }).stderr;
const ffv = (filter) =>
  spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-an", "-vf", filter, "-f", "null", "-"], {
    encoding: "utf8",
  }).stderr;

const checks = [];
const add = (name, ok, detail, severity = "error") => checks.push({ name, ok, detail, severity });

// 1. Hinh
add("Co luong video", !!v, v ? `${v.codec_name} ${v.profile ?? ""}` : "khong co");
if (v) {
  const [n, d] = v.r_frame_rate.split("/").map(Number);
  const fps = n / d;
  const W = Number(opt("w", 1080));
  const H = Number(opt("h", 1920));
  add("Kich thuoc", v.width === W && v.height === H, `${v.width}x${v.height} (mong doi ${W}x${H})`);
  const wantFps = opt("fps");
  add("FPS", wantFps ? Math.abs(fps - Number(wantFps)) < 0.01 : true, `${fps.toFixed(3)} fps`);
  add("Pixel format", v.pix_fmt === "yuv420p", `${v.pix_fmt} (yuv420p de tuong thich TikTok/iPhone)`);
  const frames = Number(v.nb_read_frames);
  const vdur = Number(v.duration);
  add("So khung hinh", frames > 0 && Math.abs(frames - vdur * fps) <= 2, `${frames} khung / ${vdur.toFixed(3)}s`);
  const kbps = Math.round(Number(probe.format.bit_rate) / 1000);
  add("Bitrate", kbps > 2500, `${kbps} kbps tong`, "warn");
}
// 2. Am thanh
add("Co luong am thanh", !!a, a ? `${a.codec_name} ${a.sample_rate}Hz ${a.channels}ch ${Math.round(a.bit_rate / 1000)}kbps` : "khong co");
// 3. Thoi luong
const dur = Number(probe.format.duration);
const want = opt("duration");
add("Thoi luong", want ? Math.abs(dur - Number(want)) <= 0.1 : dur > 0, `${dur.toFixed(3)}s${want ? ` (mong doi ${want}s)` : ""}`);
if (v && a) {
  const diff = Math.abs(Number(v.duration) - Number(a.duration));
  add("Dong bo do dai hinh/tieng", diff < 0.1, `lech ${diff.toFixed(3)}s`);
}
// 4. Loi giai ma toan file
const dec = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-v", "error", "-i", file, "-f", "null", "-"], { encoding: "utf8" });
add("Giai ma khong loi", dec.stderr.trim() === "", dec.stderr.trim().slice(0, 300) || "0 loi");
// 5. Khung den / dung hinh
const black = [...ffv("blackdetect=d=0.5:pix_th=0.08").matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map((m) => [
  Number(m[1]),
  Number(m[2]),
]);
add("Khong co doan den > 0.5s", black.length === 0, black.length ? JSON.stringify(black) : "khong", "warn");
const freeze = [...ffv("freezedetect=n=0.001:d=1.5").matchAll(/freeze_start: ([\d.]+)/g)].map((m) => Number(m[1]));
add("Khong dong hinh > 1.5s", freeze.length === 0, freeze.length ? `bat dau tai ${freeze.join(", ")}s` : "khong", "warn");
// 6. Am luong
if (a) {
  const r128 = ff("ebur128=peak=true");
  const I = Number((/I:\s+(-?[\d.]+) LUFS/.exec(r128.split("Summary:")[1] ?? "") ?? [])[1]);
  const TP = Number((/Peak:\s+(-?[\d.]+) dBFS/.exec(r128.split("True peak:")[1] ?? "") ?? [])[1]);
  add("Am luong tich hop", I > -24 && I < -8, `${I} LUFS (muc tieu mang xa hoi ~ -14)`, "warn");
  add("True peak khong vo tieng", TP <= -0.5, `${TP} dBTP`, "warn");
  const sil = [...ff("silencedetect=n=-50dB:d=1.0").matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  add("Khong im lang > 1s", sil.length === 0, sil.length ? `tai ${sil.join(", ")}s` : "khong", "warn");
}

const errors = checks.filter((c) => !c.ok && c.severity === "error");
const warns = checks.filter((c) => !c.ok && c.severity === "warn");
for (const c of checks) console.log(`${c.ok ? "✅" : c.severity === "error" ? "❌" : "⚠️ "} ${c.name}: ${c.detail}`);
const verdict = errors.length ? "FAIL" : "PASS";
console.log(`\nKET QUA QC: ${verdict} (${errors.length} loi, ${warns.length} canh bao)`);
const jsonOut = opt("json");
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ file, verdict, checks }, null, 2));
process.exit(errors.length ? 1 : 0);
