#!/usr/bin/env node
// Plan da DUYET cho vid2 (Happy Home Pho Hien vs dat dau gia Hung Yen) — phong cach reference-video-edit-thinking.
// Ban nhap: node scripts/refedit/decide.mjs work/vid2 (26 quyet dinh, 14 con so do -> qua day, may moc).
// Duyet theo tu duy editor goc (~5 khoi chu/phut tren mat, con lai la do hoa co cau truc):
//  - Cau chuyen 2 chu the -> 2 moc chuong (badge 1 dau gia / 2 Happy Home) [AI: nguoi noi khong noi "buoc 1/2"]
//  - Thang gia dau gia 20 -> 40 -> 146 trieu = chuoi so co thu tu -> 3 the vang tren nen (mau 25.7s)
//  - "Cuc ky soc" = dinh cam xuc -> chu do wipe + zoom ramp (mau 36.3s)
//  - Thong so du an / quyen loi = checklist -> the vang 3D (mau 41.1s)
//  - Uu dai (chiet khau, voucher, dien tich) -> 3 the vang; gia sau uu dai = so do + zoom ramp
//  - Cau hoi tu bien "ly do gi" -> the kinh (mau 10.8s); "chi co dat" = canh bao vang (khoi truoc do)
//  - Ket: so sanh 2 lua chon -> 2 the vang + so do canh bao (mau 41-50s)
//  - So khong chac (ASR "45 ty", "25 ty") KHONG dua len man hinh.
// Dung: node projects/vid2/plan.mjs -> work/vid2/plan-final.json + plan-final-chay-chu.json
import fs from "node:fs";

const ms = (s) => Math.round(s * 1000);
const SRC = "inputs/vid2.mp4";
const DUR = 118.5;
const V = 1.0; // SFX nghe ro tren giong (yeu cau co dinh)

const seg = (a, b, kind, o = {}) => ({ srcStartMs: ms(a), srcEndMs: ms(b), kind, ...o });
const segments = [
  seg(0, 4.3, "th", { zoomFrom: 1.0, zoomTo: 1.08, zoomRampMs: 4000, why: "hook: push-in cham (mau 0-1.6s)" }),
  seg(4.3, 6.45, "th", { zoomFrom: 1.12, zoomTo: 1.12 }),
  seg(6.45, 8.4, "th", { zoomFrom: 1.0, zoomTo: 1.2, zoomRampMs: 700, why: "moc chuong 1 -> zoom ramp" }),
  seg(8.4, 12.4, "th", { zoomFrom: 1.0, zoomTo: 1.0 }),
  seg(12.4, 15.3, "th", { zoomFrom: 1.12, zoomTo: 1.2, zoomRampMs: 2800, why: "nghi mat (khong chu)" }),
  seg(15.3, 22.3, "bg", { blurIn: true, why: "thang gia 3 muc -> animation cot tang dan, nguoi noi thu vao goc" }),
  seg(22.3, 23.5, "th", { zoomFrom: 1.0, zoomTo: 1.2, zoomRampMs: 700, why: "cuc ky soc -> zoom ramp" }),
  seg(23.5, 29.95, "th", { zoomFrom: 1.0, zoomTo: 1.0 }),
  seg(29.95, 33.0, "th", { zoomFrom: 1.12, zoomTo: 1.12 }),
  seg(33.0, 37.3, "th", { zoomFrom: 1.0, zoomTo: 1.2, zoomRampMs: 700, why: "moc chuong 2 -> zoom ramp" }),
  seg(37.3, 43.0, "bg", { blurIn: true, why: "thong so du an -> checklist 3D" }),
  seg(43.0, 47.5, "th", { zoomFrom: 1.0, zoomTo: 1.0 }),
  seg(47.5, 52.2, "th", { zoomFrom: 1.12, zoomTo: 1.12 }),
  seg(52.2, 58.2, "th", { zoomFrom: 1.0, zoomTo: 1.2, zoomRampMs: 900, why: "gia cong bo -> zoom ramp" }),
  seg(58.2, 73.4, "bg", { blurIn: true, why: "3 uu dai -> 3 the, roi animation gia giam 7,5 -> 4 ty" }),
  seg(73.4, 78.6, "th", { zoomFrom: 1.0, zoomTo: 1.0 }),
  seg(78.6, 91.9, "bg", { blurIn: true, why: "quyen loi -> checklist 3D + chu do" }),
  seg(91.9, 95.6, "th", { zoomFrom: 1.12, zoomTo: 1.12, frostAtMs: 200, why: "cau hoi -> nen mo cho the kinh" }),
  seg(95.6, 100.0, "th", { zoomFrom: 1.0, zoomTo: 1.2, zoomRampMs: 700 }),
  seg(100.0, 105.3, "th", { zoomFrom: 1.12, zoomTo: 1.12 }),
  seg(105.3, DUR, "bg", { blurIn: true, why: "so sanh 2 lua chon -> 2 the" }),
];

const it = (type, a, b, o) => ({ type, startMs: ms(a), endMs: ms(b), ...o });
const sp = (a, b, setup, punch, punchT, o = {}) => it("setupPunch", a, b, { setup, punch, setupAt: 0, punchAt: +(punchT - a).toFixed(2), setupMode: "blur", punchMode: punch.length > 14 ? "type" : "rise", ...o });
const items = [
  sp(0.15, 4.0, "Liền kề dự án", "HAPPY HOME", 2.8, { why: "hook: ten du an = chu de chinh (mau 1.4-3.6s)" }),
  it("flare", 3.85, 4.3, { y: 0.66, why: "ket hook bang flare (mau 0.95-1.2s)" }),
  sp(4.45, 6.45, "Hôm nay có", "QUÁ NHIỀU BẤT NGỜ", 5.4, { why: "loi hua cua video -> cum do" }),
  it("stepBadge", 6.5, 8.4, { n: 1, label: "Phiên đấu giá", labelAt: 0.1, exit: "cut", why: "[AI] chuong 1 cua cau chuyen: dau gia" }),
  it("leak", 8.0, 8.4, { tone: "red" }),
  sp(8.6, 12.3, "Thị trường đất", "TRẦM LẮNG", 10.7, { why: "boi canh thi truong" }),
  // 12.4-15.3: khong chu (nghi mat) — cau dan dia diem
  it("bars", 15.6, 22.3, { title: "Giá đấu giá (triệu/m²)", why: "[AI] thang gia = so lieu tang dan -> animation cot moc len + so dem", bars: [
    { label: "Khởi điểm", value: 20, unit: "tr", at: 1.2 },
    { label: "Trúng từ", value: 40, unit: "tr", at: 3.9 },
    { label: "Cao nhất", value: 146, unit: "tr", at: 5.4, hot: true },
  ] }),
  it("emphasis", 22.35, 23.5, { text: "Cực kỳ sốc", at: 0, why: "dinh cam xuc -> do wipe + zoom (mau 36.3s)" }),
  sp(25.2, 29.95, "Trả 800 triệu - 1 tỷ", "CHỦ VẪN KHÔNG BÁN", 28.5, { why: "nghich ly -> dong trang + cum do" }),
  sp(30.1, 33.0, "Bên cạnh đó", "DỰ ÁN VINHOMES", 31.4, {}),
  it("stepBadge", 33.1, 37.3, { n: 2, label: "Happy Home Phố Hiến", labelAt: 0.5, exit: "cut", why: "[AI] chuong 2: du an Vinhomes" }),
  it("leak", 36.9, 37.3, { tone: "orange" }),
  it("cards", 37.35, 43.0, { tilt3d: true, why: "thong so du an -> checklist 3D (mau 41.1s)", cards: [
    { at: 0, lines: [{ text: "Hơn 31 hecta", at: 0.25 }, { text: "4.400 nhà ở xã hội", at: 1.5 }, { text: "303 liền kề - shophouse", at: 4.1 }] },
  ] }),
  sp(43.2, 47.5, "Cạnh cao tốc", "HƯNG YÊN - HÀ NỘI", 44.7, {}),
  sp(47.8, 52.2, "Kick-off 3 ngày trước", "GIÁ CHÍNH THỨC", 49.9, {}),
  sp(53.0, 58.2, "Giá công bố", "7,5 TỶ", 55.6, { why: "gia goc -> so do lon (diem nhin)" }),
  it("cards", 60.6, 70.3, { why: "3 uu dai = chuoi -> 3 the vang", cards: [
    { at: 0.1, lines: [{ text: "Chiết khấu 7,5%", at: 1.1 }] },
    { at: 4.9, lines: [{ text: "Voucher 30%", at: 5.6 }] },
    { at: 6.4, lines: [{ text: "Căn 70m²", at: 7.0 }] },
  ] }),
  it("priceDrop", 70.3, 73.4, { from: "7,5", to: 4, unit: "TỶ", label: "Trừ hết voucher, chỉ còn hơn", at: 0, dropAt: 0.9, y: 0.3, why: "[AI] gia giam = diem nhan -> gach gia goc, mui ten, dem lui gia moi" }),
  sp(74.0, 78.6, "Giá đất chỉ", "30 TRIỆU/M²", 76.3, {}),
  it("cards", 80.4, 91.9, { tilt3d: true, why: "quyen loi -> checklist 3D (mau 41.1s)", cards: [
    { at: 0, lines: [{ text: "Tài chính 4 - 5 tỷ", at: 0.3 }, { text: "Liền kề 4 tầng", at: 3.2 }, { text: "30 tiện ích Vinhomes", at: 6.1 }] },
  ] }),
  it("warning", 88.4, 91.9, { head: "1 vạn cư dân", at: 0, color: "red", y: 0.5, why: "dong do duoi the (mau 46.9s)" }),
  it("pills", 92.0, 95.6, { pills: [{ text: "Vì sao mua đất đấu giá?", at: 0.2 }], why: "cau hoi tu bien -> the kinh (mau 10.8s)" }),
  sp(95.8, 100.0, "Cách 1km", "100 TRIỆU/M²", 96.8, {}),
  it("warning", 100.05, 105.3, { head: "Chỉ có đất", sub: "Tiện ích sơ sài", at: 0, subAt: 3.5, color: "yellow", why: "canh bao; khoi truoc la do -> vang (mau 38.5s)" }),
  it("versus", 105.4, DUR, { why: "[AI] so sanh 2 lua chon -> 2 cot tick/x bat ra theo loi noi", left: { title: "Vinhomes Phố Hiến", at: 2.8, rows: [
    { text: "30 tiện ích", at: 5.3, good: true }, { text: "Đón 1 vạn cư dân", at: 6.3, good: true } ] },
    right: { title: "Lô đấu giá", at: 8.9, rows: [ { text: "146 triệu/m²", at: 10.3, good: false }, { text: "Chưa có nhà", at: 12.0, good: false } ] } }),
];

const sfx = [];
const add = (t, s, v = V) => sfx.push({ atMs: ms(t), sfx: s, volume: v });
// SFX dat dung khung hinh chu xuat hien
add(0.15, "swoosh-down", 0.8); add(2.8, "bubble"); add(3.9, "glitch");
add(5.4, "bubble"); add(6.5, "bubble"); add(8.0, "swish", 0.6); add(10.7, "blip8");
add(15.3, "swoosh-down", 0.8); for (const c of [16.8, 19.5]) add(c, "blip8"); add(21.0, "blip8"); add(21.0, "impact", 0.6);
add(22.2, "swoosh-down", 0.8); add(22.35, "bubble"); add(28.5, "blip8"); add(31.4, "blip8");
add(33.15, "bubble"); add(36.95, "swish", 0.6); add(37.3, "swoosh-down", 0.8); for (const c of [37.6, 38.85, 41.45]) add(c, "hud");
add(44.7, "bubble"); add(49.9, "bubble"); add(55.6, "impact", 0.5); add(55.6, "bubble");
add(58.2, "swoosh-down", 0.8); for (const c of [60.7, 65.5, 67.0]) add(c, "bubble"); for (const c of [61.7, 66.2, 67.6]) add(c, "hud");
add(70.35, "bubble"); add(70.75, "swish", 0.8); add(71.5, "impact", 0.6); add(71.5, "blip8"); add(76.3, "bubble");
add(78.6, "swoosh-down", 0.8); add(80.4, "bubble"); for (const c of [80.7, 83.6, 86.5]) add(c, "hud"); add(88.4, "blip8");
add(92.2, "blip8"); add(96.8, "bubble"); add(100.05, "bubble"); add(103.5, "hud");
add(105.3, "swoosh-down", 0.8); add(108.2, "blip8"); add(110.7, "hud"); add(111.7, "hud"); add(114.3, "blip8"); add(115.7, "hud"); add(117.4, "hud");

// [THEO NGUOI DUNG] chu hien kieu GO BAN PHIM + tieng phim moi ky tu (component tu dat tieng dung frame);
// bo SFX pop/bubble/hud cua chu, chi giu tieng chuyen canh (vut vao canh tram, light leak)
// [CAP NHAT] SFX lay tu bo SFX nguoi dung gui (TikTok @vietanh.videoeditor, cat vao public/sfx/pack/), gan tu dong theo loai hieu ung
// theo dung cach nhom cua bo: XUAT HIEN (chu/the) - UI (badge, so, loi) - CHUYEN CANH (flash, vao canh tram).
// Tieng go phim giu nho phia duoi (keyVolume 0.35) de giu cam giac "go chu".
const reveal = { mode: "type", cps: 22, keyVolume: 0.35 };
const typeDur = (txt) => (Array.from(txt).length + (txt.split(" ").length - 1) * 0.6) / reveal.cps;
const pk = [];
const P = (t, n, v = 1) => pk.push({ atMs: Math.round(t * 1000), sfx: `pack/${n}`, volume: v });
for (const it of items) {
  const st = it.startMs / 1000;
  switch (it.type) {
    case "setupPunch": {
      if (it.setup) P(st, "pop-up", 0.9);
      const pa = it.setup ? Math.max(it.punchAt ?? 0, typeDur(it.setup) + 0.12) : it.punchAt ?? 0;
      P(st + pa, "correct-jewel");
      break;
    }
    case "stepBadge": P(st, "ui-notification"); break;
    case "emphasis": P(st, "correct-jewel"); break;
    case "cards": it.cards.forEach((c) => P(st + c.at, "pop-bells", 0.9)); break;
    case "bars": it.bars.forEach((b) => P(st + b.at, b.hot ? "correct-jewel" : "ui-digital")); break;
    case "priceDrop": P(st, "pop-up", 0.9); P(st + it.dropAt - 0.35, "ui-error"); P(st + it.dropAt + 0.3, "es-success"); break;
    case "warning": P(st, it.color === "yellow" ? "ui-error" : "sparkle-bonus"); break;
    case "pills": P(st + (it.pills[0]?.at ?? 0), "ui-notification"); break;
    case "versus":
      P(st + it.left.at, "pop-bells"); P(st + it.right.at, "pop-bells");
      [...it.left.rows, ...it.right.rows].forEach((r) => P(st + r.at, r.good ? "pop-bells" : "ui-error", 0.85));
      break;
    case "flare": case "leak": P(st, "camera-flash", 0.9); break;
  }
}
for (const sg of segments) if (sg.kind === "bg" && sg.blurIn) P(sg.srcStartMs / 1000, "ui-whoosh", 0.9); // nguoi noi thu vao khung goc
const plan = { source: SRC, fps: 60, segments, items, reveal, sfx: pk.sort((a, b) => a.atMs - b.atMs), music: { src: "music/bed-ambient.wav", volume: 0.03 }, voiceVolume: 0.5 };
fs.writeFileSync("work/vid2/plan-final.json", JSON.stringify(plan, null, 1));
// ban chay chu tung chu: tu (da sua ASR) tu ban nhap cua engine (chay --no-cut => thoi gian = goc)
const draft = JSON.parse(fs.readFileSync("work/vid2/plan-chay-chu.json", "utf8"));
fs.writeFileSync("work/vid2/plan-final-chay-chu.json", JSON.stringify({ ...plan, words: draft.words, wordsY: 1590, wordsTypewriter: true }, null, 1));
console.log(`plan-final: ${segments.length} doan, ${items.length} item, ${sfx.length} SFX`);
