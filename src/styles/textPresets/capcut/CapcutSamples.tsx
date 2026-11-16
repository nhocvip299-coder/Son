import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { FONTS } from "../../../lib/fonts";
import { CC_PRESETS, CapcutPreset, type CcFit } from "./CapcutPreset";
import { WordByWord, type WbwWord } from "./WordByWord";

/** Ban mau chu de duyet truoc khi chen: tung preset (noi dung that) tren nen toi, co am thanh + ma so. */
export const CapcutSamples: React.FC<{
  items: Array<{ preset: string; texts?: Record<string, string>; note?: string; fit: CcFit }>;
  eachS: number;
  words?: WbwWord[];
}> = ({ items, eachS, words }) => {
  const { fps } = useVideoConfig();
  const each = Math.round(eachS * fps);
  const wordsFrom = items.length * each;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #2a2a2a 0%, #0b0b0b 70%)" }}>
      {items.map((it, i) => {
        const p = CC_PRESETS.find((x) => x.id === it.preset);
        return p ? (
          <Sequence key={i} from={i * each} durationInFrames={each} name={it.preset}>
            <CapcutPreset preset={p} texts={it.texts} fit={it.fit} />
            <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: FONTS.body, fontWeight: 600, fontSize: 36, color: "#8a9096" }}>
              Mẫu {String(i + 1).padStart(2, "0")}/{items.length} · {it.preset} · {it.note ?? ""}
            </div>
          </Sequence>
        ) : null;
      })}
      {words?.length ? (
        <Sequence from={wordsFrom} name="Chay chu tung chu">
          <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: FONTS.body, fontWeight: 600, fontSize: 36, color: "#8a9096" }}>Mẫu phụ đề chạy từng chữ</div>
          <WordByWord words={words} y={1100} accentRe="^(\d|San|Hô)" />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
