import React from "react";
import { AbsoluteFill } from "remotion";
import { MusicBed, SfxTrack } from "../../compositions/shared";
import { TpBigNumeral, TpEllipseTag, TpGlitchChip, TpGlitchValue, TpHighlightBlock, TpLabelChip, TpOpportunity, TpStrike, TpTrackHeader, TpValueSwoosh } from "./presets";

/** Trang trung bay 10 preset (luoi 2 cot nhu video mau) de doi chieu. */
const Cell: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: "absolute", left: x, top: y }}>{children}</div>
);

export const TextPresetsGallery: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 0%, #3a1406 0%, #120604 55%, #070302 100%)" }}>
    <div style={{ position: "absolute", left: 50, right: 50, top: 230, bottom: 260, borderRadius: 28, border: "3px solid #E2531F", background: "#050505", boxShadow: "0 0 40px #E2531F55" }} />
    <Cell x={90} y={280}><TpTrackHeader u={80} main="Bất động sản" script="Đáng sống" delay={0} /></Cell>
    <Cell x={600} y={290}><TpGlitchChip u={56} text="HOT TREND" delay={2} /></Cell>
    <Cell x={90} y={500}><TpOpportunity u={105} top="Hãy nắm bắt" main="Cơ hội" bottom="Ngay bây giờ" delay={3} /></Cell>
    <Cell x={580} y={470}><TpValueSwoosh u={78} top="trị giá" main="100 Triệu" unit="đồng" delay={4} /></Cell>
    <Cell x={110} y={790}><TpLabelChip u={92} label="Vị Trí" sub="trung tâm đắc địa" delay={6} /></Cell>
    <Cell x={590} y={760}><TpBigNumeral u={78} num="1" main="Căn Hộ" script="Đáng sống" delay={7} /></Cell>
    <Cell x={90} y={1030}><TpEllipseTag u={88} a="Không" b="Gian" tag="xanh" delay={9} /></Cell>
    <Cell x={600} y={1060}><TpGlitchValue u={95} script="Tiết kiệm" main="50 TRIỆU" delay={10} /></Cell>
    <Cell x={110} y={1330}><TpHighlightBlock u={92} top="Tại sao?" main="Nên mua" script="ngay" delay={12} /></Cell>
    <Cell x={610} y={1330}><TpStrike u={92} text="Cẩn Thận" delay={13} /></Cell>
    <MusicBed src="music/bed-ambient.wav" volume={0.25} />
    <SfxTrack cues={[{ frame: 0, sfx: "whoosh", volume: 0.3 }, { frame: 8, sfx: "glitch", volume: 0.25 }, { frame: 52, sfx: "swoosh-down", volume: 0.3 }]} />
  </AbsoluteFill>
);
