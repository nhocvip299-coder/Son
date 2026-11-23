#!/usr/bin/env node
// Plan vid4 (shophouse day Sao Bien - Ocean Park 2): 5 clip DJI -> 1 video ~2:18 theo BAN DUNG GIAY projects/vid4/edl.json
// (diem cat da doi ve cho am nho nhat: work/vid4/edit/edl-refined.json; ghep thu + Whisper nghe lai: khong cut chu, het lap/vap).
// Tu duy editor:
//  - COLD OPEN cau dat nhat (gia thap hon can cat lo) -> chu do + flare
//  - Chao/boi canh: ten du an + "Sao Bien cuc dep"; "cong vien" -> B-roll cong vien (nguoi noi thu goc)
//  - Chuong 1 Vi tri: "gan Masteri, don hang van cu dan" -> B-roll toa thap; "gia tot nhat OP2" -> do
//  - Chuong 2 Mat duong: clip 0308 la loi thuyet minh tren canh di bo -> giu canh that, moi y 1 cum chu (20m / se khe / 7-8m / 6 tang)
//  - Chuong 3 Gia: thi truong (trang/do), "khong con nhieu" (vang canh bao), so sanh VS can cat lo tren nen biet thu mo
//  - CTA: kinh doanh + luu tru, lien he em Son
// Dung: node scripts/refedit/decide.mjs work/vid4/<clip> --no-cut --fixes projects/vid4/asr-fixes.json (moi clip, lay tu da sua)
//       node projects/vid4/plan.mjs
import fs from "node:fs";
import { finalize } from "../../scripts/refedit/finalize-plan.mjs";

const edl = JSON.parse(fs.readFileSync("work/vid4/edit/edl-refined.json", "utf8")).keep;
const SRC = (c) => `inputs/vid4-${c}.mp4`;
const ms = (s) => Math.round(s * 1000);
// moc ra (output) cua tung doan
let acc = 0;
const P = edl.map((k) => {
  const r = { ...k, out0: acc };
  acc += k.b - k.a;
  return r;
});
const END = acc;
/** giay trong clip (cua doan thu i) -> giay tren timeline ra */
const O = (i, t) => {
  const p = P[i];
  if (t < p.a - 0.6 || t > p.b + 0.6) throw new Error(`moc ${t}s ngoai doan ${i} (${p.clip} ${p.a}-${p.b})`);
  return p.out0 + (Math.min(p.b, Math.max(p.a, t)) - p.a); // diem cat da doi theo am thanh -> kep vao doan
};

// ---- Doan hinh: mac dinh mat nguoi noi, luan phien co; cac doan dac biet chia nho theo moc clip ----
const special = {
  // i: [{a,b, kind, ...}]  (a,b = giay trong clip)
  0: [{ a: 16.6, b: 23.25, zoomFrom: 1.0, zoomTo: 1.15, zoomRampMs: 6000, why: "cold open push-in" }],
  2: [
    { a: 10.75, b: 19.0 },
    { a: 19.0, b: 20.95, kind: "bg", broll: { src: SRC("0302"), startMs: 500, mode: "full" }, blurIn: true, why: "'la cong vien' -> canh cong vien" },
  ],
  3: [
    { a: 1.45, b: 9.3, kind: "bg", broll: { src: SRC("0302"), startMs: 1500, mode: "full" }, why: "gan Masteri, don hang van cu dan -> canh toa thap" },
    { a: 9.3, b: 16.75, zoomFrom: 1.0, zoomTo: 1.2, zoomRampMs: 700, why: "gia tot nhat -> zoom" },
  ],
  13: [{ a: 11.4, b: 13.95, zoomFrom: 1.0, zoomTo: 1.2, zoomRampMs: 600, why: "khong con nhieu -> zoom" }],
  14: [
    { a: 14.45, b: 16.4 },
    { a: 16.4, b: 23.25, kind: "bg", broll: { src: SRC("0302"), startMs: 10500, mode: "bg" }, blurIn: true, why: "so sanh VS can cat lo tren nen day biet thu mo" },
  ],
};
const segments = [];
P.forEach((p, i) => {
  const parts = special[i] ?? [{ a: p.a, b: p.b }];
  // phu day doan (neu dac biet khong phu het)
  const filled = [];
  let cur = p.a;
  for (const s of parts) {
    const a = Math.max(p.a, s.a), b = Math.min(p.b, s.b);
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
});

// ---- Hieu ung (moc = doan i, giay trong clip) ----
const it = (type, i, a, b, o) => ({ type, startMs: ms(O(i, a)), endMs: ms(O(i, b)), ...o });
const sp = (i, a, b, setup, punch, punchT, o = {}) => it("setupPunch", i, a, b, { setup, punch, setupAt: 0, punchAt: +(O(i, punchT) - O(i, a)).toFixed(2), ...o });
const items = [
  sp(0, 16.7, 23.2, "Giá tính sơ bộ còn", "THẤP HƠN CĂN CẮT LỖ", 20.1, { why: "cold open: cau dat nhat" }),
  it("flare", 0, 22.85, 23.25, { y: 0.66 }),
  sp(1, 2.6, 7.4, "Đầu tuần sang", "OCEAN PARK 2", 4.6, {}),
  sp(1, 7.5, 10.05, "Một căn", "SAO BIỂN CỰC ĐẸP", 8.2, {}),
  sp(2, 12.0, 19.0, "Nhiều người quan tâm vì", "VỊ TRÍ + GIÁ ƯU ĐÃI", 14.6, {}),
  it("stepBadge", 3, 1.5, 4.2, { n: 1, label: "Vị trí", labelAt: 0.2, exit: "cut", why: "chuong 1" }),
  sp(3, 4.3, 9.25, "Sát chung cư Masteri", "ĐÓN HÀNG VẠN CƯ DÂN", 5.5, {}),
  sp(3, 11.3, 16.7, "Chính sách mới của CĐT", "GIÁ TỐT NHẤT OP2", 14.8, { why: "dinh -> do + zoom" }),
  it("pills", 4, 39.8, 44.3, { pills: [{ text: "Sở hữu rồi dùng làm gì?", at: 0.05 }], why: "cau hoi dan sang tour" }),
  it("leak", 4, 43.9, 44.3, { tone: "orange" }),
  it("stepBadge", 5, 2.0, 4.65, { n: 2, label: "Mặt đường", labelAt: 0.3, exit: "cut", why: "chuong 2: tour" }),
  sp(6, 7.2, 15.55, "Mặt đường trục chính", "HƠN 20M", 11.5, {}),
  sp(7, 22.9, 30.0, "Căn có sẻ khe", "THÊM 1 MẶT THOÁNG", 26.3, {}),
  sp(8, 37.2, 43.5, "Mặt đường phía sau", "7 - 8M", 37.4, {}),
  sp(11, 55.0, 61.7, "Căn nhà xây tận", "6 TẦNG", 59.6, {}),
  it("leak", 11, 61.35, 61.75, { tone: "red" }),
  it("stepBadge", 12, 0.9, 3.6, { n: 3, label: "Giá & thị trường", labelAt: 0.2, exit: "cut", why: "chuong 3" }),
  sp(12, 3.7, 10.2, "Cuối năm thị trường", "CÓ TÍN HIỆU TỐT", 3.8, {}),
  it("warning", 13, 11.45, 13.95, { head: "Không còn nhiều", at: 0, color: "yellow", why: "san pham dep huu han -> canh bao" }),
  it("versus", 14, 16.45, 23.25, { why: "gia so voi can cat lo -> VS", left: { title: "Căn Sao Biển", at: 0.4, rows: [{ text: "Giá còn thấp hơn", at: 3.7, good: true }] },
    right: { title: "Căn cắt lỗ OP2", at: 4.6, rows: [{ text: "Giá cao hơn", at: 5.2, good: false }] } }),
  sp(15, 27.0, 32.1, "Kinh doanh + lưu trú", "VỊ TRÍ ĐẮC ĐỊA", 31.5, {}),
  sp(15, 32.2, 39.65, "Liên hệ trực tiếp", "EM SƠN", 34.4, { why: "CTA" }),
];

const plan = finalize({ source: SRC("0304"), fps: 60, segments, items, sfx: [] });
fs.writeFileSync("work/vid4/plan-final.json", JSON.stringify(plan, null, 1));
// phu de chay chu: tu da sua ASR cua tung clip -> anh xa vao cac doan giu lai
const words = [];
P.forEach((p, i) => {
  const ws = JSON.parse(fs.readFileSync(`work/vid4/${p.clip}/plan-chay-chu.json`, "utf8")).words;
  for (const w of ws) {
    const t0 = w.startMs / 1000;
    if (t0 >= p.a && t0 < p.b - 0.05) words.push({ text: w.text, startMs: ms(O(i, t0)), endMs: ms(O(i, Math.min(p.b, w.endMs / 1000))) });
  }
});
words.sort((x, y) => x.startMs - y.startMs);
fs.writeFileSync("work/vid4/plan-final-chay-chu.json", JSON.stringify({ ...plan, words, wordsY: 1469, wordsTypewriter: true, wordsKeyVolume: 0 }, null, 1));
console.log(`plan-final: ${segments.length} doan, ${items.length} item, ${plan.sfx.length} SFX, ${words.length} tu, dai ${END.toFixed(1)}s`);
