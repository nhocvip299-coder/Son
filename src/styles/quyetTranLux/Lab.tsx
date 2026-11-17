import React, { useEffect, useState } from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useVideoConfig } from "remotion";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { QtBehindText, QtGrade, QtLightLeak, QtPersonFront, QtWindowText } from "./components";
import { QtKRun, QtTrack } from "./kinetic";
import HITS from "./sfxHits.json";

/** Dat SFX sao cho DIEM DINH (hit) trung luc chu "toi" (moc + 0.08s). */
const hitOf = (sfx: string) => (HITS as Record<string, number>)[sfx.replace("real/", "")] ?? 0;

/**
 * Clip THU NGHIEM v3 cho nguoi dung duyet (chua dua vao ban dung San Ho).
 * Chuyen dong do TUNG KHUNG tren mau: vao 3–5 khung (lao ngang nhoe / tach mau RGB / xoay lao vao),
 * dung yen + bam theo camera, tat gon 2 khung; lop nguoi (ca tay) nam TRUOC moi chu lon.
 * Thoi gian trong tung canh = giay NGUON (from..to) cua video San Ho.
 */
const SRC = "inputs/san-ho-lux-1080.mp4";
const MATTE = "inputs/sanho-matte/person.webm";
type Track = { fps: number; dx: number[]; dy: number[] };
type Scene = {
  from: number;
  to: number;
  label: string;
  render: (rel: (srcSec: number) => number, len: number) => React.ReactNode;
  person?: boolean;
  sfx: Array<[number, SfxCue["sfx"], number]>;
};

const SCENES: Scene[] = [
  {
    from: 0.0, to: 4.45, label: "1 chu chay theo loi noi (lao ngang / tach mau / xoay vao)", person: true,
    render: (rel, len) => (
      <QtKRun id="s0" y={0.39} duration={len} lines={[
        { pieces: [{ text: "Nếu anh chị đang tìm một", kind: "lead", t: rel(0.0) }] },
        { pieces: [{ text: "CĂN LIỀN KỀ", kind: "main", t: rel(1.35) }, { text: "vừa để ở", kind: "lead", t: rel(2.05) }] },
        { align: "right", pieces: [{ text: "vừa", kind: "lead", t: rel(2.95) }, { text: "KINH DOANH", kind: "main", t: rel(3.55) }] },
      ]} />
    ),
    sfx: [[1.35, "real/qtl-sparkle-whoosh-2", 1], [1.35, "real/qtl-impact", 0.4], [3.55, "real/qtl-pop-whoosh", 1]],
  },
  {
    from: 5.45, to: 8.05, label: "2 chu trong suot + vet anh kim",
    render: (rel, len) => (
      <QtWindowText id="s1" lead="căn liền kề" lines={["SAN HÔ", "09-2"]} lineAt={[rel(6.1), rel(6.75)]} y={0.16} size={190}
        fill={{ src: "", kind: "liquid" }} duration={len} tint="gold" />
    ),
    sfx: [[6.1, "real/qtl-sparkle-sweep", 1], [6.75, "real/qtl-sparkle-whoosh-2", 0.9]],
  },
  {
    from: 10.1, to: 12.6, label: "3 chu don to theo loi nhan, sau lung nguoi", person: true,
    render: (rel, len) => (
      <>
        <QtKRun id="s2" y={0.62} duration={len} lines={[{ pieces: [{ text: "diện tích đất", kind: "lead", t: rel(10.15) }] }]} />
        <QtBehindText lines={["132M²"]} lineAt={[rel(11.45)]} y={0.36} size={300} duration={len} />
      </>
    ),
    sfx: [[11.45, "real/qtl-sparkle-whoosh-2", 1], [11.45, "real/qtl-sparkle-sweep", 0.6], [11.45, "real/qtl-impact", 0.45]],
  },
  {
    from: 19.6, to: 21.05, label: "4 hai dong cheo nhau trong suot",
    render: (rel, len) => (
      <QtWindowText id="s3" lines={["NẰM GIỮA", "NGÃ 3"]} lineAt={[rel(19.7), rel(20.4)]} y={0.24} size={170} rot={[8, -8]} dx={[-0.06, 0.14]}
        fill={{ src: "", kind: "liquid" }} duration={len} tint="teal" />
    ),
    sfx: [[19.7, "real/qtl-sparkle-sweep", 1], [20.4, "real/qtl-pop-whoosh", 0.9]],
  },
  {
    from: 43.4, to: 47.0, label: "5 chu sau dau + chu chay duoi cam (tranh mat)", person: true,
    render: (rel, len) => (
      <>
        <QtBehindText lines={["LINH HOẠT"]} lineAt={[rel(44.85)]} y={0.27} size={250} duration={len} />
        <QtKRun id="s4" y={0.635} duration={len} lines={[
          { pieces: [{ text: "phương án thanh toán", kind: "lead", t: rel(43.55) }] },
          { align: "right", pieces: [{ text: "đầy đủ cả", kind: "lead", t: rel(45.45) }, { text: "3 PHƯƠNG ÁN", kind: "main", t: rel(46.05) }] },
        ]} />
      </>
    ),
    sfx: [[44.85, "real/qtl-sparkle-whoosh-2", 1], [44.85, "real/qtl-sparkle-sweep", 0.6], [44.85, "real/qtl-impact", 0.4], [46.05, "real/qtl-pop-whoosh", 1]],
  },
  {
    from: 52.9, to: 54.6, label: "6 chu trong suot sau lung nguoi", person: true,
    render: (rel, len) => (
      <QtWindowText id="s5" lines={["OCEAN", "PARK 2"]} lineAt={[rel(53.35), rel(53.75)]} y={0.22} size={230}
        fill={{ src: "", kind: "liquid" }} duration={len} tint="gold" />
    ),
    sfx: [[53.35, "real/qtl-sparkle-sweep", 1], [53.75, "real/qtl-transition", 0.8]],
  },
];
export const QTL_LAB_SEC = SCENES.reduce((a, s) => a + (s.to - s.from), 0);

const useTrack = () => {
  const [track, setTrack] = useState<Track | null>(null);
  const [handle] = useState(() => delayRender("Tai camera.json"));
  useEffect(() => {
    fetch(staticFile("inputs/sanho-matte/camera.json"))
      .then((r) => r.json())
      .then((j) => {
        setTrack(j);
        continueRender(handle);
      })
      .catch(() => {
        setTrack({ fps: 30, dx: [0], dy: [0] });
        continueRender(handle);
      });
  }, [handle]);
  return track;
};

/** stem: "all" binh thuong | "sfx" chi SFX | "voice" chi giong (de do SFX co ro tren giong khong). */
export const QtlLab: React.FC<{ stem?: "all" | "sfx" | "voice" }> = ({ stem = "all" }) => {
  const { fps } = useVideoConfig();
  const track = useTrack();
  if (!track) return null;
  let acc = 0;
  const cues: SfxCue[] = [];
  const blocks = SCENES.map((sc, i) => {
    const start = acc;
    const len = sc.to - sc.from;
    acc += len;
    const rel = (s: number) => s - sc.from;
    sc.sfx.forEach(([s, sfx, v]) => cues.push({ frame: Math.round((start + rel(s) + 0.08 - hitOf(sfx)) * fps), sfx, volume: v }));
    if (i > 0) cues.push({ frame: Math.round((start + 0.1 - hitOf("real/qtl-transition")) * fps), sfx: "real/qtl-transition", volume: 1 }, { frame: Math.round((start + 0.1 - hitOf("real/qtl-sparkle-sweep")) * fps), sfx: "real/qtl-sparkle-sweep", volume: 0.55 });
    return (
      <Sequence key={i} from={Math.round(start * fps)} durationInFrames={Math.round(len * fps)} name={sc.label}>
        <QtGrade>
          <Sequence from={-Math.round(sc.from * fps)} layout="none">
            <OffthreadVideo src={staticFile(SRC)} muted={stem === "sfx"} />
          </Sequence>
        </QtGrade>
        <QtTrack track={track} srcAt={sc.from}>
          {sc.render(rel, len)}
        </QtTrack>
        {sc.person ? <QtPersonFront src={staticFile(MATTE)} startFrom={sc.from} /> : null}
        <div style={{ position: "absolute", left: 24, bottom: 40, color: "#ff0", fontSize: 28, fontFamily: "sans-serif", background: "rgba(0,0,0,0.5)", padding: "4px 10px" }}>THỬ v4 · {sc.label}</div>
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
