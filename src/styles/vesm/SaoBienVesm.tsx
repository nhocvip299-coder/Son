import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { TextTheme, GlassCard, GlassPage, GoldNumber, LightBurst, NeonTitle, PersonFront, PhonePill, PriceDrop, TealOrange, ThinBig, VESM_SFX } from "../../../skills/video-edit-style-master/components";
import { alignCues } from "../../../skills/video-edit-style-master/presets/style";
import { FloorStack, SitePlan, XeKhe } from "../bdsLuxury/explain";
import { VideoCard } from "../bdsLuxury/fill";
import { HandBold } from "../bdsLuxury/handBold";
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
  [2.75, X.land, 1], [3.5, X.land, 1], [5.2, X.type, 0.75],
  [4.35, X.chip, 0.9], [8.05, X.chip, 0.9], [12.3, X.burst, 1], [12.5, X.type, 0.75], [14.7, X.page, 0.9], [20.1, X.page, 0.85],
  [22.8, X.burst, 1], [22.95, X.chip, 0.9], [26.3, X.chip, 0.9], [33.5, X.chip, 0.8], [35.9, X.chip, 0.9], [24.9, X.type, 0.75], [27.7, X.page, 0.85], [29.0, X.soft, 0.8],
  [31.5, X.page, 0.85], [32.2, X.count, 0.6], [32.35, X.count, 0.6], [32.5, X.land, 1], [34.7, X.land, 1],
   [41.6, X.burst, 1.8], [41.75, X.whoosh, 1], [47.85, X.chip, 0.9], [49.27, X.soft, 1],
  [50.8, X.page, 0.85], [51.4, X.whoosh, 0.8], [52.45, X.land, 1], [53.3, X.page, 0.85],
  [60.0, X.page, 0.85], [60.1, X.chip, 0.8], [62.6, X.type, 0.75], [64.4, X.burst, 1.8], [64.55, X.whoosh, 1], [65.4, X.chip, 1], [66.0, X.land, 1],
];

export const SaoBienVesm: React.FC<{ stem?: "all" | "sfx" | "voice" }> = ({ stem = "all" }) => {
  const { fps } = useVideoConfig();
  const s = (x: number) => Math.round(x * fps);
  const Seq: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => <Sequence from={s(a)} durationInFrames={s(b - a)}>{children}</Sequence>;
  const front = (a: number, m: string, start: number) => <PersonFront matte={`${D}${m}/person.webm`} from={a - start} />;
  const K = (n: number, texts: Record<string, string>, cy: number, w: number) => (
    <CapcutPreset preset={CC_PRESETS.find((p) => p.id === `Kobe Text ${String(n).padStart(2, "0")}`)!} fit={{ cx: 540, cy, width: w }} texts={texts} glowK={0.45} tone="theme" withAudio={stem !== "voice"} />
  );
  return (
    <TextTheme value="neonSoft"><AbsoluteFill style={{ backgroundColor: "#000" }}><TealOrange k={0.5}>
      <AbsoluteFill>
        <Sequence durationInFrames={s(END)}><OffthreadVideo src={staticFile(SRC)} muted={stem === "sfx"} volume={stem === "sfx" ? 0 : 1} /></Sequence>
        <Sequence from={s(END)}><Freeze frame={s(END) - 2}><OffthreadVideo src={staticFile(SRC)} muted /></Freeze></Sequence>
      </AbsoluteFill>

      {/* ===== NHỊP CHỮ DÀY: mỗi 1,5–2,5 s một ý, xoay vòng 4 kiểu (neon / viết tay+khối / preset CapCut / số vàng) ===== */}
      {/* HOOK */}
      <Seq a={0.0} b={2.65}>{K(38, { "1": "1", "Căn Hộ": "Shophouse", "Đáng sống": "đẹp như thế này" }, 420, 640)}</Seq>
      <Seq a={2.65} b={4.3}><NeonTitle id="h1b" lead="sở hữu" main="2 mặt đường" script="3 mặt thoáng" cy={390} size={170} at={0.05} /></Seq>
      <Seq a={4.3} b={5.15}><HandBold id="hb1" variant="tay" small="Vinhomes" main="OCEAN PARK 2" cy={420} size={150} tone="cyan" /></Seq>
      <Seq a={5.15} b={6.4}><NeonTitle id="h2" lead="giá đang rất" main="Cạnh tranh" cy={390} size={175} at={0.05} /></Seq>
      <Seq a={6.4} b={8.0}>{K(17, { "Cơ hội": "nhiều nhà", "Đầu Tư": "Đầu Tư", "Sinh lời": "quan tâm" }, 420, 620)}</Seq>
      <Seq a={8.0} b={9.6}><HandBold id="hb2" variant="bac" small="PHÂN TÍCH CÙNG" main="EM SƠN" cy={420} size={160} tone="gold" smallTone="cyan" /></Seq>
      <Seq a={9.6} b={12.3}>{K(32, { "Edit video": "xuống tiền", "Tại sao?": "Tại sao?", "lại": "nên", "cần thiết": "căn này" }, 430, 660)}</Seq>

      {/* KẾT NỐI */}
      <Seq a={12.1} b={12.7}><LightBurst /></Seq>
      <Seq a={12.4} b={14.7}><NeonTitle id="k1" lead="điểm ăn tiền nhất" main="Kết nối" cy={390} size={180} at={0.1} /></Seq>
      <Seq a={14.7} b={20.1}><OffthreadVideo src={staticFile(D + "raw/a1.mp4")} muted /></Seq>
      <Seq a={20.1} b={21.35}><VideoCard src={D + "raw/tt-7534.mp4"} startFrom={1.0} y={0.58} /></Seq>
      <Seq a={21.35} b={22.8}><VideoCard src={D + "raw/tt-7528.mp4"} startFrom={2.0} y={0.58} /></Seq>
      <Seq a={20.1} b={22.8}>{K(21, { "Tiện ích": "Tiện ích", "Nổi Bật": "Thương Mại" }, 400, 640)}</Seq>

      {/* ƯU ĐIỂM 2 */}
      <Seq a={22.6} b={23.2}><LightBurst /></Seq>
      <Seq a={22.8} b={24.8}><HandBold id="hb3" variant="tay" small="ưu điểm" main="THỨ 2" cy={420} size={190} tone="cyan" /></Seq>
      <Seq a={24.8} b={26.25}><NeonTitle id="u1" lead="giới hạn" main="Diện tích lớn" cy={390} size={170} at={0.05} /></Seq>
      <Seq a={26.25} b={27.7}><HandBold id="hb4" variant="neon" small="3 MẶT THOÁNG" main="2 mặt tiền" cy={420} size={150} tone="teal" /></Seq>
      <Seq a={27.7} b={31.3}><GlassPage src={SRC} from={27.7} ring={false} /></Seq>
      <Seq a={27.7} b={31.3}><XeKhe tx={TX} /></Seq>
      <Seq a={27.7} b={31.3}><NeonTitle id="u3" lead="" main="Xẻ khe" cy={300} size={140} at={0.6} /></Seq>
      <Seq a={31.3} b={33.4}><GlassPage src={SRC} from={31.3} ring={false} /></Seq>
      <Seq a={31.3} b={33.4}><SitePlan area={160} tx={TX} /></Seq>
      <Seq a={33.4} b={35.85}><GlassPage src={SRC} from={33.4} ring={false} /></Seq>
      <Seq a={33.4} b={35.85}><FloorStack total={427} floors={6} /></Seq>
      <Seq a={33.4} b={35.85}><HandBold id="hb5" variant="bac" small="XÂY DỰNG" main="6 TẦNG" cy={300} size={120} tone="gold" smallTone="cyan" /></Seq>
      <Seq a={35.85} b={37.1}><HandBold id="hb6" variant="bac" small="CỰC KỲ" main="PHÙ HỢP" cy={420} size={150} tone="gold" smallTone="cyan" /></Seq>
      <Seq a={37.1} b={39.5}>{K(20, { "Đầu tư": "Tầng 1", "Sinh lời": "Kinh doanh" }, 420, 640)}</Seq>
      <Seq a={39.5} b={41.6}>{K(19, { "Phong cách sống": "các tầng trên", "Hiện Đại": "Homestay", "Do bạn chọn": "lưu trú cho thuê" }, 420, 640)}</Seq>

      {/* GIÁ */}
      <Seq a={41.4} b={42.0}><LightBurst /></Seq>
      <Seq a={41.7} b={44.9}><NeonTitle id="p1" lead="điều đáng nói nhất" main="Về giá" cy={390} size={180} at={0.1} /></Seq>
      <Seq a={44.9} b={47.8}>{K(40, { "100 Triệu": "25 Tỷ" }, 460, 620)}</Seq>
      <Seq a={47.8} b={49.2}><HandBold id="hb7" variant="tay" small="cộng thêm" main="CHIẾT KHẤU" cy={420} size={150} tone="gold" /></Seq>
      <Seq a={49.2} b={50.75}><ThinBig value="7,5%" lead="theo chính sách mới" cy={470} size={230} front={front(49.2, "m75", 49.0)} /></Seq>
      <Seq a={50.75} b={53.35}><GlassPage src={SRC} from={50.75} /></Seq>
      <Seq a={50.75} b={53.35}><PriceDrop lead="giá căn shophouse" script="sau chiết khấu" oldPrice="25 TỶ" strikeAt={0.6} mid="chỉ còn hơn" from={25} to={15} dec={0} unit="TỶ" newAt={1.7} /></Seq>
      <Seq a={50.55} b={51.15}><LightBurst /></Seq>
      {/* TRÁM đồ hoạ người dùng gửi: VỊ TRÍ ĐẸP – GIÁ RẤT TỐT */}
      <Seq a={53.35} b={58.4}><OffthreadVideo src={staticFile(D + "raw/a2.mp4")} trimBefore={s(0.6)} muted /></Seq>
      <Seq a={58.4} b={60.0}>{K(31, { "Hãy nắm bắt": "rất đáng để", "Cơ hội": "Nghiên cứu", "Ngay bây giờ": "ngay bây giờ" }, 420, 640)}</Seq>
      <Seq a={60.0} b={62.6}><VideoCard src={D + "raw/tt-7593.mp4"} startFrom={14} y={0.58} w={0.82} /></Seq>
      <Seq a={60.0} b={62.6}><HandBold id="hb8" variant="tay" small="dòng sản phẩm" main="OCEAN PARK 2" cy={420} size={140} tone="cyan" /></Seq>

      {/* CTA */}
      <Seq a={62.6} b={64.4}><GoldNumber id="c2" lead="giá cực kỳ tốt · chỉ hơn" value={15} unit="TỶ" cy={400} size={220} at={0.1} countDur={0.45} /></Seq>
      <Seq a={64.2} b={64.8}><LightBurst /></Seq>
      <Seq a={64.4} b={66.6}><NeonTitle id="c3" lead="liên hệ trực tiếp" main="Em Sơn" cy={390} size={190} at={0.1} /></Seq>
      <Seq a={66.6} b={SAOBIEN_SEC}>{K(24, { Comment: "Comment", '"Báo Giá"': '"Báo Giá"' }, 330, 600)}</Seq>
      <Seq a={65.4} b={SAOBIEN_SEC}><PhonePill phone="0966 312 333" y={0.33} dockAt={99} /></Seq>
      </TealOrange>
      {/* KHÔNG nhạc nền (yêu cầu người dùng) */}
      {stem === "voice" ? null : <SfxTrack cues={alignCues(CUES, fps) as SfxCue[]} />}
    </AbsoluteFill></TextTheme>
  );
};
