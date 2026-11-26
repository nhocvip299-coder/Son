/**
 * Bo hieu ung "Mau Tuan Tu Do" (kenh TikTok food-vlog @tuantungtrai86) — dung lai bang Remotion
 * tu phan tich 6 video xem nhieu nhat cua kenh (11/2026). Timing theo frame@30 (useFrame30) -> dung o 30/60 FPS.
 * [XM] = da xac minh/do tren frame video mau; [UD] = uoc doan (xem .claude/skills/mau-tuan-tu-do/references/style-spec.md).
 */
import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, random, spring, useVideoConfig } from "remotion";
import { FONTS } from "../../lib/fonts";
import { useFrame30 } from "../../lib/theme";

export const TTD = {
  yellow: "#F6EC14", // [XM] trung binh mat chu vang 6 video: #f4e91b..#f7e015
  white: "#FFFFFF",
  stroke: "#000000", // [XM] vien den day, khong gradient
  font: FONTS.phudu, // [XM~] DT Phudu 800 (font phu de CapCut) — so voi chu cat tu video: khop nhat khi gian chu + keo ngang
  weight: 800,
  tracking: "0.04em",
  squeeze: 1.1, // keo ngang 1.1x (Phudu hep hon chu kenh)
  charW: 0.56, // be rong TB 1 ky tu IN HOA (em) sau tracking, de tinh co chu vua khung
  captionY: 0.205, // [XM] tam phu de 0.196–0.23 H (median 6 video)
  captionSize: 74, // [XM] chieu cao chu IN HOA ~0.027 H = 52px -> font ~74px @1920
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** Chu vien den day kieu CapCut: 2 lop (lop sau co stroke gap doi) -> vien deu, khong an vao mat chu. */
export const Stroked: React.FC<{
  children: React.ReactNode;
  size: number;
  color: string;
  stroke?: number; // px vien, mac dinh ~0.11em [XM: ~5px @576 -> ~9px @1080]
  style?: React.CSSProperties;
}> = ({ children, size, color, stroke, style }) => {
  const sw = stroke ?? Math.max(4, size * 0.115);
  const base: React.CSSProperties = {
    fontFamily: TTD.font,
    fontWeight: TTD.weight,
    fontSize: size,
    lineHeight: 1.12,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    letterSpacing: TTD.tracking,
  };
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <span
        aria-hidden
        style={{
          ...base,
          position: "absolute",
          inset: 0,
          color: TTD.stroke,
          WebkitTextStroke: `${sw * 2}px ${TTD.stroke}`,
          // bong mem duoi vien [XM: co quang toi mo quanh chu]
          filter: `drop-shadow(0 ${size * 0.05}px ${size * 0.08}px rgba(0,0,0,0.55))`,
        }}
      >
        {children}
      </span>
      <span style={{ ...base, position: "relative", color }}>{children}</span>
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* 1. PHU DE KARAOKE — nhan dien chinh cua kenh                         */
/* ------------------------------------------------------------------ */

export type TtdWord = { text: string; startMs: number; endMs: number; other?: boolean };
export type TtdChunk = { words: TtdWord[]; startMs: number; endMs: number; other: boolean };

/**
 * Chia loi thanh cum 2–4 tu [XM: "THÌ 100 CUỘC", "NGOÀI NHỮNG THẰNG", "VỪA VÀO LÂU"]:
 * ngat khi: du maxWords, qua maxChars, nghi > gapMs, doi nguoi noi, hoac gap dau cau.
 */
export const ttdChunks = (words: TtdWord[], maxWords = 4, maxChars = 18, gapMs = 350): TtdChunk[] => {
  const out: TtdChunk[] = [];
  let cur: TtdWord[] = [];
  const flush = () => {
    if (!cur.length) return;
    out.push({ words: cur, startMs: cur[0].startMs, endMs: cur[cur.length - 1].endMs, other: !!cur[0].other });
    cur = [];
  };
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const len = cur.reduce((a, x) => a + x.text.length + 1, 0) + w.text.length;
    if (cur.length && (cur.length >= maxWords || len > maxChars || w.startMs - prev.endMs > gapMs || !!w.other !== !!prev.other)) flush();
    cur.push(w);
    if (/[.!?,…]$/.test(w.text)) flush();
  });
  flush();
  // giu cum den khi cum sau bat dau (toi da +500ms) -> khong nhap nhay [XM: chu ton tai ~80–89% thoi luong]
  return out.map((c, i) => {
    const next = out[i + 1];
    return { ...c, endMs: Math.min(next ? next.startMs : c.endMs + 500, c.endMs + 500) };
  });
};

/**
 * Mot cum phu de. Che do mac dinh [XM]:
 *  - Tu hien dan theo loi noi (append), tu DANG NOI to vang, cac tu khac trang.
 *  - Tu khoa (keywordRe) luon vang + to hon 1.25x [XM: "CÓ 140 CỦ" to vang + "MÀ NHẸ LẮM" nho trang].
 *  - Loi nguoi khac (other) -> tien to "*" va co nho 0.8x [XM: "*6 VỚI 5 LÀ 11", "*CANH CẢI"].
 * Vao: nay 0.9→1 trong 3 frame; doi tu: tu moi nay 1.12→1; thoat: mo 2 frame [XM gan nhu cat cung].
 */
export const TtdCaptionChunk: React.FC<{
  chunk: TtdChunk;
  keywordRe?: RegExp | null;
  y?: number;
  size?: number;
  reveal?: "append" | "full";
}> = ({ chunk, keywordRe, y = TTD.captionY, size = TTD.captionSize, reveal = "append" }) => {
  const f = useFrame30();
  const { height, width, fps } = useVideoConfig();
  const tMs = chunk.startMs + (f / 30) * 1000;
  const durF = ((chunk.endMs - chunk.startMs) / 1000) * 30;
  const pop = interpolate(f, [0, 3], [0.9, 1], { ...clamp, easing: easeOut });
  const out = interpolate(f, [durF - 2, durF], [1, 0], clamp);
  const base = chunk.other ? size * 0.8 : size;
  // co lon nhat de ca cum vua 86% ngang (chu dam Nunito ~0.68em/ky tu IN HOA)
  const chars = chunk.words.reduce((a, w) => a + w.text.length + 1, 0) + (chunk.other ? 1 : 0);
  const fit = Math.min(base, (width * 0.86) / (chars * TTD.charW * TTD.squeeze));
  const shown = chunk.words.filter((w) => reveal === "full" || w.startMs <= tMs + 30);
  const activeIdx = chunk.words.findIndex((w, i) => tMs >= w.startMs - 30 && tMs < (chunk.words[i + 1]?.startMs ?? Infinity));
  return (
    <div
      style={{
        position: "absolute",
        top: height * y,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
        gap: fit * 0.26,
        translate: "0 -50%",
        scale: `${pop * TTD.squeeze} ${pop}`,
        opacity: out,
      }}
    >
      {chunk.other ? <Stroked size={fit * 0.7} color={TTD.white} style={{ alignSelf: "flex-start" }}>*</Stroked> : null}
      {shown.map((w, i) => {
        const isKw = !!keywordRe && keywordRe.test(w.text);
        const active = i === activeIdx;
        const since = ((tMs - w.startMs) / 1000) * fps;
        const bump = active ? interpolate(since, [0, (4 * fps) / 30], [1.12, 1], { ...clamp, easing: easeOut }) : 1;
        const s = isKw ? fit * 1.25 : fit;
        return (
          <Stroked key={i} size={s} color={active || isKw ? TTD.yellow : TTD.white} style={{ scale: bump }}>
            {w.text}
          </Stroked>
        );
      })}
    </div>
  );
};

/** Toan bo phu de cho 1 timeline (ms tren timeline dau ra). */
export const TtdKaraokeCaptions: React.FC<{
  words: TtdWord[];
  keywordRe?: string;
  y?: number;
  size?: number;
  hideRanges?: Array<[number, number]>; // ms — an phu de khi co hook/the ten/end card
}> = ({ words, keywordRe, y, size, hideRanges = [] }) => {
  const { fps } = useVideoConfig();
  const re = keywordRe ? new RegExp(keywordRe, "i") : null;
  const chunks = React.useMemo(() => ttdChunks(words), [words]);
  return (
    <AbsoluteFill>
      {chunks
        .filter((c) => !hideRanges.some(([a, b]) => c.startMs < b && c.endMs > a))
        .map((c, i) => {
          const from = Math.round((c.startMs / 1000) * fps);
          const dur = Math.max(2, Math.round((c.endMs / 1000) * fps) - from);
          return (
            <SequenceLite key={i} from={from} dur={dur} name={`Cau ${c.words.map((w) => w.text).join(" ")}`}>
              <TtdCaptionChunk chunk={c} keywordRe={re} y={y} size={size} />
            </SequenceLite>
          );
        })}
    </AbsoluteFill>
  );
};

const SequenceLite: React.FC<{ from: number; dur: number; name: string; children: React.ReactNode }> = ({ from, dur, name, children }) => (
  <Sequence from={from} durationInFrames={dur} layout="none" name={name}>
    {children}
  </Sequence>
);

/* ------------------------------------------------------------------ */
/* 2. Vet sang vang sau cum nhan manh [XM: "QUÁ SỞI LỞI LUÔN"]          */
/* ------------------------------------------------------------------ */
export const TtdGlowBand: React.FC<{ duration: number; y?: number }> = ({ duration, y = TTD.captionY }) => {
  const f = useFrame30();
  const { height, width } = useVideoConfig();
  const inn = interpolate(f, [0, 4], [0, 1], { ...clamp, easing: easeOut });
  const out = interpolate(f, [duration - 5, duration], [1, 0], clamp);
  const sweep = interpolate(f, [0, duration], [-0.15, 0.15]);
  const flick = 0.85 + 0.15 * Math.sin(f * 0.9);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: height * y,
          left: width * (0.5 + sweep),
          width: width * 1.25 * inn,
          height: TTD.captionSize * 1.5,
          translate: "-50% -50%",
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, rgba(255,236,60,0.95) 0%, rgba(246,220,20,0.65) 30%, rgba(246,200,20,0.0) 70%)`,
          filter: "blur(14px)",
          opacity: inn * out * flick,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 3. Tieu de HOOK (teaser dau video) — vang toan bo + bong phong to mo  */
/*    [XM: "ĂN TRỘM LÀ NHƯ NÀO" 0.2–1.5s, ban sao lon mo phia sau]       */
/* ------------------------------------------------------------------ */
export const TtdHookTitle: React.FC<{ text: string; duration: number; y?: number; size?: number }> = ({ text, duration, y = 0.215, size = 84 }) => {
  const f = useFrame30();
  const { height, width } = useVideoConfig();
  const fit = Math.min(size, (width * 0.86) / ((text.length + 1) * TTD.charW * TTD.squeeze));
  const inn = spring({ frame: f, fps: 30, config: { damping: 14, stiffness: 220, mass: 0.6 } });
  const out = interpolate(f, [duration - 4, duration], [1, 0], clamp);
  const ghostT = interpolate(f, [0, 22], [0, 1], { ...clamp, easing: easeOut });
  const box: React.CSSProperties = { position: "absolute", top: height * y, left: 0, right: 0, display: "flex", justifyContent: "center", translate: "0 -50%" };
  return (
    <AbsoluteFill style={{ opacity: out, scale: `${TTD.squeeze} 1` }}>
      {/* bong ma: ban sao phong to 1.0→1.45, mo + nhoe, roi tat [XM] */}
      <div style={{ ...box, scale: 1 + 0.45 * ghostT, opacity: 0.55 * (1 - ghostT) + 0.12, filter: `blur(${2 + 6 * ghostT}px)` }}>
        <Stroked size={fit} color={TTD.yellow}>{text}</Stroked>
      </div>
      <div style={{ ...box, scale: interpolate(inn, [0, 1], [1.35, 1]), opacity: Math.min(1, inn * 1.5) }}>
        <Stroked size={fit} color={TTD.yellow}>{text}</Stroked>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 4. The ten 2 dong [XM: "CHÚ HƯNG" vang / "CHÚ TƯỞNG THẬT" trang]     */
/* ------------------------------------------------------------------ */
export const TtdNameTag: React.FC<{ line1: string; line2?: string; duration: number; y?: number }> = ({ line1, line2, duration, y = 0.17 }) => {
  const f = useFrame30();
  const { height } = useVideoConfig();
  const a = spring({ frame: f, fps: 30, config: { damping: 15, stiffness: 240 } });
  const b = spring({ frame: f - 4, fps: 30, config: { damping: 15, stiffness: 240 } });
  const out = interpolate(f, [duration - 4, duration], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", top: height * y, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, scale: `${TTD.squeeze} 1` }}>
        <div style={{ scale: interpolate(a, [0, 1], [0.6, 1]), opacity: Math.min(1, a * 1.4) }}>
          <Stroked size={82} color={TTD.yellow}>{line1}</Stroked>
        </div>
        {line2 ? (
          <div style={{ translate: `0 ${interpolate(b, [0, 1], [16, 0])}px`, opacity: Math.min(1, b * 1.4) }}>
            <Stroked size={64} color={TTD.white}>{line2}</Stroked>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 5. Sticker cuoi "||||" vang nghieng, rung [XM: luc 2 nguoi cuoi lon]  */
/* ------------------------------------------------------------------ */
export const TtdLaughMarks: React.FC<{ duration: number; x?: number; y?: number; n?: number }> = ({ duration, x = 0.5, y = 0.21, n = 5 }) => {
  const f = useFrame30();
  const { width, height } = useVideoConfig();
  const inn = spring({ frame: f, fps: 30, config: { damping: 10, stiffness: 300, mass: 0.5 } });
  const out = interpolate(f, [duration - 4, duration], [1, 0], clamp);
  const step = Math.floor(f / 3); // rung giat 10 lan/giay kieu sticker GIF [XM]
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", left: width * x, top: height * y, translate: "-50% -50%", display: "flex", gap: 9, scale: inn, rotate: `${-14 + (random(`r${step}`) - 0.5) * 6}deg` }}>
        {Array.from({ length: n }).map((_, i) => {
          const h = 56 + (i % 2 ? 0 : 10) + (random(`h${i}-${step}`) - 0.5) * 14;
          return <div key={i} style={{ width: 13, height: h, background: TTD.yellow, borderRadius: 4, outline: "4px solid #000", alignSelf: "flex-end" }} />;
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 6. Dau "?" vang bay quanh dau [XM: video phong cho VIP 0.5s]          */
/* ------------------------------------------------------------------ */
export const TtdQuestionMarks: React.FC<{ duration: number; x?: number; y?: number }> = ({ duration, x = 0.38, y = 0.5 }) => {
  const f = useFrame30();
  const { width, height } = useVideoConfig();
  const out = interpolate(f, [duration - 4, duration], [1, 0], clamp);
  const marks = [
    { dx: -70, dy: 40, s: 62, d: 0 },
    { dx: 0, dy: -30, s: 84, d: 3 },
    { dx: 80, dy: 20, s: 56, d: 6 },
  ];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {marks.map((m, i) => {
        const p = spring({ frame: f - m.d, fps: 30, config: { damping: 9, stiffness: 260, mass: 0.5 } });
        const bob = Math.sin((f + i * 7) * 0.25) * 8;
        return (
          <div key={i} style={{ position: "absolute", left: width * x + m.dx, top: height * y + m.dy + bob, translate: "-50% -50%", scale: p, rotate: `${(i - 1) * 14}deg` }}>
            <Stroked size={m.s} color={TTD.yellow}>?</Stroked>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 7. Chuyen canh VET MUC TRANG [XM: khi doi dia diem, ~0.4–0.5s]        */
/*    Dat o ranh gioi cat, tam = diem cat. Phu trang tu goc duoi trai,   */
/*    lap kin ~giua, rut ve goc tren phai de lai giot nho.              */
/* ------------------------------------------------------------------ */
export const TtdInkWipe: React.FC<{ duration?: number; color?: string }> = ({ duration = 14, color = "#FFFFFF" }) => {
  const f = useFrame30();
  const { width: W, height: H } = useVideoConfig();
  const half = duration / 2;
  const cover = interpolate(f, [0, half], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const reveal = interpolate(f, [half, duration], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const blobs = Array.from({ length: 14 }).map((_, i) => {
    const bx = random(`bx${i}`) * W * 0.9;
    const by = H * (0.25 + random(`by${i}`) * 0.75);
    const r0 = (0.25 + random(`br${i}`) * 0.35) * H;
    const order = (bx / W + (H - by) / H) / 2; // lan tu duoi-trai
    const grow = interpolate(cover, [order * 0.6, order * 0.6 + 0.45], [0, 1], clamp);
    const shrink = interpolate(reveal, [order * 0.5, order * 0.5 + 0.5], [1, 0], clamp);
    return { cx: bx, cy: by, r: r0 * grow * shrink };
  });
  const drops = Array.from({ length: 10 }).map((_, i) => ({
    cx: W * (0.3 + random(`dx${i}`) * 0.7),
    cy: H * random(`dy${i}`) * 0.7,
    r: (6 + random(`dr${i}`) * 16) * interpolate(reveal, [0.3, 0.6, 1], [0, 1, 0], clamp),
  }));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <filter id="ttd-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="28" result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -18" />
          </filter>
        </defs>
        <g filter="url(#ttd-goo)" fill={color}>
          {blobs.map((b, i) => (b.r > 1 ? <circle key={i} cx={b.cx} cy={b.cy} r={b.r} /> : null))}
          {drops.map((d, i) => (d.r > 1 ? <circle key={`d${i}`} cx={d.cx} cy={d.cy} r={d.r} /> : null))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 8. End card "CÒN TIẾP..." + vignette toi 4 goc [XM: cuoi moi phan]    */
/* ------------------------------------------------------------------ */
export const TtdToBeContinued: React.FC<{ duration: number; text?: string; y?: number }> = ({ duration, text = "CÒN TIẾP", y = 0.69 }) => {
  const f = useFrame30();
  const { height } = useVideoConfig();
  const v = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: easeOut });
  const p = spring({ frame: f - 2, fps: 30, config: { damping: 11, stiffness: 240, mass: 0.6 } });
  const dots = Math.min(3, Math.max(0, Math.floor((f - 8) / 4)));
  const out = interpolate(f, [duration - 3, duration], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 62% 55% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${0.85 * v}) 100%)` }} />
      <div style={{ position: "absolute", top: height * y, left: 0, right: 0, display: "flex", justifyContent: "center", translate: "0 -50%", scale: `${interpolate(p, [0, 1], [0.4, 1]) * TTD.squeeze} ${interpolate(p, [0, 1], [0.4, 1])}`, opacity: Math.min(1, p * 1.6) }}>
        <Stroked size={118} color={TTD.yellow}>
          {text}
          <span style={{ opacity: dots >= 1 ? 1 : 0 }}>.</span>
          <span style={{ opacity: dots >= 2 ? 1 : 0 }}>.</span>
          <span style={{ opacity: dots >= 3 ? 1 : 0 }}>.</span>
        </Stroked>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 9. PiP phan ung cua chu kenh goc tren trai + cau thoai               */
/*    [XM: anh chu kenh tach nen, chong canh hook, chu canh phai]       */
/*    src nen la PNG/WebM nen trong suot; neu la video thuong -> cat chu nhat, mo vien duoi. */
/* ------------------------------------------------------------------ */
export const TtdReactionPip: React.FC<{
  src: string;
  isVideo?: boolean;
  startFromS?: number;
  duration: number;
  line?: string;
  keyword?: string;
}> = ({ src, isVideo, startFromS = 0, duration, line, keyword }) => {
  const f = useFrame30();
  const { width, height, fps } = useVideoConfig();
  const p = spring({ frame: f, fps: 30, config: { damping: 14, stiffness: 220 } });
  const out = interpolate(f, [duration - 4, duration], [1, 0], clamp);
  const w = width * 0.4;
  const h = w * 0.62;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div
        style={{
          position: "absolute",
          left: width * 0.04,
          top: height * 0.085,
          width: w,
          height: h,
          overflow: "hidden",
          translate: `${interpolate(p, [0, 1], [-w * 0.6, 0])}px 0`,
          WebkitMaskImage: "linear-gradient(180deg,#000 82%,transparent 100%)",
        }}
      >
        {isVideo ? (
          <OffthreadVideo src={src} muted startFrom={Math.round(startFromS * fps)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>
      {line ? (
        <div style={{ position: "absolute", left: width * 0.21, right: width * 0.04, top: height * 0.085 + h * 0.6, display: "flex", gap: 14, justifyContent: "center", opacity: Math.min(1, p * 1.5) }}>
          {line.split(/\s+/).map((wd, i) => (
            <Stroked key={i} size={60} color={keyword && new RegExp(keyword, "i").test(wd) ? TTD.yellow : TTD.white}>
              {wd}
            </Stroked>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
