/**
 * Thu vien KEYFRAME vao/ra cho chu (v5). Moi kieu = duong cong vi tri + ti le + xoay + do mo + nhoe theo thoi gian.
 * Nguyen tac (gop y nguoi dung + do tung khung tren 6 video kenh mau):
 *  - mem: giam toc duoi dai (easeOutCubic/Quint) + nhoe giam dan theo van toc, KHONG nac / giat;
 *  - da dang: tu duoi len, tu 2 ben vao, phong to/thu nho, roi xuong, xoay — chon theo BO CUC canh;
 *  - co ca keyframe RA (khong chi tat).
 * Thong so thoi gian se duoc HIEU CHINH theo bang do `analysis/keyframes/*.json`.
 */
import { Easing, interpolate } from "remotion";

export type KfIn = "riseUp" | "fromLeft" | "fromRight" | "dropDown" | "scaleIn" | "zoomOut" | "swingIn" | "fadeIn" | "blurIn" | "zoomSettle";
export type KfOut = "blurUp" | "toLeft" | "toRight" | "scaleOut" | "fadeDown" | "dropOut" | "cut";
export type KfState = { tx: number; ty: number; rot: number; sx: number; sy: number; opacity: number; blur: number; hidden: boolean };

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const outCubic = Easing.bezier(0.33, 1, 0.68, 1);
const outQuint = Easing.bezier(0.22, 1, 0.36, 1);
const outBack = Easing.bezier(0.34, 1.35, 0.64, 1); // vuot nhe 3-4% roi ve
const inCubic = Easing.bezier(0.55, 0, 0.75, 0.2); // tang toc mem khi ra

export const IN_DUR: Record<KfIn, number> = { riseUp: 0.45, fromLeft: 0.42, fromRight: 0.42, dropDown: 0.45, scaleIn: 0.4, zoomOut: 0.5, swingIn: 0.5, fadeIn: 0.3, blurIn: 0.32, zoomSettle: 0.4 };
// v8: keyframe RA ro rang hon (nguoi dung: "chua co hieu ung keyframe chu khi ra")
export const OUT_DUR: Record<KfOut, number> = { blurUp: 0.42, toLeft: 0.4, toRight: 0.4, scaleOut: 0.4, fadeDown: 0.4, dropOut: 0.4, cut: 0.04 };

/** Trang thai tai thoi diem t (giay, tuong doi). at = luc bat dau vao; end = luc bat dau ra. */
export const kf = (kin: KfIn, kout: KfOut, t: number, at: number, end: number, _fps: number, W = 1080): KfState => {
  const s: KfState = { tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, opacity: 1, blur: 0, hidden: false };
  if (t < at || t > end + OUT_DUR[kout]) return { ...s, hidden: true };
  // ---- VAO
  const dIn = IN_DUR[kin];
  const p = interpolate(t, [at, at + dIn], [0, 1], { ...C, easing: kin === "scaleIn" || kin === "dropDown" ? outBack : kin === "fromLeft" || kin === "fromRight" ? outQuint : outCubic });
  const lin = interpolate(t, [at, at + dIn], [0, 1], C);
  const q = 1 - p;
  const vel = Math.max(0, 1 - lin) ** 2; // nhoe ~ van toc (giam nhanh ve 0)
  s.opacity = interpolate(lin, [0, 0.35], [0, 1], C);
  switch (kin) {
    case "riseUp":
      s.ty = q * 70; s.blur = vel * 10; break;
    case "dropDown":
      s.ty = -q * 70; s.blur = vel * 10; break;
    case "fromLeft":
      s.tx = -q * W * 0.35; s.blur = vel * 14; break;
    case "fromRight":
      s.tx = q * W * 0.35; s.blur = vel * 14; break;
    case "scaleIn":
      s.sx = s.sy = 0.6 + 0.4 * p; s.blur = vel * 8; break;
    case "zoomOut":
      s.sx = s.sy = 1 + q * 0.6; s.blur = vel * 12; break;
    case "swingIn":
      s.rot = -q * 12; s.tx = -q * 60; s.ty = q * 30; s.blur = vel * 8; break;
    case "fadeIn":
      s.ty = q * 14; s.blur = vel * 6; break;
    case "blurIn": // [XM ref05 "Đường kênh" 67.15s] lay net: nhoe -> ro, thu nhe 8%
      s.sx = s.sy = 1 + q * 0.08; s.blur = q * 16; break;
    case "zoomSettle": // [ref08 "THƯỚC ĐO" 21.0s, ref07 "Đầu tiên" 19.4s] to + nhoe + lech duoi -> dat xuong dung cho
      s.sx = s.sy = 1 + q * 0.3; s.ty = q * 26; s.blur = q * 14; break;
  }
  // ---- RA
  if (t > end) {
    const r = interpolate(t, [end, end + OUT_DUR[kout]], [0, 1], { ...C, easing: inCubic });
    s.opacity *= 1 - r;
    switch (kout) {
      case "blurUp": s.ty -= r * 90; s.blur += r * 18; break;
      case "toLeft": s.tx -= r * W * 0.45; s.blur += r * 18; break;
      case "toRight": s.tx += r * W * 0.45; s.blur += r * 18; break;
      case "scaleOut": s.sx *= 1 + r * 0.45; s.sy *= 1 + r * 0.45; s.blur += r * 16; break;
      case "fadeDown": s.ty += r * 60; s.blur += r * 10; break;
      case "dropOut": s.ty += r * 160; s.sx *= 1 - r * 0.25; s.sy *= 1 - r * 0.25; s.blur += r * 8; break;
      case "cut": break;
    }
  }
  return s;
};
