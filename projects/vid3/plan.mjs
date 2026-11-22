#!/usr/bin/env node
// Plan DA DUYET cho vid3 (phien dau gia 48 lo dat Yen My - Hung Yen) — skill reference-video-edit-thinking.
// Ban nhap engine (work/vid3/decisions.md): 21 quyet dinh, 7 so do lien tiep, "Vi sao...?" bi xep nham la nghi, khong nhan "thu nhat/2/3".
// Duyet theo tu duy editor:
//  - Hook: boi canh "cuc ky kho khan" (trang/do) -> nghich ly "Vay ma 48 LO" + "600 ho so" -> flare dong hook
//  - Co cau 48 suat (biet thu / lien ke) = 2 nhom -> 2 the vang tren canh tram
//  - Chuoi gia (khoi diem -> trung BT -> BT goc -> LK -> LK goc) = so lieu tang -> animation 5 cot (cot cao nhat do)
//  - "Moi lan tra gia hang tram trieu" = dinh cam xuc -> do + zoom ramp
//  - "Vi sao ... ?" = cau hoi dan dat -> the kinh (KHONG phai nghi)
//  - 3 ly do (thu nhat/2/3) = 3 chuong -> badge 1-2-3 + zoom + light leak; ha tang co 3 y -> checklist 3D tren canh tram
//  - "Chot lai: tuy khu vuc" -> do; 3 tieu chi (nhu cau / o / kinh doanh) -> checklist + "van duoc san don" do
//  - Cau hoi cuoi -> the kinh; CTA nhan tin
//  - Bo bot: "hon 300 khach", "dat truoc 500 trieu", "48 lo deu hop le" (lap hook), "500 hecta" -> giu mat nguoi noi (mat do ~11 -> 8 khoi/phut tren mat)
//  - Cat outro CapCut (man den tu 100.17s)
// Dung: node projects/vid3/plan.mjs -> work/vid3/plan-final.json (+ -chay-chu.json)
import fs from "node:fs";
import { finalize } from "../../scripts/refedit/finalize-plan.mjs";

const ms = (s) => Math.round(s * 1000);
const SRC = "inputs/vid3.mp4";
const END = 100.1;
const seg = (a, b, kind, o = {}) => ({ srcStartMs: ms(a), srcEndMs: ms(b), kind, ...o });
const th = (a, b, z = 1, o = {}) => seg(a, b, "th", { zoomFrom: z, zoomTo: z, ...o });
const ramp = (a, b, why) => seg(a, b, "th", { zoomFrom: 1.0, zoomTo: 1.2, zoomRampMs: 700, why });
const bg = (a, b, why) => seg(a, b, "bg", { blurIn: true, why });

const segments = [
  seg(0, 3.9, "th", { zoomFrom: 1.0, zoomTo: 1.08, zoomRampMs: 3900, why: "hook: push-in cham" }),
  ramp(3.9, 10.55, "nghich ly 48 lo -> zoom ramp"),
  th(10.55, 16.85, 1.12),
  th(16.85, 19.0, 1.0, { why: "nghi mat" }),
  bg(19.0, 25.85, "co cau 48 suat -> 2 the"),
  th(25.85, 31.6, 1.0),
  bg(31.6, 41.6, "chuoi gia trung -> 5 cot"),
  th(41.6, 44.05, 1.12),
  ramp(44.05, 47.55, "hang tram trieu moi lan tra -> zoom ramp"),
  th(47.55, 52.75, 1.12, { frostAtMs: 100, why: "cau hoi -> nen mo cho the kinh" }),
  ramp(52.75, 56.35, "ly do 1"),
  th(56.35, 60.15, 1.0),
  ramp(60.15, 62.85, "ly do 2"),
  bg(62.85, 67.85, "ha tang 3 y -> checklist 3D"),
  ramp(67.85, 70.65, "ly do 3"),
  th(70.65, 75.55, 1.0),
  ramp(75.55, 80.75, "gia Yen My thap hon -> zoom"),
  th(80.75, 83.6, 1.12),
  bg(83.6, 89.6, "3 tieu chi -> checklist 3D + chu do"),
  th(89.6, 93.3, 1.12, { frostAtMs: 100, why: "cau hoi cuoi -> the kinh" }),
  th(93.3, END, 1.0),
];

const it = (type, a, b, o) => ({ type, startMs: ms(a), endMs: ms(b), ...o });
const sp = (a, b, setup, punch, punchT, o = {}) => it("setupPunch", a, b, { setup, punch, setupAt: 0, punchAt: +(punchT - a).toFixed(2), ...o });
const items = [
  sp(0.1, 3.9, "Thị trường BĐS Hưng Yên", "CỰC KỲ KHÓ KHĂN", 3.3, { why: "boi canh (trang) + muc do (do)" }),
  sp(3.95, 7.0, "Vậy mà", "48 LÔ ĐẤT", 4.3, { why: "hook: con so nghich ly" }),
  sp(7.0, 10.4, "Hơn 600 bộ hồ sơ", "LÔ NÀO CŨNG HỢP LỆ", 9.0, {}),
  it("flare", 10.15, 10.55, { y: 0.66, why: "dong hook" }),
  sp(10.6, 16.8, "Đấu giá Yên Mỹ, sát làng gạo Trai Trang", "ĐÔNG NGHỊT NGƯỜI", 13.4, { why: "dia danh (nguoi dung xac nhan) + khong khi" }),
  it("cards", 19.6, 25.85, { why: "2 nhom lo -> 2 the", cards: [
    { at: 0.4, lines: [{ text: "10 lô biệt thự", at: 0.6 }, { text: "150 - 200m²", at: 1.9 }] },
    { at: 3.7, lines: [{ text: "38 lô liền kề", at: 3.9 }, { text: "Khoảng 90m²", at: 5.0 }] },
  ] }),
  sp(25.9, 31.5, "Giá khởi điểm", "20 - 25 TRIỆU/M²", 27.3, {}),
  it("bars", 31.65, 41.6, { title: "Giá trúng (triệu/m²)", why: "[AI] chuoi gia tang -> cot moc len theo loi noi", bars: [
    { label: "Khởi điểm", value: 25, unit: "tr", at: 0.2 },
    { label: "Biệt thự", value: 27.4, unit: "tr", at: 1.85 },
    { label: "BT góc", value: 38, unit: "tr", at: 4.15 },
    { label: "Liền kề", value: 35, unit: "tr", at: 6.75 },
    { label: "LK góc", value: 62.5, unit: "tr", at: 8.75, hot: true },
  ] }),
  sp(44.1, 47.5, "Mỗi lần trả giá", "HÀNG TRĂM TRIỆU", 45.2, { why: "dinh cam xuc -> do + zoom" }),
  it("pills", 47.6, 52.75, { pills: [{ text: "Vì sao hút nhà đầu tư?", at: 0.05 }], why: "cau hoi dan dat -> the kinh" }),
  it("stepBadge", 52.8, 56.35, { n: 1, label: "Nội lực kinh tế", labelAt: 0.6, exit: "cut", why: "ly do 1" }),
  it("leak", 55.95, 56.35, { tone: "red" }),
  sp(56.45, 60.1, "Làng nghề gạo Trai Trang - Yên Mỹ", "BÁN RA NƯỚC NGOÀI", 59.1, {}),
  it("stepBadge", 60.2, 62.85, { n: 2, label: "Hạ tầng", labelAt: 0.9, exit: "cut", why: "ly do 2" }),
  it("cards", 62.9, 67.85, { tilt3d: true, why: "ha tang 3 y -> checklist 3D", cards: [
    { at: 0, lines: [{ text: "Gần đường 379", at: 0.1 }, { text: "Trục Bắc Nam 74m", at: 1.6 }, { text: "Qua Mỹ Hào - Yên Mỹ - Ân Thi", at: 3.1 }] },
  ] }),
  it("stepBadge", 67.9, 70.65, { n: 3, label: "Định hướng", labelAt: 1.4, exit: "cut", why: "ly do 3" }),
  it("leak", 70.25, 70.65, { tone: "orange" }),
  sp(70.75, 75.5, "Hưng Yên sẽ là", "TP TRỰC THUỘC TW", 71.0, {}),
  sp(75.6, 80.7, "So với Văn Lâm, Mỹ Hào", "GIÁ YÊN MỸ THẤP HƠN", 78.2, { why: "so sanh -> do + zoom" }),
  sp(80.8, 83.55, "Thị trường khó hay không", "TÙY KHU VỰC", 83.0, { why: "chot y chinh" }),
  it("cards", 83.65, 89.6, { tilt3d: true, why: "3 tieu chi -> checklist 3D", cards: [
    { at: 0, lines: [{ text: "Đúng nhu cầu?", at: 0.15 }, { text: "Ở được?", at: 2.35 }, { text: "Kinh doanh được?", at: 3.55 }] },
  ] }),
  it("warning", 88.0, 89.6, { head: "Vẫn được săn đón", at: 0, color: "red", y: 0.5, why: "ket luan duoi the (mau 46.9s)" }),
  it("pills", 89.7, 93.3, { pills: [{ text: "Mức giá này hợp lý chưa?", at: 0.05 }], why: "cau hoi cho nguoi xem" }),
  sp(93.4, END, "Cần hồ sơ, giá trúng?", "NHẮN CHO MÌNH", 96.3, { why: "CTA" }),
];

const plan = finalize({ source: SRC, fps: 60, segments, items, sfx: [] });
fs.writeFileSync("work/vid3/plan-final.json", JSON.stringify(plan, null, 1));
const draft = JSON.parse(fs.readFileSync("work/vid3/plan-chay-chu.json", "utf8"));
const words = draft.words.filter((w) => w.startMs < ms(END));
fs.writeFileSync("work/vid3/plan-final-chay-chu.json", JSON.stringify({ ...plan, words, wordsY: 1590, wordsTypewriter: true }, null, 1));
console.log(`plan-final: ${segments.length} doan, ${items.length} item, ${plan.sfx.length} SFX, dai ${END}s`);
