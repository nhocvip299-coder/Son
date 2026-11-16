import React from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../lib/fonts";
import { contentWidth } from "../lib/safeZone";
import { extrude, strokeStyle } from "../lib/textFx";
import type { SfxCue, TypoProps } from "../lib/theme";
import { useFrame30 } from "../lib/theme";
import { useFitOneLine } from "../lib/useFit";
import { BandBox } from "./common";

/** Hieu ung 1 — ZOOM PUNCH: tung dong lao tu xa vao man hinh, dap manh + rung camera. */
const STAGGER = 7;
const LAND = 8; // frame spring cham gia tri 1 lan dau

const Line: React.FC<{ line: string; index: number; p: TypoProps }> = ({ line, index, p }) => {
  const frame = useFrame30();
  const { fps, width } = useVideoConfig();
  const font = FONTS[p.theme.fontHeadline];
  const size = useFitOneLine(line, font, 400, contentWidth(width) - 30, 230, {
    textTransform: "uppercase",
  });
  const local = frame - index * STAGGER;
  const s = spring({ frame: local, fps: 30, config: { damping: 11, stiffness: 170, mass: 0.7 } });
  const isAccent = index % 2 === 1;
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        lineHeight: 1.18,
        textTransform: "uppercase",
        color: isAccent ? p.theme.accent : p.theme.text,
        textShadow: extrude(12, p.theme.extrude, { shadow: p.theme.shadow }),
        ...strokeStyle(4, p.theme.stroke),
        opacity: interpolate(local, [0, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        scale: interpolate(s, [0, 1], [2.6, 1]),
        filter: `blur(${interpolate(local, [0, LAND], [10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
      }}
    >
      {line}
    </div>
  );
};

export const ZoomPunch: React.FC<TypoProps> = (p) => {
  const frame = useFrame30();
  const lines = p.text.split("|").map((l) => l.trim());
  // rung camera tat dan sau moi lan "dap"
  const shake = lines.reduce((acc, _l, i) => {
    const since = frame - (i * STAGGER + LAND);
    if (since < 0 || since > 12) return acc;
    const amp = 16 * Math.exp(-since / 3.5);
    return acc + amp;
  }, 0);
  return (
    <BandBox band={p.band ?? "center"} duration={p.duration}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          translate: `${(random(`x${frame}`) - 0.5) * shake}px ${(random(`y${frame}`) - 0.5) * shake}px`,
        }}
      >
        {lines.map((l, i) => (
          <Line key={i} line={l} index={i} p={p} />
        ))}
      </div>
    </BandBox>
  );
};

export const zoomPunchCues = (text: string): SfxCue[] =>
  text.split("|").flatMap((_l, i) => [
    { frame: i * STAGGER - 4, sfx: "whoosh", volume: 0.45 },
    { frame: i * STAGGER + LAND - 1, sfx: "impact", volume: i === 0 ? 0.9 : 0.6 },
  ]);
