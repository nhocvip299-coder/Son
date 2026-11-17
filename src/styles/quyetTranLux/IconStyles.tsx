import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { LINE_ICONS } from "./lineIcons";

/** Bang so sanh 3 PHONG CACH ICON sang trong de nguoi dung chon (anh tinh). */
const NAMES3D = ["house-garden", "store", "mall", "key", "money-bag", "ferris-wheel"];
const NAMESL = ["house", "store", "mall", "key", "coins", "park"];
const GoldDefs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff3cf" />
      <stop offset="0.35" stopColor="#e8b95a" />
      <stop offset="0.6" stopColor="#a8701c" />
      <stop offset="0.8" stopColor="#f3d488" />
      <stop offset="1" stopColor="#8a5a14" />
    </linearGradient>
  </defs>
);
export const LineIcon: React.FC<{ name: string; size: number; weight?: "light" | "thin"; id: string }> = ({ name, size, weight = "light", id }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" style={{ filter: "drop-shadow(0 0 10px rgba(255,205,120,0.55)) drop-shadow(0 6px 10px rgba(0,0,0,0.5))" }}>
    <GoldDefs id={id} />
    <g fill={`url(#${id})`} dangerouslySetInnerHTML={{ __html: LINE_ICONS[weight][name] }} />
  </svg>
);
const Label: React.FC<{ children: string }> = ({ children }) => (
  <div style={{ fontFamily: "'Montserrat'", fontWeight: 800, fontSize: 46, color: "#ffe6a8", margin: "40px 0 18px 50px", letterSpacing: "0.04em" }}>{children}</div>
);

export const IconStyles: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#3b4048 0%,#1b1d22 100%)" }}>
    <AbsoluteFill style={{ background: "url() center/cover", opacity: 0 }} />
    <Label>A · TƯỢNG VÀNG KIM (khối 3D đổi chất liệu vàng)</Label>
    <div style={{ display: "flex", gap: 22, paddingLeft: 40 }}>
      {NAMES3D.map((n) => (
        <Img key={n} src={staticFile(`icons3d/${n}.webp`)} style={{ width: 150, height: 150, filter: "grayscale(1) contrast(1.35) brightness(1.05) sepia(1) saturate(2.4) hue-rotate(-10deg) drop-shadow(0 0 14px rgba(255,200,110,0.55)) drop-shadow(0 10px 14px rgba(0,0,0,0.55))" }} />
      ))}
    </div>
    <Label>B · NÉT MẢNH VÀNG (huy hiệu tròn kính mờ)</Label>
    <div style={{ display: "flex", gap: 22, paddingLeft: 40 }}>
      {NAMESL.map((n, i) => (
        <div key={n} style={{ width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22), rgba(255,255,255,0.06) 60%)", border: "2px solid rgba(255,214,140,0.85)", boxShadow: "0 0 18px rgba(255,200,110,0.35), inset 0 0 18px rgba(255,255,255,0.12), 0 12px 24px rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LineIcon name={n} size={92} weight="light" id={`b${i}`} />
        </div>
      ))}
    </div>
    <Label>C · KHỐI KÍNH (biểu tượng vàng trên kính dày)</Label>
    <div style={{ display: "flex", gap: 22, paddingLeft: 40 }}>
      {NAMESL.map((n, i) => (
        <div key={n} style={{ width: 150, height: 150, borderRadius: 34, background: "linear-gradient(145deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.08) 45%, rgba(0,0,0,0.18) 100%)", border: "1.5px solid rgba(255,255,255,0.55)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -10px 20px rgba(0,0,0,0.25), 0 16px 30px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LineIcon name={n} size={96} weight="light" id={`c${i}`} />
        </div>
      ))}
    </div>
    <Label>D · NÉT MẢNH VÀNG TRƠN (không khung, đi cạnh chữ)</Label>
    <div style={{ display: "flex", gap: 22, paddingLeft: 40 }}>
      {NAMESL.map((n, i) => (
        <div key={n} style={{ width: 150, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LineIcon name={n} size={130} weight="thin" id={`d${i}`} />
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
