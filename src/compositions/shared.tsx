import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import type { SfxCue } from "../lib/theme";

/** Phat danh sach cue SFX (frame tuyet doi). Am thanh duoc dat dung frame voi animation tao ra no. */
export const SfxTrack: React.FC<{ cues: SfxCue[]; master?: number }> = ({ cues, master = 1 }) => (
  <>
    {cues
      .filter((c) => c.frame >= 0)
      .map((c, i) => (
        <Sequence key={i} from={c.frame} name={`SFX ${c.sfx}`} layout="none">
          <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={(c.volume ?? 0.6) * master} />
        </Sequence>
      ))}
  </>
);

/** Lop phu toi lam noi chu + vignette (CSS, khong dong vao pixel video goc). */
export const ContrastOverlay: React.FC<{ vignette: number; scrim?: number }> = ({ vignette, scrim = 0.45 }) => (
  <>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${vignette}) 100%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, rgba(0,0,0,${scrim * 0.5}) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 50%, rgba(0,0,0,${scrim}) 78%, rgba(0,0,0,${scrim * 0.6}) 100%)`,
      }}
    />
  </>
);

/** Nhac nen co fade in/out. */
export const MusicBed: React.FC<{ src: string; volume: number }> = ({ src, volume }) => {
  const { durationInFrames, fps } = useVideoConfig();
  return (
    <Audio
      src={staticFile(src)}
      volume={(f) =>
        interpolate(f, [0, fps * 0.8, durationInFrames - fps * 1.2, durationInFrames], [0, volume, volume, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
  );
};

export const useKenBurns = (from = 1.0, to = 1.08) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [0, durationInFrames], [from, to]);
};
