/**
 * Chuyen dong chu v3 — DO TUNG KHUNG tren video mau (analysis/motion/z_*.jpg), thay cho blur-rise "lo lung" v1/v2.
 *  - VAO rat nhanh 3–5 khung (0.10–0.17s):
 *      "slide"  : lao ngang tu PHAI sang, vet nhoe chuyen dong ngang dai (ref01 "SỰ THẬT LÀ" 0.70→0.77s)
 *      "chroma" : tach mau RGB + nhoe doc, hoi tu thanh chu ro (ref01 "HÀ NỘI" 1.70→1.87s)
 *      "swing"  : xoay 3D lao vao tu TRAI + nhoe (ref01 "HỒ HOÀN KIẾM" 9.45→9.60s)
 *      "pop"    : bat ra 2–3 khung (chu khong lo "ĐỂ", ky tu bay rap)
 *      "fade"   : dong dan nho nghieng, hien 2–3 khung
 *  - DUNG YEN khi da hien (hoac BAM THEO CAMERA: QtTrack), KHONG troi.
 *  - THOAT gon 2 khung (hoac theo nhat cat canh).
 * Timing tinh bang khung @30 (frame*30/fps) -> dung o 30 va 60 fps.
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { QT } from "./components";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// v4 "mem mai": giam toc duoi dai (easeOutQuint), nhoe giam theo binh phuong -> duoi ro net, khong giat
const expoOut = Easing.bezier(0.22, 1, 0.36, 1);
export type EnterKind = "slide" | "chroma" | "swing" | "pop" | "fade";

/** f30 = so khung @30fps ke tu dau Sequence. */
const useF30 = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (f * 30) / fps;
};

const ENTER_FRAMES: Record<EnterKind, number> = { slide: 8, chroma: 8, swing: 9, pop: 6, fade: 6 };
const EXIT_FRAMES = 6;

/**
 * 1 manh chu co hieu ung vao/ra do tu mau.
 * at/end: GIAY (tuong doi Sequence). dir: 1 = vao tu phai (slide) / trai (swing).
 */
export const QtKPiece: React.FC<{
  text: string;
  at: number;
  end: number;
  kind: EnterKind;
  style: React.CSSProperties;
  id: string;
}> = ({ text, at, end, kind, style, id }) => {
  const f30 = useF30();
  const { width } = useVideoConfig();
  const a = at * 30;
  const n = ENTER_FRAMES[kind];
  const p = interpolate(f30, [a, a + n], [0, 1], { ...clamp, easing: expoOut });
  // thoat mem 6 khung: mo + nhoe + truot nhe sang trai
  const out = interpolate(f30, [end * 30 - EXIT_FRAMES, end * 30], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  if (f30 < a || out <= 0) return <span style={{ ...style, opacity: 0, display: "inline-block", whiteSpace: "pre" }}>{text}</span>;
  const base: React.CSSProperties = {
    ...style,
    display: "inline-block",
    whiteSpace: "pre",
    opacity: out,
    filter: out < 1 ? `blur(${(1 - out) * 8}px)` : undefined,
    translate: out < 1 ? `${-(1 - out) * 24}px 0` : undefined,
  };
  const q = 1 - p; // con lai
  if (kind === "fade")
    return <span style={{ ...base, opacity: Math.min(1, p * 1.6) * out, translate: `${q * 18 - (1 - out) * 24}px 0`, filter: `blur(${q * q * 6 + (1 - out) * 8}px)` }}>{text}</span>;
  if (kind === "pop")
    return <span style={{ ...base, opacity: Math.min(1, p * 2) * out, scale: `${1 + q * q * 0.25}`, filter: `blur(${q * q * 10 + (1 - out) * 8}px)` }}>{text}</span>;
  if (kind === "slide") {
    // vi tri: lao tu +0.45W ve 0; vet nhoe: SVG blur ngang ti le toc do
    const x = q * width * 0.45;
    const speed = q * q * 70; // nhoe theo binh phuong -> duoi ro net
    return (
      <span style={{ ...base, position: "relative" }}>
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={`mb-${id}`} x="-60%" y="-10%" width="220%" height="120%">
            <feGaussianBlur stdDeviation={`${speed} 0`} />
          </filter>
        </svg>
        <span style={{ display: "inline-block", translate: `${x}px 0`, filter: speed > 0.5 ? `url(#mb-${id})` : undefined, opacity: Math.min(1, p * 2.2) }}>{text}</span>
      </span>
    );
  }
  if (kind === "chroma") {
    // 3 ban sao R/G/B lech doc + nhoe doc, hoi tu; khung cuoi ve mau that
    const off = q * q * 26;
    const vb = q * q * 16;
    const ch = (c: string, dx: number, dy: number) => (
      <span style={{ position: "absolute", left: 0, top: 0, color: c, mixBlendMode: "screen", translate: `${dx}px ${dy}px`, filter: `url(#vb-${id})`, opacity: 0.9 }}>{text}</span>
    );
    return p >= 0.97 ? (
      <span style={base}>{text}</span>
    ) : (
      <span style={{ ...base, position: "relative", color: "transparent", textShadow: "none" }}>
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={`vb-${id}`} x="-10%" y="-60%" width="120%" height="220%">
            <feGaussianBlur stdDeviation={`1 ${vb}`} />
          </filter>
        </svg>
        {text}
        {ch("#ff2a2a", -off * 0.6, -off)}
        {ch("#2aff6a", 0, 0)}
        {ch("#2a6aff", off * 0.6, off)}
      </span>
    );
  }
  // swing: xoay quanh truc doc tu 75deg ve 0, tu ben trai, nhoe ngang
  const rot = q * 70;
  const x = -q * width * 0.25;
  const speed = q * q * 45;
  return (
    <span style={{ ...base, position: "relative", perspective: 900 }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={`sw-${id}`} x="-60%" y="-10%" width="220%" height="120%">
          <feGaussianBlur stdDeviation={`${speed} 2`} />
        </filter>
      </svg>
      <span style={{ display: "inline-block", transform: `translateX(${x}px) rotateY(${rot}deg)`, transformOrigin: "left center", filter: speed > 0.5 ? `url(#sw-${id})` : undefined }}>{text}</span>
    </span>
  );
};

/** Khoi chu chay theo loi noi v3: cac dong, moi manh co kieu vao rieng; tat ca tat gon 2 khung o `end`. */
export type QtKLine = { align?: "left" | "right" | "center"; pieces: Array<{ text: string; kind: "lead" | "main"; t: number; enter?: EnterKind }> };
export const QtKRun: React.FC<{ lines: QtKLine[]; y: number; x0?: number; x1?: number; size?: number; duration: number; id: string }> = ({
  lines,
  y,
  x0 = 0.1,
  x1 = 0.1,
  size = 110,
  duration,
  id,
}) => {
  const { width, height } = useVideoConfig();
  const avail = width * (1 - x0 - x1);
  // mac dinh nhu mau: dong main dau = slide, main giua = chroma, main dong cuoi can phai = swing
  let mainIdx = 0;
  const totalMain = lines.reduce((a, l) => a + l.pieces.filter((p) => p.kind === "main").length, 0);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: width * x0, width: avail, top: y * height }}>
        {lines.map((ln, i) => {
          const est = ln.pieces.reduce((a, p) => a + (p.kind === "main" ? p.text.length * 0.7 : p.text.length * 0.46 * 0.56 + 0.2), 0);
          const sz = Math.min(size, avail / Math.max(1, est));
          return (
            <div key={i} style={{ textAlign: ln.align ?? "left", fontSize: sz, lineHeight: 1.22, marginTop: i ? -sz * 0.08 : 0, whiteSpace: "nowrap" }}>
              {ln.pieces.map((p, k) => {
                const lead = p.kind === "lead";
                let enter: EnterKind = p.enter ?? "fade";
                if (!lead && !p.enter) {
                  enter = mainIdx === 0 ? "slide" : mainIdx === totalMain - 1 && ln.align === "right" ? "swing" : "chroma";
                }
                if (!lead) mainIdx++;
                return (
                  <QtKPiece
                    key={k}
                    id={`${id}-${i}-${k}`}
                    text={p.text}
                    at={p.t}
                    end={duration}
                    kind={enter}
                    style={{
                      fontFamily: QT.font,
                      fontStyle: lead ? "italic" : "normal",
                      fontWeight: lead ? 600 : 800,
                      fontSize: lead ? sz * 0.46 : sz,
                      color: lead ? QT.white : QT.cream,
                      textShadow: lead ? "0 1px 3px rgba(0,0,0,0.85), 0 0 12px rgba(0,0,0,0.4)" : "0 3px 10px rgba(0,0,0,0.5), 0 0 26px rgba(0,0,0,0.3)",
                      margin: lead ? "0 0.25em" : 0,
                      lineHeight: 1.0,
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Chu BAM THEO CAMERA (ref02 "ĐỂ": chu lech qua lai cung khung canh). camera.json tu scripts/style/camera_track.py.
 * Lay do lech CUC BO tu luc chu xuat hien (src giay `srcAt`), gioi han ±maxPx de chu khong troi xa.
 */
export const QtTrack: React.FC<{ track: { fps: number; dx: number[]; dy: number[] }; srcAt: number; maxPx?: number; children: React.ReactNode }> = ({
  track,
  srcAt,
  maxPx = 60,
  children,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i0 = Math.round(srcAt * track.fps);
  const i1 = Math.min(track.dx.length - 1, Math.round((srcAt + f / fps) * track.fps));
  const c = (v: number) => Math.max(-maxPx, Math.min(maxPx, v));
  const dx = c((track.dx[i1] ?? 0) - (track.dx[i0] ?? 0));
  const dy = c((track.dy[i1] ?? 0) - (track.dy[i0] ?? 0));
  return <AbsoluteFill style={{ translate: `${dx}px ${dy}px` }}>{children}</AbsoluteFill>;
};

/** Vet anh kim chay qua ruot chu (ref01 "HOÀNG MAI": anh vang di chuyen ben trong chu). Dat CHONG len chu, clip theo chu cha. */
export const sheenBackground = (f30: number) => {
  const pos = ((f30 * 2.2) % 260) - 80;
  return `linear-gradient(105deg, rgba(255,255,255,0) ${pos - 30}%, rgba(255,214,120,0.95) ${pos - 8}%, rgba(255,250,230,1) ${pos}%, rgba(196,140,40,0.95) ${pos + 10}%, rgba(255,255,255,0) ${pos + 32}%)`;
};

export const useTrackFile = () => staticFile("inputs/sanho-matte/camera.json");
