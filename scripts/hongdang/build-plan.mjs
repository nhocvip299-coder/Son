#!/usr/bin/env node
// Dung plan cho composition HongDangEdit tu: captions.json + analysis.json + edit-script.json
// - Cat khoang lang > silenceMs (giu pad), chia them tai diem chuyen canh goc
// - Punch-in luan phien giua cac shot (toan <-> can) theo mau Hong Dang
// - Neo moi hieu ung vao tu (chi so) roi doi sang timeline dau ra; kiem tra chong cheo
// Dung: node scripts/hongdang/build-plan.mjs <work-dir>
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const caps = read("captions.json");
const an = read("analysis.json");
const sc = read("edit-script.json");
const { silenceMs, padMs, punchIn } = sc.cut;

// 1. Cat khoang lang: dung silencedetect (nang luong am) vi timestamp tu cua Whisper thuong phu kin khoang lang.
//    Timestamp Whisper lech ~200ms nen tin so do nang luong cho khoang lang GIUA cau.
//    Khoang lang cuoi video giu nguyen (cau ket thuong nho dan, de bi -35dB nham la lang).
const cutsOut = an.silences
  .filter((x) => x.endMs - x.startMs > silenceMs && x.endMs < an.durationMs - 100)
  .map((x) => ({ s: x.startMs + padMs, e: x.endMs - padMs }));
let keep = [];
let cur = 0;
for (const c of cutsOut) {
  if (c.s > cur) keep.push({ s: cur, e: c.s });
  cur = c.e;
}
if (cur < an.durationMs) keep.push({ s: cur, e: an.durationMs });
// 2. chia tai chuyen canh goc + punch-in luan phien
const pieces = [];
for (const k of keep) {
  const pts = [k.s, ...an.scenes.filter((t) => t > k.s + 300 && t < k.e - 300), k.e];
  for (let i = 0; i < pts.length - 1; i++) pieces.push({ srcStartMs: Math.round(pts[i]), srcEndMs: Math.round(pts[i + 1]) });
}
let out = 0;
const segments = pieces.map((p, i) => {
  const r = { ...p, zoom: i % 2 === 1 ? punchIn : 1, outStartMs: out };
  out += p.srcEndMs - p.srcStartMs;
  return r;
});
const totalMs = out;
const map = (ms) => {
  const s = segments.find((x) => ms >= x.srcStartMs && ms < x.srcEndMs) ?? segments.find((x) => ms < x.srcStartMs);
  return s ? s.outStartMs + Math.max(0, ms - s.srcStartMs) : totalMs;
};
// 3. hieu ung
const items = sc.items.map(({ at, dur, ...rest }) => {
  const startMs = Math.max(0, map(caps[at].startMs) - 100);
  return { ...rest, startMs, durationMs: Math.round(Math.min(dur * 1000, totalMs - startMs)) };
});
// 4. kiem tra: khong chong cheo trong cung vung (keyword/card = vung giua; big = vung tren)
const zone = (t) => (t === "big" ? "top" : "mid");
const errs = [];
for (let i = 0; i < items.length; i++)
  for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j];
    if (zone(a.type) !== zone(b.type)) continue;
    if (a.startMs < b.startMs + b.durationMs && b.startMs < a.startMs + a.durationMs)
      errs.push(`Chong cheo: "${a.keyword ?? a.line1 ?? a.text}" va "${b.keyword ?? b.line1 ?? b.text}"`);
  }
if (errs.length) {
  console.error(errs.join("\n"));
  process.exit(1);
}
const plan = { source: sc.source, fps: sc.fps, segments: segments.map(({ outStartMs, ...s }) => s), items, watermark: sc.watermark };
fs.writeFileSync(path.join(dir, "hd-plan.json"), JSON.stringify(plan, null, 1));
console.log(`OK: ${segments.length} shot, cat ${((an.durationMs - totalMs) / 1000).toFixed(2)}s, ${items.length} hieu ung, thanh pham ${(totalMs / 1000).toFixed(2)}s`);
