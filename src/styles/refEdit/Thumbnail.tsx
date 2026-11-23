/** Anh bia (thumbnail) theo phong cach reference-video-edit-thinking: mat bieu cam + doi lap 2 con so + cau hoi. */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Place, fit, redText, whiteText, yellowText } from "./components";
import { RT } from "./tokens";

export type ThumbProps = { face: string; topLabel: string; topBig: string; bottomLabel: string; bottomBig: string; question: string; middle?: string };

/** Phudu ve "²" thap nhu chi so duoi -> tu ve so 2 nho nang len */
const Sup: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split("²");
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {p}
          {i < parts.length - 1 ? <span style={{ fontSize: "0.5em", verticalAlign: "0.9em" }}>2</span> : null}
        </React.Fragment>
      ))}
    </>
  );
};

export const RefThumbnail: React.FC<ThumbProps> = ({ face, topLabel, topBig, bottomLabel, bottomBig, question, middle = "VS" }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <AbsoluteFill style={{ scale: "1.18", transformOrigin: "50% 28%" }}>
      <Img src={staticFile(face)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 26%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 68%, rgba(0,0,0,0.85) 100%)" }} />
    {/* Tren: lua chon 1 (do = dat, dat do) */}
    <Place y={0.1}>
      <div style={{ ...yellowText(fit(topLabel, 96, 0.52, 960)), textAlign: "center" }}>{topLabel.toUpperCase()}</div>
    </Place>
    <Place y={0.175}>
      <div style={{ ...redText(fit(topBig, 150, 0.47, 980), RT.font.punch), textAlign: "center" }}>
        <Sup text={topBig.toUpperCase()} />
      </div>
    </Place>
    {/* VS */}
    {middle ? (
      <Place y={0.625}>
        <div style={{ ...yellowText(120), textAlign: "center" }}>{middle}</div>
      </Place>
    ) : null}
    {/* Duoi: lua chon 2 tren the vang */}
    <Place y={0.725}>
      <div
        style={{
          padding: "26px 60px 30px",
          borderRadius: 30,
          border: `6px solid ${RT.color.cardBorder}`,
          background: "rgba(226,214,66,0.72)",
          boxShadow: "0 0 20px rgba(250,229,57,0.95), 0 0 50px rgba(250,229,57,0.45)",
          textAlign: "center",
        }}
      >
        <div style={{ ...whiteText(fit(bottomLabel, 70, 0.5, 820)), textShadow: "0 3px 8px rgba(0,0,0,0.7)" }}>{bottomLabel}</div>
        <div style={{ ...whiteText(fit(bottomBig, 120, 0.6, 820)), fontFamily: RT.font.punch, fontWeight: 900, textShadow: "0 4px 10px rgba(0,0,0,0.7)" }}>
          <Sup text={bottomBig.toUpperCase()} />
        </div>
      </div>
    </Place>
    <Place y={0.855} style={{ rotate: "-4deg" }}>
      <div style={{ padding: "18px 46px", borderRadius: 30, border: "5px solid #fff", background: "rgba(20,20,26,0.55)", boxShadow: "0 0 18px rgba(255,255,255,0.6)" }}>
        <span style={whiteText(72)}>{question}</span>
      </div>
    </Place>
  </AbsoluteFill>
);
