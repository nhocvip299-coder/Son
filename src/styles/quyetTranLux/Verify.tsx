import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio, Video } from "@remotion/media";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { QtCardStack, QtDarkCard, QtDip, QtFlash, QtGrade, QtHeading, QtNumber, QtSubtitle, QtTitle, QtTrackingReveal } from "./components";

/**
 * Video kiem chung 13.5s cho skill mau-quyet-tran-lux: tai hien 7 khoanh khac cua video mau
 * (cung chu, cung vi tri) tren nen demo tu tao — khong dung footage/logo cua kenh mau.
 * Moc so sanh (mau -> dung): ref02 33.4->1.2 | ref02 131.9->3.4 | ref01 161.8->5.6 | ref01 50.1->6.8
 *                            ref01 50.8->8.0 | ref01 163.8->11.0 | ref01 87.2->12.6
 */
export const QTL_VERIFY_SEC = 13.5;

const CARD_BG = [
  "linear-gradient(160deg,#c9a27a 0%,#6b4a33 45%,#1f1a17 100%)",
  "linear-gradient(180deg,#9fd3f0 0%,#e8f4fb 45%,#3aa7c9 70%,#c8b8a6 100%)",
  "linear-gradient(170deg,#f3c58f 0%,#a7866b 40%,#2c3a3f 75%,#3f8fa3 100%)",
];

export const QuyetTranLuxVerify: React.FC = () => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  const seq = (from: number, dur: number) => ({ from: s(from), durationInFrames: s(dur) });
  const cues: SfxCue[] = [
    { frame: s(0.0), sfx: "shimmer", volume: 0.7 },
    { frame: s(2.15), sfx: "whoosh", volume: 0.8 },
    { frame: s(2.2), sfx: "shine", volume: 0.6 },
    { frame: s(4.4), sfx: "swish", volume: 0.7 },
    { frame: s(7.2), sfx: "shimmer", volume: 0.6 },
    { frame: s(9.0), sfx: "swoosh-down", volume: 0.7 },
    { frame: s(9.55), sfx: "swish", volume: 0.6 },
    { frame: s(10.8), sfx: "pop", volume: 0.5 },
    { frame: s(12.0), sfx: "whoosh", volume: 0.6 },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <QtGrade>
        <Video src={staticFile("demo/bg.mp4")} muted objectFit="cover" loop />
      </QtGrade>
      <Sequence {...seq(0, 2.2)} name="1 Title 2 dong">
        <QtTitle lead="IXORA 2 có" main="63 CĂN" y={0.66} duration={2.2} />
      </Sequence>
      <Sequence {...seq(2.05, 0.6)} name="Flash">
        <QtFlash />
      </Sequence>
      <Sequence {...seq(2.2, 2.2)} name="2 Tracking reveal">
        <QtTrackingReveal lead="sân golf" main="THE BLUFFS" y={0.225} duration={2.2} />
      </Sequence>
      <Sequence {...seq(4.4, 2.0)} name="3 Number">
        <QtNumber lead="Mỗi căn rộng từ" value="224 - 300" unit="m²" x={0.25} y={0.665} duration={2.0} />
      </Sequence>
      <Sequence {...seq(6.4, 0.8)} name="4 Subtitle">
        <QtSubtitle text="Anh chị hãy nhìn vào" y={0.255} duration={0.8} />
      </Sequence>
      <Sequence {...seq(7.2, 1.9)} name="5 Heading">
        <QtHeading text="DANH SÁCH ĐƠN VỊ TƯ VẤN" y={0.27} duration={1.9} />
      </Sequence>
      <Sequence {...seq(8.85, 0.9)} name="Dip">
        <QtDip />
      </Sequence>
      <Sequence {...seq(9.2, 2.8)} name="6 Card stack">
        <QtCardStack images={[]} title={["TRẦN", "CAO", "6.8 m"]} label="HỒ BƠI RIÊNG" duration={2.8} renderCard={(i) => <AbsoluteFill style={{ background: CARD_BG[i] }} />} />
      </Sequence>
      <Sequence {...seq(12.0, 1.5)} name="7 Dark card">
        <QtDarkCard text="như là" duration={1.5} />
      </Sequence>
      <Audio src={staticFile("music/bed-ambient.wav")} volume={0.18} />
      <SfxTrack cues={cues} />
    </AbsoluteFill>
  );
};
