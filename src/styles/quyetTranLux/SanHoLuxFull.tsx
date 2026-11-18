import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { WordByWord } from "../textPresets/capcut/WordByWord";
import { QtBehindText, QtGrade, QtLightLeak, QtPersonFront, QtPhraseCaptions, type QtWord } from "./components";
import { QtGlassText } from "./glass";
import { QtLineIcon } from "./lineIcon";
import type { KfIn, KfOut } from "./keyframes";
import { KText } from "./visuals";
import HITS from "./sfxHits.json";

/**
 * BAN DUNG HOAN CHINH "San Hô 09-2" theo Mau Quyet Tran Lux — phong cach da duyet (v8):
 * chu kinh vang am + bong sac, icon net manh vang (kieu D), keyframe vao/ra da dang, SFX that gon canh hit,
 * khong de chu/icon len mat (dai trong tren dau theo faces.json), "LINH HOẠT" nam sau dau nhan vat.
 * Thoi gian = giay nguon (work/san-ho-lux/words.json). captions: "phrase" (ban thuong) | "wbw" (chay chu tung chu).
 */
const SRC = "inputs/san-ho-lux-1080.mp4";
const MATTE = "inputs/sanho-matte/person.webm";
export const SANHO_FULL_SEC = 56.77;
const W = 1080, H = 1920;
const hitOf = (s: string) => (HITS as Record<string, number>)[s.replace("real/", "")] ?? 0;
const TXT = "real/qtl-sparkle-whoosh-2" as const, GLS = "real/qtl-sparkle-sweep" as const, OUT = "real/qtl-pop-whoosh-hot" as const, TRN = "real/qtl-transition" as const;

const Lead: React.FC<{ x: number; y: number; at: number; end: number; exit?: KfOut; anchor?: "start" | "middle" | "end"; children: string }> = ({ x, y, at, end, exit = "blurUp", anchor = "middle", children }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <KText x={x * W} y={y * H} at={at} end={end} enter="blurIn" exit={exit} size={44} weight={600} italic fill="#fff" anchor={anchor}>{children}</KText>
  </svg>
);
const G: React.FC<{ id: string; lines: string[]; at: number[]; end: number; x?: number; y: number; size: number; enter?: KfIn[]; exit?: KfOut; gap?: number }> = ({ id, lines, at, end, x = 0.5, y, size, enter, exit = "blurUp", gap }) => (
  <QtGlassText id={id} lines={lines} lineAt={at} end={end} x={x} y={y} size={size} enter={enter} exit={exit} gap={gap} tint="gold" />
);
const I: React.FC<{ id: string; name: string; x: number; y: number; at: number; end: number; size?: number; enter?: KfIn; exit?: KfOut }> = ({ size = 170, enter = "scaleIn", exit = "blurUp", ...p }) => (
  <QtLineIcon {...p} size={size} enter={enter} exit={exit} />
);

/** Lop chu + icon (thoi gian tuyet doi theo video nguon). */
const Overlays: React.FC = () => (
  <>
    {/* 0–4.4 HOOK: tim can lien ke vua o vua kinh doanh (mat o duoi 0.63H -> dai 0.08–0.42H) */}
    <I id="a1" name="house" x={0.5} y={0.11} at={1.25} end={3.2} exit="scaleOut" />
    <I id="a2" name="store" x={0.5} y={0.11} at={3.45} end={3.85} />
    <Lead x={0.5} y={0.19} at={0.0} end={3.85}>Nếu anh chị đang tìm một</Lead>
    <G id="g1" lines={["CĂN LIỀN KỀ"]} at={[1.35]} end={3.85} y={0.25} size={112} enter={["fromLeft"]} exit="toRight" />
    <Lead x={0.5} y={0.32} at={2.05} end={3.85} exit="fadeDown">vừa để ở, vừa</Lead>
    <G id="g2" lines={["KINH DOANH"]} at={[3.55]} end={3.85} y={0.39} size={112} enter={["fromRight"]} exit="toLeft" />

    {/* 5.5–8 SAN HÔ 09-2 */}
    <Lead x={0.5} y={0.1} at={5.6} end={7.5}>căn liền kề</Lead>
    <G id="g3" lines={["SAN HÔ", "09-2"]} at={[6.1, 6.75]} end={7.5} y={0.2} size={200} enter={["riseUp", "scaleIn"]} exit="scaleOut" />
    <I id="a3" name="sparkle" x={0.86} y={0.12} size={120} at={6.75} end={7.5} exit="scaleOut" />

    {/* 8.3–15.8 CAN GOC, 132 m², 486,5 m² (mat 0.36–0.47H -> dai 0.07–0.3H) */}
    <I id="a4" name="house" x={0.1} y={0.145} size={130} at={9.3} end={10.05} />
    <Lead x={0.6} y={0.08} at={8.3} end={10.05}>căn liền kề này là</Lead>
    <G id="g4" lines={["CĂN GÓC"]} at={[9.4]} end={10.05} x={0.6} y={0.16} size={130} enter={["fromRight"]} exit="toLeft" />
    <I id="a5" name="ruler" x={0.1} y={0.145} size={130} at={10.2} end={12.45} exit="toLeft" />
    <Lead x={0.6} y={0.08} at={10.2} end={12.45} exit="toLeft">diện tích đất</Lead>
    <G id="g5" lines={["132 M²"]} at={[11.5]} end={12.45} x={0.6} y={0.16} size={150} enter={["scaleIn"]} exit="toLeft" />
    <I id="a6" name="buildings" x={0.1} y={0.145} size={130} at={12.6} end={15.6} enter="fromRight" />
    <Lead x={0.6} y={0.08} at={12.6} end={15.6}>diện tích xây dựng</Lead>
    <G id="g6" lines={["486,5 M²"]} at={[14.4]} end={15.6} x={0.6} y={0.16} size={120} enter={["riseUp"]} exit="scaleOut" />

    {/* 16.7–19.6 4 TANG + 1 TUM (b-roll toa nha) */}
    <I id="a7" name="building" x={0.5} y={0.24} size={230} at={17.4} end={19.05} enter="dropDown" />
    <Lead x={0.5} y={0.37} at={17.4} end={19.05}>thiết kế</Lead>
    <G id="g7" lines={["4 TẦNG", "+ 1 TUM"]} at={[18.3, 19.0]} end={19.05} y={0.45} size={150} gap={0.95} enter={["riseUp", "scaleIn"]} exit="dropOut" />

    {/* 19.7–22.4 NAM GIUA NGA 3, MAT TIEN 8M */}
    <I id="a8" name="road" x={0.5} y={0.2} size={220} at={19.7} end={21.6} exit="toLeft" />
    <Lead x={0.5} y={0.32} at={19.7} end={21.6} exit="toLeft">nằm giữa</Lead>
    <G id="g8" lines={["NGÃ 3"]} at={[20.4]} end={21.6} y={0.39} size={200} enter={["fromLeft"]} exit="toLeft" />
    <I id="a9" name="ruler" x={0.27} y={0.27} size={200} at={21.95} end={22.85} enter="fromRight" exit="toRight" />
    <Lead x={0.66} y={0.2} at={21.95} end={22.85} exit="toRight">mặt tiền rộng</Lead>
    <G id="g9" lines={["8M"]} at={[22.2]} end={22.85} x={0.66} y={0.28} size={220} enter={["scaleIn"]} exit="toRight" />

    {/* 23.8–28.5 TANG 1 KINH DOANH -> TANG TREN HOMESTAY (mat 0.33–0.5H) */}
    <I id="a10" name="store" x={0.1} y={0.145} size={130} at={23.8} end={27.0} />
    <Lead x={0.6} y={0.08} at={23.8} end={27.0}>tầng 1</Lead>
    <G id="g10" lines={["KINH DOANH"]} at={[23.85]} end={27.0} x={0.6} y={0.15} size={110} enter={["fromRight"]} exit="blurUp" />
    <I id="a11" name="bed" x={0.1} y={0.145} size={130} at={27.55} end={28.6} exit="toLeft" />
    <Lead x={0.62} y={0.08} at={27.4} end={28.6} exit="toLeft">tầng trên cho thuê</Lead>
    <G id="g11" lines={["HOMESTAY"]} at={[27.75]} end={28.6} x={0.62} y={0.15} size={110} enter={["fromRight"]} exit="toLeft" />

    {/* 29.7–31.9 BAN GIAO THO, co cau thang (mat 0.31–0.48H) */}
    <I id="a12" name="key" x={0.1} y={0.145} size={130} at={29.7} end={31.95} />
    <Lead x={0.6} y={0.07} at={29.7} end={31.95}>tình trạng</Lead>
    <G id="g12" lines={["BÀN GIAO THÔ"]} at={[30.1]} end={31.95} x={0.6} y={0.14} size={88} enter={["fromRight"]} exit="blurUp" />
    <Lead x={0.6} y={0.21} at={31.4} end={31.95}>có cầu thang</Lead>

    {/* 32.2–33.9 VI TRI SIEU DAC DIA */}
    <I id="a13" name="pin" x={0.1} y={0.145} size={130} at={32.9} end={33.9} />
    <Lead x={0.6} y={0.07} at={32.2} end={33.9}>tọa lạc tại vị trí</Lead>
    <G id="g13" lines={["SIÊU ĐẶC ĐỊA"]} at={[33.1]} end={33.9} x={0.6} y={0.14} size={88} enter={["scaleIn"]} exit="scaleOut" />

    {/* 34–42 TIEN ICH + KHOANG CACH (lan luot) */}
    <I id="d1i" name="city" x={0.18} y={0.17} size={190} at={34.6} end={35.95} exit="toLeft" />
    <Lead x={0.36} y={0.1} anchor="start" at={34.1} end={35.95} exit="toLeft">Quảng trường Kinh Đô Ánh Sáng</Lead>
    <G id="d1" lines={["300M"]} at={[35.7]} end={36.05} x={0.62} y={0.19} size={180} enter={["scaleIn"]} exit="toLeft" />
    <I id="d2i" name="mall" x={0.18} y={0.17} size={190} at={36.4} end={37.95} exit="toLeft" />
    <Lead x={0.36} y={0.1} anchor="start" at={36.4} end={37.95} exit="toLeft">Vincom Mega Mall</Lead>
    <G id="d2" lines={["500M"]} at={[37.4]} end={37.95} x={0.62} y={0.19} size={180} enter={["scaleIn"]} exit="toLeft" />
    <I id="d3i" name="park" x={0.18} y={0.17} size={190} at={38.6} end={41.9} />
    <Lead x={0.36} y={0.1} anchor="start" at={38.6} end={41.9}>Công viên Wonder Park</Lead>
    <G id="d3" lines={["400M"]} at={[41.3]} end={41.9} x={0.62} y={0.19} size={180} enter={["scaleIn"]} exit="scaleOut" />
  </>
);

/** Lop TREN nguoi (sau QtPersonFront) — chu nho duoi cam, icon, cac doan can mat cuoi video. */
const OverlaysTop: React.FC<{ contact?: boolean }> = ({ contact = true }) => (
  <>
    {/* 43.5–46.9 phuong an thanh toan */}
    <I id="b1" name="card" x={0.86} y={0.6} size={150} at={45.9} end={46.9} enter="fromRight" exit="toRight" />
    <Lead x={0.1} y={0.64} anchor="start" at={43.55} end={46.9} exit="toLeft">phương án thanh toán</Lead>
    <G id="b2" lines={["3 PHƯƠNG ÁN"]} at={[46.05]} end={46.9} x={0.42} y={0.7} size={110} enter={["fromLeft"]} exit="toRight" />

    {/* 47.5–50.9 vua kinh doanh vua de o (can mat: dai 0.06–0.22H) */}
    <I id="b3" name="store" x={0.07} y={0.13} size={110} at={49.5} end={50.9} />
    <I id="b4" name="house" x={0.93} y={0.13} size={110} at={50.1} end={50.9} />
    <Lead x={0.5} y={0.06} at={48.6} end={50.9}>những dòng sản phẩm</Lead>
    <G id="b5" lines={["VỪA KINH DOANH", "VỪA ĐỂ Ở"]} at={[49.5, 50.1]} end={50.9} y={0.12} size={80} gap={0.95} enter={["fromLeft", "fromRight"]} exit="blurUp" />

    {/* 51–54.3 Vinhomes Ocean Park 2 */}
    <I id="b6" name="pin" x={0.1} y={0.13} size={120} at={52.3} end={54.3} />
    <Lead x={0.58} y={0.06} at={52.3} end={54.3}>Vinhomes</Lead>
    <G id="b7" lines={["OCEAN PARK 2"]} at={[53.4]} end={54.3} x={0.58} y={0.13} size={86} enter={["scaleIn"]} exit="scaleOut" />

    {/* 54.5–56.7 lien he em Son */}
    {contact ? <>
    <I id="b8" name="phone" x={0.1} y={0.13} size={120} at={54.5} end={56.4} />
    <Lead x={0.58} y={0.06} at={54.5} end={56.4}>liên hệ trực tiếp</Lead>
    <G id="b9" lines={["EM SƠN"]} at={[55.5]} end={56.4} x={0.58} y={0.13} size={120} enter={["riseUp"]} exit="blurUp" />
    </> : null}
  </>
);

/** SFX: 1 tieng moi lan chu chinh vao (canh hit) + 1 tieng gon khi khoi chu ra + chuyen canh. */
export const CUES: Array<[number, SfxCue["sfx"], number]> = [
  [1.35, TXT, 1], [3.55, TXT, 1], [3.9, OUT, 1],
  [6.1, GLS, 1], [6.75, TXT, 0.8], [7.55, OUT, 1],
  [9.4, TXT, 1], [10.1, OUT, 0.8], [11.5, GLS, 1], [12.5, OUT, 0.8], [14.4, TXT, 1], [15.65, OUT, 1],
  [16.72, TRN, 1], [18.3, TXT, 1], [19.0, GLS, 0.8], [19.1, OUT, 0.8],
  [20.4, TXT, 1], [21.65, OUT, 0.8], [22.2, GLS, 1], [22.9, OUT, 0.8],
  [23.85, TXT, 1], [27.05, OUT, 0.8], [27.75, TXT, 1], [28.65, OUT, 0.8],
  [30.1, TXT, 1], [32.0, OUT, 0.8], [33.1, GLS, 1], [33.95, OUT, 0.8],
  [35.7, GLS, 1], [37.4, GLS, 1], [41.3, GLS, 1], [41.95, OUT, 0.8],
  [42.72, TRN, 1], [44.85, TXT, 1], [46.05, GLS, 1], [46.95, TXT, 0.9],
  [49.5, TXT, 1], [50.1, TXT, 1], [50.95, OUT, 1],
  [53.4, GLS, 1], [54.35, OUT, 1], [55.5, TXT, 1],
];

/** Phan cuoi style A (42.6s -> het): vet sang chuyen canh, "LINH HOẠT" sau dau, thanh toan, vua KD vua o, Ocean Park 2 (+ lien he neu contact). */
export const SanHoTailA: React.FC<{ contact?: boolean }> = ({ contact = true }) => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  return (
    <>
      <Sequence from={s(43.4)} durationInFrames={s(3.6)} name="LINH HOAT sau dau">
        <QtBehindText lines={["LINH HOẠT"]} lineAt={[44.85 - 43.4]} y={0.2} size={250} duration={46.9 - 43.4} />
        <QtPersonFront src={staticFile(MATTE)} startFrom={43.4} />
      </Sequence>
      <OverlaysTop contact={contact} />
      <Sequence from={s(42.62)} durationInFrames={s(0.6)} name="Vet sang chuyen canh"><QtLightLeak /></Sequence>
    </>
  );
};

export type SanHoFullProps = { captions: "phrase" | "wbw"; words: QtWord[]; stem?: "all" | "sfx" | "voice" };

export const SanHoLuxFull: React.FC<SanHoFullProps> = ({ captions, words, stem = "all" }) => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  const cues: SfxCue[] = CUES.map(([t, sfx, v]) => ({ frame: Math.max(0, s(t + 0.08 - hitOf(sfx))), sfx, volume: v }));
  // khoang co chu lon -> an phu de cum (nhu mau)
  const mute: Array<[number, number]> = [[1300, 4300], [6000, 8000], [9300, 16000], [18200, 23300], [23800, 29000], [30000, 32400], [33000, 34400], [35600, 42400], [44800, 47400], [49400, 51400], [53300, 54800], [55400, 56800]];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <QtGrade>
        <OffthreadVideo src={staticFile(SRC)} muted={stem === "sfx"} />
      </QtGrade>
      <Overlays />
      {/* "LINH HOẠT" nam SAU DAU nhan vat (chu dam day) */}
      <Sequence from={s(43.4)} durationInFrames={s(3.6)} name="LINH HOAT sau dau">
        <QtBehindText lines={["LINH HOẠT"]} lineAt={[44.85 - 43.4]} y={0.2} size={250} duration={46.9 - 43.4} />
        <QtPersonFront src={staticFile(MATTE)} startFrom={43.4} />
      </Sequence>
      <OverlaysTop />
      {captions === "phrase" ? (
        <QtPhraseCaptions words={words} y={0.72} mute={mute} />
      ) : (
        <WordByWord words={words} y={1385} />
      )}
      <Sequence from={s(16.62)} durationInFrames={s(0.6)} name="Vet sang chuyen canh"><QtLightLeak /></Sequence>
      <Sequence from={s(42.62)} durationInFrames={s(0.6)} name="Vet sang chuyen canh"><QtLightLeak /></Sequence>
      {stem === "all" ? <Audio src={staticFile("music/bed-ambient.wav")} volume={0.1} loop /> : null}
      {stem === "voice" ? null : <SfxTrack cues={cues} />}
    </AbsoluteFill>
  );
};
