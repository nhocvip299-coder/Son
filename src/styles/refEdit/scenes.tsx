/**
 * [AI - theo nguoi dung] Canh tram MINH HOA DONG (thay nen toi truu tuong): troi sang + bai co, do hoa vector SVG
 * mo phong dung noi dung cau noi (dat bo hoang, nha, shophouse, dong xu, bieu do, can...).
 * Bo cuc 1080x1920: khung nguoi noi PiP goc tren-phai (x>=716, y<=656) -> minh hoa trong dai y 660-1080 (mat dat GY),
 * chu nhan (setupPunch/contrast/pills) o dai co 1190-1400 (trong vung an toan TikTok/Reels).
 * Moc thoi gian `cues` = giay tinh tu dau canh.
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring } from "remotion";
import { Typed, useSec } from "./components";
import { RT } from "./tokens";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GY = 1080; // mat dat
type Cues = Record<string, number>;

/** tien do xuat hien co nay (spring) */
const usePop = () => {
  const { f, fps, t } = useSec();
  return (at = 0, stiff = 200) => (t < at ? 0 : spring({ frame: f - Math.round(at * fps), fps, config: { damping: 11, stiffness: stiff, mass: 0.6 } }));
};
const lin = (t: number, a: number, d: number) => interpolate(t, [a, a + d], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });

// ---------- Nen ----------
const Sky: React.FC = () => {
  // [SUA theo nguoi dung: "mau tre con"] tong bien tap/tai chinh: nen kem cat + luoi ban ve mo, pho xa mau da, san xanh da tram, vien vang dong
  const { t } = useSec();
  const sweep = ((t * 120) % 1600) - 300;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9E2D6" />
          <stop offset="0.56" stopColor="#D8CDBB" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#566B70" />
          <stop offset="0.4" stopColor="#43575D" />
          <stop offset="1" stopColor="#33454B" />
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#sky)" />
      {/* luoi ban ve */}
      <g stroke="#6E6656" strokeOpacity="0.07" strokeWidth="2">
        {Array.from({ length: 19 }, (_, i) => <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2={GY} />)}
        {Array.from({ length: 18 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 60} x2="1080" y2={i * 60} />)}
      </g>
      <rect x={sweep} y="0" width="300" height={GY} fill="url(#shine)" transform={`skewX(-18)`} />
      {/* pho xa */}
      <g fill="#C8BCA8">
        {[[0, 140, 120], [130, 90, 190], [230, 120, 150], [360, 80, 230], [450, 130, 170], [590, 100, 210], [700, 140, 130], [850, 90, 200], [950, 130, 160]].map(([x, w, h], i) => (
          <g key={i}>
            <rect x={x} y={GY - h} width={w} height={h} />
            {Array.from({ length: Math.floor(h / 40) }, (_, r) => <rect key={r} x={x + 14} y={GY - h + 14 + r * 40} width={w - 28} height="10" fill="#B9AC96" />)}
          </g>
        ))}
      </g>
      <rect y={GY} width="1080" height={1920 - GY} fill="url(#floor)" />
      <rect y={GY} width="1080" height="6" fill="#C9A24A" />
      <path d={`M 0 ${GY + 70} L 1080 ${GY + 70}`} stroke="#8FA3A6" strokeWidth="2" strokeDasharray="30 22" opacity={0.5} />
    </svg>
  );
};

// ---------- Nhan chu (the toi tren nen sang) ----------
export const Chip: React.FC<{ x: number; y: number; text: string; at: number; size?: number; tone?: "dark" | "red" | "green" | "gold"; icon?: "x" | "v"; anchor?: "center" | "left" }> = ({
  x,
  y,
  text,
  at,
  size = 46,
  tone = "dark",
  icon,
  anchor = "center",
}) => {
  const pop = usePop();
  const p = pop(at, 260);
  if (p <= 0) return null;
  const bg = { dark: "rgba(30,40,50,0.92)", red: "linear-gradient(180deg,#B4533A,#8E3B28)", green: "linear-gradient(180deg,#5F8B6E,#3F6650)", gold: "linear-gradient(180deg,#D4B062,#B08A38)" }[tone];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: anchor === "center" ? "-50% -50%" : "0 -50%",
        scale: String(interpolate(p, [0, 1], [0.4, 1])),
        opacity: Math.min(1, p * 1.6),
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: `${size * 0.26}px ${size * 0.5}px`,
        borderRadius: size * 0.55,
        background: bg,
        border: "3px solid rgba(233,226,214,0.9)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
        whiteSpace: "nowrap",
      }}
    >
      {icon ? (
        <div style={{ width: size * 0.95, height: size * 0.95, borderRadius: "50%", background: icon === "v" ? "#4F7D62" : "#B23A2A", border: "3px solid #fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: RT.font.punch, fontWeight: 900, fontSize: size * 0.62 }}>
          {icon === "v" ? "✓" : "✕"}
        </div>
      ) : null}
      <Typed
        text={text}
        at={at}
        style={{ fontFamily: RT.font.punch, fontWeight: 800, fontSize: size, color: tone === "gold" ? "#3A2600" : "#fff", lineHeight: 1.1, textShadow: tone === "gold" ? "none" : "0 2px 4px rgba(0,0,0,0.5)" }}
      />
    </div>
  );
};

/** con dau do dap xuong */
const Stamp: React.FC<{ x: number; y: number; text: string; at: number; rot?: number; size?: number }> = ({ x, y, text, at, rot = -10, size = 96 }) => {
  const { t } = useSec();
  if (t < at) return null;
  const k = interpolate(t, [at, at + 0.18], [0, 1], { ...C, easing: Easing.in(Easing.quad) });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        rotate: `${rot}deg`,
        scale: String(interpolate(k, [0, 1], [2.4, 1])),
        opacity: k,
        padding: "14px 34px",
        border: "9px solid #B23A2A",
        borderRadius: 26,
        color: "#B23A2A",
        background: "rgba(255,255,255,0.82)",
        fontFamily: RT.font.punch,
        fontWeight: 900,
        fontSize: size,
        whiteSpace: "nowrap",
        boxShadow: `0 0 ${30 * (1 - k) + 8}px rgba(232,38,26,0.6)`,
      }}
    >
      {text}
    </div>
  );
};

// ---------- Hinh ve ----------
const House: React.FC<{ x: number; w: number; h: number; body?: string; roof?: string; lit?: number; closed?: boolean; base?: number }> = ({ x, w, h, body = "#EFE8DC", roof = "#A9503C", lit = 1, closed, base = GY }) => {
  const y = base - h;
  const win = closed ? "#5B6B7C" : interpolate(lit, [0, 1], [0, 1]) > 0.5 ? "#E3C485" : "#A9B7C0";
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={body} stroke="#6B4A2E" strokeWidth="4" rx="4" />
      <polygon points={`${x - 26},${y + 4} ${x + w / 2},${y - h * 0.55} ${x + w + 26},${y + 4}`} fill={roof} stroke="#6E3324" strokeWidth="4" />
      <rect x={x + w * 0.4} y={base - h * 0.45} width={w * 0.2} height={h * 0.45} fill={closed ? "#6E5440" : "#8B5A33"} />
      {[0.12, 0.68].map((fx, i) => (
        <g key={i}>
          <rect x={x + w * fx} y={y + h * 0.18} width={w * 0.2} height={h * 0.24} fill={win} stroke="#6B4A2E" strokeWidth="3" />
          {closed ? <line x1={x + w * fx} y1={y + h * 0.18} x2={x + w * (fx + 0.2)} y2={y + h * 0.42} stroke="#3B4652" strokeWidth="4" /> : null}
        </g>
      ))}
    </g>
  );
};

const Villa: React.FC<{ x: number; w: number }> = ({ x, w }) => {
  const h = 300;
  const y = GY - h;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#E6E1D8" stroke="#5E6A75" strokeWidth="4" />
      <rect x={x - 14} y={y - 22} width={w + 28} height={26} fill="#3E4E5E" />
      <rect x={x} y={y + h * 0.48} width={w} height={10} fill="#C9C2B4" />
      {[0.1, 0.4, 0.7].map((fx, i) => (
        <g key={i}>
          <rect x={x + w * fx} y={y + 30} width={w * 0.2} height={95} fill="#BAC4C9" stroke="#5E6A75" strokeWidth="3" />
          {/* rem dong */}
          <rect x={x + w * fx} y={y + 30} width={w * 0.2} height={95} fill="#B9A38A" opacity={0.85} />
          <rect x={x + w * fx} y={y + 175} width={w * 0.2} height={95} fill="#B9A38A" opacity={0.85} stroke="#5E6A75" strokeWidth="3" />
        </g>
      ))}
      {/* cong khoa */}
      <rect x={x - 40} y={GY - 70} width={w + 80} height={70} fill="none" stroke="#2F3B47" strokeWidth="5" />
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1={x - 40 + ((w + 80) * i) / 13} y1={GY - 70} x2={x - 40 + ((w + 80) * i) / 13} y2={GY} stroke="#2F3B47" strokeWidth="4" />
      ))}
    </g>
  );
};

const Weeds: React.FC<{ x0: number; x1: number; n?: number; h?: number }> = ({ x0, x1, n = 18, h = 60 }) => {
  const { t } = useSec();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + ((x1 - x0) * (i + 0.5)) / n;
        const hh = h * (0.6 + ((i * 37) % 10) / 20);
        const sw = Math.sin(t * 2.4 + i) * 8;
        return <path key={i} d={`M ${x - 10} ${GY} Q ${x + sw * 0.5} ${GY - hh * 0.6} ${x + sw} ${GY - hh} Q ${x + 4} ${GY - hh * 0.5} ${x + 10} ${GY} Z`} fill={i % 2 ? "#66755A" : "#7F8F6A"} />;
      })}
    </g>
  );
};

const Fence: React.FC<{ x0: number; x1: number; broken?: boolean }> = ({ x0, x1, broken }) => (
  <g stroke="#8A6A45" strokeWidth="8" strokeLinecap="round">
    <line x1={x0} y1={GY - 60} x2={x1} y2={GY - 60 + (broken ? 18 : 0)} />
    {Array.from({ length: Math.round((x1 - x0) / 70) + 1 }, (_, i) => (
      <line key={i} x1={x0 + i * 70} y1={GY} x2={x0 + i * 70 + (broken && i % 3 === 1 ? 14 : 0)} y2={GY - 90} />
    ))}
  </g>
);

const Coin: React.FC<{ x: number; y: number; r?: number; o?: number }> = ({ x, y, r = 30, o = 1 }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill="#C9A24A" stroke="#8A6A2A" strokeWidth="4" />
    <circle cx={x} cy={y} r={r * 0.68} fill="none" stroke="#E3C485" strokeWidth="3" />
    <text x={x} y={y + r * 0.3} textAnchor="middle" fontSize={r * 0.9} fontWeight={900} fill="#6E5220" fontFamily="Phudu">
      đ
    </text>
  </g>
);

const Person: React.FC<{ x: number; color?: string; bob?: number; s?: number; base?: number }> = ({ x, color = "#34495E", bob = 0, s = 1, base = GY }) => (
  <g transform={`translate(${x} ${base - Math.abs(bob) * 6}) scale(${s})`}>
    <circle cx="0" cy="-150" r="26" fill="#F2C9A0" stroke="#5A3B22" strokeWidth="3" />
    <path d="M -16 -168 Q 0 -186 18 -166 L 18 -160 L -18 -160 Z" fill="#2B2420" />
    <rect x="-28" y="-122" width="56" height="74" rx="18" fill={color} />
    <line x1="-12" y1="-50" x2={-14 + bob * 8} y2="0" stroke="#33404F" strokeWidth="13" strokeLinecap="round" />
    <line x1="12" y1="-50" x2={14 - bob * 8} y2="0" stroke="#33404F" strokeWidth="13" strokeLinecap="round" />
  </g>
);

const Shophouse: React.FC<{ x: number; w: number; shutter: number; color: string; light?: boolean }> = ({ x, w, shutter, color, light }) => {
  const h = 420;
  const y = GY - h;
  const doorH = 150;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={color} stroke="#4A3B30" strokeWidth="4" />
      <rect x={x - 10} y={y - 18} width={w + 20} height={22} fill="#4A3B30" />
      {[0, 1].map((r) => (
        <g key={r}>
          <rect x={x + 30} y={y + 30 + r * 110} width={w - 60} height={80} fill={light ? "#E8D3A0" : "#A9B7C0"} stroke="#4A3B30" strokeWidth="3" />
          <line x1={x + w / 2} y1={y + 30 + r * 110} x2={x + w / 2} y2={y + 110 + r * 110} stroke="#4A3B30" strokeWidth="3" />
        </g>
      ))}
      {/* mai hien */}
      <path d={`M ${x - 6} ${GY - doorH - 30} L ${x + w + 6} ${GY - doorH - 30} L ${x + w + 26} ${GY - doorH + 10} L ${x - 26} ${GY - doorH + 10} Z`} fill={light ? "#A9503C" : "#8E8E8E"} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={x - 26 + ((w + 52) * i) / 6} y={GY - doorH - 30} width={(w + 52) / 12} height={40} fill="#fff" opacity={light ? 0.7 : 0.35} />
      ))}
      <rect x={x + 20} y={GY - doorH + 10} width={w - 40} height={doorH - 10} fill={light ? "#E3C485" : "#2E3440"} />
      {/* cua cuon */}
      <rect x={x + 20} y={GY - doorH + 10} width={w - 40} height={(doorH - 10) * shutter} fill="#9AA3AD" />
      {Array.from({ length: Math.floor(shutter * 9) }, (_, i) => (
        <line key={i} x1={x + 20} x2={x + w - 20} y1={GY - doorH + 24 + i * 15} y2={GY - doorH + 24 + i * 15} stroke="#7B848E" strokeWidth="3" />
      ))}
    </g>
  );
};

const Arrow: React.FC<{ x0: number; y0: number; x1: number; y1: number; p: number; color?: string; w?: number }> = ({ x0, y0, x1, y1, p, color = "#B23A2A", w = 14 }) => {
  const xe = x0 + (x1 - x0) * p;
  const ye = y0 + (y1 - y0) * p;
  const a = Math.atan2(y1 - y0, x1 - x0);
  const hl = 40;
  return p <= 0 ? null : (
    <g>
      <line x1={x0} y1={y0} x2={xe} y2={ye} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${xe + Math.cos(a) * 14},${ye + Math.sin(a) * 14} ${xe - Math.cos(a - 0.5) * hl},${ye - Math.sin(a - 0.5) * hl} ${xe - Math.cos(a + 0.5) * hl},${ye - Math.sin(a + 0.5) * hl}`} fill={color} />
    </g>
  );
};

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    {children}
  </svg>
);

const pg = (p: number, from = 60) => ({ transform: `translate(0px, ${interpolate(p, [0, 1], [from, 0])}px)`, opacity: Math.min(1, p * 1.5) });

// ---------- Cac canh ----------
/** A. Dat bo hoang + dau THUE 0,2% */
const LandTax: React.FC<{ c: Cues }> = ({ c }) => {
  const pop = usePop();
  const p = pop(0.1);
  return (
    <>
      <Svg>
        <g style={pg(p)}>
          <rect x="120" y={GY - 6} width="840" height="12" fill="#A57B4F" />
          <Weeds x0={130} x1={950} n={26} h={80} />
          <Fence x0={120} x1={960} broken />
          <rect x="250" y={GY - 210} width="12" height="150" fill="#6B4A2E" />
        </g>
      </Svg>
      <Chip x={256} y={GY - 220} text="Đất bỏ hoang" at={0.3} size={50} />
      <Stamp x={660} y={880} text="THUẾ 0,2%" at={c.stamp ?? 0.8} />
    </>
  );
};

/** B. Tai san 10 ty x 0,2% -> ~20 trieu/nam */
const TaxCalc: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const h = pop(0.05);
  const ar = lin(t, c.arrow, 0.5);
  const coinsP = lin(t, c.coins, 1.2);
  const n = Math.round(coinsP * 8);
  return (
    <>
      <Svg>
        <g style={pg(h)}>
          <House x={110} w={300} h={230} />
        </g>
        <Arrow x0={450} y0={900} x1={640} y1={900} p={ar} color="#B87333" />
        {Array.from({ length: n }, (_, i) => (
          <Coin key={i} x={820 + (i % 2) * 12} y={GY - 26 - i * 22} r={44} />
        ))}
      </Svg>
      <Chip x={260} y={705} text="Tài sản 10 tỷ" at={0.3} tone="gold" size={52} />
      {ar > 0 ? <Chip x={545} y={835} text="× 0,2%" at={c.arrow} size={42} /> : null}
      <Chip x={820} y={790} text="≈ 20 triệu/năm" at={c.coins} tone="red" size={46} />
    </>
  );
};

/** C. Dat bo hoang (thue) VS Biet thu chua ve o (khong mac dinh thue) */
const LandVsVilla: React.FC<{ c: Cues }> = ({ c }) => {
  const pop = usePop();
  const l = pop(c.left);
  const r = pop(c.right);
  return (
    <>
      <Svg>
        <g style={pg(l)}>
          <Weeds x0={50} x1={480} n={14} h={90} />
          <Fence x0={40} x1={490} broken />
        </g>
        <g style={pg(r)}>
          <Villa x={640} w={330} />
        </g>
        <line x1="540" y1="700" x2="540" y2={GY + 40} stroke="#fff" strokeWidth="6" strokeDasharray="18 14" opacity={0.9} />
      </Svg>
      <div style={{ position: "absolute", left: 540, top: 880, translate: "-50% -50%", fontFamily: RT.font.punch, fontWeight: 900, fontSize: 84, color: "#C9A24A", WebkitTextStroke: "4px #2A2418", paintOrder: "stroke fill", opacity: Math.min(l, 1) }}>VS</div>
      <Chip x={265} y={850} text="BĐS bỏ hoang" at={c.left} size={50} />
      <Chip x={805} y={770} text="Biệt thự chưa về ở" at={c.right} size={44} />
      <Chip x={265} y={1190} text="Chịu thuế 0,2%" at={c.leftRow} tone="red" icon="x" size={44} />
      <Chip x={805} y={1190} text="Không mặc định bị thuế" at={c.rightRow} tone="green" icon="v" size={38} />
    </>
  );
};

/** D. Ap luc that: 3 qua ta de len ngoi nha; thue 0,2% chi la dong xu nho */
const Pressure: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const ws = [c.w1, c.w2, c.w3];
  const drop = ws.map((a) => (t < a ? 0 : interpolate(t, [a, a + 0.35], [0, 1], { ...C, easing: Easing.bounce })));
  const squash = 1 - drop.reduce((s, d) => s + d * 0.035, 0);
  const labels = ["Lãi vay", "Quản lý, bảo trì", "Chi phí cơ hội"];
  const fe = pop(c.feather);
  return (
    <>
      <Svg>
        <g transform={`translate(540 ${GY}) scale(1 ${squash}) translate(-540 ${-GY})`}>
          <House x={390} w={300} h={220} />
        </g>
        {ws.map((_, i) => {
          const yT = GY - 220 * squash - 120 - 6 - i * 96;
          const y = interpolate(drop[i], [0, 1], [-200, yT]);
          return drop[i] > 0 ? (
            <g key={i}>
              <polygon points={`${360},${y + 90} ${720},${y + 90} ${690},${y} ${390},${y}`} fill={["#4A5568", "#5A6578", "#6B7689"][i]} stroke="#1F2733" strokeWidth="4" />
            </g>
          ) : null;
        })}
        {fe > 0 ? (
          <g transform={`translate(0 ${Math.sin(t * 3) * 10})`}>
            <Coin x={170} y={820} r={34 * fe} />
          </g>
        ) : null}
      </Svg>
      {ws.map((a, i) => {
        const yT = GY - 220 * squash - 120 - 6 - i * 96 + 45;
        return drop[i] > 0 ? (
          <div key={i} style={{ position: "absolute", left: 540, top: interpolate(drop[i], [0, 1], [-155, yT]), translate: "-50% -50%", fontFamily: RT.font.punch, fontWeight: 800, fontSize: 42, color: "#fff", whiteSpace: "nowrap" }}>
            {labels[i]}
          </div>
        ) : null;
      })}
      {fe > 0 ? <Chip x={170} y={735} text="0,2%" at={c.feather} size={34} /> : null}
    </>
  );
};

/** E. Chi phi nam giu tang theo thoi gian: lich lat + duong chi phi di len */
const HoldingCost: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const p = pop(0.05);
  const m = Math.min(12, 1 + Math.floor(Math.max(0, t - 0.3) * 3));
  const ch = lin(t, 0.4, 3.2);
  const pts = Array.from({ length: 9 }, (_, i) => [470 + i * 62, 1040 - Math.pow(i / 8, 1.6) * 300] as const);
  const shown = pts.slice(0, Math.max(1, Math.ceil(ch * pts.length)));
  return (
    <>
      <Svg>
        <g style={pg(p)}>
          <rect x="90" y="720" width="300" height="300" rx="22" fill="#fff" stroke="#2F3B47" strokeWidth="5" />
          <rect x="90" y="720" width="300" height="80" rx="22" fill="#A9503C" />
          <rect x="140" y="700" width="18" height="50" rx="8" fill="#2F3B47" />
          <rect x="322" y="700" width="18" height="50" rx="8" fill="#2F3B47" />
          <line x1="460" y1="1050" x2="1010" y2="1050" stroke="#2F3B47" strokeWidth="5" />
          <line x1="460" y1="1050" x2="460" y2="700" stroke="#2F3B47" strokeWidth="5" />
          <polyline points={shown.map((q) => q.join(",")).join(" ")} fill="none" stroke="#B23A2A" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" />
          {shown.length > 1 ? <circle cx={shown[shown.length - 1][0]} cy={shown[shown.length - 1][1]} r="16" fill="#B23A2A" stroke="#fff" strokeWidth="5" /> : null}
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 240, top: 910, translate: "-50% -50%", fontFamily: RT.font.punch, fontWeight: 900, fontSize: 120, color: "#2F3B47", opacity: p }}>{m}</div>
      <div style={{ position: "absolute", left: 240, top: 760, translate: "-50% -50%", fontFamily: RT.font.punch, fontWeight: 800, fontSize: 40, color: "#fff", opacity: p }}>THÁNG</div>
      <Chip x={700} y={800} text="Chi phí nắm giữ" at={0.4} tone="red" size={40} />
    </>
  );
};

/** F. Nha dau tu cong no (don bay) + tai san dong cua + dong tien ri ri */
const Leverage: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const p = pop(0.05);
  const bob = Math.sin(t * 5);
  const bag = pop(c.loan);
  const dark = lin(t, c.idle, 0.6);
  const leak = t > c.leak;
  return (
    <>
      <Svg>
        <g style={pg(p)}>
          <g transform={`translate(${200 + t * 6} 0)`}>
            <Person x={0} bob={bob} color="#34495E" />
            {/* tui no */}
            <g transform={`translate(-95 ${GY - 120}) scale(${bag})`}>
              <path d="M -55 0 Q -70 -90 0 -95 Q 70 -90 55 0 Z" fill="#7A5230" stroke="#3E2A16" strokeWidth="4" />
              <text x="0" y="-30" textAnchor="middle" fontSize="40" fontWeight={900} fill="#E8D3A0" fontFamily="Phudu">NỢ</text>
            </g>
            <line x1="-60" y1={GY - 210} x2="-20" y2={GY - 120} stroke="#3E2A16" strokeWidth="5" opacity={bag} />
          </g>
          <House x={520} w={260} h={220} closed={dark > 0.5} body={dark > 0.5 ? "#C9C2B7" : "#EFE8DC"} />
          {/* ong dong tien */}
          <rect x="800" y={GY - 120} width="190" height="34" rx="12" fill="#6E7F92" stroke="#2F3B47" strokeWidth="4" />
          {leak
            ? Array.from({ length: 4 }, (_, i) => {
                const ph = ((t - c.leak) * 0.9 + i * 0.25) % 1;
                return <Coin key={i} x={940 + (i % 2) * 10} y={GY - 86 + ph * 150} r={20} o={1 - ph} />;
              })
            : null}
        </g>
      </Svg>
      <Chip x={250} y={760} text="Đòn bẩy cao" at={c.loan} tone="red" size={44} />
      <Chip x={650} y={720} text="Không khai thác" at={c.idle} size={42} />
      <Chip x={790} y={GY + 60} text="Dòng tiền chịu áp lực" at={c.leak} tone="red" size={36} />
    </>
  );
};

/** G. Cung shophouse 15 ty: cho thue (sang, khach, tien vao) VS dong cua cho gia */
const ShopVs: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const p = pop(0.05);
  const sh = lin(t, c.right, 0.9);
  const flow = t > c.leftRow;
  return (
    <>
      <Svg>
        <g style={pg(p)}>
          <Shophouse x={90} w={340} shutter={0} color="#D9C7A8" light />
          <Shophouse x={650} w={340} shutter={sh} color="#D9D4CC" />
          {[0, 1, 2].map((i) => {
            const ph = (t * 0.35 + i / 3) % 1;
            return <Person key={i} x={-40 + ph * 300} bob={Math.sin(t * 7 + i)} s={0.75} color={["#34495E", "#A9503C", "#4F7D62"][i]} />;
          })}
          {flow
            ? Array.from({ length: 3 }, (_, i) => {
                const ph = ((t - c.leftRow) * 0.8 + i / 3) % 1;
                return <Coin key={i} x={260 + Math.sin(i * 2) * 40} y={GY - 300 - ph * 220} r={30} o={1 - ph} />;
              })
            : null}
        </g>
      </Svg>
      <Chip x={260} y={690} text="Cho thuê" at={c.left} tone="green" size={48} />
      <Chip x={820} y={790} text="Đóng cửa chờ giá" at={c.right} size={42} />
      <Chip x={540} y={1140} text="Cùng 15 tỷ" at={0.2} tone="gold" size={40} />
      <Chip x={265} y={1240} text="Dòng tiền hàng tháng" at={c.leftRow} tone="green" icon="v" size={36} />
      <Chip x={815} y={1240} text="Không sinh dòng tiền" at={c.rightRow} tone="red" icon="x" size={36} />
    </>
  );
};

/** H. Tieu chi chon: ghim vi tri -> dan cu den -> cho thue -> khai thac */
const Criteria: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const p = pop(0.05);
  const pin = t < c.pin ? 0 : interpolate(t, [c.pin, c.pin + 0.5], [0, 1], { ...C, easing: Easing.bounce });
  const ppl = lin(t, c.loc, 1.5);
  const blds = [[60, 150, 260, "#D9C7A8"], [230, 170, 360, "#BAC4C9"], [420, 220, 430, "#E6E1D8"], [660, 170, 320, "#D3B8A4"], [850, 170, 250, "#C3CBB8"]] as const;
  return (
    <>
      <Svg>
        <g style={pg(p)}>
          {blds.map(([x, w, h, col], i) => (
            <g key={i}>
              <rect x={x} y={GY - h} width={w} height={h} fill={col} stroke="#4A5866" strokeWidth="4" />
              {Array.from({ length: Math.floor(h / 70) }, (_, r) => (
                <g key={r}>
                  <rect x={x + 22} y={GY - h + 22 + r * 70} width={w / 2 - 34} height={40} fill={t > c.rent && i === 2 ? "#E3C485" : "#A9B7C0"} />
                  <rect x={x + w / 2 + 12} y={GY - h + 22 + r * 70} width={w / 2 - 34} height={40} fill={t > c.rent ? "#E3C485" : "#A9B7C0"} />
                </g>
              ))}
            </g>
          ))}
          {Array.from({ length: Math.round(ppl * 7) }, (_, i) => (
            <Person key={i} x={80 + i * 140 + Math.sin(t * 2 + i) * 20} bob={Math.sin(t * 6 + i)} s={0.55} base={GY + 90} color={["#34495E", "#A9503C", "#4F7D62", "#7A6F8F"][i % 4]} />
          ))}
          {t > c.exploit
            ? Array.from({ length: 3 }, (_, i) => {
                const ph = ((t - c.exploit) * 0.8 + i / 3) % 1;
                return <Coin key={i} x={530 + (i - 1) * 60} y={GY - 450 - ph * 160} r={26} o={1 - ph} />;
              })
            : null}
        </g>
        {pin > 0 ? (
          <g transform={`translate(530 ${interpolate(pin, [0, 1], [300, GY - 470])})`}>
            <path d="M 0 0 C -60 -70 -60 -150 0 -150 C 60 -150 60 -70 0 0 Z" fill="#B23A2A" stroke="#fff" strokeWidth="6" />
            <circle cx="0" cy="-100" r="22" fill="#fff" />
          </g>
        ) : null}
      </Svg>
      <Chip x={95} y={1190} text="Vị trí, mật độ dân cư" at={c.loc} tone="dark" icon="v" size={40} anchor="left" />
      <Chip x={95} y={1265} text="Khả năng cho thuê" at={c.rent} tone="dark" icon="v" size={40} anchor="left" />
      <Chip x={95} y={1340} text="Tiềm năng khai thác" at={c.exploit} tone="dark" icon="v" size={40} anchor="left" />
    </>
  );
};

/** I. BDS tot: khong chi gia tang (bieu do) ma con phuong an khai thac (banh rang + tien) */
const GoodRE: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const p = pop(0.05);
  const up = lin(t, c.up - 0.6, 0.9);
  const g = pop(c.gear);
  const pts = [[90, 1040], [190, 1000], [270, 1020], [360, 930], [440, 880]] as const;
  return (
    <>
      <Svg>
        <g style={pg(p)}>
          <rect x="70" y="700" width="420" height="360" rx="24" fill="rgba(255,255,255,0.85)" stroke="#2F3B47" strokeWidth="5" />
          <polyline points={pts.slice(0, 2 + Math.round(up * 3)).map((q) => q.join(",")).join(" ")} fill="none" stroke="#4F7D62" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" />
          <Arrow x0={360} y0={930} x1={450} y1={790} p={up} color="#4F7D62" w={12} />
          <g transform={`translate(780 900) scale(${g})`}>
            <g transform={`rotate(${t * 90})`}>
              {Array.from({ length: 10 }, (_, i) => (
                <rect key={i} x="-22" y="-150" width="44" height="50" rx="8" fill="#B87333" transform={`rotate(${i * 36})`} />
              ))}
              <circle r="110" fill="#C98B4E" stroke="#6E4420" strokeWidth="6" />
              <circle r="40" fill="#EFE8DC" stroke="#6E4420" strokeWidth="6" />
            </g>
            {g > 0.9
              ? Array.from({ length: 3 }, (_, i) => {
                  const ph = ((t - c.gear) * 0.9 + i / 3) % 1;
                  return <Coin key={i} x={150 + i * 10} y={-60 - ph * 160} r={26} o={1 - ph} />;
                })
              : null}
          </g>
        </g>
      </Svg>
      <Chip x={280} y={745} text="Tăng giá" at={c.up - 0.4} tone="green" size={40} />
      <Chip x={790} y={1090} text="Khai thác" at={c.gear} tone="gold" size={42} />
    </>
  );
};

/** J. Cau hoi ket: can - cho tang gia hay dong tien */
const Choice: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const p = pop(0.05);
  const tilt = interpolate(t, [c.right, c.right + 0.8], [0, 1], C) * Math.sin(t * 1.8) * 9;
  const L = { x: 540 - 300, y: 760 + Math.sin((tilt * Math.PI) / 180) * -300 };
  const R = { x: 540 + 300, y: 760 + Math.sin((tilt * Math.PI) / 180) * 300 };
  return (
    <>
      <Svg>
        <g style={pg(p)}>
          <rect x="525" y="760" width="30" height={GY - 760} fill="#6B4A2E" />
          <rect x="430" y={GY - 30} width="220" height="30" rx="10" fill="#6B4A2E" />
          <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke="#6B4A2E" strokeWidth="16" strokeLinecap="round" />
          <circle cx="540" cy="760" r="20" fill="#C9A24A" stroke="#6B4A2E" strokeWidth="5" />
          {[L, R].map((q, i) => (
            <g key={i}>
              <line x1={q.x} y1={q.y} x2={q.x - 90} y2={q.y + 150} stroke="#6B4A2E" strokeWidth="4" />
              <line x1={q.x} y1={q.y} x2={q.x + 90} y2={q.y + 150} stroke="#6B4A2E" strokeWidth="4" />
              <path d={`M ${q.x - 120} ${q.y + 150} Q ${q.x} ${q.y + 220} ${q.x + 120} ${q.y + 150} Z`} fill="#C9A24A" stroke="#6E5220" strokeWidth="5" />
            </g>
          ))}
          <g opacity={pop(c.left)}>
            <House x={L.x - 60} w={120} h={90} base={L.y + 150} />
          </g>
          <g opacity={pop(c.right)}>
            {[0, 1, 2, 3].map((i) => (
              <Coin key={i} x={R.x - 45 + (i % 2) * 90} y={R.y + 128 - Math.floor(i / 2) * 44} r={30} />
            ))}
          </g>
        </g>
      </Svg>
      <Chip x={240} y={GY + 40} text="Chờ tăng giá" at={c.left} size={40} />
      <Chip x={840} y={GY + 40} text="Dòng tiền" at={c.right} tone="green" size={40} />
    </>
  );
};

const SCENES: Record<string, React.FC<{ c: Cues }>> = { landTax: LandTax, taxCalc: TaxCalc, landVsVilla: LandVsVilla, pressure: Pressure, holdingCost: HoldingCost, leverage: Leverage, shopVs: ShopVs, criteria: Criteria, goodRE: GoodRE, choice: Choice };
export const SCENE_NAMES = Object.keys(SCENES);

/** Lop canh minh hoa (ve DUOI lop video; doan "bg" co scene:true de trong suot nen -> lo canh nay, PiP nam tren) */
// ---------- Dai animation phia duoi (lap cho trong o san, 1490-1800px) ----------
const LY = 1490; // dinh dai duoi
const lbl = (size: number, color = "#E9E2D6"): React.CSSProperties => ({ position: "absolute", fontFamily: RT.font.punch, fontWeight: 800, fontSize: size, color, whiteSpace: "nowrap", translate: "-50% -50%", textShadow: "0 2px 6px rgba(0,0,0,0.4)" });
const GOLD = "#C9A24A", RED = "#C0503A", GREEN = "#6FA383", INK = "#E9E2D6";

const Panel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const { t } = useSec();
  const p = interpolate(t, [0.2, 0.7], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ opacity: p, translate: `0 ${(1 - p) * 40}px` }}>
      <div style={{ position: "absolute", left: 60, top: LY, width: 960, height: 330, borderRadius: 28, border: `2px solid rgba(201,162,74,0.55)`, background: "rgba(20,30,36,0.28)" }} />
      <div style={{ ...lbl(30, GOLD), left: 540, top: LY + 34, letterSpacing: 3 }}>{title.toUpperCase()}</div>
      {children}
    </AbsoluteFill>
  );
};

const Timeline: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const k = interpolate(t, [0.5, 3.0], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const y = LY + 190;
  const x = 140 + k * 800;
  const hit = t > (c.stamp ?? 99);
  return (
    <Panel title="Mốc áp dụng">
      <Svg>
        <line x1="140" y1={y} x2="940" y2={y} stroke="#8FA3A6" strokeWidth="6" strokeLinecap="round" />
        <line x1="140" y1={y} x2={x} y2={y} stroke={GOLD} strokeWidth="6" strokeLinecap="round" />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={140 + i * 100} y1={y - 14} x2={140 + i * 100} y2={y + 14} stroke="#8FA3A6" strokeWidth="3" />)}
        <circle cx={x} cy={y} r={16 + (k >= 1 ? Math.sin(t * 6) * 4 : 0)} fill={GOLD} stroke="#fff" strokeWidth="4" />
        <circle cx="940" cy={y} r={hit ? 26 : 12} fill={hit ? RED : "#8FA3A6"} opacity={0.9} />
      </Svg>
      <div style={{ ...lbl(34), left: 160, top: y + 60 }}>Hiện tại</div>
      <div style={{ ...lbl(40, GOLD), left: 900, top: y + 60 }}>1/7/2027</div>
      {hit ? <div style={{ ...lbl(34, "#F0A08F"), left: 900, top: y - 60 }}>Áp thuế 0,2%</div> : null}
    </Panel>
  );
};

const Formula: React.FC<{ c: Cues }> = ({ c }) => {
  const pop = usePop();
  const parts = [["10 tỷ", 0.3, INK], ["× 0,2%", c.arrow, GOLD], ["≈ 20 triệu/năm", c.coins, "#F0A08F"]] as const;
  const xs = [210, 450, 760];
  return (
    <Panel title="Cách tính thuế">
      {parts.map(([txt, at, col], i) => {
        const p = pop(at);
        return (
          <div key={i} style={{ ...lbl(i === 2 ? 50 : 56, col), left: xs[i], top: LY + 190, scale: String(interpolate(p, [0, 1], [0.5, 1])), opacity: Math.min(1, p * 1.5) }}>
            {txt}
          </div>
        );
      })}
      <div style={{ ...lbl(26, "#AFC0C2"), left: 540, top: LY + 285, opacity: pop(c.coins) }}>Theo khung giá đất nhà nước, không phải giá thị trường</div>
    </Panel>
  );
};

const Gauge: React.FC<{ c: Cues }> = ({ c }) => {
  const { t, f, fps } = useSec();
  const steps = [c.w1, c.w2, c.w3].filter((a) => t >= a).length;
  const last = [c.w1, c.w2, c.w3][Math.max(0, steps - 1)] ?? 0;
  const sp = steps ? spring({ frame: f - Math.round(last * fps), fps, config: { damping: 8, stiffness: 120 } }) : 1;
  const prev = -80 + Math.max(0, steps - 1) * 52;
  const ang = steps ? prev + (Math.min(-80 + steps * 52, 76) - prev) * sp : -80 + Math.sin(t * 3) * 2;
  const cx = 540, cy = LY + 290, r = 200;
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  return (
    <Panel title="Áp lực chi phí">
      <Svg>
        <path d={arc(-80, -27)} stroke={GREEN} strokeWidth="30" fill="none" />
        <path d={arc(-25, 25)} stroke={GOLD} strokeWidth="30" fill="none" />
        <path d={arc(27, 80)} stroke={RED} strokeWidth="30" fill="none" />
        <g transform={`rotate(${ang} ${cx} ${cy})`}>
          <polygon points={`${cx - 10},${cy} ${cx + 10},${cy} ${cx},${cy - r + 30}`} fill={INK} />
        </g>
        <circle cx={cx} cy={cy} r="20" fill={INK} />
      </Svg>
      <div style={{ ...lbl(30), left: 250, top: LY + 290 }}>Thấp</div>
      <div style={{ ...lbl(30, "#F0A08F"), left: 830, top: LY + 290 }}>Cao</div>
    </Panel>
  );
};

const MonthBars: React.FC = () => {
  const { t } = useSec();
  return (
    <Panel title="Chi phí cộng dồn theo tháng">
      <Svg>
        {Array.from({ length: 12 }, (_, i) => {
          const k = interpolate(t, [0.3 + i * 0.28, 0.6 + i * 0.28], [0, 1], { ...C, easing: Easing.out(Easing.back(1.6)) });
          const h = (40 + i * 16) * k;
          return <rect key={i} x={120 + i * 72} y={LY + 290 - h} width="48" height={h} rx="6" fill={i > 8 ? RED : "#B87333"} />;
        })}
        <line x1="100" y1={LY + 292} x2="980" y2={LY + 292} stroke="#8FA3A6" strokeWidth="3" />
      </Svg>
    </Panel>
  );
};

const CashLine: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const n = 24;
  const pts = Array.from({ length: n }, (_, i) => {
    const ti = (i / (n - 1)) * Math.max(t, 0.01) ;
    const drop = ti > c.idle ? (ti - c.idle) * 22 : 0;
    const v = 90 + Math.sin(i * 1.3) * 12 - drop - (ti > c.leak ? (ti - c.leak) * 20 : 0);
    return [120 + (i * 840) / (n - 1), LY + 270 - Math.max(-20, Math.min(170, v))];
  });
  const bad = t > c.idle;
  return (
    <Panel title="Dòng tiền">
      <Svg>
        <line x1="120" y1={LY + 270} x2="960" y2={LY + 270} stroke="#8FA3A6" strokeWidth="3" strokeDasharray="12 10" />
        <polyline points={pts.map((q) => q.join(",")).join(" ")} fill="none" stroke={bad ? RED : GREEN} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r="14" fill={bad ? RED : GREEN} stroke="#fff" strokeWidth="4" />
      </Svg>
      <div style={{ ...lbl(26, "#AFC0C2"), left: 990, top: LY + 270, translate: "-100% -150%" }}>0</div>
    </Panel>
  );
};

const ShopBars: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const months = Math.max(0, Math.min(6, Math.floor((t - c.leftRow) / 0.7) + 1));
  return (
    <Panel title="Thu nhập mỗi tháng">
      <Svg>
        {Array.from({ length: 6 }, (_, i) => (i < months ? <rect key={i} x={110 + i * 62} y={LY + 290 - 110} width="44" height="110" rx="6" fill={GREEN} /> : null))}
        <line x1="100" y1={LY + 292} x2="490" y2={LY + 292} stroke="#8FA3A6" strokeWidth="3" />
        <line x1="590" y1={LY + 292} x2="980" y2={LY + 292} stroke="#8FA3A6" strokeWidth="3" />
        {t > c.right ? <line x1="600" y1={LY + 286} x2="970" y2={LY + 286} stroke={RED} strokeWidth="8" strokeLinecap="round" /> : null}
      </Svg>
      <div style={{ ...lbl(32, "#A9D3B8"), left: 295, top: LY + 100 }}>Cho thuê</div>
      <div style={{ ...lbl(32, "#F0A08F"), left: 785, top: LY + 100 }}>Đóng cửa</div>
      {t > c.right ? <div style={{ ...lbl(44, "#F0A08F"), left: 785, top: LY + 220 }}>0 đ</div> : null}
    </Panel>
  );
};

const Meters: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const a = interpolate(t, [c.up - 0.6, c.up + 0.4], [0.1, 0.55], { ...C, easing: Easing.out(Easing.cubic) });
  const b = interpolate(t, [c.gear, c.gear + 0.8], [0.1, 0.92], { ...C, easing: Easing.out(Easing.cubic) });
  const bar = (y: number, k: number, col: string, txt: string) => (
    <>
      <div style={{ ...lbl(32), left: 210, top: y }}>{txt}</div>
      <div style={{ position: "absolute", left: 340, top: y - 22, width: 620, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.12)" }}>
        <div style={{ width: `${k * 100}%`, height: "100%", borderRadius: 22, background: col }} />
      </div>
    </>
  );
  return (
    <Panel title="Giá trị bất động sản">
      {bar(LY + 140, a, GREEN, "Tăng giá")}
      {bar(LY + 240, b, GOLD, "Khai thác")}
    </Panel>
  );
};

/** pho: duong co xe chay + nguoi di bo (mat do dan cu) */
const Street: React.FC<{ title: string }> = ({ title }) => {
  const { t } = useSec();
  const y = LY + 200;
  const car = (i: number, sp: number, col: string, dir: 1 | -1) => {
    const x = dir === 1 ? ((t * sp + i * 330) % 1300) - 140 : 1180 - (((t * sp + i * 330) % 1300));
    const yy = dir === 1 ? y - 30 : y + 50;
    return (
      <g key={`${i}${dir}`} transform={`translate(${x} ${yy})`}>
        <rect x="-60" y="-30" width="120" height="44" rx="14" fill={col} />
        <rect x="-36" y="-52" width="70" height="28" rx="10" fill={col} />
        <rect x="-28" y="-46" width="54" height="18" rx="6" fill="#BAC4C9" />
        <circle cx="-34" cy="14" r="13" fill="#1E2830" />
        <circle cx="34" cy="14" r="13" fill="#1E2830" />
      </g>
    );
  };
  return (
    <Panel title={title}>
      <Svg>
        <defs>
          <clipPath id="street"><rect x="62" y={y - 120} width="956" height="230" rx="10" /></clipPath>
        </defs>
        <g clipPath="url(#street)">
        <rect x="60" y={y - 70} width="960" height="170" fill="#33424A" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={((i * 100 - t * 160) % 1200 + 1200) % 1200 - 60} y={y + 8} width="50" height="6" fill="#C9A24A" opacity={0.7} />)}
        {car(0, 220, "#A9503C", 1)}
        {car(1, 220, "#BAC4C9", 1)}
        {car(2, 180, "#C9A24A", -1)}
        {car(3, 180, "#4F7D62", -1)}
        </g>
      </Svg>
    </Panel>
  );
};

// ---------- Canh vid6: CDT tang gia giua song cat lo ----------
/** Day nha nha dau tu: bien "CAT LO" dap len, gia tut */
const CutLoss: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const p = pop(0.05);
  const xs = [60, 300, 540];
  return (
    <>
      <Svg>
        <g style={pg(p)}>
          {xs.map((x, i) => (
            <g key={i}>
              <House x={x + 20} w={180} h={170} />
              {t > c.cut + i * 0.25 ? (
                <g transform={`translate(${x + 110} ${GY - 330}) rotate(${-8 + i * 6})`}>
                  <rect x="-80" y="-30" width="160" height="60" rx="8" fill="#B23A2A" stroke="#E9E2D6" strokeWidth="4" />
                  <text x="0" y="12" textAnchor="middle" fontSize="34" fontWeight={900} fill="#fff" fontFamily="Phudu">CẮT LỖ</text>
                </g>
              ) : null}
            </g>
          ))}
          <Arrow x0={820} y0={720} x1={900} y1={1000} p={lin(t, c.loss, 0.6)} color="#B23A2A" w={18} />
        </g>
      </Svg>
      <Chip x={330} y={690} text="Ocean Park 2, 3" at={c.place} tone="gold" size={46} />
      {c.op1 !== undefined ? <Chip x={330} y={595} text="Kể cả Ocean Park 1" at={c.op1} tone="dark" size={38} /> : null}
      <Chip x={790} y={1030} text="Hàng tỷ đồng" at={c.loss} tone="red" size={40} />
    </>
  );
};

/** Nghich ly: nguoi mua truoc ban thu hoi von <-> CDT tang gia -> nguoi mua sau tra cao hon */
const Paradox: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const l = pop(c.left);
  const up = lin(t, c.up, 0.7);
  const r = pop(c.right);
  return (
    <>
      <Svg>
        <g style={pg(l)}>
          <Person x={150} bob={Math.sin(t * 3) * 0.3} color="#566B70" />
          <rect x="200" y={GY - 190} width="120" height="80" rx="6" fill="#EFE8DC" stroke="#4A3B30" strokeWidth="4" />
          <text x="260" y={GY - 140} textAnchor="middle" fontSize="30" fontWeight={900} fill="#B23A2A" fontFamily="Phudu">BÁN</text>
          <line x1="260" y1={GY - 110} x2="260" y2={GY} stroke="#4A3B30" strokeWidth="6" />
        </g>
        {/* toa nha CDT + mui ten gia len */}
        <g style={pg(pop(0.1))}>
          <rect x="430" y={GY - 380} width="200" height="380" fill="#BAC4C9" stroke="#3E4E5E" strokeWidth="4" />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x="455" y={GY - 350 + i * 58} width="150" height="34" fill={t > c.up ? "#E3C485" : "#A9B7C0"} />
          ))}
        </g>
        <Arrow x0={530} y0={GY - 400} x1={530} y1={GY - 400 - 170 * up} p={up > 0 ? 1 : 0} color="#B4533A" w={22} />
        <g style={pg(r)}>
          <Person x={860} bob={Math.sin(t * 4)} color="#34495E" />
          <g transform={`translate(920 ${GY - 110})`}>
            <path d="M -45 0 Q -60 -80 0 -85 Q 60 -80 45 0 Z" fill="#C9A24A" stroke="#6E5220" strokeWidth="4" />
            <text x="0" y="-26" textAnchor="middle" fontSize="40" fontWeight={900} fill="#3A2600" fontFamily="Phudu">đ</text>
          </g>
        </g>
      </Svg>
      <Chip x={220} y={770} text="Người mua trước" at={c.left} size={40} />
      <Chip x={230} y={GY + 60} text="Bán, thu hồi vốn" at={c.leftRow} tone="dark" size={34} />
      <Chip x={420} y={640} text="Chủ đầu tư tăng giá" at={c.up} tone="red" size={38} />
      <Chip x={850} y={790} text="Người mua sau" at={c.right} size={40} />
      <Chip x={850} y={GY + 60} text="Trả giá cao hơn" at={c.rightRow} tone="red" size={34} />
    </>
  );
};

/** Du luan mang xa hoi: dien thoai + binh luan chay + bong "Day thuyen?" */
const Social: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const p = pop(0.05);
  const comments = ["Giá vậy ai mua?", "Chủ đầu tư biết trước rồi", "Đang cắt lỗ mà tăng giá?", "Mua sau chịu thiệt", "Hợp lý thôi", "Chờ thêm xem sao"];
  const scroll = (t * 70) % (comments.length * 90);
  return (
    <>
      <Svg>
        <g style={pg(p)}>
          <rect x="90" y="640" width="330" height="430" rx="40" fill="#1E2830" stroke="#C9A24A" strokeWidth="4" />
          <rect x="108" y="672" width="294" height="380" rx="20" fill="#E9E2D6" />
          <rect x="215" y="652" width="80" height="10" rx="5" fill="#3E4E5E" />
          <defs>
            <clipPath id="phone"><rect x="108" y="672" width="294" height="380" rx="20" /></clipPath>
          </defs>
          <g clipPath="url(#phone)">
            {[...comments, ...comments].map((txt, i) => {
              const y = 690 + i * 90 - scroll;
              return (
                <g key={i}>
                  <circle cx="136" cy={y + 26} r="16" fill={["#A9503C", "#4F7D62", "#34495E"][i % 3]} />
                  <rect x="160" y={y + 6} width="228" height="42" rx="14" fill="#fff" stroke="#C8BCA8" strokeWidth="2" />
                  <text x="172" y={y + 34} fontSize="19" fill="#2A2418" fontFamily="Be Vietnam Pro" fontWeight={600}>{txt}</text>
                </g>
              );
            })}
          </g>
          {/* like / dislike bay len */}
          {Array.from({ length: 6 }, (_, i) => {
            const ph = (t * 0.6 + i / 6) % 1;
            const good = i % 2 === 0;
            return (
              <g key={i} transform={`translate(${470 + (i % 3) * 70} ${GY - 40 - ph * 330})`} opacity={1 - ph}>
                <circle r="26" fill={good ? "#4F7D62" : "#B23A2A"} />
                <text y="10" textAnchor="middle" fontSize="28" fill="#fff" fontFamily="Phudu" fontWeight={900}>{good ? "+" : "−"}</text>
              </g>
            );
          })}
        </g>
      </Svg>
      <Chip x={300} y={GY + 60} text="Ý kiến trái chiều" at={c.mixed} tone="dark" size={40} />
      <Chip x={700} y={870} text="Đẩy thuyền?" at={c.pump} tone="red" size={56} />
      <Chip x={700} y={975} text="Giúp nhà đầu tư cũ thoát hàng?" at={c.exit} tone="dark" size={28} />
    </>
  );
};

/** Binh chon ket: HOP LY hay KHONG? con tro nhay qua lai */
const Vote: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const a = pop(0.1);
  const b = pop(0.25);
  const cx = 300 + (Math.sin(t * 2.2) * 0.5 + 0.5) * 480;
  const btn = (x: number, txt: string, col: string, k: number, hot: boolean) => (
    <div style={{ position: "absolute", left: x, top: 900, translate: "-50% -50%", scale: String(k * (hot ? 1.08 : 1)), padding: "26px 40px", borderRadius: 26, background: col, border: "4px solid #E9E2D6", boxShadow: hot ? "0 0 30px rgba(201,162,74,0.9)" : "0 10px 22px rgba(0,0,0,0.3)", fontFamily: RT.font.punch, fontWeight: 900, fontSize: 52, color: "#fff", whiteSpace: "nowrap" }}>
      {txt}
    </div>
  );
  return (
    <>
      {btn(290, "✓ HỢP LÝ", "linear-gradient(180deg,#5F8B6E,#3F6650)", a, cx < 540)}
      {btn(790, "✕ KHÔNG", "linear-gradient(180deg,#B4533A,#8E3B28)", b, cx >= 540)}
      <Svg>
        <g transform={`translate(${cx} 960)`} opacity={a}>
          <path d="M 0 0 L 0 70 L 18 54 L 32 86 L 44 80 L 30 50 L 54 50 Z" fill="#fff" stroke="#1E2830" strokeWidth="4" />
        </g>
      </Svg>
      <Chip x={330} y={760} text="Tăng giá lúc này?" at={0.05} tone="gold" size={48} />
    </>
  );
};

const PriceCompare: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const a = interpolate(t, [c.left, c.left + 0.6], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const b = interpolate(t, [c.up, c.up + 0.8], [0, 1], { ...C, easing: Easing.out(Easing.back(1.4)) });
  return (
    <Panel title="Mức giá">
      <Svg>
        <rect x="250" y={LY + 290 - 130 * a} width="160" height={130 * a} rx="8" fill="#8FA3A6" />
        <rect x="670" y={LY + 290 - 210 * b} width="160" height={210 * b} rx="8" fill={RED} />
        <line x1="160" y1={LY + 292} x2="920" y2={LY + 292} stroke="#8FA3A6" strokeWidth="3" />
      </Svg>
      <div style={{ ...lbl(30), left: 330, top: LY + 75 }}>Mua trước</div>
      <div style={{ ...lbl(30, "#F0A08F"), left: 750, top: LY + 75 }}>Mua sau</div>
    </Panel>
  );
};

const LossChart: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const k = lin(t, 0.4, Math.max(1, (c.loss ?? 6) - 0.4));
  const n = 16;
  const pts = Array.from({ length: n }, (_, i) => [120 + (i * 840) / (n - 1), LY + 110 + (i / (n - 1)) * 160 * k + Math.sin(i * 1.7) * 10]);
  const shown = pts.slice(0, Math.max(2, Math.ceil(k * n)));
  return (
    <Panel title="Giá bán lại (cắt lỗ)">
      <Svg>
        <polyline points={shown.map((q) => q.join(",")).join(" ")} fill="none" stroke={RED} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={shown[shown.length - 1][0]} cy={shown[shown.length - 1][1]} r="14" fill={RED} stroke="#fff" strokeWidth="4" />
      </Svg>
    </Panel>
  );
};

const Sentiment: React.FC = () => {
  const { t } = useSec();
  const v = 0.5 + Math.sin(t * 1.3) * 0.18 + Math.sin(t * 3.1) * 0.06;
  return (
    <Panel title="Dư luận">
      <div style={{ ...lbl(30, "#A9D3B8"), left: 200, top: LY + 120 }}>Đồng tình</div>
      <div style={{ ...lbl(30, "#F0A08F"), left: 880, top: LY + 120 }}>Phản đối</div>
      <div style={{ position: "absolute", left: 120, top: LY + 175, width: 840, height: 60, borderRadius: 30, overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${v * 100}%`, background: GREEN }} />
        <div style={{ flex: 1, background: RED }} />
      </div>
      <div style={{ ...lbl(30), left: 120 + v * 840, top: LY + 270 }}>▲</div>
    </Panel>
  );
};

const VoteBars: React.FC = () => {
  const { t } = useSec();
  const v = 0.5 + Math.sin(t * 1.6) * 0.15;
  return (
    <Panel title="Anh chị chọn bên nào?">
      <Svg>
        <rect x="140" y={LY + 120} width={800 * v} height="56" rx="10" fill={GREEN} />
        <rect x="140" y={LY + 200} width={800 * (1 - v)} height="56" rx="10" fill={RED} />
      </Svg>
      <div style={{ ...lbl(30), left: 140 + 800 * v + 60, top: LY + 148 }}>Hợp lý</div>
      <div style={{ ...lbl(30), left: 140 + 800 * (1 - v) + 70, top: LY + 228 }}>Không</div>
    </Panel>
  );
};

Object.assign(SCENES, { cutLoss: CutLoss, paradox: Paradox, social: Social, vote: Vote });

// ---------- Canh vid7: lien ke OCP2 Kinh Do + voucher 30% ----------
/** Ban ve mat dung can lien ke 4 tang + duong kich thuoc (mat tien, dien tich, tang, duong, via he) */
const DimH: React.FC<{ x0: number; x1: number; y: number; p: number; col?: string }> = ({ x0, x1, y, p, col = "#B23A2A" }) => {
  const xm = (x0 + x1) / 2, hw = ((x1 - x0) / 2) * p;
  return p <= 0 ? null : (
    <g stroke={col} strokeWidth="5" fill={col}>
      <line x1={xm - hw} y1={y} x2={xm + hw} y2={y} />
      <line x1={x0} y1={y - 16} x2={x0} y2={y + 16} opacity={p} />
      <line x1={x1} y1={y - 16} x2={x1} y2={y + 16} opacity={p} />
      <polygon points={`${xm - hw},${y} ${xm - hw + 18},${y - 10} ${xm - hw + 18},${y + 10}`} />
      <polygon points={`${xm + hw},${y} ${xm + hw - 18},${y - 10} ${xm + hw - 18},${y + 10}`} />
    </g>
  );
};
const SpecSheet: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const p = pop(0.05);
  const fl = Math.min(4, Math.max(0, Math.floor((t - c.floors + 0.6) / 0.15)));
  const x = 300, w = 300, fh = 95;
  return (
    <>
      <Svg>
        <g style={pg(p)}>
          {/* hang xom mo */}
          <rect x={x - 230} y={GY - 4 * fh} width={220} height={4 * fh} fill="#D9CFBF" stroke="#B9AC96" strokeWidth="3" />
          <rect x={x + w + 10} y={GY - 4 * fh} width={220} height={4 * fh} fill="#D9CFBF" stroke="#B9AC96" strokeWidth="3" />
          {/* can chinh: tang hien dan */}
          {Array.from({ length: 4 }, (_, i) => {
            const on = t >= c.floors ? i < Math.max(fl, 0) || t > c.floors + 1 : true;
            const y = GY - (i + 1) * fh;
            return (
              <g key={i} opacity={on ? 1 : 0.35}>
                <rect x={x} y={y} width={w} height={fh} fill={i === 0 ? "#E6DCCB" : "#EFE8DC"} stroke="#3E4E5E" strokeWidth="4" />
                {i === 0 ? <rect x={x + 30} y={y + 18} width={w - 60} height={fh - 18} fill="#8FA3A6" /> : <rect x={x + 40} y={y + 18} width={w - 80} height={fh - 40} fill="#A9B7C0" stroke="#3E4E5E" strokeWidth="3" />}
                {i > 0 ? <rect x={x + 30} y={y + fh - 18} width={w - 60} height={8} fill="#3E4E5E" /> : null}
              </g>
            );
          })}
          <rect x={x - 10} y={GY - 4 * fh - 16} width={w + 20} height={18} fill="#3E4E5E" />
        </g>
        <DimH x0={x} x1={x + w} y={GY - 4 * fh - 60} p={lin(t, c.front, 0.5)} />
        {/* chieu cao 4 tang */}
        {t > c.floors ? <line x1={x + w + 40} y1={GY} x2={x + w + 40} y2={GY - 4 * fh * lin(t, c.floors, 0.6)} stroke="#B23A2A" strokeWidth="5" /> : null}
      </Svg>
      <Chip x={x + w / 2} y={GY - 4 * fh - 110} text="Mặt tiền 7m" at={c.front} tone="red" size={40} />
      <Chip x={x + w / 2} y={GY - 2 * fh} text="84m²" at={c.area} tone="gold" size={54} />
      <Chip x={x + w + 150} y={GY - 2 * fh - 40} text="4 tầng" at={c.floors} tone="dark" size={42} />
    </>
  );
};

/** Mat cat cong nang: tang 1 kinh doanh (khach ra vao) + tang tren luu tru (giuong, den) */
const MixedUse: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const p = pop(0.05);
  const x = 240, w = 420, fh = 100;
  const shop = t > c.shop, stay = t > c.stay;
  return (
    <>
      <Svg>
        <g style={pg(p)}>
          {Array.from({ length: 4 }, (_, i) => {
            const y = GY - (i + 1) * fh;
            const lit = i === 0 ? shop : stay && t > c.stay + (i - 1) * 0.3;
            return (
              <g key={i}>
                <rect x={x} y={y} width={w} height={fh} fill={lit ? (i === 0 ? "#F1D9A8" : "#F3E6C4") : "#E6E1D8"} stroke="#3E4E5E" strokeWidth="4" />
                {i === 0 ? (
                  <g>
                    <rect x={x + 30} y={y + 50} width={120} height={14} fill="#A9503C" />
                    <rect x={x + 250} y={y + 30} width={130} height={60} fill="#C98B4E" opacity={0.8} />
                  </g>
                ) : (
                  <g opacity={lit ? 1 : 0.4}>
                    <rect x={x + 40} y={y + 55} width={150} height={30} rx="6" fill="#EFE8DC" stroke="#6B4A2E" strokeWidth="3" />
                    <rect x={x + 40} y={y + 45} width={40} height={20} rx="5" fill="#fff" stroke="#6B4A2E" strokeWidth="2" />
                    <circle cx={x + 330} cy={y + 30} r={lit ? 14 : 8} fill={lit ? "#E3C485" : "#A9B7C0"} />
                  </g>
                )}
              </g>
            );
          })}
          <polygon points={`${x - 20},${GY - 4 * fh} ${x + w / 2},${GY - 4 * fh - 70} ${x + w + 20},${GY - 4 * fh}`} fill="#3E4E5E" />
          {shop
            ? [0, 1].map((i) => {
                const ph = (t * 0.4 + i / 2) % 1;
                return <Person key={i} x={x - 120 + ph * 240} bob={Math.sin(t * 7 + i)} s={0.6} color={["#34495E", "#A9503C"][i]} />;
              })
            : null}
        </g>
      </Svg>
      <Chip x={x + w + 150} y={GY - fh / 2 - 10} text="Kinh doanh" at={c.shop} tone="gold" size={40} />
      <Chip x={x + w / 2 - 40} y={GY - 4 * fh - 110} text="Lưu trú tầng trên" at={c.stay} tone="dark" size={40} />
    </>
  );
};

/** The gia 15 ty -> voucher 30% cat vao + chinh sach moi -> hon 10 ty */
const Voucher: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const tag = pop(c.price);
  const vin = lin(t, c.voucher, 0.6);
  const cut = lin(t, c.policy, 0.5);
  const nw = pop(c.newPrice);
  return (
    <>
      <div style={{ position: "absolute", left: 330, top: 820, translate: "-50% -50%", scale: String(tag), padding: "30px 46px", borderRadius: 26, background: "#EFE8DC", border: "5px solid #3E4E5E", boxShadow: "0 14px 30px rgba(0,0,0,0.3)", textAlign: "center" }}>
        <div style={{ fontFamily: RT.font.punch, fontWeight: 800, fontSize: 32, color: "#566B70" }}>GIÁ THANH TOÁN SỚM</div>
        <div style={{ position: "relative", fontFamily: RT.font.punch, fontWeight: 900, fontSize: 110, color: nw > 0 ? "#8FA3A6" : "#1E2830", lineHeight: 1.1 }}>
          15 TỶ
          <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 12, background: "#B23A2A", borderRadius: 6, transformOrigin: "left", scale: `${cut} 1`, rotate: "-8deg" }} />
        </div>
      </div>
      {/* ve voucher bay vao */}
      <div style={{ position: "absolute", left: interpolate(vin, [0, 1], [1250, 780]), top: 790 + (1 - vin) * -80, translate: "-50% -50%", rotate: `${interpolate(vin, [0, 1], [30, -8])}deg`, padding: "22px 34px", borderRadius: 18, background: "linear-gradient(135deg,#B4533A,#8E3B28)", border: "4px dashed #E9E2D6", fontFamily: RT.font.punch, fontWeight: 900, color: "#fff", textAlign: "center", boxShadow: "0 12px 26px rgba(0,0,0,0.35)" }}>
        <div style={{ fontSize: 30, letterSpacing: 4 }}>VOUCHER</div>
        <div style={{ fontSize: 86, lineHeight: 1 }}>30%</div>
      </div>
      <Chip x={780} y={960} text="+ Chính sách mới" at={c.policy} tone="dark" size={36} />
      {nw > 0 ? (
        <div style={{ position: "absolute", left: 470, top: 1065, translate: "-50% -50%", scale: String(interpolate(nw, [0, 1], [1.8, 1])), opacity: Math.min(1, nw * 1.5), padding: "18px 44px", borderRadius: 24, background: "linear-gradient(180deg,#5F8B6E,#3F6650)", border: "4px solid #E9E2D6", fontFamily: RT.font.punch, fontWeight: 900, fontSize: 76, color: "#fff", whiteSpace: "nowrap", boxShadow: "0 0 30px rgba(95,139,110,0.7)" }}>
          HƠN 10 TỶ
        </div>
      ) : null}
    </>
  );
};

/** Lich lat toi 31/12/2026: voucher het han */
const Deadline: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const p = pop(0.05);
  const k = lin(t, 0.3, Math.max(0.5, c.year - 0.3));
  const day = Math.round(interpolate(k, [0, 1], [1, 31]));
  const exp = t > c.expire;
  return (
    <>
      <Svg>
        <g style={pg(p)}>
          <rect x="120" y="650" width="380" height="400" rx="26" fill="#fff" stroke="#2F3B47" strokeWidth="5" />
          <rect x="120" y="650" width="380" height="100" rx="26" fill="#A9503C" />
          <rect x="185" y="625" width="20" height="60" rx="9" fill="#2F3B47" />
          <rect x="415" y="625" width="20" height="60" rx="9" fill="#2F3B47" />
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 310, top: 700, translate: "-50% -50%", fontFamily: RT.font.punch, fontWeight: 800, fontSize: 44, color: "#fff", opacity: p }}>THÁNG 12 · 2026</div>
      <div style={{ position: "absolute", left: 310, top: 900, translate: "-50% -50%", fontFamily: RT.font.punch, fontWeight: 900, fontSize: 190, color: day === 31 ? "#B23A2A" : "#2F3B47", opacity: p }}>{day}</div>
      <div style={{ position: "absolute", left: 780, top: 880, translate: "-50% -50%", rotate: "-8deg", padding: "18px 30px", borderRadius: 16, background: exp ? "#8FA3A6" : "linear-gradient(135deg,#B4533A,#8E3B28)", border: "4px dashed #E9E2D6", fontFamily: RT.font.punch, fontWeight: 900, color: "#fff", textAlign: "center", opacity: pop(c.voucher), filter: exp ? "grayscale(1)" : undefined }}>
        <div style={{ fontSize: 26, letterSpacing: 4 }}>VOUCHER</div>
        <div style={{ fontSize: 72, lineHeight: 1 }}>30%</div>
      </div>
      <Stamp x={780} y={890} text="HẾT HẠN" at={c.expire} size={64} />
    </>
  );
};

const SpecTable: React.FC<{ c: Cues }> = ({ c }) => {
  const rows: Array<[string, string, number]> = [["Mặt tiền", "7m", c.front], ["Diện tích", "84m²", c.area], ["Xây dựng", "4 tầng", c.floors], ["Mặt đường", "8m", c.road], ["Vỉa hè", "4m mỗi bên", c.walk]];
  const pop = usePop();
  return (
    <Panel title="Thông số căn liền kề">
      {rows.map(([k, v, at], i) => {
        const p = pop(at);
        const col = i < 3 ? 0 : 1;
        const row = i < 3 ? i : i - 3;
        return (
          <div key={k} style={{ position: "absolute", left: 120 + col * 450, top: LY + 95 + row * 70, display: "flex", gap: 18, alignItems: "center", opacity: Math.min(1, p * 1.5), translate: `${(1 - p) * 40}px 0` }}>
            <span style={{ fontFamily: RT.font.punch, fontWeight: 700, fontSize: 32, color: "#AFC0C2" }}>{k}</span>
            <span style={{ fontFamily: RT.font.punch, fontWeight: 900, fontSize: 40, color: GOLD }}>{v}</span>
          </div>
        );
      })}
    </Panel>
  );
};

const PriceBars: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const a = lin(t, c.price, 0.6);
  const b = lin(t, c.newPrice, 0.8);
  return (
    <Panel title="Giá trước và sau voucher">
      <Svg>
        <rect x="140" y={LY + 120} width={760 * a} height="56" rx="10" fill="#8FA3A6" />
        <rect x="140" y={LY + 205} width={760 * 0.7 * b} height="56" rx="10" fill={GREEN} />
      </Svg>
      <div style={{ ...lbl(32), left: 140 + 760 * a - 70, top: LY + 148, opacity: a }}>15 tỷ</div>
      <div style={{ ...lbl(32), left: 140 + 760 * 0.7 * b + 110, top: LY + 233, opacity: b }}>Hơn 10 tỷ</div>
    </Panel>
  );
};

const Countdown: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const k = lin(t, 0.3, Math.max(0.5, c.expire - 0.3));
  return (
    <Panel title="Thời hạn voucher 30%">
      <div style={{ position: "absolute", left: 120, top: LY + 150, width: 840, height: 50, borderRadius: 25, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
        <div style={{ width: `${(1 - k) * 100}%`, height: "100%", background: k > 0.85 ? RED : GOLD }} />
      </div>
      <div style={{ ...lbl(30), left: 540, top: LY + 260 }}>{k >= 1 ? "Hết hạn 31/12/2026" : "Còn đến cuối năm 2026"}</div>
    </Panel>
  );
};

Object.assign(SCENES, { specSheet: SpecSheet, mixedUse: MixedUse, voucher: Voucher, deadline: Deadline });

// ---------- Canh vid8: lien ke Co Xanh 52m2 ----------
/** Ban do vi tri: ghim can + duong noi toi chung cu Masteri, truong tieu hoc */
const Location: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const p = pop(0.05);
  const home = { x: 300, y: 900 };
  const poi = [
    { x: 760, y: 760, at: c.masteri, label: "Chung cư Masteri", col: "#34495E" },
    { x: 720, y: 1000, at: c.school, label: "Trường tiểu học", col: "#4F7D62" },
  ];
  return (
    <>
      <Svg>
        <g style={pg(p)} opacity={0.9}>
          {/* luoi duong ban do */}
          <rect x="60" y="680" width="960" height="400" rx="26" fill="#EFE8DC" stroke="#C8BCA8" strokeWidth="3" />
          {[760, 880, 1000].map((y) => <line key={y} x1="60" y1={y} x2="1020" y2={y} stroke="#D8CDBB" strokeWidth="16" />)}
          {[220, 440, 640, 860].map((x) => <line key={x} x1={x} y1="680" x2={x} y2="1080" stroke="#D8CDBB" strokeWidth="16" />)}
          <path d="M 60 1040 Q 300 980 560 1050 T 1020 1000" stroke="#A9B7C0" strokeWidth="26" fill="none" opacity={0.8} />
        </g>
        {poi.map((q, i) => {
          const k = lin(t, q.at, 0.6);
          return k > 0 ? (
            <g key={i}>
              <line x1={home.x} y1={home.y} x2={home.x + (q.x - home.x) * k} y2={home.y + (q.y - home.y) * k} stroke="#B4533A" strokeWidth="7" strokeDasharray="18 12" strokeDashoffset={-t * 60} />
              <g transform={`translate(${q.x} ${q.y}) scale(${pop(q.at + 0.4)})`}>
                <rect x="-46" y="-90" width="92" height="90" rx="10" fill={q.col} stroke="#fff" strokeWidth="5" />
                {i === 0 ? [0, 1, 2].map((r) => <rect key={r} x="-30" y={-78 + r * 26} width="60" height="14" fill="#E3C485" />) : <polygon points="-36,-62 0,-90 36,-62" fill="#E3C485" />}
              </g>
            </g>
          ) : null;
        })}
        <g transform={`translate(${home.x} ${home.y - 20 * Math.abs(Math.sin(t * 3)) * (t < 1.2 ? 1 : 0.3)})`}>
          <path d="M 0 0 C -50 -60 -50 -130 0 -130 C 50 -130 50 -60 0 0 Z" fill="#B23A2A" stroke="#fff" strokeWidth="6" />
          <circle cx="0" cy="-85" r="20" fill="#fff" />
        </g>
      </Svg>
      <Chip x={home.x} y={home.y + 60} text="Căn Cọ Xanh" at={0.2} tone="gold" size={40} />
      {poi.map((q, i) => <Chip key={i} x={q.x} y={q.y + 45} text={q.label} at={q.at + 0.4} tone="dark" size={32} />)}
    </>
  );
};

/** Khan hiem: day nha, da so xam "da ban", vai can nho sang vang -> dau RAT HIEM */
const Scarcity: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const pop = usePop();
  const p = pop(0.05);
  const n = 9;
  const hot = [2, 6];
  const sold = lin(t, c.small, 1.6);
  return (
    <>
      <Svg>
        <g style={pg(p)}>
          {Array.from({ length: n }, (_, i) => {
            const x = 40 + i * 110;
            const isHot = hot.includes(i);
            const grey = !isHot && sold > i / n;
            const h = isHot ? 200 : 260;
            return (
              <g key={i}>
                <rect x={x} y={GY - h} width={isHot ? 70 : 100} height={h} fill={isHot && t > c.small ? "#E3C485" : grey ? "#B9B4AA" : "#EFE8DC"} stroke="#3E4E5E" strokeWidth="3" />
                {Array.from({ length: 4 }, (_, r) => <rect key={r} x={x + 12} y={GY - h + 16 + r * (h / 4.4)} width={(isHot ? 70 : 100) - 24} height={h / 8} fill={grey ? "#9E9A92" : "#A9B7C0"} />)}
                {isHot && t > c.small ? <circle cx={x + 35} cy={GY - h - 24} r={12 + Math.sin(t * 6) * 3} fill="#C9A24A" /> : null}
              </g>
            );
          })}
        </g>
      </Svg>
      <Chip x={330} y={720} text="Diện tích 48 – 52m²" at={c.small} tone="gold" size={42} />
      <Stamp x={560} y={860} text="RẤT HIẾM" at={c.rare} size={80} />
    </>
  );
};

const SpecTable52: React.FC<{ c: Cues }> = ({ c }) => {
  const rows: Array<[string, string, number]> = [["Diện tích", "52m²", 0.3], ["Xây dựng", "5 tầng", 0.5], ["Mặt đường", "8m", 0.7], ["Vỉa hè", "4m mỗi bên", 0.9]];
  const pop = usePop();
  return (
    <Panel title="Căn liền kề Cọ Xanh">
      {rows.map(([k, v, at], i) => {
        const q = pop(at);
        return (
          <div key={k} style={{ position: "absolute", left: 120 + (i % 2) * 450, top: LY + 110 + Math.floor(i / 2) * 80, display: "flex", gap: 18, alignItems: "center", opacity: Math.min(1, q * 1.5) }}>
            <span style={{ fontFamily: RT.font.punch, fontWeight: 700, fontSize: 32, color: "#AFC0C2" }}>{k}</span>
            <span style={{ fontFamily: RT.font.punch, fontWeight: 900, fontSize: 40, color: GOLD }}>{v}</span>
          </div>
        );
      })}
    </Panel>
  );
};

const StockBar: React.FC<{ c: Cues }> = ({ c }) => {
  const { t } = useSec();
  const k = lin(t, c.small, Math.max(0.6, c.rare - c.small));
  return (
    <Panel title="Quỹ căn diện tích nhỏ">
      <div style={{ position: "absolute", left: 120, top: LY + 150, width: 840, height: 50, borderRadius: 25, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
        <div style={{ width: `${(1 - k * 0.88) * 100}%`, height: "100%", background: k > 0.7 ? RED : GOLD }} />
      </div>
      <div style={{ ...lbl(30), left: 540, top: LY + 260 }}>{k > 0.95 ? "Còn rất ít" : "Đang giảm nhanh"}</div>
    </Panel>
  );
};

Object.assign(SCENES, { location: Location, scarcity: Scarcity });

const LOWER: Record<string, React.FC<{ c: Cues }>> = {
  landTax: Timeline,
  taxCalc: Formula,
  landVsVilla: () => <Street title="Thực tế khu dân cư" />,
  pressure: Gauge,
  holdingCost: () => <MonthBars />,
  leverage: CashLine,
  shopVs: ShopBars,
  criteria: () => <Street title="Mật độ dân cư - lưu thông" />,
  goodRE: Meters,
  cutLoss: LossChart,
  paradox: PriceCompare,
  social: () => <Sentiment />,
  vote: () => <VoteBars />,
  specSheet: SpecTable,
  mixedUse: () => <Street title="Mặt đường kinh doanh" />,
  voucher: PriceBars,
  deadline: Countdown,
  location: SpecTable52,
  scarcity: StockBar,
};

export const IllustratedScene: React.FC<{ name: string; cues?: Cues }> = ({ name, cues = {} }) => {
  const { t, D } = useSec();
  const S = SCENES[name];
  const out = interpolate(t, [D - 0.2, D], [1, 0], C);
  return (
    <AbsoluteFill style={{ backgroundColor: "#E9E2D6", overflow: "hidden" }}>
      <Sky />
      <AbsoluteFill style={{ opacity: out, scale: "1.1", transformOrigin: `540px ${GY}px` }}>{S ? <S c={cues} /> : null}</AbsoluteFill>
      {LOWER[name] ? <AbsoluteFill style={{ opacity: out }}>{React.createElement(LOWER[name], { c: cues })}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};
