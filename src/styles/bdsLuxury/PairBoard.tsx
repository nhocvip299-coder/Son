import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";

/** Bang 6 CAP FONT hoc tu Phu Films (cac bai "Cac cap font chu Viet hoa"), dung font MIEN PHI thay the, noi dung video SB-145. */
const G = (id: string, a = "#fff6d8", b = "#ffd36a", c = "#d9902a") => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="0.5" stopColor={b} /><stop offset="1" stopColor={c} /></linearGradient>
);
const glow = (c = "rgba(255,170,60,0.75)", r = 10) => `drop-shadow(0 0 ${r}px ${c}) drop-shadow(0 4px 3px rgba(0,0,0,0.75))`;
const T: React.FC<{ x: number; y: number; s: string; f: string; w?: number; size: number; fill?: string; it?: boolean; ls?: string; anchor?: "start" | "middle" | "end"; filt?: string; rot?: number; stroke?: string }> = ({ x, y, s, f, w = 400, size, fill = "#fff", it, ls = "0", anchor = "middle", filt, rot, stroke }) => (
  <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" fill={fill} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}
    style={{ fontFamily: f, fontWeight: w, fontSize: size, fontStyle: it ? "italic" : "normal", letterSpacing: ls, filter: filt ?? "drop-shadow(0 3px 3px rgba(0,0,0,0.8))" }}
    stroke={stroke} strokeWidth={stroke ? size * 0.03 : undefined} paintOrder="stroke">{s}</text>
);

const Tile: React.FC<{ i: number; title: string; pf: string; ours: string; children: React.ReactNode }> = ({ i, title, pf, ours, children }) => {
  const x = (i % 2) * 540, y = Math.floor(i / 2) * 640;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={14} y={14} width={512} height={612} rx={24} fill="rgba(10,6,4,0.55)" stroke="rgba(255,200,120,0.35)" strokeWidth={2} />
      <T x={270} y={52} s={`${i + 1}. ${title}`} f="Be Vietnam Pro" w={800} size={22} fill="#ffd36a" />
      {children}
      <rect x={40} y={500} width={460} height={100} rx={16} fill="rgba(0,0,0,0.55)" stroke="rgba(255,90,60,0.8)" strokeWidth={2} />
      <T x={270} y={530} s={`Phú Films: ${pf}`} f="Be Vietnam Pro" w={600} size={17} fill="rgba(255,255,255,0.8)" filt="none" />
      <T x={270} y={568} s={`Bản miễn phí: ${ours}`} f="Be Vietnam Pro" w={800} size={18} fill="#fff" filt="none" />
    </g>
  );
};

export const PairBoard: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#120806" }}>
    <AbsoluteFill style={{ filter: "blur(18px) brightness(0.45) saturate(1.1)", transform: "scale(1.1)" }}>
      <OffthreadVideo src={staticFile("inputs/du-an-3/goc-1080.mp4")} trimBefore={Math.round(59 * 60)} muted />
    </AbsoluteFill>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>{G("gold")}{G("cream", "#ffffff", "#fff2d6", "#e9d3a6")}{G("red", "#ffd3c8", "#ff5a3c", "#c5180c")}</defs>
      {/* 1. Montserrat dam IN HOA + Playfair nghieng — Phu Films goi y cho BDS CAO CAP */}
      <Tile i={0} title="Sans đậm + serif nghiêng (BĐS cao cấp)" pf="Montserrat + PlayfairDisplay-Italic" ours="Montserrat 900 + Playfair Italic">
        <T x={270} y={235} s="SHOPHOUSE" f="Montserrat" w={900} size={66} fill="url(#gold)" filt={glow()} />
        <T x={270} y={305} s="Vinhomes Ocean Park 2" f="Playfair Display" w={700} it size={40} />
        <T x={270} y={395} s="SB-145" f="Montserrat" w={900} size={64} fill="url(#cream)" filt={glow("rgba(255,220,160,0.6)", 8)} />
      </Tile>
      {/* 2. Viet tay bay + sans dam IN HOA — Blacksword+American Sans / Frista+Montserrat / Bacalisties+Gotham */}
      <Tile i={1} title="Viết tay bay + sans đậm" pf="Blacksword + American Sans" ours="Great Vibes + Montserrat 800">
        <T x={270} y={230} s="Đặc biệt nhất" f="Great Vibes" w={400} size={86} fill="url(#gold)" filt={glow()} rot={-6} />
        <T x={270} y={330} s="2 MẶT TIỀN" f="Montserrat" w={800} size={72} />
        <T x={270} y={398} s="TRƯỚC – SAU" f="Montserrat" w={600} size={30} ls="0.35em" fill="#ffd36a" />
      </Tile>
      {/* 3. Serif hoa lon + sans hoa gian (Con Rong / CHAU TIEN) — Rogie + Montserrat SemiBold */}
      <Tile i={2} title="Serif lớn + sans giãn chữ" pf="Rogie + Montserrat SemiBold" ours="Playfair 900 + Montserrat 600">
        <T x={270} y={215} s="Vị trí" f="Playfair Display" w={900} size={92} fill="url(#gold)" filt={glow()} />
        <T x={270} y={315} s="Đắc địa" f="Playfair Display" w={900} size={92} fill="url(#gold)" filt={glow()} />
        <T x={270} y={400} s="HƯỚNG MASTERI" f="Montserrat" w={600} size={34} ls="0.18em" />
      </Tile>
      {/* 4. Chu dung hep cuc day + viet tay nho (Hung Vuong / Faltura+Hand of Sean) — Romeda + UTM Bebas */}
      <Tile i={3} title="Chữ đứng hẹp cực dày + viết tay" pf="UTM Bebas / Faltura + Hand of Sean" ours="Oswald 700 + Dancing Script">
        <T x={270} y={190} s="áp voucher 30%" f="Dancing Script" w={700} size={46} fill="#fff" rot={-5} />
        <T x={270} y={300} s="HƠN 15 TỶ" f="Oswald" w={700} size={112} fill="url(#red)" filt={glow("rgba(255,70,40,0.7)", 10)} />
        <T x={270} y={405} s="giá đã cộng chiết khấu" f="Dancing Script" w={700} size={36} fill="#ffd36a" />
      </Tile>
      {/* 5. Khoi so lon + chu nho ghep o (51 NAM / 30-04) — Bacalisties + Gotham */}
      <Tile i={4} title="Khối số lớn + chữ ghép ô" pf="Bacalisties + Gotham Bold" ours="Oswald 700 + Montserrat 800">
        <T x={200} y={290} s="70" f="Oswald" w={700} size={230} fill="url(#gold)" filt={glow()} />
        <rect x={318} y={198} width={150} height={62} rx={6} fill="none" stroke="#ffd36a" strokeWidth={4} />
        <T x={393} y={230} s="TRIỆU" f="Montserrat" w={800} size={36} fill="#ffd36a" />
        <T x={393} y={300} s="/M²" f="Montserrat" w={900} size={58} />
        <T x={393} y={362} s="ĐẤT" f="Montserrat" w={900} size={58} />
      </Tile>
      {/* 6. Serif hoa co dien + viet tay (Lac Hong / Alexander+Bestagrach; Brand Pro+Analogue = tan co dien, shophouse) */}
      <Tile i={5} title="Serif cổ điển + viết tay (tân cổ điển)" pf="UTM Alexander + Bestagrach" ours="Playfair 900 + Dancing Script">
        <T x={270} y={200} s="thoáng 3 mặt" f="Dancing Script" w={700} size={50} fill="#fff" rot={-4} />
        <T x={270} y={305} s="XẺ KHE" f="Playfair Display" w={900} size={104} fill="url(#gold)" filt={glow()} />
        <T x={270} y={400} s="rộng 3 mét" f="Playfair Display" w={700} it size={42} fill="#fff" />
      </Tile>
    </svg>
  </AbsoluteFill>
);
