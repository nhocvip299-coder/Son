import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { DEFAULT_THEME, type SfxCue } from "../lib/theme";
import { EFFECTS, type EffectName } from "../typography";
import { ContrastOverlay, MusicBed, SfxTrack } from "./shared";

/** Kich ban demo 15s: 5 hieu ung typography khac nhau, moi canh 3s, khong chong lan. */
const SCENES: Array<{ effect: EffectName; text: string; theme?: Partial<typeof DEFAULT_THEME> }> = [
  { effect: "zoomPunch", text: "Dựng video | bằng AI" },
  { effect: "popBounce", text: "Chữ *nổi* 3D có *chiều sâu*" },
  { effect: "slideMask", text: "Chuyển động *mượt* | có nhấn nhá | đúng nhịp", theme: { accent: "#FF4D8D" } },
  { effect: "typewriter", text: "Phụ đề khớp *từng từ* theo giọng nói", theme: { accent: "#3DDC97", accentText: "#06140D" } },
  { effect: "neonGlitch", text: "Cyberpunk | Hologram", theme: { neon: "#00E5FF" } },
];
export const SCENE_SECONDS = 3;

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          scale: interpolate(frame, [0, durationInFrames], [1.0, 1.12]),
          filter: "contrast(1.05) saturate(1.1)",
        }}
      >
        <Video src={staticFile("demo/bg.mp4")} muted objectFit="cover" />
      </AbsoluteFill>
      <ContrastOverlay vignette={0.55} scrim={0.35} />
    </AbsoluteFill>
  );
};

export const Demo: React.FC = () => {
  const { fps } = useVideoConfig();
  const len = SCENE_SECONDS * fps;
  const cues: SfxCue[] = SCENES.flatMap((s, i) =>
    EFFECTS[s.effect].cues(s.text).map((c) => ({ ...c, frame: Math.round(i * len + (c.frame * fps) / 30) })),
  );
  // riser dan vao canh cuoi
  cues.push({ frame: 4 * len - Math.round(1.2 * fps), sfx: "riser", volume: 0.35 });
  return (
    <AbsoluteFill>
      <Background />
      {SCENES.map((s, i) => {
        const { Component } = EFFECTS[s.effect];
        return (
          <Sequence key={i} from={i * len} durationInFrames={len} name={`${i + 1}. ${EFFECTS[s.effect].label}`}>
            <Component text={s.text} duration={len} theme={{ ...DEFAULT_THEME, ...s.theme }} />
          </Sequence>
        );
      })}
      <MusicBed src="music/bed-ambient.wav" volume={0.22} />
      <SfxTrack cues={cues} />
    </AbsoluteFill>
  );
};
