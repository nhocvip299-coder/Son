import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../lib/fonts";
import { contentWidth } from "../lib/safeZone";
import { neonShadow } from "../lib/textFx";
import type { SfxCue, TypoProps } from "../lib/theme";
import { useFrame30 } from "../lib/theme";
import { useFitOneLine } from "../lib/useFit";
import { BandBox } from "./common";

/** Hieu ung 5 — NEON GLITCH HOLOGRAM: chu neon nhap nhay khi bat, tach kenh RGB, scanline. */
const GLITCH_WINDOWS: Array<[number, number]> = [
  [0, 10],
  [38, 46],
];
const inGlitch = (f: number) => GLITCH_WINDOWS.some(([a, b]) => f >= a && f < b);

const NeonLine: React.FC<{ line: string; i: number; p: TypoProps }> = ({ line, i, p }) => {
  const frame = useFrame30();
  const { fps, width } = useVideoConfig();
  const font = FONTS.tech;
  const size = useFitOneLine(line, font, 700, contentWidth(width) - 60, 150, {
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  });
  const g = inGlitch(frame);
  const jx = g ? (random(`gx${frame}${i}`) - 0.5) * 34 : 0;
  const flicker = frame < 12 ? (random(`f${frame}${i}`) > 0.45 ? 1 : 0.15) : 1;
  const breathe = 0.85 + 0.15 * Math.sin(frame / 6);
  const s = spring({ frame: frame - i * 4, fps: 30, config: { damping: 200 } });
  const base: React.CSSProperties = {
    fontFamily: font,
    fontWeight: 700,
    fontSize: size,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    lineHeight: 1.1,
    whiteSpace: "nowrap",
  };
  const color = i % 2 ? "#FF2BD6" : p.theme.neon;
  return (
    <div style={{ position: "relative", opacity: flicker * s, translate: `${jx}px 0px` }}>
      {g ? (
        <>
          <div style={{ ...base, position: "absolute", inset: 0, color: "rgba(255,0,60,0.8)", translate: "-8px 0px", mixBlendMode: "screen" }}>
            {line}
          </div>
          <div style={{ ...base, position: "absolute", inset: 0, color: "rgba(0,255,255,0.8)", translate: "8px 0px", mixBlendMode: "screen" }}>
            {line}
          </div>
        </>
      ) : null}
      <div style={{ ...base, position: "relative", color: "#F5FEFF", textShadow: neonShadow(color, breathe) }}>{line}</div>
    </div>
  );
};

export const NeonGlitch: React.FC<TypoProps> = (p) => {
  const frame = useFrame30();
  const { fps } = useVideoConfig();
  const dur30 = (p.duration * 30) / fps;
  const lines = p.text.split("|").map((l) => l.trim());
  const g = inGlitch(frame);
  return (
    <>
      <AbsoluteFill
        style={{
          background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 2px, transparent 2px, transparent 6px)",
          opacity: interpolate(frame, [0, 8, dur30 - 8, dur30], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: `0px ${Math.floor(frame * 2) % 6}px`,
        }}
      />
      <BandBox band={p.band ?? "center"} duration={p.duration}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            padding: "40px 50px",
            border: `3px solid ${p.theme.neon}`,
            borderRadius: 18,
            boxShadow: `0 0 30px ${p.theme.neon}, inset 0 0 30px ${p.theme.neon}55`,
            background: "rgba(0,10,25,0.35)",
            clipPath: g
              ? `inset(${Math.floor(random(`c${frame}`) * 30)}% 0 ${Math.floor(random(`d${frame}`) * 30)}% 0)`
              : undefined,
          }}
        >
          {lines.map((l, i) => (
            <NeonLine key={i} line={l} i={i} p={p} />
          ))}
        </div>
      </BandBox>
    </>
  );
};

export const neonGlitchCues = (): SfxCue[] => [
  { frame: 0, sfx: "glitch", volume: 0.7 },
  { frame: 12, sfx: "sparkle", volume: 0.45 },
  { frame: GLITCH_WINDOWS[1][0], sfx: "glitch", volume: 0.55 },
];
