/**
 * LONG LANH cho chu: dom sao 4 canh nhap nhay (twinkle) + hat kim tuyen nho, rai tren khung chu.
 * Tra ve <g> SVG (dat trong <svg> cua chu). Thoi gian = giay (t) do chu truyen vao -> deterministic (random(seed)).
 */
import React from "react";
import { random } from "remotion";

const star = (r: number) => {
  const k = r * 0.16; // eo cua sao
  return `M 0 ${-r} C ${k} ${-k} ${k} ${-k} ${r} 0 C ${k} ${k} ${k} ${k} 0 ${r} C ${-k} ${k} ${-k} ${k} ${-r} 0 C ${-k} ${-k} ${-k} ${-k} 0 ${-r} Z`;
};

export const Glints: React.FC<{ id: string; t: number; x0: number; x1: number; y0: number; y1: number; size: number; color?: string; density?: number; from?: number; opacity?: number }> = ({
  id, t, x0, x1, y0, y1, size, color = "#9fd4ff", density = 1, from = 0, opacity = 1,
}) => {
  if (t < from) return null;
  const w = x1 - x0;
  const nStar = Math.max(2, Math.round((w / size) * 0.9 * density));
  const nDot = nStar * 2;
  const els: React.ReactNode[] = [];
  for (let i = 0; i < nStar; i++) {
    const px = x0 + random(`${id}-sx${i}`) * w, py = y0 + random(`${id}-sy${i}`) * (y1 - y0);
    const per = 0.9 + random(`${id}-sp${i}`) * 0.9, ph = random(`${id}-sf${i}`) * per;
    const u = ((t - from + ph) % per) / per; // 0..1
    const a = Math.pow(Math.max(0, Math.sin(u * Math.PI)), 4);
    if (a < 0.02) continue;
    const r = size * (0.09 + random(`${id}-sr${i}`) * 0.08) * (0.4 + 0.6 * a);
    els.push(
      <g key={`s${i}`} transform={`translate(${px} ${py}) rotate(${(t * 40 + i * 30) % 360 * 0.15})`} opacity={a * opacity}>
        <path d={star(r * 1.8)} fill={color} opacity={0.45} filter={`url(#gb-${id})`} />
        <path d={star(r)} fill="#ffffff" />
        <circle r={r * 0.18} fill="#ffffff" />
      </g>,
    );
  }
  for (let i = 0; i < nDot; i++) {
    const px = x0 + random(`${id}-dx${i}`) * w, py = y0 + random(`${id}-dy${i}`) * (y1 - y0);
    const per = 0.5 + random(`${id}-dp${i}`) * 0.6, ph = random(`${id}-df${i}`) * per;
    const u = ((t - from + ph) % per) / per;
    const a = Math.pow(Math.max(0, Math.sin(u * Math.PI)), 3);
    if (a < 0.05) continue;
    els.push(<circle key={`d${i}`} cx={px} cy={py} r={size * 0.014 * (0.5 + a)} fill="#ffffff" opacity={a * 0.9 * opacity} />);
  }
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs><filter id={`gb-${id}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={size * 0.04} /></filter></defs>
      {els}
    </g>
  );
};

/** vet sang quet LAP LAI (moi `every` giay) -> tra ve offset 0..1 (ngoai khoang = an) */
export const loopSweep = (t: number, start: number, every = 1.8, dur = 0.7) => {
  if (t < start) return -1;
  const u = (t - start) % every;
  return u > dur ? -1 : -0.3 + (u / dur) * 1.6;
};
