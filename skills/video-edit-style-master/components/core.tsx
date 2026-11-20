import React, { createContext, useContext } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { VESM } from "../presets/style";

export const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const outCubic = Easing.bezier(0.33, 1, 0.68, 1);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);
/** thời gian CỤC BỘ trong <Sequence> */
export const useLocal = () => {
  const f = useCurrentFrame();
  const v = useVideoConfig();
  return { t: f / v.fps, dur: v.durationInFrames / v.fps, ...v };
};
/** hệ số thoát chung: 0 -> 1 trong `VESM.time.exit` cuối */
export const exitK = (t: number, dur: number) => interpolate(t, [dur - VESM.time.exit, dur], [0, 1], CL);
/** cỡ chữ tự thu để nằm trong vùng an toàn (rộng tối đa maxW px) */
export const fitSize = (text: string, family: string, weight: number, size: number, maxW: number = VESM.safe.maxTextW, ls = "0em") => {
  const w = measureText({ text, fontFamily: family, fontWeight: String(weight), fontSize: size, letterSpacing: ls, validateFontIsLoaded: false }).width;
  return w > maxW ? (size * maxW) / w : size;
};
export const textW = (text: string, family: string, weight: number, size: number) =>
  measureText({ text, fontFamily: family, fontWeight: String(weight), fontSize: size, validateFontIsLoaded: false }).width;
export const vn = (v: number, dec: number) => v.toFixed(dec).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** BẢNG MÀU CHỮ: "neon" = mẫu kính xanh (cyan phát sáng + vàng) ; "aqua" = mẫu "xanh điện quang" (reference/mau-upload-2):
 *  gradient CHÉO #13489c ↔ #16fff4, không viền, quầng xanh mờ; chữ ký trắng #f3ffff phát sáng. Bọc composition bằng <TextTheme value="aqua">. */
export type TextThemeName = "neon" | "aqua";
const ThemeCtx = createContext<TextThemeName>("neon");
export const TextTheme: React.FC<{ value: TextThemeName; children: React.ReactNode }> = ({ value, children }) => <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
export const useTextTheme = () => useContext(ThemeCtx);
export const AQUA_STOPS: Array<[number, string]> = [[0, "#13489c"], [0.22, "#1576b0"], [0.38, "#15c8d6"], [0.47, "#16fff4"], [0.56, "#15b5cc"], [0.72, "#1582b4"], [1, "#13489c"]];
export const AquaGrad: React.FC<{ id: string }> = ({ id }) => (
  <linearGradient id={id} x1="0" y1="0.1" x2="1" y2="0.9">{AQUA_STOPS.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}</linearGradient>
);
