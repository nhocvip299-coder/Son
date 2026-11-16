import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { FONTS } from "../../../lib/fonts";
import { CC_PRESETS, CapcutPreset } from "./CapcutPreset";

export const CC_EACH_S = 3;
/** 40 preset CapCut noi tiep, moi preset 3s, co ma so + am thanh rieng. */
export const CapcutCatalog: React.FC<{ showLabel?: boolean }> = ({ showLabel = true }) => {
  const { fps } = useVideoConfig();
  const each = Math.round(CC_EACH_S * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {CC_PRESETS.map((p, i) => (
        <Sequence key={p.id} from={i * each} durationInFrames={each} name={p.id}>
          <CapcutPreset preset={p} />
          {showLabel ? (
            <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", fontFamily: FONTS.body, fontWeight: 600, fontSize: 34, color: "#7d8288" }}>
              {String(i + 1).padStart(2, "0")} / 40 · {p.id}
            </div>
          ) : null}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
