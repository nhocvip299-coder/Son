import React from "react";
import { AbsoluteFill } from "remotion";
import { CC_PRESETS, CapcutPreset } from "./CapcutPreset";

/** Dat preset vao dung o do tu video mau (de so sanh do bong/font o do phan giai goc). */
export const CapcutPageCompare: React.FC<{ cells: Record<string, { cx: number; cy: number; width: number; maxHeight: number }>; k: number }> = ({ cells, k }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {Object.entries(cells).map(([id, c]) => {
      const p = CC_PRESETS.find((x) => x.id === id);
      return p ? <CapcutPreset key={id} preset={p} withAudio={false} fit={{ cx: c.cx * k, cy: c.cy * k, width: c.width * k, maxHeight: c.maxHeight * k }} /> : null;
    })}
  </AbsoluteFill>
);
