/**
 * Bo hieu ung "Mau Quyet Tran Lux" (BDS cao cap, dien anh) — dung lai tu 2 video mau TikTok.
 * Timing tinh bang GIAY (t = frame/fps) -> chay dung o 30 va 60 FPS.
 * [XM] = da do tren khung hinh; [UD] = uoc doan. Chi tiet: styles/quyet-tran-lux/references/style-spec.md
 * KHONG tai tao logo/watermark "Q" cua kenh mau.
 */
import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { QtKPiece } from "./kinetic";

export const QT = {
  white: "#F8F9FD", // [XM] mau chu do tu khung 33.4s/131.9s
  cream: "#E8E6D6", // [XM] chu lon dung thang "SỰ THẬT LÀ" (ref01 1.0s) — trang nga vang nhat
  ink: "#111214", // [XM] chu toi tren nen sang ("SUC KHOE & CAN BANG")
  gold: "#E9B24C", // [XM] accent_colors ref01 (anh den am) — dung rat it
  bgTop: "#3a3a3c", // [XM] nen gradient trang anh ghep (ref01 163s)
  bgBottom: "#0e0e10",
  font: "'Montserrat'",
  fontSub: "'Be Vietnam Pro'",
  // bong mem, khong vien [XM hinh dang / UD thong so]
  shadow: "0 2px 6px rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.35)",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

/** Thoi gian (giay) trong Sequence hien tai. */
const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: f / fps, fps };
};

/** Vao: mo + nho -> ro (blur) + troi len nhe. Thoat: mo + blur. [XM] strip r2_63can, r2_bluffs */
const blurRise = (t: number, start: number, dur: number, outAt: number, rise = 26, inDur = 0.42) => {
  const p = interpolate(t, [start, start + inDur], [0, 1], { ...clamp, easing: easeOut });
  const o = interpolate(t, [outAt, outAt + 0.3], [1, 0], { ...clamp, easing: easeIn });
  return {
    opacity: p * o,
    filter: `blur(${(1 - p) * 10 + (1 - o) * 8}px)`,
    translate: `0 ${(1 - p) * rise}px`,
    scale: `${1 + (1 - p) * 0.06}`,
  } as React.CSSProperties;
};

// Dau tieng Viet (Ầ, Ỗ...) khong bi cat o dong tren
const viPad: React.CSSProperties = { paddingTop: "0.22em", marginTop: "-0.22em", lineHeight: 1.12 };

/**
 * 1 [XM] Tieu de 2 dong: dong dan nho (nghieng, chu thuong) + TU KHOA lon (dam, nghieng, IN HOA).
 * Vi du "IXORA 2 có / 63 CĂN", "sân golf / THE BLUFFS". Can giua; y mac dinh 0.62H (mau: 0.57/0.62H).
 */
export const QtTitle: React.FC<{
  lead?: string;
  main: string;
  y?: number; // tam dong main, ti le chieu cao
  size?: number; // co chu main (px @1080)
  align?: "center" | "left";
  x?: number; // le trai khi align=left (ti le W)
  dark?: boolean; // chu toi tren nen sang
  duration: number; // giay
}> = ({ lead, main, y = 0.62, size = 108, align = "center", x = 0.22, dark, duration }) => {
  const { t } = useT();
  const { width, height } = useVideoConfig();
  const out = duration - 0.32;
  const col = dark ? QT.ink : QT.white;
  // vua 1 dong: Montserrat 800 nghieng IN HOA ~0.7em/ky tu
  size = Math.min(size, (width - 140) / (Math.max(4, main.length) * 0.7));
  const box: React.CSSProperties =
    align === "center"
      ? { position: "absolute", left: 60, right: 60, textAlign: "center" }
      : { position: "absolute", left: x * width, right: 60, textAlign: "left" };
  return (
    <AbsoluteFill>
      <div style={{ ...box, top: y * height, translate: "0 -100%" }}>
        {lead ? (
          <div
            style={{
              ...viPad,
              fontFamily: QT.font,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: size * 0.66,
              color: col,
              textShadow: dark ? "none" : QT.shadow,
              ...blurRise(t, 0, duration, out, 14, 0.36),
            }}
          >
            {lead}
          </div>
        ) : null}
        <div
          style={{
            ...viPad,
            fontFamily: QT.font,
            fontStyle: "italic",
            fontWeight: 800,
            fontSize: size,
            letterSpacing: "0.01em",
            color: col,
            whiteSpace: "nowrap",
            textShadow: dark ? "none" : QT.shadow,
            ...blurRise(t, lead ? 0.18 : 0, duration, out, 30),
          }}
        >
          {main}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * 2 [XM] Hien tung ky tu roi rac + gian chu khep lai (strip r2_bluffs 130.9–131.6s: ~0.6s).
 * Moi ky tu bat dau ngau nhien trong 0.35s, mo dan + het blur; letter-spacing 0.45em -> 0.02em.
 */
export const QtTrackingReveal: React.FC<{ lead?: string; main: string; y?: number; size?: number; duration: number; seed?: string }> = ({
  lead,
  main,
  y = 0.2,
  size = 98,
  duration,
  seed = "qt",
}) => {
  const { t } = useT();
  const { width, height } = useVideoConfig();
  size = Math.min(size, (width - 160) / (Math.max(4, main.length) * 0.72));
  const out = interpolate(t, [duration - 0.32, duration], [1, 0], { ...clamp, easing: easeIn });
  const p = interpolate(t, [0, 0.75], [0, 1], { ...clamp, easing: easeOut });
  const chars = (txt: string, s: string, base: number) =>
    [...txt].map((c, i) => {
      const st = base + random(`${seed}${s}${i}`) * 0.35;
      const q = interpolate(t, [st, st + 0.3], [0, 1], { ...clamp, easing: easeOut });
      return (
        <span key={i} style={{ opacity: q, filter: `blur(${(1 - q) * 6}px)`, display: "inline-block", whiteSpace: "pre" }}>
          {c}
        </span>
      );
    });
  const line = (txt: string, s: string, base: number, st: React.CSSProperties) => (
    <div style={{ ...viPad, letterSpacing: `${0.45 * (1 - p) + 0.02}em`, whiteSpace: "nowrap", ...st }}>{chars(txt, s, base)}</div>
  );
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y * height,
          translate: "0 -100%",
          textAlign: "center",
          fontFamily: QT.font,
          fontStyle: "italic",
          color: QT.white,
          textShadow: QT.shadow,
          opacity: out,
          filter: `blur(${(1 - out) * 8}px)`,
        }}
      >
        {lead ? line(lead, "l", 0, { fontWeight: 600, fontSize: size * 0.72 }) : null}
        {line(main, "m", 0.12, { fontWeight: 800, fontSize: size })}
      </div>
    </AbsoluteFill>
  );
};

/** 3 [XM] So lieu can trai: dong dan nho mo + SO LON dam co don vi mu ("Mỗi căn rộng từ / 224 - 300 m²"). */
export const QtNumber: React.FC<{ lead?: string; value: string; unit?: string; x?: number; y?: number; size?: number; duration: number }> = ({
  lead,
  value,
  unit,
  x = 0.2,
  y = 0.6,
  size = 108,
  duration,
}) => {
  const { t } = useT();
  const { width, height } = useVideoConfig();
  const out = duration - 0.32;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: x * width, top: y * height, translate: "0 -100%", fontFamily: QT.font, color: QT.white, textShadow: QT.shadow }}>
        {lead ? (
          <div style={{ ...viPad, fontStyle: "italic", fontWeight: 600, fontSize: size * 0.36, opacity: 0.95, ...blurRise(t, 0, duration, out, 10, 0.3) }}>{lead}</div>
        ) : null}
        <div style={{ ...viPad, fontWeight: 800, fontSize: size, whiteSpace: "nowrap", ...blurRise(t, 0.15, duration, out, 26) }}>
          {value}
          {unit ? <span style={{ fontSize: size * 0.3, verticalAlign: "1.1em", marginLeft: 8, textTransform: "uppercase" }}>{unit}</span> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** 4 [XM] Phu de nho kieu "dien anh": cum tu ngan, chu thuong, trang, ~32px, mo vao/ra 0.15s. */
export const QtSubtitle: React.FC<{ text: string; y?: number; duration: number; dark?: boolean }> = ({ text, y = 0.6, duration, dark }) => {
  const { t } = useT();
  const { height } = useVideoConfig();
  const o = interpolate(t, [0, 0.15, duration - 0.15, duration], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: y * height,
        translate: "0 -50%",
        textAlign: "center",
        fontFamily: QT.fontSub,
        fontWeight: 600,
        fontSize: 42,
        color: dark ? QT.ink : QT.white,
        textShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.4)",
        opacity: o,
        ...viPad,
      }}
    >
      {text}
    </div>
  );
};

/** 5 [XM] Tieu de muc IN HOA dam vua, khong nghieng ("DANH SÁCH ĐƠN VỊ TƯ VẤN", "SỨC KHỎE & CÂN BẰNG"). */
export const QtHeading: React.FC<{ text: string; lead?: string; y?: number; size?: number; dark?: boolean; duration: number }> = ({
  text,
  lead,
  y = 0.24,
  size = 54,
  dark,
  duration,
}) => {
  const { t } = useT();
  const { height } = useVideoConfig();
  const out = duration - 0.3;
  const col = dark ? QT.ink : QT.white;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y * height, translate: "0 -100%", textAlign: "center", fontFamily: QT.font, color: col }}>
      {lead ? (
        <div style={{ ...viPad, fontStyle: "italic", fontWeight: 600, fontSize: size * 0.9, textShadow: dark ? "none" : QT.shadow, ...blurRise(t, 0, duration, out, 10, 0.3) }}>{lead}</div>
      ) : null}
      <div
        style={{
          ...viPad,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: "0",
          whiteSpace: "nowrap",
          textShadow: dark ? "none" : QT.shadow,
          ...blurRise(t, lead ? 0.15 : 0, duration, out, 16, 0.35),
        }}
      >
        {text}
      </div>
    </div>
  );
};

/**
 * 6 [XM] Trang anh ghep: nen gradient xam toi, 3 the anh xep doc vien trang manh,
 * tieu de IN HOA dam tung dong goc tren-trai the 1, nhan nho goc duoi-phai the 2.
 * [UD] cach vao cua the (mau co nhay trang luc 162.4s nen khong thay ro) -> truot len + mo, so le 0.12s.
 */
export const QtCardStack: React.FC<{
  images: string[]; // 1-3 anh (staticFile hoac url)
  title?: string[]; // vd ["TRẦN", "CAO", "6.8 m"]
  label?: string; // vd "HỒ BƠI RIÊNG" (hien sau 1.6s, the 2)
  renderCard?: (i: number) => React.ReactNode; // thay anh bang node (demo)
  duration: number;
}> = ({ images, title = [], label, renderCard, duration }) => {
  const { t } = useT();
  const { width, height } = useVideoConfig();
  const n = Math.max(images.length, renderCard ? 3 : 0);
  const cw = width * 0.81;
  const ch = height * 0.258;
  const gap = height * 0.008;
  const top0 = (height - (n * ch + (n - 1) * gap)) / 2;
  const out = interpolate(t, [duration - 0.3, duration], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 70% 10%, ${QT.bgTop} 0%, #1d1d20 55%, ${QT.bgBottom} 100%)`, opacity: out }}>
      {Array.from({ length: n }).map((_, i) => {
        const p = interpolate(t, [i * 0.12, i * 0.12 + 0.5], [0, 1], { ...clamp, easing: easeOut });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (width - cw) / 2,
              top: top0 + i * (ch + gap),
              width: cw,
              height: ch,
              border: "3px solid rgba(255,255,255,0.92)",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              opacity: p,
              translate: `0 ${(1 - p) * 60}px`,
            }}
          >
            {renderCard ? renderCard(i) : <Img src={images[i]} style={{ width: "100%", height: "100%", objectFit: "cover", scale: `${1.08 - 0.06 * Math.min(1, t / duration)}` }} />}
            {i === 0 && title.length ? (
              <div style={{ position: "absolute", left: 22, top: 18, fontFamily: QT.font, fontWeight: 800, fontSize: 78, color: QT.white, lineHeight: 1.0, textShadow: QT.shadow }}>
                {title.map((l, k) => (
                  <div key={k} style={{ ...viPad, lineHeight: 1.22, ...blurRise(t, 0.35 + k * 0.22, duration, duration, 18, 0.32), fontSize: k === title.length - 1 && title.length > 1 ? 68 : 78 }}>
                    {l}
                  </div>
                ))}
              </div>
            ) : null}
            {i === 1 && label ? (
              <div style={{ position: "absolute", right: 22, bottom: 18, fontFamily: QT.font, fontWeight: 800, fontSize: 34, color: QT.white, textShadow: QT.shadow, ...blurRise(t, 1.6, duration, duration, 10, 0.3) }}>
                {label}
              </div>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** 7 [XM] Nhay trang chuyen canh (~1.5 lan/phut, luon kem SFX). Dat o diem cat; dinh tai `peak` giay. */
export const QtFlash: React.FC<{ peak?: number; strength?: number; color?: string }> = ({ peak = 0.12, strength = 0.95, color = "#fffaf0" }) => {
  const { t } = useT();
  const o = interpolate(t, [0, peak, peak + 0.4], [0, strength, 0], { ...clamp, easing: Easing.out(Easing.quad) });
  return <AbsoluteFill style={{ backgroundColor: color, opacity: o, mixBlendMode: "screen" }} />;
};

/** 8 [XM] Dip qua den (chuyen doan): toi dan 0.25s -> den -> sang lai 0.4s (strip r2_suckhoe 63.4s). */
export const QtDip: React.FC<{ hold?: number; color?: string }> = ({ hold = 0.1, color = "#000" }) => {
  const { t } = useT();
  const o = interpolate(t, [0, 0.25, 0.25 + hold, 0.65 + hold], [0, 1, 1, 0], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return <AbsoluteFill style={{ backgroundColor: color, opacity: o }} />;
};

/** 9 [XM] Man hinh chu tren nen toi gradient (ref01 87.2s "như là"): dung cho cau dan/chuyen y. */
export const QtDarkCard: React.FC<{ text: string; duration: number }> = ({ text, duration }) => {
  const { t } = useT();
  const o = interpolate(t, [0, 0.25, duration - 0.25, duration], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 80% 0%, #4a4a4c 0%, #202022 45%, ${QT.bgBottom} 100%)`, opacity: o }}>
      <QtSubtitle text={text} y={0.5} duration={duration} />
    </AbsoluteFill>
  );
};

/** Chinh mau nhe kieu dien anh am (UD): tuong phan + am nhe, vignette mem. Boc ngoai footage. */
export const QtGrade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ filter: "contrast(1.06) saturate(1.05) sepia(0.06) brightness(1.0)" }}>{children}</AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)" }} />
  </AbsoluteFill>
);

/**
 * 10 [XM] Phu de chay theo CUM TU (3–6 tu) — dac trung cua mau: hien dung luc tu dau cum duoc noi
 * (do tren transcript ref01: "Trong khi đó"@10.0s, "Anh chị hãy nhìn vào"@49.6s), vi tri ~0.53H.
 * Bi an trong cac khoang `mute` (luc dang co tieu de lon thay the).
 */
export type QtWord = { text: string; startMs: number; endMs: number };
// Tu mo dau menh de (Whisper viet hoa khi bat dau cau) -> diem ngat cum tu nhien
const STARTERS = /^(Trong|Anh|Chị|Như|Thế|Và|Nhưng|Thì|Còn|Đây|Đó|Bởi|Vì|Nếu|Khi|Tại|Với|Chỉ|Ngoài|Không|Có|Mỗi|Hãy|Ở|Đặc|Điều|Nên|Vậy|Sau|Rồi|Mà|Cho|Để|Là|Một|Các|Những|Toàn|Tất|Hơn|Kiến|Cảnh|Ánh)$/;
const isCap = (t: string) => /^\p{Lu}/u.test(t.trim());
export const groupPhrases = (words: QtWord[], maxWords = 6, gapMs = 280) => {
  const out: { text: string; startMs: number; endMs: number }[] = [];
  let cur: QtWord[] = [];
  const flush = () => {
    if (cur.length) out.push({ text: cur.map((w) => w.text.trim()).join(" ").replace(/[,.]$/, ""), startMs: cur[0].startMs, endMs: cur[cur.length - 1].endMs });
    cur = [];
  };
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const t = w.text.trim();
    // ngat truoc tu mo dau menh de (Whisper viet hoa); tu viet hoa khac = ten rieng -> khong ngat
    const capBreak = isCap(t) && STARTERS.test(t);
    const gap = prev ? w.startMs - prev.endMs : 0;
    // cum dai: chi ngat o cho co khoang nghi nho giua 2 am tiet (tranh tach "danh | sách")
    const last = cur[cur.length - 1]?.text.trim() ?? "";
    const longBreak = cur.length >= maxWords && (!isCap(t) || !isCap(last)) && (gap > 40 || cur.length >= maxWords + 2);
    if (cur.length && (capBreak || gap > gapMs || longBreak || cur.length >= maxWords + 4)) flush();
    cur.push(w);
    if (/[,.!?:;]$/.test(t) && cur.length >= 2) flush();
  });
  flush();
  // gop cum 1 tu le vao cum truoc (vd "Kiếm" bi tach khoi "Hồ Hoàng")
  return out.reduce<typeof out>((acc, p) => {
    const q = acc[acc.length - 1];
    if (q && !p.text.includes(" ") && p.startMs - q.endMs < 300 && q.text.split(" ").length < maxWords + 5 && !STARTERS.test(p.text)) {
      q.text += " " + p.text;
      q.endMs = p.endMs;
    } else acc.push({ ...p });
    return acc;
  }, []);
};

export const QtPhraseCaptions: React.FC<{ words: QtWord[]; y?: number; mute?: Array<[number, number]>; maxWords?: number }> = ({
  words,
  y = 0.53,
  mute = [],
  maxWords = 6,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (f / fps) * 1000;
  const phrases = groupPhrases(words, maxWords);
  const i = phrases.findIndex((p, k) => ms >= p.startMs - 60 && ms < Math.min(p.endMs + 500, phrases[k + 1]?.startMs ?? Infinity));
  if (i < 0) return null;
  const p = phrases[i];
  if (mute.some(([a, b]) => p.startMs < b && p.endMs > a)) return null;
  const end = Math.min(p.endMs + 500, phrases[i + 1]?.startMs ?? Infinity);
  const local = (ms - (p.startMs - 60)) / 1000;
  return <QtSubtitleAt text={p.text} y={y} t={local} duration={(end - p.startMs + 60) / 1000} />;
};

/** Ban QtSubtitle nhan thoi gian ngoai (dung trong QtPhraseCaptions, khong can Sequence). */
const QtSubtitleAt: React.FC<{ text: string; y: number; t: number; duration: number }> = ({ text, y, t, duration }) => {
  const { height } = useVideoConfig();
  const o = interpolate(t, [0, 0.12, duration - 0.12, duration], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: y * height,
        translate: "0 -50%",
        textAlign: "center",
        fontFamily: QT.fontSub,
        fontWeight: 600,
        fontSize: 42,
        color: QT.white,
        textShadow: "0 1px 3px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.4)",
        opacity: o,
        ...viPad,
      }}
    >
      {text}
    </div>
  );
};

/* ======================================================================================
 * 11 [XM] CHU CHAY THEO LOI NOI — "Có một / SỰ THẬT LÀ ở phía nam / HÀ NỘI" (ref01 0.1–2.2s),
 * "Chỉ mất chưa đến 10 PHÚT / để đến / HỒ HOÀN KIẾM" (ref01 7.6–9.6s).
 * Khoi chu xay dan theo bac thang: moi manh hien DUNG luc tu do duoc noi (lech <=0.1s).
 * - lead: chu nho NGHIENG trang (Montserrat 600i, ~0.42x)
 * - main: chu lon DUNG THANG mau kem #E8E6D6 (Montserrat 800)
 * - dong cuoi thuong CAN PHAI; manh `fx:"slide"` lao vao tu trai + nhoe chuyen dong ("HỒ HOÀN KIẾM");
 *   `fx:"neg"` = chu am ban.
 * ==================================================================================== */
export type QtRunPiece = { text: string; kind: "lead" | "main"; t: number; fx?: "slide" | "neg" };
export type QtRunLine = { align?: "left" | "right" | "center"; pieces: QtRunPiece[] };

const RunPiece: React.FC<{ p: QtRunPiece; t: number; size: number; out: number }> = ({ p, t, size, out }) => {
  const k = interpolate(t, [p.t, p.t + (p.fx === "slide" ? 0.28 : 0.2)], [0, 1], { ...clamp, easing: easeOut });
  const lead = p.kind === "lead";
  const neg = p.fx === "neg" || (p.fx === "slide" && k < 1);
  const style: React.CSSProperties = {
    display: "inline-block",
    whiteSpace: "pre",
    fontFamily: QT.font,
    fontStyle: lead ? "italic" : "normal",
    fontWeight: lead ? 600 : 800,
    fontSize: lead ? size * 0.46 : size,
    letterSpacing: lead ? "0" : "0.005em",
    color: lead ? QT.white : QT.cream,
    textShadow: lead ? "0 1px 3px rgba(0,0,0,0.85), 0 0 12px rgba(0,0,0,0.4)" : "0 3px 10px rgba(0,0,0,0.55), 0 0 28px rgba(0,0,0,0.35)",
    opacity: k * out,
    filter: `blur(${(1 - k) * (p.fx === "slide" ? 3 : 8) + (1 - out) * 8}px)`,
    translate: p.fx === "slide" ? `${(1 - k) * -220}px 0` : `0 ${(1 - k) * 10}px`,
    transform: p.fx === "slide" ? `skewX(${(1 - k) * -14}deg) scaleX(${1 + (1 - k) * 0.25})` : undefined,
    margin: lead ? "0 0.25em" : "0",
    lineHeight: 1.0,
    verticalAlign: "baseline",
  };
  if (neg) {
    // am ban: lop chu trang tron "difference" -> dao mau video ben duoi
    return (
      <span style={{ ...style, color: "#fff", textShadow: "none", mixBlendMode: "difference" }}>{p.text}</span>
    );
  }
  return <span style={style}>{p.text}</span>;
};

export const QtRunText: React.FC<{
  lines: QtRunLine[];
  y?: number; // dinh khoi chu (ti le H)
  x0?: number; // le trai (ti le W)
  x1?: number; // le phai (ti le W)
  size?: number; // co chu main (px)
  duration: number;
}> = ({ lines, y = 0.56, x0 = 0.12, x1 = 0.12, size = 104, duration }) => {
  const { t } = useT();
  const { width, height } = useVideoConfig();
  const out = interpolate(t, [duration - 0.3, duration], [1, 0], { ...clamp, easing: easeIn });
  const avail = width * (1 - x0 - x1);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: width * x0, width: avail, top: y * height }}>
        {lines.map((ln, i) => {
          // vua 1 dong: uoc luong be rong (main 0.7em/ky tu, lead 0.42*0.55em)
          const est = ln.pieces.reduce((a, p) => a + (p.kind === "main" ? p.text.length * 0.7 : p.text.length * 0.46 * 0.56 + 0.2), 0);
          const sz = Math.min(size, avail / Math.max(1, est));
          return (
            <div key={i} style={{ textAlign: ln.align ?? "left", fontSize: sz, lineHeight: 1.22, marginTop: i ? -sz * 0.08 : 0, whiteSpace: "nowrap" }}>
              {ln.pieces.map((p, k) => (
                <RunPiece key={k} p={p} t={t} size={sz} out={out} />
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ======================================================================================
 * 12 [XM] CHU AM BAN — "Khu vực giao giữa / HOÀNG MAI - HAI BÀ TRƯNG" (ref01 3.3s),
 * "ĐIỂM GIAO NHAU / VÔ CÙNG SÔI ĐỘNG" (ref01 5.6–7.0s): ruot chu DAO MAU nen (difference) + quang sang trang,
 * hien tung ky tu roi rac ~0.4s. `cross` = 2 dong nghieng NGUOC CHIEU cat nhau (dong 1 ~+8°, dong 2 ~-8°)
 * — dung khi loi noi co y "giao nhau / ngã 3 / kết nối".
 * ==================================================================================== */
export const QtNegative: React.FC<{
  lead?: string; // dong dan nho nghieng (khong am ban)
  lines: string[]; // 1–2 dong chu am ban IN HOA
  lineAt?: number[]; // giay (tuong doi) moi dong bat dau, theo loi noi
  cross?: boolean;
  y?: number; // tam khoi (ti le H)
  x?: number; // le trai khi khong cross
  size?: number;
  duration: number;
  seed?: string;
}> = ({ lead, lines, lineAt, cross, y = 0.14, x = 0.08, size = 92, duration, seed = "neg" }) => {
  const { t } = useT();
  const { width, height } = useVideoConfig();
  const out = interpolate(t, [duration - 0.3, duration], [1, 0], { ...clamp, easing: easeIn });
  const at = lineAt ?? lines.map((_, i) => (lead ? 0.25 : 0) + i * 0.6);
  const sizes = lines.map((l) => Math.min(size, (width * (cross ? 0.86 : 0.84)) / (Math.max(4, l.length) * 0.7)));
  const letters = (txt: string, li: number, st: number) =>
    [...txt].map((c, i) => {
      const s0 = st + random(`${seed}${li}${i}`) * 0.35;
      const q = interpolate(t, [s0, s0 + 0.12], [0, 1], clamp);
      return (
        <span key={i} style={{ opacity: q, display: "inline-block", whiteSpace: "pre" }}>
          {c}
        </span>
      );
    });
  const lineBox = (txt: string, i: number): React.CSSProperties => {
    // cross [XM ref01 6.5s]: dong 1 tu tren-trai di XUONG, dong 2 tu duoi-trai di LEN, 2 dong tien sat nhau o ben phai
    const rot = cross ? (i === 0 ? 7 : -7) : 0;
    const cy = y * height + (cross ? (i === 0 ? -sizes[0] * 0.62 : sizes[1] * 0.62) : i * sizes[i] * 1.05);
    return {
      position: "absolute",
      left: cross ? (i === 0 ? width * 0.05 : width * 0.2) : width * x,
      top: cy,
      translate: "0 -50%",
      rotate: `${rot}deg`,
      transformOrigin: "left center",
      fontFamily: QT.font,
      fontWeight: 800,
      fontSize: sizes[i],
      whiteSpace: "nowrap",
      ...viPad,
    };
  };
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {lead ? (
        <div
          style={{
            position: "absolute",
            left: width * x,
            top: y * height - sizes[0] * 0.78,
            translate: "0 -100%",
            fontFamily: QT.font,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: sizes[0] * 0.48,
            color: QT.white,
            textShadow: QT.shadow,
            ...blurRise(t, 0, duration, duration, 8, 0.25),
            ...viPad,
          }}
        >
          {lead}
        </div>
      ) : null}
      {lines.map((l, i) => (
        <React.Fragment key={i}>
          {/* quang sang trang (lop thuong) */}
          <div style={{ ...lineBox(l, i), color: "transparent", textShadow: "0 0 10px rgba(255,255,255,0.9), 0 0 28px rgba(255,255,255,0.5)" }}>
            {letters(l, i, at[i])}
          </div>
          {/* ruot chu am ban */}
          <div style={{ ...lineBox(l, i), color: "#fff", mixBlendMode: "difference" }}>{letters(l, i, at[i])}</div>
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

/* ======================================================================================
 * 13 [XM] CHU TRONG SUOT (am ban dung nghia) — ref01 3.3s "HOÀNG MAI", 6.9s "VÔ CÙNG SÔI ĐỘNG", 54.5s "AEDAS":
 * ruot chu la CUA SO nhin xuong mot lop video KHAC (b-roll / canh truoc), khong phai dao mau.
 * Chu hien TRANG truoc (+ quang sang), roi tung ky tu TRAI -> PHAI tan thanh trong suot (lo video ben trong).
 * Cai dat: SVG <clipPath> chua <text>; video lap day bi cat theo hinh chu.
 * ==================================================================================== */
export type QtFill = { src: string; startFrom?: number; kind?: "video" | "image" | "liquid"; zoom?: number };
/** v4: "anh kim long" chuyen dong lam ruot chu trong suot (mau: "HOÀNG MAI" lo dai den vang) — mau luon sach, ruc. */
const LiquidFill: React.FC<{ tint: "gold" | "teal" | "none"; t: number }> = ({ tint, t }) => {
  const C =
    tint === "teal"
      ? ["#0b4f5c", "#1fb5c4", "#8ff5ec", "#ffffff", "#0e7f95"]
      : ["#5a3208", "#c9861f", "#ffd77a", "#fff6dc", "#a8650f"];
  const a = t * 40;
  return (
    <AbsoluteFill style={{ background: C[0] }}>
      <AbsoluteFill style={{ background: `linear-gradient(${115 + Math.sin(t * 1.3) * 12}deg, ${C[0]} 0%, ${C[1]} 30%, ${C[2]} 48%, ${C[4]} 62%, ${C[1]} 80%, ${C[0]} 100%)`, backgroundSize: "200% 100%", backgroundPosition: `${(a % 200) - 50}% 0` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 30% 18% at ${30 + Math.sin(t * 2.1) * 25}% ${22 + Math.cos(t * 1.7) * 8}%, ${C[3]} 0%, rgba(255,255,255,0) 70%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 22% 12% at ${70 + Math.cos(t * 1.6) * 22}% ${30 + Math.sin(t * 2.4) * 10}%, ${C[3]} 0%, rgba(255,255,255,0) 70%)`, mixBlendMode: "screen", opacity: 0.8 }} />
    </AbsoluteFill>
  );
};
/** v4: mau cho chu trong suot (mau: "HOÀNG MAI" anh vang kim, "CỰC KỲ HIẾM" xanh ngoc) */
export type QtTint = "gold" | "teal" | "none";
const TINTS: Record<QtTint, { overlay: string; glow: string; edge: string }> = {
  gold: { overlay: "linear-gradient(160deg, #fff1c9 0%, #ffc95e 35%, #e0902a 65%, #fff0c4 100%)", glow: "rgba(255,200,110,0.95)", edge: "rgba(255,246,220,0.95)" },
  teal: { overlay: "linear-gradient(160deg, #d9fffb 0%, #4fe3d6 40%, #1aa6b8 70%, #d6fbff 100%)", glow: "rgba(110,240,230,0.9)", edge: "rgba(225,255,252,0.95)" },
  none: { overlay: "none", glow: "rgba(255,255,255,0.9)", edge: "rgba(255,255,255,0.9)" },
};
export const QtWindowText: React.FC<{
  lines: string[];
  lineAt?: number[]; // giay (tuong doi) bat dau moi dong
  fill: QtFill; // lop video/anh nhin qua ruot chu
  x?: number; // tam ngang (ti le W)
  y?: number; // tam doc dong dau (ti le H)
  size?: number;
  rot?: number[]; // do nghieng moi dong (vd [7,-7] = cheo nhau)
  dx?: number[]; // lech ngang moi dong (ti le W)
  weight?: number;
  lead?: string;
  duration: number;
  id: string;
  tint?: QtTint;
}> = ({ lines, lineAt, fill, x = 0.5, y = 0.2, size = 150, rot, dx, weight = 900, lead, duration, id, tint = "gold" }) => {
  const TT = TINTS[tint];
  const { t, fps } = useT();
  const { width, height } = useVideoConfig();
  // v4: thoat mem 0.2s
  const out = interpolate(t, [duration - 0.2, duration], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const at = lineAt ?? lines.map((_, i) => i * 0.4);
  const sizes = lines.map((l) => Math.min(size, (width * 0.9) / (Math.max(3, l.length) * 0.74)));
  const lineY = (i: number) => y * height + lines.slice(0, i).reduce((a, _l, k) => a + sizes[k] * (rot ? 1.25 : 0.98), 0);
  const tr = (i: number) => `rotate(${rot?.[i] ?? 0} ${x * width + (dx?.[i] ?? 0) * width} ${lineY(i)})`;
  // moi ky tu: hien trang (0.12s, xuat hien roi rac), giu trang ~0.35s, roi tan thanh trong suot theo thu tu trai->phai
  const chars = (l: string, i: number) =>
    [...l].map((c, k) => {
      // v3: ky tu bat ra trong ~3 khung (rai 0.1s), giu trang ngan, roi tan trong suot trai->phai trong ~0.35s
      const s0 = at[i] + random(`${id}a${i}${k}`) * 0.1;
      const appear = interpolate(t, [s0, s0 + 0.16], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
      const wipe = interpolate(t, [at[i] + 0.3 + (k / Math.max(1, l.length)) * 0.3, at[i] + 0.45 + (k / Math.max(1, l.length)) * 0.3], [1, 0], clamp);
      return { c, appear, white: appear * wipe };
    });
  const textEl = (i: number, l: string, mode: "clip" | "white" | "glow" | "edge") => (
    <text
      key={`${mode}${i}`}
      x={x * width + (dx?.[i] ?? 0) * width}
      y={lineY(i)}
      textAnchor="middle"
      dominantBaseline="middle"
      transform={tr(i)}
      style={{ fontFamily: QT.font, fontWeight: weight, fontSize: sizes[i], letterSpacing: "0.01em" }}
    >
      {chars(l, i).map((ch, k) => (
        <tspan
          key={k}
          fill={mode === "glow" ? TT.glow : mode === "edge" ? "none" : "#fff"}
          stroke={mode === "edge" ? TT.edge : undefined}
          strokeWidth={mode === "edge" ? 3 : undefined}
          strokeOpacity={mode === "edge" ? ch.appear * 0.9 : undefined}
          fillOpacity={mode === "clip" ? (ch.appear > 0.5 ? 1 : 0) : mode === "white" ? ch.white : mode === "edge" ? 0 : ch.appear * 0.9}
        >
          {ch.c}
        </tspan>
      ))}
    </text>
  );
  const fillStart = Math.round((fill.startFrom ?? 0) * fps);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {lead ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: y * height - sizes[0] * 0.8, translate: "0 -100%", textAlign: "center", fontFamily: QT.font, fontStyle: "italic", fontWeight: 600, fontSize: Math.max(40, sizes[0] * 0.3), color: QT.white, textShadow: QT.shadow, opacity: interpolate(t, [0, 0.1], [0, 1], clamp) }}>
          {lead}
        </div>
      ) : null}
      {/* quang sang (glow) theo hinh chu */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, filter: "blur(14px)", opacity: 0.8 }}>
        {lines.map((l, i) => textEl(i, l, "glow"))}
      </svg>
      {/* lop video nhin qua ruot chu */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <clipPath id={`qtclip-${id}`} clipPathUnits="userSpaceOnUse">
            {lines.map((l, i) => textEl(i, l, "clip"))}
          </clipPath>
        </defs>
      </svg>
      <AbsoluteFill style={{ clipPath: `url(#qtclip-${id})` }}>
        <AbsoluteFill style={{ scale: `${fill.zoom ?? 1.15}`, filter: "brightness(1.15) contrast(1.15) saturate(1.7)" }}>
          {fill.kind === "liquid" ? (
            <LiquidFill tint={tint} t={t} />
          ) : fill.kind === "image" ? (
            <Img src={fill.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Sequence from={-fillStart} layout="none">
              <OffthreadVideo src={fill.src} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Sequence>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
      {/* v4: nhuom mau (vang kim / xanh ngoc) ben trong chu trong suot */}
      {tint !== "none" && fill.kind !== "liquid" ? (
        <AbsoluteFill style={{ clipPath: `url(#qtclip-${id})`, mixBlendMode: "overlay", opacity: 0.85 }}>
          <AbsoluteFill style={{ background: TT.overlay }} />
        </AbsoluteFill>
      ) : null}
      {/* v3 [XM ref01 "HOÀNG MAI"]: vet anh kim chay qua ruot chu trong suot */}
      <AbsoluteFill style={{ clipPath: `url(#qtclip-${id})`, mixBlendMode: "screen", opacity: 0.75 }}>
        <AbsoluteFill
          style={{
            background: (() => {
              const pos = ((t * 66) % 260) - 80;
              return `linear-gradient(105deg, rgba(0,0,0,0) ${pos - 30}%, rgba(255,200,90,0.9) ${pos - 8}%, rgba(255,248,225,1) ${pos}%, rgba(190,130,30,0.9) ${pos + 10}%, rgba(0,0,0,0) ${pos + 32}%)`;
            })(),
          }}
        />
      </AbsoluteFill>
      {/* v4: vien kinh sang quanh chu */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {lines.map((l, i) => textEl(i, l, "edge"))}
      </svg>
      {/* lop trang dang tan dan */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {lines.map((l, i) => textEl(i, l, "white"))}
      </svg>
    </AbsoluteFill>
  );
};

/* ======================================================================================
 * 14 [XM] LOP NGUOI DUNG TRUOC CHU (3D) — ref01 37.5s "RIVEA RESIDENCES", ref02 5.0s "CẢM XÚC", 116s "10 TRIỆU ĐÔ":
 * dat SAU cac lop chu: video nguoi da tach nen (VP9 alpha, scripts/style/person_matte.py).
 * Chu dat sau lung bat buoc DAM, DAY (Montserrat 900, co lon) de van doc duoc khi bi che mot phan.
 * ==================================================================================== */
export const QtPersonFront: React.FC<{ src: string; startFrom?: number }> = ({ src, startFrom = 0 }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={-Math.round(startFrom * fps)} layout="none">
      <AbsoluteFill>
        <OffthreadVideo src={src} transparent muted style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
    </Sequence>
  );
};

/** Chu DAM DAY dat sau lung nguoi (dung cung QtPersonFront). Mau kem, bong rat nhe (nguoi da tao chieu sau). */
export const QtBehindText: React.FC<{ lines: string[]; lineAt?: number[]; y?: number; size?: number; color?: string; duration: number }> = ({
  lines,
  lineAt,
  y = 0.3,
  size = 230,
  color = QT.cream,
  duration,
}) => {
  const { t } = useT();
  const { width, height } = useVideoConfig();
  const at = lineAt ?? lines.map((_, i) => i * 0.25);
  return (
    <AbsoluteFill>
      {lines.map((l, i) => {
        const sz = Math.min(size, (width * 0.94) / (Math.max(3, l.length) * 0.74));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: y * height + i * size * 0.9,
              translate: "0 -50%",
              textAlign: "center",
              fontFamily: QT.font,
              fontWeight: 900,
              fontSize: sz,
              letterSpacing: "-0.01em",
              color,
              whiteSpace: "nowrap",
              textShadow: "0 6px 24px rgba(0,0,0,0.25)",
              opacity: interpolate(t, [duration - 0.07, duration], [1, 0], clamp),
              ...viPad,
            }}
          >
            {/* v3: lao ngang tu phai + nhoe chuyen dong (4 khung), dung yen, tat gon */}
            <QtKPiece id={`bh${i}${l.length}`} text={l} at={at[i]} end={duration} kind="slide" style={{}} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** 15 [XM] Chuyen canh VET SANG CAM (light leak) — ref01 10.0s, 21.6s, 162.4s (khong phai nhay trang). ~0.5s, kem whoosh sang. */
export const QtLightLeak: React.FC<{ dur?: number }> = ({ dur = 0.55 }) => {
  const { t } = useT();
  const p = interpolate(t, [0, dur * 0.45, dur], [0, 1, 0], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const sweep = interpolate(t, [0, dur], [-0.3, 1.2], clamp);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: p }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 45% at ${sweep * 100}% 70%, rgba(255,170,60,1) 0%, rgba(255,110,20,0.85) 35%, rgba(255,60,0,0) 75%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 50% 35% at ${100 - sweep * 80}% 30%, rgba(255,240,200,0.95) 0%, rgba(255,190,90,0.5) 40%, rgba(255,120,0,0) 75%)` }} />
    </AbsoluteFill>
  );
};
