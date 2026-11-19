/**
 * Render preset CapCut (du lieu that tu Presets.zip -> capcut_presets.json) bang Remotion.
 * Lay dung: van ban, co chu, mau, gian chu, bong, vi tri/ti le/xoay, thoi diem, animation (theo ten),
 * hieu ung "Phat sang" (theo tham so), am thanh (ten + thoi diem).
 * Uoc doan: font (CapCut chi luu ma so -> anh xa sang font mien phi co tieng Viet), hinh dang animation tu ten.
 */
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, random, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";
import { FONTS } from "../../../lib/fonts";
import { useFrame30 } from "../../../lib/theme";
import DATA from "../capcut_presets.json";
import { measureText } from "@remotion/layout-utils";
import { useFontsReady } from "../../../lib/useFit";
import { CC_SHAPES, ShapeLayer } from "./shapes";

export type CcLayer = (typeof DATA)[number]["layers"][number];
export type CcPreset = (typeof DATA)[number];
export const CC_PRESETS = DATA as CcPreset[];

/** He so doi "co chu CapCut" -> px tren khung 1080 rong (hieu chinh tu anh bia). */
export const CC_SIZE_K = 5.1;

/** Anh xa font: ten file / ma thu vien CapCut -> font mien phi co tieng Viet [UD, doi chieu anh bia]. */
const FONT_MAP: Record<string, { family: string; weight: number; italic?: boolean; spacing?: number; k?: number }> = {
  "UTM-Impact": { family: FONTS.impact, weight: 400 },
  SnellRoundhand: { family: FONTS.elegant, weight: 400, k: 0.8 },
  "ZYVNA Serendipity": { family: FONTS.elegant, weight: 400, k: 0.8 },
  "1FTVVIPClashGrotesk-LightIta": { family: FONTS.grotesk, weight: 300, italic: true },
  "PublicSans-Italic": { family: FONTS.grotesk, weight: 300, italic: true },
  "DTPhudu-Black": { family: FONTS.geo, weight: 900 },
  "1FTV-VIP-Russo-One": { family: FONTS.tech, weight: 700 },
  "SF-Pro-Display-Medium": { family: FONTS.body, weight: 500 },
  Helvetica: { family: FONTS.body, weight: 500 },
  Constane: { family: FONTS.serif, weight: 500, k: 0.88 },
  LFAXDI: { family: FONTS.body, weight: 700 },
  "Montserrat-Bold": { family: FONTS.geo, weight: 800 },
  "cc:7546119100993473793": { family: FONTS.times, weight: 400, k: 0.82 }, // serif manh kieu Times: trung tam dac dia, Trai nghiem, Edit video
  "cc:7569930061634080001": { family: FONTS.condensed, weight: 700 }, // dam hep: Can Than, KOKI TRENDY
  "cc:7582814327179201808": { family: FONTS.elegant, weight: 400, k: 0.8 }, // viet tay manh: Tiet kiem, Dang song
  "cc:7563907294598024449": { family: FONTS.elegant, weight: 400, k: 0.8 }, // viet tay: Tinh hoa, Sinh loi
  "cc:7652286612683967760": { family: FONTS.elegant, weight: 400, k: 0.8 }, // dong, Sang trong
  "cc:7533525380490136849": { family: FONTS.elegant, weight: 400, k: 0.8 }, // voi moi khach hang
  "cc:7542214368361057553": { family: FONTS.rounded, weight: 900 }, // tron dam: Dau tu, Dang Ky
  "cc:7541311300924755201": { family: FONTS.rounded, weight: 900 }, // Bi quyet, "Khoa hoc"
  "cc:7533523458274151681": { family: FONTS.rounded, weight: 800 }, // Noi Bat, Ban Than
  "cc:7482754464508693766": { family: FONTS.geo, weight: 900 }, // Hien Dai
  "cc:7483067663439219973": { family: FONTS.condensed, weight: 700 }, // Am Thuc, CAN HO CAO CAP
  "cc:7479031431440665862": { family: FONTS.body, weight: 600 }, // is calling
};
const fontOf = (key: string) => FONT_MAP[key] ?? { family: FONTS.body, weight: 700 };

/** Ten SFX CapCut -> SFX tu tong hop (public/sfx). Thoi diem lay dung tu du lieu. */
const SFX_MAP: Array<[RegExp, string]> = [
  [/positive/i, "positive"],
  [/shine|glitter|kirarin|star/i, "shine"],
  [/coin/i, "coin"],
  [/reverse swish/i, "reverse-swish"],
  [/swish|knife|sword/i, "swish"],
  [/transitions sfx|transition/i, "whoosh"],
  [/pops? up|bubble|冒泡|water|drop/i, "pops"],
  [/telop|appear/i, "pop"],
  [/glitch/i, "glitch"],
  [/8bit/i, "blip8"],
  [/game/i, "game"],
  [/hud/i, "hud"],
  [/mouse|click/i, "mouse"],
  [/flat/i, "flat"],
  [/phone|answer/i, "ring"],
  [/paper|page/i, "paper"],
];
/** Am luong SFX: CapCut luu muc thap (0.2-0.4) vi tron voi nhac; giong noi video BDS rat to -> nang len de nghe ro. */
export const sfxGain = (v: number) => Math.min(1, Math.max(0.55, v * 2.6));
export const sfxFor = (name: string) => SFX_MAP.find(([r]) => r.test(name))?.[1] ?? "pop";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const eo = Easing.bezier(0.16, 1, 0.3, 1);
const PER_CHAR = /manifest|letter|sóng nảy|nâng ngẫu nhiên|catch up|gộp|từng từ|script|cursive|wisp/i;

/** Style chuyen dong tu ten animation CapCut. p: 0..1 tien trinh; i/n: ky tu thu i trong n. */
const animStyle = (name: string, p: number, i = 0, n = 1, seed = ""): React.CSSProperties => {
  const k = n > 1 ? Math.min(1, Math.max(0, p * 1.6 - (i / n) * 0.6)) : p; // so le theo ky tu
  const e = eo(k);
  const n_ = name.toLowerCase();
  if (/manifest|letter fade|text fade/.test(n_)) return { opacity: e, filter: `blur(${(1 - e) * 8}px)`, scale: 1 + (1 - e) * 0.25 };
  if (/letter reveal/.test(n_)) return { opacity: k > 0 ? 1 : 0, clipPath: `inset(0 ${(1 - e) * 100}% 0 0)` };
  if (/floating line|slide up|slide & rise|bobbing|drift/.test(n_)) return { opacity: e, translate: `0 ${(1 - e) * 0.6}em` };
  if (/slide down/.test(n_)) return { opacity: e, translate: `0 ${-(1 - e) * 0.6}em` };
  if (/smooth slide|trượt vào|tiếp xúc bên phải|gộp bên phải/.test(n_)) return { opacity: e, translate: `${(1 - e) * 1.2}em 0` };
  if (/tiếp xúc bên trái|catch up/.test(n_)) return { opacity: e, translate: `${-(1 - e) * 1.2}em 0` };
  if (/3d glide/.test(n_)) return { opacity: e, transform: `perspective(600px) rotateY(${(1 - e) * 70}deg)`, translate: `${(1 - e) * 0.8}em 0` };
  if (/lật|flip/.test(n_)) return { opacity: e, transform: `perspective(600px) rotateX(${(1 - e) * 90}deg)` };
  if (/fold|unfold/.test(n_)) return { opacity: e, scale: `1 ${e}` };
  if (/tăng trưởng/.test(n_)) return { opacity: e, scale: `${0.2 + 0.8 * e}`, transformOrigin: "50% 100%" };
  if (/thu nhỏ|loud emphasis|loại 2/.test(n_)) return { opacity: e, scale: 1 + (1 - e) * 1.2 };
  if (/rebound|spring|slingshot|sóng nảy/.test(n_)) {
    const b = 1 - Math.cos(k * Math.PI * 2.5) * Math.exp(-k * 5);
    return { opacity: Math.min(1, k * 4), translate: `0 ${(1 - b) * 0.5}em` };
  }
  if (/nhiễu sóng|glitch/.test(n_)) return { opacity: k > 0 ? (random(`${seed}${Math.floor(p * 30)}`) > 0.3 || k > 0.8 ? 1 : 0.2) : 0, translate: `${k < 0.8 ? (random(`x${seed}${Math.floor(p * 30)}`) - 0.5) * 0.3 : 0}em 0` };
  if (/từng từ quay/.test(n_)) return { opacity: e, rotate: `${(1 - e) * -90}deg` };
  if (/nâng ngẫu nhiên/.test(n_)) return { opacity: e, translate: `0 ${(1 - e) * (0.3 + random(seed + i) * 0.8)}em` };
  if (/script|cursive/.test(n_)) return { clipPath: `inset(-30% ${(1 - e) * 100}% -30% 0)` };
  return { opacity: e };
};

const shadowCss = (l: CcLayer, px: number): string | undefined => {
  const sh = (l.styles[0] as { shadows?: Array<{ color: { solid?: string } | null; diffuse: number; distance: number; angle: number }> }).shadows;
  if (!sh?.length) return undefined;
  return sh
    .map((s) => {
      const a = (s.angle * Math.PI) / 180;
      const d = s.distance * px * 0.02;
      return `${(Math.cos(a) * d).toFixed(1)}px ${(-Math.sin(a) * d).toFixed(1)}px ${(s.diffuse * px * 6).toFixed(1)}px ${s.color?.solid ?? "#000"}`;
    })
    .join(", ");
};

const LayerView: React.FC<{ l: CcLayer; glow: { size: number; lum: number } | null; text?: string; idx: number; hasTwin: boolean; twin?: CcLayer; glowK?: number }> = ({ l, glow, text, idx, hasTwin, twin, glowK = 1 }) => {
  const f = useFrame30();
  const { width, height } = useVideoConfig();
  const t = f / 30 - l.start;
  if (t < 0 || t > l.duration) return null;
  // lop phu (co mask) dung dung font + co cua lop goc de chong khit (font thay the co do rong khac nhau)
  const st = twin && (l as { mask?: unknown }).mask ? { ...l.styles[0], font: twin.styles[0].font, size: twin.styles[0].size } : l.styles[0];
  const fm = fontOf(st.font || l.font);
  const px = (st.size ?? l.fontSize ?? 15) * CC_SIZE_K * (fm.k ?? 1) * (width / 1080);
  const color = (st.fill as { solid?: string } | null)?.solid ?? l.color ?? "#fff";
  const content = text ?? l.text;
  const inAnims = l.animations.filter((a) => a.type === "in");
  const outAnims = l.animations.filter((a) => a.type === "out");
  // hieu ung phat sang (Phat sang 2 / Glow 2): drop-shadow cung mau, do lon theo tham so
  // "Phat sang 2": quang sang rong cung mau + loi sang (hieu chinh tren video quay man hinh CapCut)
  // glowK < 1 = che do NET (chen len video): quang sang gon hon, khong day sang chay mau, them vien toi mong giu canh chu
  const g = glow
    ? glowK < 1
      ? `drop-shadow(0 2px 1.5px rgba(0,0,0,0.75)) drop-shadow(0 0 ${(glow.size * 30 * glowK).toFixed(1)}px ${color}cc) drop-shadow(0 0 ${(glow.size * 90 * glowK).toFixed(1)}px ${color}66)`
      : `drop-shadow(0 0 ${(glow.size * 45).toFixed(1)}px ${color}) drop-shadow(0 0 ${(glow.size * 110).toFixed(1)}px ${color}bb) drop-shadow(0 0 ${(glow.size * 220).toFixed(1)}px ${color}55) brightness(${1 + glow.lum * 0.8})`
    : glowK < 1 ? "drop-shadow(0 2px 1.5px rgba(0,0,0,0.75))" : "";
  const outP = outAnims.length ? interpolate(t, [l.duration - outAnims[0].duration, l.duration], [1, 0], clamp) : 1;
  // nghieng theo du lieu (italic_degree, mac dinh 10 do khi style italic) -> skew giong CapCut
  const italicDeg = (st as { italic?: boolean }).italic || (l.italicDegree ?? 0) > 0 ? (l.italicDegree || 10) : 0;
  const textStyle: React.CSSProperties = {
    fontFamily: fm.family,
    fontWeight: fm.weight,
    fontStyle: fm.italic ? "italic" : "normal",
    fontSize: px,
    color,
    letterSpacing: `${l.letterSpacing ?? 0}em`,
    lineHeight: 1 + (l.lineSpacing ?? 0),
    whiteSpace: "pre",
    textShadow: shadowCss(l, px),
    transform: italicDeg ? `skewX(${-italicDeg}deg)` : undefined,
    opacity: (l.alpha ?? 1) * (l.opacity ?? 1) * outP,
  };
  const perChar = inAnims.find((a) => PER_CHAR.test(a.name));
  const whole = inAnims.filter((a) => a !== perChar);
  let wholeStyle: React.CSSProperties = {};
  for (const a of whole) {
    const p = interpolate(t, [a.start, a.start + Math.max(0.05, a.duration)], [0, 1], clamp);
    wholeStyle = { ...wholeStyle, ...animStyle(a.name, p, 0, 1, `${idx}`) };
  }
  let body: React.ReactNode = content;
  if (perChar) {
    const p = interpolate(t, [perChar.start, perChar.start + Math.max(0.05, perChar.duration)], [0, 1], clamp);
    const chars = [...content];
    body = chars.map((c, i) => (
      <span key={i} style={{ display: "inline-block", ...animStyle(perChar.name, p, i, chars.length, `${idx}-${i}`) }}>
        {c}
      </span>
    ));
  }
  // Mask "Filmstrip" cua clip ghep: chi hien mot dai cheo co vien mo -> vet sang/chuyen mau [XM tham so, UD cach ve]
  // chi ap mask cho lop "phu" co lop chu goc trung noi dung (tranh cat mat lop chu chinh)
  const mk = hasTwin ? (l as { mask?: { height: number; feather: number; rotation: number; centerY: number } }).mask : undefined;
  const maskCss = mk
    ? (() => {
        const h = (mk.height * height) / 2 / Math.max(0.2, l.scale);
        const fe = mk.feather * px * 0.9;
        const g = `linear-gradient(${180 + mk.rotation}deg, transparent calc(50% - ${h + fe}px), #000 calc(50% - ${h}px), #000 calc(50% + ${h}px), transparent calc(50% + ${h + fe}px))`;
        return { WebkitMaskImage: g, maskImage: g } as React.CSSProperties;
      })()
    : {};
  return (
    <div
      style={{
        position: "absolute",
        left: width / 2 + (l.x * width) / 2,
        top: height / 2 - (l.y * height) / 2,
        translate: "-50% -50%",
        // lat bang scale -1 (khong phong to) ; phong to bang zoom -> chu duoc dan trang lai o co that, khong nhoe
        scale: (l as { flipH?: boolean }).flipH || (l as { flipV?: boolean }).flipV ? `${(l as { flipH?: boolean }).flipH ? -1 : 1} ${(l as { flipV?: boolean }).flipV ? -1 : 1}` : undefined,
        rotate: `${l.rotation}deg`,
      }}
    >
      <div style={{ zoom: l.scale, filter: g || undefined, textAlign: l.alignment === 0 ? "left" : l.alignment === 2 ? "right" : "center" }}>
        <div style={{ ...textStyle, ...wholeStyle, ...maskCss }}>{body}</div>
      </div>
    </div>
  );
};

/** Khung bao cac lop chu o trang thai cuoi (px tren khung). Do bang measureText voi font thay the. */
const useUnionBox = (preset: CcPreset, texts?: Record<string, string>) => {
  const ready = useFontsReady();
  const { width, height } = useVideoConfig();
  if (!ready) return null;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const l of preset.layers) {
    const st = l.styles[0];
    const fm = fontOf(st.font || l.font);
    const px = (st.size ?? l.fontSize ?? 15) * CC_SIZE_K * (fm.k ?? 1) * (width / 1080);
    const m = measureText({ text: texts?.[l.text] ?? l.text, fontFamily: fm.family, fontSize: px, fontWeight: String(fm.weight), letterSpacing: `${l.letterSpacing ?? 0}em`, validateFontIsLoaded: false });
    const w = m.width * l.scale;
    const h = px * 1.05 * l.scale;
    const cx = width / 2 + (l.x * width) / 2;
    const cy = height / 2 - (l.y * height) / 2;
    x0 = Math.min(x0, cx - w / 2); x1 = Math.max(x1, cx + w / 2);
    y0 = Math.min(y0, cy - h / 2); y1 = Math.max(y1, cy + h / 2);
  }
  return { x0, x1, y0, y1 };
};

export type CcFit =
  | "cover" // khop khung bao anh bia CapCut (de doi chieu)
  | "none"
  | { cx: number; cy: number; width: number; maxHeight?: number }; // dat vao vung (px) khi chen video

/** Mot preset CapCut. `texts`: thay noi dung theo van ban goc, vd { "Bat dong san": "Nha pho" }. */
export const CapcutPreset: React.FC<{ preset: CcPreset; texts?: Record<string, string>; withAudio?: boolean; fit?: CcFit; children?: React.ReactNode; glowK?: number }> = ({ preset, texts, withAudio = true, fit = "cover", children, glowK = 1 }) => {
  const { fps } = useVideoConfig();
  const box = useUnionBox(preset, texts);
  let fitStyle: React.CSSProperties = {};
  if (box && fit !== "none") {
    const target =
      fit === "cover"
        ? (() => {
            const cb = (preset as { coverBox?: number[] | null }).coverBox;
            return cb ? { cx: (cb[0] + cb[1]) / 2, cy: (cb[2] + cb[3]) / 2, width: cb[1] - cb[0], maxHeight: cb[3] - cb[2] } : { cx: 540, cy: 960, width: 900 };
          })()
        : fit;
    const bw = box.x1 - box.x0, bh = box.y1 - box.y0;
    let k = target.width / bw;
    if (target.maxHeight) k = Math.min(k, (target.maxHeight / bh) * 1.15);
    const bcx = (box.x0 + box.x1) / 2, bcy = (box.y0 + box.y1) / 2;
    // zoom (dan trang lai o co dich) thay cho transform scale -> chu sac net; dich bang translate thuan
    fitStyle = { zoom: k, transform: `translate(${(target.cx - bcx * k) / k}px, ${(target.cy - bcy * k) / k}px)` };
  }
  // khoi hinh do theo toa do anh bia -> dua ve vung dich bang cung phep bien doi coverBox -> target
  const cb = (preset as { coverBox?: number[] | null }).coverBox;
  let shapeStyle: React.CSSProperties = {};
  if (cb && fit !== "cover" && fit !== "none") {
    const ccx = (cb[0] + cb[1]) / 2, ccy = (cb[2] + cb[3]) / 2, k2 = fit.width / (cb[1] - cb[0]);
    shapeStyle = { transformOrigin: `${ccx}px ${ccy}px`, transform: `translate(${fit.cx - ccx}px, ${fit.cy - ccy}px) scale(${k2})` };
  }
  const shapes = CC_SHAPES[preset.id];
  const ge = preset.effects.find((e) => /phát sáng|glow/i.test(e.name ?? ""));
  const param = (k: string) => (ge?.params as Array<[string, number]> | undefined)?.find((x) => x[0] === k)?.[1];
  const glow = ge ? { size: param("effects_adjust_size") ?? 0.2, lum: param("effects_adjust_luminance") ?? 0.2 } : null;
  return (
    <AbsoluteFill>
      {shapes ? (
        <AbsoluteFill style={shapeStyle}>
          <ShapeLayer shapes={shapes} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={fitStyle}>
        {preset.layers.map((l, i) => (
          <LayerView key={i} idx={i} l={l} glow={glow} glowK={glowK} text={texts?.[l.text]} hasTwin={preset.layers.some((o, j) => j !== i && o.text.toLowerCase() === l.text.toLowerCase() && !(o as { mask?: unknown }).mask)}
            twin={preset.layers.find((o, j) => j !== i && o.text.toLowerCase() === l.text.toLowerCase() && !(o as { mask?: unknown }).mask && Math.abs(o.x - l.x) < 0.02 && Math.abs(o.y - l.y) < 0.02)} />
        ))}
        {children}
      </AbsoluteFill>
      {withAudio
        ? preset.audio.map((a, i) => (
            <Sequence key={`a${i}`} from={Math.round(a.start * fps)} durationInFrames={Math.max(1, Math.round(a.duration * fps))} layout="none">
              <Audio src={staticFile(`sfx/${sfxFor(a.name ?? "")}.wav`)} volume={sfxGain(a.volume ?? 0.4)} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
