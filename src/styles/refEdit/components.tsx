/**
 * Thu vien component "reference-video-edit-thinking" (dung lai tu video mau mau-ref-01).
 * Moi component tu tinh thoi gian theo GIAY (doc fps tu useVideoConfig) -> chay dung o 30/60 FPS.
 * Dat moi component trong <Sequence from durationInFrames>: t=0 la luc component bat dau.
 * Danh dau: [GOC] = tai tao tu quan sat; [AI] = cai tien/xap xi do AI de xuat.
 */
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { RT, whiteGlow } from "./tokens";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.out(Easing.cubic);
const W = RT.W;
const H = RT.H;

export const useSec = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return { t: f / fps, D: durationInFrames / fps, fps, f };
};

export type ExitMode = "blur" | "cut" | "fade";
/** He so thoat (1 -> 0) trong `len` giay cuoi. "cut" = bien mat cung diem cat [GOC: phan lon chu mat theo diem cat]. */
export const useExit = (mode: ExitMode = "blur", len = 0.18) => {
  const { t, D } = useSec();
  if (mode === "cut") return { k: 1, blur: 0 };
  const k = interpolate(t, [D - len, D], [1, 0], { ...C, easing: Easing.in(Easing.quad) });
  return { k, blur: mode === "blur" ? (1 - k) * 14 : 0 };
};

// ---------- Kieu chu ----------
export const whiteText = (size: number): React.CSSProperties => ({
  fontFamily: RT.font.body,
  fontWeight: 800,
  fontSize: size,
  color: RT.color.white,
  textShadow: whiteGlow,
  lineHeight: 1.12,
  whiteSpace: "nowrap",
});

/** Chu do: loi sang hong-trang, vien do, phat sang do manh [GOC] */
export const redText = (size: number, font: string = RT.font.punch): React.CSSProperties => ({
  fontFamily: font,
  fontWeight: 900,
  fontSize: size,
  lineHeight: 1.08,
  letterSpacing: "0.005em",
  whiteSpace: "nowrap",
  color: "transparent",
  backgroundImage: `radial-gradient(ellipse 55% 70% at 50% 52%, ${RT.color.redCore} 0%, #FF8F7C 30%, ${RT.color.red} 68%, #D81A08 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  filter: `drop-shadow(0 0 1.5px rgba(60,0,0,0.9)) drop-shadow(0 0 7px rgba(246,42,21,0.85)) drop-shadow(0 0 20px rgba(246,42,21,0.45)) drop-shadow(0 5px 8px rgba(0,0,0,0.6))`,
});

/** Chu vang dam rong [GOC: #FACF1E] */
export const yellowText = (size: number): React.CSSProperties => ({
  fontFamily: RT.font.heavy,
  fontWeight: 900,
  fontSize: size,
  lineHeight: 1.05,
  whiteSpace: "nowrap",
  color: "transparent",
  backgroundImage: `linear-gradient(180deg, #FFE460 0%, ${RT.color.yellow} 55%, #F2B705 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  filter: `drop-shadow(0 0 10px rgba(250,190,20,0.55)) drop-shadow(0 5px 8px rgba(0,0,0,0.6))`,
});

/** Co chu de khong tran khung (uoc luong be rong ky tu theo font). [AI: video mau chu ngan nen khong can] */
export const fit = (text: string, size: number, em: number, maxW = 860) => {
  const w = Array.from(text).length * size * em;
  return w > maxW ? Math.floor((size * maxW) / w) : size;
};

// ---------- Hien chu ----------
/** Go tung ky tu [GOC ~45 ky tu/s]; ky tu moi hien mo -> ro trong 2 frame@30. */
/**
 * Kieu hien chu: "orig" = nhu video mau (go nhanh ~45 ky tu/s, khoi do truot len/nhoe->net)
 * "type" = [THEO NGUOI DUNG] GO BAN PHIM: moi chu hien tung ky tu kem con tro nhap nhay + tieng phim go moi ky tu.
 */
export type Reveal = { mode: "orig" | "type"; cps: number; keyVolume: number; keyFiles?: string[] };
export const RevealCtx = React.createContext<Reveal>({ mode: "orig", cps: RT.time.typeCps, keyVolume: 0 });
export const useReveal = () => React.useContext(RevealCtx);

/** Phudu/Nexa ve "²" thap nhu chi so duoi -> tu ve so 2 nho nang len (sua loi "M₂") */
export const supText = (txt: string): React.ReactNode => {
  if (!txt.includes("²")) return txt;
  return txt.split("²").map((p, i, arr) => (
    <React.Fragment key={i}>
      {p}
      {i < arr.length - 1 ? <span style={{ fontSize: "0.5em", verticalAlign: "0.9em" }}>2</span> : null}
    </React.Fragment>
  ));
};

const KEYS = ["key1", "key2", "key3", "key4", "key5", "key6", "key7", "key8"];
/** Go tung ky tu. O che do "type": toc do ban phim, con tro, tieng phim moi ky tu (dat dung frame ky tu hien). */
export const Typed: React.FC<{ text: string; at?: number; cps?: number; style?: React.CSSProperties; sound?: boolean; keyVol?: number }> = ({ text, at = 0, cps, style, sound = true, keyVol }) => {
  const { t, fps } = useSec();
  const rv = useReveal();
  const typing = rv.mode === "type";
  const speed = cps ?? (typing ? rv.cps : RT.time.typeCps);
  const chars = Array.from(text.normalize("NFC"));
  // nhip go nhu nguoi that: moi phim lech ngau nhien +-35%, ngung them sau dau cach (chi o che do "type")
  const times: number[] = [];
  {
    let acc = at;
    for (let i = 0; i < chars.length; i++) {
      times.push(acc);
      const base = 1 / speed;
      acc += typing ? base * (0.65 + random(`j${text}${i}`) * 0.7) + (chars[i] === " " ? base * 0.6 : 0) : base;
    }
  }
  const tEnd = (times[times.length - 1] ?? at) + 1 / speed;
  let typedCount = 0;
  while (typedCount < times.length && times[typedCount] <= t) typedCount++;
  const n = typing ? typedCount - 1 + 0.999 : (t - at) * speed;
  // con tro: hien khi dang go + 0.5s sau, nhap nhay 2 lan/giay
  const caretOn = typing && t >= at && t < tEnd + 0.5 && (t < tEnd || Math.floor((t - tEnd) * 4) % 2 === 0);
  // Chu to gradient (background-clip:text) bo qua opacity cua con -> tach phan DA GO / CHUA GO thanh 2 span rieng,
  // phan chua go visibility:hidden (giu cho, khong ve). Con tro dat NGAY SAU ky tu vua go (khong chiem cho).
  const shown = Math.max(0, Math.min(chars.length, typing ? typedCount : Math.floor(n)));
  const partial = typing ? 0 : interpolate(n - shown, [0, 1.5], [0, 1], C);
  const caretH = typeof style?.fontSize === "number" ? style.fontSize : 60;
  return (
    <span style={{ whiteSpace: style?.whiteSpace ?? "nowrap", fontSize: style?.fontSize, lineHeight: style?.lineHeight }}>
      <span style={style}>{supText(chars.slice(0, t < at ? 0 : shown).join(""))}</span>
      {!typing && shown < chars.length ? <span style={{ ...style, opacity: partial }}>{chars[shown]}</span> : null}
      {typing ? (
        <span style={{ position: "relative", display: "inline-block", width: 0 }}>
          <span
            style={{
              position: "absolute",
              left: caretH * 0.04,
              bottom: caretH * 0.12,
              width: Math.max(3, caretH * 0.06),
              height: caretH * 0.95,
              background: style?.color && style.color !== "transparent" ? style.color : "#FFFFFF",
              boxShadow: "0 0 8px rgba(255,255,255,0.7)",
              opacity: caretOn ? 1 : 0,
            }}
          />
        </span>
      ) : null}
      <span style={{ ...style, visibility: "hidden" }}>{supText(chars.slice(t < at ? 0 : typing ? shown : shown + 1).join(""))}</span>
      {typing && sound && (keyVol ?? rv.keyVolume) > 0
        ? chars.map((ch, i) => {
            const fr = Math.round(times[i] * fps);
            if (fr < 0) return null;
            const sp = ch === " ";
            const set = rv.keyFiles?.length ? rv.keyFiles : KEYS;
            const k = set[Math.floor(random(`k${text}${i}`) * set.length)];
            return (
              <Sequence key={`a${i}`} from={fr} durationInFrames={Math.round(0.14 * fps)} layout="none" name={`phim ${ch}`}>
                <Audio src={staticFile(`sfx/${sp && !rv.keyFiles?.length ? "keyspace" : k}.wav`)} volume={(keyVol ?? rv.keyVolume) * (sp ? 0.8 : 0.85 + random(`v${text}${i}`) * 0.3)} />
              </Sequence>
            );
          })
        : null}
    </span>
  );
};

/** Nhoe -> net + mo -> ro [GOC 0.23s] */
export const BlurIn: React.FC<{ at?: number; dur?: number; from?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at = 0,
  dur = RT.time.blurIn,
  from = 1.06,
  dy = 0,
  children,
  style,
}) => {
  const { t } = useSec();
  const p = interpolate(t, [at, at + dur], [0, 1], { ...C, easing: easeOut });
  return (
    <div style={{ ...style, opacity: p, filter: `blur(${(1 - p) * 16}px)`, scale: String(interpolate(p, [0, 1], [from, 1])), translate: `0 ${(1 - p) * dy}px` }}>
      {children}
    </div>
  );
};

/** Khoi dat tai tam (x,y) theo ti le khung */
export const Place: React.FC<{ x?: number; y: number; children: React.ReactNode; anchor?: "center" | "left"; style?: React.CSSProperties }> = ({
  x = 0.48, // lech trai nhe: tranh cot nut ben phai TikTok/Reels
  y,
  children,
  anchor = "center",
  style,
}) => (
  <div
    style={{
      position: "absolute",
      left: x * W,
      top: y * H,
      translate: anchor === "center" ? "-50% -50%" : "0 -50%",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- Nen ----------
/** Nen truu tuong xanh than, khoi toi troi cham [GOC: 14.4-20.6, 25.7-36.3, 41.1-50.7]. Mo phong bang gradient + blob (xap xi) */
export const AbstractBg: React.FC<{ seed?: number }> = ({ seed = 1 }) => {
  const { t } = useSec();
  const blobs = [
    { x: 0.15, y: 0.25, r: 0.55, c: "rgba(14,20,30,0.85)" },
    { x: 0.8, y: 0.62, r: 0.6, c: "rgba(16,22,32,0.8)" },
    { x: 0.35, y: 0.88, r: 0.5, c: "rgba(12,18,26,0.85)" },
    { x: 0.75, y: 0.12, r: 0.45, c: "rgba(140,160,186,0.55)" },
    { x: 0.45, y: 0.5, r: 0.4, c: "rgba(98,118,146,0.5)" },
  ];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(205deg, ${RT.color.bgLight} 0%, ${RT.color.bgMid} 48%, ${RT.color.bgDark} 100%)`, overflow: "hidden" }}>
      <AbsoluteFill>
        {blobs.map((b, i) => {
          const ph = random(`bg${seed}-${i}`) * 6.28;
          const dx = Math.sin(t * 0.35 + ph) * 0.08;
          const dy = Math.cos(t * 0.28 + ph * 1.3) * 0.06;
          const d = b.r * W * 1.6;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: (b.x + dx) * W - d / 2,
                top: (b.y + dy) * H - d / 2,
                width: d,
                height: d,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${b.c} 0%, rgba(0,0,0,0) 72%)`, // gradient mem thay blur (render nhanh)
              }}
            />
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(5,10,16,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- Setup + Punch (dong trang nho + dong do lon) ----------
export const SetupPunch: React.FC<{
  setup?: string;
  punch: string;
  setupAt?: number;
  punchAt?: number;
  setupMode?: "blur" | "type";
  punchMode?: "rise" | "type";
  punchColor?: "red" | "yellow";
  y?: number;
  exit?: ExitMode;
}> = ({ setup, punch, setupAt = 0, punchAt = 0.3, setupMode = "blur", punchMode = "rise", punchColor = "red", y = RT.y.setup, exit = "cut" }) => {
  const { t } = useSec();
  const rv = useReveal();
  if (rv.mode === "type") {
    setupMode = "type";
    punchMode = "type";
    // go dong trang xong moi go dong do (1 ban phim tai 1 thoi diem)
    if (setup) punchAt = Math.max(punchAt, setupAt + Array.from(setup).length / rv.cps + 0.12);
  }
  // chu do phai GO XONG truoc khi cat it nhat 0.8s (de doc) -> thieu thoi gian thi go nhanh hon
  const { D } = useSec();
  const pLen = Array.from(punch).length * 1.15; // +15% cho nhip lech/ngat o dau cach
  const avail = D - punchAt - 0.8;
  const punchCps = rv.mode === "type" ? Math.max(rv.cps, pLen / Math.max(0.25, avail)) : undefined;
  const ex = useExit(exit);
  const pst = punchColor === "red" ? redText(fit(punch, RT.size.punch, 0.6)) : yellowText(fit(punch, RT.size.warn, 0.62));
  const rise = interpolate(t, [punchAt, punchAt + 0.25], [0, 1], { ...C, easing: easeOut });
  return (
    <AbsoluteFill style={{ opacity: ex.k, filter: ex.blur ? `blur(${ex.blur}px)` : undefined }}>
      {setup ? (
        <Place y={y}>
          {setupMode === "type" ? (
            <Typed text={setup} at={setupAt} style={whiteText(fit(setup, RT.size.setup, 0.56))} />
          ) : (
            <BlurIn at={setupAt} dur={0.16}>
              <span style={whiteText(fit(setup, RT.size.setup, 0.56))}>{setup}</span>
            </BlurIn>
          )}
        </Place>
      ) : null}
      <Place y={y + (setup ? 0.058 : 0.03)}>
        {punchMode === "type" ? (
          <Typed text={punch} at={punchAt} style={pst} cps={punchCps} />
        ) : (
          // [GOC] truot len tu duoi trong mat na (0.25s)
          <div style={{ clipPath: "inset(-40% -10% 0 -10%)", overflow: "visible" }}>
            <div style={{ ...pst, opacity: rise, translate: `0 ${(1 - rise) * 70}px`, filter: `${pst.filter} blur(${(1 - rise) * 6}px)` }}>{punch}</div>
          </div>
        )}
      </Place>
    </AbsoluteFill>
  );
};

// ---------- Badge so buoc ----------
export const Badge: React.FC<{ n: number | string; size?: number; style?: React.CSSProperties }> = ({ n, size = RT.size.badge, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `radial-gradient(circle at 42% 34%, ${RT.color.badgeHi} 0%, ${RT.color.badge} 52%, #A51C35 100%)`,
      boxShadow: `0 0 0 ${size * 0.035}px rgba(255,190,200,0.35) inset, 0 0 ${size * 0.22}px rgba(232,50,75,0.85), 0 ${size * 0.05}px ${size * 0.12}px rgba(0,0,0,0.45)`,
      fontFamily: RT.font.body,
      fontWeight: 800,
      fontSize: size * 0.62,
      color: "#fff",
      lineHeight: 1,
      paddingTop: size * 0.06,
      textShadow: "0 2px 6px rgba(0,0,0,0.35)",
      ...style,
    }}
  >
    {n}
  </div>
);

/** ① + NHAN: badge pop + nhan nhoe->net [GOC 8.15-8.68s; nhan net dung tu dong tu] */
export const StepBadge: React.FC<{ n: number; label: string; labelAt?: number; exit?: ExitMode }> = ({ n, label, labelAt = 0.12, exit = "cut" }) => {
  const { t, fps, f } = useSec();
  const ex = useExit(exit);
  const s = spring({ frame: f, fps, config: { damping: 11, stiffness: 220, mass: 0.6 } });
  const o = interpolate(t, [0, 0.15], [0, 1], C);
  return (
    <AbsoluteFill style={{ opacity: ex.k, filter: ex.blur ? `blur(${ex.blur}px)` : undefined }}>
      <Place y={RT.y.badge}>
        <div style={{ opacity: o, scale: String(interpolate(s, [0, 1], [0.4, 1])), filter: `blur(${(1 - o) * 10}px)` }}>
          <Badge n={n} />
        </div>
      </Place>
      <Place y={RT.y.badgeLabel}>
        {useReveal().mode === "type" ? (
          <Typed text={label.toUpperCase()} at={labelAt + 0.2} style={{ ...whiteText(fit(label, RT.size.label, 0.72)), textShadow: `${whiteGlow}, 0 0 34px rgba(255,255,255,0.35)` }} />
        ) : (
          <BlurIn at={labelAt} dur={0.5} from={1.04}>
            <span style={{ ...whiteText(fit(label, RT.size.label, 0.72)), textShadow: `${whiteGlow}, 0 0 34px rgba(255,255,255,0.35)` }}>{label.toUpperCase()}</span>
          </BlurIn>
        )}
      </Place>
    </AbsoluteFill>
  );
};

// ---------- Light leak / flare ----------
/** Light leak am truoc diem cat [GOC 9.4-9.6 do, 23.0-23.2 cam]. Dat Sequence dai ~0.35-0.45s ket thuc dung diem cat. */
export const LightLeak: React.FC<{ tone?: "red" | "orange" }> = ({ tone = "red" }) => {
  const { t, D } = useSec();
  const p = interpolate(t, [0, D * 0.5, D], [0, 1, 0.85], { ...C, easing: Easing.inOut(Easing.quad) });
  const c1 = tone === "red" ? "rgba(255,40,30,0.95)" : "rgba(255,140,40,0.95)";
  const c2 = tone === "red" ? "rgba(255,120,60,0.8)" : "rgba(255,210,120,0.85)";
  const sweep = interpolate(t, [0, D], [-0.2, 0.25], C);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: p, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 90% at ${(sweep + 0.05) * 100}% 30%, ${c1} 0%, rgba(0,0,0,0) 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 70% at ${(1 - sweep) * 100}% 75%, ${c2} 0%, rgba(0,0,0,0) 65%)` }} />
      <AbsoluteFill style={{ background: tone === "red" ? "rgba(210,50,30,0.5)" : "rgba(235,130,45,0.5)" }} />
    </AbsoluteFill>
  );
};

/** Flare cau vong + bloom do ket thuc hook [GOC 0.95-1.2s]. [AI] mo phong bang gradient. */
export const FlareBurst: React.FC<{ y?: number }> = ({ y = 0.6 }) => {
  const { t, D } = useSec();
  const p = interpolate(t, [0, D * 0.35, D], [0, 1, 0], C);
  const x = interpolate(t, [0, D], [0.2, 0.75], C);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: p }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, rgba(0,0,0,0) ${x * 100 - 18}%, rgba(255,80,40,0.9) ${x * 100 - 8}%, rgba(255,230,150,1) ${x * 100}%, rgba(120,200,255,0.8) ${x * 100 + 5}%, rgba(200,120,255,0.6) ${x * 100 + 9}%, rgba(0,0,0,0) ${x * 100 + 20}%)`,
          maskImage: `radial-gradient(ellipse 65% 18% at 50% ${y * 100}%, #000 30%, transparent 100%)`,
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 16% at 45% ${y * 100}%, rgba(255,40,20,0.95) 0%, rgba(0,0,0,0) 80%)` }} />
    </AbsoluteFill>
  );
};

// ---------- The kinh nghieng (cau hoi) ----------
export const GlassPill: React.FC<{ text: string; y: number; rot?: number; at?: number; x?: number }> = ({ text, y, rot = -5, at = 0, x = 0.47 }) => {
  const { t } = useSec();
  const p = interpolate(t, [at, at + 0.25], [0, 1], { ...C, easing: easeOut });
  return (
    <Place y={y} x={x} style={{ rotate: `${rot}deg` }}>
      <div
        style={{
          opacity: p,
          scale: String(interpolate(p, [0, 1], [0.86, 1])),
          filter: `blur(${(1 - p) * 10}px)`,
          padding: "26px 48px",
          borderRadius: 30,
          border: "4px solid rgba(255,255,255,0.92)",
          background: "rgba(24,24,30,0.32)",
          boxShadow: "0 0 18px rgba(255,255,255,0.55), inset 0 0 14px rgba(255,255,255,0.22), 0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <Typed text={text.toUpperCase()} at={at + 0.12} style={whiteText(RT.size.pill)} />
      </div>
    </Place>
  );
};

// ---------- Danh sach vi du ----------
export type ListItem = { text: string; at: number };
/** Tieu de go ky tu + muc truot len/nhoe->net, bo cuc zig-zag hoac doc [GOC 14.4-20.6, 32.9-36.3] */
export const ExampleList: React.FC<{ title: string; titleAt?: number; items: ListItem[]; layout?: "zigzag" | "stack"; upper?: boolean; exit?: ExitMode }> = ({
  title,
  titleAt = 0,
  items,
  layout = "zigzag",
  upper = false,
  exit = "cut",
}) => {
  const ex = useExit(exit);
  return (
    <AbsoluteFill style={{ opacity: ex.k, filter: ex.blur ? `blur(${ex.blur}px)` : undefined }}>
      <Place y={RT.y.listTitle}>
        <Typed text={title} at={titleAt} cps={90} style={whiteText(RT.size.listTitle)} />
      </Place>
      {items.map((it, i) => {
        const zig = layout === "zigzag";
        // [GOC] muc dau ~0.30H, cach nhau ~0.067H; zig-zag x 0.15/0.42, xep doc x 0.2
        const x = zig ? (i % 2 === 0 ? 0.12 : 0.38) : 0.16;
        const y = (zig ? 0.45 : 0.45) + i * (zig ? 0.06 : 0.065);
        return (
          <Place key={i} x={x} y={y} anchor="left">
            {useReveal().mode === "type" ? (
              <Typed text={upper ? it.text.toUpperCase() : it.text} at={it.at} style={whiteText(upper ? RT.size.list * 0.86 : RT.size.list)} />
            ) : (
              <BlurIn at={it.at} dy={22} from={1}>
                <span style={whiteText(upper ? RT.size.list * 0.86 : RT.size.list)}>{upper ? it.text.toUpperCase() : it.text}</span>
              </BlurIn>
            )}
          </Place>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- The vang ----------
export type CardLine = { text: string; at: number };
/** The vang trong suot + vien vang phat sang. No ngang roi no doc, chu go sau [GOC 27.1-28.0] */
export const YellowCard: React.FC<{ y: number; lines: CardLine[]; at?: number; tilt3d?: boolean; w?: number; h?: number; upper?: boolean; align?: "center" | "left" }> = ({
  y,
  lines,
  at = 0,
  tilt3d = false,
  w = RT.size.cardW,
  h = RT.size.cardH,
  upper = true,
  align = "center",
}) => {
  const { t } = useSec();
  // [GOC sua sau so sanh] no dong thoi 2 chieu tu khoi nho ~25% x 50%
  // do duong cong: rong 13% -> 62% (0.4s) -> 94% (0.65s) => gan tuyen tinh, cham dan cuoi
  const gx = interpolate(t, [at, at + RT.time.cardGrowX], [0.13, 1], { ...C, easing: Easing.out(Easing.sin) });
  const gy = interpolate(t, [at, at + RT.time.cardGrowX], [0.45, 1], { ...C, easing: Easing.out(Easing.sin) });
  const o = interpolate(t, [at, at + 0.1], [0, 1], C);
  // [GOC 41.3] the 3D: hien tu mo -> ro, nghieng phoi canh
  const tilt = tilt3d ? "perspective(1400px) rotateY(22deg) rotateX(6deg) rotateZ(6deg)" : "none";
  const longest = lines.reduce((a, l) => (l.text.length > a.length ? l.text : a), "");
  const fs = fit(longest, lines.length > 2 ? RT.size.card * 0.88 : lines.length > 1 ? RT.size.card * 0.95 : RT.size.card, upper ? 0.7 : 0.58, w - (align === "left" ? 170 : 90));
  return (
    <Place y={y} style={{ transform: tilt }}>
      <div
        style={{
          width: w,
          height: h,
          opacity: o,
          scale: tilt3d ? String(interpolate(gx, [0.13, 1], [0.9, 1])) : `${gx} ${gy}`,
          filter: tilt3d ? `blur(${(1 - gx) * 10}px)` : undefined,
          borderRadius: 26,
          border: `5px solid ${RT.color.cardBorder}`,
          background: RT.color.cardFill,
          boxShadow: `0 0 16px rgba(250,229,57,0.95), 0 0 40px rgba(250,229,57,0.45), inset 0 0 12px rgba(255,240,120,0.45)`,
          display: "flex",
          flexDirection: "column",
          alignItems: align === "center" ? "center" : "flex-start",
          justifyContent: "center",
          padding: align === "left" ? "0 80px" : 0,
          gap: 6,
        }}
      >
        {lines.map((l, i) => (
          <Typed key={i} text={upper ? l.text.toUpperCase() : l.text} at={l.at} style={{ ...whiteText(fs), textShadow: "0 3px 7px rgba(0,0,0,0.7), 0 0 3px rgba(0,0,0,0.6)" }} />
        ))}
      </div>
    </Place>
  );
};

// ---------- Nhan manh do (wipe) ----------
/** [GOC 36.47-36.70] chu do mo rong tu phai sang trai 0.23s */
export const EmphasisWipe: React.FC<{ text: string; y?: number; at?: number; size?: number; exit?: ExitMode }> = ({ text, y = RT.y.punch, at = 0, size = 84, exit = "cut" }) => {
  const { t } = useSec();
  const ex = useExit(exit);
  const p = interpolate(t, [at, at + RT.time.wipe], [0, 1], { ...C, easing: easeOut });
  // [GOC sua sau so sanh] font Poppins dam (khong phai Montserrat), rong ~0.75W
  const st = { ...redText(size, RT.font.body), fontWeight: 800 };
  return (
    <Place y={y} style={{ opacity: ex.k, filter: ex.blur ? `blur(${ex.blur}px)` : undefined }}>
      {useReveal().mode === "type" ? (
        <Typed text={text.toUpperCase()} at={at} style={st} />
      ) : (
        <div style={{ clipPath: `inset(-30% -5% -30% ${(1 - p) * 85}%)` }}>
          <div style={{ ...st, filter: `${st.filter} blur(${(1 - p) * 5}px)` }}>{text.toUpperCase()}</div>
        </div>
      )}
    </Place>
  );
};

// ---------- So lon + 2 dong ----------
/** [GOC 37.5] so "1" do nghieng rat lon ben trai + 2 dong trang ben phai, lo ra tu trai */
export const BigNumeral: React.FC<{ num: string; line1: string; line2?: string; y?: number; at?: number; dimAt?: number; exit?: ExitMode }> = ({
  num,
  line1,
  line2,
  y = 0.62,
  at = 0,
  dimAt,
  exit = "blur",
}) => {
  const { t } = useSec();
  const ex = useExit(exit, 0.3);
  const p = interpolate(t, [at, at + 0.25], [0, 1], { ...C, easing: easeOut });
  // [GOC] 2 dong lo cham (~0.6s); khi khoi sau xuat hien: 2 dong nhoe tan, so "1" mo nhe nhung CON LAI phia sau
  const dim = dimAt === undefined ? 0 : interpolate(t, [dimAt, dimAt + 0.3], [0, 1], C);
  const st = redText(400);
  const lines = [line1, line2].filter(Boolean) as string[];
  return (
    <AbsoluteFill style={{ opacity: ex.k, filter: ex.blur ? `blur(${ex.blur}px)` : undefined }}>
      <Place x={0.235} y={y}>
        <div style={{ clipPath: `inset(-20% ${(1 - p) * 100}% -20% -20%)`, filter: dim ? `blur(${dim * 5}px)` : undefined, opacity: 1 - dim * 0.35 }}>
          <div style={{ ...st, transform: "skewX(-12deg) scaleX(0.85)" }}>{num}</div>
        </div>
      </Place>
      <Place x={0.345} y={y + 0.015} anchor="left" style={{ opacity: 1 - dim, filter: dim ? `blur(${dim * 14}px)` : undefined }}>
        {lines.map((l, i) => (
          <div key={i} style={{ clipPath: `inset(-30% ${(1 - interpolate(t, [at + 0.3 + i * 0.25, at + 0.75 + i * 0.25], [0, 1], C)) * 100}% -30% -5%)` }}>
            <div style={whiteText(70)}>{l.toUpperCase()}</div>
          </div>
        ))}
      </Place>
    </AbsoluteFill>
  );
};

/** [GOC 38.5] canh bao: dong vang lon go ky tu + dong trang nho */
export const Warning: React.FC<{ head: string; sub?: string; y?: number; at?: number; subAt?: number; color?: "yellow" | "red"; exit?: ExitMode }> = ({
  head,
  sub,
  y = 0.6,
  at = 0,
  subAt,
  color = "yellow",
  exit = "cut",
}) => {
  const ex = useExit(exit);
  const hs = color === "yellow" ? yellowText(fit(head, RT.size.warn, 0.62)) : redText(fit(head, RT.size.warn * 0.86, 0.62), RT.font.heavy);
  return (
    <AbsoluteFill style={{ opacity: ex.k, filter: ex.blur ? `blur(${ex.blur}px)` : undefined }}>
      <Place y={y}>
        {useReveal().mode === "type" ? (
          <Typed text={head.toUpperCase()} at={at} style={hs} />
        ) : (
          <BlurIn at={at} dur={0.2} from={1.1}>
            <Typed text={head.toUpperCase()} at={at} cps={30} style={hs} />
          </BlurIn>
        )}
      </Place>
      {sub ? (
        <Place y={y + 0.06}>
          <Typed text={sub} at={subAt ?? at + 0.3} style={whiteText(fit(sub, RT.size.warnSub, 0.56))} />
        </Place>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- Cap doi lap: "KHONG CAN DEP" + 2 tu do ----------
export const ContrastPair: React.FC<{ neg: string; words: Array<{ text: string; at: number; x: number }>; y?: number; at?: number; exit?: ExitMode }> = ({
  neg,
  words,
  y = 0.555,
  at = 0,
  exit = "blur",
}) => {
  const { t, fps, f } = useSec();
  const ex = useExit(exit, 0.3);
  return (
    <AbsoluteFill style={{ opacity: ex.k, filter: ex.blur ? `blur(${ex.blur}px)` : undefined }}>
      <Place y={y}>
        <Typed text={neg.toUpperCase()} at={at} style={whiteText(76)} />
      </Place>
      {words.map((w, i) => {
        const s = spring({ frame: f - Math.round(w.at * fps), fps, config: { damping: 12, stiffness: 240, mass: 0.6 } });
        const o = interpolate(t, [w.at, w.at + 0.08], [0, 1], C);
        return (
          <Place key={i} x={w.x} y={y + 0.05}>
            <div style={{ ...redText(118, RT.font.heavy), opacity: o, scale: String(interpolate(s, [0, 1], [1.5, 1])) }}>{w.text.toUpperCase()}</div>
          </Place>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Tom tat 1-2-3 + no tia sang ----------
/** [GOC 54.3-55.8] badge hien lan luot roi no thanh tia sang do */
export const RecapBadges: React.FC<{ nums?: Array<number | string>; at?: number; stagger?: number; burstAt?: number; y?: number }> = ({
  nums = [1, 2, 3],
  at = 0,
  stagger = RT.time.badgeStagger,
  burstAt = 1.2,
  y = 0.62,
}) => {
  const { t, fps, f } = useSec();
  const xs = nums.map((_, i) => 0.25 + (0.5 * i) / Math.max(1, nums.length - 1));
  const b = interpolate(t, [burstAt, burstAt + 0.45], [0, 1], C);
  return (
    <AbsoluteFill>
      {nums.map((n, i) => {
        const st = at + i * stagger;
        const s = spring({ frame: f - Math.round(st * fps), fps, config: { damping: 10, stiffness: 260, mass: 0.5 } });
        const o = interpolate(t, [st, st + 0.08], [0, 1], C) * (1 - b);
        return (
          <Place key={i} x={xs[i]} y={y}>
            <div style={{ opacity: o, scale: String(interpolate(s, [0, 1], [0.3, 1]) * (1 + b * 0.7)), filter: `blur(${b * 12}px) brightness(${1 + b * 1.6})` }}>
              <Badge n={n} size={140} />
            </div>
            {b > 0 && b < 1 ? (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 420,
                  height: 420,
                  translate: "-50% -50%",
                  opacity: Math.sin(b * Math.PI),
                  scale: String(0.5 + b),
                  mixBlendMode: "screen",
                  background: "repeating-conic-gradient(from 0deg, rgba(255,60,60,0.9) 0deg 6deg, rgba(0,0,0,0) 6deg 30deg)",
                  maskImage: "radial-gradient(circle, #000 10%, transparent 70%)",
                  borderRadius: "50%",
                }}
              />
            ) : null}
          </Place>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Dao cu 3D ----------
/** Dong ho 3D canh mat [GOC 4.2-6.0] + tan thanh hat bui bay ngang. Ve SVG (xap xi asset 3D goc). */
export const ClockProp: React.FC<{ x?: number; y?: number; size?: number; dissolveAt?: number }> = ({ x = 0.78, y = 0.38, size = 470, dissolveAt }) => {
  const { t, D } = useSec();
  const dAt = dissolveAt ?? D - 0.45;
  const pin = interpolate(t, [0, 0.25], [0, 1], { ...C, easing: easeOut });
  const dis = interpolate(t, [dAt, dAt + 0.4], [0, 1], C);
  const hand = (deg: number, len: number, w: number, c: string) => (
    <line x1="0" y1="0" x2={Math.sin((deg * Math.PI) / 180) * len} y2={-Math.cos((deg * Math.PI) / 180) * len} stroke={c} strokeWidth={w} strokeLinecap="round" />
  );
  const parts = Array.from({ length: 160 }, (_, i) => {
    const a = random(`ca${i}`) * Math.PI * 2;
    const r = Math.sqrt(random(`cr${i}`)) * size * 0.48;
    const sp = 0.6 + random(`cs${i}`) * 1.4;
    return { x0: Math.cos(a) * r, y0: Math.sin(a) * r, sp, s: 2 + random(`cz${i}`) * 4 };
  });
  return (
    <Place x={x} y={y}>
      <div style={{ opacity: pin * (1 - dis), scale: String(interpolate(pin, [0, 1], [0.8, 1])), transform: "perspective(1200px) rotateY(-20deg)", filter: `drop-shadow(0 0 30px rgba(255,255,255,0.55)) blur(${dis * 4}px)` }}>
        <svg width={size} height={size} viewBox="-100 -100 200 200">
          <circle r="96" fill="#F4F4F2" stroke="#D9825B" strokeWidth="4" />
          <circle r="90" fill="none" stroke="#e6e6e2" strokeWidth="2" />
          {Array.from({ length: 12 }, (_, i) => (
            <text key={i} x={Math.sin(((i + 1) * Math.PI) / 6) * 74} y={-Math.cos(((i + 1) * Math.PI) / 6) * 74 + 6} fontSize="17" textAnchor="middle" fill="#333" fontFamily="Poppins" fontWeight={500}>
              {i + 1}
            </text>
          ))}
          {hand(190 + t * 30, 48, 5, "#333")}
          {hand(-60 + t * 2, 36, 6, "#333")}
          {hand(120 + t * 360, 70, 2, "#E0463A")}
          <circle r="5" fill="#E0463A" />
        </svg>
      </div>
      {dis > 0 ? (
        <div style={{ position: "absolute", left: "50%", top: "50%" }}>
          {parts.map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: p.x0 + dis * p.sp * 520 - p.s / 2,
                top: p.y0 - dis * p.sp * 160 * (p.y0 > 0 ? 0.4 : 1),
                width: p.s,
                height: p.s,
                borderRadius: "50%",
                background: "#fff",
                opacity: (1 - dis) * 0.9,
                boxShadow: "0 0 6px #fff",
              }}
            />
          ))}
        </div>
      ) : null}
    </Place>
  );
};

/** Dong ho cat 3D xoay (xap xi asset 3D goc 0.2-1.0s) [AI: ve SVG + xoay CSS 3D] */
export const HourglassProp: React.FC<{ x?: number; y?: number; size?: number }> = ({ x = 0.5, y = 0.6, size = 420 }) => {
  const { t } = useSec();
  const p = interpolate(t, [0, 0.2], [0, 1], { ...C, easing: easeOut });
  return (
    <Place x={x} y={y}>
      <div style={{ opacity: p, scale: String(interpolate(p, [0, 1], [0.6, 1])), transform: `perspective(1000px) rotateZ(${-35 + t * 25}deg) rotateY(${t * 40}deg)`, filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.5))" }}>
        <svg width={size * 0.6} height={size} viewBox="0 0 120 200">
          <defs>
            <linearGradient id="wood" x1="0" x2="1">
              <stop offset="0" stopColor="#7a4a26" />
              <stop offset="0.5" stopColor="#c98b52" />
              <stop offset="1" stopColor="#6b3e1e" />
            </linearGradient>
          </defs>
          <rect x="4" y="2" width="112" height="16" rx="6" fill="url(#wood)" />
          <rect x="4" y="182" width="112" height="16" rx="6" fill="url(#wood)" />
          <path d="M22 18 C22 70 56 82 56 100 C56 118 22 130 22 182 L98 182 C98 130 64 118 64 100 C64 82 98 70 98 18 Z" fill="rgba(230,240,250,0.35)" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
          <path d="M34 40 C40 70 58 84 60 98 C62 84 80 70 86 40 Z" fill="#e3c48f" />
          <path d="M30 180 C34 150 56 140 60 128 C64 140 86 150 90 180 Z" fill="#d9b57a" />
          <rect x="8" y="18" width="8" height="164" fill="url(#wood)" />
          <rect x="104" y="18" width="8" height="164" fill="url(#wood)" />
        </svg>
      </div>
    </Place>
  );
};
