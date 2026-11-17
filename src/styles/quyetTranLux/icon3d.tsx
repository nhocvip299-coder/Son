/**
 * Icon 3D (Fluent Emoji 3D — Microsoft, MIT; public/icons3d/) di cap voi chu kinh vang (v6, theo nguoi dung:
 * "truc quan bang icon 3D / anh minh hoa", KHONG dung so do ve phang).
 * Vao: bat len co nay (pop) / luot tu 2 ben / roi xuong; dung: lo lung nhe + bong do + quang sang; ra: thu nho + nhoe.
 */
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const back = Easing.bezier(0.34, 1.56, 0.64, 1);
const outQ = Easing.bezier(0.22, 1, 0.36, 1);

export type IconEnter = "pop" | "fromLeft" | "fromRight" | "drop";
export const QtIcon3D: React.FC<{
  name: string; // ten file trong public/icons3d (khong duoi)
  x: number; // tam (ti le W)
  y: number; // tam (ti le H)
  size?: number;
  at: number; // giay tuong doi
  end: number;
  enter?: IconEnter;
  tilt?: number; // goc nghieng nghi (do)
  glow?: string;
}> = ({ name, x, y, size = 260, at, end, enter = "pop", tilt = -6, glow = "rgba(255,210,122,0.55)" }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = f / fps;
  if (t < at || t > end + 0.35) return null;
  const pIn = interpolate(t, [at, at + 0.5], [0, 1], { ...C, easing: enter === "pop" || enter === "drop" ? back : outQ });
  const lin = interpolate(t, [at, at + 0.5], [0, 1], C);
  const pOut = interpolate(t, [end, end + 0.35], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  const q = 1 - pIn;
  let tx = 0, ty = 0, sc = 1, rot = tilt;
  if (enter === "pop") { sc = 0.3 + 0.7 * pIn; rot = tilt - q * 25; }
  if (enter === "fromLeft") { tx = -q * width * 0.45; rot = tilt - q * 30; }
  if (enter === "fromRight") { tx = q * width * 0.45; rot = tilt + q * 30; }
  if (enter === "drop") { ty = -q * 260; sc = 0.85 + 0.15 * pIn; }
  // lo lung (bob) + lac nhe trong khi dung
  const life = t - at;
  ty += Math.sin(life * 2.4) * 10 * Math.min(1, life / 0.6);
  rot += Math.sin(life * 1.7) * 3 * Math.min(1, life / 0.6);
  sc *= 1 - pOut * 0.5;
  const op = Math.min(1, lin * 3) * (1 - pOut);
  const blur = (1 - lin) ** 2 * 10 + pOut * 10;
  const cx = x * width + tx, cy = y * height + ty;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* quang sang mem phia sau */}
      <div style={{ position: "absolute", left: cx - size * 0.75, top: cy - size * 0.75, width: size * 1.5, height: size * 1.5, borderRadius: "50%", background: `radial-gradient(circle, ${glow} 0%, rgba(0,0,0,0) 65%)`, opacity: op * 0.9 }} />
      {/* bong do tren "mat dat" */}
      <div style={{ position: "absolute", left: cx - size * 0.32, top: y * height + size * 0.5, width: size * 0.64, height: size * 0.12, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 70%)", opacity: op * 0.8, transform: `scale(${1 - Math.sin(life * 2.4) * 0.06})` }} />
      <Img
        src={staticFile(`icons3d/${name}.webp`)}
        style={{
          position: "absolute",
          left: cx - size / 2,
          top: cy - size / 2,
          width: size,
          height: size,
          transform: `rotate(${rot}deg) scale(${sc})`,
          opacity: op,
          filter: `drop-shadow(0 18px 28px rgba(0,0,0,0.45))${blur > 0.3 ? ` blur(${blur}px)` : ""}`,
        }}
      />
    </AbsoluteFill>
  );
};
