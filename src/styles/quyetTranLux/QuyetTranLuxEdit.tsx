import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio, Video } from "@remotion/media";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue, SfxName } from "../../lib/theme";
import { WordByWord } from "../textPresets/capcut/WordByWord";
import { QtCardStack, QtDip, QtFlash, QtGrade, QtHeading, QtNegative, QtNumber, QtPhraseCaptions, QtRunText, QtTitle, QtTrackingReveal, type QtWord } from "./components";

/** Ke hoach dung "Mau Quyet Tran Lux": item neo theo chi so tu (at) hoac giay (atSec). */
export type QtlItem = {
  type: "title" | "tracking" | "number" | "heading" | "cards" | "flash" | "dip" | "run" | "neg";
  /** run: cac dong, moi manh neo theo chi so tu (at) */
  lines?: Array<{ align?: "left" | "right" | "center"; pieces: Array<{ text: string; kind: "lead" | "main"; at: number; fx?: "slide" | "neg" }> }>;
  /** neg: cac dong am ban + chi so tu bat dau moi dong */
  negLines?: string[];
  negAt?: number[];
  cross?: boolean;
  x?: number;
  size?: number;
  at?: number;
  atSec?: number;
  dur?: number;
  lead?: string;
  main?: string;
  text?: string;
  value?: string;
  unit?: string;
  y?: number;
  images?: string[];
  title?: string[];
  label?: string;
  sfx?: SfxName;
  sfxVolume?: number;
};
export type QtlPlan = {
  source: string;
  fps: number;
  captionY?: number;
  music?: { src: string; volume: number };
  items: QtlItem[];
  words: QtWord[];
  durationSec: number;
  /** "phrase" = phu de cum (dung mau); "wbw" = chay chu tung chu (yeu cau co dinh cua nguoi dung) */
  captions: "phrase" | "wbw";
};

const wSec = (words: QtWord[], i: number) => (words[i]?.startMs ?? 0) / 1000;
export const qtlItemStart = (it: QtlItem, words: QtWord[]) => {
  if (it.atSec !== undefined) return it.atSec - 0.05;
  if (it.type === "run" && it.lines) return Math.min(...it.lines.flatMap((l) => l.pieces.map((p) => wSec(words, p.at)))) - 0.08;
  return wSec(words, it.at ?? 0) - 0.05;
};

export const QuyetTranLuxEdit: React.FC<{ plan: QtlPlan }> = ({ plan }) => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.max(0, Math.round(sec * fps));
  const end = plan.durationSec;
  const spans = plan.items.map((it) => {
    const st = qtlItemStart(it, plan.words);
    const dur = Math.min(it.dur ?? 0.6, end - st);
    return { it, st, dur };
  });
  const mute: Array<[number, number]> = spans
    .filter(({ it }) => !["flash", "dip"].includes(it.type))
    .map(({ st, dur }) => [st * 1000, (st + dur) * 1000]);
  const cues: SfxCue[] = spans
    .filter(({ it }) => it.sfx)
    .flatMap(({ it, st }) => {
      const base = { frame: s(st), sfx: it.sfx as SfxName, volume: it.sfxVolume ?? (it.type === "flash" ? 0.9 : 0.75) };
      return it.type === "flash" ? [base, { frame: s(st + 0.05), sfx: "shine" as SfxName, volume: 0.7 }] : [base];
    });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <QtGrade>
        <Video src={staticFile(plan.source)} objectFit="cover" />
      </QtGrade>
      {spans.map(({ it, st, dur }, i) => {
        const name = `${i} ${it.type} ${it.main ?? it.text ?? it.value ?? ""}`;
        const node = (() => {
          switch (it.type) {
            case "title":
              return <QtTitle lead={it.lead} main={it.main ?? ""} y={it.y} duration={dur} />;
            case "tracking":
              return <QtTrackingReveal lead={it.lead} main={it.main ?? ""} y={it.y} duration={dur} seed={String(i)} />;
            case "number":
              return <QtNumber lead={it.lead} value={it.value ?? ""} unit={it.unit} x={0.14} y={it.y ?? 0.64} duration={dur} />;
            case "heading":
              return <QtHeading lead={it.lead} text={it.text ?? ""} y={it.y} duration={dur} />;
            case "cards":
              return <QtCardStack images={(it.images ?? []).map((p) => staticFile(p))} title={it.title} label={it.label} duration={dur} />;
            case "run":
              return (
                <QtRunText
                  y={it.y}
                  size={it.size}
                  duration={dur}
                  lines={(it.lines ?? []).map((l) => ({ align: l.align, pieces: l.pieces.map((p) => ({ text: p.text, kind: p.kind, fx: p.fx, t: wSec(plan.words, p.at) - st - 0.05 })) }))}
                />
              );
            case "neg":
              return (
                <QtNegative
                  lead={it.lead}
                  lines={it.negLines ?? []}
                  lineAt={(it.negAt ?? []).map((a) => wSec(plan.words, a) - st - 0.03)}
                  cross={it.cross}
                  y={it.y}
                  x={it.x}
                  size={it.size}
                  duration={dur}
                  seed={String(i)}
                />
              );
            case "flash":
              return <QtFlash />;
            case "dip":
              return <QtDip />;
          }
        })();
        const len = it.type === "flash" ? 0.6 : it.type === "dip" ? 0.8 : dur;
        return (
          <Sequence key={i} from={s(st)} durationInFrames={Math.max(1, s(len))} name={name}>
            {node}
          </Sequence>
        );
      })}
      {plan.captions === "phrase" ? (
        <QtPhraseCaptions words={plan.words} y={plan.captionY ?? 0.7} mute={mute} />
      ) : (
        <WordByWord words={plan.words} y={Math.round((plan.captionY ?? 0.7) * 1920)} />
      )}
      {plan.music ? <Audio src={staticFile(plan.music.src)} volume={plan.music.volume} loop /> : null}
      <SfxTrack cues={cues} />
    </AbsoluteFill>
  );
};
