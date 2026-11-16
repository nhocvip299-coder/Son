import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../lib/fonts";
import { contentWidth } from "../lib/safeZone";
import { extrude, strokeStyle } from "../lib/textFx";
import { parseEmphasis, stripMarks, type SfxCue, type TypoProps } from "../lib/theme";
import { useFrame30 } from "../lib/theme";
import { useFitLines } from "../lib/useFit";
import { BandBox } from "./common";

/** Hieu ung 2 — POP BOUNCE 3D: tung tu nay len voi do nay (overshoot), tu nhan manh co khoi 3D mau. */
const STAGGER = 5;

export const PopBounce: React.FC<TypoProps> = (p) => {
  const frame = useFrame30();
  const { fps, width } = useVideoConfig();
  const words = parseEmphasis(p.text);
  const font = FONTS[p.theme.fontCaption];
  const size = useFitLines(stripMarks(p.text), font, 900, contentWidth(width) - 60, 150, 3, "uppercase");
  return (
    <BandBox band={p.band ?? "center"} duration={p.duration}>
      <div
        style={{
          width: contentWidth(width),
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: size * 0.28,
          rowGap: size * 0.1,
        }}
      >
        {words.map((w, i) => {
          const local = frame - i * STAGGER;
          const s = spring({ frame: local, fps: 30, config: { damping: 8, stiffness: 200, mass: 0.6 } });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: font,
                fontWeight: 900,
                fontSize: size,
                lineHeight: 1.1,
                textTransform: "uppercase",
                color: w.em ? p.theme.accent : p.theme.text,
                textShadow: extrude(w.em ? 14 : 8, w.em ? p.theme.extrude : "#1a1a1a", {
                  shadow: p.theme.shadow,
                }),
                ...strokeStyle(3, p.theme.stroke),
                opacity: interpolate(local, [0, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                scale: interpolate(s, [0, 1], [0.2, 1]),
                translate: `0px ${interpolate(s, [0, 1], [60, 0])}px`,
                rotate: `${interpolate(s, [0, 1], [i % 2 ? 12 : -12, w.em ? -3 : 0])}deg`,
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </BandBox>
  );
};

export const popBounceCues = (text: string): SfxCue[] =>
  parseEmphasis(text).map((w, i) => ({
    frame: i * STAGGER + 1,
    sfx: w.em ? "impact" : "pop",
    volume: w.em ? 0.55 : 0.5,
  }));
