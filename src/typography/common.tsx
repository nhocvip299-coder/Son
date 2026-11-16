import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BANDS } from "../lib/safeZone";

/** Khung dat chu trong mot band an toan; tu dong mo dan + thu nho khi ket thuc. */
export const BandBox: React.FC<{
  band: "headline" | "caption" | "center";
  duration: number;
  exitFrames?: number;
  children: React.ReactNode;
}> = ({ band, duration, exitFrames = 8, children }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const b = BANDS(height);
  const area =
    band === "center"
      ? { top: b.headline.top, bottom: b.caption.bottom }
      : b[band];
  return (
    <AbsoluteFill
      style={{
        top: area.top,
        height: area.bottom - area.top,
        justifyContent: "center",
        alignItems: "center",
        opacity: interpolate(frame, [duration - exitFrames, duration], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(frame, [duration - exitFrames, duration], [1, 0.94], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.cubic),
        }),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
