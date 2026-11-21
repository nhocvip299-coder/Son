/**
 * Composition dung video theo plan JSON do Editing Decision Engine tao (scripts/refedit/decide.mjs).
 * Moi hieu ung la component React (Remotion) — FFmpeg chi dung de tao proxy/master am thanh.
 */
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio, Video } from "@remotion/media";
import { SfxTrack } from "../../compositions/shared";
import type { SfxName } from "../../lib/theme";
import { WordByWord, type WbwWord } from "../textPresets/capcut/WordByWord";
import {
  AbstractBg,
  BigNumeral,
  ClockProp,
  ContrastPair,
  EmphasisWipe,
  ExampleList,
  FlareBurst,
  GlassPill,
  HourglassProp,
  LightLeak,
  RecapBadges,
  SetupPunch,
  StepBadge,
  Warning,
  YellowCard,
  type CardLine,
  type ExitMode,
  type ListItem,
} from "./components";
import { RT } from "./tokens";

export type RefSegment = {
  srcStartMs: number;
  srcEndMs: number;
  /** th = talking head; bg = nen truu tuong (giong noi van chay) */
  kind: "th" | "bg";
  zoomFrom?: number;
  zoomTo?: number;
  zoomRampMs?: number;
  /** lam mo footage (frosted) tu moc nay (ms tinh tu dau segment) — dung cho the kinh */
  frostAtMs?: number;
  /** vao bang blur-dissolve (footage mo dan -> nen) thay vi cat cung */
  blurIn?: boolean;
  why?: string;
};

type Base = { startMs: number; endMs: number; why?: string };
export type RefItem = Base &
  (
    | { type: "setupPunch"; setup?: string; punch: string; setupAt?: number; punchAt?: number; setupMode?: "blur" | "type"; punchMode?: "rise" | "type"; punchColor?: "red" | "yellow"; y?: number; exit?: ExitMode }
    | { type: "stepBadge"; n: number; label: string; labelAt?: number; exit?: ExitMode }
    | { type: "list"; title: string; titleAt?: number; items: ListItem[]; layout?: "zigzag" | "stack"; upper?: boolean; exit?: ExitMode }
    | { type: "cards"; cards: Array<{ at: number; lines: CardLine[] }>; tilt3d?: boolean }
    | { type: "pills"; pills: Array<{ text: string; at: number }> }
    | { type: "emphasis"; text: string; at?: number; y?: number; exit?: ExitMode }
    | { type: "bigNumeral"; num: string; line1: string; line2?: string; at?: number; dimAt?: number; exit?: ExitMode }
    | { type: "warning"; head: string; sub?: string; at?: number; subAt?: number; color?: "yellow" | "red"; y?: number; exit?: ExitMode }
    | { type: "contrast"; neg: string; words: Array<{ text: string; at: number; x: number }>; at?: number; exit?: ExitMode }
    | { type: "recap"; nums: Array<number | string>; at?: number; burstAt?: number }
    | { type: "clock"; x?: number; y?: number }
    | { type: "hourglass"; x?: number; y?: number }
    | { type: "flare"; y?: number }
    | { type: "leak"; tone?: "red" | "orange" }
  );

export type RefPlan = {
  source: string;
  fps: number;
  width?: number;
  height?: number;
  segments: RefSegment[];
  items: RefItem[];
  sfx: Array<{ atMs: number; sfx: SfxName; volume?: number; why?: string }>;
  music?: { src: string; volume: number };
  /** ban "chay chu tung chu" */
  words?: WbwWord[];
  wordsY?: number;
  /** thay tieng: tat tieng footage, phat audio nay tu moc startMs (dung khi kiem chung voi "clean plate") */
  audioOverride?: { src: string; startMs: number };
  /** am luong giong (footage). <1 de SFX noi ro tren giong khi giong goc qua to; master-audio se chuan lai -14 LUFS */
  voiceVolume?: number;
};

export const refPlanDurationMs = (p: RefPlan) => p.segments.reduce((a, s) => a + s.srcEndMs - s.srcStartMs, 0);

const Shot: React.FC<{ seg: RefSegment; source: string; trimBefore: number; trimAfter: number; muted?: boolean; volume?: number }> = ({ seg, source, trimBefore, trimAfter, muted, volume = 1 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const z = interpolate(t, [0, (seg.zoomRampMs ?? 700) / 1000], [seg.zoomFrom ?? 1, seg.zoomTo ?? seg.zoomFrom ?? 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const frost = seg.frostAtMs !== undefined ? interpolate(t, [seg.frostAtMs / 1000, seg.frostAtMs / 1000 + 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const bgIn = seg.kind === "bg" ? (seg.blurIn ? interpolate(t, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1) : 0;
  const footBlur = Math.max(frost * 22, bgIn * 40);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: String(z * (1 + bgIn * 0.08)), transformOrigin: "50% 38%", filter: footBlur > 0.2 ? `blur(${footBlur}px) brightness(${1 - frost * 0.12})` : undefined }}>
        <Video src={staticFile(source)} trimBefore={trimBefore} trimAfter={trimAfter} objectFit="cover" muted={muted} volume={volume} />
      </AbsoluteFill>
      {seg.kind === "bg" ? (
        <AbsoluteFill style={{ opacity: bgIn }}>
          <AbstractBg seed={Math.round(trimBefore)} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const renderItem = (it: RefItem) => {
  switch (it.type) {
    case "setupPunch":
      return <SetupPunch {...it} />;
    case "stepBadge":
      return <StepBadge {...it} />;
    case "list":
      return <ExampleList {...it} />;
    case "cards":
      return (
        <>
          {it.cards.map((c, i) =>
            it.tilt3d ? (
              <YellowCard key={i} y={0.26} at={c.at} lines={c.lines} tilt3d upper={false} w={860} h={330} align="left" />
            ) : (
              <YellowCard key={i} y={RT.y.cardCenters[i % 3]} at={c.at} lines={c.lines} />
            ),
          )}
        </>
      );
    case "pills":
      return (
        <>
          {it.pills.map((p, i) => (
            <GlassPill key={i} text={p.text} at={p.at} y={i === 0 ? RT.y.pill1 : RT.y.pill2} rot={i === 0 ? -5 : -7} />
          ))}
        </>
      );
    case "emphasis":
      return <EmphasisWipe {...it} />;
    case "bigNumeral":
      return <BigNumeral {...it} />;
    case "warning":
      return <Warning {...it} />;
    case "contrast":
      return <ContrastPair {...it} />;
    case "recap":
      return <RecapBadges {...it} />;
    case "clock":
      return <ClockProp {...it} />;
    case "hourglass":
      return <HourglassProp {...it} />;
    case "flare":
      return <FlareBurst {...it} />;
    case "leak":
      return <LightLeak tone={it.tone} />;
  }
};

const label = (it: RefItem) =>
  `${it.type}: ${"punch" in it ? it.punch : "label" in it ? it.label : "title" in it ? it.title : "text" in it ? it.text : "head" in it ? it.head : "neg" in it ? it.neg : ""}`;

export const RefEdit: React.FC<{ plan: RefPlan }> = ({ plan }) => {
  const { fps } = useVideoConfig();
  const toF = (ms: number) => Math.round((ms / 1000) * fps);
  let cursor = 0;
  const segs = plan.segments.map((s) => {
    const from = cursor;
    const dur = toF(s.srcEndMs) - toF(s.srcStartMs);
    cursor += dur;
    return { s, from, dur };
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {segs.map(({ s, from, dur }, i) => (
        <Sequence key={i} from={from} durationInFrames={dur} name={`${s.kind === "bg" ? "NEN" : "MAT"} ${i + 1}${s.zoomTo ? ` zoom ${s.zoomFrom}->${s.zoomTo}` : ""}`}>
          <Shot seg={s} source={plan.source} trimBefore={toF(s.srcStartMs)} trimAfter={toF(s.srcEndMs)} muted={!!plan.audioOverride} volume={plan.voiceVolume ?? 1} />
        </Sequence>
      ))}
      {plan.items.map((it, i) => (
        <Sequence key={i} from={toF(it.startMs)} durationInFrames={Math.max(1, toF(it.endMs) - toF(it.startMs))} name={label(it)}>
          {renderItem(it)}
        </Sequence>
      ))}
      {plan.words?.length ? <WordByWord words={plan.words} y={plan.wordsY ?? 1560} /> : null}
      {plan.audioOverride ? <Audio src={staticFile(plan.audioOverride.src)} trimBefore={toF(plan.audioOverride.startMs)} /> : null}
      {plan.music ? <Audio src={staticFile(plan.music.src)} volume={plan.music.volume} /> : null}
      <SfxTrack cues={plan.sfx.map((c) => ({ frame: toF(c.atMs), sfx: c.sfx, volume: c.volume }))} />
    </AbsoluteFill>
  );
};
