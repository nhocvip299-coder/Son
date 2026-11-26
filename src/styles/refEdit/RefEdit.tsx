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
import { RevealCtx, Typed, whiteText } from "./components";
import { BarLadder, PriceDrop, VersusCompare, type Bar, type VsSide } from "./animations";
import { IllustratedScene } from "./scenes";

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
  /** canh tram: thu nguoi noi vao khung goc (mac dinh true). false = nen phu kin (kieu video mau goc) */
  pip?: boolean;
  /** clip nguon rieng cho doan nay (nhieu clip trong 1 video); mac dinh = plan.source */
  source?: string;
  /** [NGUOI DUNG] canh tram bang VIDEO THAT (B-roll, khong tieng): "full" = phat ro net; "bg" = lam mo + toi lam nen cho do hoa */
  broll?: { src: string; startMs?: number; mode?: "full" | "bg" };
  /** [AI] nen trong suot -> lo canh minh hoa (item type "scene") nam duoi lop video */
  scene?: boolean;
  why?: string;
};

type Base = { startMs: number; endMs: number; why?: string };
export type RefItem = Base &
  (
    | { type: "setupPunch"; setup?: string; punch: string; setupAt?: number; punchAt?: number; setupMode?: "blur" | "type"; punchMode?: "rise" | "type"; punchColor?: "red" | "yellow"; y?: number; exit?: ExitMode }
    | { type: "stepBadge"; n: number; label: string; labelAt?: number; exit?: ExitMode }
    | { type: "list"; title: string; titleAt?: number; items: ListItem[]; layout?: "zigzag" | "stack"; upper?: boolean; exit?: ExitMode; y?: number }
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
    | { type: "bars"; title?: string; bars: Bar[]; y?: number }
    | { type: "priceDrop"; from: string; to: number; toPrefix?: string; unit: string; label?: string; at?: number; dropAt?: number; y?: number }
    | { type: "versus"; left: VsSide; right: VsSide; y?: number }
    | { type: "scene"; name: string; cues?: Record<string, number>; sfx?: Array<{ at: number; key: string }> }
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
  /** kieu hien chu: mac dinh nhu video mau; { mode: "type" } = go ban phim + tieng phim moi ky tu */
  reveal?: { mode: "orig" | "type"; cps?: number; keyVolume?: number; keyFiles?: string[] };
  /** ban chay chu: phu de go tung tu (khong tieng phim de khong on ao suot video) */
  wordsTypewriter?: boolean;
  /** tieng go phim cho phu de chay chu (0 = tat) */
  wordsKeyVolume?: number;
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
  const bgIn = seg.kind === "bg" ? (seg.blurIn ? interpolate(t, [0, 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }) : 1) : 0;
  const video = <Video src={staticFile(source)} trimBefore={trimBefore} trimAfter={trimAfter} objectFit="cover" muted={muted} volume={volume} />;
  if (seg.kind === "bg" && seg.pip !== false) {
    // [SUA theo nguoi dung] canh tram KHONG phu kin: nguoi noi thu vao khung bo goc (duoi-trai), noi dung do hoa o tren
    const R = PIP;
    const L = interpolate(bgIn, [0, 1], [0, R.x]);
    const T = interpolate(bgIn, [0, 1], [0, R.y]);
    const Wd = interpolate(bgIn, [0, 1], [1080, R.w]);
    const Hd = interpolate(bgIn, [0, 1], [1920, R.h]);
    return (
      <AbsoluteFill>
        {seg.broll ? <Broll b={seg.broll} /> : seg.scene ? null : <AbstractBg seed={Math.round(trimBefore)} />}
        <div
          style={{
            position: "absolute",
            left: L,
            top: T,
            width: Wd,
            height: Hd,
            overflow: "hidden",
            borderRadius: 34 * bgIn,
            border: bgIn > 0.05 ? `${5 * bgIn}px solid rgba(255,255,255,0.92)` : undefined,
            boxShadow: `0 0 ${24 * bgIn}px rgba(255,255,255,${0.45 * bgIn}), 0 18px 40px rgba(0,0,0,${0.45 * bgIn})`,
          }}
        >
          <AbsoluteFill style={{ scale: String(1 + bgIn * 0.25), transformOrigin: "50% 30%" }}>{video}</AbsoluteFill>
        </div>
      </AbsoluteFill>
    );
  }
  const footBlur = Math.max(frost * 22, bgIn * 40);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: String(z * (1 + bgIn * 0.08)), transformOrigin: "50% 38%", filter: footBlur > 0.2 ? `blur(${footBlur}px) brightness(${1 - frost * 0.12})` : undefined }}>
        {video}
      </AbsoluteFill>
      {seg.kind === "bg" ? (
        <AbsoluteFill style={{ opacity: bgIn }}>
          <AbstractBg seed={Math.round(trimBefore)} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** Lop B-roll: video that phu kin khung, tat tieng; che do "bg" lam mo + toi de do hoa noi ro */
const Broll: React.FC<{ b: NonNullable<RefSegment["broll"]> }> = ({ b }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const bg = b.mode === "bg";
  const z = interpolate(f, [0, durationInFrames], [1.04, 1.12]); // Ken Burns nhe cho canh tinh
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill style={{ scale: String(z), filter: bg ? "blur(16px) brightness(0.5) saturate(0.85)" : "brightness(0.92)" }}>
        <Video src={staticFile(b.src)} trimBefore={Math.round(((b.startMs ?? 0) / 1000) * fps)} muted objectFit="cover" />
      </AbsoluteFill>
      {/* toi day khung de chu trang/do noi ro */}
      <AbsoluteFill style={{ background: bg ? "rgba(15,22,32,0.35)" : "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 80%)" }} />
    </AbsoluteFill>
  );
};

/** Khung nguoi noi khi o canh tram (px tren khung 1080x1920): goc duoi-trai, tranh cot nut TikTok ben phai */
export const PIP = { x: 716, y: 236, w: 320, h: 420 } as const; // [SUA] goc TREN-PHAI: duoi thanh tab, tren cot nut; do hoa nam ben duoi

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
              <YellowCard key={i} y={RT.y.tilt} at={c.at} lines={c.lines} tilt3d upper={false} w={780} h={330} align="left" />
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
            <GlassPill key={i} text={p.text} at={p.at} y={i === 0 ? RT.y.pill1 : RT.y.pill2} rot={i === 0 ? -5 : -7} x={0.47} />
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
    case "bars":
      return <BarLadder {...it} />;
    case "priceDrop":
      return <PriceDrop {...it} />;
    case "versus":
      return <VersusCompare {...it} />;
    case "scene":
      return null;
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
  const rv = { mode: plan.reveal?.mode ?? "orig", cps: plan.reveal?.cps ?? RT.time.typeCps, keyVolume: plan.reveal?.keyVolume ?? 0, keyFiles: plan.reveal?.keyFiles } as const;
  return (
    <RevealCtx.Provider value={rv}>
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {plan.items.filter((it) => it.type === "scene").map((it, i) => (
        <Sequence key={`sc${i}`} from={toF(it.startMs)} durationInFrames={Math.max(1, toF(it.endMs) - toF(it.startMs))} name={`CANH ${"name" in it ? it.name : ""}`}>
          {it.type === "scene" ? <IllustratedScene name={it.name} cues={it.cues} /> : null}
        </Sequence>
      ))}
      {segs.map(({ s, from, dur }, i) => (
        <Sequence key={i} from={from} durationInFrames={dur} name={`${s.kind === "bg" ? "NEN" : "MAT"} ${i + 1}${s.zoomTo ? ` zoom ${s.zoomFrom}->${s.zoomTo}` : ""}`}>
          <Shot seg={s} source={s.source ?? plan.source} trimBefore={toF(s.srcStartMs)} trimAfter={toF(s.srcEndMs)} muted={!!plan.audioOverride} volume={plan.voiceVolume ?? 1} />
        </Sequence>
      ))}
      {plan.items.map((it, i) => (
        <Sequence key={i} from={toF(it.startMs)} durationInFrames={Math.max(1, toF(it.endMs) - toF(it.startMs))} name={label(it)}>
          {renderItem(it)}
        </Sequence>
      ))}
      {plan.words?.length ? (
        plan.wordsTypewriter ? <WordsTyped words={plan.words} y={plan.wordsY ?? 1344} keyVol={plan.wordsKeyVolume ?? 0} /> : <WordByWord words={plan.words} y={plan.wordsY ?? 1560} />
      ) : null}
      {plan.audioOverride ? <Audio src={staticFile(plan.audioOverride.src)} trimBefore={toF(plan.audioOverride.startMs)} /> : null}
      {plan.music ? <Audio src={staticFile(plan.music.src)} volume={plan.music.volume} /> : null}
      <SfxTrack cues={plan.sfx.map((c) => ({ frame: toF(c.atMs), sfx: c.sfx, volume: c.volume }))} />
    </AbsoluteFill>
    </RevealCtx.Provider>
  );
};

/** Phu de "chay chu" kieu go ban phim: moi tu go tung ky tu kip truoc khi tu sau bat dau (khong tieng phim). */
const WordsTyped: React.FC<{ words: WbwWord[]; y: number; keyVol: number }> = ({ words, y, keyVol }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      {words.map((w, i) => {
        const from = Math.round((w.startMs / 1000) * fps);
        const nx = words[i + 1];
        const endMs = Math.min(nx ? nx.startMs : w.endMs + 600, w.endMs + 600);
        const dur = Math.max(2, Math.round((endMs / 1000) * fps) - from);
        const cps = Math.max(22, Array.from(w.text).length / Math.max(0.12, ((endMs - w.startMs) / 1000) * 0.6));
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none" name={`W ${w.text}`}>
            <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", translate: "0 -50%" }}>
              <Typed text={w.text} cps={cps} sound={keyVol > 0} keyVol={keyVol} style={{ ...whiteText(80), color: "#FFFFFF" }} />
            </div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
