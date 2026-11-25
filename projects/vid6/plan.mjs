#!/usr/bin/env node
// vid6 - CDT Vinhomes tang gia giua song cat lo (1 canh noi ngoai troi toi) - skill reference-video-edit-thinking
// CAT: 1 lan quay lien mach, khong co doan noi lai -> chi cat quang ngac ngu > 0.45s (giu 0.12s moi ben) = jump cut,
//      moi diem cat doi co khung (1.0 <-> 1.1) de giu nhip; kiem lai bang ghep thu + Whisper.
// KE CHUYEN (giu thu tu goc vi da dung mach): cau hoi mo dau (2 the kinh) -> nhan dinh -> vi du tinh thue (canh tram)
//      -> hieu sai thuong gap (VS) -> ap luc that (checklist) -> phan hoa nha dau tu -> so sanh 2 can 15 ty (VS)
//      -> tieu chi chon (checklist) -> BDS tot -> cau hoi ket.
// Canh tram: nen truu tuong + nguoi noi thu vao khung goc (khong co B-roll).
import fs from "node:fs";
import { finalize } from "../../scripts/refedit/finalize-plan.mjs";

const SRC = "inputs/vid6.mp4";
const ms = (s) => Math.round(s * 1000);
const an = JSON.parse(fs.readFileSync("work/vid6/analysis.json", "utf8"));
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

// MACH KE: moc cau (tang gia giua song cat lo) -> boi canh cat lo OP2,3 (canh) -> cau hoi "vi sao?" -> nghich ly (canh)
//   -> chot NGHICH LY (mat + zoom) -> du luan MXH, nghi van "day thuyen" (canh) -> gia thuyet nhin truoc 1-2 nam (mat)
//   -> cau hoi san sang mua? -> binh chon hop ly? (canh) -> keu goi binh luan.
const BG = [
  [5.6, 16.0, "boi canh: nha dau tu OP2,3 cat lo hang ty -> canh nha + bien CAT LO"],
  [19.2, 30.4, "nguoi mua truoc ban / CDT tang gia / nguoi mua sau tra cao -> canh nghich ly (che ca doan lieć 19-22)"],
  [37.9, 53.4, "du luan MXH trai chieu + nghi van day thuyen -> canh dien thoai"],
  [67.3, 73.3, "cau hoi hop ly hay khong -> canh binh chon"],
];
const ZOOM = [[0.0, 5.5], [30.6, 37.5], [53.7, 60.4]];
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
  sp(0.1, 5.5, "Chủ đầu tư Vinhomes lại", "TĂNG GIÁ", 1.8, { why: "moc cau: tin trai chieu" }),
  it("warning", 2.6, 5.5, { head: "Giữa làn sóng cắt lỗ", at: 0, color: "yellow", y: 0.75, why: "boi canh doi lap" }),
  it("flare", 1.7, 2.1, { y: 0.66 }),
  scene("cutLoss", 5.6, 16.0, { place: 9.7, op1: 11.6, cut: 13.3, loss: 14.9 }, [[9.7, "card"], [11.6, "card"], [13.3, "stamp"], [14.9, "rowBad"]]),
  it("pills", 16.05, 18.9, { why: "cau hoi mo -> giu nguoi xem", pills: [{ text: "Vì sao Vinhomes lại tăng giá?", at: rel(16.05, 16.3) }] }),
  scene("paradox", 19.2, 30.4, { left: 19.4, leftRow: 21.3, up: 23.6, right: 26.0, rightRow: 28.1 }, [[19.4, "card"], [21.3, "rowBad"], [23.6, "whoosh"], [26.0, "card"], [28.1, "rowBad"]]),
  sp(30.6, 37.5, "Câu chuyện này chính là", "NGHỊCH LÝ", 32.5, { why: "dinh noi dung -> do + zoom" }),
  scene("social", 37.9, 53.4, { mixed: 41.8, pump: 49.4, exit: 52.0 }, [[39.3, "drop"], [41.8, "card"], [49.4, "punch"], [52.0, "rowBad"]]),
  sp(53.7, 60.4, "Vinhomes đã nhìn trước thị trường", "1-2 NĂM TỚI", 58.7, { why: "gia thuyet thu 2" }),
  it("pills", 60.5, 67.2, { why: "cau hoi 1", pills: [{ text: "Vinhomes tăng giá", at: rel(60.5, 62.9) }, { text: "Anh chị có sẵn sàng mua?", at: rel(60.5, 64.1) }] }),
  scene("vote", 67.3, 73.3, {}, [[67.4, "card"], [67.55, "card"]]),
  it("pills", 73.35, DUR, { why: "keu goi binh luan", pills: [{ text: "Bình luận ở dưới nhé!", at: 0.05 }] }),
];

const plan = finalize({ source: SRC, fps: 60, segments, items, sfx: [] });
fs.writeFileSync("work/vid6/plan-final.json", JSON.stringify(plan, null, 1));
fs.writeFileSync("work/vid6/edit/keep.json", JSON.stringify(K, null, 1));
console.log(`plan: ${keep.length} doan giu, ${segments.length} doan hinh, ${items.length} item, ${plan.sfx.length} SFX, dai ${END.toFixed(1)}s (goc ${DUR.toFixed(1)}s)`);
