import React from "react";
import { AbsoluteFill, Easing, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { SfxTrack } from "../../compositions/shared";
import type { SfxCue } from "../../lib/theme";
import { TextTheme, GoldNumber, LightBurst, NeonTitle, TealOrange, VESM_SFX } from "../../../skills/video-edit-style-master/components";
import { alignCues } from "../../../skills/video-edit-style-master/presets/style";
import { VideoCard } from "../bdsLuxury/fill";
import { HandBold } from "../bdsLuxury/handBold";
import { CC_PRESETS, CapcutPreset } from "../textPresets/capcut/CapcutPreset";

/**
 * Happy Home Phố Hiến — bản Ngọc Huyền (du-an-5). Giọng = file ghi âm ElevenLabs (voice.mp3), TẮT toàn bộ tiếng video.
 * Hình cắt ghép theo lời: dẫn chuyện (goc-hq, chỉ đoạn sạch chữ), flycam (dải 16:9 cắt từ goc / v1c bỏ logo TikTok) trong VideoCard,
 * sa bàn + nhà mẫu (du-an-moi/broll), stock bệnh viện / đại học. KHÔNG nhạc nền, không phụ đề.
 * Mốc = đầu từ trong work/du-an-5/asr-voice/captions.json.
 */
export const HH_HUYEN_SEC = 83;
const D = "inputs/du-an-5/";
const GOC = D + "goc-hq.mp4";
const BAND = D + "goc-band.mp4";
const V1C = D + "v1c-band.mp4";
const BR = (n: number) => `inputs/du-an-moi/broll/IMG_00${n}.mp4`;
const STOCK = (id: string) => `inputs/du-an-moi/stock/${id}.mp4`;
const X = VESM_SFX;
const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// hình nền: [từ, đến, kiểu, nguồn, giây nguồn]
type Shot = [number, number, "full" | "card", string, number];
const SHOTS: Shot[] = [
  [0, 4.6, "full", GOC, 104.0],
  [4.6, 7.26, "full", BR(52), 0.0],
  [7.26, 9.2, "card", BAND, 40.5],
  [9.2, 11.49, "full", BR(52), 3.0],
  [11.49, 13.05, "card", V1C, 26.0],
  [13.05, 15.88, "full", BR(54), 0.0],
  [15.88, 20.16, "full", BR(54), 6.0],
  [20.16, 21.77, "card", BAND, 43.0],
  [21.77, 24.0, "card", V1C, 50.5],
  [24.0, 28.06, "full", BR(55), 5.5],
  [28.06, 29.45, "full", BR(57), 0.5],
  [29.45, 32.46, "full", BR(58), 4.0],
  [32.46, 35.35, "full", GOC, 16.3],
  [35.35, 36.72, "full", BR(54), 10.0],
  [36.72, 40.94, "full", BR(58), 8.5],
  [40.94, 44.16, "card", BAND, 86.0],
  [44.16, 51.2, "full", BR(59), 0.0],
  [51.2, 58.08, "full", BR(61), 0.0],
  [58.08, 61.01, "card", STOCK("23069"), 2.0],
  [61.01, 63.18, "card", STOCK("4503"), 1.0],
  [63.18, 69.0, "card", V1C, 60.0],
  [69.0, 71.54, "card", BAND, 92.0],
  [71.54, 75.24, "full", BR(60), 0.0],
  [75.24, 77.98, "full", BR(53), 4.0],
  [77.98, 82.7, "full", GOC, 109.0],
];

const CUES: Array<[number, string, number]> = [
  [0.95, X.chip, 2.0], [0.98, X.land, 1.0], [1.3, X.land, 1], [4.6, X.page, 0.9], [5.69, X.type, 0.8], [6.3, X.land, 1],
  [7.26, X.page, 0.9], [7.65, X.chip, 1], [8.61, X.land, 1], [9.2, X.whoosh, 0.9], [9.78, X.land, 1.2],
  [11.49, X.page, 0.9], [11.6, X.count, 0.7], [12.11, X.land, 1.2], [13.05, X.whoosh, 0.9], [14.7, X.count, 0.7], [15.13, X.land, 1.2],
  [15.88, X.soft, 0.9], [18.23, X.chip, 1.2], [18.73, X.chip, 1.2], [19.48, X.chip, 1.2],
  [20.16, X.page, 0.9], [20.94, X.land, 1.2], [21.77, X.page, 0.9], [23.01, X.land, 1.2],
  [24.0, X.whoosh, 0.9], [24.3, X.chip, 1.2], [25.5, X.count, 0.7], [25.95, X.land, 1.2],
  [28.06, X.page, 0.9], [29.45, X.chip, 1.2], [30.87, X.land, 1.2],
  [32.46, X.whoosh, 0.9], [33.65, X.type, 0.9], [34.69, X.land, 1.2],
  [35.35, X.page, 0.9], [36.72, X.chip, 1.2], [38.39, X.land, 1.2], [39.02, X.type, 0.9], [39.54, X.land, 1.1],
  [40.94, X.page, 0.9], [42.3, X.count, 0.7], [42.79, X.land, 1.3],
  [44.16, X.whoosh, 0.9], [44.3, X.chip, 2.2], [44.33, X.land, 1.0], [47.63, X.chip, 2.2], [47.66, X.land, 1.0], [48.32, X.chip, 2.2], [48.35, X.land, 1.0], [49.09, X.chip, 2.2], [49.12, X.land, 1.0], [49.92, X.chip, 2.2], [49.95, X.land, 1.0],
  [52.53, X.chip, 2.2], [52.56, X.land, 1.0], [53.24, X.chip, 2.2], [53.27, X.land, 1.0], [54.01, X.chip, 2.2], [54.04, X.land, 1.0], [54.63, X.chip, 2.2], [54.66, X.land, 1.0], [55.79, X.chip, 2.2], [55.82, X.land, 1.0],
  [57.9, X.burst, 1.8], [58.05, X.whoosh, 1.0], [58.26, X.type, 0.9], [59.8, X.land, 1.2], [61.01, X.page, 0.9], [61.19, X.chip, 1.2], [62.28, X.land, 1.2],
  [63.18, X.page, 0.9], [63.34, X.chip, 1.3], [63.88, X.chip, 1.3], [64.69, X.chip, 1.3], [66.66, X.type, 0.9], [67.2, X.land, 1.3],
  [69.0, X.page, 0.9], [69.4, X.chip, 1.2], [70.72, X.land, 1.2],
  [71.54, X.whoosh, 0.9], [73.44, X.chip, 1.2], [74.99, X.land, 1.2], [75.24, X.page, 0.9], [76.79, X.land, 1.2],
  [77.8, X.burst, 1.8], [77.95, X.whoosh, 1.0], [78.88, X.land, 1.2], [79.97, X.type, 0.9], [80.4, X.land, 1.3],
];

/** Hình nền toàn khung, đẩy máy nhẹ (dùng trong <Sequence>). */
const FullShot: React.FC<{ src: string; from: number }> = ({ src, from }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const z = interpolate(f, [0, durationInFrames], [1.0, 1.06], C);
  const o = interpolate(f, [0, 6], [0.4, 1], C);
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: o }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <OffthreadVideo src={staticFile(src)} startFrom={Math.round(from * fps)} muted />
      </AbsoluteFill>
      {/* tối nhẹ phía trên để chữ nổi */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,10,16,0.62) 0%, rgba(0,10,16,0.35) 22%, rgba(0,10,16,0) 42%)" }} />
    </AbsoluteFill>
  );
};

/** Viên chip tick vàng — chữ to, hiện theo mốc lời (thời gian cục bộ). */
const Chips: React.FC<{ items: Array<[string, number]>; title?: string; top: number; cols?: 1 | 2; size?: number; icon?: string }> = ({ items, title, top, cols = 1, size = 46, icon = "✓" }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();
  const t = f / fps, dur = durationInFrames / fps;
  const out = interpolate(t, [dur - 0.25, dur], [1, 0], C);
  const colW = cols === 2 ? 380 : 720;
  const rowH = size * 2.05;
  const tIn = interpolate(t, [0, 0.3], [0, 1], { ...C, easing: Easing.bezier(0.33, 1, 0.68, 1) });
  return (
    <AbsoluteFill style={{ opacity: out, filter: out < 0.99 ? `blur(${(1 - out) * 8}px)` : undefined }}>
      {title ? (
        <div style={{ position: "absolute", top: top - size * 1.7, width, textAlign: "center", opacity: tIn, transform: `translateY(${(1 - tIn) * 20}px)`, fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: size * 0.82, color: "#ffe29a", letterSpacing: 2, textShadow: "0 2px 10px rgba(0,0,0,0.9), 0 0 18px rgba(255,190,80,0.5)" }}>{title}</div>
      ) : null}
      {items.map(([s, at], i) => {
        const a = interpolate(t, [at, at + 0.32], [0, 1], { ...C, easing: Easing.bezier(0.34, 1.6, 0.64, 1) });
        const col = cols === 2 ? i % 2 : 0, row = cols === 2 ? Math.floor(i / 2) : i;
        const left = cols === 2 ? (col === 0 ? 150 : 550) : (width - colW) / 2;
        const sweep = ((t - at) * 0.9) % 3;
        return (
          <div key={i} style={{ position: "absolute", left, top: top + row * rowH, width: colW, opacity: Math.min(1, a * 1.6), transform: `translateX(${(1 - a) * (col ? 60 : -60)}px) scale(${0.75 + 0.25 * a})`, display: "flex", alignItems: "center", gap: 14, padding: `${size * 0.24}px ${size * 0.4}px ${size * 0.24}px ${size * 0.24}px`, borderRadius: size, background: "linear-gradient(180deg, rgba(8,34,44,0.92), rgba(3,16,24,0.92))", border: "2px solid rgba(255,214,120,0.9)", boxShadow: "0 8px 26px rgba(0,0,0,0.55), 0 0 22px rgba(255,190,80,0.25)", overflow: "hidden", boxSizing: "border-box" }}>
            <div style={{ flex: "none", width: size * 1.05, height: size * 1.05, borderRadius: size, background: "linear-gradient(180deg,#fff1c0,#ffc24a 55%,#d98a1c)", color: "#1a1206", display: "grid", placeItems: "center", fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: size * 0.62 }}>{icon}</div>
            <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: size * (cols === 2 ? 0.74 : 0.9), color: "#fff", whiteSpace: "nowrap", textShadow: "0 0 10px rgba(120,240,255,0.35)" }}>{s}</div>
            <div style={{ position: "absolute", top: 0, bottom: 0, width: 80, left: `${-20 + sweep * 60}%`, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)", transform: "skewX(-20deg)" }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const HappyHomeHuyen: React.FC<{ stem?: "all" | "sfx" | "voice" }> = ({ stem = "all" }) => {
  const { fps } = useVideoConfig();
  const s = (x: number) => Math.round(x * fps);
  const Seq: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => <Sequence from={s(a)} durationInFrames={s(b - a)}>{children}</Sequence>;
  const L = (a: number, t: number) => t - a; // mốc lời -> giây cục bộ
  const K = (n: number, texts: Record<string, string>, cy: number, w: number) => (
    <CapcutPreset preset={CC_PRESETS.find((p) => p.id === `Kobe Text ${String(n).padStart(2, "0")}`)!} fit={{ cx: 540, cy, width: w }} texts={texts} glowK={0.45} tone="theme" withAudio={stem !== "voice"} />
  );
  const last = SHOTS[SHOTS.length - 1];
  return (
    <TextTheme value="neonSoft"><AbsoluteFill style={{ backgroundColor: "#000" }}><TealOrange k={0.45}>
      {/* ===== HÌNH (toàn bộ tắt tiếng) ===== */}
      {SHOTS.map(([a, b, kind, src, from], i) => (
        <Seq key={i} a={a} b={b}>{kind === "full" ? <FullShot src={src} from={from} /> : <VideoCard src={src} startFrom={from} y={0.56} w={0.94} />}</Seq>
      ))}
      <Sequence from={s(last[1])}><Freeze frame={Math.round((last[4] + last[1] - last[0]) * fps) - 3}><OffthreadVideo src={staticFile(GOC)} muted /></Freeze></Sequence>

      {/* ===== MỞ: chào + giới thiệu (người dẫn — chữ trên đầu) ===== */}
      <Seq a={0.0} b={2.22}><HandBold id="o1" variant="tay" small="xin chào, em là" main="NGỌC HUYỀN" cy={470} size={130} tone="cyan" mainAt={1.1} /></Seq>
      <Seq a={2.22} b={4.6}>{K(20, { "Đầu tư": "đi xem", "Sinh lời": "Thực tế" }, 450, 600)}</Seq>
      <Seq a={4.6} b={7.26}><NeonTitle id="o3" lead="dự án Vinhomes" main="Happy Home" script="Phố Hiến" cy={420} size={170} at={L(4.6, 5.7)} /></Seq>
      <Seq a={7.26} b={9.2}><HandBold id="o4" variant="tay" small="phường Phố Hiến" main="HƯNG YÊN" cy={470} size={170} tone="cyan" mainAt={L(7.26, 8.55)} /></Seq>
      <Seq a={9.2} b={11.49}><HandBold id="o5" variant="bac" small="CHỦ ĐẦU TƯ" main="VINHOMES" cy={430} size={170} tone="gold" smallTone="cyan" mainAt={L(9.2, 9.75)} /></Seq>

      {/* ===== QUY MÔ ===== */}
      <Seq a={11.49} b={13.05}><GoldNumber id="q1" lead="quy mô hơn" value={31} unit="HA" cy={470} size={230} at={0.1} countDur={0.55} /></Seq>
      <Seq a={13.05} b={15.88}><GoldNumber id="q2" lead="mật độ xây dựng chỉ" value={26} unit="%" cy={450} size={240} at={L(13.05, 14.6)} countDur={0.5} /></Seq>
      <Seq a={15.88} b={20.16}><Chips title="QUỸ ĐẤT DÀNH CHO" top={470} items={[["Cây xanh", L(15.88, 18.23)], ["Đường xá", L(15.88, 18.73)], ["Tiện ích", L(15.88, 19.48)]]} size={54} /></Seq>

      {/* ===== 2 PHÂN KHU ===== */}
      <Seq a={20.16} b={21.77}><NeonTitle id="p1" lead="toàn khu gồm" main="2 phân khu" cy={440} size={175} at={0.05} /></Seq>
      <Seq a={21.77} b={24.0}><HandBold id="p2" variant="tay" small="khu Hạnh Phúc" main="25 TÒA CĂN HỘ" cy={470} size={120} tone="cyan" mainAt={L(21.77, 22.95)} /></Seq>
      <Seq a={24.0} b={25.45}><HandBold id="p3" variant="bac" small="KHU" main="THỊNH VƯỢNG" cy={1180} size={140} tone="gold" smallTone="cyan" mainAt={0.25} /></Seq>
      <Seq a={25.45} b={28.06}><GoldNumber id="p4" lead="nhà phố thấp tầng" value={303} unit="CĂN" cy={1170} size={220} at={0.05} countDur={0.5} /></Seq>
      <Seq a={28.06} b={29.45}>{K(20, { "Đầu tư": "Nhà phố", "Sinh lời": "Có hạn" }, 450, 620)}</Seq>
      <Seq a={29.45} b={32.46}><HandBold id="p6" variant="neon" small="vừa để ở · vừa" main="KINH DOANH" sub="ngay tầng trệt" cy={460} size={150} tone="teal" mainAt={L(29.45, 30.8)} /></Seq>

      {/* ===== ĐƯỜNG NỘI KHU / CÂY XANH ===== */}
      <Seq a={32.46} b={35.35}><NeonTitle id="d1" lead="đường nội khu" main="Rộng rãi" cy={370} size={170} at={L(32.46, 33.6)} /></Seq>
      <Seq a={35.35} b={36.72}>{K(21, { "Tiện ích": "2 bên", "Nổi Bật": "Cây xanh mát" }, 450, 640)}</Seq>
      <Seq a={36.72} b={39.0}><HandBold id="d3" variant="tay" small="sáng đi dạo · chiều ra" main="CÔNG VIÊN" cy={470} size={170} tone="green" mainAt={L(36.72, 38.3)} /></Seq>
      <Seq a={39.0} b={40.94}><NeonTitle id="d4" lead="không khí" main="Trong lành" cy={420} size={170} at={0.4} /></Seq>

      {/* ===== 26 TIỆN ÍCH ===== */}
      <Seq a={40.94} b={44.16}><GoldNumber id="t1" lead="Huyền thích nhất" value={26} unit="TIỆN ÍCH" cy={460} size={200} at={L(40.94, 42.3)} countDur={0.5} /></Seq>
      <Seq a={44.16} b={51.2}><Chips title="26 TIỆN ÍCH NỘI KHU" top={450} size={52} items={[["Trường mầm non – THCS", L(44.16, 44.3)], ["Trạm y tế", L(44.16, 47.63)], ["Nhà văn hoá", L(44.16, 48.32)], ["Chợ dân sinh", L(44.16, 49.09)], ["Bãi đỗ xe", L(44.16, 49.92)]]} /></Seq>
      <Seq a={51.2} b={58.08}><Chips title="VẬN ĐỘNG · VUI CHƠI" top={450} size={52} items={[["Khu thể thao", L(51.2, 52.53)], ["Sân bóng rổ", L(51.2, 53.24)], ["Cầu lông", L(51.2, 54.01)], ["Gym ngoài trời", L(51.2, 54.63)], ["Khu vui chơi trẻ em", L(51.2, 55.79)]]} /></Seq>

      {/* ===== KẾT NỐI ===== */}
      <Seq a={57.7} b={58.3}><LightBurst /></Seq>
      <Seq a={58.08} b={59.6}><NeonTitle id="k1" lead="về" main="Kết nối" cy={430} size={190} at={0.1} /></Seq>
      <Seq a={59.6} b={61.01}><HandBold id="k2" variant="bac" small="CHỈ VÀI PHÚT" main="BỆNH VIỆN ĐA KHOA" cy={470} size={110} tone="white" smallTone="cyan" mainAt={0.15} /></Seq>
      <Seq a={61.01} b={63.18}><HandBold id="k3" variant="tay" small="các trường đại học" main="CHỢ TRUNG TÂM" cy={470} size={130} tone="gold" mainAt={L(61.01, 62.2)} /></Seq>
      <Seq a={63.18} b={66.55}><Chips title="ĐI THUẬN TIỆN" top={330} icon="➜" size={58} items={[["Hà Nội", L(63.18, 63.34)], ["Hải Dương", L(63.18, 63.88)], ["Thái Bình", L(63.18, 64.69)]]} /></Seq>
      <Seq a={66.55} b={69.0}><NeonTitle id="k5" lead="qua quốc lộ" main="38 · 39" cy={440} size={200} at={0.5} /></Seq>

      {/* ===== TIẾN ĐỘ + GIÁ TRỊ ===== */}
      <Seq a={69.0} b={71.54}><HandBold id="g1" variant="bac" small="ĐÃ KHỞI CÔNG" main="ĐÚNG TIẾN ĐỘ" cy={460} size={140} tone="gold" smallTone="cyan" mainAt={L(69.0, 70.6)} /></Seq>
      <Seq a={71.54} b={73.44}>{K(17, { "Cơ hội": "cộng đồng", "Đầu Tư": "Cư dân", "Sinh lời": "đông đúc" }, 460, 620)}</Seq>
      <Seq a={73.44} b={75.24}><HandBold id="g3" variant="tay" small="nhà phố vừa là" main="NƠI AN CƯ" cy={470} size={170} tone="cyan" mainAt={L(73.44, 74.85)} /></Seq>
      <Seq a={75.24} b={77.98}><HandBold id="g4" variant="neon" small="mặt bằng kinh doanh" main="CÓ KHÁCH NGAY" cy={460} size={140} tone="gold" mainAt={L(75.24, 76.7)} /></Seq>

      {/* ===== KẾT ===== */}
      <Seq a={77.6} b={78.2}><LightBurst /></Seq>
      <Seq a={77.98} b={79.85}><NeonTitle id="e1" lead="căn đẹp đang được" main="Chọn nhanh" cy={430} size={175} at={0.6} /></Seq>
      <Seq a={79.85} b={HH_HUYEN_SEC}><NeonTitle id="e2" lead="cả nhà" main="Đừng chần chừ" cy={430} size={160} at={0.3} /></Seq>
      </TealOrange>

      {/* Âm thanh: CHỈ giọng ghi âm + SFX (không nhạc nền, không tiếng video) */}
      {stem === "sfx" ? null : <Audio src={staticFile(D + "voice.mp3")} />}
      {stem === "voice" ? null : <SfxTrack cues={alignCues(CUES, fps) as SfxCue[]} />}
    </AbsoluteFill></TextTheme>
  );
};
