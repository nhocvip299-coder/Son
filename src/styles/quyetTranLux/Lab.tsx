import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { QtBehindText, QtGrade, QtLightLeak, QtPersonFront, QtRunText, QtWindowText } from "./components";

/**
 * Clip THU NGHIEM cho nguoi dung duyet (chua dua vao ban dung San Ho):
 * 1 chu trong suot dung co che | 2 chu don to theo loi nhan, sau lung nguoi | 3 hai dong cheo nhau trong suot
 * 4 chu dam day sau dau nhan vat (canh can mat) + chu chay tranh mat | 5 chu trong suot sau lung nguoi.
 * Thoi gian trong tung canh tinh theo giay NGUON (from..to) cua video San Ho.
 */
const SRC = "inputs/san-ho-lux-1080.mp4";
const MATTE = "inputs/sanho-matte/person.webm";
type Scene = { from: number; to: number; label: string; render: (rel: (srcSec: number) => number) => React.ReactNode; person?: boolean; sfx: Array<[number, SfxCue["sfx"], number]> };

const SCENES: Scene[] = [
  {
    from: 5.45, to: 8.05, label: "1 chu trong suot",
    render: (rel) => (
      <QtWindowText id="s1" lead="căn liền kề" lines={["SAN HÔ", "09-2"]} lineAt={[rel(6.1), rel(6.75)]} y={0.16} size={190}
        fill={{ src: staticFile(SRC), startFrom: 30.5 }} duration={2.6} />
    ),
    sfx: [[6.05, "sparkle", 0.9], [6.7, "sparkle", 0.8]],
  },
  {
    from: 10.1, to: 12.6, label: "2 chu don to theo loi nhan, sau lung nguoi", person: true,
    render: (rel) => (
      <>
        <QtRunText y={0.6} duration={2.5} lines={[{ pieces: [{ text: "diện tích đất", kind: "lead", t: rel(10.15) }] }]} />
        <Sequence from={Math.round(rel(11.45) * 60)} layout="none">
          <QtBehindText lines={["132M²"]} y={0.36} size={300} duration={2.5 - rel(11.45)} />
        </Sequence>
      </>
    ),
    sfx: [[11.4, "swish", 0.9], [11.42, "impact", 0.35]],
  },
  {
    from: 19.6, to: 21.05, label: "3 hai dong cheo nhau (nam giua nga 3)",
    render: (rel) => (
      <QtWindowText id="s3" lines={["NẰM GIỮA", "NGÃ 3"]} lineAt={[rel(19.7), rel(20.4)]} y={0.24} size={170} rot={[8, -8]} dx={[-0.04, 0.08]}
        fill={{ src: staticFile(SRC), startFrom: 8.6 }} duration={1.45} />
    ),
    sfx: [[19.65, "sparkle", 0.9], [20.35, "swish", 0.7]],
  },
  {
    from: 43.4, to: 47.0, label: "4 chu dam day sau dau + chu chay tranh mat", person: true,
    render: (rel) => (
      <>
        <Sequence from={Math.round(rel(44.85) * 60)} layout="none">
          <QtBehindText lines={["LINH HOẠT"]} y={0.27} size={250} duration={3.6 - rel(44.85)} />
        </Sequence>
        <QtRunText y={0.635} x0={0.1} duration={3.6} lines={[
          { pieces: [{ text: "phương án thanh toán", kind: "lead", t: rel(43.55) }] },
          { align: "right", pieces: [{ text: "đầy đủ cả", kind: "lead", t: rel(45.45) }, { text: "3 PHƯƠNG ÁN", kind: "main", t: rel(46.05) }] },
        ]} />
      </>
    ),
    sfx: [[44.8, "sparkle", 0.9], [44.82, "impact", 0.3], [46.0, "swish", 0.8]],
  },
  {
    from: 52.9, to: 54.6, label: "5 chu trong suot sau lung nguoi", person: true,
    render: (rel) => (
      <QtWindowText id="s5" lines={["OCEAN", "PARK 2"]} lineAt={[rel(53.35), rel(53.75)]} y={0.22} size={230}
        fill={{ src: staticFile(SRC), startFrom: 37.0 }} duration={1.7} />
    ),
    sfx: [[53.3, "sparkle", 0.9], [53.7, "swish", 0.7]],
  },
];
export const QTL_LAB_SEC = SCENES.reduce((a, s) => a + (s.to - s.from), 0);

export const QtlLab: React.FC = () => {
  const { fps } = useVideoConfig();
  let acc = 0;
  const cues: SfxCue[] = [];
  const blocks = SCENES.map((sc, i) => {
    const start = acc;
    const len = sc.to - sc.from;
    acc += len;
    const rel = (s: number) => s - sc.from;
    sc.sfx.forEach(([s, sfx, v]) => cues.push({ frame: Math.round((start + rel(s)) * fps), sfx, volume: v }));
    if (i > 0) cues.push({ frame: Math.round((start - 0.15) * fps), sfx: "swish", volume: 0.9 }, { frame: Math.round((start - 0.05) * fps), sfx: "sparkle", volume: 0.6 });
    return (
      <Sequence key={i} from={Math.round(start * fps)} durationInFrames={Math.round(len * fps)} name={sc.label}>
        <QtGrade>
          <Sequence from={-Math.round(sc.from * fps)} layout="none">
            <OffthreadVideo src={staticFile(SRC)} />
          </Sequence>
        </QtGrade>
        {sc.render(rel)}
        {sc.person ? <QtPersonFront src={staticFile(MATTE)} startFrom={sc.from} /> : null}
        <div style={{ position: "absolute", left: 24, bottom: 40, color: "#ff0", fontSize: 30, fontFamily: "sans-serif", background: "rgba(0,0,0,0.5)", padding: "4px 10px" }}>THỬ NGHIỆM {sc.label}</div>
        {i > 0 ? <QtLightLeak /> : null}
      </Sequence>
    );
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {blocks}
      <SfxTrack cues={cues} />
    </AbsoluteFill>
  );
};
