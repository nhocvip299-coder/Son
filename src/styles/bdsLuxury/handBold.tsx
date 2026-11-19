/**
 * 3 KIEU CHU HOC TU TEMPLATE CHU BDS PHU FILMS (references/phufilms-chu-sfx.md). Chu NHO luon nam TRUOC, de len chu TO
 * (bong do toi roi xuong chu to) -> tao chieu sau; 2 tang chu KHAC MAU.
 *  "tay"  : viet tay chu ky (Great Vibes, trang) de cheo len goc tren-trai CHU KHOI mau (Oswald, gradient) + dong phu
 *           nghieng dam (Montserrat 800 italic, trang) can phai de len chan chu khoi.   (mau "Giu long / TRUNG TAM THANH PHO / xuat hien")
 *  "bac"  : dong nho IN HOA mau cam-do (Montserrat 800) lech trai, CHU KHOI vang phat sang lech phai -> 2 bac.  (mau "BAN GIAO / TIEU CHUAN")
 *  "neon" : chu to chu thuong bo tron (Montserrat 700) mau neon + quang cung mau, chu nho trang day (Montserrat 900) de ngang
 *           len mep tren/duoi.   (mau "Doc nhat / Nha pho kieu moi", "Mot buoc / Cham bien")
 * Ve bang SVG <text> o co that -> sac net. Dat trong <Sequence> (thoi gian cuc bo). Thoat 0.3s.
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { loopSweep } from "./sparkle";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out3 = Easing.bezier(0.33, 1, 0.68, 1);
const back = Easing.bezier(0.34, 1.7, 0.64, 1);

const TONES = {
  blue: { a: "#f0f9ff", b: "#5db4ff", c: "#1c5cd4", glow: "#3b9cff" },
  white: { a: "#ffffff", b: "#ffffff", c: "#dde7f3", glow: "#7cc0ff" },
  gold: { a: "#fff6d8", b: "#ffd36a", c: "#e2952a", glow: "#ffb23e" },
  purple: { a: "#f1dcff", b: "#b47cff", c: "#6f3fd6", glow: "#a565ff" },
  red: { a: "#ffd6cc", b: "#ff4a32", c: "#c21407", glow: "#ff3b22" },
  teal: { a: "#dffcff", b: "#53d9e6", c: "#168e9e", glow: "#2fd0e0" },
  cyan: { a: "#e8feff", b: "#46e3ff", c: "#14b6ea", glow: "#1fd4ff" },
  green: { a: "#eaffdf", b: "#58f06a", c: "#1fb83a", glow: "#39f04f" },
  orange: { a: "#ffe2c4", b: "#ff7a2e", c: "#e0420f", glow: "#ff6a1f" },
} as const;
export type HbTone = keyof typeof TONES;
export type HbVariant = "tay" | "bac" | "neon";

const mt = (text: string, fontFamily: string, fontSize: number, fontWeight: string, letterSpacing = "0em", fontStyle?: string) =>
  measureText({ text, fontFamily, fontSize, fontWeight, letterSpacing, validateFontIsLoaded: false, ...(fontStyle ? { fontStyle } : {}) }).width;

export const HandBold: React.FC<{
  id: string;
  variant?: HbVariant;
  small?: string; // chu nho (viet tay / dong nho / chu de) — luon nam TRUOC
  main: string; // chu to
  sub?: string; // dong phu (tuy chon)
  cx?: number; cy: number;
  size?: number;
  tone?: HbTone; // mau chu to
  smallTone?: HbTone; // mau dong nho (kieu "bac")
  mainAt?: number;
}> = ({ id, variant = "tay", small, main, sub, cx = 540, cy, size = 140, tone = "gold", smallTone = "orange", mainAt = 0.12 }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const t = f / fps, dur = durationInFrames / fps;
  const T = TONES[tone], S = TONES[smallTone];
  const ex = interpolate(t, [dur - 0.3, dur], [0, 1], C);
  const pIn = interpolate(t, [mainAt, mainAt + 0.32], [0, 1], { ...C, easing: back });
  const fade = interpolate(t, [mainAt, mainAt + 0.1], [0, 1], C);
  const blurIn = interpolate(t, [mainAt, mainAt + 0.18], [6, 0], C);
  const smallP = interpolate(t, [mainAt + 0.18, mainAt + 0.7], [0, 1], { ...C, easing: out3 });
  const subP = interpolate(t, [mainAt + 0.4, mainAt + 0.8], [0, 1], { ...C, easing: out3 });
  const sweep = loopSweep(t, mainAt + 0.35, 1.6, 0.7); // vet sang quet lap lai -> lap lanh

  const isNeon = variant === "neon";
  const M = isNeon ? main : main.toUpperCase();
  const mFont = isNeon ? "Montserrat" : "Oswald";
  const mWeight = isNeon ? 700 : 700;
  const mw = mt(M, mFont, size, String(mWeight), "0.01em");
  const x0 = cx - mw / 2, x1 = cx + mw / 2;
  const mainStyle: React.CSSProperties = { fontFamily: mFont, fontWeight: mWeight, fontSize: size, letterSpacing: "0.01em" };
  const sh = (k: string) => `url(#${k}-${id})`;
  const MT = (extra: React.SVGProps<SVGTextElement>, dx = 0) => <text x={cx + dx} y={cy} textAnchor="middle" dominantBaseline="central" style={mainStyle} {...extra}>{M}</text>;

  // ---- chu TO ----
  const neonFlick = isNeon ? interpolate(t, [mainAt, mainAt + 0.05, mainAt + 0.1, mainAt + 0.14, mainAt + 0.2], [0, 1, 0.25, 1, 1], C) : 1;
  const bigDx = variant === "bac" ? mw * 0.07 : 0;
  const big = (
    <g opacity={fade * neonFlick} transform={isNeon ? undefined : `translate(${cx + bigDx} ${cy}) scale(${0.6 + 0.4 * pIn}) translate(${-cx - bigDx} ${-cy})`} style={!isNeon && blurIn > 0.3 ? { filter: `blur(${blurIn}px)` } : undefined}>
      <g filter={sh("bd")} opacity={0.55}>{MT({ fill: "#000814", stroke: "#000814", strokeWidth: size * 0.35, strokeLinejoin: "round" }, bigDx)}</g>
      <g filter={sh("sd")} opacity={0.7} transform={`translate(0 ${size * 0.04})`}>{MT({ fill: "#000" }, bigDx)}</g>
      {isNeon ? (
        <>
          <g filter={sh("gl2")} opacity={0.9}>{MT({ fill: T.glow }, bigDx)}</g>
          <g filter={sh("gl")} opacity={1}>{MT({ fill: T.glow }, bigDx)}</g>
          {MT({ fill: T.b, stroke: T.a, strokeWidth: size * 0.012 }, bigDx)}
        </>
      ) : (
        <>
          <g filter={sh("gl")} opacity={0.75}>{MT({ fill: T.glow }, bigDx)}</g>
          {MT({ fill: sh("g"), stroke: "rgba(0,0,0,0.55)", strokeWidth: size * 0.025, strokeLinejoin: "round", paintOrder: "stroke" }, bigDx)}
          {MT({ fill: sh("gs") }, bigDx)}
          {MT({ fill: sh("sw") }, bigDx)}
        </>
      )}
    </g>
  );

  // ---- chu NHO (truoc) ----
  let front: React.ReactNode = null;
  if (small && variant === "tay") {
    const ss = size * 0.78;
    const sw = mt(small, "Great Vibes", ss, "400");
    const sx = x0 - size * 0.18, sy = cy - size * 0.66;
    front = (
      <g>
        <clipPath id={`cl-${id}`}><rect x={sx - 30} y={sy - ss * 1.5} width={(sw + 80) * smallP} height={ss * 3} /></clipPath>
        <g clipPath={`url(#cl-${id})`} transform={`rotate(-7 ${sx} ${sy})`}>
          <text x={sx} y={sy} dominantBaseline="central" style={{ fontFamily: "Great Vibes", fontSize: ss }} fill="#000" opacity={0.85} filter={sh("sd")} transform="translate(3 6)">{small}</text>
          <text x={sx} y={sy} dominantBaseline="central" style={{ fontFamily: "Great Vibes", fontSize: ss }} fill="#fff" stroke="#fff" strokeWidth={ss * 0.012}>{small}</text>
        </g>
      </g>
    );
  } else if (small && variant === "bac") {
    const fs = size * 0.42;
    const sx = x0 - mw * 0.04, sy = cy - size * 0.58;
    const slide = (1 - smallP) * -60;
    front = (
      <g opacity={Math.min(1, smallP * 1.6)} transform={`translate(${slide} 0)`}>
        <linearGradient id={`gs-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={S.a} /><stop offset="0.5" stopColor={S.b} /><stop offset="1" stopColor={S.c} /></linearGradient>
        <text x={sx} y={sy} dominantBaseline="central" style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: fs, letterSpacing: "0.02em" }} fill="#000" opacity={0.85} filter={sh("sd")} transform="translate(2 5)">{small.toUpperCase()}</text>
        <g filter={sh("gls")} opacity={0.7}><text x={sx} y={sy} dominantBaseline="central" style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: fs, letterSpacing: "0.02em" }} fill={S.glow}>{small.toUpperCase()}</text></g>
        <text x={sx} y={sy} dominantBaseline="central" style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: fs, letterSpacing: "0.02em" }} fill={`url(#gs-${id})`} stroke="rgba(0,0,0,0.5)" strokeWidth={fs * 0.04} paintOrder="stroke">{small.toUpperCase()}</text>
      </g>
    );
  } else if (small && variant === "neon") {
    const fs = size * 0.46;
    const sy = cy - size * 0.52, sx = x0 - mw * 0.02;
    const sc = interpolate(t, [mainAt + 0.25, mainAt + 0.5], [1.6, 1], { ...C, easing: back });
    const so = interpolate(t, [mainAt + 0.25, mainAt + 0.33], [0, 1], C);
    front = (
      <g opacity={so} transform={`translate(${sx} ${sy}) scale(${sc}) translate(${-sx} ${-sy})`}>
        <text x={sx} y={sy} dominantBaseline="central" style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: fs, letterSpacing: "-0.01em" }} fill="#000" opacity={0.9} filter={sh("sd")} transform="translate(3 6)">{small}</text>
        <text x={sx} y={sy} dominantBaseline="central" style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: fs, letterSpacing: "-0.01em" }} fill="#fff" stroke="#1b1b1b" strokeWidth={fs * 0.07} paintOrder="stroke">{small}</text>
      </g>
    );
  }
  // ---- dong phu (truoc, de len chan chu to) ----
  let subN: React.ReactNode = null;
  if (sub) {
    const fs = isNeon ? size * 0.32 : size * 0.3;
    const sy = cy + size * (isNeon ? 0.5 : 0.5);
    const sx = isNeon ? cx : x1 + bigDx;
    const anchor = isNeon ? "middle" : "end";
    const st: React.CSSProperties = { fontFamily: "Montserrat", fontWeight: 800, fontStyle: variant === "tay" ? "italic" : "normal", fontSize: fs, letterSpacing: isNeon ? "0" : "0.03em" };
    subN = (
      <g opacity={subP} transform={`translate(${(1 - subP) * 40} 0)`}>
        <text x={sx} y={sy} textAnchor={anchor} dominantBaseline="central" style={st} fill="#000" opacity={0.85} filter={sh("sd")} transform="translate(2 5)">{sub}</text>
        <text x={sx} y={sy} textAnchor={anchor} dominantBaseline="central" style={st} fill="#fff" stroke="rgba(0,0,0,0.6)" strokeWidth={fs * 0.06} paintOrder="stroke">{sub}</text>
      </g>
    );
  }
  return (
    <AbsoluteFill style={{ opacity: 1 - ex, transform: `translateY(${-ex * 40}px) scale(${1 + ex * 0.05})`, transformOrigin: `${cx}px ${cy}px` }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={T.a} /><stop offset="0.3" stopColor="#ffffff" /><stop offset="0.42" stopColor={T.b} /><stop offset="0.7" stopColor={T.c} /><stop offset="0.86" stopColor={T.b} /><stop offset="1" stopColor={T.a} /></linearGradient>
          <linearGradient id={`sw-${id}`} x1="0" y1="0" x2="1" y2="0.25">
            <stop offset={Math.max(0, sweep - 0.1)} stopColor="#fff" stopOpacity={0} />
            <stop offset={Math.min(1, Math.max(0, sweep))} stopColor="#fff" stopOpacity={0.85} />
            <stop offset={Math.min(1, sweep + 0.1)} stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <filter id={`gl-${id}`} x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation={size * 0.05} /></filter>
          <filter id={`gl2-${id}`} x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation={size * 0.16} /></filter>
          <filter id={`gls-${id}`} x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation={size * 0.04} /></filter>
          <filter id={`bd-${id}`} x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation={size * 0.16} /></filter>
          <linearGradient id={`gs-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.75} /><stop offset="0.42" stopColor="#fff" stopOpacity={0.12} /><stop offset="0.5" stopColor="#fff" stopOpacity={0} /></linearGradient>
          <filter id={`sd-${id}`} x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation={4} /></filter>
        </defs>
        {big}
        {subN}
        {front}
      </svg>
    </AbsoluteFill>
  );
};
