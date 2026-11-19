/**
 * bds-luxury — PHU DE theo tung style, doi kieu theo doan (zones):
 *  box    (ref08): chu trang thuong trong hop toi trong mo bo goc.
 *  plain  (ref07): chu trang nho, bong mem, khong hop.
 *  cinema (ref09): chu trang nga gian nhe, nam trong thanh den duoi.
 */
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { groupPhrases, type QtWord } from "../quyetTranLux/components";

export type CapKind = "box" | "plain" | "cinema";
export type CapZone = { from: number; to: number; kind: CapKind; y: number };
const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const LuxCaptions: React.FC<{ words: QtWord[]; zones: CapZone[]; maxWords?: number }> = ({ words, zones, maxWords = 6 }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const phrases = groupPhrases(words, maxWords);
  const i = phrases.findIndex((p, k) => ms >= p.startMs - 60 && ms < Math.min(p.endMs + 450, phrases[k + 1]?.startMs ?? Infinity));
  if (i < 0) return null;
  const p = phrases[i];
  const z = zones.find((zz) => p.startMs / 1000 >= zz.from - 0.05 && p.startMs / 1000 < zz.to);
  if (!z) return null;
  const end = Math.min(p.endMs + 450, phrases[i + 1]?.startMs ?? Infinity);
  const t = (ms - p.startMs + 60) / 1000;
  const d = (end - p.startMs + 60) / 1000;
  const o = interpolate(t, [0, 0.12, d - 0.1, d], [0, 1, 1, 0], C);
  const rise = interpolate(t, [0, 0.18], [10, 0], C);
  const common: React.CSSProperties = { position: "absolute", left: 0, width, top: z.y * height, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${rise}px)` };
  if (z.kind === "box")
    return (
      <div style={common}>
        <div style={{ maxWidth: width * 0.78, padding: "12px 26px", borderRadius: 18, background: "rgba(18,20,22,0.58)", backdropFilter: "blur(6px)", fontFamily: "Be Vietnam Pro", fontWeight: 700, fontSize: 42, lineHeight: 1.3, color: "#fff", textAlign: "center" }}>
          {p.text}
        </div>
      </div>
    );
  if (z.kind === "plain")
    return (
      <div style={common}>
        <div style={{ maxWidth: width * 0.82, fontFamily: "Be Vietnam Pro", fontWeight: 800, fontSize: 44, lineHeight: 1.3, color: "#fff", textAlign: "center", textShadow: "0 2px 6px rgba(0,0,0,0.75), 0 0 18px rgba(0,0,0,0.35)" }}>
          {p.text}
        </div>
      </div>
    );
  return (
    <div style={common}>
      <div style={{ maxWidth: width * 0.86, fontFamily: "Be Vietnam Pro", fontWeight: 600, fontSize: 38, lineHeight: 1.35, letterSpacing: "0.04em", color: "#ece6da", textAlign: "center" }}>{p.text}</div>
    </div>
  );
};
