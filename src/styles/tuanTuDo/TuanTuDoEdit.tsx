import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { WordByWord } from "../textPresets/capcut/WordByWord";
import {
  TtdGlowBand,
  TtdHookTitle,
  TtdInkWipe,
  TtdKaraokeCaptions,
  TtdLaughMarks,
  TtdNameTag,
  TtdQuestionMarks,
  TtdReactionPip,
  TtdToBeContinued,
  type TtdWord,
} from "./components";

/** Plan dung video kieu Tuan Tu Do. Moi thoi gian (tru srcStart/End) tinh tren timeline DAU RA (ms). */
export type TtdItem =
  | { type: "hook"; startMs: number; durationMs: number; text: string }
  | { type: "glow"; startMs: number; durationMs: number }
  | { type: "name"; startMs: number; durationMs: number; line1: string; line2?: string }
  | { type: "laugh"; startMs: number; durationMs: number; x?: number; y?: number }
  | { type: "question"; startMs: number; durationMs: number; x?: number; y?: number }
  | { type: "ink"; atMs: number } // tam = diem cat chuyen dia diem
  | { type: "end"; startMs: number; durationMs: number; text?: string }
  | { type: "pip"; startMs: number; durationMs: number; src: string; isVideo?: boolean; srcStartS?: number; line?: string; keyword?: string };

export type TtdPlan = {
  source: string; // trong public/
  fps: number;
  /** Doan 1 nen la TEASER (cat tu giua video, 2–4s) [XM: hook = canh hay nhat lap lai o dau]. */
  segments: Array<{ srcStartMs: number; srcEndMs: number; zoom: number }>;
  words: TtdWord[]; // da quy doi sang timeline dau ra, da sua loi ASR
  keywordRe?: string; // tu luon to vang (so tien, ten mon, tinh tu manh)
  captionMode?: "karaoke" | "wordbyword";
  items: TtdItem[];
  sfxVolume?: number;
};

export const ttdPlanDurationMs = (p: TtdPlan) => p.segments.reduce((a, s) => a + s.srcEndMs - s.srcStartMs, 0);

const span = (it: TtdItem): [number, number] => ("atMs" in it ? [it.atMs, it.atMs] : [it.startMs, it.startMs + it.durationMs]);

export const TuanTuDoEdit: React.FC<{ plan: TtdPlan }> = ({ plan }) => {
  const { fps } = useVideoConfig();
  const toF = (ms: number) => Math.round((ms / 1000) * fps);
  const f30 = (n: number) => Math.round((n * fps) / 30);
  let cursor = 0;
  const segs = plan.segments.map((s) => {
    const from = cursor;
    const dur = toF(s.srcEndMs) - toF(s.srcStartMs);
    cursor += dur;
    return { ...s, from, dur };
  });
  // SFX: am tram (pop/impact/hit) LUON ghep 1 lop sang (ding/sparkle/game/shimmer) de khong bi giong noi at — da do nang luong >3kHz.
  // SFX [UD]: kenh goc gan nhu khong co nhac nen, SFX thua -> chi dat o cac diem nhan (xem style-spec.md §5)
  const cues: SfxCue[] = plan.items.flatMap((it): SfxCue[] => {
    if (it.type === "ink") return [{ frame: toF(it.atMs) - f30(7), sfx: "swish", volume: 0.9 }];
    const at = toF(it.startMs);
    switch (it.type) {
      case "hook":
        return [{ frame: Math.max(0, at - f30(2)), sfx: "whoosh", volume: 0.8 }, { frame: at + f30(2), sfx: "impact", volume: 0.8 }, { frame: at + f30(2), sfx: "sparkle", volume: 0.45 }];
      case "glow":
        return [{ frame: at, sfx: "shine", volume: 0.8 }];
      case "name":
        return [{ frame: at, sfx: "pop", volume: 0.8 }, { frame: at, sfx: "ding", volume: 0.6 }];
      case "laugh":
        return [{ frame: at, sfx: "pops", volume: 0.8 }, { frame: at, sfx: "game", volume: 0.6 }];
      case "question":
        return [{ frame: at, sfx: "blip8", volume: 0.7 }];
      case "end":
        return [{ frame: Math.max(0, at - f30(10)), sfx: "riser", volume: 0.6 }, { frame: at + f30(2), sfx: "hit", volume: 0.85 }, { frame: at + f30(2), sfx: "shimmer", volume: 0.95 }];
      case "pip":
        return [{ frame: at, sfx: "swoosh-down", volume: 0.7 }];
    }
  });
  const hide = plan.items.filter((it) => it.type === "hook" || it.type === "name" || it.type === "end").map(span);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {segs.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur} name={`Shot ${i + 1} x${s.zoom}`}>
          <AbsoluteFill style={{ scale: s.zoom }}>
            <Video src={staticFile(plan.source)} trimBefore={toF(s.srcStartMs)} trimAfter={toF(s.srcEndMs)} objectFit="cover" />
          </AbsoluteFill>
        </Sequence>
      ))}
      {plan.captionMode === "wordbyword" ? (
        <WordByWord words={plan.words.filter((w) => !hide.some(([a, b]) => w.startMs < b && w.endMs > a))} y={Math.round(1920 * 0.215)} accentRe={plan.keywordRe} />
      ) : (
        <TtdKaraokeCaptions words={plan.words} keywordRe={plan.keywordRe} hideRanges={hide} />
      )}
      {plan.items.map((it, i) => {
        if (it.type === "ink") {
          const d = f30(14);
          return (
            <Sequence key={i} from={toF(it.atMs) - Math.round(d / 2)} durationInFrames={d} name="Ink wipe">
              <TtdInkWipe duration={14} />
            </Sequence>
          );
        }
        const d30 = (it.durationMs / 1000) * 30;
        return (
          <Sequence key={i} from={toF(it.startMs)} durationInFrames={toF(it.durationMs)} name={it.type}>
            {it.type === "hook" ? (
              <TtdHookTitle text={it.text} duration={d30} />
            ) : it.type === "glow" ? (
              <TtdGlowBand duration={d30} />
            ) : it.type === "name" ? (
              <TtdNameTag line1={it.line1} line2={it.line2} duration={d30} />
            ) : it.type === "laugh" ? (
              <TtdLaughMarks duration={d30} x={it.x} y={it.y} />
            ) : it.type === "question" ? (
              <TtdQuestionMarks duration={d30} x={it.x} y={it.y} />
            ) : it.type === "end" ? (
              <TtdToBeContinued duration={d30} text={it.text} />
            ) : (
              <TtdReactionPip src={it.isVideo ? staticFile(it.src) : staticFile(it.src)} isVideo={it.isVideo} startFromS={it.srcStartS} duration={d30} line={it.line} keyword={it.keyword} />
            )}
          </Sequence>
        );
      })}
      <SfxTrack cues={cues} master={plan.sfxVolume ?? 1} />
    </AbsoluteFill>
  );
};
