/**
 * PRESET phong cách "Video Edit Style Master" — học từ reference/mau.mp4.
 * [XM] = đo pixel/khung hình; [UD] = ước đoán. Đổi màu/font ở đây, component tự theo.
 */
export const VESM = {
  color: {
    neon: "#13fdfe", // [XM] chữ neon cyan đo pixel 3,2 s / 25,6 s / 31,6 s
    neonCore: "#e8ffff", // [XM] lõi chữ neon gần trắng
    gold: "#fddb5c", // [XM] số tiền vàng 5,4 s / 13,5 s
    goldHi: "#fff4c2",
    goldLo: "#e09a2c",
    script: "#ffffff", // [XM] chữ ký trắng
    strike: "#ff4d4d", // [XM] gạch giá cũ đỏ phát sáng
    glassEdge: "#8ff5ee", // [XM] viền thẻ kính / khung giá
    pageTop: "rgba(4,40,44,0.78)", // [XM] nền kính teal
    pageMid: "rgba(8,70,72,0.62)",
    pageBot: "rgba(2,26,30,0.88)",
  },
  font: {
    block: "Barlow Condensed", // [UD] ≈ UTM Bebas (chữ đứng hẹp, có dấu TV)
    blockWeight: 800,
    script: "Ms Madi", // [UD] ≈ chữ ký mảnh 1 nét
    sans: "Be Vietnam Pro", // [XM] dòng dẫn nhỏ trắng
    thin: "Playfair Display", // [UD] số mảnh to trong suốt "3KM", "70%"
  },
  size: {
    // chiều cao chữ HOA đo trên 1920: neon 111–155 px [XM] -> font-size ≈ cap/0.7
    neon: 170,
    gold: 190,
    lead: 40,
    script: 92,
  },
  time: {
    charStep: 0.4, // [XM] gõ hết 1 dòng neon trong ~0,4 s (chia đều ký tự)
    scriptWrite: 0.6, // [XM] chữ ký viết dần
    count: 0.55, // [XM] số vàng đếm 15→300 trong ~0,5 s
    exit: 0.3, // [XM] thoát mờ + nhoè
    burst: 0.6, // [XM] bùng sáng chuyển cảnh: lên 0,18 s, giữ, tắt ở 0,6 s
    chipStep: 0.3, // [XM] chip ✓ cách nhau ~0,3 s
  },
  safe: { top: 220, bottom: 520, side: 150, maxTextW: 740 },
} as const;

/** SFX theo vai trò (file trong public/sfx). Không gắn SFX cho mọi chuyển động — xem references/sound-design.md */
export const VESM_SFX = {
  burst: "real/qtl-impact",
  whoosh: "real/lux-whip",
  type: "real/qtl-sparkle-whoosh-2",
  count: "real/lux-tick",
  land: "real/lux-ding",
  chip: "real/qtl-pop-whoosh-hot",
  page: "real/qtl-transition",
  soft: "real/qtl-sparkle-sweep",
} as const;

import HITS from "../../../src/styles/quyetTranLux/sfxHits.json";
/** Chuyển [giây, sfx, âm lượng] -> cue khung hình, TRỪ độ trễ đỉnh âm của file (sfxHits.json) để ĐỈNH tiếng trùng đúng lúc hiệu ứng hình. */
export const alignCues = (list: Array<[number, string, number]>, fps: number) =>
  list.map(([t, sfx, volume]) => ({ frame: Math.max(0, Math.round((t - ((HITS as Record<string, number>)[sfx.replace("real/", "")] ?? 0)) * fps)), sfx, volume }));
