// Ảnh bìa kiểu "giá to" (theo mẫu Sơn gửi 17/11): món ăn nửa dưới, khối chữ nửa trên —
// viên nhãn viền vàng, dòng địa điểm trắng, giá vàng khổng lồ bóng 3D, dòng trắng, viên câu hỏi chữ vàng.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";

export type ThumbBoldProps = {
  image: string;
  imageShiftY?: number; // đẩy ảnh xuống (px) để món nằm nửa dưới
  imageScale?: number;
  sharpFromPct?: number; // phần trên ảnh (đã dịch) bị làm mờ tới mốc này (%)
  pill: string;
  line: string;
  price: string;
  sub: string;
  question: string;
};

const Y = "#FFD43B";
const font: React.CSSProperties = { fontFamily: "Montserrat", fontWeight: 900, textTransform: "uppercase", lineHeight: 1, whiteSpace: "nowrap" };
const soft = "0 6px 18px rgba(0,0,0,.75), 0 2px 4px rgba(0,0,0,.6)";
// bóng 3D đổ xuống-phải nhiều lớp như mẫu
const extrude = (n: number, c1: string) =>
  Array.from({ length: n }, (_, i) => `${(i + 1) * 0.6}px ${i + 1}px 0 ${c1}`).join(", ") + ", 0 18px 30px rgba(0,0,0,.65)";

const Pill: React.FC<{ children: React.ReactNode; color: string; size: number }> = ({ children, color, size }) => (
  <div style={{ display: "inline-block", background: "rgba(22,22,22,.88)", border: `5px solid ${Y}`, borderRadius: 999, padding: `${size * 0.32}px ${size * 0.7}px`, boxShadow: "0 8px 22px rgba(0,0,0,.5)" }}>
    <div style={{ ...font, fontWeight: 800, fontSize: size, color }}>{children}</div>
  </div>
);

export const ThumbBold: React.FC<ThumbBoldProps> = ({ image, imageShiftY = 0, imageScale = 1, sharpFromPct = 40, pill, line, price, sub, question }) => {
  const tf = `translateY(${imageShiftY}px) scale(${imageScale})`;
  const mask = `linear-gradient(to bottom, transparent 0%, transparent ${sharpFromPct}%, black ${sharpFromPct + 10}%)`;
  return (
    <AbsoluteFill style={{ background: "#141414", overflow: "hidden" }}>
      {/* nền mờ phủ kín (lấp khoảng trống khi đẩy ảnh xuống) */}
      <Img src={staticFile(image)} style={{ position: "absolute", inset: -60, width: "calc(100% + 120px)", height: "calc(100% + 120px)", objectFit: "cover", filter: "blur(28px) brightness(.6)" }} />
      {/* ảnh dịch xuống, bản mờ */}
      <Img src={staticFile(image)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: tf, filter: "blur(14px) brightness(.7)" }} />
      {/* ảnh dịch xuống, bản nét chỉ ở phần dưới */}
      <Img src={staticFile(image)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: tf, filter: "saturate(1.18) contrast(1.06) brightness(1.04)", WebkitMaskImage: mask, maskImage: mask }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.35) 0%, rgba(0,0,0,.15) 40%, rgba(0,0,0,0) 52%)" }} />
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <Pill color="#fff" size={54}>{pill}</Pill>
        <div style={{ ...font, fontSize: 86, color: "#fff", marginTop: 26, textShadow: soft, letterSpacing: 1 }}>{line}</div>
        <div style={{ ...font, fontSize: 300, color: Y, marginTop: 12, letterSpacing: -6, WebkitTextStroke: "3px #1d1500", paintOrder: "stroke fill", textShadow: extrude(14, "#3a2a00") }}>{price}</div>
        <div style={{ ...font, fontSize: 110, color: "#fff", marginTop: 6, textShadow: soft }}>{sub}</div>
        <div style={{ marginTop: 34 }}><Pill color={Y} size={66}>{question}</Pill></div>
      </div>
    </AbsoluteFill>
  );
};
