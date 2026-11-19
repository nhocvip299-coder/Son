import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { WordByWord } from "../textPresets/capcut/WordByWord";
import { QtGrade, QtLightLeak, QtPersonFront, type QtWord } from "../quyetTranLux/components";
import { QtGlassText } from "../quyetTranLux/glass";
import HITS from "../quyetTranLux/sfxHits.json";
import { LuxCaptions, type CapZone } from "./captions";
import { Letterbox, RoadText, WhipBlur, WhiteFlash } from "./fill";
import { SerifTitle, SpecBox, StackText } from "./typo";

/**
 * HAPPY HOME PHỐ HIẾN (Vinhomes, Hưng Yên) — skill bds-luxury, phoi style + TRAM CANH THAT (sa ban, nha mau):
 *  0-6.9   gia: so SON VANG CHAMPAGNE duoi chan (40TR/M², 3 TỶ), nguoi dung truoc chu
 *  6.9-9.1 C cao toc (sa ban dai lo) | 9.1-13.3 D dien anh (mat tien nha mau) | 13.3-15.9 vang "cuc ky dac dia"
 *  15.9-25.95 C tien ich (sa ban lia) | 25.95-33.4 B bac ha 303 can / Thinh Vuong / nga tu (sa ban co, dai lo)
 *  33.4-39.9 vang: Hoc vien CSND + "800M" son duong | 39.9-45.55 vang truc xuong song (sa ban) | 45.55- A kinh vang -> D dong + SĐT
 */
const SRC = "inputs/du-an-moi/goc-1080.mp4";
const MATTE = "inputs/du-an-moi/matte/person.webm";
const BR = (n: string) => `inputs/du-an-moi/broll/IMG_00${n}.mp4`;
const SRC_END = 51.3;
export const HAPPY_HOME_SEC = 53.6;
const CLOSE_AT = 49.4;
const hitOf = (s: string) => (HITS as Record<string, number>)[s.replace("real/", "")] ?? 0;

type Sfx = SfxCue["sfx"];
const TING: Sfx = "real/lux-ting", DING: Sfx = "real/lux-ding", TICK: Sfx = "real/lux-tick";
const WHIP: Sfx = "real/lux-whip", BOOM: Sfx = "real/lux-boom", TXT: Sfx = "real/qtl-sparkle-whoosh-2", SOFT: Sfx = "real/qtl-sparkle-sweep", OUT: Sfx = "real/qtl-pop-whoosh-hot", TRN: Sfx = "real/qtl-transition";
const ticks = (t: number, n = 4, gap = 0.13): Array<[number, Sfx, number]> => Array.from({ length: n }, (_v, i) => [t + 0.1 + i * gap, TICK, 0.55] as [number, Sfx, number]);

// [bat dau, ket thuc, file, giay nguon bat dau]
const BROLL: Array<[number, number, string, number]> = [
  [6.9, 9.1, "58", 8.0],
  [9.1, 13.3, "52", 0.0],
  [15.9, 21.4, "54", 0.0],
  [21.4, 25.95, "57", 0.0],
  [25.95, 28.0, "55", 6.0],
  [28.0, 29.3, "56", 0.5],
  [29.3, 33.4, "60", 0.0],
  [39.9, 44.1, "61", 0.0],
  [44.1, 45.55, "62", 0.0],
];
const WHIPS = [6.9, 13.3, 25.95, 33.4, 39.9];

const CUES: Array<[number, Sfx, number]> = [
  // gia
  [0.62, DING, 1], ...ticks(0.62), [1.95, OUT, 0.8], [3.9, DING, 1], ...ticks(3.9, 3), [5.99, TING, 1],
  // cao toc + dien anh
  [6.9, WHIP, 1], [7.85, TXT, 1], [9.1, TRN, 1], [11.02, BOOM, 1], [11.02, SOFT, 0.8], [12.55, DING, 0.9], [13.3, WHIP, 1],
  [14.15, TING, 1], [15.9, TRN, 1],
  // tien ich
  [18.84, TXT, 1], [19.75, OUT, 0.8], [19.84, TXT, 1], [21.01, TXT, 1], [24.28, TXT, 1], [25.24, TXT, 1],
  // 303 can, thinh vuong, nga tu
  [25.95, WHIP, 1], [26.6, TING, 1], ...ticks(26.6, 5), [28.35, TING, 1], [29.4, TING, 1], [30.1, SOFT, 0.8], [32.59, TING, 1],
  // hoc vien + 800M
  [33.4, WHIP, 1], [35.5, TING, 1], [37.7, OUT, 0.8], [38.24, DING, 1], ...ticks(38.24),
  // truc xuong song
  [39.9, WHIP, 1], [40.91, TXT, 1], [42.78, TXT, 1], [43.86, TXT, 1], [44.8, SOFT, 1],
  // A + dong
  [45.55, TRN, 1], [48.02, TXT, 1], [48.35, SOFT, 0.8], [CLOSE_AT + 0.1, BOOM, 0.9], [50.42, DING, 1],
];

const ZONES: CapZone[] = [
  { from: 0, to: 6.9, kind: "plain", y: 0.7 },
  { from: 6.9, to: 9.1, kind: "plain", y: 0.79 },
  { from: 9.1, to: 13.3, kind: "cinema", y: 0.872 },
  { from: 13.3, to: 25.95, kind: "plain", y: 0.79 },
  { from: 25.95, to: 33.4, kind: "box", y: 0.74 },
  { from: 33.4, to: 39.9, kind: "box", y: 0.68 },
  { from: 39.9, to: CLOSE_AT, kind: "box", y: 0.74 },
  { from: CLOSE_AT, to: 99, kind: "cinema", y: 0.872 },
];

const Whips: React.FC<{ times: number[]; children: React.ReactNode }> = ({ times, children }) =>
  times.reduce<React.ReactNode>((acc, t, i) => <WhipBlur at={t} dir={i % 2 ? -1 : 1}>{acc}</WhipBlur>, children) as React.ReactElement;

export type HappyHomeProps = { captions: "phrase" | "wbw"; words: QtWord[]; stem?: "all" | "sfx" | "voice" };

export const HappyHome: React.FC<HappyHomeProps> = ({ captions, words, stem = "all" }) => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  const cues: SfxCue[] = CUES.map(([t, sfx, v]) => ({ frame: Math.max(0, s(t + 0.08 - hitOf(sfx))), sfx, volume: v }));
  const front = (a: number, b: number, name: string) => (
    <Sequence from={s(a)} durationInFrames={s(b - a)} name={name}>
      <QtPersonFront src={staticFile(MATTE)} startFrom={a} />
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Whips times={WHIPS}>
        <QtGrade>
          <Sequence durationInFrames={s(SRC_END)} name="Video goc">
            <OffthreadVideo src={staticFile(SRC)} muted={stem === "sfx"} />
          </Sequence>
          <Sequence from={s(SRC_END)} name="Giu khung cuoi (SĐT)">
            <Freeze frame={s(SRC_END) - 2}>
              <OffthreadVideo src={staticFile(SRC)} muted />
            </Freeze>
          </Sequence>
          {BROLL.map(([a, b, f, ss]) => (
            <Sequence key={f} from={s(a)} durationInFrames={s(b - a)} name={`Tram ${f}`}>
              <OffthreadVideo src={staticFile(BR(f))} startFrom={s(ss)} muted />
            </Sequence>
          ))}
        </QtGrade>
      </Whips>

      {/* ===== 0-6.9 GIA: so son vang duoi chan ===== */}
      <RoadText value={40} unit="TR/M²" at={0.62} end={1.95} y={0.985} size={190} x={0.7} tint="gold" />
      <RoadText value={3} unit=" TỶ" at={3.9} end={5.6} y={0.985} size={280} x={0.74} tint="gold" />
      {front(0.5, 5.9, "Nguoi truoc chu gia")}
      <StackText id="h1" palette="gold" y={0.1} size={90} end={1.95} exit="toLeft" lines={[{ text: "giá chỉ từ", role: "lead", at: 0.05, italic: true, size: 54 }]} />
      <StackText id="h2" palette="gold" y={0.1} size={90} end={5.4} exit="blurUp" lines={[{ text: "tài chính chỉ dưới", role: "lead", at: 2.3, italic: true, size: 54 }]} />
      <StackText id="h3" palette="gold" y={0.11} size={120} end={6.75} exit="blurUp" lines={[{ text: "sở hữu ngay", role: "lead", at: 5.33, italic: true, size: 50 }, { text: "Nhà phố", role: "main", at: 5.99 }]} />

      {/* ===== 6.9-9.1 C: cao toc (sa ban dai lo) ===== */}
      <StackText id="c1" palette="white" y={0.15} size={150} end={9.0} exit="blurUp" lines={[{ text: "bám mặt đường", role: "lead", at: 6.95 }, { text: "CAO TỐC", role: "main", at: 7.85 }, { text: "Hưng Yên – Thái Bình", role: "sub", at: 8.44 }]} />

      {/* ===== 9.1-13.3 D: dien anh (mat tien nha mau) ===== */}
      <WhiteFlash at={9.1} />
      <Letterbox at={9.1} end={13.0} />
      <SerifTitle text="HAPPY HOME" at={11.02} end={13.0} y={0.235} size={112} />
      <SerifTitle text="Phố Hiến" at={11.33} end={13.0} y={0.295} size={64} italic />
      <SpecBox top="CHỦ ĐẦU TƯ" main="Vinhomes" at={12.5} end={13.25} x={0.95} y={0.42} w={400} />

      {/* ===== 13.3-15.9 vang: vi tri ===== */}
      <StackText id="v1" palette="gold" y={0.1} size={96} end={15.8} exit="blurUp" lines={[{ text: "toạ lạc tại vị trí", role: "lead", at: 13.35, italic: true, size: 48 }, { text: "Cực kỳ đắc địa", role: "main", at: 14.15 }, { text: "thành phố Hưng Yên", role: "sub", at: 15.14, size: 44 }]} />

      {/* ===== 15.9-25.95 C: tien ich (sa ban) ===== */}
      <WhiteFlash at={15.9} />
      <StackText id="t1" palette="white" y={0.15} size={150} end={19.75} exit="toLeft" lines={[{ text: "kết nối đầy đủ tiện ích", role: "lead", at: 16.73 }, { text: "BỆNH VIỆN", role: "main", at: 18.84 }]} />
      <StackText id="t2" palette="white" y={0.15} size={140} end={20.9} exit="toLeft" lines={[{ text: "Đại học", role: "lead", at: 19.5 }, { text: "CHU VĂN AN", role: "main", at: 19.84 }]} />
      <StackText id="t3" palette="white" y={0.15} size={150} end={22.4} exit="scaleOut" lines={[{ text: "Đại học", role: "lead", at: 20.64 }, { text: "THỦY LỢI", role: "main", at: 21.01 }]} />
      <StackText id="t4" palette="white" y={0.15} size={140} end={24.95} exit="toLeft" lines={[{ text: "các khu công nghiệp", role: "lead", at: 22.6 }, { text: "KCN DỊ CHẾ", role: "main", at: 24.28 }]} />
      <StackText id="t5" palette="white" y={0.15} size={120} end={25.85} exit="blurUp" lines={[{ text: "KCN QUẢNG LÃNG", role: "main", at: 25.24 }, { text: "Ân Thi", role: "sub", at: 25.65 }]} />

      {/* ===== 25.95-33.4 B: bac ha (sa ban) ===== */}
      <StackText id="q1" y={0.15} size={200} end={27.95} exit="toLeft" lines={[{ text: "quỹ căn", role: "lead", at: 26.0, italic: true }, { text: "{n} CĂN", role: "main", at: 26.6, count: { to: 303 } }]} />
      <StackText id="q2" y={0.15} size={170} end={29.25} exit="blurUp" lines={[{ text: "phân khu", role: "lead", at: 28.06, italic: true }, { text: "Thịnh Vượng", role: "main", at: 28.35 }]} />
      <StackText id="n1" y={0.15} size={140} end={31.15} exit="toLeft" lines={[{ text: "nằm giữa", role: "lead", at: 29.3, italic: true }, { text: "Ngã tư giao lộ", role: "main", at: 29.4 }, { text: "cao tốc Hưng Yên – Hà Nội", role: "sub", at: 30.1 }]} />
      <StackText id="n2" y={0.15} size={150} end={33.3} exit="scaleOut" lines={[{ text: "trục đường nối thẳng", role: "lead", at: 31.3, italic: true }, { text: "TP Hưng Yên", role: "main", at: 32.59 }]} />

      {/* ===== 33.4-39.9 vang: Hoc vien + 800M son duong ===== */}
      <RoadText value={800} unit="M" at={38.24} end={39.75} y={0.985} size={260} x={0.25} drift={20} tint="gold" />
      {front(38.1, 39.9, "Nguoi truoc chu 800M")}
      <StackText id="p1" palette="gold" y={0.1} size={110} end={37.7} exit="toLeft" lines={[{ text: "phân hiệu", role: "lead", at: 34.47, italic: true, size: 48 }, { text: "Học viện", role: "main", at: 35.5 }, { text: "Cảnh sát Nhân dân", role: "sub", at: 35.83, size: 46 }]} />
      <StackText id="p2" palette="gold" y={0.1} size={80} end={39.75} exit="blurUp" lines={[{ text: "chỉ khoảng", role: "lead", at: 37.8, italic: true, size: 50 }]} />

      {/* ===== 39.9-45.55 vang: truc xuong song (sa ban) ===== */}
      <StackText id="x1" palette="gold" y={0.13} size={130} end={42.3} exit="toLeft" lines={[{ text: "trục xương sống", role: "lead", at: 40.4, italic: true, size: 50 }, { text: "Huyết mạch", role: "main", at: 40.91 }, { text: "tỉnh Hưng Yên", role: "sub", at: 41.6, size: 46 }]} />
      <StackText id="x2" palette="gold" y={0.13} size={120} end={44.05} exit="blurUp" lines={[{ text: "kết nối", role: "lead", at: 42.4, italic: true, size: 50 }, { text: "Thái Bình", role: "main", at: 42.78, dx: -0.1 }, { text: "Hà Nội", role: "main", at: 43.86, dx: 0.12 }]} />
      <StackText id="x3" palette="gold" y={0.13} size={130} end={45.45} exit="scaleOut" lines={[{ text: "chỉ trong", role: "lead", at: 44.2, italic: true, size: 50 }, { text: "1 nốt nhạc", role: "main", at: 44.8 }]} />

      {/* ===== 45.55- A kinh vang -> D dong ===== */}
      <Sequence from={s(45.3)} durationInFrames={s(0.6)} name="Vet sang chuyen canh"><QtLightLeak /></Sequence>
      <QtGlassText id="cta" lines={["HAPPY HOME", "PHỐ HIẾN"]} lineAt={[48.02, 48.35]} end={49.3} x={0.5} y={0.1} size={120} enter={["fromLeft", "fromRight"]} exit="blurUp" gap={0.95} tint="gold" />
      <Letterbox at={CLOSE_AT} end={99} />
      <SerifTitle text="HAPPY HOME PHỐ HIẾN" at={CLOSE_AT + 0.1} end={99} y={0.088} size={70} dur={1.0} />
      <SpecBox top="LIÊN HỆ EM SƠN" main="0966 312 333" at={50.42} end={99} x={0.95} y={0.62} w={500} />

      {captions === "phrase" ? <LuxCaptions words={words} zones={ZONES} /> : <WordByWord words={words} y={1385} />}
      {stem === "all" ? <Audio src={staticFile("music/bed-ambient.wav")} volume={0.1} loop /> : null}
      {stem === "voice" ? null : <SfxTrack cues={cues} />}
    </AbsoluteFill>
  );
};
