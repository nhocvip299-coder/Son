/**
 * Anh san pham 4:5 (1080x1350) cho bai dang Facebook/Instagram/carousel — cung bo nhan dien voi video
 * (Phudu chu nhan, Kasepi chu thuong co vien, the vang phat sang, chu do loi sang, so trang 1/3).
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { fit, redText, whiteText, yellowText } from "./components";
import { RT } from "./tokens";

export type PosterProps = {
  photo: string;
  /** dich anh (object-position), vd "50% 40%" */
  focus?: string;
  kicker: string; // dong vang nho tren cung
  title: string; // chu do lon
  bullets?: string[]; // the vang
  note?: string; // dong trang nho duoi the
  cta?: string; // nut cuoi
  page?: string; // "1/3"
  brand?: string;
};

const W = 1080;
const H = 1350;

export const RefPoster: React.FC<PosterProps> = ({ photo, focus = "50% 45%", kicker, title, bullets = [], note, cta, page, brand = "Em Sơn · BĐS" }) => (
  <AbsoluteFill style={{ backgroundColor: "#0b0f15" }}>
    <Img src={staticFile(photo)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: focus }} />
    {/* toi tren + duoi de chu noi, giua giu anh san pham sang */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,8,14,0.82) 0%, rgba(5,8,14,0.45) 22%, rgba(5,8,14,0) 38%, rgba(5,8,14,0) 52%, rgba(5,8,14,0.6) 66%, rgba(5,8,14,0.9) 100%)" }} />
    {/* tren */}
    <div style={{ position: "absolute", top: 64, left: 0, right: 0, textAlign: "center", padding: "0 50px" }}>
      <div style={{ ...yellowText(fit(kicker, 62, 0.55, 960)), whiteSpace: "nowrap" }}>{kicker.toUpperCase()}</div>
      <div style={{ ...redText(fit(title, 118, 0.48, 980), RT.font.punch), marginTop: 10, whiteSpace: "nowrap" }}>{title.toUpperCase()}</div>
    </div>
    {/* duoi */}
    <div style={{ position: "absolute", left: 60, right: 60, bottom: cta ? 150 : 90, display: "flex", flexDirection: "column", gap: 18 }}>
      {bullets.map((b, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "16px 26px",
            borderRadius: 22,
            border: `4px solid ${RT.color.cardBorder}`,
            background: "rgba(226,214,66,0.62)",
            boxShadow: "0 0 14px rgba(250,229,57,0.85), 0 0 34px rgba(250,229,57,0.35)",
          }}
        >
          <div style={{ width: 46, height: 46, flex: "0 0 46px", borderRadius: "50%", background: "#2BC46B", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: RT.font.punch, fontWeight: 900, fontSize: 30, boxShadow: "0 0 12px rgba(43,196,107,0.8)" }}>✓</div>
          <span style={{ ...whiteText(fit(b, 50, 0.5, 820)), textShadow: "0 3px 7px rgba(0,0,0,0.7)" }}>{b}</span>
        </div>
      ))}
      {note ? <div style={{ ...whiteText(fit(note, 44, 0.5, 940)), textAlign: "center", marginTop: 6 }}>{note}</div> : null}
    </div>
    {cta ? (
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 52, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "14px 44px", borderRadius: 40, background: "linear-gradient(180deg, #FF5A44, #D81A08)", boxShadow: "0 0 22px rgba(246,42,21,0.8)", ...whiteText(46), fontFamily: RT.font.punch, fontWeight: 800, WebkitTextStroke: "0px transparent" }}>
          {cta.toUpperCase()}
        </div>
      </div>
    ) : null}
    {/* nhan hieu + so trang */}
    <div style={{ position: "absolute", left: 36, top: H - 46, ...whiteText(30), WebkitTextStroke: "0px transparent", opacity: 0.85 }}>{brand}</div>
    {page ? <div style={{ position: "absolute", right: 36, top: H - 46, ...whiteText(30), WebkitTextStroke: "0px transparent", opacity: 0.85 }}>{page}</div> : null}
  </AbsoluteFill>
);

export const POSTER_SIZE = { width: W, height: H };
