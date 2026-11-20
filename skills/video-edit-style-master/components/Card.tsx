import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, staticFile, useVideoConfig } from "remotion";
import { VESM } from "../presets/style";
import { backOut, CL, exitK, outCubic, useLocal } from "./core";

/** THẺ KÍNH: video trong khung bo góc viền neon bật từ nhỏ -> to; tiêu đề chữ ký đè góc trên-trái; chip ✓ hiện lần lượt. [XM 45,8–60 s] */
export const GlassCard: React.FC<{ src: string; from: number; title: string; chips?: string[]; chipsAt?: number; caption?: string; y?: number }> = ({ src, from, title, chips = [], chipsAt = 0.8, caption, y = 0.44 }) => {
  const { t, dur, width, height } = useLocal();
  const { fps } = useVideoConfig();
  const a = interpolate(t, [0, 0.35], [0, 1], { ...CL, easing: backOut });
  const ex = exitK(t, dur);
  const W = 640, H = 860, X = (width - W) / 2, Y = y * height - H / 2;
  const tw = interpolate(t, [0.3, 0.3 + VESM.time.scriptWrite], [0, 1], { ...CL, easing: outCubic });
  return (
    <AbsoluteFill style={{ opacity: 1 - ex }}>
      <div style={{ position: "absolute", left: X, top: Y, width: W, height: H, borderRadius: 34, overflow: "hidden", border: `4px solid ${VESM.color.glassEdge}`,
        boxShadow: `0 0 26px ${VESM.color.neon}aa, 0 0 70px ${VESM.color.neon}44, 0 20px 50px rgba(0,0,0,0.55)`, transform: `scale(${0.55 + 0.45 * a})`, opacity: Math.min(1, a * 1.4) }}>
        <OffthreadVideo src={staticFile(src)} trimBefore={Math.round(from * fps)} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.04 + t * 0.02})` }} />
      </div>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g style={{ clipPath: `inset(0 ${(1 - tw) * 100}% 0 0)` }}>
          <text x={X - 10} y={Y + 10} dominantBaseline="central" fill="#fff" transform={`rotate(-6 ${X} ${Y})`} style={{ fontFamily: VESM.font.script, fontSize: 104, filter: `drop-shadow(0 0 10px ${VESM.color.neon}) drop-shadow(0 3px 4px rgba(0,0,0,0.7))` }}>{title}</text>
        </g>
        {caption ? <text x={width / 2} y={Y + H + 40} textAnchor="middle" dominantBaseline="central" fill="#fff" opacity={interpolate(t, [0.6, 0.9], [0, 1], CL)} style={{ fontFamily: VESM.font.sans, fontWeight: 500, fontSize: 30 }}>{caption}</text> : null}
      </svg>
      {chips.map((s, i) => {
        const c = interpolate(t, [chipsAt + i * VESM.time.chipStep, chipsAt + i * VESM.time.chipStep + 0.3], [0, 1], { ...CL, easing: backOut });
        return (
          <div key={i} style={{ position: "absolute", left: X + 24, top: Y + H - 70 - (chips.length - 1 - i) * 70, opacity: Math.min(1, c * 1.5), transform: `translateX(${(1 - c) * -40}px) scale(${0.75 + 0.25 * c})`, transformOrigin: "left center",
            display: "flex", alignItems: "center", gap: 12, padding: "8px 22px 8px 10px", borderRadius: 30, background: "rgba(2,26,30,0.85)", border: `2px solid ${VESM.color.glassEdge}` }}>
            <div style={{ width: 34, height: 34, borderRadius: 17, border: "2.5px solid #fff", display: "grid", placeItems: "center" }}>
              <svg width={20} height={20} viewBox="0 0 24 24"><path d="M5 12.5 L10 17 L19 7" stroke="#fff" strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ fontFamily: VESM.font.sans, fontWeight: 700, fontSize: 30, color: "#fff", whiteSpace: "nowrap" }}>{s}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
