/**
 * CHU VIET TAY + CHU DAY BAN (thay preset CapCut khi chen len video — nguoi dung yeu cau SAC NET):
 *  - dong viet tay (Dancing Script 700) "viet ra" trai -> phai (clip), trang/vang, vien toi mong
 *  - dong chinh khoi day (Montserrat 900) bat vao (scale vuot + het nhoe trong 0.22s), gradient dac,
 *    vien toi ngoai (paint-order stroke) + bong cung lech xuong -> canh chu sac; 1 vet sang quet qua.
 *  - thoat 0.3s: noi len + mo.  Ve bang SVG <text> o co that (khong phong to anh) -> khong nhoe.
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out3 = Easing.bezier(0.33, 1, 0.68, 1);
const back = Easing.bezier(0.34, 1.7, 0.64, 1);

const TONES = {
  gold: { a: "#fff6dc", b: "#f2cf7a", c: "#b9822f", edge: "#2a1804" },
  white: { a: "#ffffff", b: "#ffffff", c: "#dfe3e8", edge: "#0b0f17" },
  red: { a: "#ff8a7a", b: "#ff3b30", c: "#b3120c", edge: "#2b0300" },
  mint: { a: "#dcfff7", b: "#4af0d2", c: "#0fb895", edge: "#00231c" },
} as const;
export type HbTone = keyof typeof TONES;

/** Dat trong <Sequence> (thoi gian cuc bo). */
export const HandBold: React.FC<{
  id: string;
  script?: string; // dong viet tay (tren)
  main: string; // dong day ban
  script2?: string; // dong viet tay (duoi, tuy chon)
  cx?: number; cy: number; // tam (px)
  size?: number; // co chu day
  tone?: HbTone;
  scriptColor?: string;
  mainAt?: number; // giay cuc bo dong chinh vao
  rot?: number;
}> = ({ id, script, main, script2, cx = 540, cy, size = 120, tone = "gold", scriptColor = "#ffffff", mainAt = 0.25, rot = -3 }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const t = f / fps, dur = durationInFrames / fps;
  const T = TONES[tone];
  const ss = Math.max(44, size * 0.72); // co chu viet tay
  // thoat
  const ex = interpolate(t, [dur - 0.3, dur], [0, 1], C);
  // viet tay: lo dan trai -> phai
  const w1 = interpolate(t, [0, 0.45], [0, 1], { ...C, easing: out3 });
  const w2 = interpolate(t, [mainAt + 0.35, mainAt + 0.8], [0, 1], { ...C, easing: out3 });
  // chu day: bat vao
  const p = interpolate(t, [mainAt, mainAt + 0.28], [0, 1], { ...C, easing: back });
  const bl = interpolate(t, [mainAt, mainAt + 0.18], [6, 0], C);
  const mo = interpolate(t, [mainAt, mainAt + 0.08], [0, 1], C);
  const sweep = interpolate(t, [mainAt + 0.3, mainAt + 0.95], [-0.3, 1.3], C);
  const yS = cy - size * 0.55 - ss * 0.62, yM = cy, yS2 = cy + size * 0.55 + ss * 0.62;
  const mainStyle: React.CSSProperties = { fontFamily: "Montserrat", fontWeight: 900, fontSize: size, letterSpacing: "0.01em" };
  const scrStyle: React.CSSProperties = { fontFamily: "Dancing Script", fontWeight: 700, fontSize: ss };
  const Scr = ({ s, y, w, k }: { s: string; y: number; w: number; k: string }) => (
    <g>
      <clipPath id={`cl-${id}-${k}`}><rect x={0} y={y - ss} width={width * w} height={ss * 2} /></clipPath>
      <g clipPath={`url(#cl-${id}-${k})`}>
        <text x={cx} y={y} textAnchor="middle" dominantBaseline="central" style={scrStyle} fill="none" stroke="rgba(0,0,0,0.75)" strokeWidth={ss * 0.12} strokeLinejoin="round" transform={`translate(2 3)`}>{s}</text>
        <text x={cx} y={y} textAnchor="middle" dominantBaseline="central" style={scrStyle} fill={scriptColor} stroke="rgba(0,0,0,0.55)" strokeWidth={ss * 0.06} paintOrder="stroke" strokeLinejoin="round">{s}</text>
      </g>
    </g>
  );
  return (
    <AbsoluteFill style={{ opacity: 1 - ex, transform: `translateY(${-ex * 40}px) scale(${1 + ex * 0.05})`, transformOrigin: `${cx}px ${cy}px` }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id={`hb-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={T.a} /><stop offset="0.5" stopColor={T.b} /><stop offset="1" stopColor={T.c} />
          </linearGradient>
          <linearGradient id={`sw-${id}`} x1="0" y1="0" x2="1" y2="0.2">
            <stop offset={Math.max(0, sweep - 0.12)} stopColor="#fff" stopOpacity={0} />
            <stop offset={Math.min(1, Math.max(0, sweep))} stopColor="#fff" stopOpacity={0.85} />
            <stop offset={Math.min(1, sweep + 0.12)} stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <filter id={`sh-${id}`} x="-20%" y="-40%" width="140%" height="190%"><feGaussianBlur stdDeviation="5" /></filter>
        </defs>
        <g transform={`rotate(${rot} ${cx} ${cy})`}>
          {script ? <Scr s={script} y={yS} w={w1} k="a" /> : null}
          <g opacity={mo} transform={`translate(${cx} ${yM}) scale(${0.55 + 0.45 * p}) translate(${-cx} ${-yM})`} style={bl > 0.3 ? { filter: `blur(${bl}px)` } : undefined}>
            {/* bong mem xa + bong cung lech */}
            <text x={cx} y={yM + size * 0.07} textAnchor="middle" dominantBaseline="central" style={mainStyle} fill="#000" opacity={0.55} filter={`url(#sh-${id})`}>{main}</text>
            <text x={cx} y={yM + size * 0.045} textAnchor="middle" dominantBaseline="central" style={mainStyle} fill={T.edge} stroke={T.edge} strokeWidth={size * 0.09} strokeLinejoin="round">{main}</text>
            {/* vien toi ngoai + than gradient */}
            <text x={cx} y={yM} textAnchor="middle" dominantBaseline="central" style={mainStyle} fill={`url(#hb-${id})`} stroke={T.edge} strokeWidth={size * 0.075} strokeLinejoin="round" paintOrder="stroke">{main}</text>
            {/* vet sang quet */}
            <text x={cx} y={yM} textAnchor="middle" dominantBaseline="central" style={mainStyle} fill={`url(#sw-${id})`}>{main}</text>
          </g>
          {script2 ? <Scr s={script2} y={yS2} w={w2} k="b" /> : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
