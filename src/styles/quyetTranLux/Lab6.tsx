import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { QtBehindText, QtGrade, QtLightLeak, QtPersonFront } from "./components";
import { QtGlassText } from "./glass";
import { QtIcon3D } from "./icon3d";
import { KText } from "./visuals";
import HITS from "./sfxHits.json";

/**
 * Clip THU NGHIEM v6: truc quan bang ICON 3D + CHU KINH VANG (nguoi dung chon), bo so do ve phang.
 * Bo cuc theo vi tri mat do tung doan (faces.json): chu/icon o dai trong tren dau hoac 2 ben, khong de len mat.
 */
const SRC = "inputs/san-ho-lux-1080.mp4";
const MATTE = "inputs/sanho-matte/person.webm";
const hitOf = (s: string) => (HITS as Record<string, number>)[s.replace("real/", "")] ?? 0;
type Cue = [number, SfxCue["sfx"], number];
type Scene = { from: number; to: number; label: string; person?: boolean; render: (r: (s: number) => number, len: number) => React.ReactNode; sfx: Cue[] };
const W = 1080, H = 1920;
const Lead: React.FC<{ x: number; y: number; at: number; end: number; anchor?: "start" | "middle" | "end"; children: string }> = ({ x, y, at, end, anchor = "middle", children }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <KText x={x * W} y={y * H} at={at} end={end} enter="blurIn" size={44} weight={600} italic fill="#fff" anchor={anchor}>{children}</KText>
  </svg>
);
const POP = "real/qtl-pop-whoosh" as const, SPK = "real/qtl-sparkle-whoosh-2" as const, SWP = "real/qtl-sparkle-sweep" as const;

const SCENES: Scene[] = [
  {
    from: 0.0, to: 4.45, label: "1 hook: nha + CAN LIEN KE, cua hang + KINH DOANH",
    render: (r, len) => (
      <>
        <QtIcon3D name="house-garden" x={0.5} y={0.1} size={190} at={r(1.3)} end={r(3.3)} enter="drop" />
        <Lead x={0.5} y={0.19} at={r(0.0)} end={len - 0.35}>Nếu anh chị đang tìm một</Lead>
        <QtGlassText id="h1" lines={["CĂN LIỀN KỀ"]} lineAt={[r(1.35)]} end={len - 0.35} x={0.5} y={0.25} size={112} enter={["fromLeft"]} tint="gold" />
        <Lead x={0.5} y={0.32} at={r(2.05)} end={len - 0.35}>vừa để ở, vừa</Lead>
        <QtIcon3D name="store" x={0.5} y={0.1} size={190} at={r(3.45)} end={len - 0.35} enter="drop" />
        <QtGlassText id="h2" lines={["KINH DOANH"]} lineAt={[r(3.55)]} end={len - 0.35} x={0.5} y={0.39} size={112} enter={["fromRight"]} tint="gold" />
      </>
    ),
    sfx: [[1.35, SPK, 1], [1.35, "real/qtl-impact", 0.4], [3.55, SPK, 1], [3.5, POP, 0.6]],
  },
  {
    from: 5.45, to: 8.05, label: "2 chu kinh vang SAN HO 09-2 (giu lai) + lap lanh",
    render: (r, len) => (
      <>
        <Lead x={0.5} y={0.1} at={r(5.6)} end={len - 0.3}>căn liền kề</Lead>
        <QtGlassText id="g2" lines={["SAN HÔ", "09-2"]} lineAt={[r(6.1), r(6.75)]} end={len - 0.3} y={0.2} size={200} enter={["riseUp", "scaleIn"]} tint="gold" />
        <QtIcon3D name="sparkles" x={0.84} y={0.13} size={150} at={r(6.75)} end={len - 0.3} enter="pop" />
      </>
    ),
    sfx: [[6.1, SWP, 1], [6.75, SPK, 0.9]],
  },
  {
    from: 16.7, to: 19.65, label: "3 thiet ke 4 TANG + 1 TUM: icon nha + chu kinh",
    render: (r, len) => (
      <>
        <QtIcon3D name="house" x={0.5} y={0.24} size={300} at={r(17.4)} end={len - 0.3} enter="drop" />
        <Lead x={0.5} y={0.37} at={r(17.4)} end={len - 0.3}>thiết kế</Lead>
        <QtGlassText id="g3" lines={["4 TẦNG", "+ 1 TUM"]} lineAt={[r(18.3), r(19.0)]} end={len - 0.3} y={0.45} size={150} gap={0.95} enter={["riseUp", "scaleIn"]} tint="gold" />
      </>
    ),
    sfx: [[17.4, POP, 0.8], [18.3, SPK, 1], [19.0, SWP, 0.8]],
  },
  {
    from: 19.65, to: 22.95, label: "4 nam giua NGA 3 + MAT TIEN 8M: icon duong, thuoc",
    render: (r, len) => (
      <>
        <QtIcon3D name="motorway" x={0.5} y={0.2} size={280} at={r(19.7)} end={r(21.9)} enter="pop" />
        <Lead x={0.5} y={0.32} at={r(19.7)} end={r(21.9)}>nằm giữa</Lead>
        <QtGlassText id="g4" lines={["NGÃ 3"]} lineAt={[r(20.4)]} end={r(21.9)} y={0.39} size={200} enter={["fromLeft"]} tint="gold" />
        <QtIcon3D name="ruler-tri" x={0.27} y={0.27} size={240} at={r(22.0)} end={len - 0.3} enter="fromLeft"  />
        <Lead x={0.66} y={0.2} at={r(21.95)} end={len - 0.3}>mặt tiền rộng</Lead>
        <QtGlassText id="g4b" lines={["8M"]} lineAt={[r(22.2)]} end={len - 0.3} x={0.66} y={0.28} size={220} enter={["scaleIn"]} tint="gold" />
      </>
    ),
    sfx: [[19.7, POP, 0.8], [20.4, SPK, 1], [22.0, POP, 0.7], [22.2, SWP, 1]],
  },
  {
    from: 23.6, to: 29.1, label: "5 tang 1 KINH DOANH -> tang tren HOMESTAY (dai trong tren dau)",
    render: (r, len) => (
      <>
        <QtIcon3D name="store" x={0.17} y={0.15} size={210} at={r(23.8)} end={r(27.3)} enter="pop" />
        <Lead x={0.6} y={0.08} at={r(23.8)} end={r(27.3)}>tầng 1</Lead>
        <QtGlassText id="g5" lines={["KINH DOANH"]} lineAt={[r(23.85)]} end={r(27.3)} x={0.6} y={0.15} size={110} enter={["fromRight"]} tint="gold" />
        <QtIcon3D name="bed" x={0.17} y={0.15} size={210} at={r(27.6)} end={len - 0.3} enter="pop"  />
        <QtIcon3D name="luggage" x={0.31} y={0.2} size={130} at={r(27.8)} end={len - 0.3} enter="drop"  />
        <Lead x={0.62} y={0.08} at={r(27.4)} end={len - 0.3}>tầng trên cho thuê</Lead>
        <QtGlassText id="g5b" lines={["HOMESTAY"]} lineAt={[r(27.75)]} end={len - 0.3} x={0.62} y={0.15} size={110} enter={["fromRight"]} tint="gold" />
      </>
    ),
    sfx: [[23.8, POP, 0.7], [23.85, SPK, 1], [27.6, POP, 0.7], [27.75, SPK, 1]],
  },
  {
    from: 34.0, to: 42.1, label: "6 tung tien ich: icon 3D + ten + so met chu kinh (lan luot)",
    render: (r, len) => (
      <>
        <QtIcon3D name="fireworks" x={0.18} y={0.17} size={230} at={r(34.6)} end={r(36.1)} enter="pop" />
        <Lead x={0.36} y={0.1} anchor="start" at={r(34.1)} end={r(36.1)}>Quảng trường Kinh Đô Ánh Sáng</Lead>
        <QtGlassText id="d1" lines={["300M"]} lineAt={[r(35.7)]} end={r(36.1)} x={0.62} y={0.19} size={180} enter={["scaleIn"]} tint="gold" />
        <QtIcon3D name="mall" x={0.18} y={0.17} size={230} at={r(36.4)} end={r(38.1)} enter="pop" />
        <Lead x={0.36} y={0.1} anchor="start" at={r(36.4)} end={r(38.1)}>Vincom Mega Mall</Lead>
        <QtGlassText id="d2" lines={["500M"]} lineAt={[r(37.4)]} end={r(38.1)} x={0.62} y={0.19} size={180} enter={["scaleIn"]} tint="gold" />
        <QtIcon3D name="ferris-wheel" x={0.18} y={0.17} size={230} at={r(38.6)} end={len - 0.35} enter="pop" />
        <Lead x={0.36} y={0.1} anchor="start" at={r(38.6)} end={len - 0.35}>Công viên Wonder Park</Lead>
        <QtGlassText id="d3" lines={["400M"]} lineAt={[r(41.3)]} end={len - 0.35} x={0.62} y={0.19} size={180} enter={["scaleIn"]} tint="gold" />
      </>
    ),
    sfx: [[34.6, POP, 0.8], [35.7, SWP, 1], [36.4, POP, 0.8], [37.4, SWP, 1], [38.6, POP, 0.8], [41.3, SWP, 1]],
  },
  {
    from: 43.4, to: 47.0, label: "7 LINH HOAT sau dau + the thanh toan + 3 PHUONG AN", person: true,
    render: (r, len) => (
      <>
        <QtBehindText lines={["LINH HOẠT"]} lineAt={[r(44.85)]} y={0.2} size={250} duration={len} />
      </>
    ),
    sfx: [[44.85, SPK, 1], [44.85, "real/qtl-impact", 0.4], [45.9, POP, 0.8], [46.05, SWP, 1]],
  },
];
/** Lop TREN nguoi cua canh 7 (icon + chu duoi cam) */
const OVER7 = (r: (s: number) => number, len: number) => (
  <>
    <QtIcon3D name="card" x={0.84} y={0.6} size={170} at={r(45.9)} end={len - 0.3} enter="fromRight"  />
    <Lead x={0.1} y={0.64} at={r(43.55)} end={len - 0.3} anchor="start">phương án thanh toán</Lead>
    <QtGlassText id="g7" lines={["3 PHƯƠNG ÁN"]} lineAt={[r(46.05)]} end={len - 0.3} x={0.42} y={0.7} size={110} enter={["fromLeft"]} tint="gold" />
  </>
);
export const QTL_LAB6_SEC = SCENES.reduce((a, s) => a + (s.to - s.from), 0);

export const QtlLab6: React.FC<{ stem?: "all" | "sfx" | "voice" }> = ({ stem = "all" }) => {
  const { fps } = useVideoConfig();
  let acc = 0;
  const cues: SfxCue[] = [];
  const blocks = SCENES.map((sc, i) => {
    const start = acc;
    const len = sc.to - sc.from;
    acc += len;
    const r = (s: number) => s - sc.from;
    sc.sfx.forEach(([s, sfx, v]) => cues.push({ frame: Math.max(0, Math.round((start + r(s) + 0.08 - hitOf(sfx)) * fps)), sfx, volume: v }));
    if (i > 0) cues.push({ frame: Math.round((start + 0.1 - hitOf("real/qtl-transition")) * fps), sfx: "real/qtl-transition", volume: 1 }, { frame: Math.round((start + 0.1 - hitOf("real/qtl-sparkle-sweep")) * fps), sfx: "real/qtl-sparkle-sweep", volume: 0.5 });
    return (
      <Sequence key={i} from={Math.round(start * fps)} durationInFrames={Math.round(len * fps)} name={sc.label}>
        <QtGrade>
          <Sequence from={-Math.round(sc.from * fps)} layout="none">
            <OffthreadVideo src={staticFile(SRC)} muted={stem === "sfx"} />
          </Sequence>
        </QtGrade>
        {sc.render(r, len)}
        {sc.person ? <QtPersonFront src={staticFile(MATTE)} startFrom={sc.from} /> : null}
        {i === 6 ? OVER7(r, len) : null}
        <div style={{ position: "absolute", left: 24, bottom: 40, color: "#ff0", fontSize: 26, fontFamily: "sans-serif", background: "rgba(0,0,0,0.5)", padding: "4px 10px" }}>THỬ v7 · {sc.label}</div>
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
