// Ảnh bìa (thumbnail) TikTok/Reels theo mẫu Gelexia. Chữ nằm trong vùng 3:4 giữa khung (lưới profile TikTok cắt 1080×1440).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Img, cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { STYLE as S } from "./style";

export type CoverProps = {
  images: string[]; // 1 ảnh = toàn khung; 4 ảnh = lưới 2×2
  kicker: string; // dòng nhỏ phía trên
  title: string; // tiêu đề lớn, \n để xuống dòng
  highlight: string; // dòng vàng nhấn
  name: string;
  address: string;
};

const heavy: React.CSSProperties = { fontFamily: "GelexiaPhudu", fontWeight: 800, color: S.white, WebkitTextStroke: "1.6px rgba(24,25,20,.9)", paintOrder: "stroke fill" };
const deep = "0 2px 0 #45443a, 0 4px 0 #292921, 0 6px 6px rgba(0,0,0,.75)";
const deepGold = "0 2px 0 #59513a, 0 4px 0 #2d2b21, 0 6px 6px rgba(0,0,0,.75)";

function useFonts() {
  const [h] = useState(() => delayRender("cover fonts"));
  useEffect(() => {
    Promise.all([
      new FontFace("GelexiaPhudu", `url(${staticFile("fonts/gelexia/Phudu.ttf")})`, { weight: "800" }).load(),
      new FontFace("GelexiaBody", `url(${staticFile("fonts/gelexia/BeVietnamPro-SemiBold.ttf")})`, { weight: "600" }).load(),
    ]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(h); }).catch(cancelRender);
  }, [h]);
}

export const GelexiaCover: React.FC<CoverProps> = ({ images, kicker, title, highlight, name, address }) => {
  useFonts();
  const grid = images.length >= 4;
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {grid ? (
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 8 }}>
          {images.slice(0, 4).map((src, i) => <Img key={i} src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />)}
        </div>
      ) : (
        <Img src={staticFile(images[0])} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.12) contrast(1.05)" }} />
      )}
      {/* làm tối nhẹ vùng chữ để đọc rõ trên ảnh thu nhỏ */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 40% at 50% 46%, rgba(0,0,0,.55), rgba(0,0,0,0) 75%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 110px" }}>
        <div style={{ background: "rgba(48,51,48,.58)", borderRadius: 28, padding: "34px 46px 38px", textAlign: "center", maxWidth: 860 }}>
          <div style={{ fontFamily: "GelexiaBody", fontWeight: 600, fontSize: 40, color: S.white, letterSpacing: 1 }}>{kicker}</div>
          <div style={{ ...heavy, fontSize: 150, lineHeight: 1.0, marginTop: 10, color: S.yellow, textShadow: deepGold }}>{highlight}</div>
          <div style={{ ...heavy, fontSize: 92, lineHeight: 1.05, marginTop: 8, textShadow: deep, whiteSpace: "pre-line" }}>{title}</div>
        </div>
        <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 16, background: "rgba(48,51,48,.58)", borderRadius: 16, padding: "14px 26px" }}>
          <svg width={44} height={57} viewBox="0 0 40 52"><path fill={S.pin} d="M20 0C8 0 0 8 0 19c0 13 20 33 20 33s20-20 20-33C40 8 32 0 20 0Z" /><circle cx="20" cy="18" r="7" fill="white" /></svg>
          <div style={{ textAlign: "left" }}>
            <div style={{ ...heavy, fontSize: 54, color: S.yellow, textShadow: deepGold, lineHeight: 1.1 }}>{name}</div>
            <div style={{ fontFamily: "GelexiaBody", fontWeight: 600, fontSize: 32, color: S.white, marginTop: 4 }}>{address}</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
