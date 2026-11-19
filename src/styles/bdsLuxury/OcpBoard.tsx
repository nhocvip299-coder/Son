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

/** anh tram PHU KIN man hinh (cover) + zoom vao chi tiet. px/py = object-position, zoom quanh (ox,oy) cua khung. */
export const ImgFull: React.FC<{ n: number; px?: number; py?: number; zoom?: number; ox?: number; oy?: number }> = ({ n, px = 0.5, py = 0.5, zoom = 1, ox = 0.5, oy = 0.5 }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Img src={IMG(n)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${px * 100}% ${py * 100}%`, transform: `scale(${zoom})`, transformOrigin: `${ox * 100}% ${oy * 100}%`, filter: "contrast(1.05) saturate(1.08)" }} />
  </AbsoluteFill>
);
const SF = "Playfair Display";


const V2: Record<number, React.ReactNode> = {
  1: (<>
    <Frame t={1.0} /><Shade top={0.6} bot={0.3} />
    <StackText id="a1" palette="serif" end={E} y={0.14} size={150} lines={[
      { text: "chỉ khoảng", role: "lead", at: S, size: 50 },
      { text: "70 TRIỆU/M²", role: "main", at: S, size: 132 },
      { text: "đất · anh chị có tin không?", role: "sub", at: S, size: 46 },
    ]} />
    <RoadText value={70} unit="TR" at={S} end={E} y={0.93} size={230} x={0.5} tint="gold" font={SF} />
    <Tag s="1 · 0–2.6s  Hook: giá trên đầu + số sơn dưới chân" />
  </>),
  2: (<>
    <ImgFull n={8345} px={0.53} zoom={1.08} /><Shade top={0.85} bot={0.8} />
    <StackText id="a2" palette="serif" end={E} y={0.12} size={112} lines={[
      { text: "Vinhomes Ocean Park 2", role: "lead", at: S, size: 50 },
      { text: "SHOPHOUSE", role: "main", at: S },
    ]} />
    <StackText id="a2b" palette="white" end={E} y={0.84} size={96} lines={[{ text: "sở hữu", role: "lead", at: S, size: 46 }, { text: "2 MẶT TIỀN ĐƯỜNG", role: "main", at: S, size: 84 }]} />
    <Tag s="2 · 2.7–6.9s  Ảnh SB-145 full màn, zoom chậm" />
  </>),
  3: (<>
    <Frame t={9.0} /><Shade top={0.65} bot={0.3} />
    <StackText id="a3" palette="serif" end={E} y={0.13} size={110} lines={[
      { text: "so với đất thổ cư Văn Giang", role: "lead", at: S, size: 46 },
      { text: "KHÔNG CĂN NÀO", role: "main", at: S },
      { text: "sánh được", role: "sub", at: S, size: 54, italic: true },
    ]} />
    <Tag s="3 · 6.9–12.2s  So sánh (chữ trên đầu)" />
  </>),
  4: (<>
    <Frame t={16.2} /><Shade top={0.6} bot={0.2} />
    <StackText id="a4" palette="white" end={E} y={0.16} size={80} lines={[{ text: "trục đường rộng", role: "lead", at: S, size: 52 }, { text: "cả vỉa hè", role: "sub", at: S, size: 44 }]} />
    <RoadText value={20} unit="M" at={S} end={E} y={0.95} size={320} x={0.5} tint="gold" font={SF} />
    <Tag s="4 · 13–16.8s  20M sơn dưới chân" />
  </>),
  5: (<>
    <Frame t={24.0} /><Shade top={0.6} bot={0.2} />
    <StackText id="a5" palette="white" end={E} y={0.15} size={80} lines={[{ text: "mặt đường bên này", role: "lead", at: S, size: 52 }]} />
    <RoadText value={7} unit="M" at={S} end={E} y={0.95} size={300} x={0.3} tint="gold" font={SF} />
    <RoadText value={4} unit="M" at={S} end={E} y={0.95} size={220} x={0.76} tint="gold" font={SF} />
    <StackText id="a5b" palette="white" end={E} y={0.79} x={0.76} size={60} lines={[{ text: "vỉa hè", role: "lead", at: S, size: 40 }]} />
    <Tag s="5 · 19–26s  Đường 7M + vỉa hè 4M" />
  </>),
  6: (<>
    <ImgFull n={8344} zoom={1.3} ox={0.5} oy={0.3} /><AbsoluteFill style={{ background: "rgba(0,0,0,0.25)" }} /><Shade top={0.6} bot={0.8} />
    <StackText id="a6" palette="serif" end={E} y={0.72} size={150} lines={[
      { text: "diện tích đất", role: "lead", at: S, size: 50 },
      { text: "163,8 M²", role: "main", at: S },
      { text: "tổng sàn 427,2 m²", role: "sub", at: S, size: 52 },
    ]} />
    <Tag s="6 · 26–33s  Poster zoom bảng thông số" />
  </>),
  7: (<>
    <Frame t={37.3} /><Shade top={0.5} bot={0.7} />
    <StackText id="a7" palette="serif" end={E} y={0.7} size={150} lines={[
      { text: "bàn giao thô · có thang", role: "lead", at: S, size: 46 },
      { text: "XẺ KHE 3M", role: "main", at: S, size: 140 },
      { text: "thông thoáng hơn liền kề thường", role: "sub", at: S, size: 42 },
    ]} />
    <Tag s="7 · 33–40.5s  Xẻ khe (cảnh hông nhà)" />
  </>),
  8: (<>
    <ImgFull n={8344} zoom={2.3} ox={0.78} oy={0.345} /><AbsoluteFill style={{ background: "rgba(0,0,0,0.3)" }} /><Shade top={0.6} bot={0.8} />
    <StackText id="a8" palette="serif" end={E} y={0.64} size={160} lines={[
      { text: "giá 23,339 tỷ · áp voucher 30%", role: "lead", at: S, size: 46 },
      { text: "chỉ còn", role: "sub", at: S, size: 52, italic: true },
      { text: "HƠN 15 TỶ", role: "main", at: S },
    ]} />
    <Tag s="8 · 43–48.6s  Poster zoom ô giá" />
  </>),
  9: (<>
    <ImgFull n={8343} px={0.26} zoom={1.25} ox={0.5} oy={0.52} /><Shade top={0.9} bot={0.5} />
    <StackText id="a9" palette="serif" end={E} y={0.12} size={100} lines={[
      { text: "vị trí cực kỳ đắc địa", role: "lead", at: S, size: 48 },
      { text: "HƯỚNG MASTERI", role: "main", at: S },
      { text: "Trinity Square", role: "sub", at: S, size: 56, italic: true },
    ]} />
    <Tag s="9 · 48.7–53s  Bản đồ zoom ghim SB-145" />
  </>),
  10: (<>
    <Frame t={59.0} /><Shade top={0.65} bot={0.3} />
    <StackText id="a10" palette="serif" end={E} y={0.13} size={140} lines={[
      { text: "bóc tách giá xây dựng · chỉ khoảng", role: "lead", at: S, size: 42 },
      { text: "70 TRIỆU", role: "main", at: S },
      { text: "/ m² đất", role: "sub", at: S, size: 60 },
    ]} />
    <Tag s="10 · 53–60s  Chốt 70 triệu/m²" />
  </>),
  11: (<>
    <Frame t={68.0} /><Shade top={0.65} bot={0.3} />
    <StackText id="a11" palette="serif" end={E} y={0.14} size={130} lines={[
      { text: "chính sách mới Vinhomes · thanh toán sớm", role: "lead", at: S, size: 40 },
      { text: "CHIẾT KHẤU", role: "main", at: S, size: 110 },
      { text: "THÊM 7,5%", role: "main", at: S, size: 150 },
    ]} />
    <Tag s="11 · 60–72s  Rẻ hơn cắt lỗ + chiết khấu" />
  </>),
  12: (<>
    <Frame t={79.0} /><Shade top={0.6} bot={0.4} />
    <StackText id="a12" palette="serif" end={E} y={0.13} size={110} lines={[
      { text: "tài chính 15 tỷ · 2 mặt tiền · xẻ khe", role: "lead", at: S, size: 40 },
      { text: "SHOPHOUSE SB-145", role: "main", at: S, size: 84 },
    ]} />
    <SpecBox top="LIÊN HỆ EM SƠN" main="0966 312 333" at={S} end={E} x={0.75} y={0.86} w={560} h={170} />
    <Tag s="12 · 72–81s  Kêu gọi + SĐT" />
  </>),
};

export type OcpBoardProps = { scene: number; pal?: Palette; v?: number };
export const OcpBoard: React.FC<OcpBoardProps> = ({ scene, pal = "serif", v = 2 }) => {
  if (scene === 0) return <FontBoard />;
  if (v === 2) return <AbsoluteFill style={{ backgroundColor: "#000" }}>{V2[scene]}</AbsoluteFill>;
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
