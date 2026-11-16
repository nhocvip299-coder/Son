import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import type { SfxCue } from "../lib/theme";
import { getStyle } from "../styles/registry";
import { EFFECTS } from "../typography";
import { KaraokeCaptions } from "../typography/KaraokeCaptions";
import type { EditPlan } from "./plan";
import { ContrastOverlay, MusicBed, SfxTrack } from "./shared";

/**
 * Dung video tu dong bang Remotion:
 * - Moi doan giu lai cua video goc la 1 <Sequence> + <Video trimBefore/trimAfter> (cat theo nhip loi noi)
 * - Zoom luan phien sau moi cat de an jump-cut, co "punch" nhe dau doan
 * - Phu de karaoke trong band duoi, tieu de nhan manh trong band tren -> khong chong cheo
 * - SFX lay tu cue cua chinh hieu ung + whoosh tai diem cat
 */
const Segment: React.FC<{ src: string; startMs: number; endMs: number; zoom: number; hasAudio: boolean; grade: string }> = ({
  src,
  startMs,
  endMs,
  zoom,
  hasAudio,
  grade,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        filter: grade,
        scale: interpolate(frame, [0, 6], [zoom * 1.03, zoom], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        }),
      }}
    >
      <Video
        src={staticFile(src)}
        trimBefore={Math.round((startMs / 1000) * fps)}
        trimAfter={Math.round((endMs / 1000) * fps)}
        muted={!hasAudio}
        objectFit="cover"
      />
    </AbsoluteFill>
  );
};

export const AutoEdit: React.FC<{ plan: EditPlan }> = ({ plan }) => {
  const { fps } = useVideoConfig();
  const style = getStyle(plan.style);
  const theme = style.theme;
  const g = style.grade;
  const grade = `contrast(${g.contrast}) saturate(${g.saturate}) brightness(${g.brightness})`;
  const toF = (ms: number) => Math.round((ms / 1000) * fps);

  let cursor = 0;
  const segs = plan.segments.map((s) => {
    const from = cursor;
    const dur = toF(s.srcEndMs) - toF(s.srcStartMs);
    cursor += dur;
    return { ...s, from, dur };
  });

  const cues: SfxCue[] = [
    ...plan.sfx.map((s) => ({ frame: toF(s.atMs), sfx: s.sfx, volume: s.volume })),
    ...plan.titles.flatMap((t) =>
      EFFECTS[t.effect].cues(t.text).map((c) => ({ ...c, frame: toF(t.startMs) + Math.round((c.frame * fps) / 30) })),
    ),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {segs.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur} name={`Cut ${i + 1}`}>
          <Segment src={plan.source} startMs={s.srcStartMs} endMs={s.srcEndMs} zoom={s.zoom} hasAudio={plan.sourceHasAudio} grade={grade} />
        </Sequence>
      ))}
      <ContrastOverlay vignette={g.vignette} />
      {style.captions.enabled ? (
        <KaraokeCaptions captions={plan.captions} theme={theme} combineMs={style.captions.combineMs} uppercase={style.captions.uppercase} />
      ) : null}
      {plan.titles.map((t, i) => {
        const { Component } = EFFECTS[t.effect];
        return (
          <Sequence key={i} from={toF(t.startMs)} durationInFrames={toF(t.durationMs)} name={`Title: ${t.text}`}>
            <Component text={t.text} duration={toF(t.durationMs)} theme={theme} band={style.captions.enabled ? "headline" : "center"} />
          </Sequence>
        );
      })}
      {plan.music ? <MusicBed src={plan.music} volume={style.sfx.musicVolume} /> : null}
      <SfxTrack cues={cues} master={style.sfx.volume} />
    </AbsoluteFill>
  );
};
