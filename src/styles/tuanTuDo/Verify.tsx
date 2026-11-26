import type { TtdPlan } from "./TuanTuDoEdit";
import type { TtdWord } from "./components";

/** Plan kiem chung ~11s cho skill mau-tuan-tu-do (nen demo tu tao, khong dung footage kenh mau). */
const line = (text: string, startMs: number, perMs = 300, other = false): TtdWord[] =>
  text.split(" ").map((t, i) => ({ text: t, startMs: startMs + i * perMs, endMs: startMs + (i + 1) * perMs - 40, other }));

const words: TtdWord[] = [
  ...line("Hôm nay anh em", 1800),
  ...line("đi ăn cơm bụi", 3000),
  ...line("cô bán hàng", 4400, 280),
  ...line("hai mươi lăm nghìn", 5300, 260, true),
  ...line("có 140 củ mà nhẹ lắm", 6500, 260),
  ...line("quá sởi lởi luôn", 8200, 300),
];

export const TTD_VERIFY_PLAN: TtdPlan = {
  source: "demo/bg.mp4",
  fps: 60,
  segments: [
    { srcStartMs: 6000, srcEndMs: 7600, zoom: 1.12 }, // teaser
    { srcStartMs: 0, srcEndMs: 5200, zoom: 1 },
    { srcStartMs: 5200, srcEndMs: 9600, zoom: 1.08 },
  ],
  words,
  keywordRe: "^(140|CỦ|NGHÌN)$",
  items: [
    { type: "hook", startMs: 150, durationMs: 1450, text: "ĂN THẾ NÀY LÀ NHƯ NÀO" },
    { type: "ink", atMs: 1600 },
    { type: "name", startMs: 1750, durationMs: 1200, line1: "Cô Lan", line2: "Chủ quán 30 năm" },
    { type: "question", startMs: 4300, durationMs: 1200, x: 0.5, y: 0.42 },
    { type: "laugh", startMs: 7500, durationMs: 900, y: 0.3 },
    { type: "glow", startMs: 8150, durationMs: 1400 },
    { type: "end", startMs: 9600, durationMs: 1200 },
  ],
};
