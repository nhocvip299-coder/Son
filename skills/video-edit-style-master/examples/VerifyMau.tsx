import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { SfxTrack } from "../../../src/compositions/shared";
import type { SfxCue } from "../../../src/lib/theme";
import { PersonFront, GlassPage, GoldNumber, LightBurst, MapRoute, NeonTitle, PriceDrop, StripSlide, TealOrange, ThinBig, ZoomBlurOut, VESM_SFX } from "../components";

/**
 * KIỂM CHỨNG: dựng lại 0–22,5 s của reference/mau.mp4 bằng component của skill, cùng mốc thời gian (căn theo phiên âm).
 * Nền = khung SẠCH (chưa có chữ) của mẫu đóng băng -> so typography/vị trí/nhịp với mẫu. Chỉ dùng nội bộ, không xuất bản.
 */
export const VERIFY_SEC = 22.5;
const SRC = "inputs/vesm/mau.mp4";
type S = SfxCue["sfx"];
const CUES: Array<[number, S, number]> = [
  [2.2, VESM_SFX.type as S, 0.7], [5.25, VESM_SFX.count as S, 0.6], [5.4, VESM_SFX.count as S, 0.6], [5.55, VESM_SFX.count as S, 0.6], [5.85, VESM_SFX.land as S, 0.8],
  [7.4, VESM_SFX.type as S, 0.7], [8.5, VESM_SFX.burst as S, 1], [10.45, VESM_SFX.whoosh as S, 0.7], [11.6, VESM_SFX.land as S, 1],
  [14.1, VESM_SFX.burst as S, 1], [15.5, VESM_SFX.type as S, 0.7], [17.05, VESM_SFX.soft as S, 0.8], [18.1, VESM_SFX.page as S, 1], [21.3, VESM_SFX.land as S, 1], [22.2, VESM_SFX.whoosh as S, 1],
];
export const VerifyMau: React.FC<{ voice?: boolean }> = ({ voice = true }) => {
  const { fps } = useVideoConfig();
  const s = (x: number) => Math.round(x * fps);
  const Seq: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => <Sequence from={s(a)} durationInFrames={s(b - a)}>{children}</Sequence>;
  const Plate = () => <Freeze frame={s(1.0)}><OffthreadVideo src={staticFile(SRC)} muted /></Freeze>;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TealOrange k={0.5}><Plate /></TealOrange>
      <Seq a={2.2} b={4.3}><NeonTitle id="v1" main="Khu nhà giá rẻ" script="cho cả nhà" cy={778} size={170} /></Seq>
      <Seq a={4.3} b={6.5}><GoldNumber id="v2" lead="Rẻ hơn trước tới" value={300} unit="TRIỆU" cy={720} size={220} at={0.7} countDur={0.45} /></Seq>
      <Seq a={6.6} b={8.5}><GoldNumber id="v3" lead="Giá trước đây" leadScript tone="white" value={2.85} dec={2} unit="TỶ" cy={1120} size={190} at={0.85} countDur={0.4} /></Seq>
      <Seq a={8.5} b={14.1}><GlassPage src={SRC} from={7.0} /></Seq>
      <Seq a={8.5} b={14.1}><PriceDrop lead="Hôm nay" script="chủ đại hạ giá" oldPrice="2,85 TỶ" strikeAt={1.9} mid="giảm còn" from={2.85} to={2.55} unit="TỶ" newAt={3.05} /></Seq>
      <Seq a={14.1} b={17.0}><NeonTitle id="v4" lead="Vị trí nhà chỉ cách" main="Chợ Bình Chánh" cy={800} size={150} at={1.35} /></Seq>
      <Seq a={17.0} b={18.1}><ThinBig value="3KM" lead="chỉ cách" cy={1085} size={420}
        front={<Freeze frame={0}><PersonFront matte="inputs/vesm/matte-plate/person.webm" filter="contrast(1.03) saturate(1.06)" /></Freeze>} /></Seq>
      <Seq a={18.1} b={22.5}><ZoomBlurOut dur={0.35}><MapRoute place="Chợ Bình Chánh" dest="Khu nhà" dist="3 KM" lead="Từ chợ Bình Chánh" script="chỉ vài phút" /></ZoomBlurOut></Seq>
      <Seq a={18.1} b={18.7}><StripSlide><TealOrange k={0.5}><Plate /></TealOrange></StripSlide></Seq>
      {[8.5, 14.1].map((a) => <Seq key={a} a={a - 0.18} b={a + 0.42}><LightBurst /></Seq>)}
      {voice ? <Audio src={staticFile(SRC)} volume={0.9} /> : null}
      <SfxTrack cues={CUES.map(([t, sfx, v]) => ({ frame: s(t), sfx, volume: v }))} />
    </AbsoluteFill>
  );
};
