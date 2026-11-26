#!/usr/bin/env node
// vid8 - Lien ke Co Xanh OCP2 52m2 chom 6 ty (selfie di bo) - skill reference-video-edit-thinking
// CAT: 1 lan quay lien mach, khong co doan noi lai -> chi cat quang ngac ngu > 0.45s (giu 0.12s moi ben) = jump cut,
//      moi diem cat doi co khung (1.0 <-> 1.1) de giu nhip; kiem lai bang ghep thu + Whisper.
// KE CHUYEN (giu thu tu goc vi da dung mach): cau hoi mo dau (2 the kinh) -> nhan dinh -> vi du tinh thue (canh tram)
//      -> hieu sai thuong gap (VS) -> ap luc that (checklist) -> phan hoa nha dau tu -> so sanh 2 can 15 ty (VS)
//      -> tieu chi chon (checklist) -> BDS tot -> cau hoi ket.
// Canh tram: nen truu tuong + nguoi noi thu vao khung goc (khong co B-roll).
import fs from "node:fs";
import { finalize } from "../../scripts/refedit/finalize-plan.mjs";

const SRC = "inputs/vid8.mp4";
const ms = (s) => Math.round(s * 1000);
const an = JSON.parse(fs.readFileSync("work/vid8/analysis.json", "utf8"));
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

// [VI TRI CHU] quay selfie, mat thap trong khung (mui 0.44-0.68H) -> chu dat TREN DAU (0.17H, vung troi), danh sach duoi cam.
// MACH KE: moc chu (chom 6 ty) khi dang chao -> can 52m2 -> gia re chom 6 ty (zoom) -> canh that duong 8m via he 4m
//   -> ban do vi tri (Masteri, truong tieu hoc) -> khan hiem 48-52m2 -> keu goi lien he.
const BG = [
  [25.9, 32.0, "5 tang, gan Masteri + truong tieu hoc -> ban do vi tri"],
  [32.2, 39.1, "can dien tich nho 48-52m2 rat hiem -> day nha + dau RAT HIEM"],
];
const ZOOM = []; // selfie da can mat -> khong zoom (zoom day dau len cham chu)
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
    const z = segments.length % 2 ? 1.05 : 1.0; // selfie: nhay khung nhe
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
  sp(0.1, 4.8, "Liền kề Ocean Park 2 chỉ chớm", "6 TỶ", 1.4, { y: 0.13, why: "moc chu: gia (loi chao khong hap dan)" }),
  it("warning", 2.8, 4.8, { head: "Phân khu Cọ Xanh", at: 0, color: "yellow", y: 0.245 }),
  sp(5.85, 11.8, "Căn liền kề diện tích", "52M²", 10.9, { y: 0.13, why: "con so dien tich" }),
  sp(13.3, 17.4, "Giá rất rẻ, chỉ chớm", "6 TỶ", 15.4, { y: 0.13, why: "dinh: gia" }),
  it("flare", 15.3, 15.7, { y: 0.19 }),
  it("list", 21.3, 25.85, { title: "Phân khu Cọ Xanh", titleAt: 0, layout: "stack", y: 0.645, items: [{ text: "Đường rộng 8m", at: rel(21.3, 23.3) }, { text: "Vỉa hè 4m mỗi bên", at: rel(21.3, 25.0) }], why: "canh that: dang quay con duong" }),
  scene("location", 25.9, 32.0, { masteri: 29.9, school: 31.2 }, [[26.0, "drop"], [29.9, "card"], [31.2, "card"]]),
  sp(26.0, 29.8, "Căn 52m² xây", "5 TẦNG", 28.7, {}),
  scene("scarcity", 32.2, 39.1, { small: 36.3, rare: 38.6 }, [[36.3, "card"], [38.6, "stamp"]]),
  it("pills", 39.2, 44.4, { why: "goi dung nhu cau", ys: [0.17, 0.24], pills: [{ text: "Cần căn siêu rẻ như thế này?", at: rel(39.2, 42.8) }] }),
  sp(44.45, DUR, "Liên hệ trực tiếp", "EM SƠN", 45.8, { y: 0.13, why: "CTA" }),
];

const plan = finalize({ source: SRC, fps: 60, segments, items, sfx: [] });
fs.writeFileSync("work/vid8/plan-final.json", JSON.stringify(plan, null, 1));
fs.writeFileSync("work/vid8/edit/keep.json", JSON.stringify(K, null, 1));
console.log(`plan: ${keep.length} doan giu, ${segments.length} doan hinh, ${items.length} item, ${plan.sfx.length} SFX, dai ${END.toFixed(1)}s (goc ${DUR.toFixed(1)}s)`);
