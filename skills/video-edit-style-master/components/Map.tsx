import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { VESM } from "../presets/style";
import { backOut, CL, outCubic, useLocal } from "./core";

/**
 * BẢN ĐỒ LƯỚI TỐI: lưới đường cyan nghiêng, dòng sông, ghim điểm mốc + nhãn viên thuốc, đường đi tự vẽ (phát sáng),
 * huy hiệu khoảng cách VÀNG giữa đường, ghim đích. Lead trắng + chữ ký vàng phía trên. [XM 18,1–22,2 s]
 */
export const MapRoute: React.FC<{ place: string; dest?: string; dist?: string; lead?: string; script?: string }> = ({ place, dest = "KHU NHÀ", dist, lead, script }) => {
  const { t, dur, width, height } = useLocal();
  const o = Math.min(interpolate(t, [0, 0.25], [0, 1], CL), interpolate(t, [dur - 0.3, dur], [1, 0], CL));
  const g = interpolate(t, [0, 0.8], [0, 1], { ...CL, easing: outCubic });
  const pin = interpolate(t, [0.4, 0.75], [0, 1], { ...CL, easing: backOut });
  const draw = interpolate(t, [1.3, 2.6], [0, 1], { ...CL, easing: outCubic });
  const badge = interpolate(t, [2.0, 2.35], [0, 1], { ...CL, easing: backOut });
  const end = interpolate(t, [2.6, 2.95], [0, 1], { ...CL, easing: backOut });
  const ws = interpolate(t, [0.5, 1.1], [0, 1], { ...CL, easing: outCubic });
  const P0 = { x: width * 0.2, y: height * 0.29 }, P1 = { x: width * 0.62, y: height * 0.74 }; // [XM 18–22 s]
  const path = `M ${P0.x} ${P0.y} C ${P0.x + 40} ${P0.y + 220}, ${P0.x + 260} ${P0.y + 300}, ${width * 0.4} ${height * 0.59} S ${P1.x - 60} ${P1.y - 120}, ${P1.x} ${P1.y}`;
  const L = 1300;
  const lines: React.ReactNode[] = [];
  for (let i = -9; i <= 9; i++) {
    lines.push(<line key={`a${i}`} x1={width / 2 + i * 140 - 500} y1={0} x2={width / 2 + i * 140 + 380} y2={height} stroke={VESM.color.glassEdge} strokeWidth={i % 3 === 0 ? 5 : 1.5} opacity={(i % 3 === 0 ? 0.45 : 0.2) * g} />);
    lines.push(<line key={`b${i}`} x1={0} y1={height / 2 + i * 150 + 260} x2={width} y2={height / 2 + i * 150 - 200} stroke={VESM.color.glassEdge} strokeWidth={i % 4 === 0 ? 6 : 1.5} opacity={(i % 4 === 0 ? 0.5 : 0.18) * g} />);
  }
  const Pill: React.FC<{ x: number; y: number; s: string }> = ({ x, y, s }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-s.length * 12 - 26} y={-32} width={s.length * 24 + 52} height={64} rx={32} fill="rgba(2,26,30,0.9)" stroke="#e8ffff" strokeWidth={2.5} />
      <text textAnchor="middle" dominantBaseline="central" fill="#fff" style={{ fontFamily: VESM.font.sans, fontWeight: 800, fontSize: 32 }}>{s.toUpperCase()}</text>
    </g>
  );
  const Pin: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
    <g opacity={k} transform={`translate(${x} ${y - (1 - k) * 60}) scale(${0.6 + 0.4 * k})`}>
      <path d="M 0 0 C -26 -32 -40 -52 -40 -72 A 40 40 0 1 1 40 -72 C 40 -52 26 -32 0 0 Z" fill={VESM.color.neon} stroke="#fff" strokeWidth={4} style={{ filter: `drop-shadow(0 0 10px ${VESM.color.neon})` }} />
      <circle cx={0} cy={-72} r={15} fill="#fff" />
    </g>
  );
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #0b3b3e 0%, #062a2d 60%, #031a1d 100%)" }} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {lines}
        <path d={`M 0 ${height * 0.24} C ${width * 0.3} ${height * 0.2}, ${width * 0.6} ${height * 0.29}, ${width} ${height * 0.22}`} stroke="#1f7fd0" strokeWidth={34} fill="none" opacity={0.55 * g} />
        <path d={path} stroke={VESM.color.neon} strokeWidth={26} fill="none" opacity={0.25} strokeDasharray={L} strokeDashoffset={L * (1 - draw)} strokeLinecap="round" style={{ filter: "blur(8px)" }} />
        <path d={path} stroke="#c8fffb" strokeWidth={9} fill="none" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} strokeLinecap="round" />
        <Pin x={P0.x} y={P0.y} k={pin} />
        <g opacity={pin}><Pill x={P0.x + 60} y={P0.y + 50} s={place} /></g>
        {dist ? (
          <g opacity={badge} transform={`translate(${width * 0.4} ${height * 0.59}) scale(${0.6 + 0.4 * badge})`}>
            <rect x={-130} y={-56} width={260} height={112} rx={56} fill="#2a1a00" stroke={VESM.color.gold} strokeWidth={4} style={{ filter: `drop-shadow(0 0 12px ${VESM.color.gold})` }} />
            <text textAnchor="middle" dominantBaseline="central" fill={VESM.color.gold} style={{ fontFamily: VESM.font.block, fontWeight: 800, fontSize: 80 }}>{dist}</text>
          </g>
        ) : null}
        <Pin x={P1.x} y={P1.y} k={end} />
        <g opacity={end}><Pill x={P1.x + 30} y={P1.y + 50} s={dest} /></g>
        {lead ? <text x={width / 2} y={height * 0.164} textAnchor="middle" dominantBaseline="central" fill="#fff" style={{ fontFamily: VESM.font.sans, fontWeight: 500, fontSize: 50 }}>{lead}</text> : null}
        {script ? (
          <g style={{ clipPath: `inset(0 ${(1 - ws) * 100}% 0 0)` }}>
            <text x={width / 2 + 60} y={height * 0.21} textAnchor="middle" dominantBaseline="central" fill={VESM.color.gold} transform={`rotate(-4 ${width / 2} ${height * 0.21})`} style={{ fontFamily: VESM.font.script, fontSize: 104, filter: `drop-shadow(0 0 8px ${VESM.color.gold}cc)` }}>{script}</text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
