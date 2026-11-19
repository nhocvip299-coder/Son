import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile } from "remotion";
import { QtGrade } from "../quyetTranLux/components";
import { RoadText } from "./fill";
import { SerifTitle, SpecBox, StackText, type Palette } from "./typo";

/** Bang DUYET truoc khi edit (du an 3: Vinhomes Ocean Park 2 — shophouse SB-145).
 *  scene 1..8: khung hinh mau theo doan loi; scene 0: so sanh font. Chu o trang thai da vao xong. */
const SRC = "inputs/du-an-3/goc-1080.mp4";
const IMG = (n: number) => staticFile(`inputs/du-an-3/anh/IMG_${n}.jpg`);
const S = -10, E = 99;

const Frame: React.FC<{ t: number }> = ({ t }) => (
  <QtGrade>
    <OffthreadVideo src={staticFile(SRC)} trimBefore={Math.round(t * 60)} muted style={{ width: "100%", height: "100%" }} />
  </QtGrade>
);
/** card anh tram: nen = chinh anh phong to nhoe toi, card bo goc vien trang o giua. */
export const ImgCard: React.FC<{ n: number; y?: number; w?: number; zoom?: number; ox?: number; oy?: number }> = ({ n, y = 0.47, w = 0.92, zoom = 1, ox = 0.5, oy = 0.5 }) => (
  <AbsoluteFill>
    <Img src={IMG(n)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.3)", filter: "blur(28px) brightness(0.45)" }} />
    <div style={{ position: "absolute", left: `${(1 - w) * 50}%`, width: `${w * 100}%`, top: `${y * 100}%`, transform: "translateY(-50%)", borderRadius: 30, overflow: "hidden", border: "4px solid rgba(255,255,255,0.92)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
      <Img src={IMG(n)} style={{ display: "block", width: "100%", transform: `scale(${zoom})`, transformOrigin: `${ox * 100}% ${oy * 100}%` }} />
    </div>
  </AbsoluteFill>
);
const Shade: React.FC<{ top?: number; bot?: number }> = ({ top = 0.55, bot = 0.6 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${top}) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,${bot}) 100%)` }} />
);
const Tag: React.FC<{ s: string }> = ({ s }) => (
  <div style={{ position: "absolute", left: 24, top: 24, padding: "8px 18px", background: "#e8c26e", color: "#1a1206", fontFamily: "Be Vietnam Pro", fontWeight: 800, fontSize: 34, borderRadius: 12 }}>{s}</div>
);

const FONTS: Array<{ k: string; name: string; font: string; w: number; pal: string }> = [
  { k: "A", name: "Montserrat Black · vàng champagne", font: "Montserrat", w: 900, pal: "gold" },
  { k: "B", name: "Playfair Display · serif sang", font: "Playfair Display", w: 900, pal: "gold" },
  { k: "C", name: "Oswald · chữ đứng hẹp bạc hà", font: "Oswald", w: 700, pal: "mint" },
  { k: "D", name: "Be Vietnam Pro Black · trắng", font: "Be Vietnam Pro", w: 900, pal: "white" },
];
const GRAD: Record<string, [string, string, string]> = { gold: ["#fff4d6", "#e8c26e", "#a8742a"], mint: ["#c9fff3", "#45f2d2", "#10c4a3"], white: ["#ffffff", "#ffffff", "#e9ecef"] };

const FontBoard: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Frame t={23.5} />
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)" }} />
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        {Object.entries(GRAD).map(([k, g]) => (
          <linearGradient key={k} id={`fb-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={g[0]} /><stop offset="0.45" stopColor={g[1]} /><stop offset="1" stopColor={g[2]} /></linearGradient>
        ))}
        <filter id="fb-sd"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>
      {FONTS.map((f, i) => {
        const y = 300 + i * 420;
        const st: React.CSSProperties = { fontFamily: f.font, fontWeight: f.w, fontSize: 132 };
        const txt = "70 TRIỆU/M²";
        return (
          <g key={f.k}>
            <text x={60} y={y - 120} fill="#fff" style={{ fontFamily: "Be Vietnam Pro", fontWeight: 800, fontSize: 40 }}>{`${f.k}. ${f.name}`}</text>
            <text x={60} y={y - 60} fill="#fff" opacity={0.9} style={{ fontFamily: "Be Vietnam Pro", fontWeight: 700, fontSize: 40 }}>giá chỉ khoảng · đất Văn Giang</text>
            <g filter="url(#fb-sd)" opacity={0.7} transform="translate(0 5)"><text x={60} y={y + 70} style={st} fill="#000">{txt}</text></g>
            <text x={60} y={y + 70} style={st} fill={`url(#fb-${f.pal})`} stroke={`url(#fb-${f.pal})`} strokeWidth={3.5} strokeLinejoin="round">{txt}</text>
          </g>
        );
      })}
    </svg>
    <Tag s="CHỌN FONT: A / B / C / D" />
  </AbsoluteFill>
);

export type OcpBoardProps = { scene: number; pal?: Palette };
export const OcpBoard: React.FC<OcpBoardProps> = ({ scene, pal = "gold" }) => {
  if (scene === 0) return <FontBoard />;
  const sc: Record<number, React.ReactNode> = {
    1: (<>
      <Frame t={1.0} /><Shade />
      <StackText id="s1" palette="white" end={E} y={0.16} size={64} lines={[{ text: "anh chị có tin được không?", role: "lead", at: S, size: 52 }]} />
      <RoadText value={70} unit="TR/M²" at={S} end={E} y={0.93} size={190} x={0.72} tint="gold" />
      <Tag s="1 · 0–2.6s  Hook: số sơn dưới chân" />
    </>),
    2: (<>
      <ImgCard n={8345} y={0.5} />
      <StackText id="s2" palette={pal} end={E} y={0.14} size={96} lines={[
        { text: "ngay tại Vinhomes Ocean Park 2", role: "lead", at: S, size: 44 },
        { text: "SHOPHOUSE SB-145", role: "main", at: S },
      ]} />
      <StackText id="s2b" palette="white" end={E} y={0.83} size={86} lines={[{ text: "sở hữu", role: "lead", at: S, size: 44 }, { text: "2 MẶT TIỀN", role: "main", at: S }]} />
      <Tag s="2 · 2.7–6.9s  Ảnh trám SB-145" />
    </>),
    3: (<>
      <Frame t={9.0} /><Shade />
      <StackText id="s3" palette={pal} end={E} y={0.17} size={104} lines={[
        { text: "so với đất thổ cư Văn Giang", role: "lead", at: S, size: 46 },
        { text: "KHÔNG CĂN NÀO", role: "main", at: S },
        { text: "sánh được", role: "sub", at: S, size: 50 },
      ]} />
      <Tag s="3 · 6.9–12.2s  So sánh" />
    </>),
    4: (<>
      <Frame t={16.2} /><Shade />
      <StackText id="s4" palette="white" end={E} y={0.17} size={70} lines={[{ text: "trục đường rộng · cả vỉa hè", role: "lead", at: S, size: 50 }]} />
      <RoadText value={20} unit="M" at={S} end={E} y={0.95} size={300} x={0.3} tint="gold" />
      <Tag s="4 · 12.2–26s  20M / 7M + 4M dưới chân" />
    </>),
    5: (<>
      <Frame t={29.0} /><Shade top={0.3} bot={0.75} />
      <StackText id="s5" palette="mint" end={E} y={0.66} size={150} lines={[
        { text: "diện tích đất", role: "lead", at: S },
        { text: "163,8 M²", role: "main", at: S },
        { text: "xây dựng 427,2 m² sàn", role: "sub", at: S },
      ]} />
      <Tag s="5 · 26–40s  Thông số (cảnh toà nhà)" />
    </>),
    6: (<>
      <ImgCard n={8346} y={0.5} zoom={1.9} ox={0.15} oy={0.1} />
      <SpecBox top="GIÁ HTLS 18T" main="23,339 TỶ" at={S} end={E} x={0.95} y={0.2} w={520} />
      <StackText id="s6" palette={pal} end={E} y={0.8} size={120} lines={[
        { text: "áp voucher 30% chỉ còn", role: "lead", at: S, size: 46 },
        { text: "HƠN 15 TỶ", role: "main", at: S },
      ]} />
      <Tag s="6 · 40.6–48.6s  Giá + bảng tính" />
    </>),
    7: (<>
      <ImgCard n={8343} y={0.5} zoom={1.6} ox={0.3} oy={0.55} />
      <StackText id="s7" palette={pal} end={E} y={0.14} size={92} lines={[
        { text: "vị trí cực kỳ đắc địa", role: "lead", at: S, size: 46 },
        { text: "HƯỚNG MASTERI", role: "main", at: S },
        { text: "Trinity Square", role: "sub", at: S, size: 50 },
      ]} />
      <Tag s="7 · 48.7–53s  Bản đồ vị trí" />
    </>),
    8: (<>
      <Frame t={79.0} />
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.25)" }} />
      <SerifTitle text="SHOPHOUSE SB-145" at={S} end={E} y={0.1} size={70} />
      <SpecBox top="LIÊN HỆ EM SƠN" main="0966 312 333" at={S} end={E} x={0.95} y={0.62} w={500} />
      <Tag s="8 · 72–81s  Kêu gọi + SĐT" />
    </>),
  };
  return <AbsoluteFill style={{ backgroundColor: "#000" }}>{sc[scene]}</AbsoluteFill>;
};
