import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { TextTheme, GlassCard, GlassPage, GoldNumber, LightBurst, NeonTitle, PersonFront, PhonePill, PriceDrop, TealOrange, ThinBig, VESM_SFX } from "../../../skills/video-edit-style-master/components";
import { alignCues } from "../../../skills/video-edit-style-master/presets/style";
import { FloorStack, SitePlan, XeKhe } from "../bdsLuxury/explain";
import { VideoCard } from "../bdsLuxury/fill";
import { CC_PRESETS, CapcutPreset } from "../textPresets/capcut/CapcutPreset";

/**
 * Shophouse Sao Biển — Vinhomes Ocean Park 2 (du-an-4). Phối 3 skill:
 *  - video-edit-style-master: khung chính (neon/vàng, trang kính, hạ giá, chữ sau lưng, SĐT)
 *  - bds-luxury: sơ đồ mặt bằng/xẻ khe, chồng sàn (công thức diện tích/tầng), VideoCard trám tiện ích
 *  - text-presets-bds: Kobe Text 40 cho "giá full ban đầu 25 tỷ"
 * KHÔNG nhạc nền, không phụ đề. Mốc = đầu từ khoá trong work/du-an-4/asr/captions.json.
 */
export const SAOBIEN_SEC = 69;
const D = "inputs/du-an-4/";
const SRC = D + "goc-1080-hq.mp4";
const END = 66.25;
const X = VESM_SFX;
const TX = { name: "SHOPHOUSE", back: "MẶT ĐƯỜNG SAU", front: "MẶT ĐƯỜNG TRƯỚC", khe: "XẺ KHE", edge: "2 MẶT ĐƯỜNG · 3 MẶT THOÁNG", note: "THOÁNG · SÁNG 3 MẶT: TRƯỚC – SAU – HÔNG" };
const CUES: Array<[number, string, number]> = [
  [0.5, X.type, 0.7], [2.75, X.land, 1], [3.5, X.land, 1], [4.4, X.type, 0.7], [5.3, X.chip, 0.9],
  [9.7, X.type, 0.75], [12.3, X.burst, 1], [12.5, X.type, 0.75], [14.7, X.page, 0.9], [20.1, X.page, 0.85],
  [22.8, X.burst, 1], [24.9, X.type, 0.75], [26.3, X.type, 0.75], [27.7, X.page, 0.85], [29.0, X.soft, 0.8],
  [31.5, X.page, 0.85], [32.2, X.count, 0.6], [32.35, X.count, 0.6], [32.5, X.land, 1], [34.7, X.land, 1],
  [37.1, X.type, 0.75], [39.6, X.soft, 0.8], [41.6, X.burst, 1], [45.1, X.chip, 0.9], [49.27, X.soft, 1],
  [50.8, X.page, 0.85], [51.4, X.whoosh, 0.8], [52.45, X.land, 1], [53.3, X.page, 0.85],
  [59.6, X.page, 0.85], [62.6, X.type, 0.75], [64.4, X.burst, 0.9], [65.4, X.chip, 1], [66.0, X.land, 1],
];

export const SaoBienVesm: React.FC<{ stem?: "all" | "sfx" | "voice" }> = ({ stem = "all" }) => {
  const { fps } = useVideoConfig();
  const s = (x: number) => Math.round(x * fps);
  const Seq: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => <Sequence from={s(a)} durationInFrames={s(b - a)}>{children}</Sequence>;
  const front = (a: number, m: string, start: number) => <PersonFront matte={`${D}${m}/person.webm`} from={a - start} />;
  const k40 = CC_PRESETS.find((p) => p.id === "Kobe Text 40")!;
  return (
    <TextTheme value="neon"><AbsoluteFill style={{ backgroundColor: "#000" }}><TealOrange k={0.5}>
      <AbsoluteFill>
        <Sequence durationInFrames={s(END)}><OffthreadVideo src={staticFile(SRC)} muted={stem === "sfx"} volume={stem === "sfx" ? 0 : 1} /></Sequence>
        <Sequence from={s(END)}><Freeze frame={s(END) - 2}><OffthreadVideo src={staticFile(SRC)} muted /></Freeze></Sequence>
      </AbsoluteFill>

      {/* HOOK */}
      <Seq a={0.4} b={2.65}><NeonTitle id="h1" lead="anh chị nhìn xem" main="Shophouse đẹp" cy={390} size={170} at={0.1} /></Seq>
      <Seq a={2.65} b={4.3}><NeonTitle id="h1b" lead="sở hữu" main="2 mặt đường" script="3 mặt thoáng" cy={390} size={170} at={0.05} /></Seq>
      <Seq a={4.3} b={8.0}><NeonTitle id="h2" lead="tại Vinhomes" main="Ocean Park 2" script="giá cạnh tranh" cy={390} size={165} at={0.1} /></Seq>
      <Seq a={9.6} b={12.3}><NeonTitle id="h3" lead="vì sao nên" main="Xuống tiền?" cy={390} size={180} at={0.1} /></Seq>

      {/* KẾT NỐI */}
      <Seq a={12.1} b={12.7}><LightBurst /></Seq>
      <Seq a={12.4} b={14.7}><NeonTitle id="k1" lead="điểm ăn tiền nhất" main="Kết nối" cy={390} size={180} at={0.1} /></Seq>
      <Seq a={14.7} b={20.1}><OffthreadVideo src={staticFile(D + "raw/a1.mp4")} muted /></Seq>
      <Seq a={20.1} b={21.35}><VideoCard src={D + "raw/tt-7534.mp4"} startFrom={1.0} y={0.55} /></Seq>
      <Seq a={21.35} b={22.8}><VideoCard src={D + "raw/tt-7528.mp4"} startFrom={2.0} y={0.55} /></Seq>
      <Seq a={20.1} b={22.8}><NeonTitle id="k2" lead="vui chơi · mua sắm" main="Tiện ích thương mại" cy={330} size={120} at={0.15} /></Seq>

      {/* ƯU ĐIỂM 2: diện tích, mặt tiền, xẻ khe */}
      <Seq a={22.6} b={23.2}><LightBurst /></Seq>
      <Seq a={24.8} b={26.25}><NeonTitle id="u1" lead="ưu điểm thứ 2" main="Diện tích lớn" cy={390} size={170} at={0.05} /></Seq>
      <Seq a={26.25} b={27.7}><NeonTitle id="u2" lead="sở hữu" main="2 mặt tiền" script="3 mặt thoáng" cy={390} size={170} at={0.05} /></Seq>
      <Seq a={27.7} b={31.3}><GlassPage src={SRC} from={27.7} ring={false} /></Seq>
      <Seq a={27.7} b={31.3}><XeKhe tx={TX} /></Seq>
      <Seq a={27.7} b={31.3}><NeonTitle id="u3" lead="" main="Xẻ khe" cy={300} size={140} at={0.6} /></Seq>
      <Seq a={31.3} b={33.4}><GlassPage src={SRC} from={31.3} ring={false} /></Seq>
      <Seq a={31.3} b={33.4}><SitePlan area={160} tx={TX} /></Seq>
      <Seq a={33.4} b={35.85}><GlassPage src={SRC} from={33.4} ring={false} /></Seq>
      <Seq a={33.4} b={35.85}><FloorStack total={427} floors={6} /></Seq>
      <Seq a={36.9} b={39.5}><NeonTitle id="u4" lead="tầng 1" main="Kinh doanh" cy={390} size={175} at={0.2} /></Seq>
      <Seq a={39.5} b={41.6}><NeonTitle id="u5" lead="các tầng trên" main="Lưu trú homestay" cy={330} size={140} at={0.1} /></Seq>

      {/* GIÁ */}
      <Seq a={41.4} b={42.0}><LightBurst /></Seq>
      <Seq a={41.7} b={44.9}><NeonTitle id="p1" lead="điều đáng nói nhất" main="Về giá" cy={390} size={180} at={0.1} /></Seq>
      <Seq a={44.9} b={47.8}><CapcutPreset preset={k40} fit={{ cx: 540, cy: 460, width: 620 }} texts={{ "100 Triệu": "25 Tỷ" }} withAudio={stem !== "voice"} /></Seq>
      <Seq a={47.8} b={49.2}><NeonTitle id="p2" lead="cộng với" main="Chiết khấu thêm" cy={330} size={150} at={0.05} /></Seq>
      <Seq a={49.2} b={50.75}><ThinBig value="7,5%" lead="theo chính sách mới" cy={470} size={230} front={front(49.2, "m75", 49.0)} /></Seq>
      <Seq a={50.75} b={53.35}><GlassPage src={SRC} from={50.75} /></Seq>
      <Seq a={50.75} b={53.35}><PriceDrop lead="giá căn shophouse" script="sau chiết khấu" oldPrice="25 TỶ" strikeAt={0.6} mid="chỉ còn hơn" from={25} to={15} dec={0} unit="TỶ" newAt={1.7} /></Seq>
      <Seq a={50.55} b={51.15}><LightBurst /></Seq>
      {/* TRÁM đồ hoạ người dùng gửi: VỊ TRÍ ĐẸP – GIÁ RẤT TỐT */}
      <Seq a={53.35} b={58.4}><OffthreadVideo src={staticFile(D + "raw/a2.mp4")} trimBefore={s(0.6)} muted /></Seq>
      <Seq a={59.6} b={62.6}><VideoCard src={D + "raw/tt-7593.mp4"} startFrom={14} y={0.55} w={0.82} /></Seq>
      <Seq a={59.6} b={62.6}><NeonTitle id="c1" lead="dòng sản phẩm" main="Ocean Park 2" cy={330} size={160} at={0.2} /></Seq>

      {/* CTA */}
      <Seq a={62.6} b={64.4}><GoldNumber id="c2" lead="giá cực kỳ tốt · chỉ hơn" value={15} unit="TỶ" cy={400} size={220} at={0.1} countDur={0.45} /></Seq>
      <Seq a={64.2} b={64.8}><LightBurst /></Seq>
      <Seq a={64.4} b={SAOBIEN_SEC}><NeonTitle id="c3" lead="liên hệ trực tiếp" main="Em Sơn" cy={390} size={190} at={0.1} /></Seq>
      <Seq a={65.4} b={SAOBIEN_SEC}><PhonePill phone="0966 312 333" y={0.27} dockAt={99} /></Seq>
      </TealOrange>
      {/* KHÔNG nhạc nền (yêu cầu người dùng) */}
      {stem === "voice" ? null : <SfxTrack cues={alignCues(CUES, fps) as SfxCue[]} />}
    </AbsoluteFill></TextTheme>
  );
};
