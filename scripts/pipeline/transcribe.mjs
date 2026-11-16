#!/usr/bin/env node
// Buoc 2 — Nhan dien giong noi bang Whisper (whisper.cpp, chay CPU), timestamp tung tu.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { toCaptions, transcribe } from "@remotion/install-whisper-cpp";
import { serializeSrt } from "@remotion/captions";
import { WHISPER_DIR, WHISPER_VERSION, isMain, log, parseArgs, writeJson } from "./lib.mjs";

const MODELS = ["large-v3-turbo", "medium", "small", "base"];

export const pickModel = (want) => {
  const have = (m) => fs.existsSync(path.join(WHISPER_DIR, `ggml-${m}.bin`));
  if (want && have(want)) return want;
  const m = MODELS.find(have);
  if (!m) throw new Error("Chua co model Whisper. Chay: node scripts/install-whisper.mjs large-v3-turbo");
  return m;
};

export const transcribeFile = async (input, outDir, { model, language = "vi", prompt } = {}) => {
  const wav = path.join(outDir, "audio16k.wav");
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", input, "-vn", "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav]);
  if (r.status !== 0) throw new Error("Khong tach duoc am thanh: " + r.stderr);
  const m = pickModel(model);
  log("giong-noi", `Whisper model ${m}, ngon ngu ${language}...`);
  const t0 = Date.now();
  const out = await transcribe({
    inputPath: wav,
    whisperPath: WHISPER_DIR,
    whisperCppVersion: WHISPER_VERSION,
    model: m,
    tokenLevelTimestamps: true,
    splitOnWord: true,
    language,
    printOutput: false,
    additionalArgs: prompt ? ["--prompt", prompt] : [],
  });
  const { captions } = toCaptions({ whisperCppOutput: out });
  const clean = captions.filter((c) => c.text.trim() && !/^\s*\[.*\]\s*$/.test(c.text));
  log("giong-noi", `${clean.length} tu trong ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  writeJson(path.join(outDir, "captions.json"), clean);
  // SRT theo cau (de nguoi dung sua/nhap lai)
  const lines = [];
  let cur = [];
  for (const c of clean) {
    cur.push(c);
    if (/[.!?…]$/.test(c.text.trim()) || cur.length >= 10) {
      lines.push(cur);
      cur = [];
    }
  }
  if (cur.length) lines.push(cur);
  fs.writeFileSync(path.join(outDir, "transcript.srt"), serializeSrt({ lines }));
  fs.writeFileSync(path.join(outDir, "transcript.txt"), clean.map((c) => c.text).join("").trim() + "\n");
  return clean;
};

if (isMain(import.meta.url)) {
  const { pos, opts } = parseArgs(process.argv.slice(2));
  const dir = pos[1] ?? path.dirname(pos[0]);
  await transcribeFile(pos[0], dir, { model: opts.model, language: opts.lang ?? "vi" });
}
