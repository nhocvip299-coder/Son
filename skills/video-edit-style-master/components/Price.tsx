import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { VESM } from "../presets/style";
import { backOut, CL, exitK, fitSize, outCubic, textW, useLocal, useTextTheme, vn } from "./core";
import { GoldText } from "./Gold";

/**
 * TRANG HẠ GIÁ: dòng dẫn trắng / chữ ký vàng viết dần / giá cũ trắng + gạch đỏ phát sáng / "giảm còn" /
 * giá mới VÀNG đếm lùi trong khung 4 góc neon + vòng tròn loé. [XM 9,0–14,1 s]
 */
export const PriceDrop: React.FC<{
  lead: string; script: string; oldPrice: string; strikeAt: number; mid: string;
  from: number; to: number; dec?: number; unit: string; newAt: number; cy?: number;
}> = ({ lead, script, oldPrice, strikeAt, mid, from, to, dec = 2, unit, newAt, cy = 735 }) => {
  const { t, dur, width, height } = useLocal();
  const cx = width / 2;
  const aqua = useTextTheme() === "aqua";
  const acc = aqua ? "#16fff4" : VESM.color.gold, scr = aqua ? "#f3ffff" : VESM.color.gold;
  const ex = exitK(t, dur);
  const a1 = interpolate(t, [0.05, 0.35], [0, 1], { ...CL, easing: outCubic });
  const w2 = interpolate(t, [0.35, 0.35 + VESM.time.scriptWrite], [0, 1], { ...CL, easing: outCubic });
  const a3 = interpolate(t, [0.7, 1.0], [0, 1], { ...CL, easing: backOut });
  const st = interpolate(t, [strikeAt, strikeAt + 0.3], [0, 1], CL);
  const a4 = interpolate(t, [strikeAt + 0.2, strikeAt + 0.5], [0, 1], CL);
  const p = interpolate(t, [newAt, newAt + 0.9], [0, 1], { ...CL, easing: outCubic });
  const pop = interpolate(t, [newAt, newAt + 0.3], [0, 1], { ...CL, easing: backOut });
  const ring = interpolate(t, [newAt + 0.6, newAt + 1.3], [0, 1], CL);
  const big = `${vn(from + (to - from) * p, dec)} ${unit}`;
  const bs = fitSize(`${vn(to, dec)} ${unit}`, VESM.font.block, VESM.font.blockWeight, 260, VESM.safe.maxTextW);
  const bw = textW(`${vn(to, dec)} ${unit}`, VESM.font.block, VESM.font.blockWeight, bs), bh = bs * 1.05;
  const os = 165;
  const ow = textW(oldPrice, VESM.font.block, VESM.font.blockWeight, os);
  const Y = { lead: cy - 320, script: cy - 230, old: cy - 15, mid: cy + 95, big: cy + 320 }; // [XM 9,5–13 s: 415 / 500 / 705 / 810 / 1065 px khi cy=735]
  const corner = (sx: number, sy: number, x: number, y: number, k: number) => (
    <path key={`${sx}${sy}`} d={`M ${x + sx * 46} ${y} L ${x} ${y} L ${x} ${y + sy * 46}`} fill="none" stroke={VESM.color.glassEdge} strokeWidth={6} strokeLinecap="round" opacity={k} style={{ filter: `drop-shadow(0 0 8px ${VESM.color.neon})` }} />
  );
  const X0 = cx - bw / 2 - 40, X1 = cx + bw / 2 + 40, Y0 = Y.big - bh / 2 - 14, Y1 = Y.big + bh / 2 + 14;
  return (
    <AbsoluteFill style={{ opacity: 1 - ex }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs><clipPath id="pd-w"><rect x={0} y={Y.script - 80} width={width * w2} height={160} /></clipPath></defs>
        <text x={cx} y={Y.lead} textAnchor="middle" dominantBaseline="central" fill="#fff" opacity={a1} style={{ fontFamily: VESM.font.sans, fontWeight: 500, fontSize: 46 }}>{lead}</text>
        <g clipPath="url(#pd-w)"><text x={cx} y={Y.script} textAnchor="middle" dominantBaseline="central" fill={scr} transform={`rotate(-4 ${cx} ${Y.script})`} style={{ fontFamily: VESM.font.script, fontSize: 118, filter: `drop-shadow(0 0 8px ${scr}cc) drop-shadow(0 2px 3px rgba(0,0,0,0.7))` }}>{script}</text></g>
        <g opacity={a3 * (1 - 0.35 * st)} transform={`translate(${cx} ${Y.old}) scale(${0.75 + 0.25 * a3}) translate(${-cx} ${-Y.old})`}>
          <text x={cx} y={Y.old} textAnchor="middle" dominantBaseline="central" fill="#dff7f4" style={{ fontFamily: VESM.font.block, fontWeight: VESM.font.blockWeight, fontSize: os, filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.6))" }}>{oldPrice}</text>
          <line x1={cx - ow / 2 - 10} y1={Y.old + 6} x2={cx - ow / 2 - 10 + (ow + 20) * st} y2={Y.old + 6} stroke={VESM.color.strike} strokeWidth={9} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${VESM.color.strike})` }} />
        </g>
        <text x={cx} y={Y.mid} textAnchor="middle" dominantBaseline="central" fill="#fff" opacity={a4} style={{ fontFamily: VESM.font.sans, fontWeight: 500, fontSize: 46 }}>{mid}</text>
        <g opacity={Math.min(1, pop * 1.5)} transform={`translate(${cx} ${Y.big}) scale(${0.65 + 0.35 * pop}) translate(${-cx} ${-Y.big})`}>
          <rect x={X0 + 30} y={Y0 + 10} width={X1 - X0 - 60} height={Y1 - Y0 - 20} rx={14} fill="none" stroke={acc} strokeWidth={3} opacity={0.7} style={{ filter: `drop-shadow(0 0 10px ${acc})` }} />
          {corner(1, 1, X0, Y0, 1)}{corner(-1, 1, X1, Y0, 1)}{corner(1, -1, X0, Y1, 1)}{corner(-1, -1, X1, Y1, 1)}
          <GoldText id="pd" x={cx} y={Y.big} text={big} size={bs} />
        </g>
        {ring > 0 && ring < 1 ? <circle cx={cx} cy={Y.big} r={bw * 0.35 + ring * 120} fill="none" stroke={acc} strokeWidth={4} opacity={(1 - ring) * 0.8} style={{ filter: `drop-shadow(0 0 10px ${acc})` }} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
