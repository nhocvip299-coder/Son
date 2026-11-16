import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../lib/fonts";
import { contentWidth } from "../lib/safeZone";
import { extrude, strokeStyle } from "../lib/textFx";
import { parseEmphasis, stripMarks, type SfxCue, type TypoProps } from "../lib/theme";
import { useFrame30 } from "../lib/theme";
import { useFitLines } from "../lib/useFit";
import { BandBox } from "./common";

/** Hieu ung 4 — TYPEWRITER + HIGHLIGHT: go tung ky tu kem con tro, sau do but da quang to tu khoa. */
const CPF = 1.4; // ky tu moi frame
const typedEnd = (text: string) => Math.ceil(stripMarks(text).length / CPF);
const HL_DELAY = 6;
const HL_DUR = 10;

export const TypewriterHighlight: React.FC<TypoProps> = (p) => {
  const frame = useFrame30();
  const { width } = useVideoConfig();
  const font = FONTS[p.theme.fontCaption];
  const words = parseEmphasis(p.text);
  const size = useFitLines(stripMarks(p.text), font, 800, contentWidth(width) - 80, 120, 3);
  const shown = Math.floor(frame * CPF);
  const hlStart = typedEnd(p.text) + HL_DELAY;
  const hl = interpolate(frame, [hlStart, hlStart + HL_DUR], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  let used = 0;
  const caretOn = Math.floor(frame / 8) % 2 === 0 || shown < stripMarks(p.text).length;
  return (
    <BandBox band={p.band ?? "center"} duration={p.duration}>
      <div
        style={{
          width: contentWidth(width),
          textAlign: "center",
          fontFamily: font,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.25,
          color: p.theme.text,
        }}
      >
        {words.map((w, i) => {
          const sep = i < words.length - 1 ? " " : "";
          const visible = Math.max(0, Math.min(w.word.length, shown - used));
          used += w.word.length + sep.length;
          const txt = w.word.slice(0, visible);
          const isLastTyped = visible > 0 && visible < w.word.length;
          return (
            <React.Fragment key={i}>
              <span style={{ position: "relative", display: "inline-block", whiteSpace: "pre" }}>
                {w.em ? (
                  <span
                    style={{
                      position: "absolute",
                      left: -10,
                      right: -10,
                      top: "12%",
                      bottom: "4%",
                      background: p.theme.accent,
                      borderRadius: 10,
                      transformOrigin: "left center",
                      scale: `${hl} 1`,
                      rotate: "-1.5deg",
                      boxShadow: `0 10px 26px ${p.theme.shadow}`,
                    }}
                  />
                ) : null}
                <span
                  style={{
                    position: "relative",
                    color: w.em && hl > 0.5 ? p.theme.accentText : p.theme.text,
                    textShadow: w.em && hl > 0.5 ? "none" : extrude(6, "#151515", { shadow: p.theme.shadow }),
                    ...(w.em && hl > 0.5 ? {} : strokeStyle(2, p.theme.stroke)),
                  }}
                >
                  {txt}
                </span>
                {isLastTyped ? <Caret on color={p.theme.accent} /> : null}
              </span>
              {visible === w.word.length && sep ? " " : ""}
            </React.Fragment>
          );
        })}
        {shown >= stripMarks(p.text).length ? <Caret on={caretOn} color={p.theme.accent} /> : null}
      </div>
    </BandBox>
  );
};

const Caret: React.FC<{ on: boolean; color: string }> = ({ on, color }) => (
  <span
    style={{
      display: "inline-block",
      width: "0.08em",
      height: "0.9em",
      marginLeft: "0.05em",
      verticalAlign: "-0.1em",
      background: color,
      opacity: on ? 1 : 0,
    }}
  />
);

export const typewriterCues = (text: string): SfxCue[] => {
  const end = typedEnd(text);
  const cues: SfxCue[] = [];
  for (let f = 0; f < end; f += 24) cues.push({ frame: f, sfx: "typing", volume: 0.55 });
  cues.push({ frame: end + HL_DELAY, sfx: "ding", volume: 0.5 });
  return cues;
};
