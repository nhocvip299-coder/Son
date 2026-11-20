import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { VESM } from "../presets/style";
import { CL, useLocal } from "./core";

/** BÙNG SÁNG chuyển cảnh: kem-trắng loé 0,18 s, giữ, tắt ở 0,6 s. Đặt trong <Sequence> dài VESM.time.burst. [XM 8,5 / 14,1 / 33,9 / 45,8 / 63,7 s] */
export const LightBurst: React.FC = () => {
  const { t } = useLocal();
  const a = interpolate(t, [0, 0.18, 0.3, VESM.time.burst], [0, 1, 1, 0], CL);
  const r = interpolate(t, [0, 0.3], [20, 140], { ...CL, easing: Easing.out(Easing.cubic) });
  return <AbsoluteFill style={{ opacity: a, background: `radial-gradient(circle at 50% 45%, #ffffff 0%, #fff8e6 ${r * 0.4}%, rgba(255,240,210,0.92) ${r * 0.7}%, rgba(200,255,250,0.65) ${r}%)` }} />;
};

/** VỠ DẢI: cảnh (children) vỡ thành dải dọc trượt lên lần lượt -> lộ cảnh dưới. [XM 18,1 s vào bản đồ] */
export const StripSlide: React.FC<{ children: React.ReactNode; n?: number; dur?: number }> = ({ children, n = 10, dur = 0.45 }) => {
  const { t, width, height } = useLocal();
  const bw = width / n;
  return (
    <AbsoluteFill>
      {Array.from({ length: n }, (_, i) => {
        const p = interpolate(t, [i * 0.03, i * 0.03 + dur], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
        return (
          <div key={i} style={{ position: "absolute", left: i * bw, top: 0, width: bw + 1, height, overflow: "hidden", transform: `translateY(${-p * height * 1.1}px)` }}>
            <div style={{ position: "absolute", left: -i * bw, top: 0, width, height }}>{children}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** ZOOM NHOÈ thoát cảnh (children phóng + nhoè + mờ trong `dur` cuối). [XM 22,2 s ra bản đồ; 61 s ra thẻ kính] */
export const ZoomBlurOut: React.FC<{ children: React.ReactNode; dur?: number }> = ({ children, dur = 0.35 }) => {
  const { t, dur: D } = useLocal();
  const k = interpolate(t, [D - dur, D], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  return <AbsoluteFill style={{ transform: `scale(${1 + 0.35 * k})`, filter: k > 0.01 ? `blur(${k * 18}px)` : undefined, opacity: 1 - k * 0.6 }}>{children}</AbsoluteFill>;
};

/** GRADE teal–cam toàn video: bóng ngả teal, sáng giữ ấm. [XM palette #1a2b25, accent #cf8f4b] */
export const TealOrange: React.FC<{ children: React.ReactNode; k?: number }> = ({ children, k = 1 }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ filter: `contrast(${1 + 0.06 * k}) saturate(${1 + 0.12 * k})` }}>{children}</AbsoluteFill>
    <AbsoluteFill style={{ background: "rgb(40,120,115)", mixBlendMode: "soft-light", opacity: 0.35 * k }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(10,60,60,0.25) 100%)", mixBlendMode: "multiply", opacity: k }} />
  </AbsoluteFill>
);
