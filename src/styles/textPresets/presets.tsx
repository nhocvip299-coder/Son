/**
 * 10 preset chu dong cho video BDS, dung lai bang Remotion tu video mau "40 Text Presets".
 * Moi preset: 3 tang chu (viet tay / dam / serif) + glow + gradient + 1 chuyen dong dac trung.
 * `u` = co chu chinh (px). `delay` tinh theo frame@30.
 */
import React from "react";
import { FONTS } from "../../lib/fonts";
import { interpolate } from "remotion";
import { useFrame30 } from "../../lib/theme";
import { ChipBox, CharPop, DrawPath, GlitchChars, ScriptWipe, TrackIn, clamp, glowFill, solidGlow } from "./primitives";

type P = { u?: number; delay?: number };
const col = (gap = 0): React.CSSProperties => ({ display: "inline-flex", flexDirection: "column", gap, lineHeight: 1.05 });

/** 1. Bo ba "Hay nam bat / Co hoi / Ngay bay gio": viet tay tren, serif sang lon giua, viet tay duoi phai. */
export const TpOpportunity: React.FC<P & { top: string; main: string; bottom: string }> = ({ u = 120, delay = 0, top, main, bottom }) => (
  <div style={col()}>
    <ScriptWipe delay={delay} dur={12} style={{ fontFamily: FONTS.script, fontWeight: 600, fontSize: u * 0.32, ...solidGlow("#FFFFFF", "#ffffff66", 0.5) }}>{top}</ScriptWipe>
    <TrackIn delay={delay + 4} from={0.4} style={{ fontFamily: FONTS.serif, fontWeight: 700, fontSize: u, marginLeft: u * 0.15, ...glowFill("#FFFDE0", "#F5E663", "#F2E35B") }}>{main}</TrackIn>
    <ScriptWipe delay={delay + 14} style={{ fontFamily: FONTS.serif, fontStyle: "italic", fontWeight: 500, fontSize: u * 0.26, alignSelf: "flex-end", color: "#F2F2F2" }}>{bottom}</ScriptWipe>
  </div>
);

/** 2. Gia tri "tri gia / 100 Trieu / dong" + duong cong gach chan. */
export const TpValueSwoosh: React.FC<P & { top: string; main: string; unit: string }> = ({ u = 110, delay = 0, top, main, unit }) => (
  <div style={{ ...col(), position: "relative" }}>
    <ScriptWipe delay={delay} dur={8} style={{ fontFamily: FONTS.serif, fontStyle: "italic", fontWeight: 500, fontSize: u * 0.3, color: "#fff", marginLeft: u * 0.3 }}>{top}</ScriptWipe>
    <CharPop delay={delay + 3} style={{ fontFamily: FONTS.rounded, fontWeight: 900, fontSize: u, ...glowFill("#F6FF7A", "#B8F23A", "#C8FF3C", 0.8) }}>{main}</CharPop>
    <DrawPath delay={delay + 12} d={`M ${u * 0.1} ${u * 0.35} Q ${u * 1.4} ${-u * 0.05} ${u * 2.9} ${u * 0.08}`} width={u * 3} height={u * 0.4} stroke="#B8F23A" strokeWidth={u * 0.035} glow="#C8FF3C" style={{ marginTop: -u * 0.12 }} />
    <ScriptWipe delay={delay + 16} style={{ fontFamily: FONTS.serif, fontStyle: "italic", fontWeight: 500, fontSize: u * 0.34, color: "#fff", alignSelf: "flex-end", marginTop: -u * 0.28 }}>{unit}</ScriptWipe>
  </div>
);

/** 3. Chip nhan "Vi Tri" + dong serif "trung tam dac dia". */
export const TpLabelChip: React.FC<P & { label: string; sub: string }> = ({ u = 110, delay = 0, label, sub }) => (
  <div style={{ ...col(u * 0.06), alignItems: "center" }}>
    <ChipBox delay={delay} style={{ background: "linear-gradient(180deg,#FFF3B8,#F3D77A)", borderRadius: u * 0.12, padding: `${u * 0.02}px ${u * 0.3}px`, boxShadow: "0 0 18px #F3D77A88" }}>
      <CharPop delay={delay + 4} style={{ fontFamily: FONTS.condensed, fontWeight: 700, fontStyle: "italic", fontSize: u, color: "#fff", textShadow: "0 2px 6px rgba(120,80,0,0.45)" }}>{label}</CharPop>
    </ChipBox>
    <TrackIn delay={delay + 10} style={{ fontFamily: FONTS.serif, fontWeight: 700, fontSize: u * 0.3, color: "#fff" }}>{sub}</TrackIn>
  </div>
);

/** 4. So lon nghieng "1" + "Can Ho" + viet tay "Dang song" + gach chan cong. */
export const TpBigNumeral: React.FC<P & { num: string; main: string; script: string; color?: [string, string] }> = ({ u = 110, delay = 0, num, main, script, color = ["#FF8BF0", "#D63CF0"] }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: u * 0.08, position: "relative" }}>
    <TrackIn delay={delay} from={0} dur={8} style={{ fontFamily: FONTS.rounded, fontStyle: "italic", fontWeight: 900, fontSize: u * 2, lineHeight: 1, ...glowFill(color[0], color[1], color[1]) }}>{num}</TrackIn>
    <div style={col()}>
      <CharPop delay={delay + 5} style={{ fontFamily: FONTS.condensed, fontWeight: 700, fontSize: u, ...glowFill(color[0], color[1], color[1]) }}>{main}</CharPop>
      <ScriptWipe delay={delay + 12} style={{ fontFamily: FONTS.script, fontWeight: 600, fontSize: u * 0.62, color: "#fff", marginTop: -u * 0.1, marginLeft: u * 0.15 }}>{script}</ScriptWipe>
    </div>
    <DrawPath delay={delay + 16} d={`M 0 ${u * 0.3} Q ${u * 1.2} ${u * 0.05} ${u * 2.6} 0`} width={u * 2.6} height={u * 0.35} stroke={color[1]} strokeWidth={u * 0.03} glow={color[0]} style={{ position: "absolute", left: 0, bottom: -u * 0.2 }} />
  </div>
);

/** 5. "Khong Gian" xanh la chu bac thang + chu serif trong vien elip ve dan. */
export const TpEllipseTag: React.FC<P & { a: string; b: string; tag: string }> = ({ u = 100, delay = 0, a, b, tag }) => {
  const fill = glowFill("#E6FF6A", "#62E03A", "#7CFF4A");
  const word: React.CSSProperties = { fontFamily: FONTS.condensed, fontWeight: 700, fontStyle: "italic", fontSize: u, ...fill };
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1 }}>
      <div style={{ display: "inline-flex", alignItems: "flex-start", gap: u * 0.12 }}>
        <CharPop delay={delay} style={word}>{a}</CharPop>
        <CharPop delay={delay + 6} style={{ ...word, translate: `0 ${u * 0.3}px` }}>{b}</CharPop>
      </div>
      <div style={{ position: "relative", width: u * 1.7, height: u * 0.8, marginTop: -u * 0.05 }}>
        <DrawPath delay={delay + 10} d={`M ${u * 0.9} ${u * 0.04} C ${u * 1.75} ${u * 0.0}, ${u * 1.75} ${u * 0.74}, ${u * 0.85} ${u * 0.74} C ${u * -0.05} ${u * 0.74}, ${u * -0.05} ${u * 0.02}, ${u * 0.95} ${u * 0.06}`} width={u * 1.7} height={u * 0.8} stroke="#7CFF4A" strokeWidth={u * 0.03} glow="#7CFF4A" style={{ position: "absolute", left: 0, top: 0 }} />
        <ScriptWipe delay={delay + 14} style={{ position: "absolute", left: u * 0.32, top: u * 0.06, fontFamily: FONTS.serif, fontStyle: "italic", fontWeight: 500, fontSize: u * 0.5, color: "#fff" }}>{tag}</ScriptWipe>
      </div>
    </div>
  );
};

/** 6. "Tiet kiem / 50 TRIEU": viet tay + so glitch xanh cyan. */
export const TpGlitchValue: React.FC<P & { script: string; main: string }> = ({ u = 110, delay = 0, script, main }) => (
  <div style={col()}>
    <ScriptWipe delay={delay} style={{ fontFamily: FONTS.script, fontWeight: 600, fontSize: u * 0.45, color: "#fff", marginLeft: u * 0.4 }}>{script}</ScriptWipe>
    <GlitchChars delay={delay + 4} style={{ fontFamily: FONTS.condensed, fontWeight: 700, fontSize: u, marginTop: -u * 0.12, ...solidGlow("#7FFBFF", "#18D8FF", 1) }}>{main}</GlitchChars>
  </div>
);

/** 7. Gach ngang do ve dan qua chu (canh bao / gia cu) "Can Than". */
export const TpStrike: React.FC<P & { text: string; color?: string }> = ({ u = 110, delay = 0, text, color = "#FF2D55" }) => {
  // [XM] khi gach ngang ve xong, chu chuyen tu trang sang do
  const f = useFrame30() - delay;
  const red = interpolate(f, [24, 30], [0, 1], clamp);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <CharPop delay={delay} style={{ fontFamily: FONTS.condensed, fontWeight: 700, fontSize: u, ...solidGlow(red > 0.5 ? "#FF6B7F" : "#FFFFFF", red > 0.5 ? color : "#ffffff88", 0.6 + red * 0.6) }}>{text}</CharPop>
      <DrawPath delay={delay + 22} dur={8} d={`M ${-u * 0.1} ${u * 0.62} L ${u * text.length * 0.5} ${u * 0.56}`} width={u * text.length * 0.5} height={u} stroke={color} strokeWidth={u * 0.07} glow={color} style={{ position: "absolute", left: 0, top: 0 }} />
    </div>
  );
};

/** 8. "Bat dong san" tracking-in gradient cam + viet tay "Dang song" ben duoi. */
export const TpTrackHeader: React.FC<P & { main: string; script: string }> = ({ u = 100, delay = 0, main, script }) => (
  <div style={{ ...col(), alignItems: "flex-start" }}>
    <TrackIn delay={delay} from={0.6} dur={16} style={{ fontFamily: FONTS.condensed, fontWeight: 700, fontSize: u, ...glowFill("#FFD84A", "#FF6A1A", "#FF8A1A", 0.8) }}>{main}</TrackIn>
    <ScriptWipe delay={delay + 12} style={{ fontFamily: FONTS.serif, fontStyle: "italic", fontWeight: 500, fontSize: u * 0.5, color: "#fff", marginLeft: u * 0.6, marginTop: u * 0.02 }}>{script}</ScriptWipe>
  </div>
);

/** 9. Khoi highlight hong quet sau chu serif "Tai sao? / Edit video / lai can thiet". */
export const TpHighlightBlock: React.FC<P & { top: string; main: string; script: string }> = ({ u = 90, delay = 0, top, main, script }) => (
  <div style={col(u * 0.04)}>
    <TrackIn delay={delay} style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: u * 0.42, color: "#fff" }}>{top}</TrackIn>
    <div style={{ display: "inline-flex", alignItems: "flex-end", gap: u * 0.15 }}>
      <ChipBox delay={delay + 4} dur={10} style={{ background: "#F25C6E", padding: `0 ${u * 0.12}px`, borderRadius: 4 }}>
        <span style={{ fontFamily: FONTS.serif, fontWeight: 700, fontSize: u * 0.7, color: "#fff", whiteSpace: "pre" }}>{main}</span>
      </ChipBox>
      <ScriptWipe delay={delay + 14} style={{ fontFamily: FONTS.script, fontWeight: 600, fontSize: u * 0.5, color: "#fff" }}>{script}</ScriptWipe>
    </div>
  </div>
);

/** 10. Chip neon glitch "HOT TREND" (vien sang + chu glitch roi on dinh). */
export const TpGlitchChip: React.FC<P & { text: string; color?: string }> = ({ u = 70, delay = 0, text, color = "#2BE3FF" }) => (
  <ChipBox delay={delay} dur={6} style={{ border: `${u * 0.05}px solid #E9FDFF`, background: `linear-gradient(180deg, ${color}, #12B8E0)`, padding: `${u * 0.05}px ${u * 0.35}px`, boxShadow: `0 0 16px ${color}, inset 0 0 12px ${color}88` }}>
    <GlitchChars delay={delay + 3} settle={12} style={{ fontFamily: FONTS.condensed, fontWeight: 700, fontSize: u, letterSpacing: "0.04em", ...solidGlow("#FFFFFF", color, 0.6) }}>{text}</GlitchChars>
  </ChipBox>
);
