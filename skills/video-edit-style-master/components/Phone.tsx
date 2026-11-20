import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { VESM } from "../presets/style";
import { backOut, CL, useLocal, useTextTheme } from "./core";

/**
 * VIÊN SỐ ĐIỆN THOẠI vàng: bật ra giữa khung, GÕ từng chữ số (~0,08 s/số), sau `dockAt` thu nhỏ + trượt xuống đáy
 * vùng an toàn và GIỮ tới hết video. [XM 59,6–83 s]
 */
export const PhonePill: React.FC<{ phone: string; y?: number; dockAt?: number; dockY?: number }> = ({ phone, y = 0.47, dockAt = 2.4, dockY = 0.715 }) => {
  const { t, width, height } = useLocal();
  const G = useTextTheme() === "aqua" ? "#16fff4" : VESM.color.gold;
  const a = interpolate(t, [0, 0.3], [0, 1], { ...CL, easing: backOut });
  const n = Math.floor(interpolate(t, [0.25, 0.25 + phone.length * 0.08], [0, phone.length], CL));
  const d = interpolate(t, [dockAt, dockAt + 0.45], [0, 1], { ...CL, easing: backOut });
  const yy = (y + (dockY - y) * d) * height, sc = (0.6 + 0.4 * a) * (1 - 0.32 * d);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: width / 2, top: yy, transform: `translate(-50%,-50%) scale(${sc})`, opacity: Math.min(1, a * 1.5), width: "max-content",
        display: "flex", alignItems: "center", gap: 14, padding: "12px 40px 12px 16px", borderRadius: 60, background: "linear-gradient(180deg, rgba(0,10,40,0.92), rgba(0,0,28,0.92))",
        border: `4px solid ${G}`, boxShadow: `0 0 26px ${G}cc, 0 10px 30px rgba(0,0,0,0.6)` }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, border: `4px solid ${G}`, display: "grid", placeItems: "center" }}>
          <svg width={34} height={34} viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill={G} /></svg>
        </div>
        <div style={{ fontFamily: VESM.font.block, fontWeight: 800, fontSize: 92, color: G, letterSpacing: "0.02em", textShadow: `0 0 16px ${G}`, whiteSpace: "pre" }}>
          {phone.slice(0, n)}<span style={{ opacity: 0 }}>{phone.slice(n)}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
