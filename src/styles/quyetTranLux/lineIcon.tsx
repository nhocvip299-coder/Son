/**
 * Icon kieu D (nguoi dung chon): NET MANH VANG TRON, khong khung, di canh chu (Phosphor Icons "thin", MIT).
 * Vao: lo dan tu duoi len (mat na mem) + phong nhe + loe sang; dung: lo lung rat nhe; ra: theo keyframe RA.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LINE_ICONS } from "./lineIcons";
import { kf, type KfIn, type KfOut } from "./keyframes";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const QtLineIcon: React.FC<{ name: string; x: number; y: number; size?: number; at: number; end: number; enter?: KfIn; exit?: KfOut; id: string }> = ({
  name, x, y, size = 200, at, end, enter = "scaleIn", exit = "blurUp", id,
}) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = f / fps;
  const k = kf(enter, exit, t, at, end, fps);
  if (k.hidden) return null;
  const reveal = interpolate(t, [at, at + 0.45], [0, 1], C); // lo tu duoi len
  const flash = interpolate(t, [at + 0.15, at + 0.35, at + 0.8], [0, 1, 0], C);
  const life = t - at;
  const bob = Math.sin(life * 2.2) * 6 * Math.min(1, life / 0.6);
  const cx = x * width + k.tx, cy = y * height + k.ty + bob;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={size * 1.6} height={size * 1.6} viewBox="-48 -48 352 352"
        style={{ position: "absolute", left: cx - size * 0.8, top: cy - size * 0.8, opacity: k.opacity, transform: `scale(${k.sx}) rotate(${k.rot}deg)`,
          filter: `drop-shadow(0 0 ${8 + flash * 16}px rgba(255,214,140,${0.55 + flash * 0.4})) drop-shadow(0 2px 2px rgba(0,0,0,0.75)) drop-shadow(0 6px 10px rgba(0,0,0,0.5))${k.blur > 0.3 ? ` blur(${k.blur}px)` : ""}` }}>
        <defs>
          <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0c4" />
            <stop offset="0.4" stopColor="#dcae52" />
            <stop offset="0.7" stopColor="#a8742a" />
            <stop offset="1" stopColor="#f0cf84" />
          </linearGradient>
          <linearGradient id={`lm-${id}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset={Math.max(0, reveal - 0.15)} stopColor="#fff" stopOpacity="1" />
            <stop offset={Math.min(1, reveal)} stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={`mk-${id}`} maskUnits="userSpaceOnUse" x={-48} y={-48} width={352} height={352}>
            <rect x={-48} y={-48} width={352} height={352} fill={`url(#lm-${id})`} />
          </mask>
        </defs>
        <g mask={`url(#mk-${id})`} fill={`url(#lg-${id})`} dangerouslySetInnerHTML={{ __html: LINE_ICONS.light[name] }} />
      </svg>
    </AbsoluteFill>
  );
};
