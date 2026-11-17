import type { StylePack } from "./types";
import hongDang from "../../styles/hong-dang/style.json";
import gelexia from "../../styles/gelexia-food-review/style.json";
import bds from "../../styles/bat-dong-san-chuyen-gia/style.json";
import cyber from "../../styles/cyberpunk-hologram/style.json";
import review from "../../styles/review-san-pham/style.json";
import quyetTranLux from "../../styles/quyet-tran-lux/style.json";

/** Them style moi: tao styles/<id>/style.json roi import + dang ky tai day. */
export const STYLES: Record<string, StylePack> = Object.fromEntries(
  [hongDang, gelexia, bds, cyber, review, quyetTranLux].map((s) => [s.id, s as StylePack]),
);

export const getStyle = (id: string): StylePack => {
  const s = STYLES[id];
  if (!s) throw new Error(`Khong tim thay style "${id}". Co: ${Object.keys(STYLES).join(", ")}`);
  return s;
};
