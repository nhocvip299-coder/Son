#!/usr/bin/env node
// Danh gia Decision Engine: so quyet dinh cua engine (chay tren loi thoai video mau) voi su kien that cua editor goc.
// Dung: node scripts/refedit/eval-engine.mjs work/ref01/plan.json styles/reference-01/timeline.json
import fs from "node:fs";
const [planP, tlP] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync(planP, "utf8"));
const tl = JSON.parse(fs.readFileSync(tlP, "utf8"));
const MAP = { "hook-number-3d": "hook", "setup-line": "setupPunch", "punch-line": "setupPunch", "setup+punch": "setupPunch", "prop-3d": "clock", "step-badge": "step", "question-pills": "pills", "example-list": "list", "contrast-pair": "contrast", "structure-cards": "cards", "emphasis-red": "emphasis", "big-numeral": "numeral", warning: "warning", "warning-red": "warning", "checklist-card-3d": "checklist", "breathing-room": "breath", "recap-badges": "recap" };
const gt = tl.events.map((e) => ({ kind: MAP[e.kind], t: e.t_in, text: e.text })).filter((e) => e.kind);
// engine: lay thoi diem dau tien cua moi quyet dinh (item dau tien mang nhan dk)
const eng = [];
for (const it of plan.items) {
  if (!it.dk || it.type === "flare" || it.type === "leak") continue;
  const last = eng[eng.length - 1];
  if (last && last.kind === it.dk && Math.abs(last.t - it.startMs / 1000) < 0.6) continue;
  eng.push({ kind: it.dk, t: it.startMs / 1000 });
}
// breath khong co item -> lay tu segments zoom (khong danh gia thoi diem)
const breathDec = plan.segments.some((s) => s.why === "zoom ramp (breath)");
if (breathDec) eng.push({ kind: "breath", t: gt.find((g) => g.kind === "breath")?.t ?? 0 });
const used = new Set();
const rows = [];
for (const g of gt) {
  let best = -1, bd = 1e9;
  eng.forEach((e, i) => {
    if (used.has(i) || e.kind !== g.kind) return;
    const d = Math.abs(e.t - g.t);
    if (d < bd && d <= 1.5) (bd = d), (best = i);
  });
  if (best >= 0) used.add(best);
  rows.push({ ...g, hit: best >= 0, dt: best >= 0 ? +(eng[best].t - g.t).toFixed(2) : null });
}
const extra = eng.filter((_, i) => !used.has(i));
const hits = rows.filter((r) => r.hit);
const mae = hits.reduce((a, r) => a + Math.abs(r.dt), 0) / Math.max(1, hits.length);
const res = { recall: +(hits.length / rows.length).toFixed(2), precision: +(hits.length / eng.length).toFixed(2), timing_mae_s: +mae.toFixed(2), matched: hits.length, gt: rows.length, engine: eng.length, missed: rows.filter((r) => !r.hit).map((r) => `${r.t}s ${r.kind} "${r.text}"`), extra: extra.map((e) => `${e.t.toFixed(2)}s ${e.kind}`), rows };
console.log(JSON.stringify({ ...res, rows: undefined }, null, 1));
fs.writeFileSync(planP.replace(/plan\.json$/, "engine-eval.json"), JSON.stringify(res, null, 1));
