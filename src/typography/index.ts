import type React from "react";
import type { SfxCue, TypoProps } from "../lib/theme";
import { NeonGlitch, neonGlitchCues } from "./NeonGlitch";
import { PopBounce, popBounceCues } from "./PopBounce";
import { SlideMask, slideMaskCues } from "./SlideMask";
import { TypewriterHighlight, typewriterCues } from "./TypewriterHighlight";
import { ZoomPunch, zoomPunchCues } from "./ZoomPunch";

/** Danh muc hieu ung typography. Them hieu ung moi: tao file + dang ky o day. */
export const EFFECTS = {
  zoomPunch: { Component: ZoomPunch, cues: zoomPunchCues, label: "Zoom Punch (dap manh + rung)" },
  popBounce: { Component: PopBounce, cues: popBounceCues, label: "Pop Bounce 3D (nay tung tu)" },
  slideMask: { Component: SlideMask, cues: slideMaskCues, label: "Slide Mask Reveal (truot sau mat na)" },
  typewriter: { Component: TypewriterHighlight, cues: typewriterCues, label: "Typewriter + Highlight" },
  neonGlitch: { Component: NeonGlitch, cues: neonGlitchCues, label: "Neon Glitch Hologram" },
} satisfies Record<string, { Component: React.FC<TypoProps>; cues: (t: string) => SfxCue[]; label: string }>;

export type EffectName = keyof typeof EFFECTS;
