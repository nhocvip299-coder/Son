/**
 * PHU DE MOI (thay LuxCaptions/WordByWord cu bi che "khong dep"):
 *  KaraSub : cum 2–4 tu, tu DANG NOI doi sang XANH bong (gradient kim loai) + phong nhe, tu da noi trang, tu sap noi trang mo;
 *            nen toi mem (khong khung). Font Be Vietnam Pro 900.
 *  BigWord : moi lan 1 tu TO (Montserrat 900 nghieng), so/ten rieng mau xanh bong, con lai trang; nay vao + mo ra.
 *  Ca hai ve SVG o co that (4K sac net).
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";

export type SubWord = { text: string; startMs: number; endMs: number };
const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const KEY = /^[0-9]|^(Vinhomes|Ocean|Park|Shophouse|Văn|Giang|Masteri|SB|Sơn|xẻ|khe|thô|mặt|tiền|tỷ|triệu|voucher)/i;

const chunks = (ws: SubWord[], max = 4) => {
  const out: SubWord[][] = [];
  let cur: SubWord[] = [];
  ws.forEach((w, i) => {
    const prev = ws[i - 1];
    const gap = prev ? w.startMs - prev.endMs : 0;
    if (cur.length >= max || gap > 350 || (prev && /[.?!,]$/.test(prev.text))) { if (cur.length) out.push(cur); cur = []; }
    cur.push(w);
  });
  if (cur.length) out.push(cur);
  return out;
};

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="sub-blue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f0f9ff" /><stop offset="0.3" stopColor="#ffffff" /><stop offset="0.45" stopColor="#66baff" /><stop offset="0.8" stopColor="#1d5ed4" /><stop offset="1" stopColor="#66baff" />
    </linearGradient>
    <filter id="sub-bd" x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur stdDeviation="20" /></filter>
    <filter id="sub-sd" x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur stdDeviation="3" /></filter>
  </defs>
);

export const KaraSub: React.FC<{ words: SubWord[]; y?: number; size?: number }> = ({ words, y = 0.71, size = 66 }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const cs = chunks(words);
  const ci = cs.findIndex((c, i) => ms >= c[0].startMs && ms < Math.min(c[c.length - 1].endMs + 500, cs[i + 1]?.[0].startMs ?? Infinity));
  if (ci < 0) return null;
  const c = cs[ci];
  const st: React.CSSProperties = { fontFamily: "Be Vietnam Pro", fontWeight: 900, fontSize: size };
  const ws = c.map((w) => measureText({ text: w.text, fontFamily: "Be Vietnam Pro", fontWeight: "900", fontSize: size, validateFontIsLoaded: false }).width);
  const gap = size * 0.28, total = ws.reduce((a, b) => a + b, 0) + gap * (c.length - 1);
  let x = width / 2 - total / 2;
  const Y = y * height;
  const inP = interpolate(ms, [c[0].startMs, c[0].startMs + 160], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ opacity: inP, transform: `translateY(${(1 - inP) * 20}px)` }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Defs />
        <rect x={width / 2 - total / 2 - 40} y={Y - size * 0.75} width={total + 80} height={size * 1.5} rx={size * 0.4} fill="#000814" opacity={0.55} filter="url(#sub-bd)" />
        {c.map((w, i) => {
          const cx = x + ws[i] / 2; x += ws[i] + gap;
          const on = ms >= w.startMs && ms < (c[i + 1]?.startMs ?? w.endMs + 500);
          const done = ms >= (c[i + 1]?.startMs ?? Infinity);
          const k = on ? interpolate(ms, [w.startMs, w.startMs + 120], [1.18, 1.08], C) : 1;
          return (
            <g key={i} transform={`translate(${cx} ${Y}) scale(${k}) translate(${-cx} ${-Y})`} opacity={on || done ? 1 : 0.55}>
              <text x={cx} y={Y + 3} textAnchor="middle" dominantBaseline="central" style={st} fill="#000" opacity={0.75} filter="url(#sub-sd)">{w.text}</text>
              <text x={cx} y={Y} textAnchor="middle" dominantBaseline="central" style={st} fill={on ? "url(#sub-blue)" : "#ffffff"} stroke={on ? "#04163a" : "rgba(0,0,0,0.6)"} strokeWidth={size * 0.06} paintOrder="stroke" strokeLinejoin="round">{w.text}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const BigWord: React.FC<{ words: SubWord[]; y?: number }> = ({ words, y = 0.71 }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const i = words.findIndex((w, k) => ms >= w.startMs && ms < Math.min(words[k + 1]?.startMs ?? Infinity, w.endMs + 600));
  if (i < 0) return null;
  const w = words[i];
  const key = KEY.test(w.text);
  const size = Math.min(key ? 130 : 104, (width * 0.82) / Math.max(3, w.text.length * 0.62));
  const p = interpolate(ms, [w.startMs, w.startMs + 140], [0, 1], { ...C, easing: Easing.bezier(0.34, 1.6, 0.64, 1) });
  const Y = y * height, cx = width / 2;
  const st: React.CSSProperties = { fontFamily: "Montserrat", fontWeight: 900, fontStyle: "italic", fontSize: size };
  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Defs />
        <g transform={`translate(${cx} ${Y}) scale(${0.6 + 0.4 * p}) translate(${-cx} ${-Y})`} opacity={Math.min(1, p * 1.5)}>
          <text x={cx} y={Y} textAnchor="middle" dominantBaseline="central" style={st} fill="#000814" stroke="#000814" strokeWidth={size * 0.3} opacity={0.5} filter="url(#sub-bd)">{w.text}</text>
          <text x={cx} y={Y + 4} textAnchor="middle" dominantBaseline="central" style={st} fill="#000" opacity={0.75} filter="url(#sub-sd)">{w.text}</text>
          <text x={cx} y={Y} textAnchor="middle" dominantBaseline="central" style={st} fill={key ? "url(#sub-blue)" : "#ffffff"} stroke={key ? "#04163a" : "rgba(0,0,0,0.6)"} strokeWidth={size * 0.05} paintOrder="stroke" strokeLinejoin="round">{w.text}</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
