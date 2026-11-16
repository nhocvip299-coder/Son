import type { Caption } from "@remotion/captions";
import type { SfxName } from "../lib/theme";
import type { EffectName } from "../typography";

/** Ke hoach dung do scripts/pipeline/plan.mjs tao ra. Moi thoi gian deu tinh tren timeline DAU RA (ms). */
export type EditPlan = {
  source: string; // duong dan trong public/
  sourceHasAudio: boolean;
  fps: number;
  width: number;
  height: number;
  style: string;
  segments: Array<{ srcStartMs: number; srcEndMs: number; zoom: number }>;
  captions: Caption[];
  titles: Array<{ text: string; effect: EffectName; startMs: number; durationMs: number }>;
  sfx: Array<{ sfx: SfxName; atMs: number; volume: number }>;
  music?: string;
};

export const planDurationMs = (p: EditPlan) =>
  p.segments.reduce((a, s) => a + (s.srcEndMs - s.srcStartMs), 0);

export const EMPTY_PLAN: EditPlan = {
  source: "demo/bg.mp4",
  sourceHasAudio: false,
  fps: 30,
  width: 1080,
  height: 1920,
  style: "hong-dang",
  segments: [{ srcStartMs: 0, srcEndMs: 5000, zoom: 1 }],
  captions: [],
  titles: [{ text: "Chưa có *kế hoạch* dựng", effect: "popBounce", startMs: 300, durationMs: 3000 }],
  sfx: [],
};
