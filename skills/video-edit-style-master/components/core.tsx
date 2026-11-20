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
