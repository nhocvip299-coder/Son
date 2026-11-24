#!/usr/bin/env node
// vid5 - Thue dat bo hoang 0,2% (1 canh noi truoc tuong, khong B-roll) - skill reference-video-edit-thinking
// CAT: 1 lan quay lien mach, khong co doan noi lai -> chi cat quang ngac ngu > 0.45s (giu 0.12s moi ben) = jump cut,
//      moi diem cat doi co khung (1.0 <-> 1.1) de giu nhip; kiem lai bang ghep thu + Whisper.
// KE CHUYEN (giu thu tu goc vi da dung mach): cau hoi mo dau (2 the kinh) -> nhan dinh -> vi du tinh thue (canh tram)
//      -> hieu sai thuong gap (VS) -> ap luc that (checklist) -> phan hoa nha dau tu -> so sanh 2 can 15 ty (VS)
//      -> tieu chi chon (checklist) -> BDS tot -> cau hoi ket.
// Canh tram: nen truu tuong + nguoi noi thu vao khung goc (khong co B-roll).
import fs from "node:fs";
import { finalize } from "../../scripts/refedit/finalize-plan.mjs";

const SRC = "inputs/vid5.mp4";
const ms = (s) => Math.round(s * 1000);
const an = JSON.parse(fs.readFileSync("work/vid5/analysis.json", "utf8"));
const DUR = an.durationMs / 1000;
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

// canh tram (giay goc) -> nen truu tuong + PiP
// [SUA theo nguoi dung] doan lieć mat doc kich ban (do bang MediaPipe: scripts/refedit/gaze.py -> work/vid5/glance.json,
// kiem bang mat) -> dua vao canh tram, nguoi noi thu vao khung goc + do hoa dung noi dung dang noi.
const BG = [
  [18.2, 25.4, "lieć mat 19-21.4: 'khong chi o muc thue 0,2%' -> contrast"],
  [43.4, 57.0, "vi du 10 ty -> 20 trieu/nam"],
  [60.5, 72.3, "bo hoang vs chua ve o: 2 khai niem -> VS"],
  [78.4, 89.3, "ap luc that -> checklist (+lieć 85.8-88.6)"],
  [92.9, 97.4, "lieć 93-94.6: chi phi nam giu -> dong ho cat"],
  [101.6, 110.4, "lieć 102-110: nhom dau tu rui ro -> checklist"],
  [113.3, 122.6, "2 can shophouse 15 ty -> VS"],
  [122.6, 135.9, "lieć 127-135: tieu chi chon -> checklist"],
  [135.9, 143.4, "lieć 136-141: khong chi tang gia -> contrast"],
  [148.4, 154.7, "lieć 148.6-150: cau hoi ket -> the kinh"],
];
const ZOOM = [[25.4, 30.0], [89.3, 92.9], [97.4, 101.6], [110.4, 113.3], [143.4, 145.8]]; // dinh noi dung (mat nhin camera) -> zoom ramp
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
// [SUA theo nguoi dung] canh tram = CANH MINH HOA DONG (troi sang, nha/dat/tien/bieu do) thay nen toi -> src/styles/refEdit/scenes.tsx
const scene = (name, a, b, cues, sfx = []) => it("scene", a, b, { name, cues: Object.fromEntries(Object.entries(cues).map(([k, v]) => [k, rel(a, v)])), sfx: sfx.map(([t, key]) => ({ at: rel(a, t), key })) });
const items = [
  sp(0.1, 5.75, "Từ 1/7/2027 đất bỏ hoang chịu", "THUẾ 0,2%", 5.1, { why: "mo dau: tin chinh sach" }),
  it("flare", 5.4, 5.8, { y: 0.66 }),
  it("pills", 6.0, 17.9, { why: "2 cau hoi mo (nhu video mau 10.8s)", pills: [{ text: "Biệt thự đắp chiếu có bị ảnh hưởng?", at: rel(6.0, 11.9) }, { text: "Sắp có làn sóng bán ra?", at: rel(6.0, 14.4) }] }),
  // A dat bo hoang + dau thue
  scene("landTax", 18.2, 25.4, { stamp: 24.0 }, [[18.5, "drop"], [24.0, "stamp"]]),
  it("pills", 18.3, 21.4, { pills: [{ text: "Điều đáng chú ý là gì?", at: rel(18.3, 19.4) }] }),
  it("contrast", 21.4, 25.4, { y: 0.64, neg: "Không chỉ ở mức thuế", at: rel(21.4, 21.5), words: [] }),
  sp(25.45, 30.0, "Mà chính là", "ĐỊNH HƯỚNG QUẢN LÝ", 26.2, { why: "nhan dinh -> do + zoom (mat nhin camera)" }),
  it("warning", 30.2, 37.9, { head: "Hạn chế găm đất", sub: "Đưa tài sản vào đúng mục đích", at: 0, subAt: rel(30.2, 34.1), color: "yellow", why: "dinh huong" }),
  // B 10 ty x 0,2% -> 20 trieu/nam
  scene("taxCalc", 43.4, 57.0, { arrow: 47.6, coins: 48.3 }, [[43.6, "drop"], [47.6, "whoosh"], [48.3, "coin"]]),
  it("warning", 51.4, 57.0, { head: "Theo khung giá nhà nước", at: 0, color: "red", y: 0.65, why: "khong phai gia thi truong" }),
  sp(57.2, 60.45, "Anh chị phải", "HIỂU ĐÚNG", 59.3, {}),
  // C dat bo hoang VS biet thu chua ve o
  scene("landVsVilla", 60.5, 72.3, { left: 61.8, right: 65.3, leftRow: 63.3, rightRow: 68.4 }, [[61.8, "card"], [63.3, "rowBad"], [65.3, "card"], [68.4, "rowGood"]]),
  sp(72.4, 78.35, "Thuế chỉ là một phần", "ÁP LỰC LỚN NHẤT", 77.4, {}),
  // D 3 qua ta chi phi de len nha
  scene("pressure", 78.4, 89.3, { w1: 79.7, w2: 80.6, w3: 83.3, feather: 86.6 }, [[79.7, "drop"], [80.6, "drop"], [83.3, "drop"], [86.6, "card"]]),
  it("contrast", 86.4, 89.3, { y: 0.64, neg: "Không thể chỉ vì", at: 0, words: [{ text: "Thuế 0,2%", at: rel(86.4, 88.4), x: 0.5 }], why: "lieć mat -> canh tram" }),
  sp(89.35, 92.9, "Mà", "KẾT LUẬN THỊ TRƯỜNG", 90.0, { why: "mat nhin camera -> zoom" }),
  // E chi phi nam giu tang theo thoi gian
  scene("holdingCost", 92.9, 97.4, {}, [[93.0, "whoosh"]]),
  sp(93.2, 97.4, "Đáng nói nhất là", "CHI PHÍ NẮM GIỮ TĂNG", 95.7, { why: "dinh" }),
  sp(97.45, 101.6, "Các nhóm nhà đầu tư", "PHÂN HÓA RÕ RÀNG", 99.1, { why: "mat nhin camera -> zoom" }),
  // F don bay + tai san bo khong + dong tien ri
  scene("leverage", 101.6, 110.4, { loan: 101.7, idle: 104.6, leak: 106.9 }, [[101.7, "drop"], [104.6, "card"], [106.9, "rowBad"]]),
  it("warning", 109.0, 110.4, { head: "Mới đáng lo ngại", at: 0, color: "red", y: 0.68, why: "ket y" }),
  sp(110.45, 113.3, "Cùng một căn shophouse", "15 TỶ", 112.0, {}),
  // G shophouse cho thue VS dong cua
  scene("shopVs", 113.3, 122.6, { left: 113.5, leftRow: 115.2, right: 120.5, rightRow: 121.6 }, [[113.5, "card"], [115.2, "coin"], [120.5, "whoosh"], [121.6, "rowBad"]]),
  // H tieu chi chon
  scene("criteria", 122.6, 135.9, { pin: 125.5, loc: 130.2, rent: 132.0, exploit: 133.5 }, [[125.5, "drop"], [130.2, "rowGood"], [132.0, "rowGood"], [133.5, "coin"]]),
  sp(122.7, 129.9, "Lý do chọn BĐS tại", "VINHOMES OCEAN PARK 2, 3", 125.5, { why: "dia diem (nguoi dung xac nhan ten)" }),
  // I khong chi tang gia ma con khai thac
  scene("goodRE", 135.9, 143.4, { up: 140.5, gear: 142.1 }, [[140.1, "whoosh"]]),
  it("contrast", 136.0, 141.0, { y: 0.64, neg: "BĐS tốt không chỉ", at: rel(136.0, 136.1), words: [{ text: "Tăng giá", at: rel(136.0, 140.5), x: 0.5 }] }),
  sp(141.0, 143.4, "Mà phải có", "PHƯƠNG ÁN KHAI THÁC", 142.1, { why: "chot y" }),
  // J cau hoi ket: can
  scene("choice", 148.4, 154.7, { left: 151.2, right: 154.1 }, [[151.2, "drop"], [154.1, "coin"]]),
  it("pills", 148.5, DUR, { why: "cau hoi ket keo binh luan", pills: [{ text: "Nắm giữ chờ tăng giá?", at: rel(148.5, 151.2) }, { text: "Hay BĐS sinh dòng tiền?", at: rel(148.5, 152.5) }] }),
];

const plan = finalize({ source: SRC, fps: 60, segments, items, sfx: [] });
fs.writeFileSync("work/vid5/plan-final.json", JSON.stringify(plan, null, 1));
fs.writeFileSync("work/vid5/edit/keep.json", JSON.stringify(K, null, 1));
console.log(`plan: ${keep.length} doan giu, ${segments.length} doan hinh, ${items.length} item, ${plan.sfx.length} SFX, dai ${END.toFixed(1)}s (goc ${DUR.toFixed(1)}s)`);
