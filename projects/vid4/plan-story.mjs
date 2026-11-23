#!/usr/bin/env node
// vid4 - BAN KE CHUYEN (nguoi dung hoi "da hop phong cach ke chuyen chua" -> dung lai mach ke)
// Dung lai cac doan da cat sach (work/vid4/edit/edl-refined.json), chi DOI THU TU + giam chu:
//  1 Mo dau: cau dat nhat + cau hoi mo "Vi sao?"          (doan 0)
//  2 Nut that: cuoi nam thi truong tram lang, can dep hiem  (doan 12, 13 - DUA TU CUOI LEN)
//  3 Hanh trinh: dau tuan sang OP2 -> cong vien -> Masteri -> "moi anh chi di xem" (doan 1(bo loi chao),2,3,4)
//  4 Kham pha: tour mat duong - 4 diem nhan                 (doan 5-11)
//  5 Giai dap: nhac lai "thap hon can cat lo" + VS          (doan 14)
//  6 Ket: kinh doanh + luu tru, lien he                     (doan 15)
// Bo badge chuong (bien video thanh bai giang), chu do 13 -> 8.
import fs from "node:fs";
import { finalize } from "../../scripts/refedit/finalize-plan.mjs";

const E = JSON.parse(fs.readFileSync("work/vid4/edit/edl-refined.json", "utf8")).keep;
const SRC = (c) => `inputs/vid4-${c}.mp4`;
const ms = (s) => Math.round(s * 1000);
// thu tu ke chuyen: [chi so doan, a?, b?] (a/b = cat bot trong doan)
const ORDER = [[0], [12], [13], [1, 2.05], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [14], [15]];
let acc = 0;
const P = ORDER.map(([i, a, b]) => {
  const k = E[i];
  const r = { ...k, i, a: a ?? k.a, b: b ?? k.b, out0: acc };
  acc += r.b - r.a;
  return r;
});
const END = acc;
const idx = (i) => P.findIndex((p) => p.i === i);
const O = (i, t) => {
  const p = P[idx(i)];
  return p.out0 + (Math.min(p.b, Math.max(p.a, t)) - p.a);
};

// doan hinh dac biet (theo chi so doan GOC, giay trong clip)
const special = {
  0: [{ a: 16.6, b: 23.4, zoomFrom: 1.0, zoomTo: 1.15, zoomRampMs: 6000, why: "mo dau push-in" }],
  13: [{ a: 11.0, b: 14.2, zoomFrom: 1.0, zoomTo: 1.2, zoomRampMs: 600, why: "can dep hiem -> zoom" }],
  2: [{ a: 10.7, b: 19.0 }, { a: 19.0, b: 21.3, kind: "bg", broll: { src: SRC("0302"), startMs: 500, mode: "full" }, blurIn: true, why: "cong vien" }],
  3: [
    { a: 1.4, b: 9.3, kind: "bg", broll: { src: SRC("0302"), startMs: 1500, mode: "full" }, why: "Masteri -> toa thap" },
    { a: 9.3, b: 17.0 },
  ],
  14: [{ a: 14.2, b: 16.4 }, { a: 16.4, b: 23.4, kind: "bg", broll: { src: SRC("0302"), startMs: 10500, mode: "bg" }, blurIn: true, why: "giai dap -> VS tren nen biet thu mo" }],
};
const segments = [];
for (const p of P) {
  const parts = special[p.i] ?? [{ a: p.a, b: p.b }];
  let cur = p.a;
  const filled = [];
  for (const s of parts) {
    const a = Math.max(p.a, s.a), b = Math.min(p.b, s.b);
    if (b <= a) continue;
    if (a > cur + 0.02) filled.push({ a: cur, b: a });
    filled.push({ ...s, a, b });
    cur = b;
  }
  if (cur < p.b - 0.02) filled.push({ a: cur, b: p.b });
  for (const s of filled) {
    const z = segments.length % 2 ? 1.1 : 1.0;
    const { a, b, kind = "th", ...rest } = s;
    segments.push({ srcStartMs: ms(a), srcEndMs: ms(b), source: SRC(p.clip), kind, ...(kind === "th" && rest.zoomFrom === undefined ? { zoomFrom: z, zoomTo: z } : {}), ...rest });
  }
}

const it = (type, i, a, b, o) => ({ type, startMs: ms(O(i, a)), endMs: ms(O(i, b)), ...o });
const sp = (i, a, b, setup, punch, punchT, o = {}) => it("setupPunch", i, a, b, { setup, punch, setupAt: 0, punchAt: +(O(i, punchT) - O(i, a)).toFixed(2), ...o });
const items = [
  // 1 Mo dau + cau hoi mo
  sp(0, 16.9, 21.9, "Giá tính sơ bộ còn", "THẤP HƠN CĂN CẮT LỖ", 20.1, { why: "mo dau: cau dat nhat" }),
  it("pills", 0, 21.95, 23.31, { pills: [{ text: "Vì sao?", at: 0.0 }], why: "cau hoi mo -> giu nguoi xem den doan giai dap" }),
  it("flare", 0, 22.95, 23.31, { y: 0.66 }),
  // 2 Nut that
  sp(12, 3.0, 10.4, "Cuối năm thị trường vẫn", "TRẦM LẮNG", 6.9, { why: "xung dot cua cau chuyen" }),
  it("warning", 13, 11.25, 14.08, { head: "Căn đẹp không còn nhiều", at: 0, color: "yellow", why: "khan hiem" }),
  // 3 Hanh trinh
  sp(1, 2.1, 7.4, "Đầu tuần sang", "OCEAN PARK 2", 4.6, { why: "dia diem cua hanh trinh" }),
  sp(3, 4.3, 9.25, "Sát chung cư Masteri", "ĐÓN HÀNG VẠN CƯ DÂN", 5.5, {}),
  it("leak", 4, 43.99, 44.39, { tone: "orange", why: "chuyen sang doan kham pha" }),
  // 4 Kham pha
  sp(6, 7.2, 15.45, "Mặt đường trục chính", "HƠN 20M", 11.5, {}),
  sp(7, 22.9, 30.0, "Căn có sẻ khe", "THÊM 1 MẶT THOÁNG", 26.3, {}),
  sp(8, 37.45, 43.7, "Mặt đường phía sau", "7 - 8M", 37.5, {}),
  sp(11, 55.0, 61.9, "Căn nhà xây tận", "6 TẦNG", 59.6, {}),
  // 5 Giai dap
  it("versus", 14, 16.45, 23.31, { why: "tra loi cau hoi mo dau", left: { title: "Căn Sao Biển", at: 0.4, rows: [{ text: "Giá còn thấp hơn", at: 3.7, good: true }] },
    right: { title: "Căn cắt lỗ OP2", at: 4.6, rows: [{ text: "Giá cao hơn", at: 5.2, good: false }] } }),
  // 6 Ket
  sp(15, 32.2, 39.87, "Liên hệ trực tiếp", "EM SƠN", 34.4, { why: "CTA" }),
];

const plan = { ...finalize({ source: SRC("0304"), fps: 60, segments, items, sfx: [] }), music: { src: "music/bed-ambient.wav", volume: 0.06 } };
fs.writeFileSync("work/vid4/plan-story.json", JSON.stringify(plan, null, 1));
const words = [];
for (const p of P) {
  const ws = JSON.parse(fs.readFileSync(`work/vid4/${p.clip}/plan-chay-chu.json`, "utf8")).words;
  for (const w of ws) {
    const t0 = w.startMs / 1000;
    if (t0 >= p.a && t0 < p.b - 0.05) words.push({ text: w.text, startMs: ms(O(p.i, t0)), endMs: ms(O(p.i, Math.min(p.b, w.endMs / 1000))) });
  }
}
words.sort((x, y) => x.startMs - y.startMs);
fs.writeFileSync("work/vid4/plan-story-chay-chu.json", JSON.stringify({ ...plan, words, wordsY: 1469, wordsTypewriter: true, wordsKeyVolume: 0 }, null, 1));
// am thanh tham chieu cho sfx-level: ghep giong theo thu tu moi
fs.writeFileSync("work/vid4/edit/story-order.json", JSON.stringify(P.map((p) => ({ clip: p.clip, a: p.a, b: p.b })), null, 1));
console.log(`plan-story: ${segments.length} doan, ${items.length} item, ${plan.sfx.length} SFX, ${words.length} tu, dai ${END.toFixed(1)}s`);
