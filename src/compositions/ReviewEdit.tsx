import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { DEFAULT_THEME, type SfxCue, type SfxName } from "../lib/theme";
import { FONTS } from "../lib/fonts";
import { EFFECTS, type EffectName } from "../typography";
import { KaraokeCaptions } from "../typography/KaraokeCaptions";
import { WordByWord, type WbwWord } from "../styles/textPresets/capcut/WordByWord";
import { SfxTrack } from "./shared";
import type { Caption } from "@remotion/captions";

/**
 * Dung video review quan an (nhieu clip da ghep thanh 1 proxy):
 * - Doan co loi thoai: toc do 1x, giu tieng goc.
 * - Doan an uong/khong thoai: tua nhanh x2/x3 (tat tieng goc, nhan "x2 ▶▶" goc tren phai).
 * - Doan loi/lap/khoang lang ngan: cat bo (khong co trong segments).
 * - Chu hieu ung kieu demo-phudu (zoomPunch/popBounce/slideMask/typewriter, KHONG dung neonGlitch) + SFX cua hieu ung.
 * Thoi gian titles/captions/sfx tinh tren timeline DAU RA (ms).
 */
export type ReviewSegment = { srcStartMs: number; srcEndMs: number; speed: number; zoom?: number; note?: string };
export type ReviewPlan = {
  source: string;
  fps: number;
  segments: ReviewSegment[];
  captions: Caption[];
  /** y = tam khoi chu (px @1920) do build_plan dat de tranh mat; mac dinh tam band headline (600). */
  titles: Array<{ text: string; effect: Exclude<EffectName, "neonGlitch">; startMs: number; durationMs: number; y?: number; sfx?: Array<{ sfx: SfxName; offsetMs: number; volume: number }> }>;
  /** Doi phu de xuong/len (px). */
  captionOffset?: number;
  sfx: Array<{ sfx: SfxName; atMs: number; volume: number }>;
  captionMode?: "karaoke" | "wordbyword" | "none";
  accentRe?: string;
};

export const reviewOutMs = (s: ReviewSegment) => (s.srcEndMs - s.srcStartMs) / s.speed;
export const reviewPlanDurationMs = (p: ReviewPlan) => p.segments.reduce((a, s) => a + reviewOutMs(s), 0);

const FastBadge: React.FC<{ speed: number; dur: number }> = ({ speed, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = interpolate(f, [0, fps * 0.2], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) });
  const out = interpolate(f, [dur - fps * 0.15, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blink = 0.75 + 0.25 * Math.sin((f / fps) * Math.PI * 4);
  return (
    <div
      style={{
        position: "absolute",
        top: 250,
        right: 170,
        padding: "10px 26px",
        borderRadius: 40,
        background: "rgba(0,0,0,0.45)",
        fontFamily: FONTS.phudu,
        fontWeight: 900,
        fontSize: 64,
        letterSpacing: "0.04em",
        color: DEFAULT_THEME.accent,
        scale: inn,
        opacity: out,
        textShadow: "0 3px 8px rgba(0,0,0,0.6)",
      }}
    >
      x{speed} <span style={{ opacity: blink }}>▶▶</span>
    </div>
  );
};

export const ReviewEdit: React.FC<{ plan: ReviewPlan }> = ({ plan }) => {
  const { fps } = useVideoConfig();
  const theme = DEFAULT_THEME;
  const toF = (ms: number) => Math.round((ms / 1000) * fps);
  let cursor = 0;
  const segs = plan.segments.map((s) => {
    const from = cursor;
    const dur = Math.max(1, toF(reviewOutMs(s)));
    cursor += dur;
    return { ...s, from, dur };
  });
  const cues: SfxCue[] = [
    ...plan.sfx.map((s) => ({ frame: toF(s.atMs), sfx: s.sfx, volume: s.volume })),
    // tieu de co sfx rieng (bo SFX nhe da can muc) -> dung thay cho cue mac dinh cua hieu ung (moi tu 1 tieng, qua day)
    ...plan.titles.flatMap((t) =>
      t.sfx
        ? t.sfx.map((c) => ({ frame: Math.max(0, toF(t.startMs + c.offsetMs)), sfx: c.sfx, volume: c.volume }))
        : EFFECTS[t.effect].cues(t.text).map((c) => ({ ...c, frame: toF(t.startMs) + Math.round((c.frame * fps) / 30) })),
    ),
  ];
  const words: WbwWord[] = plan.captions.map((c) => ({ text: c.text.trim(), startMs: c.startMs, endMs: c.endMs, maxEndMs: (c as { maxEndMs?: number }).maxEndMs }));
  const mode = plan.captionMode ?? "karaoke";
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {segs.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur} name={`${i + 1} ${s.speed > 1 ? `x${s.speed}` : "1x"} ${s.note ?? ""}`}>
          <AbsoluteFill style={{ scale: s.zoom ?? 1 }}>
            <Video
              src={staticFile(plan.source)}
              trimBefore={toF(s.srcStartMs)}
              trimAfter={toF(s.srcEndMs)}
              playbackRate={s.speed}
              muted={s.speed > 1}
              objectFit="cover"
            />
          </AbsoluteFill>
          {s.speed > 1 ? <FastBadge speed={s.speed} dur={s.dur} /> : null}
        </Sequence>
      ))}
      <AbsoluteFill style={{ translate: `0 ${plan.captionOffset ?? 0}px` }}>
        {mode === "karaoke" ? <KaraokeCaptions captions={plan.captions} theme={theme} combineMs={900} uppercase /> : null}
        {mode === "wordbyword" ? <WordByWord words={words} accentRe={plan.accentRe} /> : null}
      </AbsoluteFill>
      {plan.titles.map((t, i) => {
        const { Component } = EFFECTS[t.effect];
        return (
          <Sequence key={i} from={toF(t.startMs)} durationInFrames={toF(t.durationMs)} name={`Title: ${t.text}`}>
            <AbsoluteFill style={{ translate: `0 ${(t.y ?? 600) - 600}px` }}>
              <Component text={t.text} duration={toF(t.durationMs)} theme={theme} band="headline" />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <SfxTrack cues={cues} />
    </AbsoluteFill>
  );
};
