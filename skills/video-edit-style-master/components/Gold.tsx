import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { VESM } from "../presets/style";
import { CL, exitK, fitSize, outCubic, useLocal, vn } from "./core";

/** Chữ VÀNG phát sáng (gradient + quầng) — dùng chung cho số tiền. */
export const GoldText: React.FC<{ x: number; y: number; text: string; size: number; id: string; opacity?: number; tone?: "gold" | "white" }> = ({ x, y, text, size, id, opacity = 1, tone = "gold" }) => {
  const W = tone === "white";
  const st: React.CSSProperties = { fontFamily: VESM.font.block, fontWeight: VESM.font.blockWeight, fontSize: size };
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={`gg-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={W ? "#ffffff" : VESM.color.goldHi} /><stop offset="0.45" stopColor={W ? "#f2ffff" : VESM.color.gold} /><stop offset="1" stopColor={W ? "#cfeff0" : VESM.color.goldLo} /></linearGradient>
        <filter id={`gb-${id}`} x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur stdDeviation={size * 0.09} /></filter>
      </defs>
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={W ? "#bff8f6" : "#ffb02e"} opacity={W ? 0.55 : 0.8} filter={`url(#gb-${id})`} style={st}>{text}</text>
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={`url(#gg-${id})`} style={{ ...st, filter: "drop-shadow(0 3px 3px rgba(60,30,0,0.55))" }}>{text}</text>
    </g>
  );
};

/** Số tiền vàng ĐẾM CHẠY 0 -> value trong ~0,55 s rồi đứng, dòng dẫn trắng nhỏ phía trên. [XM 4–7 s "Rẻ hơn trước tới / 300 TRIỆU"] */
export const GoldNumber: React.FC<{ id: string; lead?: string; leadScript?: boolean; value: number; unit: string; dec?: number; cy: number; size?: number; at?: number; from?: number; tone?: "gold" | "white"; countDur?: number }> = ({
  id, lead, leadScript = false, value, unit, dec = 0, cy, size = VESM.size.gold, at = 0.15, from = 0, tone = "gold", countDur = VESM.time.count,
}) => {
  const { t, dur, width, height } = useLocal();
  const p = interpolate(t, [at, at + countDur], [0, 1], { ...CL, easing: outCubic });
  const txt = `${vn(from + (value - from) * p, dec)} ${unit}`;
  const fs = fitSize(`${vn(value, dec)} ${unit}`, VESM.font.block, VESM.font.blockWeight, size);
  const ex = exitK(t, dur);
  return (
    <AbsoluteFill style={{ opacity: 1 - ex, filter: ex > 0.01 ? `blur(${ex * 10}px)` : undefined }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {lead ? (leadScript
          ? <text x={width / 2 - fs * 0.5} y={cy - fs * 0.62} textAnchor="middle" dominantBaseline="central" fill="#fff" transform={`rotate(-5 ${width / 2} ${cy})`} style={{ clipPath: `inset(0 ${(1 - interpolate(t, [0, VESM.time.scriptWrite], [0, 1], CL)) * 100}% 0 0)`, fontFamily: VESM.font.script, fontSize: VESM.size.script, filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8)) drop-shadow(0 2px 3px rgba(0,0,0,0.7))" }}>{lead}</text>
          : <text x={width / 2} y={cy - fs * 0.68} textAnchor="middle" dominantBaseline="central" fill="#fff" opacity={interpolate(t, [0, 0.25], [0, 1], CL)} style={{ fontFamily: VESM.font.sans, fontWeight: 500, fontSize: VESM.size.lead, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.75))" }}>{lead}</text>) : null}
        <GoldText id={id} x={width / 2} y={cy} text={txt} size={fs} opacity={Math.min(1, p * 4)} tone={tone} />
      </svg>
    </AbsoluteFill>
  );
};
