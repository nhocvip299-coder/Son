/**
 * CHU VIET TAY + CHU DAY BAN — kieu template chu BDS Phu Films (nghien cuu references/phufilms-chu-sfx.md):
 *  - dong VIET TAY (Dancing Script 700) nghieng cheo, DE MOT PHAN len goc tren-trai chu khoi, "viet ra" trai -> phai
 *  - dong CHU KHOI day, hep kieu Bebas (Anton), in hoa, gradient dac + QUANG SANG AM GON sat chu + bong ngan -> sac canh
 *  - dong PHU nho (Montserrat 700, gian chu) can PHAI duoi chu khoi
 *  - vao: chu khoi bat (scale vuot, het nhoe 0.18s) -> viet tay viet ra -> dong phu truot len; 1 vet sang quet; thoat 0.3s noi + mo
 *  Ve bang SVG <text> o co that -> khong nhoe khi phong to.
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out3 = Easing.bezier(0.33, 1, 0.68, 1);
const back = Easing.bezier(0.34, 1.7, 0.64, 1);

const TONES = {
  gold: { a: "#fff7e0", b: "#ffd77a", c: "#e09a2c", glow: "#ffae3d", edge: "#3a2004" },
  white: { a: "#ffffff", b: "#ffffff", c: "#e6e9ee", glow: "#ffd9a0", edge: "#0b0f17" },
  red: { a: "#ffd0c8", b: "#ff4a3a", c: "#c0140c", glow: "#ff5a3c", edge: "#2b0300" },
  cyan: { a: "#e6fdff", b: "#5fe6ff", c: "#14a9d6", glow: "#38d8ff", edge: "#00202b" },
} as const;
export type HbTone = keyof typeof TONES;
const BLOCK = "Oswald"; // hep, day kieu Bebas, du dau tieng Viet (Anton thieu dau moc o Ơ/Ư)

/** Dat trong <Sequence> (thoi gian cuc bo). */
export const HandBold: React.FC<{
  id: string;
  script?: string; // viet tay (cheo, goc tren-trai)
  main: string; // chu khoi day
  sub?: string; // dong phu nho can phai
  cx?: number; cy: number;
  size?: number; // co chu khoi
  tone?: HbTone;
  scriptColor?: string;
  mainAt?: number; // giay cuc bo chu khoi vao (viet tay vao ngay sau)
}> = ({ id, script, main, sub, cx = 540, cy, size = 140, tone = "gold", scriptColor = "#ffffff", mainAt = 0.15 }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const t = f / fps, dur = durationInFrames / fps;
  const T = TONES[tone];
  const M = main.toUpperCase();
  const mw = measureText({ text: M, fontFamily: BLOCK, fontSize: size, fontWeight: "700", letterSpacing: "0.02em", validateFontIsLoaded: false }).width;
  const x0 = cx - mw / 2, x1 = cx + mw / 2;
  const ss = size * 0.6; // co viet tay
  const sb = Math.max(30, size * 0.26); // co dong phu
  // thoi gian
  const ex = interpolate(t, [dur - 0.3, dur], [0, 1], C);
  const p = interpolate(t, [mainAt, mainAt + 0.3], [0, 1], { ...C, easing: back });
  const bl = interpolate(t, [mainAt, mainAt + 0.18], [6, 0], C);
  const mo = interpolate(t, [mainAt, mainAt + 0.08], [0, 1], C);
  const w1 = interpolate(t, [mainAt + 0.15, mainAt + 0.7], [0, 1], { ...C, easing: out3 });
  const s2 = interpolate(t, [mainAt + 0.45, mainAt + 0.8], [0, 1], { ...C, easing: out3 });
  const sweep = interpolate(t, [mainAt + 0.35, mainAt + 1.0], [-0.3, 1.3], C);
  const yScr = cy - size * 0.6, xScr = x0 + mw * 0.02;
  const sw = script ? measureText({ text: script, fontFamily: "Dancing Script", fontSize: ss, fontWeight: "700", validateFontIsLoaded: false }).width : 0;
  const ySub = cy + size * 0.5 + sb * 0.75;
  const mainStyle: React.CSSProperties = { fontFamily: BLOCK, fontWeight: 700, fontSize: size, letterSpacing: "0.02em" };
  const scrStyle: React.CSSProperties = { fontFamily: "Dancing Script", fontWeight: 700, fontSize: ss };
  const subStyle: React.CSSProperties = { fontFamily: "Montserrat", fontWeight: 700, fontSize: sb, letterSpacing: "0.1em" };
  const MT = (extra: React.SVGProps<SVGTextElement>) => <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" style={mainStyle} {...extra}>{M}</text>;
  return (
    <AbsoluteFill style={{ opacity: 1 - ex, transform: `translateY(${-ex * 40}px) scale(${1 + ex * 0.05})`, transformOrigin: `${cx}px ${cy}px` }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id={`hb-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={T.a} /><stop offset="0.5" stopColor={T.b} /><stop offset="1" stopColor={T.c} />
          </linearGradient>
          <linearGradient id={`sw-${id}`} x1="0" y1="0" x2="1" y2="0.25">
            <stop offset={Math.max(0, sweep - 0.1)} stopColor="#fff" stopOpacity={0} />
            <stop offset={Math.min(1, Math.max(0, sweep))} stopColor="#fff" stopOpacity={0.9} />
            <stop offset={Math.min(1, sweep + 0.1)} stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <filter id={`gw-${id}`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={size * 0.06} /></filter>
          <filter id={`sh-${id}`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={3} /></filter>
          <clipPath id={`cl-${id}`}><rect x={xScr - 40} y={yScr - ss * 1.4} width={(Math.max(mw, sw) + 200) * w1} height={ss * 2.8} /></clipPath>
        </defs>
        {/* CHU KHOI */}
        <g opacity={mo} transform={`translate(${cx} ${cy}) scale(${0.55 + 0.45 * p}) translate(${-cx} ${-cy})`} style={bl > 0.3 ? { filter: `blur(${bl}px)` } : undefined}>
          <g filter={`url(#sh-${id})`} opacity={0.75} transform={`translate(0 ${size * 0.04})`}>{MT({ fill: "#000" })}</g>
          <g filter={`url(#gw-${id})`} opacity={0.85}>{MT({ fill: T.glow })}</g>
          {MT({ fill: `url(#hb-${id})`, stroke: T.edge, strokeWidth: size * 0.03, strokeLinejoin: "round", paintOrder: "stroke" })}
          {MT({ fill: `url(#sw-${id})` })}
        </g>
        {/* VIET TAY cheo, de len goc tren-trai */}
        {script ? (
          <g clipPath={`url(#cl-${id})`}>
            <g transform={`rotate(-8 ${xScr} ${yScr})`}>
              <text x={xScr} y={yScr} textAnchor="start" dominantBaseline="central" style={scrStyle} fill="#000" opacity={0.6} filter={`url(#sh-${id})`} transform="translate(2 4)">{script}</text>
              <text x={xScr} y={yScr} textAnchor="start" dominantBaseline="central" style={scrStyle} fill={scriptColor} stroke="rgba(0,0,0,0.5)" strokeWidth={ss * 0.05} paintOrder="stroke">{script}</text>
            </g>
          </g>
        ) : null}
        {/* DONG PHU can phai */}
        {sub ? (
          <g opacity={s2} transform={`translate(0 ${(1 - s2) * 16})`}>
            <text x={x1} y={ySub} textAnchor="end" dominantBaseline="central" style={subStyle} fill="#000" opacity={0.6} filter={`url(#sh-${id})`} transform="translate(1 3)">{sub.toUpperCase()}</text>
            <text x={x1} y={ySub} textAnchor="end" dominantBaseline="central" style={subStyle} fill="#fff" stroke="rgba(0,0,0,0.45)" strokeWidth={sb * 0.08} paintOrder="stroke">{sub.toUpperCase()}</text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
