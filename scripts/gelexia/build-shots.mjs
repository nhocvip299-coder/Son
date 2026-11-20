#!/usr/bin/env node
// segments.json (canh neo theo chi so tu giong) + vo-captions.json + asr-fixes.json
// -> plan.json { shots[{srcStartMs,srcEndMs,rate}] } va words.json { words } cho build-base / build-gelexia-project.
// Dung: node scripts/gelexia/build-shots.mjs projects/<tap>
import fs from "node:fs";
import path from "node:path";
const dir = process.argv[2];
const rd = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const caps = rd("vo-captions.json"), fx = rd("asr-fixes.json").byIndex, seg = rd("segments.json");
const words = caps.map((c, i) => ({ text: fx[String(i)] ?? c.text.trim().replace(/[,.]$/, ""), startMs: c.startMs, endMs: c.endMs })).filter((w) => w.text !== "");
fs.writeFileSync(path.join(dir, "words.json"), JSON.stringify({ words }, null, 1));
const shots = [];
seg.segments.forEach((s, i) => {
  const t0 = i === 0 ? 0 : caps[s.anchor].startMs - 100;
  const t1 = i + 1 < seg.segments.length ? caps[seg.segments[i + 1].anchor].startMs - 100 : seg.endMs;
  const out = t1 - t0, src = s.src.map(([a, b]) => b - a), sum = src.reduce((a, b) => a + b, 0);
  s.src.forEach(([a, b], k) => shots.push({ srcStartMs: a, srcEndMs: b, rate: Math.round(((b - a) / ((out * src[k]) / sum)) * 1000) / 1000, note: s.note }));
});
fs.writeFileSync(path.join(dir, "plan.json"), JSON.stringify({ shots }, null, 1));
console.log(`OK ${shots.length} canh, ${(seg.endMs / 1000).toFixed(1)}s; rate ${Math.min(...shots.map((s) => s.rate))}..${Math.max(...shots.map((s) => s.rate))}`);
