#!/usr/bin/env node
// vid7 - Lien ke OCP2 phan khu Kinh Do: 15 ty -> hon 10 ty nho voucher 30% (quay di bo ngoai pho) - skill reference-video-edit-thinking
// CAT: 1 lan quay lien mach, khong co doan noi lai -> chi cat quang ngac ngu > 0.45s (giu 0.12s moi ben) = jump cut,
//      moi diem cat doi co khung (1.0 <-> 1.1) de giu nhip; kiem lai bang ghep thu + Whisper.
// KE CHUYEN (giu thu tu goc vi da dung mach): cau hoi mo dau (2 the kinh) -> nhan dinh -> vi du tinh thue (canh tram)
//      -> hieu sai thuong gap (VS) -> ap luc that (checklist) -> phan hoa nha dau tu -> so sanh 2 can 15 ty (VS)
//      -> tieu chi chon (checklist) -> BDS tot -> cau hoi ket.
// Canh tram: nen truu tuong + nguoi noi thu vao khung goc (khong co B-roll).
import fs from "node:fs";
import { finalize } from "../../scripts/refedit/finalize-plan.mjs";

const SRC = "inputs/vid7.mp4";
const ms = (s) => Math.round(s * 1000);
const an = JSON.parse(fs.readFileSync("work/vid7/analysis.json", "utf8"));
const DUR = 65.3; // [CAT] sau 64.8s la khoang lang + khung den
// giu lai: bo quang lang > 0.45s (chua 0.12s dem moi ben)
const keep = [];
let cur = 0.0;
for (const s of an.silences) {
  const a = s.startMs / 1000, b = s.endMs / 1000;
  if (b - a < 0.45 || b > DUR - 0.2) continue;
  if (a + 0.12 > cur) keep.push([cur, a + 0.12]);
  cur = b - 0.12;
}
keep.push([cur, DUR]);
if (keep[0][1] - keep[0][0] < 0.05) keep.shift();
let acc = 0;
const K = keep.map(([a, b]) => { const r = { a, b, out0: acc }; acc += b - a; return r; });
const END = acc;
/** giay goc -> giay tren timeline ra (roi vao khoang lang da cat thi day ve dau doan sau) */
const O = (t) => {
  for (const k of K) { if (t < k.a) return k.out0; if (t <= k.b) return k.out0 + t - k.a; }
  return END;
};

// MACH KE: moc gia (hon 10 ty / lien ke) -> thong so (ban ve kich thuoc) -> co hoi cuoi cho nguoi co voucher (mat + zoom)
//   -> canh that di bo: mat tien lon, duong rong, gan trung tam, phan khu Kinh Do -> cong nang KD + luu tru (canh)
//   -> gia 15 ty -> voucher 30% + chinh sach -> hon 10 ty (canh) -> voucher het han cuoi 2026 (canh lich)
//   -> thang 12 CDT tang gia (mat + zoom) -> ai dang co voucher? -> lien he Em Son.
const BG = [
  [2.5, 10.4, "thong so can -> ban ve kich thuoc dong"],
  [21.0, 28.0, "kinh doanh + luu tru tang tren -> mat cat cong nang"],
  [28.0, 39.6, "15 ty -> voucher 30% + chinh sach -> hon 10 ty"],
  [39.7, 46.5, "voucher het han cuoi 2026 -> lich + dau HET HAN"],
];
const ZOOM = [[10.4, 13.8], [47.3, 53.0], [61.0, 65.3]];
const inR = (t, R) => R.find(([a, b]) => t >= a - 0.01 && t < b - 0.01);
// cat doan giu theo ranh gioi BG/ZOOM
const cuts = [...new Set([...BG.flatMap((r) => [r[0], r[1]]), ...ZOOM.flatMap((r) => r)])].sort((x, y) => x - y);
const segments = [];
for (const k of K) {
  const pts = [k.a, ...cuts.filter((c) => c > k.a + 0.15 && c < k.b - 0.15), k.b];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], mid = (a + b) / 2;
    const bg = inR(mid, BG);
    const zm = inR(mid, ZOOM);
    const z = segments.length % 2 ? 1.1 : 1.0;
    const prev = segments[segments.length - 1];
    if (bg) segments.push({ srcStartMs: ms(a), srcEndMs: ms(b), kind: "bg", scene: true, blurIn: !(prev && prev.kind === "bg"), why: bg[2] });
    else if (zm) segments.push({ srcStartMs: ms(a), srcEndMs: ms(b), kind: "th", zoomFrom: 1.0, zoomTo: 1.2, zoomRampMs: 700, why: "dinh -> zoom ramp" });
    else segments.push({ srcStartMs: ms(a), srcEndMs: ms(b), kind: "th", zoomFrom: z, zoomTo: z });
  }
}

const it = (type, a, b, o) => ({ type, startMs: ms(O(a)), endMs: ms(O(b)), ...o });
const rel = (a, t) => +(O(t) - O(a)).toFixed(2);
const sp = (a, b, setup, punch, punchT, o = {}) => it("setupPunch", a, b, { setup, punch, setupAt: 0, punchAt: rel(a, punchT), ...o });
const scene = (name, a, b, cues, sfx = []) => it("scene", a, b, { name, cues: Object.fromEntries(Object.entries(cues).map(([k, v]) => [k, rel(a, v)])), sfx: sfx.map(([t, key]) => ({ at: rel(a, t), key })) });
const items = [
  sp(0.0, 2.5, "Cho một căn liền kề", "HƠN 10 TỶ", 1.6, { why: "moc cau: con so gia" }),
  it("flare", 1.5, 1.9, { y: 0.66 }),
  scene("specSheet", 2.5, 10.4, { front: 3.5, area: 5.2, floors: 6.2, road: 8.4, walk: 10.0 }, [[3.5, "whoosh"], [5.2, "card"], [6.2, "drop"], [8.4, "rowGood"], [10.0, "rowGood"]]),
  sp(10.45, 14.8, "Cơ hội cuối cùng cho", "AI ĐANG CÓ VOUCHER", 12.9, { why: "doi tuong khan gia -> zoom" }),
  it("list", 14.85, 18.7, { title: "Dòng sản phẩm", titleAt: 0, layout: "stack", items: [{ text: "Mặt tiền lớn", at: rel(14.85, 15.5) }, { text: "Đường rộng", at: rel(14.85, 17.0) }, { text: "Gần khu trung tâm", at: rel(14.85, 17.8) }], why: "canh that di bo doc day nha" }),
  sp(18.75, 21.0, "Vinhomes Ocean Park 2", "PHÂN KHU KINH ĐÔ", 20.2, { why: "dia diem" }),
  scene("mixedUse", 21.0, 28.0, { shop: 23.1, stay: 26.0 }, [[23.1, "card"], [26.0, "card"]]),
  scene("voucher", 28.0, 39.6, { price: 33.6, voucher: 34.8, policy: 36.3, newPrice: 38.8 }, [[33.6, "card"], [34.8, "whoosh"], [36.3, "rowGood"], [38.8, "punch"]]),
  scene("deadline", 39.7, 46.5, { voucher: 43.4, year: 41.2, expire: 45.8 }, [[41.2, "card"], [43.4, "drop"], [45.8, "stamp"]]),
  sp(47.35, 53.0, "Tháng 12 chủ đầu tư", "TĂNG GIÁ", 50.6, { why: "ap luc thoi gian -> do + zoom" }),
  it("pills", 53.1, 61.0, { why: "goi dung nguoi co voucher", pills: [{ text: "Đang có voucher 30%?", at: rel(53.1, 55.9) }, { text: "Muốn đầu tư thêm OCP2?", at: rel(53.1, 58.0) }] }),
  sp(61.05, DUR, "Liên hệ trực tiếp", "EM SƠN", 63.7, { why: "CTA" }),
];

const plan = finalize({ source: SRC, fps: 60, segments, items, sfx: [] });
fs.writeFileSync("work/vid7/plan-final.json", JSON.stringify(plan, null, 1));
fs.writeFileSync("work/vid7/edit/keep.json", JSON.stringify(K, null, 1));
console.log(`plan: ${keep.length} doan giu, ${segments.length} doan hinh, ${items.length} item, ${plan.sfx.length} SFX, dai ${END.toFixed(1)}s (goc ${DUR.toFixed(1)}s)`);
