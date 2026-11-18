import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { WordByWord } from "../textPresets/capcut/WordByWord";
import { QtGrade, QtPersonFront, type QtWord } from "../quyetTranLux/components";
import HITS from "../quyetTranLux/sfxHits.json";
import { LuxCaptions, type CapZone } from "./captions";
import { FreezeScan, Letterbox, PhotoCard, RoadText, WhipBlur, WhiteFlash } from "./fill";
import { SerifTitle, SpecBox, StackText } from "./typo";

/**
 * DEMO bds-luxury tren San Hô 09-2 (0 -> 42.4s): MOI PHAN DOAN MOT STYLE, chuyen style bang chuyen canh.
 *  0-7.95    D "Dien anh"     : letterbox, serif gian chu, khung thong so ve dan, boom.
 *  7.95-19.95 B "Boc tach so" : chu bac ha + so chay, card anh bat len, DONG BANG + quet tang (4 tang + 1 tum).
 *  19.95-33.9 C "Ha tang trang": nhay trang, chu trang dam dan/chinh/phu, phu de tron.
 *  33.9-42.4 B' "Khoang cach" : so khoang cach son tren MAT DUONG, nguoi dung truoc chu, nhan dia danh tren cao.
 */
const SRC = "inputs/san-ho-lux-1080.mp4";
const MATTE = "inputs/sanho-matte/person.webm";
export const LUX_DEMO_SEC = 42.4;
const hitOf = (s: string) => (HITS as Record<string, number>)[s.replace("real/", "")] ?? 0;

type Sfx = SfxCue["sfx"];
const TING: Sfx = "real/lux-ting", DING: Sfx = "real/lux-ding", TICK: Sfx = "real/lux-tick", POP: Sfx = "real/lux-pop", SHUT: Sfx = "real/lux-shutter";
const WHIP: Sfx = "real/lux-whip", BOOM: Sfx = "real/lux-boom", TXT: Sfx = "real/qtl-sparkle-whoosh-2", SOFT: Sfx = "real/qtl-sparkle-sweep", OUT: Sfx = "real/qtl-pop-whoosh-hot", TRN: Sfx = "real/qtl-transition";
const ticks = (t: number, n = 4, gap = 0.13): Array<[number, Sfx, number]> => Array.from({ length: n }, (_v, i) => [t + 0.1 + i * gap, TICK, 0.55] as [number, Sfx, number]);

export const LUX_DEMO_CUES: Array<[number, Sfx, number]> = [
  // D
  [1.39, SOFT, 0.9], [6.12, BOOM, 1], [6.12, SOFT, 0.8], [6.75, DING, 0.9], [7.95, WHIP, 1],
  // B
  [9.36, TING, 1], [11.51, TING, 1], ...ticks(11.51), [14.39, TING, 1], ...ticks(14.39, 5), [15.85, POP, 1], [17.2, OUT, 0.8],
  [18.3, SHUT, 1], ...ticks(18.35, 5, 0.2), [18.55, DING, 0.9], [19.0, TING, 1],
  // C
  [19.95, TRN, 1], [20.38, TXT, 1], [22.23, DING, 1], ...ticks(22.23, 3), [22.95, OUT, 0.8], [23.76, TXT, 1], [25.2, OUT, 0.8], [28.16, TXT, 1], [28.9, OUT, 0.8],
  [30.1, TXT, 1], [31.55, SOFT, 0.7], [33.13, TXT, 1],
  // B' khoang cach
  [33.9, WHIP, 1], [34.65, TING, 1], [35.7, DING, 1], ...ticks(35.7), [36.3, OUT, 0.7], [36.49, TING, 1], [37.35, DING, 1], ...ticks(37.35), [38.1, OUT, 1],
  [39.24, TING, 1], [41.31, DING, 1], ...ticks(41.31),
];

export const LUX_DEMO_ZONES: CapZone[] = [
  { from: 0, to: 7.95, kind: "cinema", y: 0.872 },
  { from: 7.95, to: 19.95, kind: "box", y: 0.74 },
  { from: 19.95, to: 33.9, kind: "plain", y: 0.79 },
  { from: 33.9, to: 99, kind: "box", y: 0.66 },
];

export type LuxDemoProps = { captions: "phrase" | "wbw"; words: QtWord[]; stem?: "all" | "sfx" | "voice"; bare?: boolean };

/** bare = chi hinh + chu (khong phu de, nhac, SFX) -> de ghep vao ban dung dai hon (SanHoMix). */
export const BdsLuxuryDemo: React.FC<LuxDemoProps> = ({ captions, words, stem = "all", bare = false }) => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  const cues: SfxCue[] = LUX_DEMO_CUES.map(([t, sfx, v]) => ({ frame: Math.max(0, s(t + 0.08 - hitOf(sfx))), sfx, volume: v }));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <WhipBlur at={7.95}>
        <WhipBlur at={33.9} dir={-1}>
          <QtGrade>
            <OffthreadVideo src={staticFile(SRC)} muted={stem === "sfx"} />
          </QtGrade>
        </WhipBlur>
      </WhipBlur>

      {/* ===== D: DIEN ANH (0 - 7.95) ===== */}
      <Letterbox at={0} end={7.6} />
      <SerifTitle text="CĂN LIỀN KỀ" at={1.39} end={3.5} y={0.235} size={92} />
      <SerifTitle text="vừa ở · vừa kinh doanh" at={2.2} end={3.5} y={0.29} size={56} italic />
      <SerifTitle text="SAN HÔ 09-2" at={6.12} end={7.55} y={0.27} size={128} dur={0.9} />
      <SpecBox top="CĂN GÓC · 132 m²" main="4 tầng + 1 tum" at={6.75} end={7.55} x={0.95} y={0.42} />

      {/* ===== B: BOC TACH SO LIEU (7.95 - 19.95) ===== */}
      <StackText id="cg" y={0.2} size={170} end={10.4} exit="blurUp" lines={[{ text: "căn liền kề này là", role: "lead", at: 8.3, italic: true }, { text: "Căn góc", role: "main", at: 9.36 }]} />
      <StackText id="dt" y={0.2} size={190} end={12.45} exit="toLeft" lines={[{ text: "diện tích đất", role: "lead", at: 10.57, italic: true }, { text: "{n} M²", role: "main", at: 11.51, count: { to: 132 } }]} />
      <StackText id="xd" y={0.2} size={180} end={15.5} exit="scaleOut" lines={[{ text: "diện tích xây dựng", role: "lead", at: 13.0, italic: true }, { text: "{n} M²", role: "main", at: 14.39, count: { to: 486.5, dec: 1, dur: 0.8 } }]} />
      <PhotoCard img="inputs/sanho-stills/b17.6.jpg" label="SAN HÔ 09-2" at={15.85} end={17.2} x={0.5} y={0.235} w={0.6} h={0.25} crop="50% 45%" />
      <FreezeScan
        src={SRC}
        srcFrameSec={17.6}
        at={18.3}
        end={19.95}
        markAt={18.42}
        marks={[
          { label: "TẦNG 1", y: 0.915 },
          { label: "TẦNG 2", y: 0.71 },
          { label: "TẦNG 3", y: 0.52 },
          { label: "TẦNG 4", y: 0.375 },
          { label: "TUM", y: 0.275 },
        ]}
      />
      <StackText id="tang" y={0.1} size={150} end={19.7} exit="fadeDown" lines={[{ text: "4 tầng", role: "main", at: 18.55, dx: -0.12 }, { text: "+ 1 tum", role: "main", at: 19.0, dx: 0.14 }]} />

      {/* ===== C: HA TANG TRANG (19.95 - 33.9) ===== */}
      <WhiteFlash at={19.95} />
      <StackText id="w1" palette="white" y={0.33} size={170} end={22.95} lines={[
        { text: "nằm giữa", role: "lead", at: 20.05 },
        { text: "NGÃ 3", role: "main", at: 20.38 },
        { text: "mặt tiền lên tới", role: "sub", at: 21.38 },
      ]} />
      {/* 8M son tren mat duong truoc toa nha (doan quay cong trinh, khong nguoi) */}
      <RoadText value={8} unit="M" at={22.23} end={22.85} y={0.97} size={340} tint="gold" />
      <StackText id="w2" palette="white" y={0.15} size={140} end={25.2} exit="toRight" lines={[{ text: "phù hợp", role: "lead", at: 22.95 }, { text: "KINH DOANH", role: "main", at: 23.76 }, { text: "ở tầng 1", role: "sub", at: 24.76 }]} />
      <StackText id="w3" palette="white" y={0.15} size={150} end={28.9} exit="toLeft" lines={[{ text: "khai thác cho thuê", role: "lead", at: 27.26 }, { text: "HOMESTAY", role: "main", at: 28.16 }]} />
      <StackText id="w4" palette="white" y={0.15} size={130} end={32.15} lines={[{ text: "tình trạng", role: "lead", at: 29.3 }, { text: "BÀN GIAO THÔ", role: "main", at: 30.1 }, { text: "có cầu thang", role: "sub", at: 31.55 }]} />
      <StackText id="w5" palette="white" y={0.15} size={140} end={33.75} exit="scaleOut" lines={[{ text: "vị trí", role: "lead", at: 32.86 }, { text: "SIÊU ĐẶC ĐỊA", role: "main", at: 33.13 }]} />

      {/* ===== B': KHOANG CACH TREN MAT DUONG (33.9 - 42.4) ===== */}
      <RoadText value={300} unit="M" at={35.7} end={36.3} y={0.985} drift={30} tint="gold" />
      <RoadText value={500} unit="M" at={37.35} end={38.1} y={0.985} drift={30} tint="gold" />
      <RoadText value={400} unit="M" at={41.31} end={42.0} y={0.985} drift={30} tint="gold" />
      <Sequence from={s(34.15)} name="Nguoi dung TRUOC chu son duong">
        <QtPersonFront src={staticFile(MATTE)} startFrom={34.15} />
      </Sequence>
      <StackText id="d1" palette="gold" y={0.17} size={74} end={36.3} exit="toLeft" lines={[{ text: "cách quảng trường", role: "lead", at: 34.08, italic: true, size: 46 }, { text: "Kinh Đô Ánh Sáng", role: "main", at: 34.65 }]} />
      <StackText id="d2" palette="gold" y={0.17} size={76} end={38.1} exit="toLeft" lines={[{ text: "cách", role: "lead", at: 36.16, italic: true, size: 46 }, { text: "Vincom Mega Mall", role: "main", at: 36.49 }]} />
      <StackText id="d3" palette="gold" y={0.17} size={92} end={42.0} exit="blurUp" lines={[{ text: "công viên", role: "lead", at: 38.56, italic: true, size: 46 }, { text: "Wonder Park", role: "main", at: 39.24 }]} />

      {bare ? null : captions === "phrase" ? <LuxCaptions words={words} zones={LUX_DEMO_ZONES} /> : <WordByWord words={words} y={1385} />}
      {!bare && stem === "all" ? <Audio src={staticFile("music/bed-ambient.wav")} volume={0.1} loop /> : null}
      {bare || stem === "voice" ? null : <SfxTrack cues={cues} />}
    </AbsoluteFill>
  );
};
