import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../../../lib/fonts";

/** Phu de "chay chu tung chu": moi lan hien DUNG 1 tu dang noi, nay nhe + phat sang (phong cach preset CapCut). */
export type WbwWord = { text: string; startMs: number; endMs: number };

const Word: React.FC<{ w: WbwWord; dur: number; accent: boolean; y: number }> = ({ w, dur, accent, y }) => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 12, stiffness: 260, mass: 0.5 } });
  const out = interpolate(f, [dur - 3, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const color = accent ? "#FFE14D" : "#FFFFFF";
  const size = Math.min(118, (width * 0.8) / Math.max(3, w.text.length * 0.62));
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        textAlign: "center",
        fontFamily: FONTS.rounded,
        fontWeight: 900,
        fontSize: size,
        color,
        whiteSpace: "nowrap",
        opacity: Math.min(1, s * 1.4) * out,
        scale: interpolate(s, [0, 1], [0.6, 1]),
        translate: `0 calc(-50% + ${interpolate(s, [0, 1], [18, 0])}px)`,
        textShadow: `0 4px 10px rgba(0,0,0,0.75), 0 0 2px #000`,
        filter: `drop-shadow(0 0 10px ${color}aa) drop-shadow(0 0 26px ${color}55)`,
      }}
    >
      {w.text}
    </div>
  );
};

export const WordByWord: React.FC<{ words: WbwWord[]; y?: number; accentRe?: string }> = ({ words, y = 1350, accentRe }) => {
  const { fps } = useVideoConfig();
  const re = accentRe ? new RegExp(accentRe, "i") : null;
  return (
    <AbsoluteFill>
      {words.map((w, i) => {
        const from = Math.round((w.startMs / 1000) * fps);
        const next = words[i + 1];
        // giu tu den khi tu sau bat dau (toi da +0.6s sau khi noi xong) -> khong nhap nhay
        const endMs = Math.min(next ? next.startMs : w.endMs + 600, w.endMs + 600);
        const dur = Math.max(2, Math.round((endMs / 1000) * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none" name={`W ${w.text}`}>
            <Word w={w} dur={dur} accent={!!re && re.test(w.text)} y={y} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
