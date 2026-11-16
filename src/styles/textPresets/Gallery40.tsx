import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { MusicBed, SfxTrack } from "../../compositions/shared";
import { FONTS } from "../../lib/fonts";
import type { SfxCue } from "../../lib/theme";
import { TextPreset, presetCues } from "./engine";
import { PRESETS40 } from "./presets40";

const PAGE_S = 3.2;
const Panel: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 0%, #3a1406 0%, #120604 55%, #070302 100%)" }} />
    <div style={{ position: "absolute", left: 40, right: 40, top: 200, bottom: 220, borderRadius: 28, border: "3px solid #E2531F", background: "#050505", boxShadow: "0 0 40px #E2531F55" }} />
  </>
);

/** 4 trang x 10 preset, cot trai/phai xen ke, moi preset tre ~2.5 frame (nhu video mau). */
export const TextPresetsGallery40: React.FC = () => {
  const { fps } = useVideoConfig();
  const page = Math.round(PAGE_S * fps);
  const f30 = (n: number) => Math.round((n * fps) / 30);
  const cues: SfxCue[] = [0, 1, 2, 3].flatMap((p) => [
    { frame: p * page, sfx: "hit" as const, volume: 0.55 },
    { frame: p * page + f30(2), sfx: "whoosh" as const, volume: 0.25 },
  ]);
  return (
    <AbsoluteFill>
      <Panel />
      {[0, 1, 2, 3].map((p) => (
        <Sequence key={p} from={p * page} durationInFrames={page} name={`Trang ${"ABCD"[p]}`}>
          {PRESETS40.slice(p * 10, p * 10 + 10).map((def, i) => {
            // thu tu doc cua video mau: xen ke trai / phai theo tung hang
            const colIdx = i % 2;
            const row = Math.floor(i / 2);
            return (
              <Sequence key={def.id} from={f30((row * 2 + colIdx) * 2.5)} layout="none" name={def.id}>
                <div style={{ position: "absolute", left: colIdx ? 565 : 80, top: 250 + row * 285 }}>
                  <TextPreset def={def} u={74} />
                </div>
              </Sequence>
            );
          })}
        </Sequence>
      ))}
      <MusicBed src="music/bed-ambient.wav" volume={0.3} />
      <SfxTrack cues={cues} />
    </AbsoluteFill>
  );
};

/** Catalog: tung preset rieng le, co am thanh rieng va ma so de chon. */
export const CATALOG_S = 1.8;
export const TextPresetsCatalog40: React.FC = () => {
  const { fps } = useVideoConfig();
  const each = Math.round(CATALOG_S * fps);
  const f30 = (n: number) => Math.round((n * fps) / 30);
  const cues: SfxCue[] = PRESETS40.flatMap((def, i) => presetCues(def).map((c) => ({ ...c, frame: i * each + f30(c.frame) })));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1a1a1a, #050505 70%)" }}>
      {PRESETS40.map((def, i) => (
        <Sequence key={def.id} from={i * each} durationInFrames={each} name={def.id}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <TextPreset def={def} u={120} />
          </AbsoluteFill>
          <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: FONTS.body, fontWeight: 600, fontSize: 34, color: "#9aa0a6" }}>
            {String(i + 1).padStart(2, "0")} / 40 · {def.id}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1450, textAlign: "center", fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, color: "#6f757b" }}>Dùng cho: {def.use}</div>
        </Sequence>
      ))}
      <SfxTrack cues={cues} />
    </AbsoluteFill>
  );
};
