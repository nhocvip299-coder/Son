import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../lib/fonts";
import { contentWidth } from "../lib/safeZone";
import { extrude } from "../lib/textFx";
import { parseEmphasis, type SfxCue, type TypoProps } from "../lib/theme";
import { useFrame30 } from "../lib/theme";
import { useFitOneLine } from "../lib/useFit";
import { BandBox } from "./common";

/** Hieu ung 3 — SLIDE MASK REVEAL: tung dong truot len tu sau mat na, thanh accent quet ngang. */
const STAGGER = 8;
const DUR = 16;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const Row: React.FC<{ line: string; i: number; p: TypoProps }> = ({ line, i, p }) => {
  const frame = useFrame30();
  const { width } = useVideoConfig();
  const font = FONTS[p.theme.fontCaption];
  const plain = line.replace(/\*/g, "");
  const size = useFitOneLine(plain, font, 900, contentWidth(width) - 40, 130);
  const local = frame - i * STAGGER;
  const words = parseEmphasis(line);
  return (
    <div style={{ overflow: "hidden", paddingBottom: 18, paddingRight: 18 }}>
      <div
        style={{
          fontFamily: font,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.08,
          color: p.theme.text,
          textShadow: extrude(7, "#1b1b1b", { shadow: p.theme.shadow }),
          translate: `0px ${interpolate(local, [0, DUR], [110, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          })}%`,
          rotate: `${interpolate(local, [0, DUR], [6, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          })}deg`,
        }}
      >
        {words.map((w, k) => (
          <span key={k} style={{ color: w.em ? p.theme.accent : undefined }}>
            {w.word}
            {k < words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

export const SlideMask: React.FC<TypoProps> = (p) => {
  const frame = useFrame30();
  const lines = p.text.split("|").map((l) => l.trim());
  const barStart = lines.length * STAGGER + 4;
  return (
    <BandBox band={p.band ?? "center"} duration={p.duration}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div
          style={{
            height: 14,
            width: 260,
            marginBottom: 22,
            borderRadius: 7,
            background: p.theme.accent,
            boxShadow: `0 6px 18px ${p.theme.shadow}`,
            transformOrigin: "left center",
            scale: `${interpolate(frame, [barStart, barStart + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            })} 1`,
          }}
        />
        {lines.map((l, i) => (
          <Row key={i} line={l} i={i} p={p} />
        ))}
      </div>
    </BandBox>
  );
};

export const slideMaskCues = (text: string): SfxCue[] => {
  const n = text.split("|").length;
  return [
    ...Array.from({ length: n }, (_, i) => ({ frame: i * STAGGER - 2, sfx: "swoosh-down" as const, volume: 0.5 })),
    { frame: n * STAGGER + 4, sfx: "click", volume: 0.6 },
  ];
};
