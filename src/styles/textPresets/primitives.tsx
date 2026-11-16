/**
 * Primitives cho bo "Text Presets" (hoc tu video quang cao 40 Text Presets CapCut).
 * Moi timing tinh theo frame@30 (useFrame30) -> chay dung o 30/60 FPS.
 * [XM] da xac minh tren khung hinh (0.1s/khung) · [UD] uoc doan.
 */
import React from "react";
import { Easing, interpolate, random } from "remotion";
import { evolvePath } from "@remotion/paths";
import { useFrame30 } from "../../lib/theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** Gradient doc + glow cung tong mau [XM]. Padding de khong cat dau tieng Viet. */
export const glowFill = (top: string, bottom: string, glow: string, strength = 1): React.CSSProperties => ({
  backgroundImage: `linear-gradient(180deg, ${top}, ${bottom})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  paddingTop: "0.3em",
  marginTop: "-0.3em",
  paddingBottom: "0.1em",
  marginBottom: "-0.1em",
  filter: `drop-shadow(0 0 ${6 * strength}px ${glow}) drop-shadow(0 0 ${16 * strength}px ${glow}88)`,
});

export const solidGlow = (color: string, glow: string, strength = 1): React.CSSProperties => ({
  color,
  textShadow: `0 0 ${5 * strength}px ${glow}, 0 0 ${14 * strength}px ${glow}, 0 0 ${28 * strength}px ${glow}88`,
});

type Base = { delay?: number; style?: React.CSSProperties; children: string };

/** [XM] Tracking-in: gian chu rong -> binh thuong + mo dan ("Bat dong san", "Khoa Hoc"). */
export const TrackIn: React.FC<Base & { dur?: number; from?: number }> = ({ delay = 0, dur = 14, from = 0.55, style, children }) => {
  const f = useFrame30() - delay;
  const p = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: easeOut });
  return (
    <span style={{ display: "inline-block", whiteSpace: "pre", letterSpacing: `${interpolate(p, [0, 1], [from, 0])}em`, opacity: interpolate(f, [0, 4], [0, 1], clamp), filter: `blur(${interpolate(p, [0, 1], [4, 0])}px)`, ...style }}>
      {children}
    </span>
  );
};

/** [XM] Hien tung ky tu trai->phai, moi ky tu bat nhe ("CAN HO CAO CAP", "Tang cao"). */
/** Tach style: phan "to mau chu" (gradient clip, glow) phai dat tren TUNG ky tu, vi background-clip:text khong truyen xuong con inline-block. */
const PAINT = ["backgroundImage", "WebkitBackgroundClip", "backgroundClip", "color", "filter", "textShadow"] as const;
export const splitPaint = (style: React.CSSProperties = {}) => {
  const paint: React.CSSProperties = {};
  const wrap: React.CSSProperties = { ...style };
  const clipText = style.backgroundClip === "text";
  for (const k of PAINT) {
    if (k in wrap) {
      (paint as Record<string, unknown>)[k] = wrap[k];
      delete wrap[k];
    }
  }
  if (clipText) {
    // cho cho dau tieng Viet nam trong vung to gradient cua tung ky tu
    paint.paddingTop = "0.3em";
    paint.marginTop = "-0.3em";
    paint.paddingBottom = "0.1em";
    paint.marginBottom = "-0.1em";
    if (wrap.paddingTop === "0.3em") delete wrap.paddingTop;
    if (wrap.paddingBottom === "0.1em") delete wrap.paddingBottom;
    if (wrap.marginTop === "-0.3em") delete wrap.marginTop;
    if (wrap.marginBottom === "-0.1em") delete wrap.marginBottom;
  }
  return { paint, wrap };
};

export const CharPop: React.FC<Base & { every?: number; charStyle?: React.CSSProperties }> = ({ delay = 0, every = 1.2, style, charStyle, children }) => {
  const f = useFrame30() - delay;
  const { paint, wrap } = splitPaint(style);
  return (
    <span style={{ display: "inline-block", whiteSpace: "pre", ...wrap }}>
      {[...children].map((c, i) => {
        const l = f - i * every;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(l, [0, 2], [0, 1], clamp),
              scale: interpolate(l, [0, 3, 6], [1.6, 0.92, 1], clamp),
              translate: `0 ${interpolate(l, [0, 4], [-0.15, 0], { ...clamp, easing: easeOut })}em`,
              ...paint,
              ...charStyle,
            }}
          >
            {c}
          </span>
        );
      })}
    </span>
  );
};

/** [XM] Glitch: ky tu nhay lech + tach RGB roi on dinh ("50 TRIEU", chip "KOKI TRENDY"). */
export const GlitchChars: React.FC<Base & { settle?: number; every?: number }> = ({ delay = 0, settle = 10, every = 1, style, children }) => {
  const f = useFrame30() - delay;
  const { paint, wrap } = splitPaint(style);
  return (
    <span style={{ display: "inline-block", whiteSpace: "pre", ...wrap }}>
      {[...children].map((c, i) => {
        const l = f - i * every;
        const active = l >= 0 && l < settle;
        const k = Math.floor(f);
        const dx = active ? (random(`gx${i}-${k}`) - 0.5) * 0.25 : 0;
        const dy = active ? (random(`gy${i}-${k}`) - 0.5) * 0.12 : 0;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: l < 0 ? 0 : active && random(`go${i}-${k}`) < 0.25 ? 0.2 : 1,
              translate: `${dx}em ${dy}em`,
              ...paint,
              ...(active ? { textShadow: `${-0.06}em 0 rgba(255,0,80,0.9), ${0.06}em 0 rgba(0,240,255,0.9)` } : {}),
            }}
          >
            {c}
          </span>
        );
      })}
    </span>
  );
};

/** [XM] Chu viet tay hien dan trai->phai (wipe) ("4 mua", "Tiet kiem", "Dang song"). */
export const ScriptWipe: React.FC<Base & { dur?: number }> = ({ delay = 0, dur = 14, style, children }) => {
  const f = useFrame30() - delay;
  const p = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <span style={{ display: "inline-block", whiteSpace: "pre", clipPath: `inset(-40% ${(1 - p) * 100}% -40% -5%)`, ...style }}>
      {children}
    </span>
  );
};

/** [XM] Duong ve dan: gach chan cong (swoosh), gach ngang, vien elip. */
export const DrawPath: React.FC<{ d: string; width: number; height: number; delay?: number; dur?: number; stroke: string; strokeWidth?: number; glow?: string; style?: React.CSSProperties }> = ({
  d,
  width,
  height,
  delay = 0,
  dur = 12,
  stroke,
  strokeWidth = 4,
  glow,
  style,
}) => {
  const f = useFrame30() - delay;
  const p = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const { strokeDasharray, strokeDashoffset } = evolvePath(p, d);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible", ...style }}>
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} style={{ filter: glow ? `drop-shadow(0 0 6px ${glow})` : undefined, opacity: p > 0 ? 1 : 0 }} />
    </svg>
  );
};

/** Hop/chip mo rong theo chieu ngang [XM chip "Vi Tri", "KOKI TRENDY" / UD easing]. */
export const ChipBox: React.FC<{ delay?: number; dur?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay = 0, dur = 8, style, children }) => {
  const f = useFrame30() - delay;
  const p = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ display: "inline-block", transformOrigin: "left center", scale: `${p} 1`, opacity: p > 0 ? 1 : 0, ...style }}>
      {children}
    </div>
  );
};
