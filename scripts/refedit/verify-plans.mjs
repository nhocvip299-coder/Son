#!/usr/bin/env node
// Tao plan RefEdit tai dung 4 phan canh cua video mau (moc thoi gian tu styles/reference-01/timeline.json)
// Footage mat: "clean plate" (doan khong co chu) cua chinh video mau; tieng: tieng goc dung doan -> so sanh duoc thoi diem.
// Dung: node scripts/refedit/verify-plans.mjs -> projects/ref01-verify/<scene>.json
import fs from "node:fs";
const SRC = "inputs/ref01.mp4";
const ms = (s) => Math.round(s * 1000);
const base = (origStart, segments, items, sfx) => ({
  source: SRC,
  fps: 60,
  segments,
  items,
  sfx,
  audioOverride: { src: SRC, startMs: ms(origStart) },
  origStart,
});
// moc tuyet doi trong video goc -> ms tren timeline phan canh
const at = (o0) => (t) => ms(t - o0);

const scenes = {};
{
  const o = 7.9, r = at(o);
  scenes.s1_buoc1 = base(o,
    [{ srcStartMs: ms(50.75), srcEndMs: ms(52.6), kind: "th", why: "clean plate (goc 8.0 cung la zoom ramp 0.24->0.29)" }],
    [
      { type: "stepBadge", n: 1, label: "Chọn nội dung", labelAt: 0.0, startMs: r(8.15), endMs: r(9.75), exit: "cut" },
      { type: "leak", tone: "red", startMs: r(9.35), endMs: r(9.75) },
    ],
    [ { atMs: r(8.2), sfx: "bubble", volume: 0.55 }, { atMs: r(9.4), sfx: "swish", volume: 0.45 } ]);
}
{
  const o = 14.4, r = at(o);
  scenes.s2_list = base(o,
    [{ srcStartMs: ms(14.4), srcEndMs: ms(20.6), kind: "bg" }],
    [
      { type: "list", title: "Khách mua ở", titleAt: 0, layout: "zigzag", startMs: r(14.45), endMs: r(17.7),
        items: [ { text: "Tiện ích", at: 16.0 - 14.45 }, { text: "Cuộc sống", at: 16.4 - 14.45 }, { text: "Đi chợ", at: 16.9 - 14.45 }, { text: "Đi học", at: 17.4 - 14.45 } ] },
      { type: "list", title: "Khách đầu tư", titleAt: 0, layout: "stack", startMs: r(17.7), endMs: r(20.6),
        items: [ { text: "Giá", at: 18.95 - 17.7 }, { text: "Hạ tầng", at: 19.2 - 17.7 }, { text: "Tiềm năng tăng giá", at: 19.65 - 17.7 } ] },
    ],
    [14.45, 16.0, 16.4, 16.9, 17.4, 17.7, 18.95, 19.2, 19.65].map((t, i) => ({ atMs: r(t), sfx: i === 0 || i === 5 ? "swish" : "bubble", volume: 0.5 })));
}
{
  const o = 25.7, r = at(o);
  scenes.s3_cards = base(o,
    [{ srcStartMs: ms(25.7), srcEndMs: ms(32.9), kind: "bg", blurIn: false }],
    [
      { type: "cards", startMs: r(27.1), endMs: r(32.9), cards: [
        { at: 0, lines: [{ text: "Mở - gây tò mò", at: 0.57 }] },
        { at: 29.1 - 27.1, lines: [{ text: "Nội dung - giải thích", at: 29.87 - 27.1 }] },
        { at: 31.1 - 27.1, lines: [{ text: "Kết - chốt vấn đề", at: 31.65 - 27.1 }] } ] },
    ],
    [27.1, 29.1, 31.1].map((t) => ({ atMs: r(t), sfx: "bubble", volume: 0.55 })).concat([27.67, 29.75, 31.55].map((t) => ({ atMs: r(t), sfx: "click", volume: 0.5 }))));
}
{
  const o = 36.25, r = at(o);
  scenes.s4_emphasis = base(o,
    [
      { srcStartMs: ms(3.0), srcEndMs: ms(4.05), kind: "th", zoomFrom: 1, zoomTo: 1.2, zoomRampMs: 800, why: "goc: zoom ramp 0.243->0.294 khi noi 'Quan trong nhat'" },
      { srcStartMs: ms(50.75), srcEndMs: ms(53.2), kind: "th", zoomFrom: 1.1, zoomTo: 1.1 },
    ],
    [
      { type: "emphasis", text: "Quan trọng nhất", at: 0, startMs: r(36.45), endMs: r(37.3) },
      { type: "bigNumeral", num: "1", line1: "Vấn đề", line2: "duy nhất", at: 0, dimAt: 38.7 - 37.5, startMs: r(37.5), endMs: r(39.75), exit: "cut" },
      { type: "warning", head: "Đừng nói", sub: "Quá nhiều thông tin", at: 0, subAt: 0.12, startMs: r(38.75), endMs: r(39.75), exit: "cut" },
    ],
    [36.45, 37.5, 38.75].map((t) => ({ atMs: r(t), sfx: "bubble", volume: 0.55 })).concat([{ atMs: r(36.4), sfx: "whoosh", volume: 0.35 }]));
}
for (const [k, p] of Object.entries(scenes)) fs.writeFileSync(`projects/ref01-verify/${k}.json`, JSON.stringify(p, null, 1));
console.log(Object.keys(scenes).join(" "));
