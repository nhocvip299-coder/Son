/**
 * Bo may dung Text Preset theo cau hinh: moi preset = danh sach "lop chu" + "trang tri".
 * Thu vien 40 preset nam o presets40.ts (du lieu). Am thanh tu sinh theo kieu chuyen dong.
 */
import React from "react";
import { interpolate } from "remotion";
import { FONTS, type FontKey } from "../../lib/fonts";
import { useFrame30, type SfxCue, type SfxName } from "../../lib/theme";
import { ChipBox, CharPop, DrawPath, GlitchChars, ScriptWipe, TrackIn, clamp, easeOut, glowFill, solidGlow } from "./primitives";

export type Fill = { solid: string } | { grad: [string, string] } | { outline: string };
export type Anim = "track" | "pop" | "glitch" | "write" | "fadeUp" | "scale" | "type" | "cycle";

export type Layer = {
  text: string;
  font: FontKey;
  weight?: number;
  italic?: boolean;
  size: number; // boi so cua u
  fill: Fill;
  glow?: string; // mau glow (mac dinh theo fill)
  glowStrength?: number;
  anim: Anim;
  delay?: number; // frame@30, tinh tu luc preset bat dau
  align?: "start" | "center" | "end";
  dx?: number; // boi so cua u
  dy?: number; // boi so cua u (am = chong len dong tren)
  upper?: boolean;
  box?: { bg?: string; border?: string; radius?: number; padX?: number; padY?: number; glow?: string };
  recolor?: { at: number; fill: Fill }; // doi mau sau `at` frame (vd: gach ngang -> do)
  join?: boolean; // dat cung hang voi lop truoc
};

export type Deco =
  | { kind: "swoosh"; x: number; y: number; w: number; bend?: number; color: string; delay: number }
  | { kind: "strike"; x: number; y: number; w: number; color: string; delay: number }
  | { kind: "ellipse"; x: number; y: number; w: number; h: number; color: string; delay: number }
  | { kind: "bar"; x: number; y: number; h: number; color: string; delay: number }
  | { kind: "phone"; x: number; y: number; d: number; delay: number };

export type PresetDef = {
  id: string;
  name: string;
  use: string; // goi y dung trong video BDS
  layers: Layer[];
  decos?: Deco[];
  align?: "start" | "center" | "end";
  verified: "XM" | "UD"; // muc do xac minh so voi video mau
};

const ANIM_SFX: Record<Anim, SfxName | null> = {
  track: "swish",
  pop: "pop",
  glitch: "glitch",
  write: "write",
  fadeUp: null,
  scale: "pop",
  type: "typing",
  cycle: "shimmer",
};
const DECO_SFX: Record<Deco["kind"], SfxName | null> = { swoosh: "swish", strike: "swish", ellipse: "swish", bar: "click", phone: "ring" };

/** Cue am thanh cua 1 preset (frame@30, tuong doi). Toi da 3 tieng/preset de khong roi. */
export const presetCues = (p: PresetDef): SfxCue[] => {
  const raw: SfxCue[] = [
    ...p.layers.flatMap((l) => {
      const s = ANIM_SFX[l.anim];
      return s ? [{ frame: (l.delay ?? 0) + 1, sfx: s, volume: s === "write" ? 0.35 : 0.4 }] : [];
    }),
    ...p.layers.filter((l) => l.box).map((l) => ({ frame: l.delay ?? 0, sfx: "click" as SfxName, volume: 0.35 })),
    ...(p.decos ?? []).flatMap((d) => {
      const s = DECO_SFX[d.kind];
      return s ? [{ frame: d.delay, sfx: s, volume: d.kind === "phone" ? 0.3 : 0.35 }] : [];
    }),
  ].sort((a, b) => a.frame - b.frame);
  const out: SfxCue[] = [];
  for (const c of raw) {
    if (out.length >= 3) break;
    if (out.some((o) => o.sfx === c.sfx && Math.abs(o.frame - c.frame) < 8)) continue;
    out.push(c);
  }
  return out;
};

const paint = (fill: Fill, glow: string | undefined, strength: number): React.CSSProperties => {
  if ("grad" in fill) return glowFill(fill.grad[0], fill.grad[1], glow ?? fill.grad[1], strength);
  if ("outline" in fill)
    return { color: "transparent", WebkitTextStroke: `0.03em ${fill.outline}`, filter: `drop-shadow(0 0 6px ${glow ?? fill.outline})` };
  return solidGlow(fill.solid, glow ?? `${fill.solid}aa`, strength);
};

const LayerView: React.FC<{ l: Layer; u: number }> = ({ l, u }) => {
  const f = useFrame30();
  const d = l.delay ?? 0;
  const local = f - d;
  const fill = l.recolor && local >= l.recolor.at ? l.recolor.fill : l.fill;
  let style: React.CSSProperties = {
    fontFamily: FONTS[l.font],
    fontWeight: l.weight ?? 700,
    fontStyle: l.italic ? "italic" : "normal",
    fontSize: u * l.size,
    lineHeight: 1.08,
    textTransform: l.upper ? "uppercase" : "none",
    ...paint(fill, l.glow, l.glowStrength ?? 1),
  };
  if (l.anim === "cycle") style = { ...style, filter: `${style.filter ?? ""} hue-rotate(${Math.max(0, local) * 9}deg)` };
  const text = l.text;
  let node: React.ReactNode;
  switch (l.anim) {
    case "track":
      node = <TrackIn delay={d} style={style}>{text}</TrackIn>;
      break;
    case "pop":
    case "cycle":
      node = <CharPop delay={d} style={style}>{text}</CharPop>;
      break;
    case "glitch":
      node = <GlitchChars delay={d} style={style}>{text}</GlitchChars>;
      break;
    case "write":
      node = <ScriptWipe delay={d} style={style}>{text}</ScriptWipe>;
      break;
    case "type": {
      const n = Math.max(0, Math.floor(local * 1.6));
      node = (
        <span style={{ ...style, whiteSpace: "pre", display: "inline-block" }}>
          {text.slice(0, n)}
          <span style={{ visibility: "hidden" }}>{text.slice(n)}</span>
        </span>
      );
      break;
    }
    case "scale":
      node = (
        <span style={{ display: "inline-block", whiteSpace: "pre", ...style, opacity: interpolate(local, [0, 3], [0, 1], clamp), scale: interpolate(local, [0, 5, 9], [2.2, 0.94, 1], clamp) }}>{text}</span>
      );
      break;
    default:
      node = (
        <span style={{ display: "inline-block", whiteSpace: "pre", ...style, opacity: interpolate(local, [0, 8], [0, 1], clamp), translate: `0 ${interpolate(local, [0, 10], [0.4, 0], { ...clamp, easing: easeOut })}em` }}>{text}</span>
      );
  }
  if (l.box) {
    const b = l.box;
    node = (
      <ChipBox delay={d - 3} style={{ background: b.bg, border: b.border, borderRadius: (b.radius ?? 0.12) * u, padding: `${(b.padY ?? 0.02) * u}px ${(b.padX ?? 0.25) * u}px`, boxShadow: b.glow ? `0 0 18px ${b.glow}` : undefined }}>
        {node}
      </ChipBox>
    );
  }
  return (
    <div style={{ alignSelf: l.align === "end" ? "flex-end" : l.align === "center" ? "center" : "flex-start", marginLeft: (l.dx ?? 0) * u, marginTop: (l.dy ?? 0) * u, position: "relative", zIndex: 1 }}>{node}</div>
  );
};

const DecoView: React.FC<{ d: Deco; u: number }> = ({ d, u }) => {
  const f = useFrame30();
  const pos = (x: number, y: number): React.CSSProperties => ({ position: "absolute", left: x * u, top: y * u });
  switch (d.kind) {
    case "swoosh":
      return <DrawPath delay={d.delay} d={`M 0 ${u * 0.3} Q ${d.w * u * 0.45} ${-(d.bend ?? 0.15) * u} ${d.w * u} 0`} width={d.w * u} height={u * 0.35} stroke={d.color} strokeWidth={u * 0.035} glow={d.color} style={pos(d.x, d.y)} />;
    case "strike":
      return <DrawPath delay={d.delay} dur={8} d={`M 0 ${u * 0.06} L ${d.w * u} 0`} width={d.w * u} height={u * 0.1} stroke={d.color} strokeWidth={u * 0.07} glow={d.color} style={pos(d.x, d.y)} />;
    case "ellipse": {
      const w = d.w * u;
      const h = d.h * u;
      return <DrawPath delay={d.delay} d={`M ${w * 0.55} 2 C ${w * 1.02} 0, ${w * 1.02} ${h - 2}, ${w * 0.5} ${h - 2} C ${-w * 0.02} ${h - 2}, ${-w * 0.02} 2, ${w * 0.6} 4`} width={w} height={h} stroke={d.color} strokeWidth={u * 0.03} glow={d.color} style={pos(d.x, d.y)} />;
    }
    case "bar": {
      const p = interpolate(f - d.delay, [0, 8], [0, 1], { ...clamp, easing: easeOut });
      return <div style={{ ...pos(d.x, d.y), width: u * 0.04, height: d.h * u * p, background: d.color, boxShadow: `0 0 10px ${d.color}` }} />;
    }
    case "phone": {
      const local = f - d.delay;
      const s = interpolate(local, [0, 4, 8], [0, 1.2, 1], clamp);
      const wob = local > 8 ? Math.sin(local * 1.6) * 10 * Math.max(0, 1 - (local - 8) / 30) : 0;
      const D = d.d * u;
      return (
        <div style={{ ...pos(d.x, d.y), width: D, height: D, borderRadius: D, background: "radial-gradient(circle at 40% 35%, #FF6B6B, #D7191C)", boxShadow: "0 0 18px #FF3B3B", scale: s, rotate: `${wob}deg`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={D * 0.6} height={D * 0.6} viewBox="0 0 24 24">
            <path fill="#fff" d="M3 14.5c5-5 13-5 18 0l-2.4 2.4c-.4.4-1 .4-1.4.1l-2.1-1.6c-.3-.2-.4-.6-.4-.9v-1.6c-2-.7-4.3-.7-6.3 0v1.6c0 .4-.1.7-.4.9l-2.1 1.6c-.4.3-1 .3-1.4-.1z" />
          </svg>
        </div>
      );
    }
  }
};

/** Hien thi 1 preset. `texts` ghi de noi dung tung lop (theo thu tu). */
export const TextPreset: React.FC<{ def: PresetDef; u?: number; texts?: string[] }> = ({ def, u = 100, texts }) => {
  const layers = def.layers.map((l, i) => (texts?.[i] !== undefined ? { ...l, text: texts[i] } : l));
  const rows: Layer[][] = [];
  for (const l of layers) {
    if (l.join && rows.length) rows[rows.length - 1].push(l);
    else rows.push([l]);
  }
  return (
  <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: def.align === "center" ? "center" : "flex-start" }}>
    {rows.map((r, i) =>
      r.length === 1 ? (
        <LayerView key={i} l={r[0]} u={u} />
      ) : (
        <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: u * 0.15, alignSelf: r[0].align === "end" ? "flex-end" : r[0].align === "center" ? "center" : "flex-start", marginLeft: (r[0].dx ?? 0) * u, marginTop: (r[0].dy ?? 0) * u }}>
          {r.map((l, k) => (
            <LayerView key={k} l={k === 0 ? { ...l, dx: 0, dy: 0, align: undefined } : l} u={u} />
          ))}
        </div>
      ),
    )}
    {(def.decos ?? []).map((d, i) => (
      <DecoView key={`d${i}`} d={d} u={u} />
    ))}
  </div>
  );
};
