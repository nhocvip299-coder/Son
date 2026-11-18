#!/usr/bin/env node
// Kich ban dang "paras" (moi doan loi + canh + chu) -> plan GelexiaEdit (ban thuong: phu de cum; ban chay chu tung chu).
// Chua co giong: thoi luong doan = so tu / wps; tu chia theo do dai + nghi o dau cau.
// Co giong (--words captions.json tu Whisper): dung moc that cua tung tu.
// Dung: node scripts/gelexia/build-plan-v3.mjs projects/che-dua-hoang-gia/script-v3.json [--words asr/captions.json]
import fs from "node:fs";
import path from "node:path";

const file = process.argv[2];
const sc = JSON.parse(fs.readFileSync(file, "utf8"));
const dir = path.dirname(file);
const wps = sc.wps ?? 4.6;
let t = 0;
const shots = [], words = [], items = [], tags = [];
for (const p of sc.paras) {
  const raw = p.text.replace(/["“”]/g, "").split(/\s+/).filter(Boolean);
  const dur = Math.round((raw.length / wps) * 1000);
  // gop cum doc -> chu hien thi (vd "Ca Tê mười hai" -> "KT12"), giu trong so thoi gian
  const disp = Object.entries(sc.display ?? {}).sort((a, b) => b[0].split(" ").length - a[0].split(" ").length);
  const ws = [], wt = [];
  for (let i = 0; i < raw.length; ) {
    let hit = null;
    for (const [k, v] of disp) {
      const n = k.split(" ").length;
      const seg = raw.slice(i, i + n);
      if (seg.length === n && seg.join(" ").replace(/[.,!?:;]$/, "").toLowerCase() === k.toLowerCase()) {
        hit = { v: v + (seg[n - 1].match(/[.,!?:;]$/)?.[0] ?? ""), n, w: seg.reduce((a, x) => a + 0.6 + x.length * 0.08, 0) };
        break;
      }
    }
    if (hit) { ws.push(hit.v); wt.push(hit.w); i += hit.n; }
    else { ws.push(raw[i]); wt.push(0.6 + raw[i].length * 0.08); i++; }
  }
  const pause = ws.map((w) => (/[.!?]$/.test(w) ? 0.45 : /[,:;]$/.test(w) ? 0.2 : 0));
  const total = wt.reduce((a, b) => a + b, 0) + pause.reduce((a, b) => a + b, 0);
  const k = (dur - 300) / total;
  let c = t + 150;
  ws.forEach((w, i) => {
    words.push({ text: w, startMs: Math.round(c), endMs: Math.round(c + wt[i] * k - 30) });
    c += (wt[i] + pause[i]) * k;
  });
  // canh: chia thoi luong doan theo ti le thoi luong nguon
  const srcLen = p.shots.map((s) => (s.src[1] - s.src[0]) / (s.rate ?? 1));
  const sum = srcLen.reduce((a, b) => a + b, 0);
  p.shots.forEach((s, i) => {
    const out = (dur * srcLen[i]) / sum;
    const rate = ((s.src[1] - s.src[0]) / out);
    shots.push({ srcStartMs: s.src[0], srcEndMs: s.src[1], rate: Math.round(rate * 1000) / 1000, kb: s.kb, drift: s.drift, trans: s.trans, zoom: s.zoom });
  });
  for (const it of p.items ?? []) items.push({ preset: it.preset, startMs: t + it.at, durationMs: it.dur, texts: it.texts, fit: it.fit ?? sc.fit, note: it.note });
  for (const g of p.tags ?? []) tags.push({ startMs: t + g.at, durationMs: g.dur, line1: g.line1, line2: g.line2, y: g.y });
  t += dur;
}
const base = { source: sc.source, fps: sc.fps, shots, items, tags, words, accentRe: sc.accentRe, music: sc.music, ambientVolume: sc.ambientVolume };
const out = path.join(dir, "plan-v3.json");
fs.writeFileSync(out, JSON.stringify({ ...base, subs: true, subsY: sc.subsY }, null, 1));
fs.writeFileSync(path.join(dir, "plan-v3-chay-chu.json"), JSON.stringify({ ...base, wordsY: sc.wordsY }, null, 1));
console.log(`OK ${shots.length} canh, ${(t / 1000).toFixed(1)}s, ${items.length} preset, ${tags.length} nhan, ${words.length} tu; rate min ${Math.min(...shots.map((s) => s.rate))}`);
