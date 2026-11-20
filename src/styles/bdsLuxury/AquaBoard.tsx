import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";

/**
 * MAU "XANH DIEN QUANG" hoc tu video upload (bang cap font cua editornghiepdu.vn) — do bang pixel:
 *  - chu khoi: gradient CHEO xanh dam #13489c <-> xanh ngoc phat quang #16fff4 (dai sang cheo giua chu), KHONG vien, KHONG khoi
 *  - chu ky ten trang #f3ffff + quang trang mem, de len chan/goc chu khoi
 *  - nen gan den xanh navy #00001c
 * Bang nay dung font MIEN PHI thay the, noi dung video SB-145.
 */
const Grad: React.FC<{ id: string }> = ({ id }) => (
  <linearGradient id={id} x1="0" y1="0.1" x2="1" y2="0.9">
    <stop offset="0" stopColor="#13489c" /><stop offset="0.22" stopColor="#1576b0" /><stop offset="0.38" stopColor="#15c8d6" />
    <stop offset="0.47" stopColor="#16fff4" /><stop offset="0.56" stopColor="#15b5cc" /><stop offset="0.72" stopColor="#1582b4" /><stop offset="1" stopColor="#13489c" />
  </linearGradient>
);
const Pair: React.FC<{ y: number; main: string; mf: string; mw: number; ms: number; script: string; sf: string; ss: number; sx: number; sy: number; label: string; bg?: boolean }> = ({ y, main, mf, mw, ms, script, sf, ss, sx, sy, label }) => (
  <g transform={`translate(0 ${y})`}>
    <text x={540} y={0} textAnchor="middle" dominantBaseline="central" fill="url(#aq)" style={{ fontFamily: mf, fontWeight: mw, fontSize: ms, filter: "drop-shadow(0 0 18px rgba(22,200,240,0.35))" }}>{main}</text>
    <text x={540 + sx} y={sy} textAnchor="middle" dominantBaseline="central" fill="#f3ffff" style={{ fontFamily: sf, fontSize: ss, filter: "drop-shadow(0 0 6px rgba(255,255,255,0.85)) drop-shadow(0 0 16px rgba(160,230,255,0.6)) drop-shadow(0 3px 3px rgba(0,0,0,0.6))" }}>{script}</text>
    <text x={540} y={ms * 0.75 + 30} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.75)" style={{ fontFamily: "Be Vietnam Pro", fontWeight: 600, fontSize: 26 }}>{label}</text>
  </g>
);

export const AquaBoard: React.FC<{ onVideo?: boolean }> = ({ onVideo = false }) => (
  <AbsoluteFill style={{ backgroundColor: "#00001c" }}>
    {onVideo ? <OffthreadVideo src={staticFile("inputs/du-an-3/goc-1080-hq.mp4")} trimBefore={Math.round(9 * 60)} muted /> : <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #050a3a 0%, #00001c 70%)" }} />}
    {onVideo ? <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,28,0.55) 0%, rgba(0,0,28,0) 45%)" }} /> : null}
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs><Grad id="aq" /></defs>
      <Pair y={300} main="70 TRIỆU" mf="Barlow Condensed" mw={800} ms={230} script="một mét vuông đất" sf="Ms Madi" ss={92} sx={60} sy={95} label="Barlow Condensed + Ms Madi  (≈ UTM Bebas + Autography)" />
      <Pair y={720} main="VĂN GIANG" mf="Barlow Condensed" mw={800} ms={200} script="so với đất thổ cư" sf="Allura" ss={88} sx={-170} sy={-105} label="Barlow Condensed + Allura  (≈ Blona + MTD Starcity Script)" />
      <Pair y={1120} main="Vị trí đắc địa" mf="Playfair Display" mw={700} ms={140} script="Ocean Park 2" sf="Ms Madi" ss={90} sx={90} sy={70} label="Playfair Display + Ms Madi  (≈ Braven + Bengoda)" />
      <Pair y={1500} main="HƠN 15 TỶ" mf="Barlow Condensed" mw={900} ms={210} script="chỉ còn" sf="Great Vibes" ss={100} sx={-200} sy={-95} label="Barlow Condensed 900 + Great Vibes  (≈ UTM Impact + MTD AlFresco)" />
    </svg>
  </AbsoluteFill>
);
