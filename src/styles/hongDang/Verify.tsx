import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { HdBigNumber, HdKeywordReveal, HdMapHud, HdPipCard, HdQuestionCard, HdSpinIcon3D, HdWatermark } from "./components";

/** Video kiem chung 8s cho skill mau-hong-dang (tai nguyen tu tao, khong dung footage cua video mau). */
const OUTLINE = "M470 820 L560 790 L640 1010 L700 1180 L640 1330 L560 1320 L520 1160 L450 980 Z";

export const HongDangVerify: React.FC = () => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  const cues: SfxCue[] = [
    { frame: s(0.1), sfx: "pop", volume: 0.45 },
    { frame: s(0.4), sfx: "whoosh", volume: 0.3 },
    { frame: s(2.8), sfx: "click", volume: 0.5 },
    { frame: s(3.6), sfx: "impact", volume: 0.45 },
    { frame: s(4.0), sfx: "swoosh-down", volume: 0.35 },
    { frame: s(5.4), sfx: "whoosh", volume: 0.4 },
    { frame: s(6.3), sfx: "ding", volume: 0.3 },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence durationInFrames={s(5.4)} name="Nen nguoi noi (thay the)">
        <AbsoluteFill style={{ filter: "sepia(0.25) saturate(1.1) brightness(0.95)" }}>
          <Video src={staticFile("demo/bg.mp4")} muted objectFit="cover" />
        </AbsoluteFill>
      </Sequence>
      <Sequence durationInFrames={s(2.8)} name="1+2 Keyword + Icon 3D">
        <HdKeywordReveal lead="Chi phí sinh hoạt" keyword="THẤP HƠN" duration={2.8 * 30} icon={<HdSpinIcon3D glyph="$" />} />
      </Sequence>
      <Sequence from={s(2.8)} durationInFrames={s(2.6)} name="3 Question card">
        <HdQuestionCard line1="Chọn nhà ở trung tâm" line2="được gì và mất gì?" duration={2.6 * 30} />
      </Sequence>
      <Sequence from={s(3.6)} durationInFrames={s(1.8)} name="4 Big number">
        <HdBigNumber text="5 TỶ" duration={1.8 * 30} />
      </Sequence>
      <Sequence from={s(4.0)} durationInFrames={s(1.4)} name="6 PiP">
        <HdPipCard duration={1.4 * 30}>
          <AbsoluteFill style={{ background: "linear-gradient(135deg,#c2185b,#f06292 55%,#ffd1dc)" }} />
        </HdPipCard>
      </Sequence>
      <Sequence from={s(5.4)} durationInFrames={s(2.6)} name="5 Map HUD">
        <HdMapHud outline={OUTLINE} label="MÔ HÌNH|ALL-IN-ONE" callout={["Khu vui chơi - Mua sắm", "Thể thao - Trường học"]} calloutAt={[560, 620]} labelAt={[520, 1020]} duration={2.6 * 30} />
      </Sequence>
      <HdWatermark line1="Tên kênh" line2="Slogan kênh" />
      <SfxTrack cues={cues} />
    </AbsoluteFill>
  );
};
