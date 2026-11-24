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
const BG = [
  [43.4, 57.0, "vi du 10 ty -> 20 trieu/nam"],
  [60.5, 72.3, "bo hoang vs chua ve o: 2 khai niem -> VS"],
  [79.0, 86.2, "ap luc that -> checklist"],
  [110.0, 122.5, "2 can shophouse 15 ty -> VS"],
  [122.6, 135.9, "tieu chi chon -> checklist"],
];
const ZOOM = [[18.2, 25.0], [93.2, 97.2], [106.9, 109.9], [141.0, 145.8]]; // dinh noi dung -> zoom ramp
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
    if (bg) segments.push({ srcStartMs: ms(a), srcEndMs: ms(b), kind: "bg", blurIn: !(prev && prev.kind === "bg"), why: bg[2] });
    else if (zm) segments.push({ srcStartMs: ms(a), srcEndMs: ms(b), kind: "th", zoomFrom: 1.0, zoomTo: 1.2, zoomRampMs: 700, why: "dinh -> zoom ramp" });
    else segments.push({ srcStartMs: ms(a), srcEndMs: ms(b), kind: "th", zoomFrom: z, zoomTo: z });
  }
}

const it = (type, a, b, o) => ({ type, startMs: ms(O(a)), endMs: ms(O(b)), ...o });
const rel = (a, t) => +(O(t) - O(a)).toFixed(2);
const sp = (a, b, setup, punch, punchT, o = {}) => it("setupPunch", a, b, { setup, punch, setupAt: 0, punchAt: rel(a, punchT), ...o });
const items = [
  sp(0.1, 5.75, "Từ 1/7/2027 đất bỏ hoang chịu", "THUẾ 0,2%", 5.1, { why: "mo dau: tin chinh sach" }),
  it("flare", 5.4, 5.8, { y: 0.66 }),
  it("pills", 6.0, 17.9, { why: "2 cau hoi mo (nhu video mau 10.8s)", pills: [{ text: "Biệt thự đắp chiếu có bị ảnh hưởng?", at: rel(6.0, 11.9) }, { text: "Sắp có làn sóng bán ra?", at: rel(6.0, 14.4) }] }),
  sp(19.0, 30.0, "Điều đáng chú ý là", "ĐỊNH HƯỚNG QUẢN LÝ", 26.2, { why: "nhan dinh -> do + zoom" }),
  it("warning", 30.2, 37.9, { head: "Hạn chế găm đất", sub: "Đưa tài sản vào đúng mục đích", at: 0, subAt: rel(30.2, 34.1), color: "yellow", why: "dinh huong" }),
  it("cards", 43.5, 57.0, { why: "vi du tinh thue -> the vang", cards: [
    { at: 0.1, lines: [{ text: "Tài sản 10 tỷ", at: 0.3 }] },
    { at: rel(43.5, 47.6), lines: [{ text: "Thuế ≈ 20 triệu/năm", at: rel(43.5, 48.3) }] },
  ] }),
  it("warning", 51.4, 57.0, { head: "Theo khung giá nhà nước", at: 0, color: "red", y: 0.63, why: "khong phai gia thi truong" }),
  sp(57.2, 60.45, "Anh chị phải", "HIỂU ĐÚNG", 59.3, {}),
  it("versus", 60.6, 72.3, { why: "2 khai niem khac nhau", left: { title: "BĐS bỏ hoang", at: rel(60.6, 61.8), rows: [{ text: "Chịu thuế 0,2%", at: rel(60.6, 63.3), good: false }] },
    right: { title: "Biệt thự chưa về ở", at: rel(60.6, 65.3), rows: [{ text: "Không mặc định bị thuế", at: rel(60.6, 68.4), good: true }] } }),
  sp(72.4, 79.0, "Thuế chỉ là một phần", "ÁP LỰC LỚN NHẤT", 77.4, {}),
  it("cards", 79.05, 86.2, { tilt3d: true, why: "chi phi that", cards: [{ at: 0, lines: [{ text: "Chi phí lãi vay", at: rel(79.05, 79.7) }, { text: "Quản lý, bảo trì", at: rel(79.05, 80.6) }, { text: "Chi phí cơ hội", at: rel(79.05, 83.3) }] }] }),
  sp(86.4, 92.9, "Không thể chỉ vì 0,2%", "KẾT LUẬN THỊ TRƯỜNG", 90.0, {}),
  sp(93.3, 97.2, "Đáng nói nhất là", "CHI PHÍ NẮM GIỮ TĂNG", 95.7, { why: "dinh -> do + zoom" }),
  sp(100.0, 109.9, "Đòn bẩy cao, tài sản không khai thác", "MỚI ĐÁNG LO NGẠI", 109.4, {}),
  it("versus", 110.2, 122.5, { why: "cung shophouse 15 ty", left: { title: "Cho thuê", at: rel(110.2, 113.3), rows: [{ text: "Dòng tiền đều hàng tháng", at: rel(110.2, 115.2), good: true }] },
    right: { title: "Đóng cửa chờ giá", at: rel(110.2, 120.5), rows: [{ text: "Không sinh dòng tiền", at: rel(110.2, 121.6), good: false }] } }),
  it("cards", 122.7, 135.9, { tilt3d: true, why: "tieu chi chon BDS", cards: [{ at: 0, lines: [{ text: "Vị trí, mật độ dân cư", at: rel(122.7, 130.2) }, { text: "Khả năng cho thuê", at: rel(122.7, 132.0) }, { text: "Tiềm năng khai thác", at: rel(122.7, 133.5) }] }] }),
  sp(136.1, 145.8, "BĐS tốt phải có", "PHƯƠNG ÁN KHAI THÁC", 142.1, { why: "chot y" }),
  it("pills", 146.1, DUR, { why: "cau hoi ket keo binh luan", pills: [{ text: "Chờ tăng giá hay dòng tiền?", at: rel(146.1, 149.7) }] }),
];

const plan = finalize({ source: SRC, fps: 60, segments, items, sfx: [] });
fs.writeFileSync("work/vid5/plan-final.json", JSON.stringify(plan, null, 1));
fs.writeFileSync("work/vid5/edit/keep.json", JSON.stringify(K, null, 1));
console.log(`plan: ${keep.length} doan giu, ${segments.length} doan hinh, ${items.length} item, ${plan.sfx.length} SFX, dai ${END.toFixed(1)}s (goc ${DUR.toFixed(1)}s)`);
