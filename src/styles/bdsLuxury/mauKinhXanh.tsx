/**
 * HOC TU VIDEO MAU (Drive 1zgJkx…, luu reference/mau-drive-1, KHONG len Git) — "trang kinh xanh":
 *  KxPage     : nen = chinh video lam nhoe + phu xanh, vet sang roi + hat sang, vong tron mo   [XM khung 9.5s, 13.2s, 47s]
 *  KxPrice    : "Hom nay"(trang nho) / viet tay / gia cu gach / "giam con" / GIA MOI dem lui trong khung goc  [XM 9–14s]
 *  KxCard     : the kinh bo goc vien neon chua video, tieu de viet tay de len, chip tich hien dan             [XM 41–59s]
 *  KxPhone    : vien so dien thoai co dinh cuoi video                                                         [XM 59–83s]
 * Mau doi sang XANH DUONG + TRANG (tone nguoi dung chon). Dat trong <Sequence> (thoi gian cuc bo).
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, OffthreadVideo, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Glints, loopSweep } from "./sparkle";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out3 = Easing.bezier(0.33, 1, 0.68, 1);
const back = Easing.bezier(0.34, 1.6, 0.64, 1);
const BLUE = { a: "#f0f9ff", b: "#62b8ff", c: "#1d5ed4", glow: "#3fa0ff", neon: "#6fd3ff" };
const useT = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  return { t: f / fps, dur: durationInFrames / fps, width, height };
};

/** nen kinh xanh: video nhoe + phu xanh + vet sang roi + hat */
export const KxPage: React.FC<{ src: string; from: number; ring?: boolean }> = ({ src, from, ring = true }) => {
  const { t, dur, width, height } = useT();
  const { fps } = useVideoConfig();
  const o = Math.min(interpolate(t, [0, 0.25], [0, 1], C), interpolate(t, [dur - 0.3, dur], [1, 0], C));
  const streaks = Array.from({ length: 46 }, (_, i) => {
    const x = random(`kx-x${i}`) * width, len = 40 + random(`kx-l${i}`) * 160, sp = 60 + random(`kx-s${i}`) * 140;
    const y = ((random(`kx-y${i}`) * height + t * sp) % (height + len)) - len;
    const a = 0.15 + 0.5 * random(`kx-a${i}`);
    return <line key={i} x1={x} y1={y} x2={x} y2={y + len} stroke="#8fdcff" strokeWidth={1.6} opacity={a} strokeLinecap="round" />;
  });
  const dots = Array.from({ length: 40 }, (_, i) => {
    const per = 1 + random(`kd-p${i}`) * 1.5, u = ((t + random(`kd-f${i}`) * per) % per) / per;
    return <circle key={i} cx={random(`kd-x${i}`) * width} cy={random(`kd-y${i}`) * height} r={1.5 + random(`kd-r${i}`) * 2.5} fill="#bfe9ff" opacity={Math.sin(u * Math.PI) * 0.8} />;
  });
  const rr = 380 + t * 30;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ filter: "blur(26px) brightness(0.6) saturate(1.2)", transform: "scale(1.15)" }}>
        <OffthreadVideo src={staticFile(src)} trimBefore={Math.round(from * fps)} muted />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,22,52,0.78) 0%, rgba(6,48,92,0.62) 45%, rgba(3,18,44,0.85) 100%)" }} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {ring ? <circle cx={width / 2} cy={height * 0.36} r={rr} fill="none" stroke="#7fd0ff" strokeWidth={2} opacity={0.22} /> : null}
        {streaks}{dots}
      </svg>
    </AbsoluteFill>
  );
};

const N: React.FC<{ x: number; y: number; s: string; size: number; t: number; at: number; id: string; color?: "blue" | "white" }> = ({ x, y, s, size, t, at, id, color = "blue" }) => {
  const sw = loopSweep(t, at + 0.4, 1.6, 0.7);
  return (
    <g>
      <defs>
        <linearGradient id={`kn-${id}`} x1="0" y1="0" x2="0" y2="1">
          {color === "blue" ? (<><stop offset="0" stopColor={BLUE.a} /><stop offset="0.3" stopColor="#fff" /><stop offset="0.45" stopColor={BLUE.b} /><stop offset="0.8" stopColor={BLUE.c} /><stop offset="1" stopColor={BLUE.b} /></>) : (<><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#dbe9f7" /></>)}
        </linearGradient>
        <linearGradient id={`ks-${id}`} x1="0" y1="0" x2="1" y2="0.25">
          <stop offset={Math.max(0, sw - 0.1)} stopColor="#fff" stopOpacity={0} /><stop offset={Math.min(1, Math.max(0, sw))} stopColor="#fff" stopOpacity={sw > -0.5 ? 0.9 : 0} /><stop offset={Math.min(1, Math.max(0, sw + 0.1))} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <filter id={`kg-${id}`} x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation={size * 0.06} /></filter>
      </defs>
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={BLUE.glow} filter={`url(#kg-${id})`} opacity={0.9} style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: size }}>{s}</text>
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={`url(#kn-${id})`} stroke="#04163a" strokeWidth={size * 0.025} paintOrder="stroke" style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: size }}>{s}</text>
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={`url(#ks-${id})`} style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: size }}>{s}</text>
    </g>
  );
};

/** man chot gia: lead / viet tay / gia cu (gach) / "giam con" / gia moi DEM LUI trong khung goc */
export const KxPrice: React.FC<{ lead: string; script: string; oldP: string; strikeAt: number; mid: string; from: number; to: number; dec?: number; unit: string; newAt: number; chip?: [string, number]; note?: string; y?: number }> = ({
  lead, script, oldP, strikeAt, mid, from, to, dec = 1, unit, newAt, chip, note, y = 0.3,
}) => {
  const { t, dur, width, height } = useT();
  const cx = width / 2, Y = y * height;
  const ex = interpolate(t, [dur - 0.3, dur], [0, 1], C);
  const a1 = interpolate(t, [0.1, 0.4], [0, 1], { ...C, easing: out3 });
  const w2 = interpolate(t, [0.4, 1.1], [0, 1], { ...C, easing: out3 });
  const a3 = interpolate(t, [0.9, 1.2], [0, 1], { ...C, easing: back });
  const st = interpolate(t, [strikeAt, strikeAt + 0.3], [0, 1], C);
  const a4 = interpolate(t, [strikeAt + 0.2, strikeAt + 0.5], [0, 1], C);
  const p = interpolate(t, [newAt, newAt + 1.1], [0, 1], { ...C, easing: out3 });
  const pop = interpolate(t, [newAt, newAt + 0.3], [0, 1], { ...C, easing: back });
  const val = (from + (to - from) * p).toFixed(dec).replace(".", ",");
  const big = `${val} ${unit}`;
  const bw = big.length * 76, bh = 220, by = Y + 450;
  const br = (sx: number, sy: number) => <path d={`M ${sx * 40} 0 L 0 0 L 0 ${sy * 40}`} fill="none" stroke={BLUE.neon} strokeWidth={6} strokeLinecap="round" />;
  return (
    <AbsoluteFill style={{ opacity: 1 - ex }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs><clipPath id="kx-w"><rect x={0} y={Y - 30} width={width * w2} height={140} /></clipPath><filter id="kx-sd"><feGaussianBlur stdDeviation={4} /></filter></defs>
        <text x={cx} y={Y - 60} textAnchor="middle" dominantBaseline="central" fill="#fff" opacity={a1} style={{ fontFamily: "Be Vietnam Pro", fontWeight: 600, fontSize: 40 }}>{lead}</text>
        <g clipPath="url(#kx-w)"><text x={cx} y={Y + 30} textAnchor="middle" dominantBaseline="central" fill="#fff" style={{ fontFamily: "Great Vibes", fontSize: 92, filter: "drop-shadow(0 0 10px rgba(110,200,255,0.9)) drop-shadow(0 3px 3px rgba(0,0,0,0.7))" }}>{script}</text></g>
        <g opacity={a3 * (1 - 0.35 * st)} transform={`translate(${cx} ${Y + 160}) scale(${0.7 + 0.3 * a3}) translate(${-cx} ${-(Y + 160)})`}>
          <text x={cx} y={Y + 160} textAnchor="middle" dominantBaseline="central" fill="#fff" style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 110, filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.7))" }}>{oldP}</text>
          <line x1={cx - 230} y1={Y + 165} x2={cx - 230 + 460 * st} y2={Y + 165} stroke="#ff4d4d" strokeWidth={10} strokeLinecap="round" />
        </g>
        {chip ? (() => { const c = interpolate(t, [chip[1], chip[1] + 0.3], [0, 1], { ...C, easing: back }); return (
          <g opacity={c} transform={`translate(${cx + 300} ${Y + 90}) scale(${0.6 + 0.4 * c}) rotate(8)`}>
            <rect x={-130} y={-34} width={260} height={68} rx={34} fill="#1f6fe0" stroke="#bfe6ff" strokeWidth={3} />
            <text textAnchor="middle" dominantBaseline="central" fill="#fff" style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 30 }}>{chip[0]}</text>
          </g>); })() : null}
        <text x={cx} y={Y + 255} textAnchor="middle" dominantBaseline="central" fill="#fff" opacity={a4} style={{ fontFamily: "Be Vietnam Pro", fontWeight: 600, fontSize: 40 }}>{mid}</text>
        <g opacity={Math.min(1, pop * 1.5)} transform={`translate(${cx} ${by}) scale(${0.6 + 0.4 * pop}) translate(${-cx} ${-by})`}>
          <g transform={`translate(${cx - bw / 2 - 30} ${by - bh / 2})`}>{br(1, 1)}</g>
          <g transform={`translate(${cx + bw / 2 + 30} ${by - bh / 2})`}>{br(-1, 1)}</g>
          <g transform={`translate(${cx - bw / 2 - 30} ${by + bh / 2})`}>{br(1, -1)}</g>
          <g transform={`translate(${cx + bw / 2 + 30} ${by + bh / 2})`}>{br(-1, -1)}</g>
          <N x={cx} y={by} s={big} size={170} t={t} at={newAt} id="kp" />
          <Glints id="kpg" t={t} from={newAt + 0.3} x0={cx - bw / 2} x1={cx + bw / 2} y0={by - 70} y1={by + 60} size={170} color={BLUE.glow} />
        </g>
        {note ? <text x={cx} y={by + 175} textAnchor="middle" dominantBaseline="central" fill="#cfeaff" opacity={interpolate(t, [newAt + 0.8, newAt + 1.2], [0, 1], C)} style={{ fontFamily: "Great Vibes", fontSize: 64, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.8))" }}>{note}</text> : null}
      </svg>
    </AbsoluteFill>
  );
};

/** the kinh: video trong khung bo goc vien neon + tieu de viet tay de len + chip tich */
export const KxCard: React.FC<{ src: string; from: number; title: string; chips?: Array<[string, number]>; y?: number }> = ({ src, from, title, chips = [], y = 0.42 }) => {
  const { t, dur, width, height } = useT();
  const { fps } = useVideoConfig();
  const a = interpolate(t, [0, 0.4], [0, 1], { ...C, easing: back });
  const ex = interpolate(t, [dur - 0.3, dur], [0, 1], C);
  const W = 640, H = 900, X = (width - W) / 2, Y = y * height - H / 2;
  const tw = interpolate(t, [0.3, 1.0], [0, 1], { ...C, easing: out3 });
  return (
    <AbsoluteFill style={{ opacity: 1 - ex }}>
      <div style={{ position: "absolute", left: X, top: Y, width: W, height: H, borderRadius: 36, overflow: "hidden", border: "4px solid #8fdcff", boxShadow: "0 0 30px rgba(80,180,255,0.8), 0 0 70px rgba(40,140,255,0.45), 0 20px 50px rgba(0,0,0,0.6)", transform: `scale(${0.85 + 0.15 * a}) translateY(${(1 - a) * 60}px)`, opacity: Math.min(1, a * 1.4) }}>
        <OffthreadVideo src={staticFile(src)} trimBefore={Math.round(from * fps)} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.05 + t * 0.02})` }} />
      </div>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <clipPath id="kc-w"><rect x={X - 80} y={Y - 160} width={(W + 200) * tw} height={260} /></clipPath>
        <g clipPath="url(#kc-w)"><text x={X - 20} y={Y - 10} dominantBaseline="central" fill="#fff" transform={`rotate(-6 ${X} ${Y})`} style={{ fontFamily: "Great Vibes", fontSize: 120, filter: "drop-shadow(0 0 12px rgba(110,200,255,0.9)) drop-shadow(0 4px 4px rgba(0,0,0,0.8))" }}>{title}</text></g>
      </svg>
      {chips.map(([s, at], i) => {
        const c = interpolate(t, [at, at + 0.35], [0, 1], { ...C, easing: back });
        return (
          <div key={i} style={{ position: "absolute", left: X + 30, top: Y + H - 90 - (chips.length - 1 - i) * 82, opacity: Math.min(1, c * 1.5), transform: `translateX(${(1 - c) * -50}px) scale(${0.7 + 0.3 * c})`, transformOrigin: "left center", display: "flex", alignItems: "center", gap: 12, padding: "10px 24px 10px 12px", borderRadius: 34, background: "rgba(3,18,44,0.82)", border: "2px solid #8fdcff", boxShadow: "0 0 16px rgba(80,180,255,0.6)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: "#3fa0ff", display: "grid", placeItems: "center" }}>
              <svg width={24} height={24} viewBox="0 0 24 24"><path d="M5 12.5 L10 17 L19 7" stroke="#fff" strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ fontFamily: "Be Vietnam Pro", fontWeight: 800, fontSize: 36, color: "#fff", whiteSpace: "nowrap" }}>{s}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** vien so dien thoai (giu den het video) */
export const KxPhone: React.FC<{ phone: string; y?: number }> = ({ phone, y = 0.7 }) => {
  const { t, width, height } = useT();
  const a = interpolate(t, [0, 0.35], [0, 1], { ...C, easing: back });
  const sw = loopSweep(t, 0.5, 2.0, 0.8);
  return (
    <div style={{ position: "absolute", left: width / 2, top: y * height, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * a})`, opacity: Math.min(1, a * 1.5), display: "flex", alignItems: "center", gap: 14, padding: "14px 40px 14px 18px", borderRadius: 60, whiteSpace: "nowrap", width: "max-content", background: "linear-gradient(180deg, rgba(10,40,90,0.92), rgba(3,18,44,0.92))", border: "3px solid #8fdcff", boxShadow: "0 0 24px rgba(80,180,255,0.85), 0 10px 30px rgba(0,0,0,0.6)", overflow: "hidden" }}>
      <div style={{ width: 66, height: 66, borderRadius: 33, background: "#3fa0ff", display: "grid", placeItems: "center" }}>
        <svg width={36} height={36} viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="#fff" /></svg>
      </div>
      <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 84, color: "#fff", letterSpacing: "0.02em", textShadow: "0 0 14px rgba(110,200,255,0.9)" }}>{phone}</div>
      {sw > -0.5 ? <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent ${sw * 100 - 12}%, rgba(255,255,255,0.55) ${sw * 100}%, transparent ${sw * 100 + 12}%)` }} /> : null}
    </div>
  );
};
