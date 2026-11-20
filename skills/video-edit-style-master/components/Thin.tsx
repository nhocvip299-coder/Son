import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { VESM } from "../presets/style";
import { CL, exitK, fitSize, outCubic, useLocal } from "./core";

/** SỐ MẢNH TO bán trong suốt (serif trắng-cyan, đếm/giãn chữ) cho khoảng cách & phần trăm. [XM 17 s "3KM", 42–44 s "52%→70%"]
 *  Đặt SAU LƯNG người nói: truyền `front={<PersonFront … />}` và chọn `cy` sao cho chân chữ chạm/khuất sau đầu (faces.json). */
export const ThinBig: React.FC<{ value: string; count?: { to: number; from?: number; suffix: string }; lead?: string; cy: number; size?: number; front?: React.ReactNode }> = ({ value, count, lead, cy, size = 260, front }) => {
  const { t, dur, width, height } = useLocal();
  const p = interpolate(t, [0.1, 0.8], [0, 1], { ...CL, easing: outCubic });
  const txt = count ? `${Math.round((count.from ?? 0) + (count.to - (count.from ?? 0)) * p)}${count.suffix}` : value;
  const fs = fitSize(value, VESM.font.thin, 700, size);
  const ex = exitK(t, dur);
  return (
    <AbsoluteFill style={{ opacity: 1 - ex, filter: ex > 0.01 ? `blur(${ex * 10}px)` : undefined }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <text x={width / 2} y={cy} textAnchor="middle" dominantBaseline="central" fill="rgba(240,255,255,0.9)" stroke="#ffffff" strokeWidth={2}
          style={{ fontFamily: VESM.font.thin, fontWeight: 700, fontSize: fs, letterSpacing: `${0.25 - 0.17 * p}em`, filter: `drop-shadow(0 0 14px ${VESM.color.neon}88) drop-shadow(0 3px 4px rgba(0,0,0,0.4))` }}>{txt}</text>
      </svg>
      {front}
      {lead ? <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <text x={width / 2 - fs * 0.35} y={cy - fs * 0.55} textAnchor="middle" dominantBaseline="central" fill="#fff" transform={`rotate(-5 ${width / 2} ${cy})`} style={{ clipPath: `inset(0 ${(1 - interpolate(t, [0, VESM.time.scriptWrite], [0, 1], CL)) * 100}% 0 0)`, fontFamily: VESM.font.script, fontSize: VESM.size.script, filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8)) drop-shadow(0 2px 3px rgba(0,0,0,0.7))" }}>{lead}</text>
      </svg> : null}
    </AbsoluteFill>
  );
};
