import React from "react";
import { AbsoluteFill, Easing, Freeze, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { WordByWord } from "../textPresets/capcut/WordByWord";
import { QtGrade, QtPersonFront, type QtWord } from "../quyetTranLux/components";
import HITS from "../quyetTranLux/sfxHits.json";
import { LuxCaptions, type CapZone } from "./captions";
import { RoadText, WhipBlur, WhiteFlash } from "./fill";
import { StackText } from "./typo";
import { KxCard, KxPage, KxPhone, KxPrice } from "./mauKinhXanh";
import { HandBold, type HbTone, type HbVariant } from "./handBold";
import { CheckChips, CompareBars, FloorStack, RoadSection, SitePlan, XeKhe } from "./explain";

/**
 * VINHOMES OCEAN PARK 2 — SHOPHOUSE SB-145 (font B Playfair vang champagne + preset CapCut + canh tram truc quan).
 * Doan KHONG NGUOI (26.3-41.5, 60.2-72.1) -> motion graphic giai thich (mat bang lo goc, chong san, xe khe, so sanh, gia).
 * Chu to theo diem nhan dat TREN DAU / canh tay, mot phan nam SAU DAU (nguoi truoc chu).
 * Vung an toan TikTok/Reels: chu trong y 0.11-0.73.
 */
const SRC = "inputs/du-an-3/goc-1080.mp4";
const MATTE = "inputs/du-an-3/matte/person.webm";
const IMG = (n: number) => staticFile(`inputs/du-an-3/anh/IMG_${n}.jpg`);
const SRC_END = 81.1;
export const OCP2_SEC = 83.0;
const hitOf = (s: string) => (HITS as Record<string, number>)[s.replace("real/", "")] ?? 0;
const SF = "Playfair Display";

type Sfx = SfxCue["sfx"];
const TING: Sfx = "real/lux-ting", DING: Sfx = "real/lux-ding", TICK: Sfx = "real/lux-tick", WHIP: Sfx = "real/lux-whip", BOOM: Sfx = "real/lux-boom";
const TXT: Sfx = "real/qtl-sparkle-whoosh-2", SOFT: Sfx = "real/qtl-sparkle-sweep", TRN: Sfx = "real/qtl-transition", POP: Sfx = "real/lux-pop", IMP: Sfx = "real/qtl-impact";
const ticks = (t: number, n = 4, gap = 0.13): Array<[number, Sfx, number]> => Array.from({ length: n }, (_v, i) => [t + 0.1 + i * gap, TICK, 0.55] as [number, Sfx, number]);

const WHIPS = [2.7, 6.9, 26.3, 48.6, 53.1, 60.2];
const CUES: Array<[number, Sfx, number]> = [
  [0.0, BOOM, 1], [0.05, IMP, 0.9], [0.62, TXT, 1],
  [2.7, WHIP, 1], [3.25, TING, 1], [6.9, WHIP, 1],
  [6.95, SOFT, 0.8], [8.2, TING, 1], [9.75, TXT, 1], [10.5, DING, 1],
  [14.1, SOFT, 0.8], [15.95, DING, 1], ...ticks(15.95, 3),
  [22.45, TXT, 1], [22.6, POP, 0.8], [22.85, POP, 0.8], [23.1, POP, 0.8],
  [26.3, WHIP, 1], [26.5, TRN, 0.8], ...ticks(27.2, 6, 0.15), [27.6, TING, 1], [29.6, TXT, 1], ...ticks(29.75, 5, 0.22), [30.9, DING, 1],
  [35.2, TRN, 0.8], [37.2, DING, 1], [38.6, SOFT, 0.9],
  [44.1, TING, 1], [45.9, POP, 1], [47.4, BOOM, 0.8], [47.45, DING, 1],
  [48.6, WHIP, 1], [51.5, TXT, 1], [53.1, WHIP, 1],
  [55.4, SOFT, 0.8], [58.9, DING, 1], ...ticks(58.9, 3),
  [60.2, WHIP, 1], [60.5, TRN, 0.8], [64.6, IMP, 1],
  [65.1, TRN, 0.8], [66.4, SOFT, 0.8], [68.3, TING, 1], [69.0, POP, 1], [70.7, DING, 1],
  [1.45, TXT, 1], [1.62, POP, 1], [4.5, SOFT, 0.8], [5.6, POP, 1], [17.85, TXT, 1], [18.55, POP, 1], [33.2, TXT, 1], [33.9, POP, 1],
  [41.5, TXT, 1], [41.7, POP, 1], [49.2, TXT, 1], [49.9, POP, 1], [53.5, TXT, 1], [54.2, POP, 1], [78.6, TXT, 1], [79.0, POP, 1],
  [3.25, "shimmer" as Sfx, 0.9], [46.2, "riser" as Sfx, 0.7], [57.7, "riser" as Sfx, 0.7], [69.5, "riser" as Sfx, 0.6],
  [43.6, TRN, 1], [47.2, DING, 1], ...ticks(47.2, 6, 0.15), [70.3, DING, 1], ...ticks(70.3, 6, 0.15), [33.2, TRN, 0.9], [79.0, DING, 1], ...ticks(0.02, 4, 0.12),
  [72.1, TRN, 0.8], [73.9, TING, 1], [75.8, POP, 1], [76.5, POP, 1], [78.0, POP, 1], [79.0, DING, 1],
];
const ZONES: CapZone[] = [{ from: 0, to: 99, kind: "plain", y: 0.7 }];

const Whips: React.FC<{ times: number[]; children: React.ReactNode }> = ({ times, children }) =>
  times.reduce<React.ReactNode>((acc, t, i) => <WhipBlur at={t} dir={i % 2 ? -1 : 1}>{acc}</WhipBlur>, children) as React.ReactElement;

/** dam may vao (punch-in) dau video + rung nhe -> cuon 3s dau */
const Punch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const z = interpolate(t, [0, 0.5], [1.32, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })
    + interpolate(t, [0.5, 2.7], [0, 0.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sh = t < 0.35 ? Math.sin(t * 90) * 10 * (1 - t / 0.35) : 0;
  return <AbsoluteFill style={{ transform: `translate(${sh}px, ${sh * 0.6}px) scale(${z})`, transformOrigin: "50% 40%" }}>{children}</AbsoluteFill>;
};
/** anh tram phu kin + day may cham vao (ox,oy) */
const ImgPush: React.FC<{ n: number; px?: number; ox?: number; oy?: number; z0?: number; z1?: number; dim?: number }> = ({ n, px = 0.5, ox = 0.5, oy = 0.5, z0 = 1.05, z1 = 1.25, dim = 0 }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const z = interpolate(f, [0, durationInFrames], [z0, z1], { easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <Img src={IMG(n)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${px * 100}% 50%`, transform: `scale(${z})`, transformOrigin: `${ox * 100}% ${oy * 100}%`, filter: `contrast(1.05) saturate(1.08) brightness(${1 - dim})` }} />
      {fps ? null : null}
    </AbsoluteFill>
  );
};
const Shade: React.FC<{ top?: number; bot?: number }> = ({ top = 0.55, bot = 0.45 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${top}) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 60%, rgba(0,0,0,${bot}) 100%)` }} />
);

export type Ocp2Props = { captions: "phrase" | "wbw" | "none"; words: QtWord[]; stem?: "all" | "sfx" | "voice" };

export const Ocp2: React.FC<Ocp2Props> = ({ captions, words, stem = "all" }) => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  const cues: SfxCue[] = CUES.map(([t, sfx, v]) => ({ frame: Math.max(0, s(t + 0.08 - hitOf(sfx))), sfx, volume: v }));
  const Seq: React.FC<{ a: number; b: number; name: string; children: React.ReactNode }> = ({ a, b, name, children }) => (
    <Sequence from={s(a)} durationInFrames={s(b - a)} name={name}>{children}</Sequence>
  );
  const front = (a: number, b: number) => (
    <Seq a={a} b={b} name={`Nguoi truoc chu ${a}`}><QtPersonFront src={staticFile(MATTE)} startFrom={a} /></Seq>
  );
  const hb = (k: string, a: number, b: number, cy: number, variant: HbVariant, small: string, main: string, o: { cx?: number; size?: number; tone?: HbTone; smallTone?: HbTone; sub?: string; mainAt?: number } = {}) => (
    <Seq a={a} b={b} name={`Chu ${variant} ${k}`}><HandBold id={k} variant={variant} cy={cy} small={small} main={main} {...o} /></Seq>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Whips times={WHIPS}>
        <QtGrade>
          <Punch>
            <Sequence durationInFrames={s(SRC_END)} name="Video goc"><OffthreadVideo src={staticFile(SRC)} muted={stem === "sfx"} /></Sequence>
            <Sequence from={s(SRC_END)} name="Giu khung cuoi"><Freeze frame={s(SRC_END) - 2}><OffthreadVideo src={staticFile(SRC)} muted /></Freeze></Sequence>
          </Punch>
          <Seq a={2.7} b={6.9} name="Tram SB-145"><ImgPush n={8345} px={0.53} ox={0.53} oy={0.45} z0={1.02} z1={1.22} /></Seq>
          <Seq a={48.6} b={51.5} name="Tram ban do ghim"><ImgPush n={8343} px={0.26} ox={0.5} oy={0.52} z0={1.1} z1={1.45} /></Seq>
          <Seq a={51.5} b={53.1} name="Tram Masteri"><ImgPush n={8347} px={0.5} ox={0.5} oy={0.75} z0={1.0} z1={1.15} /></Seq>
            </QtGrade>
      </Whips>
      <WhiteFlash at={0} dur={0.3} />

      {/* ===== 0-2.7 HOOK: 70 TRIEU nam sau dau + "co tin khong?" canh tay ===== */}
      <Shade top={0.5} bot={0} />
      <StackText id="h0" palette="white" y={0.16} size={70} end={2.6} exit="blurUp" lines={[{ text: "một mét vuông đất", role: "lead", at: 0.6, size: 50, enter: "riseUp" }]} />
      <StackText id="h1" palette="blue" y={0.305} size={200} end={2.6} exit="scaleOut" lines={[{ text: "{n} TRIỆU", role: "main", at: 0.02, enter: "zoomSettle", count: { to: 70, dur: 0.55 } }]} />
      {front(0, 2.7)}
      {hb("k1", 1.45, 2.75, 1220, "neon", "anh chị", "Có tin không?", { size: 120, tone: "blue", mainAt: 0.05 })}

      {/* ===== 2.7-6.9 anh SB-145 ===== */}
      <Seq a={2.7} b={6.9} name="toi anh"><Shade top={0.75} bot={0.55} /></Seq>
      <StackText id="a1" palette="blue" y={0.13} size={120} end={6.8} exit="blurUp" lines={[{ text: "ngay tại Vinhomes", role: "lead", at: 2.75, size: 48 }, { text: "OCEAN PARK 2", role: "main", at: 3.25 }]} />
      {hb("k2", 4.5, 6.9, 1200, "tay", "sở hữu", "2 mặt tiền", { size: 170, tone: "blue", sub: "trước – sau", mainAt: 1.0 })}

      {/* ===== 6.9-12.2 so sanh ===== */}
      <Seq a={6.9} b={12.2} name="toi tren"><Shade top={0.55} bot={0} /></Seq>
      <StackText id="b1" palette="blue" y={0.17} size={170} end={9.65} exit="toLeft" lines={[{ text: "so với đất thổ cư", role: "lead", at: 6.95, size: 50 }, { text: "VĂN GIANG", role: "main", at: 8.2 }]} />
      <StackText id="b2" palette="blue" y={0.17} size={140} end={12.15} exit="blurUp" lines={[{ text: "vị trí tương đương", role: "lead", at: 9.75, size: 48, enter: "fromRight" }, { text: "KHÔNG CĂN NÀO", role: "main", at: 10.5, size: 118 }, { text: "sánh được với căn này", role: "sub", at: 11.2, size: 50, italic: true }]} />
      {front(8.1, 12.2)}

      {/* ===== 12.2-17 duong 20M: 1 so duy nhat tren mat duong, trong vung an toan ===== */}
      <StackText id="c1" palette="white" y={0.2} size={90} end={17.4} exit="blurUp" lines={[{ text: "sở hữu trục đường rộng", role: "lead", at: 14.1, size: 54 }, { text: "cả vỉa hè", role: "sub", at: 16.3, size: 46, italic: true }]} />
      <RoadText value={20} unit="M" at={15.95} end={17.4} y={0.72} size={250} x={0.5} tint="blue" font={SF} />
      {front(15.8, 17.8)}

      {/* ===== 17-22.4 di theo em Son ===== */}
      {hb("k3", 17.85, 21.2, 560, "bac", "mời anh chị", "Đi theo em Sơn", { size: 130, tone: "white", smallTone: "blue", mainAt: 0.5 })}

      {/* ===== 22.4-26.3 mat cat duong ===== */}
      <Seq a={22.4} b={26.3} name="Mat cat duong"><RoadSection y={460} parts={[["VỈA HÈ", 4, "walk"], ["MẶT ĐƯỜNG", 7, "road"], ["VỈA HÈ", 4, "walk"]]} /></Seq>

      {/* ===== 26.3-41.5 KHONG NGUOI: tram truc quan ===== */}
      <Seq a={26.3} b={33.2} name="Blueprint 1 (kinh xanh)"><KxPage src={SRC} from={26.3} ring={false} /></Seq>
      <Seq a={26.3} b={29.7} name="Mat bang lo goc"><SitePlan area={163.8} /></Seq>
      <Seq a={29.6} b={33.2} name="Chong san"><FloorStack total={427.2} /></Seq>
      <Seq a={33.2} b={35.25} name="Trang kinh xanh: ban giao"><KxPage src={SRC} from={33.2} ring={false} /></Seq>
      <Seq a={33.2} b={35.25} name="The kinh ban giao"><KxCard src={SRC} from={33.2} title="Bàn giao" chips={[["Nhà thô", 0.5], ["Có thang", 1.0]]} y={0.44} /></Seq>
      <Seq a={35.2} b={41.5} name="Blueprint 2 (kinh xanh)"><KxPage src={SRC} from={35.2} ring={false} /></Seq>
      <StackText id="d1" palette="blue" y={0.13} size={140} end={41.4} exit="blurUp" lines={[{ text: "đặc biệt bên hông", role: "lead", at: 35.25, size: 48 }, { text: "XẺ KHE RỘNG", role: "main", at: 37.15, size: 110 }]} />
      <Seq a={35.2} b={41.5} name="Xe khe"><XeKhe /></Seq>

      {/* ===== 41.5-48.6 gia ===== */}
      {hb("k5", 41.5, 43.6, 560, "neon", "Cái điều", "Đặc biệt nhất", { size: 120, tone: "blue", mainAt: 0.1 })}
      <WhiteFlash at={43.6} dur={0.35} />
      <Seq a={43.6} b={48.6} name="Trang kinh xanh: gia"><KxPage src={SRC} from={43.6} /></Seq>
      <Seq a={43.6} b={48.6} name="Chot gia (dem lui)"><KxPrice lead="giá HTLS 18 tháng" script="áp voucher 30%" oldP="23,339 TỶ" strikeAt={2.2} chip={["VOUCHER 30%", 2.1]} mid="chỉ về hơn" from={23} to={15} dec={0} unit="TỶ" newAt={3.6} y={0.24} /></Seq>

      {/* ===== 48.6-53.1 vi tri ===== */}
      <Seq a={49.0} b={51.5} name="toi duoi ban do"><Shade top={0} bot={0.85} /></Seq>
      {hb("k6", 49.2, 51.5, 1250, "tay", "vị trí", "Cực kỳ đắc địa", { size: 130, tone: "blue", sub: "Ocean Park 2", mainAt: 0.4 })}
      <Seq a={51.5} b={53.1} name="toi Masteri"><Shade top={0.75} bot={0} /></Seq>
      <StackText id="e1" palette="blue" y={0.13} size={120} end={53.0} exit="blurUp" lines={[{ text: "hướng vào toà chung cư", role: "lead", at: 51.5, size: 46 }, { text: "MASTERI", role: "main", at: 52.6 }]} />

      {/* ===== 53.1-60.2 boc tach 70 trieu ===== */}
      {hb("k7", 53.5, 55.35, 560, "bac", "căn này với", "427 m² sàn", { size: 160, tone: "blue", smallTone: "white", mainAt: 0.5 })}
      <Seq a={55.3} b={60.2} name="toi tren 2"><Shade top={0.55} bot={0} /></Seq>
      <StackText id="f1" palette="blue" y={0.15} size={190} end={60.1} exit="scaleOut" lines={[{ text: "bóc tách giá xây dựng · chỉ khoảng", role: "lead", at: 55.4, size: 44 }, { text: "{n} TRIỆU", role: "main", at: 58.9, count: { to: 70, dur: 0.8 } }, { text: "/ m² đất", role: "sub", at: 59.6, size: 62, italic: true }]} />
      {front(58.7, 60.2)}

      {/* ===== 60.2-72.1 KHONG NGUOI: so sanh + chinh sach ===== */}
      <Seq a={60.2} b={65.1} name="Blueprint 3 (kinh xanh)"><KxPage src={SRC} from={60.2} ring={false} /></Seq>
      <StackText id="g1" palette="blue" y={0.13} size={110} end={65.0} exit="blurUp" lines={[{ text: "so với những căn", role: "lead", at: 60.3, size: 48 }, { text: "CẮT LỖ SÂU", role: "main", at: 62.3 }]} />
      <Seq a={60.2} b={65.1} name="So sanh"><CompareBars ours="≈70TR/m²" badgeAt={4.4} /></Seq>
      <WhiteFlash at={65.1} dur={0.35} />
      <Seq a={65.1} b={72.1} name="Trang kinh xanh: chiet khau"><KxPage src={SRC} from={65.1} /></Seq>
      <Seq a={65.1} b={72.1} name="Chiet khau (dem lui)"><KxPrice lead="chính sách mới chủ đầu tư Vinhomes" script="thanh toán sớm" oldP="23,339 TỶ" strikeAt={3.9} chip={["CK THÊM 7,5%", 3.9]} mid="giá này đã được cộng chiết khấu" from={23} to={15} dec={0} unit="TỶ" newAt={5.2} y={0.24} /></Seq>

      {/* ===== 72.1-83 CTA ===== */}
      <Seq a={72.1} b={83} name="toi tren 3"><Shade top={0.55} bot={0} /></Seq>
      <StackText id="h2" palette="blue" y={0.15} size={200} end={78.5} exit="blurUp" lines={[{ text: "nếu anh chị có tài chính", role: "lead", at: 72.1, size: 48 }, { text: "15 TỶ", role: "main", at: 73.9 }]} />
      {front(73.8, 78.6)}
      <Seq a={74.5} b={79.0} name="Checklist"><CheckChips x={110} y={1000} items={[["Diện tích lớn", 1.3], ["2 mặt tiền đường", 2.0], ["Xẻ khe thoáng", 3.5]]} /></Seq>
      {hb("k8", 78.6, 83, 520, "bac", "liên hệ ngay", "Em Sơn", { size: 200, tone: "white", smallTone: "blue", mainAt: 0.3 })}
      <Seq a={79.0} b={83} name="Vien SDT"><KxPhone phone="0966 312 333" y={0.68} /></Seq>

      {captions === "phrase" ? <LuxCaptions words={words} zones={ZONES} /> : captions === "wbw" ? <WordByWord words={words} y={1330} /> : null}
      {stem === "all" ? <Audio src={staticFile("music/bed-ambient.wav")} volume={0.1} loop /> : null}
      {stem === "voice" ? null : <SfxTrack cues={cues} />}
    </AbsoluteFill>
  );
};
