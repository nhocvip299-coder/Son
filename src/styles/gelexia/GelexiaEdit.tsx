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
  rate?: number; // toc do phat (0.8 = cham lai cho canh b-roll)
};
export type GxTag = { startMs: number; durationMs: number; line1: string; line2?: string; y?: number };
export type GxPlan = {
  source: string;
  fps: number;
  shots: GxShot[];
  items: Array<{ preset: string; startMs: number; durationMs: number; texts?: Record<string, string>; fit: CcFit; note?: string }>;
  words?: WbwWord[];
  wordsY?: number;
  accentRe?: string;
  music?: { src: string; volume: number };
  voice?: { src: string; volume: number }; // giong doc (ElevenLabs) -> nhac tu ha xuong
  musicUnderVoice?: number;
  ambientVolume?: number;
  cutSfxVolume?: number;
  handle?: string; // tag kenh goc tren
  subs?: boolean; // phu de theo cum (kieu video mau: trang IN HOA, tu khoa cam)
  subsY?: number;
  tags?: GxTag[]; // nhan dia chi vang
};
const shotMs = (s: GxShot) => (s.srcEndMs - s.srcStartMs) / (s.rate ?? 1);
export const gxDurationMs = (p: GxPlan) => p.shots.reduce((a, s) => a + shotMs(s), 0);

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
        playbackRate={s.rate ?? 1}
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

/** Phu de theo cum ~4-6 tu (kieu video mau): trang IN HOA dam, vien den, tu khoa cam. */
const SubChunk: React.FC<{ words: WbwWord[]; dur: number; re: RegExp | null; y: number }> = ({ words, dur, re, y }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fin = Math.max(1, Math.min(Math.round(0.12 * fps), Math.floor(dur / 3)));
  const fout = Math.max(1, Math.min(3, Math.floor(dur / 4)));
  const a = interpolate(f, [0, fin, Math.max(fin + 1, dur - fout), Math.max(fin + 2, dur)], [0, 1, 1, 0], clamp);
  const sc = interpolate(f, [0, Math.round(0.15 * fps)], [0.85, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <>
    <div style={{ position: "absolute", left: 0, right: 0, top: y - 130, height: 260, opacity: a * 0.9, background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.38) 30%, rgba(0,0,0,0.38) 70%, rgba(0,0,0,0) 100%)" }} />
    <div style={{ position: "absolute", left: 60, right: 60, top: y, textAlign: "center", opacity: a, scale: sc, translate: "0 -50%" }}>
      {words.map((w, i) => {
        const hot = !!re && re.test(w.text);
        return (
          <span
            key={i}
            style={{
              fontFamily: "Be Vietnam Pro, sans-serif",
              fontWeight: 900,
              fontSize: hot ? 66 : 56,
              textTransform: "uppercase",
              color: hot ? "#FF8A1F" : "#FFFFFF",
              WebkitTextStroke: "2px #000",
              paintOrder: "stroke",
              textShadow: "0 3px 0 #000, 0 0 14px rgba(0,0,0,0.6)" + (hot ? ", 0 0 18px #FF8A1Faa" : ""),
              marginRight: 14,
              lineHeight: 1.25,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
    </>
  );
};

const PhraseSubs: React.FC<{ words: WbwWord[]; y: number; accentRe?: string }> = ({ words, y, accentRe }) => {
  const { fps } = useVideoConfig();
  const re = accentRe ? new RegExp(accentRe, "i") : null;
  // gom cum: ngat o dau cau / dau phay hoac khi du 5 tu
  const chunks: WbwWord[][] = [];
  let cur: WbwWord[] = [];
  for (const w of words) {
    cur.push(w);
    if (/[.,!?:;…]$/.test(w.text) || cur.length >= 5) {
      chunks.push(cur);
      cur = [];
    }
  }
  if (cur.length) chunks.push(cur);
  return (
    <AbsoluteFill>
      {chunks.map((c, i) => {
        const from = Math.round((c[0].startMs / 1000) * fps);
        const next = chunks[i + 1];
        const endMs = next ? next[0].startMs : c[c.length - 1].endMs + 400;
        const dur = Math.max(3, Math.round((endMs / 1000) * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none" name={`Sub ${c.map((w) => w.text).join(" ")}`}>
            <SubChunk words={c.map((w) => ({ ...w, text: w.text.replace(/[,.:;]$/, "") }))} dur={dur} re={re} y={y} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/** Nhan dia chi: hop vang chu den (kieu video mau), truot vao + "pop". */
const AddressTag: React.FC<{ tag: GxTag; dur: number }> = ({ tag, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = interpolate(f, [0, Math.round(0.25 * fps), dur - Math.round(0.25 * fps), dur], [0, 1, 1, 0], clamp);
  const w = interpolate(f, [0, Math.round(0.3 * fps)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: tag.y ?? 1300, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: a }}>
      <div
        style={{
          background: "#FFD400",
          color: "#111",
          fontFamily: "Be Vietnam Pro, sans-serif",
          fontWeight: 900,
          fontSize: 50,
          padding: "12px 30px",
          borderRadius: 10,
          clipPath: `inset(0 ${(1 - w) * 100}% 0 0)`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
          whiteSpace: "nowrap",
        }}
      >
        📍 {tag.line1}
      </div>
      {tag.line2 ? (
        <div style={{ background: "rgba(0,0,0,0.75)", color: "#FFD400", fontFamily: "Be Vietnam Pro, sans-serif", fontWeight: 800, fontSize: 36, padding: "8px 22px", borderRadius: 8, clipPath: `inset(0 ${(1 - w) * 100}% 0 0)`, whiteSpace: "nowrap" }}>
          {tag.line2}
        </div>
      ) : null}
      <Audio src={staticFile("sfx/pop.wav")} volume={1} />
      <Audio src={staticFile("sfx/sparkle.wav")} volume={0.6} />
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
        const dur = Math.round((toF(s.srcEndMs) - toF(s.srcStartMs)) / (s.rate ?? 1));
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
            {/* swish: nhieu cao tan -> noi ro tren giong; whoosh lot than am cho canh zoom */}
            <Audio src={staticFile("sfx/swish.wav")} volume={s.trans === "flash" ? 1 : (plan.cutSfxVolume ?? 0.8)} />
            {s.trans === "zoom" ? <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} /> : null}
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
      {plan.tags?.map((t, i) => (
        <Sequence key={`tag${i}`} from={toF(t.startMs)} durationInFrames={toF(t.durationMs)} name={`Tag ${t.line1}`}>
          <AddressTag tag={t} dur={toF(t.durationMs)} />
        </Sequence>
      ))}
      {plan.words && plan.subs ? <PhraseSubs words={plan.words} y={plan.subsY ?? 560} accentRe={plan.accentRe} /> : null}
      {plan.words && !plan.subs ? <WordByWord words={plan.words} y={plan.wordsY} accentRe={plan.accentRe} /> : null}
      {plan.handle ? <Handle text={plan.handle} /> : null}
      {plan.voice ? <Audio src={staticFile(plan.voice.src)} volume={plan.voice.volume} /> : null}
      {plan.music ? <Audio src={staticFile(plan.music.src)} volume={plan.voice ? (plan.musicUnderVoice ?? 0.17) : plan.music.volume} /> : null}
    </AbsoluteFill>
  );
};
