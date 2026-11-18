#!/usr/bin/env node
// Tu (da sua ASR, co dau phay ngat y) + callouts -> project.json mau Gelexia (GelexiaOverlay).
// Chia trang theo y (dau phay = ngat y), toi da 2 dong x maxChars ky tu; KHONG co font.
// Dung: node scripts/gelexia/build-gelexia-project.mjs <episode-spec.json>
import fs from "node:fs";
import path from "node:path";
const spec = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const dir = path.dirname(process.argv[2]);
const words = JSON.parse(fs.readFileSync(spec.wordsFrom, "utf8")).words;
// Lam sach moc tu Whisper: tang dan, khong chong lan, toi thieu 50ms
const W = words.map((w) => ({ ...w }));
W.forEach((w, i) => {
  const prev = W[i - 1];
  if (prev && w.startMs < prev.endMs) w.startMs = prev.endMs;
  if (prev && w.startMs <= prev.startMs) w.startMs = prev.startMs + 50;
  const next = words[i + 1];
  if (next && w.endMs > next.startMs) w.endMs = Math.max(w.startMs + 50, next.startMs);
  if (w.endMs < w.startMs + 50) w.endMs = w.startMs + 50;
});
// Trang viet tay theo y (spec.pages, "/" = xuong dong, "_" = cach trong mot tu), khop tuan tu voi tung tu
let k = 0;
const norm = (s) => s.toLocaleLowerCase("vi").replace(/[^\p{L}\p{N} ]/gu, "").replace(/_/g, " ").trim();
const raw = spec.pages.map((pg) => pg.split("/").map((line) => line.trim().split(/\s+/).map((tok) => {
  const w = W[k++];
  if (!w || norm(tok.replace(/_/g, " ")) !== norm(w.text)) throw new Error(`Lech tu: "${tok}" vs "${w?.text}" (trang "${pg}")`);
  return { tok: tok.replace(/_/g, " "), w };
})));
if (k !== W.length) throw new Error(`Con ${W.length - k} tu chua vao trang`);
const pages = raw.map((lines, i) => {
  const first = lines[0][0].w;
  const nextFirst = raw[i + 1]?.[0][0].w;
  const endMs = nextFirst ? nextFirst.startMs : Math.min(spec.durationMs, lines.at(-1).at(-1).w.endMs + 600);
  const out = lines.map((line) => line.map(({ tok, w }, j) => ({ text: (j ? " " : "") + tok, startMs: w.startMs, endMs: w.endMs, timestampMs: Math.round((w.startMs + w.endMs) / 2), confidence: null })));
  out.at(-1).at(-1).endMs = endMs;
  return { startMs: first.startMs, endMs, lines: out };
});
const project = {
  mode: "production", durationSeconds: spec.durationMs / 1000, fps: spec.fps ?? 60, width: 1080, height: 1920,
  brand: spec.brand, background: spec.background, voice: spec.voice, autoSfx: true, ...(spec.sfx ? { sfx: spec.sfx } : {}),
  pages, callouts: spec.callouts,
};
fs.writeFileSync(path.join(dir, "project.json"), JSON.stringify(project, null, 1));
fs.writeFileSync(path.join(dir, "props.json"), JSON.stringify({ project }));
fs.writeFileSync(path.join(dir, "props-wbw.json"), JSON.stringify({ project: { ...project, wordByWord: spec.wordByWord } }));
fs.writeFileSync(path.join(dir, "caption-pages.txt"), pages.map((p) => `${(p.startMs / 1000).toFixed(2)}-${(p.endMs / 1000).toFixed(2)} | ` + p.lines.map((l) => l.map((w) => w.text).join("")).join(" / ")).join("\n") + "\n");
console.log(`OK ${pages.length} trang, ${spec.callouts.length} callout`);
