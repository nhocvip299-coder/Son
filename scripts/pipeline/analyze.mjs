#!/usr/bin/env node
// Buoc 1 — Phan tich video goc: thong so, chuyen canh, khoang lang, am luong.
import { ffmpegStderr, isMain, log, parseArgs, probe, writeJson } from "./lib.mjs";

export const analyze = (input, outJson) => {
  const p = probe(input);
  const v = p.streams.find((s) => s.codec_type === "video");
  const a = p.streams.find((s) => s.codec_type === "audio");
  if (!v) throw new Error("File khong co luong hinh.");
  const [n, d] = (v.avg_frame_rate !== "0/0" ? v.avg_frame_rate : v.r_frame_rate).split("/").map(Number);
  const rotation = Number(v.side_data_list?.find((s) => s.rotation !== undefined)?.rotation ?? v.tags?.rotate ?? 0);
  const swap = Math.abs(rotation) % 180 === 90;
  const info = {
    file: input,
    durationMs: Math.round(Number(p.format.duration) * 1000),
    width: swap ? v.height : v.width,
    height: swap ? v.width : v.height,
    fps: n / d,
    videoCodec: v.codec_name,
    bitrateKbps: Math.round(Number(p.format.bit_rate) / 1000),
    hasAudio: !!a,
    audio: a ? { codec: a.codec_name, sampleRate: Number(a.sample_rate), channels: a.channels } : null,
  };
  log("phan-tich", `${info.width}x${info.height} ${info.fps.toFixed(2)}fps ${(info.durationMs / 1000).toFixed(1)}s, am thanh: ${info.hasAudio ? "co" : "KHONG"}`);

  // Chuyen canh (scene change)
  const sc = ffmpegStderr(["-i", input, "-an", "-vf", "select='gt(scene,0.32)',showinfo", "-f", "null", "-"]);
  const scenes = [...sc.matchAll(/pts_time:([\d.]+)/g)].map((m) => Math.round(Number(m[1]) * 1000));
  log("phan-tich", `${scenes.length} diem chuyen canh`);

  let silences = [];
  let loudness = null;
  if (info.hasAudio) {
    const si = ffmpegStderr(["-i", input, "-vn", "-af", "silencedetect=n=-35dB:d=0.3", "-f", "null", "-"]);
    const starts = [...si.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
    const ends = [...si.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
    silences = starts.map((s, i) => ({ startMs: Math.round(s * 1000), endMs: Math.round((ends[i] ?? info.durationMs / 1000) * 1000) }));
    const r = ffmpegStderr(["-i", input, "-vn", "-af", "ebur128", "-f", "null", "-"]);
    loudness = Number((/I:\s+(-?[\d.]+) LUFS/.exec(r.split("Summary:")[1] ?? "") ?? [])[1]);
    log("phan-tich", `${silences.length} khoang lang, am luong ${loudness} LUFS`);
  }
  const result = { ...info, scenes, silences, loudness };
  if (outJson) writeJson(outJson, result);
  return result;
};

if (isMain(import.meta.url)) {
  const { pos } = parseArgs(process.argv.slice(2));
  console.log(JSON.stringify(analyze(pos[0], pos[1]), null, 2));
}
