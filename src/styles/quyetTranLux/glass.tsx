/**
 * v5 — Chu "am ban / trong suot co mau" SAC NET, KHONG RANG CUA.
 * Vi sao v4 bi rang cua: CSS clip-path (url #clipPath) la cat NHI PHAN (khong khu rang cua) + bat/tat tung ky tu.
 * v5: ve chu bang SVG <text> to GRADIENT TRUC TIEP (trinh duyet khu rang cua mep chu), lop sang/anh kim la gradient
 * chuyen dong (gradientTransform), chuyen TRANG -> MAU bang MAT NA gradient mem quet trai->phai (khong nac).
 * Vao/ra: keyframe da dang theo tham so `enter`/`exit` (xem KEYFRAMES trong keyframes.ts).
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { QT } from "./components";
import { kf, type KfIn, type KfOut } from "./keyframes";

export type GlassTint = "gold" | "teal" | "pearl";
const STOPS: Record<GlassTint, [string, string, string, string, string]> = {
  gold: ["#7a4a12", "#d79a2b", "#ffe39a", "#fff8e6", "#b8741a"],
  teal: ["#0d5563", "#22b8c6", "#9ff7ef", "#ffffff", "#118096"],
  pearl: ["#8d8a80", "#d9d4c4", "#f5f1e6", "#ffffff", "#b7b1a0"],
};

export const QtGlassText: React.FC<{
  lines: string[];
  lineAt: number[]; // giay (tuong doi) moi dong vao
  end: number; // giay bat dau thoat
  x?: number; // tam ngang (ti le W)
  y: number; // tam dong dau (ti le H)
  size?: number;
  gap?: number; // khoang cach dong (x co chu)
  rot?: number[];
  dx?: number[];
  enter?: KfIn[]; // kieu vao tung dong
  exit?: KfOut;
  tint?: GlassTint;
  weight?: number;
  id: string;
}> = ({ lines, lineAt, end, x = 0.5, y, size = 170, gap = 1.0, rot, dx, enter, exit = "blurUp", tint = "gold", weight = 900, id }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = f / fps;
  const S = STOPS[tint];
  const sizes = lines.map((l) => Math.min(size, (width * 0.9) / (Math.max(3, l.length) * 0.72)));
  const cy = (i: number) => y * height + lines.slice(0, i).reduce((a, _l, k) => a + sizes[k] * gap, 0);
  const shift = ((t * 0.35) % 1) * 2 - 0.5; // anh kim chay
  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id={`g-${id}`} gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0.35" gradientTransform={`translate(${shift} 0)`} spreadMethod="reflect">
            <stop offset="0" stopColor={S[0]} />
            <stop offset="0.28" stopColor={S[1]} />
            <stop offset="0.46" stopColor={S[2]} />
            <stop offset="0.52" stopColor={S[3]} />
            <stop offset="0.62" stopColor={S[1]} />
            <stop offset="1" stopColor={S[4]} />
          </linearGradient>
          <linearGradient id={`v-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.25" />
          </linearGradient>
          <filter id={`glow-${id}`} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
        {lines.map((l, i) => {
          const k = kf(enter?.[i] ?? "riseUp", exit, t, lineAt[i], end, fps);
          if (k.hidden) return null;
          // TRANG -> MAU: mat na gradient mem quet trai->phai trong 0.45s sau khi vao
          const wipe = interpolate(t, [lineAt[i] + 0.15, lineAt[i] + 0.5], [-0.25, 1.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const cx = x * width + (dx?.[i] ?? 0) * width;
          const tr = `translate(${cx + k.tx} ${cy(i) + k.ty}) rotate(${(rot?.[i] ?? 0) + k.rot}) scale(${k.sx} ${k.sy})`;
          const txt = (fill: string, extra: React.SVGProps<SVGTextElement> = {}) => (
            <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fill={fill} style={{ fontFamily: QT.font, fontWeight: weight, fontSize: sizes[i], letterSpacing: "0.005em" }} {...extra}>
              {l}
            </text>
          );
          return (
            <g key={i} transform={tr} opacity={k.opacity} style={k.blur > 0.2 ? { filter: `blur(${k.blur}px)` } : undefined}>
              <defs>
                <linearGradient id={`w-${id}-${i}`} gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
                  {/* ben TRAI vet quet = da len mau (1), ben phai = con trang (0) */}
                  <stop offset={Math.min(1, Math.max(0, wipe - 0.18))} stopColor="#fff" stopOpacity="1" />
                  <stop offset={Math.min(1, Math.max(0, wipe))} stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <mask id={`m-${id}-${i}`} maskUnits="userSpaceOnUse" x={-width} y={-height} width={width * 2} height={height * 2}>
                  {txt(`url(#w-${id}-${i})`)}
                </mask>
              </defs>
              {/* quang sang cung mau */}
              <g filter={`url(#glow-${id})`} opacity={0.55}>{txt(S[2])}</g>
              {/* lop TRANG (luc moi vao) */}
              {txt("#fffdf6")}
              {/* lop MAU anh kim, lo dan theo mat na mem */}
              <g mask={`url(#m-${id}-${i})`}>
                {txt(`url(#g-${id})`)}
                {txt(`url(#v-${id})`)}
              </g>
              {/* (bo vien stroke: font co duong vien chong lan -> hien net mo trong chu A, Ô) */}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
