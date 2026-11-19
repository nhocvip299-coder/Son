import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { QtGrade } from "../quyetTranLux/components";
import { StackText } from "./typo";

/** Thumbnail TikTok (anh bia) Happy Home Pho Hien: khung nguoi truoc nha mau + chu vang champagne.
 *  Vung an toan luoi profile TikTok (3:4 giua) ~ y 0.125-0.875 -> chu chinh nam trong do. Chu khong de len mat. */
const SRC = "inputs/du-an-moi/goc-1080.mp4";
export type ThumbProps = { t: number };

export const HappyHomeThumb: React.FC<ThumbProps> = ({ t }) => {
  const S = -10, E = 99; // chu da vao xong (dung yen)
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <QtGrade>
        <OffthreadVideo src={staticFile(SRC)} trimBefore={Math.round(t * 60)} muted style={{ width: "100%", height: "100%", filter: "brightness(0.95) saturate(1.1)" }} />
      </QtGrade>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 22%, rgba(0,0,0,0) 33%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.6) 68%, rgba(0,0,0,0.9) 100%)" }} />
      <StackText id="th-top" palette="gold" end={E} y={0.15} size={128} lines={[
        { text: "NHÀ PHỐ VINHOMES · HƯNG YÊN", role: "lead", at: S, size: 46 },
        { text: "HAPPY HOME", role: "main", at: S },
        { text: "PHỐ HIẾN", role: "main", at: S, size: 104 },
      ]} />
      <StackText id="th-bot" palette="gold" end={E} y={0.66} size={250} lines={[
        { text: "sở hữu nhà phố chỉ từ", role: "lead", at: S, size: 58 },
        { text: "3 TỶ", role: "main", at: S },
      ]} />
      <StackText id="th-spec" palette="white" end={E} y={0.83} size={70} lines={[
        { text: "40TR/M² · 303 CĂN", role: "main", at: S },
      ]} />
    </AbsoluteFill>
  );
};
