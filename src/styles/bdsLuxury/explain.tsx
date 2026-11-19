/**
 * CANH TRAM TRUC QUAN (motion graphic) cho doan KHONG CO NGUOI / thong tin kho hinh dung.
 * Tat ca dung thoi gian CUC BO (dat trong <Sequence>), co vao + ra (0.35s cuoi).
 * Tong mau: kinh xanh navy + vien vang champagne + so Playfair (font B nguoi dung duyet).
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out3 = Easing.bezier(0.33, 1, 0.68, 1);
const back = Easing.bezier(0.34, 1.56, 0.64, 1);
export const GOLD = "#5db4ff", GOLD_HI = "#eef8ff", NAVY = "rgba(4,14,34,0.84)" /* tone XANH DUONG + TRANG (ten bien giu nguyen) */, SERIF = "Playfair Display", SANS = "Be Vietnam Pro";

const useLocal = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  return { t: f / fps, dur: durationInFrames / fps, width, height };
};
/** vao/ra chung: tra ve [opacity, scale] */
const useInOut = (inDur = 0.4) => {
  const { t, dur } = useLocal();
  const a = interpolate(t, [0, inDur], [0, 1], { ...C, easing: out3 });
  const z = interpolate(t, [dur - 0.35, dur], [1, 0], C);
  return { o: Math.min(a, z), s: 0.92 + 0.08 * a + 0.04 * (1 - z) };
};
const pop = (t: number, at: number, d = 0.35) => interpolate(t, [at, at + d], [0, 1], { ...C, easing: back });
const lin = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...C, easing: out3 });
const fmt = (v: number, dec = 1) => v.toFixed(dec).replace(".", ",");

/** nen toi + luoi blueprint mo (dat tren video bi lam nhoe) */
export const Blueprint: React.FC<{ dim?: number }> = ({ dim = 0.62 }) => {
  const { o } = useInOut(0.3);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ backdropFilter: "blur(14px)", background: `rgba(4,10,24,${dim})` }} />
      <AbsoluteFill style={{ opacity: 0.18, backgroundImage: "linear-gradient(rgba(93,180,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(93,180,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
    </AbsoluteFill>
  );
};

const Label: React.FC<{ x: number; y: number; s: string; size?: number; color?: string; anchor?: "start" | "middle" | "end"; w?: number; rot?: number; o?: number }> = ({ x, y, s, size = 30, color = "#fff", anchor = "middle", w = 800, rot = 0, o = 1 }) => (
  <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" fill={color} opacity={o} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} style={{ fontFamily: SANS, fontWeight: w, fontSize: size, letterSpacing: "0.04em", paintOrder: "stroke", stroke: "rgba(0,0,0,0.55)", strokeWidth: size * 0.12 }}>{s}</text>
);
const Num: React.FC<{ x: number; y: number; s: string; size?: number; o?: number; sc?: number }> = ({ x, y, s, size = 90, o = 1, sc = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={o}>
    <defs><linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={GOLD_HI} /><stop offset="0.5" stopColor={GOLD} /><stop offset="1" stopColor="#1c5cd4" /></linearGradient></defs>
    <text textAnchor="middle" dominantBaseline="central" fill="url(#ng)" stroke="url(#ng)" strokeWidth={size * 0.025} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: size, filter: `drop-shadow(0 0 ${size * 0.18}px rgba(80,170,255,0.55)) drop-shadow(0 4px 6px rgba(0,0,0,0.7))` }}>{s}</text>
  </g>
);

/** mui ten chay (gio): duong + dau mui, dash chay theo t */
const Flow: React.FC<{ d: string; t: number; color?: string; o?: number }> = ({ d, t, color = "#9be7ff", o = 1 }) => (
  <g opacity={o}>
    <path d={d} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray="22 16" strokeDashoffset={-t * 120} markerEnd="url(#arw)" />
  </g>
);
const ArrowDef: React.FC<{ color?: string }> = ({ color = "#9be7ff" }) => (
  <defs><marker id="arw" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={color} /></marker></defs>
);

/** Mat bang chung (nhin tu tren): duong 7M phia sau (tren) | lo SB-145 | duong 20M phia truoc (duoi); trai = xe khe 3M, phai = can lien ke. */
const PlanBase: React.FC<{ t: number; cx: number; L: { x: number; y: number; w: number; h: number }; khe: number; showKhe: number }> = ({ t, cx, L, khe, showKhe }) => {
  const rB = lin(t, 0.35, 0.9), rF = lin(t, 0.5, 1.05);
  const R = L.x + L.w; // canh phai lo
  return (
    <>
      <g opacity={rB}>
        <rect x={150} y={L.y - 150} width={780} height={120} fill="#2b2f36" stroke="rgba(255,255,255,0.25)" />
        <line x1={170} y1={L.y - 90} x2={170 + 740 * rB} y2={L.y - 90} stroke="#fff" strokeWidth={4} strokeDasharray="30 22" opacity={0.7} />
        <Label x={cx} y={L.y - 182} s="MẶT TIỀN SAU · ĐƯỜNG 7M" size={30} color={GOLD_HI} />
      </g>
      <g opacity={rF}>
        <rect x={150} y={L.y + L.h + 30} width={780} height={190} fill="#2b2f36" stroke="rgba(255,255,255,0.25)" />
        <rect x={150} y={L.y + L.h + 30} width={780} height={34} fill="#8f897e" />
        <line x1={170} y1={L.y + L.h + 140} x2={170 + 740 * rF} y2={L.y + L.h + 140} stroke="#fff" strokeWidth={4} strokeDasharray="34 24" opacity={0.75} />
        <Label x={cx} y={L.y + L.h + 252} s="MẶT TIỀN TRƯỚC · ĐƯỜNG 20M (cả vỉa hè)" size={30} color={GOLD_HI} />
      </g>
      {/* can lien ke (dinh sat ben TRAI) */}
      <rect x={150} y={L.y} width={L.x - 150} height={L.h} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" strokeDasharray="8 8" strokeWidth={2} opacity={lin(t, 0.3, 0.8)} />
      <Label x={(150 + L.x) / 2} y={L.y + L.h / 2} s="LIỀN KỀ" size={24} color="rgba(255,255,255,0.75)" rot={-90} o={lin(t, 0.4, 0.9)} />
      {/* xe khe ben PHAI (doi dien lien ke) */}
      <g opacity={showKhe}>
        <rect x={R} y={L.y} width={khe} height={L.h} fill="rgba(120,220,255,0.22)" stroke="#9be7ff" strokeWidth={2} strokeDasharray="6 6" />
        <Label x={R + khe * 0.36} y={L.y + L.h / 2} s="XẺ KHE 3M" size={24} color="#9be7ff" rot={90} />
        {R + khe < 930 ? <rect x={R + khe} y={L.y} width={930 - R - khe} height={L.h} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" strokeDasharray="8 8" strokeWidth={2} /> : null}
      </g>
    </>
  );
};

/** 1) MAT BANG: 2 mat tien TRUOC (20M) - SAU (7M), xe khe 3M ben hong, dien tich dem so. */
export const SitePlan: React.FC<{ area: number }> = ({ area }) => {
  const { t, width } = useLocal();
  const { o, s } = useInOut();
  const cx = width / 2;
  const L = { x: 300, y: 640, w: 380, h: 420 };
  const per = 2 * (L.w + L.h);
  const draw = lin(t, 0.15, 1.0);
  const n = area * lin(t, 0.9, 2.0);
  const edge = (at: number) => lin(t, at, at + 0.4);
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${s})` }}>
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <PlanBase t={t} cx={cx} L={L} khe={90} showKhe={lin(t, 1.8, 2.3)} />
        <rect x={L.x} y={L.y} width={L.w} height={L.h} fill={`rgba(93,180,255,${0.22 * draw})`} stroke={GOLD} strokeWidth={6} strokeDasharray={per} strokeDashoffset={per * (1 - draw)} style={{ filter: "drop-shadow(0 0 12px rgba(80,170,255,0.8))" }} />
        {/* 2 canh mat tien sang len: truoc (duoi) + sau (tren) */}
        <line x1={L.x} y1={L.y + L.h} x2={L.x + L.w * edge(1.2)} y2={L.y + L.h} stroke={GOLD_HI} strokeWidth={14} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 14px #8ccaff)" }} opacity={edge(1.2) > 0 ? 1 : 0} />
        <line x1={L.x} y1={L.y} x2={L.x + L.w * edge(1.45)} y2={L.y} stroke={GOLD_HI} strokeWidth={14} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 14px #8ccaff)" }} opacity={edge(1.45) > 0 ? 1 : 0} />
        <Label x={L.x + L.w / 2} y={L.y + 60} s="SB-145" size={34} color={GOLD_HI} o={lin(t, 0.8, 1.2)} />
        <Label x={L.x + L.w / 2} y={L.y + 150} s="DIỆN TÍCH ĐẤT" size={26} o={lin(t, 0.9, 1.3)} />
        <Num x={L.x + L.w / 2} y={L.y + 250} s={`${fmt(n)} m²`} size={80} o={lin(t, 0.9, 1.2)} />
        <g opacity={pop(t, 1.7)} transform={`translate(${cx} 330)`}>
          <rect x={-270} y={-44} width={540} height={88} rx={44} fill={NAVY} stroke={GOLD} strokeWidth={3} />
          <Label x={0} y={0} s="2 MẶT TIỀN TRƯỚC – SAU" size={34} color={GOLD_HI} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** 2) CHONG SAN: cac san nha xep chong len (isometric) + dem tong san. */
export const FloorStack: React.FC<{ total: number; floors?: number }> = ({ total, floors = 5 }) => {
  const { t, width } = useLocal();
  const { o, s } = useInOut();
  const cx = width / 2, base = 1180;
  const slab = (i: number) => {
    const a = pop(t, 0.15 + i * 0.22, 0.4);
    const y = base - i * 105 - (1 - a) * 120;
    const w = 300, d = 150; // nua rong, nua sau (iso)
    const top = `M ${cx} ${y - d / 2} L ${cx + w} ${y} L ${cx} ${y + d / 2} L ${cx - w} ${y} Z`;
    const left = `M ${cx - w} ${y} L ${cx} ${y + d / 2} L ${cx} ${y + d / 2 + 26} L ${cx - w} ${y + 26} Z`;
    const right = `M ${cx + w} ${y} L ${cx} ${y + d / 2} L ${cx} ${y + d / 2 + 26} L ${cx + w} ${y + 26} Z`;
    return (
      <g key={i} opacity={a}>
        <path d={left} fill="#174a9e" /><path d={right} fill="#0f3576" />
        <path d={top} fill={`rgba(93,180,255,${0.35 + 0.1 * i})`} stroke={GOLD_HI} strokeWidth={2.5} />
      </g>
    );
  };
  const n = total * lin(t, 0.2, 0.2 + floors * 0.22 + 0.3);
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${s})` }}>
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: floors }, (_, i) => slab(i))}
        <Label x={cx} y={400} s="TỔNG DIỆN TÍCH XÂY DỰNG" size={34} o={lin(t, 0.1, 0.5)} />
        <Num x={cx} y={500} s={`${fmt(n)} m²`} size={130} sc={0.9 + 0.1 * pop(t, 0.2)} />
        <Label x={cx} y={590} s="mặt sàn" size={34} color={GOLD_HI} o={lin(t, 0.4, 0.8)} />
      </svg>
    </AbsoluteFill>
  );
};

/** 3) XE KHE: cung mat bang, khe 3M ben hong mo ra -> gio chay tu duong truoc ra duong sau + vao nha qua cua so hong; nang chieu xuong. */
export const XeKhe: React.FC = () => {
  const { t, width } = useLocal();
  const { o, s } = useInOut();
  const cx = width / 2;
  const L = { x: 280, y: 640, w: 370, h: 420 };
  const khe = 150 * lin(t, 0.5, 1.2);
  const R = L.x + L.w; const kx = R + khe * 0.82;
  const fl = lin(t, 1.3, 1.8);
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${s})` }}>
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <ArrowDef />
        <PlanBase t={t + 2} cx={cx} L={L} khe={khe} showKhe={lin(t, 0.4, 0.8)} />
        <rect x={L.x} y={L.y} width={L.w} height={L.h} fill="rgba(93,180,255,0.28)" stroke={GOLD} strokeWidth={6} style={{ filter: "drop-shadow(0 0 12px rgba(80,170,255,0.8))" }} />
        <Label x={L.x + L.w / 2} y={L.y + L.h / 2} s="SB-145" size={40} color={GOLD_HI} />
        {/* cua so ben hong */}
        {[0, 1, 2].map((i) => <rect key={i} x={R - 5} y={L.y + 70 + i * 120} width={10} height={60} fill="#9be7ff" opacity={fl} />)}
        {/* gio doc khe: tu duong truoc -> duong sau */}
        <Flow d={`M ${kx} ${L.y + L.h + 20} L ${kx} ${L.y - 20}`} t={t} o={fl} />
        {/* gio re vao nha qua cua so hong */}
        {[0, 1, 2].map((i) => <Flow key={i} d={`M ${R + khe * 0.85} ${L.y + 140 + i * 120} Q ${R + 10} ${L.y + 100 + i * 120} ${R - 70} ${L.y + 100 + i * 120}`} t={t + i * 0.2} o={lin(t, 1.6 + i * 0.15, 2.0 + i * 0.15)} />)}
        {/* kich thuoc 3M */}
        <g opacity={pop(t, 2.2)} transform={`translate(${cx} ${L.y + L.h + 330})`}><rect x={-370} y={-40} width={740} height={80} rx={40} fill={NAVY} stroke="#9be7ff" strokeWidth={3} /><Label x={0} y={0} s="THOÁNG · SÁNG 3 MẶT: TRƯỚC – SAU – HÔNG" size={28} color="#9be7ff" /></g>
      </svg>
    </AbsoluteFill>
  );
};

/** 4) MAT CAT DUONG: via he | long duong | via he (tren dau nguoi noi). */
export const RoadSection: React.FC<{ y?: number; parts: Array<[string, number, "walk" | "road"]> }> = ({ y = 420, parts }) => {
  const { t, width } = useLocal();
  const { o, s } = useInOut(0.3);
  const total = parts.reduce((a, p) => a + p[1], 0), W = 760, x0 = (width - W) / 2;
  let acc = x0;
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${s})`, transformOrigin: `50% ${y}px` }}>
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect x={x0 - 30} y={y - 120} width={W + 60} height={250} rx={24} fill={NAVY} stroke="rgba(93,180,255,0.6)" strokeWidth={2} />
        {parts.map(([lab, m, k], i) => {
          const w = (W * m) / total, x = acc; acc += w;
          const a = pop(t, 0.1 + i * 0.25);
          return (
            <g key={i} opacity={a} transform={`translate(0 ${(1 - a) * 30})`}>
              <rect x={x + 3} y={y - 10} width={w - 6} height={56} rx={6} fill={k === "road" ? "#30343c" : "#9b958a"} />
              {k === "road" ? <line x1={x + 20} y1={y + 18} x2={x + w - 20} y2={y + 18} stroke="#fff" strokeWidth={4} strokeDasharray="26 18" /> : null}
              <line x1={x + 6} y1={y - 36} x2={x + w - 6} y2={y - 36} stroke={GOLD} strokeWidth={3} />
              <Label x={x + w / 2} y={y - 76} s={`${m}M`} size={k === "road" ? 58 : 44} color={GOLD_HI} />
              <Label x={x + w / 2} y={y + 88} s={lab} size={26} color="#fff" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** 5) SO SANH: cot "can cat lo sau" cao hon, cot SB-145 thap hon -> RE HON. */
export const CompareBars: React.FC<{ ours: string; badgeAt?: number }> = ({ ours, badgeAt = 1.7 }) => {
  const { t, width } = useLocal();
  const { o, s } = useInOut();
  const base = 1220, cx = width / 2;
  const h1 = 560 * lin(t, 0.2, 1.0), h2 = 400 * lin(t, 0.6, 1.4);
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${s})` }}>
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={160} y1={base} x2={920} y2={base} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
        <rect x={cx - 300} y={base - h1} width={240} height={h1} rx={14} fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.6)" strokeWidth={3} />
        <Label x={cx - 180} y={base + 46} s="CĂN CẮT LỖ SÂU" size={28} />
        <Label x={cx - 180} y={base + 84} s="trên thị trường" size={24} w={600} color="rgba(255,255,255,0.8)" />
        <rect x={cx + 60} y={base - h2} width={240} height={h2} rx={14} fill="rgba(93,180,255,0.55)" stroke={GOLD_HI} strokeWidth={4} style={{ filter: "drop-shadow(0 0 16px rgba(80,170,255,0.7))" }} />
        <Label x={cx + 180} y={base + 46} s="SB-145" size={32} color={GOLD_HI} />
        <Num x={cx + 180} y={base - h2 - 70} s={ours} size={64} o={lin(t, 1.2, 1.5)} />
        <g opacity={pop(t, badgeAt)} transform={`translate(${cx} 560) rotate(-4)`}>
          <rect x={-190} y={-56} width={380} height={112} rx={20} fill="#1f6fe0" />
          <text textAnchor="middle" dominantBaseline="central" fill="#fff" style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64 }}>RẺ HƠN</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** 6) GIA: the gia goc -> gach -> chip uu dai -> gia con lai. steps: thoi diem cuc bo moi buoc. */
export const PriceDrop: React.FC<{ from: string; chips: Array<[string, number]>; to: string; toAt: number; note?: string; y?: number; panel?: boolean }> = ({ from, chips, to, toAt, note, y = 520, panel = true }) => {
  const { t, width } = useLocal();
  const { o, s } = useInOut(0.3);
  const cx = width / 2;
  const strike = lin(t, toAt - 0.5, toAt - 0.1);
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${s})`, transformOrigin: `50% ${y}px` }}>
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        {panel ? <rect x={150} y={y - 170} width={780} height={330 + chips.length * 0} rx={28} fill={NAVY} stroke="rgba(93,180,255,0.6)" strokeWidth={2} /> : null}
        <g opacity={1 - 0.45 * strike}>
          <text x={cx} y={y - 95} textAnchor="middle" dominantBaseline="central" fill="#fff" style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 76 }}>{from}</text>
          <line x1={cx - 230} y1={y - 95} x2={cx - 230 + 460 * strike} y2={y - 95} stroke="#ff4d4d" strokeWidth={9} strokeLinecap="round" />
        </g>
        {chips.map(([c, at], i) => {
          const a = pop(t, at);
          const x = cx + (i - (chips.length - 1) / 2) * 330;
          return (
            <g key={i} opacity={a} transform={`translate(${x} ${y - 5}) scale(${0.6 + 0.4 * a})`}>
              <rect x={-155} y={-34} width={310} height={68} rx={34} fill="#1f6fe0" />
              <text textAnchor="middle" dominantBaseline="central" fill="#fff" style={{ fontFamily: SANS, fontWeight: 900, fontSize: 30 }}>{c}</text>
            </g>
          );
        })}
        <Num x={cx} y={y + 95} s={to} size={110} o={lin(t, toAt, toAt + 0.2)} sc={1.3 - 0.3 * pop(t, toAt)} />
        {note ? <Label x={cx} y={y + 175} s={note} size={26} color={GOLD_HI} o={lin(t, toAt + 0.4, toAt + 0.8)} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

/** 7) CHECKLIST chip canh tay nguoi noi. */
export const CheckChips: React.FC<{ items: Array<[string, number]>; x: number; y: number }> = ({ items, x, y }) => {
  const { t } = useLocal();
  const { o } = useInOut(0.2);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {items.map(([s, at], i) => {
        const a = pop(t, at);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y + i * 92, transform: `translateX(${(1 - a) * -60}px) scale(${0.7 + 0.3 * a})`, opacity: Math.min(1, a * 1.5), display: "flex", alignItems: "center", gap: 14, padding: "12px 26px 12px 14px", borderRadius: 40, background: NAVY, border: `2px solid ${GOLD}`, boxShadow: "0 8px 24px rgba(0,0,0,0.45)" }}>
            <div style={{ width: 46, height: 46, borderRadius: 23, background: GOLD, color: "#1a1206", display: "grid", placeItems: "center", fontFamily: SANS, fontWeight: 900, fontSize: 30 }}>✓</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: "#fff", whiteSpace: "nowrap" }}>{s}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
