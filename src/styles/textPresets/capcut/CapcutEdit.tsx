import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { HdWatermark } from "../../hongDang/components";
import { CC_PRESETS, CapcutPreset, type CcFit } from "./CapcutPreset";
import { WordByWord, type WbwWord } from "./WordByWord";

/** Dung video BDS: cat canh theo plan + chen preset CapCut tai cac moc loi noi. */
export type CcEditPlan = {
  source: string;
  fps: number;
  segments: Array<{ srcStartMs: number; srcEndMs: number; zoom: number }>;
  items: Array<{ preset: string; startMs: number; durationMs: number; texts?: Record<string, string>; fit: CcFit; note?: string }>;
  watermark?: { line1: string; line2?: string };
  words?: WbwWord[]; // co -> ban "chay chu tung chu"
  wordsY?: number;
  accentRe?: string;
};
export const ccPlanDurationMs = (p: CcEditPlan) => p.segments.reduce((a, s) => a + s.srcEndMs - s.srcStartMs, 0);

/** Thoat muot: 0.3s cuoi mo dan + thu nhe (tranh bien mat dot ngot). */
const ExitFade: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.round(0.3 * fps);
  const p = interpolate(f, [dur - n, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: p, scale: 0.96 + 0.04 * p }}>{children}</AbsoluteFill>;
};

/** Lop toi mem hinh bau duc sau preset: giu chu dan nho doc duoc tren nen sang (troi, tuong vang). */
const Backdrop: React.FC<{ fit: CcFit; dur: number }> = ({ fit, dur }) => {
  const f = useCurrentFrame();
  if (typeof fit !== "object") return null;
  const a = interpolate(f, [0, 8, dur - 8, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const w = fit.width * 1.25, h = Math.max(380, fit.width * 0.55);
  return (
    <div style={{ position: "absolute", left: fit.cx - w / 2, top: fit.cy - h / 2, width: w, height: h, opacity: a, background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.32) 45%, rgba(0,0,0,0) 72%)" }} />
  );
};

export const CapcutEdit: React.FC<{ plan: CcEditPlan }> = ({ plan }) => {
  const { fps } = useVideoConfig();
  const toF = (ms: number) => Math.round((ms / 1000) * fps);
  let cursor = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {plan.segments.map((s, i) => {
        const from = cursor;
        const dur = toF(s.srcEndMs) - toF(s.srcStartMs);
        cursor += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={`Shot ${i + 1}`}>
            <AbsoluteFill style={{ scale: s.zoom }}>
              <Video src={staticFile(plan.source)} trimBefore={toF(s.srcStartMs)} trimAfter={toF(s.srcEndMs)} objectFit="cover" />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {plan.items.map((it, i) => {
        const p = CC_PRESETS.find((x) => x.id === it.preset);
        if (!p) return null;
        return (
          <Sequence key={i} from={toF(it.startMs)} durationInFrames={toF(it.durationMs)} name={`${it.preset}: ${it.note ?? ""}`}>
            <Backdrop fit={it.fit} dur={toF(it.durationMs)} />
            <ExitFade dur={toF(it.durationMs)}>
              <CapcutPreset preset={p} texts={it.texts} fit={it.fit} />
            </ExitFade>
          </Sequence>
        );
      })}
      {plan.words ? <WordByWord words={plan.words} y={plan.wordsY} accentRe={plan.accentRe} /> : null}
      {plan.watermark ? <HdWatermark line1={plan.watermark.line1} line2={plan.watermark.line2} /> : null}
    </AbsoluteFill>
  );
};
