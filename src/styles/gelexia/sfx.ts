// Bộ SFX CC0 cho mẫu Gelexia (public/sfx/cc0, nguồn: Kenney + audio-mcp-assets, xem LICENSE-CC0.md).
// Quy tắc skill: chỉ nhấn điểm chính (header + callout), KHÔNG phủ âm từng từ phụ đề.
import type { GelexiaProject } from "./GelexiaOverlay";

export const GELEXIA_SFX = {
  header: "sfx/cc0/whoosh-ui.wav", // ghim địa chỉ trượt vào
  intro: "sfx/cc0/rise-maximize.wav", // thẻ mở đầu bật lên
  route: "sfx/cc0/whoosh-swipe.wav", // nhãn đường
  food: "sfx/cc0/sparkle-glass.wav", // nhấn món
  cta: "sfx/cc0/select-chime.wav", // thẻ kết lưu địa chỉ
} as const;

/** Âm lượng đặt cao (≥0.55) để nghe rõ trên giọng — kiểm lại bằng đo năng lượng >3 kHz sau render. */
export const gelexiaAutoSfx = (p: GelexiaProject, volume = 0.8): NonNullable<GelexiaProject["sfx"]> => [
  ...(p.brand.showAddress !== false ? [{ atMs: 0, file: GELEXIA_SFX.header, volume }] : []),
  ...p.callouts.map((c) => ({ atMs: c.startMs, file: GELEXIA_SFX[c.kind], volume })),
];
