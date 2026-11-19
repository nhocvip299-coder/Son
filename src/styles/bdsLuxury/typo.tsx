/**
 * bds-luxury — CHU theo 4 style (hoc tu 9 video kenh @quyettranlux):
 *  A "Kinh vang"     (ref01-06): QtGlassText trong quyetTranLux/glass.tsx (dung lai).
 *  B "Boc tach so"   (ref08)    : StackText palette "mint" — chu dung hep dam xanh bac ha + quang sang loe roi diu,
 *                                  dong dan trang nho tren / dong phu trang duoi, so CHAY (count) hoac GO tung ky tu (type).
 *  C "Ha tang trang" (ref07)    : StackText palette "white" — chu trang dam Be Vietnam, dong dan nho, vao "zoomSettle".
 *  D "Dien anh"      (ref09)    : SerifTitle (serif gian chu khep dan) + SpecBox (khung vien manh ve dan + thong so).
 * Tat ca ve bang SVG <text> (khu rang cua), keyframe vao/ra lay tu quyetTranLux/keyframes.ts.
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { kf, type KfIn, type KfOut } from "../quyetTranLux/keyframes";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const outCubic = Easing.bezier(0.33, 1, 0.68, 1);

export type StackLine = {
  text: string; // co the chua {n} khi dung count
  role: "lead" | "main" | "sub";
  at: number; // giay (tuyet doi theo timeline cha)
  dx?: number; // lech ngang (ti le W) -> bo cuc so le kieu "HẠNG SANG / ĐẲNG CẤP"
  enter?: KfIn;
  count?: { to: number; from?: number; dec?: number; dur?: number }; // so chay
  type?: boolean; // go tung ky tu ("3KM")
  italic?: boolean;
  size?: number; // ghi de co chu
};

export const PALETTE = {
  mint: { font: "Oswald", weight: 700, top: "#c9fff3", mid: "#45f2d2", bot: "#10c4a3", glow: "#38f3d3", shade: "#00241d", upper: true },
  // vang champagne (nguoi dung rat thich) — cung tong style A kinh vang
  gold: { font: "Montserrat", weight: 900, top: "#fff4d6", mid: "#e8c26e", bot: "#a8742a", glow: "#ffd98a", shade: "#2a1804", upper: true },
  // font B nguoi dung chon (du an OCP2): serif Playfair vang champagne
  serif: { font: "Playfair Display", weight: 900, top: "#fff4d6", mid: "#e8c26e", bot: "#a8742a", glow: "#ffd98a", shade: "#2a1804", upper: true },
  // XANH DUONG + TRANG (tone nguoi dung chon cho du an OCP2): serif Playfair xanh, dong dan trang
  blue: { font: "Playfair Display", weight: 900, top: "#f0f9ff", mid: "#66baff", bot: "#1d5ed4", glow: "#4aa3ff", shade: "#021430", upper: true },
  white: { font: "Be Vietnam Pro", weight: 900, top: "#ffffff", mid: "#ffffff", bot: "#e9ecef", glow: "#ffffff", shade: "#000000", upper: false },
} as const;
export type Palette = keyof typeof PALETTE;

const fmt = (v: number, dec = 0) => v.toFixed(dec).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Cum chu xep tang: dan (lead) / CHINH (main) / phu (sub). */
export const StackText: React.FC<{
  id: string;
  lines: StackLine[];
  end: number;
  x?: number;
  y: number; // tam dong dau (ti le H)
  size?: number; // co chu dong chinh
  palette?: Palette;
  exit?: KfOut;
  anchor?: "start" | "middle" | "end";
}> = ({ id, lines, end, x = 0.5, y, size = 150, palette = "mint", exit = "blurUp", anchor = "middle" }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = f / fps;
  const P = PALETTE[palette];
  const sz = (l: StackLine) => l.size ?? (l.role === "main" ? size : size * (palette !== "white" ? 0.34 : 0.3));
  const lh = (l: StackLine) => sz(l) * (l.role === "main" ? (palette === "mint" ? 0.98 : palette === "gold" || palette === "serif" || palette === "blue" ? 1.05 : 1.1) : 1.3);
  let acc = y * height;
  const ys = lines.map((l, i) => {
    const prev = lines[i - 1];
    if (i > 0) acc += lh(prev) / 2 + lh(l) / 2;
    return acc;
  });
  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id={`mg-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={P.top} />
            <stop offset="0.45" stopColor={P.mid} />
            <stop offset="1" stopColor={P.bot} />
          </linearGradient>
          <filter id={`gl-${id}`} x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="14" /></filter>
          <filter id={`sd-${id}`} x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="7" /></filter>
        </defs>
        {lines.map((l, i) => {
          const isMain = l.role === "main";
          const k = kf(l.enter ?? (isMain ? "zoomSettle" : "blurIn"), exit, t, l.at, end, fps, width);
          if (k.hidden) return null;
          let txt = l.text;
          if (l.count) {
            const p = interpolate(t, [l.at, l.at + (l.count.dur ?? 0.7)], [0, 1], { ...C, easing: outCubic });
            txt = txt.replace("{n}", fmt((l.count.from ?? 0) + (l.count.to - (l.count.from ?? 0)) * p, l.count.dec ?? 0));
          }
          if (l.type) txt = txt.slice(0, Math.max(1, Math.min(txt.length, Math.floor((t - l.at) / 0.07) + 1)));
          if (isMain && P.upper) txt = txt.toUpperCase();
          const fs = sz(l);
          const cx = x * width + (l.dx ?? 0) * width;
          // quang sang: loe manh luc vao roi diu (ref08 "THƯỚC ĐO": glow 100% -> ~35% trong 0.6s)
          const glow = isMain ? interpolate(t, [l.at, l.at + 0.12, l.at + 0.75], [0, palette !== "white" ? 1 : 0.6, palette !== "white" ? 0.38 : 0.15], C) : 0;
          const style: React.CSSProperties = {
            fontFamily: isMain ? P.font : "Be Vietnam Pro",
            fontWeight: isMain ? P.weight : l.role === "lead" ? 700 : 800,
            fontStyle: l.italic && !isMain ? "italic" : "normal",
            fontSize: fs,
            letterSpacing: isMain && palette !== "white" ? "0.01em" : "0",
          };
          const T = (fill: string, extra: React.SVGProps<SVGTextElement> = {}) => (
            <text x={0} y={0} textAnchor={anchor} dominantBaseline="central" fill={fill} style={style} {...extra}>{txt}</text>
          );
          const skew = l.italic && isMain ? " skewX(-9)" : "";
          return (
            <g key={i} transform={`translate(${cx + k.tx} ${ys[i] + k.ty}) rotate(${k.rot}) scale(${k.sx} ${k.sy})${skew}`} opacity={k.opacity} style={k.blur > 0.2 ? { filter: `blur(${k.blur}px)` } : undefined}>
              {/* bong toi mem -> doc ro tren nen sang (troi, tuong vang) */}
              <g filter={`url(#sd-${id})`} opacity={isMain ? 0.7 : 0.85} transform="translate(0 5)">{T(P.shade)}</g>
              {glow > 0.01 ? <g filter={`url(#gl-${id})`} opacity={glow}>{T(P.glow)}</g> : null}
              {isMain ? T(`url(#mg-${id})`, { stroke: `url(#mg-${id})`, strokeWidth: fs * 0.028, strokeLinejoin: "round", paintOrder: "stroke" }) : T("#ffffff", { stroke: "#ffffff", strokeWidth: fs * 0.022, strokeLinejoin: "round" })}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Style D: tieu de serif gian chu -> khep (ref09 "DEFINE CAPITALAND"), mau trang nga, nhoe -> net. */
export const SerifTitle: React.FC<{ text: string; at: number; end: number; x?: number; y: number; size?: number; italic?: boolean; color?: string; dur?: number }> = ({
  text, at, end, x = 0.5, y, size = 96, italic = false, color = "#f6f1e7", dur = 1.1,
}) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = f / fps;
  if (t < at || t > end + 0.6) return null;
  const p = interpolate(t, [at, at + dur], [0, 1], { ...C, easing: outCubic });
  const o = interpolate(t, [at, at + dur * 0.6, end, end + 0.5], [0, 1, 1, 0], C);
  const blur = (1 - p) * 10 + interpolate(t, [end, end + 0.5], [0, 8], C);
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <text
        x={x * width}
        y={y * height}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        opacity={o}
        style={{ fontFamily: "Playfair Display", fontWeight: italic ? 700 : 900, fontStyle: italic ? "italic" : "normal", fontSize: size, letterSpacing: `${0.42 - 0.3 * p}em`, filter: `blur(${blur}px) drop-shadow(0 2px 3px rgba(0,0,0,0.7)) drop-shadow(0 6px 18px rgba(0,0,0,0.6))` }}
      >
        {text}
      </text>
    </svg>
  );
};

/** Style D: khung vien manh tu ve (stroke-dashoffset) roi hien 2 dong thong so (ref09 "4PN - 325m2 / 68.000.000.000"). */
export const SpecBox: React.FC<{ top: string; main: string; at: number; end: number; x: number; y: number; w?: number; h?: number }> = ({ top, main, at, end, x, y, w = 470, h = 150 }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = f / fps;
  if (t < at || t > end + 0.5) return null;
  const draw = interpolate(t, [at, at + 0.6], [0, 1], { ...C, easing: outCubic });
  const o = interpolate(t, [at + 0.25, at + 0.6, end, end + 0.45], [0, 1, 1, 0], C);
  const fade = interpolate(t, [end, end + 0.45], [1, 0], C);
  const per = 2 * (w + h);
  const X = x * width - w, Y = y * height - h / 2;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }} opacity={fade}>
      <rect x={X} y={Y} width={w} height={h} rx={10} fill="rgba(0,0,0,0.45)" opacity={o} />
      <rect x={X} y={Y} width={w} height={h} rx={10} fill="none" stroke="#f6f1e7" strokeWidth={2.5} strokeDasharray={per} strokeDashoffset={per * (1 - draw)} />
      <g opacity={o} style={{ filter: `blur(${(1 - o) * 6}px)` }}>
        <text x={X + w / 2} y={Y + h * 0.32} textAnchor="middle" dominantBaseline="central" fill="#f6f1e7" style={{ fontFamily: "Be Vietnam Pro", fontWeight: 700, fontSize: 34, letterSpacing: "0.12em" }}>{top}</text>
        <text x={X + w / 2} y={Y + h * 0.68} textAnchor="middle" dominantBaseline="central" fill="#ffffff" style={{ fontFamily: "Playfair Display", fontWeight: 800, fontSize: 52, letterSpacing: "0.04em" }}>{main}</text>
      </g>
    </svg>
  );
};
