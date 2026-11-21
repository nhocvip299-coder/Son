import type { FontKey } from "./fonts";

/** Bang mau + font ma cac hieu ung typography dung chung. Nap tu styles/<id>/style.json. */
export type Theme = {
  fontHeadline: FontKey;
  fontCaption: FontKey;
  text: string; // mau mat chu
  accent: string; // mau nhan manh
  accentText: string; // mau chu khi nam tren nen accent
  extrude: string; // mau "than" khoi 3D
  stroke: string; // mau vien
  shadow: string; // bong do mem
  neon: string; // mau glow (cyberpunk)
};

export const DEFAULT_THEME: Theme = {
  fontHeadline: "impact",
  fontCaption: "body",
  text: "#FFFFFF",
  accent: "#FFD400",
  accentText: "#111111",
  extrude: "#B8860B",
  stroke: "#000000",
  shadow: "rgba(0,0,0,0.6)",
  neon: "#00E5FF",
};

/** Mot "cue" am thanh: frame tuong doi so voi luc hieu ung bat dau. */
export type SfxCue = { frame: number; sfx: SfxName; volume?: number };

export type SfxName =
  | "whoosh"
  | "swoosh-down"
  | "pop"
  | "impact"
  | "ding"
  | "riser"
  | "click"
  | "glitch"
  | "typing"
  | "sparkle"
  | "write"
  | "swish"
  | "shimmer"
  | "ring"
  | "hit"
  | "pops"
  | "blip8"
  | "shine"
  | "reverse-swish"
  | "hud"
  | "positive"
  | "tick"
  | "bubble";

export type TypoProps = {
  text: string;
  duration: number; // so frame hien thi
  theme: Theme;
  /** "center" cho canh chi co chu; "headline" khi co phu de ben duoi (tranh chong cheo). */
  band?: "center" | "headline";
};

/** Tach token, ho tro nhan manh nhieu tu: "*chieu sau*" -> moi tu deu em=true. */
export const parseEmphasis = (text: string) => {
  let on = false;
  return text
    .replace(/\|/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      let w = raw;
      let em = on;
      if (w.startsWith("*")) {
        em = true;
        on = true;
        w = w.slice(1);
      }
      const close = /\*([.,!?:;]*)$/.exec(w);
      if (close) {
        w = w.slice(0, close.index) + close[1];
        on = false;
      }
      return { word: w, em };
    })
    .filter((t) => t.word.length > 0);
};

export const stripMarks = (text: string) => text.replace(/\*/g, "").replace(/\|/g, " ");

import { useCurrentFrame, useVideoConfig } from "remotion";
/** Frame quy doi ve thang 30fps -> animation giong het nhau o 30 hay 60 FPS (60fps muot hon). */
export const useFrame30 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame * 30) / fps;
};
