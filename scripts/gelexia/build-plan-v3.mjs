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
// Co giong that: --vo <captions.json> --fixes <asr-fixes.json>
const argv = process.argv.slice(3);
const opt = (k) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : null; };
let vo = null;
if (opt("vo")) {
  const caps = JSON.parse(fs.readFileSync(opt("vo"), "utf8"));
  const fx = JSON.parse(fs.readFileSync(opt("fixes"), "utf8"));
  const PROPER = /^(Ocean|Park|Vin|KT12|Phố|Đông|Dừa|Hoàng|Gia|\d|35K|55K)/;
  const toks = [];
  caps.forEach((c, i) => {
    const f = fx.byIndex?.[String(i)];
    const text = f === undefined ? c.text.trim() : f;
    if (text === "") { if (toks.length) toks[toks.length - 1].endMs = c.endMs; toks.push(null); return; }
    toks.push({ text, startMs: c.startMs, endMs: c.endMs });
  });
  // dau phay khi tu sau viet hoa (bat dau cau) -> phu de ngat cum dung cho
  const list = [];
  toks.forEach((t, i) => {
    if (!t) return;
    const nx = toks.slice(i + 1).find(Boolean);
    if (nx && /^\p{Lu}/u.test(nx.text) && !PROPER.test(nx.text)) t.text += ",";
    list.push({ t, i });
  });
  const anchors = fx.paraAnchors;
  const startOf = (k) => (k < anchors.length ? caps[anchors[k]].startMs : Number(opt("end")));
  vo = { list, anchors, startOf };
}
let t = 0;
const shots = [], words = [], items = [], tags = [];
sc.paras.forEach((p, pi) => {
  if (vo) {
    const t0 = pi === 0 ? 0 : vo.startOf(pi) - 120;
    const t1 = pi === sc.paras.length - 1 ? vo.startOf(pi + 1) + 600 : vo.startOf(pi + 1) - 120;
    const lo = vo.anchors[pi], hi = pi + 1 < vo.anchors.length ? vo.anchors[pi + 1] : 1e9;
    for (const { t, i } of vo.list) if (i >= lo && i < hi) words.push({ text: t.text, startMs: t.startMs, endMs: t.endMs });
    addShots(p, t0, t1 - t0);
    t = t1;
    return;
  }
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
  addShots(p, t, dur);
  t += dur;
});
function addShots(p, t, dur) {
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
}
const voice = opt("vo") && sc.voice ? sc.voice : undefined;
const base = { voice, musicUnderVoice: sc.musicUnderVoice, source: sc.source, fps: sc.fps, shots, items, tags, words, accentRe: sc.accentRe, music: sc.music, ambientVolume: sc.ambientVolume };
const suf = opt("vo") ? "-vo" : "";
const out = path.join(dir, `plan-v3${suf}.json`);
fs.writeFileSync(out, JSON.stringify({ ...base, subs: true, subsY: sc.subsY }, null, 1));
fs.writeFileSync(path.join(dir, `plan-v3${suf}-chay-chu.json`), JSON.stringify({ ...base, words: words.map((w) => ({ ...w, text: w.text.replace(/[,.:;]$/, "") })), wordsY: sc.wordsY }, null, 1));
console.log(`OK ${shots.length} canh, ${(t / 1000).toFixed(1)}s, ${items.length} preset, ${tags.length} nhan, ${words.length} tu; rate min ${Math.min(...shots.map((s) => s.rate))}`);
