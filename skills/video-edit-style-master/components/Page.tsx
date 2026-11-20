import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, random, staticFile, useVideoConfig } from "remotion";
import { VESM } from "../presets/style";
import { CL, useLocal } from "./core";

/** NỀN KÍNH TEAL: chính video làm nhoè + phủ teal + vệt sáng rơi dọc + hạt sáng + vòng tròn mờ. [XM 9–14 s, 41–60 s] */
export const GlassPage: React.FC<{ src: string; from: number; ring?: boolean }> = ({ src, from, ring = true }) => {
  const { t, dur, width, height } = useLocal();
  const { fps } = useVideoConfig();
  const o = Math.min(interpolate(t, [0, 0.2], [0, 1], CL), interpolate(t, [dur - 0.3, dur], [1, 0], CL));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ filter: "blur(26px) brightness(0.62) saturate(1.2)", transform: "scale(1.15)" }}>
        <OffthreadVideo src={staticFile(src)} trimBefore={Math.round(from * fps)} muted />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${VESM.color.pageTop} 0%, ${VESM.color.pageMid} 45%, ${VESM.color.pageBot} 100%)` }} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {ring ? <circle cx={width / 2} cy={height * 0.42} r={360 + t * 25} fill="none" stroke={VESM.color.glassEdge} strokeWidth={2} opacity={0.2} /> : null}
        {Array.from({ length: 44 }, (_, i) => {
          const x = random(`r-x${i}`) * width, len = 40 + random(`r-l${i}`) * 160, sp = 60 + random(`r-s${i}`) * 140;
          const y = ((random(`r-y${i}`) * height + t * sp) % (height + len)) - len;
          return <line key={i} x1={x} y1={y} x2={x} y2={y + len} stroke={VESM.color.glassEdge} strokeWidth={1.6} opacity={0.15 + 0.45 * random(`r-a${i}`)} strokeLinecap="round" />;
        })}
        {Array.from({ length: 36 }, (_, i) => {
          const per = 1 + random(`d-p${i}`) * 1.5, u = ((t + random(`d-f${i}`) * per) % per) / per;
          return <circle key={`d${i}`} cx={random(`d-x${i}`) * width} cy={random(`d-y${i}`) * height} r={1.5 + random(`d-r${i}`) * 2.5} fill="#cffff8" opacity={Math.sin(u * Math.PI) * 0.8} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
