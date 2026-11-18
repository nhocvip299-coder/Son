#!/usr/bin/env node
// Kich ban gelexia (projects/<du-an>/script.json) -> plan GelexiaEdit: ban thuong + ban "chay chu tung chu".
// Dung: node scripts/gelexia/build-plan.mjs projects/che-dua-hoang-gia
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
const sc = JSON.parse(fs.readFileSync(path.join(dir, "script.json"), "utf8"));
let t = 0;
const shots = [];
const words = [];
let sayStart = null, sayText = null;
const flushSay = (end) => {
  if (!sayText) return;
  const ws = sayText.split(/\s+/).filter(Boolean);
  const a = sayStart + 250, b = end - 350;
  const step = (b - a) / ws.length;
  ws.forEach((w, i) => words.push({ text: w, startMs: Math.round(a + i * step), endMs: Math.round(a + (i + 1) * step - 40) }));
};
for (const s of sc.shots) {
  if (s.say) { flushSay(t); sayStart = t; sayText = s.say; }
  shots.push({ srcStartMs: s.src[0], srcEndMs: s.src[1], kb: s.kb, drift: s.drift, trans: s.trans, zoom: s.zoom });
  t += s.src[1] - s.src[0];
}
flushSay(t);
const items = sc.items.map((it) => ({ preset: it.preset, startMs: it.at, durationMs: it.dur, texts: it.texts, fit: it.fit ?? sc.fit, note: it.note }));
const base = { source: sc.source, fps: sc.fps, shots, items, music: sc.music, ambientVolume: sc.ambientVolume, cutSfxVolume: sc.cutSfxVolume };
fs.writeFileSync(path.join(dir, "plan.json"), JSON.stringify(base, null, 1));
fs.writeFileSync(path.join(dir, "plan-chay-chu.json"), JSON.stringify({ ...base, words, wordsY: sc.wordsY, accentRe: sc.accentRe }, null, 1));
console.log(`OK ${shots.length} canh, ${(t / 1000).toFixed(1)}s, ${items.length} preset, ${words.length} tu`);
