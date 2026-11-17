/**
 * TRUC QUAN HOA LOGIC (v5) — hinh + chu minh hoa dung NGHIA loi noi (gop y nguoi dung; kenh mau dung the so sanh,
 * the thong so, mat bang, nhan bam tren flycam). Tat ca ve bang SVG -> sac net, khong rang cua.
 *  - QtJunction      : "nằm giữa ngã 3 ... mặt tiền 8m" -> so do NGA BA, duong tu ve, lo goc, kich thuoc mat tien
 *  - QtBuildingSection: "4 tầng + 1 tum", "tầng 1 kinh doanh, tầng trên cho thuê homestay" -> mat cat toa nha, tang sang dan
 *  - QtDistanceList  : "cách A 300m, B 500m, C 400m" -> danh sach ghim + so met dem len
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { QT } from "./components";
import { kf, type KfIn } from "./keyframes";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.33, 1, 0.68, 1);
const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};
const GOLD = "#ffd27a";
const TEAL = "#5fe3d6";
const PANEL = "rgba(14,16,20,0.55)";

/** Chu SVG co keyframe (dung chung cho cac so do). */
export const KText: React.FC<{ x: number; y: number; at: number; end: number; enter?: KfIn; exit?: import("./keyframes").KfOut; size: number; weight?: number; italic?: boolean; fill?: string; anchor?: "start" | "middle" | "end"; children: string }> = ({
  x, y, at, end, enter = "riseUp", exit = "blurUp", size, weight = 800, italic, fill = QT.cream, anchor = "start", children,
}) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const k = kf(enter, exit, t, at, end, fps);
  if (k.hidden) return null;
  return (
    <g transform={`translate(${x + k.tx} ${y + k.ty}) scale(${k.sx} ${k.sy})`} opacity={k.opacity} style={k.blur > 0.2 ? { filter: `blur(${k.blur}px)` } : undefined}>
      <text textAnchor={anchor} dominantBaseline="central" fill={fill}
        style={{ fontFamily: italic ? QT.font : QT.font, fontStyle: italic ? "italic" : "normal", fontWeight: weight, fontSize: size, paintOrder: "stroke", stroke: "rgba(0,0,0,0.35)", strokeWidth: size * 0.06 }}>
        {children}
      </text>
    </g>
  );
};

/** Duong ve dan (stroke-dashoffset) — mem, sac. */
const Draw: React.FC<{ d: string; at: number; dur?: number; len: number; stroke?: string; w?: number; end: number }> = ({ d, at, dur = 0.5, len, stroke = "#fff", w = 6, end }) => {
  const t = useT();
  const p = interpolate(t, [at, at + dur], [0, 1], { ...C, easing: ease });
  const o = interpolate(t, [end, end + 0.3], [1, 0], C);
  if (t < at) return null;
  return <path d={d} fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} opacity={o} />;
};

/* ---------------------------------------------------------------- NGA BA */
export const QtJunction: React.FC<{ at: number; tLabel: number; t8m: number; end: number; y?: number }> = ({ at, tLabel, t8m, end, y = 0.2 }) => {
  const t = useT();
  const { width, height } = useVideoConfig();
  // Bo cuc chu T ro rang: duong ngang o duoi, nhanh doc di len o giua; lo goc o goc tren-phai; nhan o goc tren-trai.
  const ox = width * 0.5, oy = height * y + 380;
  const R = 380, up = 300;
  const panel = interpolate(t, [at, at + 0.35, end, end + 0.3], [0, 1, 1, 0], C);
  const pulse = 0.5 + 0.5 * Math.sin((t - at) * 6);
  const plot = interpolate(t, [at + 0.45, at + 0.8], [0, 1], { ...C, easing: Easing.bezier(0.34, 1.4, 0.64, 1) });
  const out = interpolate(t, [end, end + 0.3], [1, 0], C);
  const road = 56;
  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="jx-glow"><stop offset="0" stopColor={GOLD} stopOpacity="0.9" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
        </defs>
        <rect x={ox - R - 40} y={oy - up - 60} width={(R + 40) * 2} height={up + 60 + 230} rx={36} fill={PANEL} opacity={panel} />
        {/* mat duong (day) + vach giua */}
        <Draw d={`M ${ox - R} ${oy} L ${ox + R} ${oy}`} len={2 * R} at={at + 0.05} end={end} w={road} stroke="rgba(255,255,255,0.22)" />
        <Draw d={`M ${ox} ${oy - road / 2} L ${ox} ${oy - up}`} len={up} at={at + 0.25} end={end} w={road} stroke="rgba(255,255,255,0.22)" />
        <Draw d={`M ${ox - R} ${oy} L ${ox + R} ${oy}`} len={2 * R} at={at + 0.1} end={end} w={3} stroke="#fff" />
        <Draw d={`M ${ox} ${oy} L ${ox} ${oy - up}`} len={up} at={at + 0.3} end={end} w={3} stroke="#fff" />
        {/* lo goc: sat goc nga ba, phia tren-phai */}
        <g opacity={out}>
          <circle cx={ox + 140} cy={oy - 140} r={130 * (0.8 + 0.2 * pulse)} fill="url(#jx-glow)" opacity={0.5 * plot} />
          <rect x={ox + road / 2 + 14} y={oy - road / 2 - 14 - 170} width={170} height={170} rx={12} fill={GOLD} opacity={0.95 * plot} />
          <text x={ox + road / 2 + 14 + 85} y={oy - road / 2 - 14 - 105} textAnchor="middle" dominantBaseline="central" fill="#2a1a05" opacity={plot} style={{ fontFamily: QT.font, fontWeight: 900, fontSize: 40 }}>CĂN</text>
          <text x={ox + road / 2 + 14 + 85} y={oy - road / 2 - 14 - 60} textAnchor="middle" dominantBaseline="central" fill="#2a1a05" opacity={plot} style={{ fontFamily: QT.font, fontWeight: 900, fontSize: 40 }}>GÓC</text>
        </g>
        {/* kich thuoc mat tien: duong do kich thuoc chay doc canh lo sat duong */}
        <Draw d={`M ${ox + road / 2 + 14} ${oy - road / 2 - 2} L ${ox + road / 2 + 184} ${oy - road / 2 - 2}`} len={170} at={t8m} dur={0.35} end={end} w={6} stroke={TEAL} />
        <KText x={ox + road / 2 + 99} y={oy + 95} at={t8m + 0.05} end={end} enter="scaleIn" size={72} weight={900} fill={TEAL} anchor="middle">8M</KText>
        <KText x={ox + road / 2 + 99} y={oy + 160} at={t8m} end={end} enter="blurIn" size={36} weight={600} italic fill="#fff" anchor="middle">mặt tiền rộng</KText>
        {/* nhan ben trai nhanh doc */}
        <KText x={ox - road / 2 - 30} y={oy - up + 30} at={at} end={end} enter="blurIn" size={42} weight={600} italic fill="#fff" anchor="end">nằm giữa</KText>
        <KText x={ox - road / 2 - 30} y={oy - up + 130} at={tLabel} end={end} enter="fromLeft" size={120} weight={900} fill={GOLD} anchor="end">NGÃ 3</KText>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------- MAT CAT TOA NHA */
export const QtBuildingSection: React.FC<{
  at: number; // ve khung
  tShop?: number; // tang 1 kinh doanh sang
  tStay?: number; // cac tang tren sang
  tFloors?: number; // dem tang (4 tang + 1 tum)
  end: number;
  x?: number; // tam ngang (ti le W)
  y?: number; // day toa nha (ti le H)
  scale?: number;
}> = ({ at, tShop, tStay, tFloors, end, x = 0.3, y = 0.5, scale = 1 }) => {
  const t = useT();
  const { width, height } = useVideoConfig();
  const W = 260 * scale, Fh = 92 * scale, cx = width * x, base = height * y;
  const left = cx - W / 2;
  const floors = [0, 1, 2, 3]; // 4 tang
  const out = interpolate(t, [end, end + 0.3], [1, 0], C);
  const lit = (i: number) => {
    if (tShop !== undefined && i === 0) return interpolate(t, [tShop, tShop + 0.3], [0, 1], C);
    if (tStay !== undefined && i > 0) return interpolate(t, [tStay + (i - 1) * 0.12, tStay + (i - 1) * 0.12 + 0.3], [0, 1], C);
    if (tFloors !== undefined) return interpolate(t, [tFloors + i * 0.15, tFloors + i * 0.15 + 0.25], [0, 1], C);
    return 0;
  };
  const tumP = tFloors !== undefined ? interpolate(t, [tFloors + 0.7, tFloors + 0.95], [0, 1], C) : 0;
  const panel = interpolate(t, [at, at + 0.35], [0, 1], C) * out;
  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <rect x={left - 40} y={base - Fh * 4 - Fh * 0.8 - 40} width={W + 80} height={Fh * 4.8 + 80} rx={28} fill={PANEL} opacity={panel} />
        {floors.map((i) => {
          const yy = base - (i + 1) * Fh;
          const l = lit(i);
          const col = i === 0 && tShop !== undefined ? GOLD : TEAL;
          return (
            <g key={i} opacity={out}>
              <rect x={left} y={yy} width={W} height={Fh} fill={col} opacity={0.85 * l} />
              <Draw d={`M ${left} ${yy} H ${left + W} V ${yy + Fh} H ${left} Z`} len={2 * (W + Fh)} at={at + i * 0.06} dur={0.4} end={end} w={3} />
              {/* cua so */}
              {[0.2, 0.5, 0.8].map((fx, k) => (
                <rect key={k} x={left + W * fx - 18 * scale} y={yy + Fh * 0.28} width={36 * scale} height={Fh * 0.44} rx={4} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={2} opacity={interpolate(t, [at + 0.3, at + 0.6], [0, 1], C)} />
              ))}
              {tFloors !== undefined ? (
                <text x={left - 16} y={yy + Fh / 2} textAnchor="end" dominantBaseline="central" fill="#fff" opacity={l} style={{ fontFamily: QT.font, fontWeight: 800, fontSize: 30 * scale }}>{`T${i + 1}`}</text>
              ) : null}
            </g>
          );
        })}
        {/* tum */}
        <g opacity={out}>
          <rect x={left + W * 0.3} y={base - 4 * Fh - Fh * 0.8} width={W * 0.4} height={Fh * 0.8} fill={TEAL} opacity={0.85 * tumP} />
          <Draw d={`M ${left + W * 0.3} ${base - 4 * Fh} V ${base - 4 * Fh - Fh * 0.8} H ${left + W * 0.7} V ${base - 4 * Fh}`} len={W * 0.4 + Fh * 1.6} at={at + 0.3} dur={0.35} end={end} w={3} />
        </g>
        {/* mat dat */}
        <Draw d={`M ${left - 30} ${base} H ${left + W + 30}`} len={W + 60} at={at} dur={0.35} end={end} w={5} />
      </svg>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------- DANH SACH KHOANG CACH */
export const QtDistanceList: React.FC<{ rows: Array<{ name: string; meters: number; at: number }>; end: number; x?: number; y?: number }> = ({ rows, end, x = 0.08, y = 0.16 }) => {
  const t = useT();
  const { width, height } = useVideoConfig();
  const rowH = 150;
  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {rows.map((r, i) => {
          const yy = height * y + i * rowH;
          const xx = width * x;
          const n = Math.round(interpolate(t, [r.at, r.at + 0.6], [0, r.meters], { ...C, easing: ease }) / 10) * 10;
          const bar = interpolate(t, [r.at, r.at + 0.45], [0, 1], { ...C, easing: ease });
          const out = interpolate(t, [end + i * 0.05, end + i * 0.05 + 0.3], [1, 0], C);
          if (t < r.at) return null;
          return (
            <g key={i} opacity={out}>
              <rect x={xx} y={yy} width={(width * 0.84) * bar} height={rowH - 22} rx={22} fill={PANEL} />
              {/* ghim */}
              <g transform={`translate(${xx + 60} ${yy + 64}) scale(${0.6 + 0.4 * bar})`}>
                <path d="M0 -38 C 22 -38 34 -22 34 -6 C 34 18 0 44 0 44 C 0 44 -34 18 -34 -6 C -34 -22 -22 -38 0 -38 Z" fill={GOLD} />
                <circle cx={0} cy={-6} r={12} fill="#2a1a05" />
              </g>
              <KText x={xx + 120} y={yy + 44} at={r.at + 0.05} end={end + 1} enter="fromRight" size={36} weight={600} italic fill="#fff">{r.name}</KText>
              <KText x={xx + 120} y={yy + 94} at={r.at + 0.12} end={end + 1} enter="fromRight" size={64} weight={900} fill={QT.cream}>{`${n}M`}</KText>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
