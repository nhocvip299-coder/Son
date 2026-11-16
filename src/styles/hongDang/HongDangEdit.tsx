import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { HdBigNumber, HdKeywordReveal, HdQuestionCard, HdSpinIcon3D, HdWatermark } from "./components";

/** Plan do scripts/hongdang/build-plan.mjs tao. Thoi gian tinh tren timeline dau ra (ms). */
export type HdItem =
  | { type: "keyword"; startMs: number; durationMs: number; lead?: string; keyword: string; x?: number; y?: number; color?: "cyan" | "yellow"; icon?: { glyph: string; arrow: "up" | "down" | null } }
  | { type: "card"; startMs: number; durationMs: number; line1: string; line2?: string; y?: number }
  | { type: "big"; startMs: number; durationMs: number; text: string; y?: number };

export type HdPlan = {
  source: string;
  fps: number;
  segments: Array<{ srcStartMs: number; srcEndMs: number; zoom: number }>;
  items: HdItem[];
  watermark?: { line1: string; line2?: string };
  sfxVolume?: number;
};

export const hdPlanDurationMs = (p: HdPlan) => p.segments.reduce((a, s) => a + s.srcEndMs - s.srcStartMs, 0);

export const HongDangEdit: React.FC<{ plan: HdPlan }> = ({ plan }) => {
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
  // SFX goi y [UD]: video mau khong cho thay SFX bam diem cat -> chi dat nhe tai luc chu xuat hien
  const cues: SfxCue[] = plan.items.flatMap((it): SfxCue[] => {
    const at = toF(it.startMs);
    if (it.type === "keyword") return [{ frame: at + f30(it.lead ? 4 : 0), sfx: "pop", volume: 0.35 }, ...(it.icon ? [{ frame: at + f30(8), sfx: "whoosh" as const, volume: 0.25 }] : [])];
    if (it.type === "card") return [{ frame: at, sfx: "click", volume: 0.4 }];
    return [{ frame: at, sfx: "impact", volume: 0.3 }];
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {segs.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur} name={`Shot ${i + 1} x${s.zoom}`}>
          <AbsoluteFill style={{ scale: s.zoom }}>
            <Video src={staticFile(plan.source)} trimBefore={toF(s.srcStartMs)} trimAfter={toF(s.srcEndMs)} objectFit="cover" />
          </AbsoluteFill>
        </Sequence>
      ))}
      {plan.items.map((it, i) => {
        const d30 = (it.durationMs / 1000) * 30;
        return (
          <Sequence key={i} from={toF(it.startMs)} durationInFrames={toF(it.durationMs)} name={`${it.type}: ${"keyword" in it ? it.keyword : "line1" in it ? it.line1 : it.text}`}>
            {it.type === "keyword" ? (
              <HdKeywordReveal lead={it.lead} keyword={it.keyword} x={it.x} y={it.y} color={it.color} duration={d30} icon={it.icon ? <HdSpinIcon3D glyph={it.icon.glyph} arrow={it.icon.arrow} size={190} /> : undefined} />
            ) : it.type === "card" ? (
              <HdQuestionCard line1={it.line1} line2={it.line2} y={it.y} duration={d30} />
            ) : (
              <HdBigNumber text={it.text} y={it.y} duration={d30} />
            )}
          </Sequence>
        );
      })}
      {plan.watermark ? <HdWatermark line1={plan.watermark.line1} line2={plan.watermark.line2} /> : null}
      <SfxTrack cues={cues} master={plan.sfxVolume ?? 1} />
    </AbsoluteFill>
  );
};
