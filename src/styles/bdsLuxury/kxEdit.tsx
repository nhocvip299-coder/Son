/**
 * HIEU UNG EDIT hoc tu video mau "trang kinh xanh" (styles/mau-drive-1/references/style-spec.md).
 *  LightBurst  : chuyen canh bung sang trang-kem 0.6s (dat tai moc cat)
 *  TealOrange  : grade toan video bong teal / sang cam
 *  NeonType    : chu neon hien TUNG KY TU trai->phai + chu ky trang viet dan; thoat mo-nhoe
 *  GoldCount   : so tien vang dem chay roi dung
 *  PixelSlide  : canh cu vo thanh dai bac thang truot di (vao ban do)
 * Tat ca dung thoi gian cuc bo trong <Sequence>, ve SVG o co that (net 4K).
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const useT = () => { const f = useCurrentFrame(); const v = useVideoConfig(); return { t: f / v.fps, dur: v.durationInFrames / v.fps, ...v }; };

export const LightBurst: React.FC = () => {
  const { t } = useT();
  const a = interpolate(t, [0, 0.18, 0.3, 0.6], [0, 1, 1, 0], C);
  const r = interpolate(t, [0, 0.3], [20, 140], { ...C, easing: Easing.out(Easing.cubic) });
  return <AbsoluteFill style={{ opacity: a, background: `radial-gradient(circle at 50% 45%, #ffffff 0%, #fff8e6 ${r * 0.4}%, rgba(255,240,210,0.9) ${r * 0.7}%, rgba(200,255,250,0.6) ${r}%)`, mixBlendMode: "screen" }} />;
};

export const TealOrange: React.FC<{ children: React.ReactNode; k?: number }> = ({ children, k = 1 }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ filter: `contrast(${1 + 0.06 * k}) saturate(${1 + 0.12 * k})` }}>{children}</AbsoluteFill>
    {/* bong -> teal (multiply nhe), sang -> cam am (soft-light) */}
    <AbsoluteFill style={{ background: "rgb(40,120,115)", mixBlendMode: "soft-light", opacity: 0.35 * k }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,170,90,0.0) 0%, rgba(255,170,90,0.0) 40%, rgba(10,60,60,0.25) 100%)", mixBlendMode: "multiply", opacity: k }} />
  </AbsoluteFill>
);

export const NeonType: React.FC<{ id: string; script?: string; main: string; sub?: string; cy: number; size?: number; color?: string; at?: number }> = ({ id, script, main, sub, cy, size = 140, color = "#0df9f8", at = 0.15 }) => {
  const { t, dur, width, height } = useT();
  const M = main.toUpperCase();
  let fs = size;
  const w0 = measureText({ text: M, fontFamily: "Barlow Condensed", fontWeight: "800", fontSize: fs, validateFontIsLoaded: false }).width;
  if (w0 > 740) fs = (fs * 740) / w0;
  const chars = [...M];
  const per = 0.4 / Math.max(1, chars.length);
  const ex = interpolate(t, [dur - 0.3, dur], [0, 1], C);
  const ws = script ? interpolate(t, [0, 0.6], [0, 1], { ...C, easing: Easing.out(Easing.cubic) }) : 0;
  const subA = interpolate(t, [at + 0.5, at + 0.8], [0, 1], C);
  const ss = fs * 0.62;
  const st: React.CSSProperties = { fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: fs, letterSpacing: "0.01em" };
  const flick = (i: number) => { const s = at + i * per; return interpolate(t, [s, s + 0.04, s + 0.07, s + 0.1], [0, 1, 0.45, 1], C); };
  return (
    <AbsoluteFill style={{ opacity: 1 - ex, filter: ex > 0.01 ? `blur(${ex * 8}px)` : undefined }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <filter id={`ng-${id}`} x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur stdDeviation={fs * 0.08} /></filter>
          <clipPath id={`nc-${id}`}><rect x={0} y={cy - fs * 1.8} width={width * ws} height={fs * 1.4} /></clipPath>
        </defs>
        <text x={width / 2} y={cy} textAnchor="middle" dominantBaseline="central" style={st}>
          {chars.map((c, i) => <tspan key={i} fill={color} opacity={flick(i)} filter={`url(#ng-${id})`}>{c}</tspan>)}
        </text>
        <text x={width / 2} y={cy} textAnchor="middle" dominantBaseline="central" style={st}>
          {chars.map((c, i) => <tspan key={i} fill="#e9ffff" opacity={flick(i)}>{c}</tspan>)}
        </text>
        <text x={width / 2} y={cy} textAnchor="middle" dominantBaseline="central" style={st} fill="none" stroke={color} strokeWidth={fs * 0.035} opacity={0.9}>
          {chars.map((c, i) => <tspan key={i} opacity={flick(i)}>{c}</tspan>)}
        </text>
        {script ? (
          <g clipPath={`url(#nc-${id})`}>
            <text x={width / 2 - fs * 0.6} y={cy - fs * 0.78} textAnchor="middle" dominantBaseline="central" fill="#ffffff" transform={`rotate(-6 ${width / 2} ${cy})`}
              style={{ fontFamily: "Ms Madi", fontSize: ss, filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9)) drop-shadow(0 2px 3px rgba(0,0,0,0.7))" }}>{script}</text>
          </g>
        ) : null}
        {sub ? <text x={width / 2} y={cy + fs * 0.72} textAnchor="middle" dominantBaseline="central" fill="#ffffff" opacity={subA}
          style={{ fontFamily: "Be Vietnam Pro", fontWeight: 600, fontSize: fs * 0.22, letterSpacing: "0.05em", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.8))" }}>{sub}</text> : null}
      </svg>
    </AbsoluteFill>
  );
};

export const GoldCount: React.FC<{ lead: string; to: number; unit: string; cy: number; size?: number; at?: number; dec?: number }> = ({ lead, to, unit, cy, size = 170, at = 0.1, dec = 0 }) => {
  const { t, dur, width, height } = useT();
  const p = interpolate(t, [at, at + 0.55], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const v = (to * p).toFixed(dec).replace(".", ",");
  const ex = interpolate(t, [dur - 0.3, dur], [0, 1], C);
  const la = interpolate(t, [0, 0.25], [0, 1], C);
  const st: React.CSSProperties = { fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: size };
  const txt = `${v} ${unit}`;
  return (
    <AbsoluteFill style={{ opacity: 1 - ex, filter: ex > 0.01 ? `blur(${ex * 8}px)` : undefined }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="gc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff6cf" /><stop offset="0.45" stopColor="#ffd25a" /><stop offset="1" stopColor="#cf8f4b" /></linearGradient>
          <filter id="gc-b"><feGaussianBlur stdDeviation={size * 0.07} /></filter>
        </defs>
        <text x={width / 2} y={cy - size * 0.72} textAnchor="middle" dominantBaseline="central" fill="#fff" opacity={la} style={{ fontFamily: "Be Vietnam Pro", fontWeight: 600, fontSize: size * 0.24, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.8))" }}>{lead}</text>
        <text x={width / 2} y={cy} textAnchor="middle" dominantBaseline="central" fill="#ffb02e" opacity={0.75 * Math.min(1, p * 3)} filter="url(#gc-b)" style={st}>{txt}</text>
        <text x={width / 2} y={cy} textAnchor="middle" dominantBaseline="central" fill="url(#gc-g)" opacity={Math.min(1, p * 3)} stroke="#5a3200" strokeWidth={size * 0.02} paintOrder="stroke" style={{ ...st, filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.6))" }}>{txt}</text>
      </svg>
    </AbsoluteFill>
  );
};

/** canh cu vo thanh dai bac thang truot len (dat TREN canh cu, trong suot -> lo canh moi ben duoi qua khe) */
export const PixelSlide: React.FC<{ children: React.ReactNode; dur?: number }> = ({ children, dur = 0.5 }) => {
  const { t, width, height } = useT();
  const n = 10, bw = width / n;
  return (
    <AbsoluteFill>
      {Array.from({ length: n }, (_, i) => {
        const p = interpolate(t, [i * 0.025, i * 0.025 + dur], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
        return (
          <div key={i} style={{ position: "absolute", left: i * bw, top: 0, width: bw + 1, height, overflow: "hidden", transform: `translateY(${-p * height * 1.1}px)` }}>
            <div style={{ position: "absolute", left: -i * bw, top: 0, width, height }}>{children}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
