import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { QtBehindText, QtGrade, QtLightLeak, QtPersonFront } from "./components";
import { QtGlassText } from "./glass";
import { QtLineIcon } from "./lineIcon";
import type { KfOut } from "./keyframes";
import { KText } from "./visuals";
import HITS from "./sfxHits.json";

/**
 * Clip THU NGHIEM v8 (theo gop y): icon KIEU D (net manh vang tron), chu vang champagne,
 * moi chu co keyframe RA ro rang (ra truoc nhat cat 0.6s), SFX GON: 1 tieng/lan xuat hien + swoosh ngan khi ra.
 */
const SRC = "inputs/san-ho-lux-1080.mp4";
const MATTE = "inputs/sanho-matte/person.webm";
const hitOf = (s: string) => (HITS as Record<string, number>)[s.replace("real/", "")] ?? 0;
type Cue = [number, SfxCue["sfx"], number];
type Scene = { from: number; to: number; label: string; person?: boolean; render: (r: (s: number) => number, e: number) => React.ReactNode; sfx: Cue[]; exitAt?: number; outSfx?: SfxCue["sfx"] };
const W = 1080, H = 1920;
const Lead: React.FC<{ x: number; y: number; at: number; end: number; exit?: KfOut; anchor?: "start" | "middle" | "end"; children: string }> = ({ x, y, at, end, exit = "blurUp", anchor = "middle", children }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <KText x={x * W} y={y * H} at={at} end={end} enter="blurIn" exit={exit} size={44} weight={600} italic fill="#fff" anchor={anchor}>{children}</KText>
  </svg>
);
const TXT = "real/qtl-sparkle-whoosh-2" as const, GLS = "real/qtl-sparkle-sweep" as const, OUT = "real/qtl-pop-whoosh-hot" as const; // OUT: swoosh 1478 thieu cao tan -> bi giong lap

// e = thoi diem bat dau RA (giay tuong doi) = do dai canh - 0.6
const SCENES: Scene[] = [
  {
    from: 0.0, to: 4.45, label: "1 hook: icon nha -> cua hang; ra: CAN LIEN KE bay phai, KINH DOANH bay trai",
    render: (r, e) => (
      <>
        <QtLineIcon id="i1" name="house" x={0.5} y={0.11} size={170} at={r(1.25)} end={r(3.2)} enter="scaleIn" exit="scaleOut" />
        <QtLineIcon id="i2" name="store" x={0.5} y={0.11} size={170} at={r(3.45)} end={e} enter="scaleIn" exit="blurUp" />
        <Lead x={0.5} y={0.19} at={r(0.0)} end={e} exit="blurUp">Nếu anh chị đang tìm một</Lead>
        <QtGlassText id="h1" lines={["CĂN LIỀN KỀ"]} lineAt={[r(1.35)]} end={e} x={0.5} y={0.25} size={112} enter={["fromLeft"]} exit="toRight" tint="gold" />
        <Lead x={0.5} y={0.32} at={r(2.05)} end={e} exit="fadeDown">vừa để ở, vừa</Lead>
        <QtGlassText id="h2" lines={["KINH DOANH"]} lineAt={[r(3.55)]} end={e} x={0.5} y={0.39} size={112} enter={["fromRight"]} exit="toLeft" tint="gold" />
      </>
    ),
    sfx: [[1.35, TXT, 1], [3.55, TXT, 1]],
  },
  {
    from: 5.45, to: 8.05, label: "2 chu kinh SAN HO 09-2; ra: phong to tan",
    render: (r, e) => (
      <>
        <Lead x={0.5} y={0.1} at={r(5.6)} end={e}>căn liền kề</Lead>
        <QtGlassText id="g2" lines={["SAN HÔ", "09-2"]} lineAt={[r(6.1), r(6.75)]} end={e} y={0.2} size={200} enter={["riseUp", "scaleIn"]} exit="scaleOut" tint="gold" />
        <QtLineIcon id="i3" name="sparkle" x={0.85} y={0.13} size={120} at={r(6.75)} end={e} enter="scaleIn" exit="scaleOut" />
      </>
    ),
    sfx: [[6.1, GLS, 1], [6.75, TXT, 0.8]],
  },
  {
    from: 16.7, to: 19.65, label: "3 icon toa nha + 4 TANG + 1 TUM; ra: roi xuong",
    render: (r, e) => (
      <>
        <QtLineIcon id="i4" name="building" x={0.5} y={0.24} size={230} at={r(17.4)} end={e} enter="dropDown" exit="blurUp" />
        <Lead x={0.5} y={0.37} at={r(17.4)} end={e}>thiết kế</Lead>
        <QtGlassText id="g3" lines={["4 TẦNG", "+ 1 TUM"]} lineAt={[r(18.3), r(19.0)]} end={e} y={0.45} size={150} gap={0.95} enter={["riseUp", "scaleIn"]} exit="dropOut" tint="gold" />
      </>
    ),
    sfx: [[18.3, TXT, 1], [19.0, GLS, 0.8]],
    exitAt: 0,
  },
  {
    from: 19.65, to: 22.95, label: "4 icon duong + NGA 3 -> icon thuoc + 8M; ra: bay ngang",
    render: (r, e) => (
      <>
        <QtLineIcon id="i5" name="road" x={0.5} y={0.2} size={220} at={r(19.7)} end={r(21.6)} enter="scaleIn" exit="toLeft" />
        <Lead x={0.5} y={0.32} at={r(19.7)} end={r(21.6)} exit="toLeft">nằm giữa</Lead>
        <QtGlassText id="g4" lines={["NGÃ 3"]} lineAt={[r(20.4)]} end={r(21.6)} y={0.39} size={200} enter={["fromLeft"]} exit="toLeft" tint="gold" />
        <QtLineIcon id="i6" name="ruler" x={0.27} y={0.27} size={200} at={r(21.95)} end={e} enter="fromRight" exit="toRight" />
        <Lead x={0.66} y={0.2} at={r(21.95)} end={e} exit="toRight">mặt tiền rộng</Lead>
        <QtGlassText id="g4b" lines={["8M"]} lineAt={[r(22.2)]} end={e} x={0.66} y={0.28} size={220} enter={["scaleIn"]} exit="toRight" tint="gold" />
      </>
    ),
    sfx: [[20.4, TXT, 1], [21.6, OUT, 0.7], [22.2, GLS, 1]],
  },
  {
    from: 23.6, to: 29.1, label: "5 KINH DOANH -> HOMESTAY (dai tren dau); ra: bay len / bay trai",
    render: (r, e) => (
      <>
        <QtLineIcon id="i7" name="store" x={0.16} y={0.15} size={170} at={r(23.8)} end={r(27.0)} enter="scaleIn" exit="blurUp" />
        <Lead x={0.6} y={0.08} at={r(23.8)} end={r(27.0)}>tầng 1</Lead>
        <QtGlassText id="g5" lines={["KINH DOANH"]} lineAt={[r(23.85)]} end={r(27.0)} x={0.6} y={0.15} size={110} enter={["fromRight"]} exit="blurUp" tint="gold" />
        <QtLineIcon id="i8" name="bed" x={0.16} y={0.15} size={170} at={r(27.55)} end={e} enter="scaleIn" exit="toLeft" />
        <Lead x={0.62} y={0.08} at={r(27.4)} end={e} exit="toLeft">tầng trên cho thuê</Lead>
        <QtGlassText id="g5b" lines={["HOMESTAY"]} lineAt={[r(27.75)]} end={e} x={0.62} y={0.15} size={110} enter={["fromRight"]} exit="toLeft" tint="gold" />
      </>
    ),
    sfx: [[23.85, TXT, 1], [27.0, OUT, 0.6], [27.75, TXT, 1]],
    outSfx: TXT, // giong noi to o diem ra -> dung tieng lap lanh manh
  },
  {
    from: 34.0, to: 42.1, label: "6 tung tien ich: icon net manh + ten + so met; ra moi muc",
    render: (r, e) => (
      <>
        <QtLineIcon id="d1i" name="city" x={0.18} y={0.17} size={190} at={r(34.6)} end={r(35.95)} enter="scaleIn" exit="toLeft" />
        <Lead x={0.36} y={0.1} anchor="start" at={r(34.1)} end={r(35.95)} exit="toLeft">Quảng trường Kinh Đô Ánh Sáng</Lead>
        <QtGlassText id="d1" lines={["300M"]} lineAt={[r(35.7)]} end={r(35.95) + 0.1} x={0.62} y={0.19} size={180} enter={["scaleIn"]} exit="toLeft" tint="gold" />
        <QtLineIcon id="d2i" name="mall" x={0.18} y={0.17} size={190} at={r(36.4)} end={r(37.95)} enter="scaleIn" exit="toLeft" />
        <Lead x={0.36} y={0.1} anchor="start" at={r(36.4)} end={r(37.95)} exit="toLeft">Vincom Mega Mall</Lead>
        <QtGlassText id="d2" lines={["500M"]} lineAt={[r(37.4)]} end={r(37.95)} x={0.62} y={0.19} size={180} enter={["scaleIn"]} exit="toLeft" tint="gold" />
        <QtLineIcon id="d3i" name="park" x={0.18} y={0.17} size={190} at={r(38.6)} end={e} enter="scaleIn" exit="blurUp" />
        <Lead x={0.36} y={0.1} anchor="start" at={r(38.6)} end={e}>Công viên Wonder Park</Lead>
        <QtGlassText id="d3" lines={["400M"]} lineAt={[r(41.3)]} end={e} x={0.62} y={0.19} size={180} enter={["scaleIn"]} exit="scaleOut" tint="gold" />
      </>
    ),
    sfx: [[35.7, GLS, 1], [37.4, GLS, 1], [41.3, GLS, 1]],
  },
  {
    from: 43.4, to: 47.0, label: "7 LINH HOAT sau dau + icon the + 3 PHUONG AN; ra: bay phai", person: true,
    render: (r, e) => <QtBehindText lines={["LINH HOẠT"]} lineAt={[r(44.85)]} y={0.2} size={250} duration={e + 0.4} />,
    sfx: [[44.85, TXT, 1], [46.05, GLS, 1]],
  },
];
const OVER7 = (r: (s: number) => number, e: number) => (
  <>
    <QtLineIcon id="i9" name="card" x={0.86} y={0.6} size={150} at={r(45.9)} end={e} enter="fromRight" exit="toRight" />
    <Lead x={0.1} y={0.64} at={r(43.55)} end={e} anchor="start" exit="toLeft">phương án thanh toán</Lead>
    <QtGlassText id="g7" lines={["3 PHƯƠNG ÁN"]} lineAt={[r(46.05)]} end={e} x={0.42} y={0.7} size={110} enter={["fromLeft"]} exit="toRight" tint="gold" />
  </>
);
export const QTL_LAB8_SEC = SCENES.reduce((a, s) => a + (s.to - s.from), 0);

export const QtlLab8: React.FC<{ stem?: "all" | "sfx" | "voice" }> = ({ stem = "all" }) => {
  const { fps } = useVideoConfig();
  let acc = 0;
  const cues: SfxCue[] = [];
  const blocks = SCENES.map((sc, i) => {
    const start = acc;
    const len = sc.to - sc.from;
    acc += len;
    const r = (s: number) => s - sc.from;
    const e = len - 0.6;
    sc.sfx.forEach(([s, sfx, v]) => cues.push({ frame: Math.max(0, Math.round((start + r(s) + 0.08 - hitOf(sfx)) * fps)), sfx, volume: v }));
    cues.push({ frame: Math.round((start + e + 0.05 - hitOf(sc.outSfx ?? OUT)) * fps), sfx: sc.outSfx ?? OUT, volume: 1 }); // chu ra
    if (i > 0) cues.push({ frame: Math.round((start + 0.1 - hitOf("real/qtl-transition")) * fps), sfx: "real/qtl-transition", volume: 1 });
    return (
      <Sequence key={i} from={Math.round(start * fps)} durationInFrames={Math.round(len * fps)} name={sc.label}>
        <QtGrade>
          <Sequence from={-Math.round(sc.from * fps)} layout="none">
            <OffthreadVideo src={staticFile(SRC)} muted={stem === "sfx"} />
          </Sequence>
        </QtGrade>
        {sc.render(r, e)}
        {sc.person ? <QtPersonFront src={staticFile(MATTE)} startFrom={sc.from} /> : null}
        {i === 6 ? OVER7(r, e) : null}
        <div style={{ position: "absolute", left: 24, bottom: 40, color: "#ff0", fontSize: 24, fontFamily: "sans-serif", background: "rgba(0,0,0,0.5)", padding: "4px 10px" }}>THỬ v8 · {sc.label}</div>
        {i > 0 ? <QtLightLeak /> : null}
      </Sequence>
    );
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {blocks}
      {stem === "voice" ? null : <SfxTrack cues={cues} />}
    </AbsoluteFill>
  );
};
