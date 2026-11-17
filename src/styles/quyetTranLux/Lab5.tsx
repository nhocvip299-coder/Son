import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { QtBehindText, QtGrade, QtLightLeak, QtPersonFront } from "./components";
import { QtGlassText } from "./glass";
import { KText, QtBuildingSection, QtDistanceList, QtJunction } from "./visuals";
import HITS from "./sfxHits.json";

/**
 * Clip THU NGHIEM v5 (chua dua vao ban dung): keyframe da dang (tu duoi len, tu 2 ben vao, lay net, phong to),
 * chu SVG sac net khong rang cua, TRUC QUAN LOGIC (mat cat toa nha, so do nga 3, danh sach khoang cach).
 * Thoi gian = giay NGUON cua video San Ho (words.json).
 */
const SRC = "inputs/san-ho-lux-1080.mp4";
const MATTE = "inputs/sanho-matte/person.webm";
const hitOf = (s: string) => (HITS as Record<string, number>)[s.replace("real/", "")] ?? 0;
type Cue = [number, SfxCue["sfx"], number];
type Scene = { from: number; to: number; label: string; person?: boolean; render: (r: (s: number) => number, len: number) => React.ReactNode; sfx: Cue[] };
const W = 1080;

const SCENES: Scene[] = [
  {
    from: 0.0, to: 4.45, label: "1 hook: chu vao tu 2 ben, chu nho lay net", person: true,
    render: (r, len) => (
      <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
        <KText x={110} y={560} at={r(0.0)} end={len - 0.3} enter="blurIn" size={46} weight={600} italic fill="#fff">Nếu anh chị đang tìm một</KText>
        <KText x={100} y={660} at={r(1.35)} end={len - 0.3} enter="fromLeft" size={124} weight={800}>CĂN LIỀN KỀ</KText>
        <KText x={980} y={770} at={r(2.05)} end={len - 0.3} enter="blurIn" size={46} weight={600} italic fill="#fff" anchor="end">vừa để ở, vừa</KText>
        <KText x={980} y={870} at={r(3.55)} end={len - 0.3} enter="fromRight" size={124} weight={800} anchor="end">KINH DOANH</KText>
      </svg>
    ),
    sfx: [[1.4, "real/qtl-sparkle-whoosh-2", 1], [1.4, "real/qtl-impact", 0.4], [3.6, "real/qtl-sparkle-whoosh-2", 1]],
  },
  {
    from: 5.45, to: 8.05, label: "2 chu kinh vang SVG sac net (tu duoi len, phong to)",
    render: (r, len) => (
      <>
        <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
          <KText x={540} y={190} at={r(5.6)} end={len - 0.3} enter="blurIn" size={50} weight={600} italic fill="#fff" anchor="middle">căn liền kề</KText>
        </svg>
        <QtGlassText id="g2" lines={["SAN HÔ", "09-2"]} lineAt={[r(6.1), r(6.75)]} end={len - 0.3} y={0.2} size={200} enter={["riseUp", "scaleIn"]} tint="gold" />
      </>
    ),
    sfx: [[6.1, "real/qtl-sparkle-sweep", 1], [6.75, "real/qtl-sparkle-whoosh-2", 0.9]],
  },
  {
    from: 16.7, to: 19.65, label: "3 mat cat toa nha: 4 TANG + 1 TUM (tang sang dan)",
    render: (r, len) => (
      <>
        <QtBuildingSection at={r(16.8)} tFloors={r(18.3)} end={len - 0.3} x={0.3} y={0.62} scale={1.1} />
        <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
          <KText x={600} y={720} at={r(17.4)} end={len - 0.3} enter="blurIn" size={46} weight={600} italic fill="#fff">thiết kế</KText>
          <KText x={600} y={820} at={r(18.3)} end={len - 0.3} enter="fromRight" size={110} weight={900}>4 TẦNG</KText>
          <KText x={600} y={930} at={r(19.0)} end={len - 0.3} enter="scaleIn" size={80} weight={800} fill="#5fe3d6">+ 1 TUM</KText>
        </svg>
      </>
    ),
    sfx: [[16.8, "real/qtl-pop-whoosh", 0.8], [18.3, "real/qtl-sparkle-whoosh-2", 1], [19.0, "real/qtl-sparkle-sweep", 0.8]],
  },
  {
    from: 19.65, to: 22.95, label: "4 so do NGA 3 + mat tien 8M (thay 2 dong cheo ngon ngang)",
    render: (r, len) => <QtJunction at={r(19.7)} tLabel={r(20.4)} t8m={r(22.2)} end={len - 0.3} y={0.12} />,
    sfx: [[19.75, "real/qtl-pop-whoosh", 0.8], [20.45, "real/qtl-sparkle-whoosh-2", 1], [22.25, "real/qtl-sparkle-sweep", 0.9]],
  },
  {
    from: 23.6, to: 29.1, label: "5 vua kinh doanh vua de o: tang 1 KINH DOANH, tang tren HOMESTAY",
    render: (r, len) => (
      <>
        <QtBuildingSection at={r(23.65)} tShop={r(23.8)} tStay={r(27.7)} end={len - 0.3} x={0.17} y={0.27} scale={0.6} />
        <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
          <KText x={330} y={470} at={r(23.8)} end={len - 0.3} enter="blurIn" size={36} weight={600} italic fill="#fff">tầng 1</KText>
          <KText x={330} y={500 - 0} at={r(23.85)} end={len - 0.3} enter="fromRight" size={0} weight={900} fill="#ffd27a">{" "}</KText>
          <KText x={420} y={470} at={r(23.85)} end={len - 0.3} enter="fromRight" size={70} weight={900} fill="#ffd27a">KINH DOANH</KText>
          <KText x={330} y={300} at={r(25.0)} end={len - 0.3} enter="blurIn" size={36} weight={600} italic fill="#fff">tầng trên cho thuê</KText>
          <KText x={330} y={370} at={r(27.75)} end={len - 0.3} enter="fromRight" size={76} weight={900} fill="#5fe3d6">HOMESTAY</KText>
        </svg>
      </>
    ),
    sfx: [[23.85, "real/qtl-sparkle-whoosh-2", 1], [25.0, "real/qtl-pop-whoosh", 0.6], [27.75, "real/qtl-sparkle-whoosh-2", 1]],
  },
  {
    from: 34.0, to: 42.1, label: "6 danh sach khoang cach (ghim + so met dem len)",
    render: (r, len) => (
      <QtDistanceList end={len - 0.4} y={0.5} rows={[
        { name: "Quảng trường Kinh Đô Ánh Sáng", meters: 300, at: r(34.6) },
        { name: "Vincom Mega Mall", meters: 500, at: r(36.5) },
        { name: "Công viên Wonder Park", meters: 400, at: r(39.2) },
      ]} />
    ),
    sfx: [[34.65, "real/qtl-sparkle-whoosh-2", 1], [36.55, "real/qtl-sparkle-whoosh-2", 1], [39.25, "real/qtl-sparkle-whoosh-2", 1]],
  },
  {
    from: 43.4, to: 47.0, label: "7 chu dam day sau dau + chu nho duoi cam", person: true,
    render: (r, len) => (
      <>
        <QtBehindText lines={["LINH HOẠT"]} lineAt={[r(44.85)]} y={0.27} size={250} duration={len} />
        <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
          <KText x={110} y={1240} at={r(43.55)} end={len - 0.3} enter="blurIn" size={44} weight={600} italic fill="#fff">phương án thanh toán</KText>
          <KText x={980} y={1340} at={r(46.05)} end={len - 0.3} enter="fromRight" size={104} weight={800} anchor="end">ĐỦ 3 PHƯƠNG ÁN</KText>
        </svg>
      </>
    ),
    sfx: [[44.85, "real/qtl-sparkle-whoosh-2", 1], [44.85, "real/qtl-impact", 0.4], [46.05, "real/qtl-sparkle-whoosh-2", 1]],
  },
];
export const QTL_LAB5_SEC = SCENES.reduce((a, s) => a + (s.to - s.from), 0);

export const QtlLab5: React.FC<{ stem?: "all" | "sfx" | "voice" }> = ({ stem = "all" }) => {
  const { fps } = useVideoConfig();
  let acc = 0;
  const cues: SfxCue[] = [];
  const blocks = SCENES.map((sc, i) => {
    const start = acc;
    const len = sc.to - sc.from;
    acc += len;
    const r = (s: number) => s - sc.from;
    sc.sfx.forEach(([s, sfx, v]) => cues.push({ frame: Math.max(0, Math.round((start + r(s) + 0.08 - hitOf(sfx)) * fps)), sfx, volume: v }));
    if (i > 0) cues.push({ frame: Math.round((start + 0.1 - hitOf("real/qtl-transition")) * fps), sfx: "real/qtl-transition", volume: 1 });
    return (
      <Sequence key={i} from={Math.round(start * fps)} durationInFrames={Math.round(len * fps)} name={sc.label}>
        <QtGrade>
          <Sequence from={-Math.round(sc.from * fps)} layout="none">
            <OffthreadVideo src={staticFile(SRC)} muted={stem === "sfx"} />
          </Sequence>
        </QtGrade>
        {sc.render(r, len)}
        {sc.person ? <QtPersonFront src={staticFile(MATTE)} startFrom={sc.from} /> : null}
        <div style={{ position: "absolute", left: 24, bottom: 40, color: "#ff0", fontSize: 26, fontFamily: "sans-serif", background: "rgba(0,0,0,0.5)", padding: "4px 10px" }}>THỬ v5 · {sc.label}</div>
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
