import type { CSSProperties } from "react";

/**
 * Chu noi 3D: xep chong nhieu lop text-shadow lech 1px tao "khoi" (extrude),
 * cong them bong do mem xa (drop shadow) va vien (stroke) de tuong phan tren moi nen.
 */
export const extrude = (
  depth: number,
  sideColor: string,
  opts: { angleDeg?: number; shadow?: string; glow?: string } = {},
): string => {
  const a = ((opts.angleDeg ?? 135) * Math.PI) / 180;
  const dx = Math.cos(a) * -1;
  const dy = Math.sin(a);
  const layers: string[] = [];
  for (let i = 1; i <= depth; i++) {
    layers.push(`${(dx * i).toFixed(2)}px ${(dy * i).toFixed(2)}px 0 ${sideColor}`);
  }
  // bong do mem phia sau khoi chu
  layers.push(
    `${(dx * depth + 6).toFixed(1)}px ${(dy * depth + 14).toFixed(1)}px 24px ${opts.shadow ?? "rgba(0,0,0,0.55)"}`,
  );
  if (opts.glow) layers.push(`0 0 40px ${opts.glow}`);
  return layers.join(", ");
};

export const strokeStyle = (width: number, color: string): CSSProperties => ({
  WebkitTextStroke: `${width}px ${color}`,
  paintOrder: "stroke fill",
});

export const neonShadow = (color: string, intensity = 1): string =>
  [
    `0 0 ${4 * intensity}px #fff`,
    `0 0 ${10 * intensity}px ${color}`,
    `0 0 ${22 * intensity}px ${color}`,
    `0 0 ${44 * intensity}px ${color}`,
    `0 0 ${80 * intensity}px ${color}`,
  ].join(", ");

/** Lop toi nhe phia sau chu de tang tuong phan ma khong che video. */
export const scrimGradient = (strength = 0.55) =>
  `linear-gradient(180deg, rgba(0,0,0,${strength * 0.6}) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`;
