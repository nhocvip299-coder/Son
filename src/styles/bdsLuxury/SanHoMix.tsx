import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { WordByWord } from "../textPresets/capcut/WordByWord";
import { QtPhraseCaptions, type QtWord } from "../quyetTranLux/components";
import { CUES as A_CUES, SANHO_FULL_SEC, SanHoTailA } from "../quyetTranLux/SanHoLuxFull";
import HITS from "../quyetTranLux/sfxHits.json";
import { LuxCaptions, type CapZone } from "./captions";
import { Letterbox } from "./fill";
import { BdsLuxuryDemo, LUX_DEMO_CUES, LUX_DEMO_ZONES } from "./SanHoDemo";
import { SerifTitle, SpecBox } from "./typo";

/**
 * BAN 57s PHOI DU 4 STYLE (skill bds-luxury) — San Hô 09-2:
 *  0-7.95 D dien anh | 7.95-19.95 B boc tach so | 19.95-33.9 C ha tang trang | 33.9-42.4 B' khoang cach son duong
 *  42.4-54.4 A kinh vang (LINH HOẠT sau dau, 3 phuong an, vua KD vua o, Ocean Park 2)
 *  54.4-het  D dong lai (letterbox + serif ten du an trong thanh den + khung lien he) — doi xung voi mo dau.
 */
export const SANHO_MIX_SEC = SANHO_FULL_SEC;
const hitOf = (s: string) => (HITS as Record<string, number>)[s.replace("real/", "")] ?? 0;
type Sfx = SfxCue["sfx"];
const CLOSE_AT = 54.45;

const CUES: Array<[number, Sfx, number]> = [
  ...LUX_DEMO_CUES,
  ...A_CUES.filter(([t]) => t >= 42.6 && t < CLOSE_AT),
  [CLOSE_AT + 0.1, "real/qtl-sparkle-sweep", 1],
  [55.5, "real/lux-ding", 1],
];

const ZONES: CapZone[] = [...LUX_DEMO_ZONES.map((z) => (z.to > 42.4 ? { ...z, to: 42.4 } : z)), { from: CLOSE_AT, to: 99, kind: "cinema", y: 0.872 }];
// style A: phu de cum Qt (tat khi co tieu de lon), chi trong 42.4 -> CLOSE_AT
const A_MUTE: Array<[number, number]> = [[0, 42400], [44800, 47400], [49400, 51400], [53300, 54800], [CLOSE_AT * 1000, 99999]];

export type SanHoMixProps = { captions: "phrase" | "wbw"; words: QtWord[]; stem?: "all" | "sfx" | "voice" };

export const SanHoLuxMix: React.FC<SanHoMixProps> = ({ captions, words, stem = "all" }) => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  const cues: SfxCue[] = CUES.map(([t, sfx, v]) => ({ frame: Math.max(0, s(t + 0.08 - hitOf(sfx))), sfx, volume: v }));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 0 -> 42.4: 4 phan doan D/B/C/B' (video nguon chay suot ca ban) */}
      <BdsLuxuryDemo captions={captions} words={words} stem={stem} bare />
      {/* 42.4 -> 54.4: style A kinh vang da duyet */}
      <SanHoTailA contact={false} />
      {/* 54.4 -> het: dong lai bang dien anh */}
      <Letterbox at={CLOSE_AT} end={99} />
      <SerifTitle text="SAN HÔ 09-2" at={CLOSE_AT + 0.1} end={99} y={0.088} size={92} dur={1.0} />
      <SpecBox top="LIÊN HỆ TRỰC TIẾP" main="Em Sơn" at={55.5} end={99} x={0.95} y={0.62} w={440} />
      {captions === "phrase" ? (
        <>
          <LuxCaptions words={words} zones={ZONES} />
          <QtPhraseCaptions words={words} y={0.72} mute={A_MUTE} />
        </>
      ) : (
        <WordByWord words={words} y={1385} />
      )}
      {stem === "all" ? <Audio src={staticFile("music/bed-ambient.wav")} volume={0.1} loop /> : null}
      {stem === "voice" ? null : <SfxTrack cues={cues} />}
    </AbsoluteFill>
  );
};
