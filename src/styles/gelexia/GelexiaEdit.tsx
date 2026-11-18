import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio, Video } from "@remotion/media";
import STYLE from "../../../styles/gelexia-food-review/style.json";
import { CC_PRESETS, CapcutPreset, type CcFit } from "../textPresets/capcut/CapcutPreset";
import { Backdrop, ExitFade } from "../textPresets/capcut/CapcutEdit";
import { WordByWord, type WbwWord } from "../textPresets/capcut/WordByWord";

/**
 * Style "gelexia-food-review": vlog am thuc doc, nhip nhanh.
 * - Cat canh theo plan, moi canh Ken Burns (zoom/troi nhe) + "punch-in" luc vao canh + whoosh.
 * - Chuyen canh: flash trang ngan hoac zoom blur.
 * - Grade am (contrast/saturate tu style.json + phu cam nhe + vignette).
 * - Preset chu CapCut (co SFX) + ban "chay chu tung chu".
 * - Nhac nen + am thanh hien truong nho.
 */
export type GxShot = {
  srcStartMs: number;
  srcEndMs: number;
  zoom?: number; // zoom co ban
  drift?: [number, number]; // troi px (x,y) tu dau -> cuoi canh
  kb?: "in" | "out"; // Ken Burns
  trans?: "flash" | "zoom" | "cut"; // hieu ung luc VAO canh
};
export type GxPlan = {
  source: string;
  fps: number;
  shots: GxShot[];
  items: Array<{ preset: string; startMs: number; durationMs: number; texts?: Record<string, string>; fit: CcFit; note?: string }>;
  words?: WbwWord[];
  wordsY?: number;
  accentRe?: string;
  music?: { src: string; volume: number };
  ambientVolume?: number;
  cutSfxVolume?: number;
  handle?: string; // tag kenh goc tren
};
export const gxDurationMs = (p: GxPlan) => p.shots.reduce((a, s) => a + s.srcEndMs - s.srcStartMs, 0);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const G = STYLE.grade;

const Shot: React.FC<{ plan: GxPlan; s: GxShot; dur: number }> = ({ plan, s, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const toF = (ms: number) => Math.round((ms / 1000) * fps);
  const z0 = s.zoom ?? 1.04;
  const p = interpolate(f, [0, dur], [0, 1], clamp);
  const kb = s.kb === "out" ? interpolate(p, [0, 1], [z0 + 0.07, z0]) : interpolate(p, [0, 1], [z0, z0 + 0.07]);
  // punch-in: vao canh phong to 10% roi ve trong ~0.25s
  const punch = s.trans === "cut" ? 0 : interpolate(f, [0, Math.round(0.28 * fps)], [0.1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const [dx, dy] = s.drift ?? [0, 0];
  const blur = s.trans === "zoom" ? interpolate(f, [0, Math.round(0.2 * fps)], [14, 0], clamp) : 0;
  return (
    <AbsoluteFill
      style={{
        scale: kb + punch,
        translate: `${dx * p}px ${dy * p}px`,
        filter: `contrast(${G.contrast}) saturate(${G.saturate}) brightness(${G.brightness})${blur ? ` blur(${blur}px)` : ""}`,
      }}
    >
      <Video
        src={staticFile(plan.source)}
        trimBefore={toF(s.srcStartMs)}
        trimAfter={toF(s.srcEndMs)}
        objectFit="cover"
        volume={plan.ambientVolume ?? 0.25}
      />
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = interpolate(f, [0, Math.round(0.05 * fps), Math.round(0.22 * fps)], [0.85, 0.6, 0], clamp);
  return <AbsoluteFill style={{ backgroundColor: "#FFF6E8", opacity: o }} />;
};

/** Grade am: phu cam (soft-light) + vignette. */
const Grade: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,170,90,0.10), rgba(255,120,40,0.08))", mixBlendMode: "soft-light" }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${G.vignette}) 100%)` }} />
  </>
);

/** Tag kenh goc tren trai: vien cam bo tron. */
const Handle: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = interpolate(f, [0, Math.round(0.4 * fps)], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 60,
        padding: "12px 26px",
        borderRadius: 999,
        background: "rgba(0,0,0,0.35)",
        border: `3px solid ${STYLE.theme.accent}`,
        color: "#fff",
        fontFamily: "Be Vietnam Pro, sans-serif",
        fontWeight: 800,
        fontSize: 34,
        opacity: a,
        translate: `${interpolate(a, [0, 1], [-30, 0])}px 0`,
        boxShadow: `0 0 18px ${STYLE.theme.accent}88`,
      }}
    >
      {text}
    </div>
  );
};

export const GelexiaEdit: React.FC<{ plan: GxPlan }> = ({ plan }) => {
  const { fps } = useVideoConfig();
  const toF = (ms: number) => Math.round((ms / 1000) * fps);
  let cursor = 0;
  const starts: number[] = [];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {plan.shots.map((s, i) => {
        const from = cursor;
        const dur = toF(s.srcEndMs) - toF(s.srcStartMs);
        cursor += dur;
        starts.push(from);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={`Shot ${i + 1}`}>
            <Shot plan={plan} s={s} dur={dur} />
          </Sequence>
        );
      })}
      <Grade />
      {plan.shots.map((s, i) =>
        i > 0 && s.trans === "flash" ? (
          <Sequence key={`fl${i}`} from={starts[i]} durationInFrames={Math.round(0.25 * fps)} name="Flash">
            <Flash />
          </Sequence>
        ) : null,
      )}
      {plan.shots.map((s, i) =>
        i > 0 && s.trans !== "cut" ? (
          <Sequence key={`sx${i}`} from={Math.max(0, starts[i] - Math.round(0.12 * fps))} durationInFrames={Math.round(0.8 * fps)} name="Whoosh" layout="none">
            <Audio src={staticFile(s.trans === "flash" ? "sfx/swish.wav" : "sfx/whoosh.wav")} volume={plan.cutSfxVolume ?? 0.55} />
          </Sequence>
        ) : null,
      )}
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
      {plan.handle ? <Handle text={plan.handle} /> : null}
      {plan.music ? <Audio src={staticFile(plan.music.src)} volume={plan.music.volume} /> : null}
    </AbsoluteFill>
  );
};
