import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { TextTheme, GlassCard, GlassPage, GoldNumber, LightBurst, NeonTitle, PersonFront, PhonePill, PriceDrop, TealOrange, ThinBig, VESM_SFX } from "../../../skills/video-edit-style-master/components";
import { alignCues } from "../../../skills/video-edit-style-master/presets/style";
import { CompareBars, FloorStack, SitePlan, XeKhe } from "../bdsLuxury/explain";
import { KxMap } from "../bdsLuxury/mauKinhXanh";

/**
 * SB-145 Vinhomes Ocean Park 2 — dựng theo skill Video Edit Style Master.
 * Cue chọn theo tư duy editor (pickCue + editor-thinking.md), mốc = đầu từ khoá trong work/du-an-3/words.json.
 * Bùng sáng ở ranh giới chủ đề: 12,2 (đường) · 26,2 (thông số) · 43,45 (giá) · 72,0 (CTA). Không phụ đề.
 */
export const SB145_SEC = 83;
const SRC = "inputs/du-an-3/goc-1080-hq.mp4";
const MATTE = "inputs/du-an-3/matte60/person.webm";
const GRADE = "contrast(1.03) saturate(1.06)";
const X = VESM_SFX;
const CUES: Array<[number, string, number]> = [
  [0.05, X.count, 0.6], [0.2, X.count, 0.6], [0.35, X.count, 0.6], [0.55, X.land, 1],
  [3.2, X.type, 0.7], [5.6, X.type, 0.7], [8.2, X.type, 0.7], [10.5, X.type, 0.7],
  [12.2, X.burst, 1], [15.95, X.soft, 0.9], [23.0, X.soft, 0.9], [25.7, X.type, 0.7],
  [26.2, X.burst, 1], [26.4, X.page, 0.8], [29.7, X.soft, 0.8], [33.3, X.page, 0.8], [33.7, X.chip, 0.9], [34.2, X.chip, 0.9], [37.2, X.type, 0.8], [41.3, X.type, 0.8],
  [43.45, X.burst, 1], [43.6, X.page, 0.8], [45.8, X.whoosh, 0.8], [48.4, X.land, 1],
  [49.3, X.page, 0.8], [49.8, X.type, 0.8], [52.5, X.land, 0.9], [60.3, X.page, 0.8], [62.3, X.type, 0.8], [64.7, X.land, 1], [58.9, X.count, 0.6], [59.05, X.count, 0.6], [59.2, X.count, 0.6], [59.4, X.land, 1],
  [66.0, X.page, 0.8], [68.5, X.chip, 0.9], [68.8, X.chip, 0.9], [70.0, X.chip, 0.9],
  [72.0, X.burst, 1], [73.9, X.land, 1], [79.0, X.chip, 1], [79.3, X.land, 1],
];

export const Sb145Vesm: React.FC<{ stem?: "all" | "sfx" | "voice" }> = ({ stem = "all" }) => {
  const { fps } = useVideoConfig();
  const s = (x: number) => Math.round(x * fps);
  const Seq: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => <Sequence from={s(a)} durationInFrames={s(b - a)}>{children}</Sequence>;
  const front = (a: number) => <PersonFront matte={MATTE} from={a} filter={GRADE} />;
  return (
    <TextTheme value="aqua"><AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TealOrange k={0.6}>
        <Sequence durationInFrames={s(81.1)}><OffthreadVideo src={staticFile(SRC)} muted={stem === "sfx"} volume={stem === "sfx" ? 0 : 1} /></Sequence>
        <Sequence from={s(81.1)}><Freeze frame={s(81.1) - 2}><OffthreadVideo src={staticFile(SRC)} muted /></Freeze></Sequence>
      </TealOrange>

      {/* HOOK: giá tiền -> số vàng đếm chạy */}
      <Seq a={0} b={2.65}><GoldNumber id="g0" lead="một mét vuông đất · chỉ" value={70} unit="TRIỆU" cy={520} size={210} at={0.05} countDur={0.45} /></Seq>
      {/* TRÁM: cảnh quay thật mặt tiền SB-145 (giây 31 của video gốc) khi nói "căn shophouse 2 mặt tiền" */}
      <Seq a={2.7} b={6.9}><TealOrange k={0.6}><OffthreadVideo src={staticFile(SRC)} trimBefore={s(31.0)} muted /></TealOrange></Seq>
      {/* đặc điểm -> neon */}
      <Seq a={3.0} b={5.5}><NeonTitle id="n1" lead="Ngay tại Vinhomes" main="Ocean Park 2" cy={520} size={170} at={0.2} /></Seq>
      <Seq a={5.5} b={8.1}><NeonTitle id="n2" lead="căn shophouse sở hữu" main="2 Mặt Tiền" script="trước – sau" cy={520} size={180} at={0.1} /></Seq>
      <Seq a={8.1} b={10.4}><NeonTitle id="n3" lead="so với đất thổ cư" main="Văn Giang" cy={520} size={180} at={0.1} /></Seq>
      <Seq a={10.4} b={12.2}><NeonTitle id="n4" lead="vị trí tương đương" main="Không căn nào" script="sánh được" cy={520} size={160} at={0.1} /></Seq>

      {/* ĐƯỜNG: số mảnh SAU LƯNG người */}
      <Seq a={12.0} b={12.6}><LightBurst /></Seq>
      <Seq a={15.9} b={17.7}><ThinBig value="20M" lead="trục đường rộng" cy={700} size={420} front={front(15.9)} /></Seq>
      <Seq a={22.9} b={25.6}><ThinBig value="7M" lead="mặt đường bên này" cy={690} size={440} front={front(22.9)} /></Seq>
      <Seq a={25.6} b={26.3}><NeonTitle id="n5" lead="vỉa hè" main="4 mét" cy={520} size={170} at={0.05} /></Seq>

      {/* THÔNG SỐ (cảnh toà nhà, không người) */}
      <Seq a={26.0} b={26.6}><LightBurst /></Seq>
      <Seq a={26.3} b={33.2}><GlassPage src={SRC} from={26.3} ring={false} /></Seq>
      <Seq a={26.3} b={29.7}><SitePlan area={163.8} /></Seq>
      <Seq a={29.6} b={33.2}><FloorStack total={427.2} /></Seq>
      <Seq a={33.2} b={35.3}><GlassPage src={SRC} from={33.2} ring={false} /></Seq>
      <Seq a={33.2} b={35.3}><GlassCard src={SRC} from={33.2} title="Bàn giao" chips={["Nhà thô", "Có thang"]} chipsAt={0.5} /></Seq>
      <Seq a={35.2} b={40.8}><GlassPage src={SRC} from={35.2} ring={false} /></Seq>
      <Seq a={35.2} b={40.8}><XeKhe /></Seq>
      <Seq a={35.2} b={40.8}><NeonTitle id="n9" lead="đặc biệt bên hông" main="Xẻ khe 3M" cy={330} size={150} at={2.0} /></Seq>
      <Seq a={41.1} b={43.5}><NeonTitle id="n10" lead="cái điều" main="Đặc biệt nhất" cy={520} size={170} at={0.2} /></Seq>

      {/* GIÁ: trang kính + hạ giá */}
      <Seq a={43.45} b={49.2}><GlassPage src={SRC} from={43.45} /></Seq>
      <Seq a={43.45} b={49.2}><PriceDrop lead="mức giá căn SB-145" script="áp voucher 30%" oldPrice="23,3 TỶ" strikeAt={2.35} mid="chỉ về hơn" from={23.3} to={15} dec={0} unit="TỶ" newAt={4.95} /></Seq>
      <Seq a={43.25} b={43.85}><LightBurst /></Seq>
      <Seq a={49.2} b={53.3}><KxMap pinLabel="SB-145" towerLabel="MASTERI" towerAt={3.3} /></Seq>
      <Seq a={49.2} b={53.3}><NeonTitle id="n11" lead="vị trí" main="Cực kỳ đắc địa" cy={330} size={150} at={0.6} /></Seq>
      <Seq a={55.3} b={60.1}><GoldNumber id="g1" lead="bóc tách giá xây dựng · chỉ khoảng" value={70} unit="TRIỆU/M²" cy={500} size={180} at={3.55} countDur={0.5} /></Seq>
      <Seq a={60.2} b={66.0}><GlassPage src={SRC} from={60.2} ring={false} /></Seq>
      <Seq a={60.2} b={66.0}><CompareBars ours="≈70TR/m²" badgeAt={4.5} /></Seq>
      <Seq a={60.2} b={66.0}><NeonTitle id="n13" lead="so với những căn" main="Cắt lỗ sâu" cy={330} size={150} at={2.1} /></Seq>
      <Seq a={66.0} b={72.0}><GlassPage src={SRC} from={66.0} ring={false} /></Seq>
      <Seq a={66.0} b={72.0}><GlassCard src={SRC} from={66.0} title="Chính sách mới" chips={["Thanh toán sớm", "Chiết khấu thêm 7,5%", "Giá đã cộng chiết khấu"]} chipsAt={2.5} caption="chủ đầu tư Vinhomes" /></Seq>

      {/* CTA */}
      <Seq a={71.8} b={72.4}><LightBurst /></Seq>
      <Seq a={73.6} b={78.8}><GoldNumber id="g2" lead="nếu anh chị có tài chính" value={15} unit="TỶ" cy={500} size={240} at={0.3} countDur={0.45} /></Seq>
      <Seq a={78.8} b={83}><NeonTitle id="n14" lead="liên hệ ngay" main="Em Sơn" cy={360} size={190} at={0.2} /></Seq>
      <Seq a={79.0} b={83}><PhonePill phone="0966 312 333" y={0.27} dockAt={99} /></Seq>

      {stem === "all" ? <Audio src={staticFile("music/bed-ambient.wav")} volume={0.08} loop /> : null}
      {stem === "voice" ? null : <SfxTrack cues={alignCues(CUES, fps) as SfxCue[]} />}
    </AbsoluteFill></TextTheme>
  );
};
