/**
 * bds-luxury — TRAM HINH + CHUYEN CANH tao tu CHINH footage nguoi dung (khi khong co b-roll):
 *  Letterbox   (ref09)  : 2 thanh den dien anh truot vao/ra.
 *  WhiteFlash  (ref07)  : nhay trang mem chuyen doan.
 *  WhipBlur    (ref08)  : lia may nhoe chuyen dong (chuyen style / chuyen y).
 *  FreezeScan  (moi)    : DONG BANG khung toa nha + vach quet tung tang (T1..T4, TUM) -> "4 tang + 1 tum" bang hinh that.
 *  PhotoCard   (ref08)  : anh tinh bo goc bat len canh nhan vat + nhan bac ha.
 *  RoadText    (ref08 "3KM" bam canh): so khoang cach "son" nam tren mat duong (phoi canh 3D), nguoi dung TRUOC chu.
 */
import React from "react";
import { AbsoluteFill, Easing, Freeze, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const outCubic = Easing.bezier(0.33, 1, 0.68, 1);
const outBack = Easing.bezier(0.34, 1.4, 0.64, 1);
const inCubic = Easing.bezier(0.55, 0, 0.75, 0.2);

/** Thanh den tren/duoi (ti le cao moi thanh), truot vao luc `at`, ra luc `end`. */
export const Letterbox: React.FC<{ at: number; end: number; bar?: number; scrim?: number }> = ({ at, end, bar = 0.17, scrim = 0.55 }) => {
  const f = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = f / fps;
  const p = interpolate(t, [at, at + 0.6, end, end + 0.35], [0, 1, 1, 0], { ...C, easing: outCubic });
  if (p <= 0) return null;
  const h = bar * height * p;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* man toi mem duoi thanh tren -> chu serif trang doc ro tren tuong sang */}
      <div style={{ position: "absolute", left: 0, right: 0, top: h - 2, height: height * 0.36, background: `linear-gradient(180deg, rgba(0,0,0,${scrim}) 0%, rgba(0,0,0,${scrim * 0.6}) 45%, rgba(0,0,0,0) 100%)`, opacity: p }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h, background: "#000" }} />
    </AbsoluteFill>
  );
};

/** Nhay trang: len nhanh 0.12s, giu, tan 0.35s (ref07 0.8-2.0s). */
export const WhiteFlash: React.FC<{ at: number; dur?: number }> = ({ at, dur = 0.5 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const o = interpolate(t, [at - 0.12, at, at + 0.05, at + dur], [0, 0.95, 0.95, 0], C);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #fffdf7 0%, #fff6e0 55%, #ffeec8 100%)", opacity: o }} />;
};

/** Lia may nhoe: dich + nhoe chuyen dong ca khung hinh (boc children) quanh moc `at`. */
export const WhipBlur: React.FC<{ at: number; children: React.ReactNode; dir?: 1 | -1 }> = ({ at, children, dir = 1 }) => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = f / fps;
  const a = interpolate(t, [at - 0.16, at], [0, 1], { ...C, easing: inCubic });
  const b = interpolate(t, [at, at + 0.2], [1, 0], { ...C, easing: outCubic });
  const k = t < at ? a : b;
  const sign = t < at ? -dir : dir;
  if (k <= 0.001) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${sign * k * width * 0.18}px) scale(${1 + k * 0.08})`, filter: `blur(${k * 26}px)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export type FloorMark = { label: string; y: number }; // y = ti le H tren khung dong bang
/**
 * DONG BANG khung `srcFrameSec` cua video tu `at` -> `end`, day nhe vao (Ken Burns),
 * vach quet bac ha ve tu duoi len theo tung san tang, chip nhan o mep phai.
 */
export const FreezeScan: React.FC<{ src: string; srcFrameSec: number; at: number; end: number; marks: FloorMark[]; markAt: number; step?: number; x0?: number; x1?: number }> = ({
  src, srcFrameSec, at, end, marks, markAt, step = 0.2, x0 = 0.05, x1 = 0.8,
}) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = f / fps;
  if (t < at || t > end + 0.25) return null;
  const push = interpolate(t, [at, end], [1, 1.05], C);
  const fade = interpolate(t, [end, end + 0.25], [1, 0], C);
  const flash = interpolate(t, [at, at + 0.04, at + 0.22], [0, 0.85, 0], C);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 60%" }}>
        <Freeze frame={Math.round(srcFrameSec * fps)}>
          <OffthreadVideo src={staticFile(src)} muted />
        </Freeze>
        {/* toi nhe de vach sang noi bat */}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,20,18,0.05), rgba(0,20,18,0.28))" }} />
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="fs-line" gradientUnits="userSpaceOnUse" x1={x0 * width} y1="0" x2={x1 * width} y2="0">
              <stop offset="0" stopColor="#45f2d2" stopOpacity="0" />
              <stop offset="0.25" stopColor="#45f2d2" stopOpacity="0.95" />
              <stop offset="1" stopColor="#c9fff3" stopOpacity="1" />
            </linearGradient>
            <filter id="fs-glow" filterUnits="userSpaceOnUse" x={0} y={0} width={width} height={height}><feGaussianBlur stdDeviation="5" /></filter>
          </defs>
          {marks.map((m, i) => {
            const t0 = markAt + i * step;
            const p = interpolate(t, [t0, t0 + 0.28], [0, 1], { ...C, easing: outCubic });
            if (p <= 0) return null;
            const yy = m.y * height;
            const xa = x0 * width, xb = xa + (x1 * width - xa) * p;
            const chip = interpolate(t, [t0 + 0.12, t0 + 0.32], [0, 1], { ...C, easing: outBack });
            const last = i === marks.length - 1;
            return (
              <g key={i}>
                <line x1={xa} y1={yy} x2={xb} y2={yy} stroke="#45f2d2" strokeWidth={9} filter="url(#fs-glow)" opacity={0.7} />
                <line x1={xa} y1={yy} x2={xb} y2={yy} stroke="url(#fs-line)" strokeWidth={4} />
                <circle cx={xb} cy={yy} r={9} fill="#e9fffa" />
                <g transform={`translate(${x1 * width + 22} ${yy}) scale(${chip})`} opacity={Math.min(1, chip)}>
                  <rect x={0} y={-30} width={last ? 136 : 150} height={60} rx={30} fill={last ? "#45f2d2" : "rgba(0,28,24,0.72)"} stroke="#45f2d2" strokeWidth={2.5} />
                  <text x={last ? 68 : 75} y={2} textAnchor="middle" dominantBaseline="central" fill={last ? "#00241d" : "#c9fff3"} style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 36, letterSpacing: "0.04em" }}>{m.label}</text>
                </g>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

/** Anh tinh bo goc bat len (pop + nghieng nhe) voi nhan bac ha phia tren (ref08 "Serenity Sky Villas (2015)"). */
export const PhotoCard: React.FC<{ img: string; label?: string; at: number; end: number; x: number; y: number; w: number; h: number; rot?: number; crop?: string }> = ({
  img, label, at, end, x, y, w, h, rot = -3, crop = "50% 50%",
}) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = f / fps;
  if (t < at || t > end + 0.4) return null;
  const p = interpolate(t, [at, at + 0.42], [0, 1], { ...C, easing: outBack });
  const o = interpolate(t, [at, at + 0.15, end, end + 0.35], [0, 1, 1, 0], C);
  const r = interpolate(t, [end, end + 0.35], [0, 1], { ...C, easing: inCubic });
  const lab = interpolate(t, [at + 0.3, at + 0.6], [0, 1], { ...C, easing: outCubic });
  const W = w * width, Hh = h * height;
  return (
    <div
      style={{
        position: "absolute",
        left: x * width - W / 2,
        top: y * height - Hh / 2,
        width: W,
        height: Hh,
        opacity: o,
        transform: `translateY(${(1 - p) * 60 - r * 40}px) scale(${0.72 + 0.28 * p + r * 0.15}) rotate(${rot * p}deg)`,
        filter: r > 0.01 ? `blur(${r * 14}px)` : undefined,
      }}
    >
      <div style={{ position: "absolute", inset: 0, borderRadius: 34, overflow: "hidden", boxShadow: "0 22px 50px rgba(0,0,0,0.55), 0 0 0 4px rgba(255,255,255,0.9)" }}>
        <Img src={staticFile(img)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: crop, transform: `scale(${1.12 - 0.08 * p})` }} />
      </div>
      {label ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -18,
            textAlign: "center",
            fontFamily: "Oswald",
            fontWeight: 700,
            fontSize: 60,
            color: "#45f2d2",
            textShadow: "0 3px 10px rgba(0,30,25,0.85), 0 0 18px rgba(56,243,211,0.55)",
            opacity: lab,
            transform: `translateY(${(1 - lab) * 24}px)`,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/**
 * So khoang cach "son" tren mat duong — phoi canh 3D (rotateX), hien bang vet quet tu gan ra xa,
 * so chay 0 -> gia tri. Dat DUOI lop nguoi (QtPersonFront) de nguoi dung truoc chu.
 */
export const RoadText: React.FC<{ value: number; unit: string; at: number; end: number; y?: number; size?: number; drift?: number }> = ({ value, unit, at, end, y = 0.9, size = 300, drift = 0 }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = f / fps;
  if (t < at || t > end + 0.4) return null;
  const wipe = interpolate(t, [at, at + 0.45], [0, 1], { ...C, easing: outCubic });
  const n = Math.round(value * interpolate(t, [at, at + 0.6], [0, 1], { ...C, easing: outCubic }));
  const o = interpolate(t, [end, end + 0.4], [1, 0], C);
  const slide = interpolate(t, [end, end + 0.4], [0, 1], { ...C, easing: inCubic });
  const dy = drift * (t - at); // camera lui -> mat duong troi len
  return (
    <AbsoluteFill style={{ perspective: 900, perspectiveOrigin: "50% 42%" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y * height - size - dy + slide * 120,
          textAlign: "center",
          transform: "perspective(700px) rotateX(60deg)",
          transformOrigin: "50% 100%",
          opacity: o * 0.93,
          WebkitMaskImage: `linear-gradient(0deg, #000 ${wipe * 100}%, transparent ${wipe * 100 + 12}%)`,
          maskImage: `linear-gradient(0deg, #000 ${wipe * 100}%, transparent ${wipe * 100 + 12}%)`,
        }}
      >
        <span
          style={{
            fontFamily: "Oswald",
            fontWeight: 700,
            fontSize: size,
            lineHeight: 1,
            letterSpacing: "0.02em",
            color: "#f4fffc",
            // son duong: hoi trong, vien sang bac ha mem
            textShadow: "0 0 18px rgba(56,243,211,0.75), 0 0 2px rgba(0,0,0,0.4)",
            mixBlendMode: "screen",
          }}
        >
          {n}
          <span style={{ fontSize: size * 0.62, color: "#45f2d2" }}>{unit}</span>
        </span>
      </div>
      <div style={{ position: "absolute", width }} />
    </AbsoluteFill>
  );
};
