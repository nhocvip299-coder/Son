/**
 * Khoi hinh cua cac preset CapCut (the, khung, vien thuoc, elip, duong cong).
 * Trong file goc chung la clip ghep + mask/nen mau (khong co trong du lieu chu) -> do tren anh bia [XM vi tri/mau],
 * chuyen dong vao [UD]. Toa do = khung 1080x1920 o che do "cover".
 */
import React from "react";
import { Easing, interpolate } from "remotion";
import { evolvePath } from "@remotion/paths";
import { useFrame30 } from "../../../lib/theme";

type Shape =
  | { kind: "rect"; x0: number; x1: number; y0: number; y1: number; fill: string; radius?: number; border?: string; glow?: string; delay?: number; from?: "left" | "center" }
  | { kind: "dots"; pts: Array<[number, number]>; r: number; color: string; delay?: number }
  | { kind: "ellipse"; x0: number; x1: number; y0: number; y1: number; stroke: string; width?: number; delay?: number }
  | { kind: "curve"; d: string; stroke: string; width?: number; delay?: number }
  | { kind: "phone"; cx: number; cy: number; r: number; delay?: number };

export const CC_SHAPES: Record<string, Shape[]> = {
  "Kobe Text 02": [
    { kind: "rect", x0: 80, x1: 1000, y0: 884, y1: 1030, fill: "linear-gradient(180deg,#3DB8FF,#1E88FF)", radius: 4, glow: "#1E9BFF", from: "center" },
    { kind: "dots", pts: [[1000, 868], [84, 1050]], r: 10, color: "#3DE0FF", delay: 6 },
  ],
  "Kobe Text 26": [
    { kind: "rect", x0: 120, x1: 956, y0: 1026, y1: 1254, fill: "rgba(222,206,206,0.85)", radius: 120, delay: 8 },
    { kind: "phone", cx: 230, cy: 1140, r: 74, delay: 12 },
  ],
  "Kobe Text 27": [
    { kind: "rect", x0: 76, x1: 88, y0: 764, y1: 1150, fill: "#1E9BFF", glow: "#1E9BFF" },
    { kind: "rect", x0: 536, x1: 1010, y0: 770, y1: 950, fill: "#1E9BFF", radius: 22, glow: "#1E9BFF", delay: 4 },
  ],
  "Kobe Text 30": [{ kind: "ellipse", x0: 730, x1: 1000, y0: 1050, y1: 1140, stroke: "#A8142A", width: 4, delay: 14 }],
  "Kobe Text 32": [{ kind: "rect", x0: 70, x1: 666, y0: 896, y1: 1036, fill: "#E8535F", radius: 4, delay: 4 }],
  "Kobe Text 33": [{ kind: "rect", x0: 80, x1: 1000, y0: 750, y1: 1040, fill: "linear-gradient(180deg,#F3D79A,#E8C276)", radius: 26, glow: "#F3D79A88", from: "center" }],
  "Kobe Text 34": [{ kind: "rect", x0: 76, x1: 1010, y0: 960, y1: 1190, fill: "#0A0A0A", border: "4px solid #4A4A4A", radius: 40, delay: 6 }],
  "Kobe Text 35": [{ kind: "ellipse", x0: 80, x1: 586, y0: 950, y1: 1184, stroke: "#5FD13A", width: 4, delay: 12 }],
  "Kobe Text 38": [{ kind: "curve", d: "M 70 1216 Q 480 1010 1010 1044", stroke: "#B05CFF", width: 4, delay: 14 }],
  "Kobe Text 40": [{ kind: "curve", d: "M 76 1150 Q 420 1020 1000 1040", stroke: "#5FE03A", width: 4, delay: 12 }],
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const eo = Easing.bezier(0.16, 1, 0.3, 1);

export const ShapeLayer: React.FC<{ shapes: Shape[] }> = ({ shapes }) => {
  const f = useFrame30();
  return (
    <>
      {shapes.map((s, i) => {
        const p = interpolate(f - (s.delay ?? 0), [0, 10], [0, 1], { ...clamp, easing: eo });
        if (s.kind === "rect")
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: s.x0,
                top: s.y0,
                width: s.x1 - s.x0,
                height: s.y1 - s.y0,
                background: s.fill,
                border: s.border,
                borderRadius: s.radius ?? 0,
                boxShadow: s.glow ? `0 0 24px ${s.glow}` : undefined,
                transformOrigin: s.from === "left" ? "left center" : "center",
                scale: `${p} 1`,
                opacity: p > 0 ? 1 : 0,
              }}
            />
          );
        if (s.kind === "dots")
          return s.pts.map(([x, y], k) => (
            <div key={`${i}-${k}`} style={{ position: "absolute", left: x - s.r, top: y - s.r, width: s.r * 2, height: s.r * 2, borderRadius: s.r, background: s.color, boxShadow: `0 0 12px ${s.color}`, scale: p }} />
          ));
        if (s.kind === "phone")
          return (
            <div key={i} style={{ position: "absolute", left: s.cx - s.r, top: s.cy - s.r, width: s.r * 2, height: s.r * 2, borderRadius: s.r, background: "#3CC23C", display: "flex", alignItems: "center", justifyContent: "center", scale: p, rotate: `${Math.sin(f * 0.9) * 8 * p}deg` }}>
              <svg width={s.r * 1.1} height={s.r * 1.1} viewBox="0 0 24 24">
                <path fill="#fff" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
              </svg>
            </div>
          );
        const d =
          s.kind === "ellipse"
            ? (() => {
                const cx = (s.x0 + s.x1) / 2, cy = (s.y0 + s.y1) / 2, rx = (s.x1 - s.x0) / 2, ry = (s.y1 - s.y0) / 2;
                const k = 0.5523; // elip bang 4 doan bezier (evolvePath can duong bezier)
                return `M ${cx + rx} ${cy} C ${cx + rx} ${cy + ry * k} ${cx + rx * k} ${cy + ry} ${cx} ${cy + ry} C ${cx - rx * k} ${cy + ry} ${cx - rx} ${cy + ry * k} ${cx - rx} ${cy} C ${cx - rx} ${cy - ry * k} ${cx - rx * k} ${cy - ry} ${cx} ${cy - ry} C ${cx + rx * k} ${cy - ry} ${cx + rx} ${cy - ry * k} ${cx + rx} ${cy}`;
              })()
            : s.d;
        const ev = evolvePath(interpolate(f - (s.delay ?? 0), [0, 14], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }), d);
        return (
          <svg key={i} width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <path d={d} fill="none" stroke={s.stroke} strokeWidth={s.width ?? 4} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} style={{ filter: `drop-shadow(0 0 6px ${s.stroke})` }} />
          </svg>
        );
      })}
    </>
  );
};
