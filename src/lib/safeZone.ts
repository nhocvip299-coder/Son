/**
 * Vung an toan TikTok/Reels/Shorts cho khung 1080x1920.
 * - Tren: thanh tab "Following | For You" + trang thai (~200px)
 * - Duoi: ten kenh, mo ta, nhac, thanh tien trinh (~520px)
 * - Phai: cot nut tim/binh luan/chia se (~150px)
 * Chu luon dat doi xung trong [side, W - side] de can giua dep va khong bi nut che.
 */
export const SAFE = {
  top: 220,
  bottom: 520,
  side: 150,
} as const;

/** Hai "lan" (band) khong giao nhau: tieu de nhan manh o tren, phu de o duoi. */
export const BANDS = (height: number) => ({
  headline: { top: SAFE.top + 60, bottom: Math.round(height * 0.5) - 40 },
  caption: { top: Math.round(height * 0.5) + 80, bottom: height - SAFE.bottom },
});

export const contentWidth = (width: number) => width - SAFE.side * 2;
