import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { VESM } from "../presets/style";
import { CL, exitK, fitSize, outCubic, textW, useLocal } from "./core";

/**
 * Chữ NEON cyan đứng hẹp IN HOA, hiện TỪNG KÝ TỰ (nhấp nháy như đèn) trong ~0,4 s + chữ ký trắng viết dần.
 * [XM 2–4 s "KHU NHÀ GIÁ RẺ / cho cả nhà", 29–40 s "NGANG 5M", "PHÒNG THỜ", "SÂN TRƯỚC / đậu ô tô"]
 * Thoát: mờ + nhoè 0,3 s. Dùng trong <Sequence>.
 */
export const NeonTitle: React.FC<{
  id: string; main: string; cy: number;
  script?: string; scriptPos?: "below" | "above"; scriptColor?: string;
  lead?: string; size?: number; at?: number; color?: string;
}> = ({ id, main, cy, script, scriptPos = "below", scriptColor = VESM.color.script, lead, size = VESM.size.neon, at = 0.1, color = VESM.color.neon }) => {
  const { t, dur, width, height } = useLocal();
  const M = main.toUpperCase();
  const fs = fitSize(M, VESM.font.block, VESM.font.blockWeight, size);
  const chars = [...M];
  const step = VESM.time.charStep / Math.max(1, chars.length);
  const ex = exitK(t, dur);
  const fl = (i: number) => { const s = at + i * step; return interpolate(t, [s, s + 0.04, s + 0.07, s + 0.11], [0, 1, 0.4, 1], CL); };
  const ss = Math.max(VESM.size.script, fs * 0.62);
  const sw = script ? textW(script, VESM.font.script, 400, ss) : 0;
  const wS = interpolate(t, [at + 0.25, at + 0.25 + VESM.time.scriptWrite], [0, 1], { ...CL, easing: outCubic });
  const sy = scriptPos === "below" ? cy + fs * 0.62 : cy - fs * 0.72;
  const sx = width / 2 + (scriptPos === "below" ? fs * 0.6 : -fs * 0.45);
  const la = interpolate(t, [0, 0.25], [0, 1], CL);
  const st: React.CSSProperties = { fontFamily: VESM.font.block, fontWeight: VESM.font.blockWeight, fontSize: fs, letterSpacing: "0.01em" };
  const Row = (props: React.SVGProps<SVGTextElement>, child: (c: string, i: number) => React.ReactNode) => (
    <text x={width / 2} y={cy} textAnchor="middle" dominantBaseline="central" style={st} {...props}>{chars.map(child)}</text>
  );
  return (
    <AbsoluteFill style={{ opacity: 1 - ex, filter: ex > 0.01 ? `blur(${ex * 10}px)` : undefined }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <filter id={`nw-${id}`} x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur stdDeviation={fs * 0.12} /></filter>
          <filter id={`nn-${id}`} x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur stdDeviation={fs * 0.035} /></filter>
          <linearGradient id={`nf-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={VESM.color.neonCore} /><stop offset="0.55" stopColor={color} /><stop offset="1" stopColor={color} /></linearGradient>
          <clipPath id={`nc-${id}`}><rect x={sx - sw / 2 - 20} y={sy - ss} width={(sw + 40) * wS} height={ss * 2} /></clipPath>
        </defs>
        {lead ? <text x={width / 2} y={cy - fs * 0.78} textAnchor="middle" dominantBaseline="central" fill="#fff" opacity={la} style={{ fontFamily: VESM.font.sans, fontWeight: 500, fontSize: VESM.size.lead, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.75))" }}>{lead}</text> : null}
        {Row({ fill: color, filter: `url(#nw-${id})`, opacity: 0.85 }, (c, i) => <tspan key={i} opacity={fl(i)}>{c}</tspan>)}
        {Row({ fill: color, filter: `url(#nn-${id})` }, (c, i) => <tspan key={i} opacity={fl(i)}>{c}</tspan>)}
        {Row({ fill: `url(#nf-${id})` }, (c, i) => <tspan key={i} opacity={fl(i)}>{c}</tspan>)}
        {script ? (
          <g clipPath={`url(#nc-${id})`}>
            <text x={sx} y={sy} textAnchor="middle" dominantBaseline="central" fill={scriptColor} transform={`rotate(-5 ${sx} ${sy})`}
              style={{ fontFamily: VESM.font.script, fontSize: ss, filter: `drop-shadow(0 0 6px ${scriptColor}cc) drop-shadow(0 2px 3px rgba(0,0,0,0.7))` }}>{script}</text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
