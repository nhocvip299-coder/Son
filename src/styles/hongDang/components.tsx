/**
 * Bo hieu ung "Mau Hong Dang" — dung lai bang Remotion tu phan tich 2 video mau.
 * Moi timing tinh theo frame 30fps (useFrame30) -> dung o ca 30/60 FPS.
 * [XM] = da xac minh tren keyframe; [UD] = uoc doan (xem references/style-spec.md).
 */
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, useVideoConfig } from "remotion";
import { evolvePath } from "@remotion/paths";
import { FONTS } from "../../lib/fonts";
import { useFrame30 } from "../../lib/theme";
import { useFitOneLine } from "../../lib/useFit";

export const HD = {
  cyanTop: "#04EFFB", // [XM] do tu accent_colors ref1/ref2
  cyanBottom: "#07B0F2", // [XM]
  yellow: "#F4E205", // [XM] ~#f4f205, giam nhe do chua
  yellowDeep: "#E3B505", // [UD] day gradient
  white: "#FFFFFF",
  shadow: "0 6px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.6)", // [UD] bong mem, khong vien
  card: "rgba(20,20,20,0.55)", // [XM] hop toi ban trong suot
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const gradientText = (top: string, bottom: string): React.CSSProperties => ({
  backgroundImage: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  // chua cho dau thanh tieng Viet (Ấ, Ỷ...) nam ngoai line-box, neu khong se bi cat mat
  paddingTop: "0.28em",
  marginTop: "-0.28em",
  paddingBottom: "0.08em",
  marginBottom: "-0.08em",
});

/** Hieu ung 1 [XM] — Chu dan nho trang + TU KHOA lon gradient cyan hien TUNG KY TU. */
export const HdKeywordReveal: React.FC<{
  lead?: string;
  keyword: string;
  y?: number; // ti le chieu cao (tam khoi chu), mac dinh 0.62 [XM ~0.58–0.68]
  x?: number; // ti le chieu ngang tam khoi chu, mac dinh 0.5 [XM: co luc lech trai ~0.3]
  size?: number;
  color?: "cyan" | "yellow";
  charEvery?: number; // frame@30 giua cac ky tu [UD ~2]
  duration: number; // frame@30
  icon?: React.ReactNode;
}> = ({ lead, keyword, y = 0.62, x = 0.5, size: sizeMax = 128, color = "cyan", charEvery = 2, duration, icon }) => {
  const f = useFrame30();
  const { height, width } = useVideoConfig();
  const chars = [...keyword.toUpperCase()];
  // tu co co chu de 1 dong vua 80% chieu ngang (khong tran, khong chong)
  const size = useFitOneLine(keyword, FONTS.geo, 900, width * 0.8, sizeMax, { textTransform: "uppercase", letterSpacing: "0.01em" });
  const leadFit = useFitOneLine(lead ?? " ", FONTS.body, 600, width * 0.84, Math.max(36, Math.min(sizeMax * 0.36, size * 0.5)));
  const leadSize = leadFit;
  const leadIn = interpolate(f, [0, 6], [0, 1], { ...clamp, easing: easeOut });
  const kwStart = lead ? 4 : 0;
  const exit = interpolate(f, [duration - 6, duration], [1, 0], clamp);
  const [top, bottom] = color === "cyan" ? [HD.cyanTop, HD.cyanBottom] : [HD.yellow, HD.yellowDeep];
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <div
        style={{
          position: "absolute",
          top: height * y,
          left: `${x * 100}%`,
          translate: "-50% -50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {lead ? (
          <div
            style={{
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: leadSize,
              color: HD.white,
              whiteSpace: "nowrap",
              // bong dam hon de doc duoc tren nen troi/tuong sang
              textShadow: "0 2px 4px rgba(0,0,0,0.85), 0 0 16px rgba(0,0,0,0.55)",
              opacity: leadIn,
              translate: `0 ${interpolate(leadIn, [0, 1], [12, 0])}px`,
              marginBottom: size * 0.02,
            }}
          >
            {lead}
          </div>
        ) : null}
        <div style={{ display: "flex", whiteSpace: "pre", filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.55))" }}>
          {chars.map((c, i) => {
            const local = f - kwStart - i * charEvery;
            const s = spring({ frame: local, fps: 30, config: { damping: 14, stiffness: 260, mass: 0.5 } });
            return (
              <span
                key={i}
                style={{
                  fontFamily: FONTS.geo,
                  fontWeight: 900,
                  fontSize: size,
                  lineHeight: 1.05,
                  letterSpacing: "0.01em",
                  ...gradientText(top, bottom),
                  opacity: interpolate(local, [0, 2], [0, 1], clamp),
                  scale: interpolate(s, [0, 1], [1.35, 1]),
                  translate: `0 ${interpolate(s, [0, 1], [-size * 0.18, 0])}px`,
                  display: "inline-block",
                }}
              >
                {c}
              </span>
            );
          })}
        </div>
        {icon ? <div style={{ marginTop: size * 0.12 }}>{icon}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

/** Hieu ung 2 [XM hinh / UD chuyen dong] — Bieu tuong 3D dun khoi (vd "$") xoay quanh truc Y + mui ten nhap nhay. */
export const HdSpinIcon3D: React.FC<{ glyph?: string; size?: number; arrow?: "down" | "up" | null; delay?: number }> = ({
  glyph = "$",
  size = 230,
  arrow = "down",
  delay = 8,
}) => {
  const f = useFrame30() - delay;
  // [XM] xoay quanh truc Y lien tuc (strip ref1 ~21–23s); toc do [UD] ~1 vong / 1.5s
  const angle = -90 + f * 8;
  const depth = 18;
  const cos = Math.cos((angle * Math.PI) / 180);
  const layers = Array.from({ length: depth }, (_, k) => k);
  const appear = interpolate(f, [0, 4], [0, 1], clamp);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.12, opacity: appear }}>
      <div style={{ position: "relative", width: size * 0.62, height: size, perspective: 800 }}>
        {layers.map((k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              inset: 0,
              textAlign: "center",
              fontFamily: FONTS.geo,
              fontWeight: 900,
              fontSize: size,
              lineHeight: 1,
              color: k === depth - 1 ? undefined : "#0796B8",
              ...(k === depth - 1 ? gradientText(HD.cyanTop, HD.cyanBottom) : {}),
              transform: `rotateY(${angle}deg) translateZ(${(k - depth) * 2.2}px)`,
              filter: k === 0 ? "drop-shadow(0 10px 16px rgba(0,0,0,0.6))" : undefined,
              opacity: Math.abs(cos) < 0.05 && k < depth - 1 ? 1 : 1,
            }}
          >
            {glyph}
          </div>
        ))}
      </div>
      {arrow ? (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${size * 0.13}px solid transparent`,
            borderRight: `${size * 0.13}px solid transparent`,
            [arrow === "down" ? "borderTop" : "borderBottom"]: `${size * 0.2}px solid ${HD.cyanBottom}`,
            translate: `0 ${Math.sin(f / 4) * size * 0.05}px`,
            opacity: 0.6 + 0.4 * Math.abs(Math.sin(f / 5)),
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
          } as React.CSSProperties}
        />
      ) : null}
    </div>
  );
};

/** Hieu ung 3 [XM] — The cau hoi: hop toi bo goc, dong 1 vang dam IN HOA go tung ky tu, dong 2 trang nho go sau. */
export const HdQuestionCard: React.FC<{ line1: string; line2?: string; y?: number; duration: number; cps?: number }> = ({
  line1,
  line2 = "",
  y = 0.6,
  duration,
  cps = 1.5,
}) => {
  const f = useFrame30();
  const { height, width } = useVideoConfig();
  const n1 = Math.min(line1.length, Math.floor(f * cps));
  const t2 = line1.length / cps + 3;
  const n2 = Math.min(line2.length, Math.max(0, Math.floor((f - t2) * cps)));
  const boxIn = interpolate(f, [0, 6], [0, 1], { ...clamp, easing: easeOut });
  const exit = interpolate(f, [duration - 6, duration], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <div
        style={{
          position: "absolute",
          top: height * y,
          left: "50%",
          translate: "-50% -50%",
          maxWidth: width * 0.84,
          padding: "18px 34px 20px",
          borderRadius: 18,
          background: HD.card,
          backdropFilter: "blur(6px)",
          textAlign: "center",
          opacity: boxIn,
          scale: `${interpolate(boxIn, [0, 1], [0.92, 1])}`,
        }}
      >
        <div style={{ fontFamily: FONTS.geo, fontWeight: 900, fontSize: 56, color: HD.yellow, whiteSpace: "pre", lineHeight: 1.15, textShadow: HD.shadow }}>
          {line1.toUpperCase().slice(0, n1)}
          <span style={{ visibility: "hidden" }}>{line1.toUpperCase().slice(n1)}</span>
        </div>
        {line2 ? (
          <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 40, color: HD.white, whiteSpace: "pre", lineHeight: 1.25 }}>
            {line2.slice(0, n2)}
            <span style={{ visibility: "hidden" }}>{line2.slice(n2)}</span>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/** Hieu ung 4 [XM vi tri+mau / UD easing] — Con so lon vang gradient (vd "5 TỶ") bat len o vung tren. */
export const HdBigNumber: React.FC<{ text: string; y?: number; size?: number; duration: number }> = ({ text, y = 0.2, size: sizeMax = 170, duration }) => {
  const f = useFrame30();
  const { height, width } = useVideoConfig();
  const size = useFitOneLine(text, FONTS.geo, 900, width * 0.82, sizeMax, { textTransform: "uppercase" });
  const s = spring({ frame: f, fps: 30, config: { damping: 10, stiffness: 180, mass: 0.6 } });
  const exit = interpolate(f, [duration - 6, duration], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: height * y,
        left: 0,
        right: 0,
        translate: "0 -50%",
        textAlign: "center",
        fontFamily: FONTS.geo,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        opacity: interpolate(f, [0, 4], [0, 1], clamp) * exit,
        scale: interpolate(s, [0, 1], [0.4, 1]),
        filter: "drop-shadow(0 4px 0 #8a6a00) drop-shadow(0 12px 18px rgba(0,0,0,0.55))",
      }}
    >
      <span style={gradientText("#FFF06A", HD.yellowDeep)}>{text.toUpperCase()}</span>
    </div>
  );
};

/** Hieu ung 5 [XM] — Ban do ve tinh toi: viền du an phat sang ve dan, callout vang co duong dan, nhan cyan xoay theo ban do. */
export const HdMapHud: React.FC<{
  background?: string; // anh ve tinh (staticFile). Khong co -> nen gia lap
  outline: string; // SVG path trong he 1080x1920
  label: string; // "MÔ HÌNH|ALL-IN-ONE"
  callout?: [string, string];
  labelAt?: [number, number];
  calloutAt?: [number, number];
  rotateDeg?: number;
  duration: number;
}> = ({ background, outline, label, callout, labelAt = [640, 980], calloutAt = [560, 640], rotateDeg = -12, duration }) => {
  const f = useFrame30();
  const draw = interpolate(f, [4, 30], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const { strokeDasharray, strokeDashoffset } = evolvePath(draw, outline);
  const push = interpolate(f, [0, duration], [1.0, 1.08]);
  const rot = interpolate(f, [0, duration], [0, 2.5]);
  const lab = spring({ frame: f - 18, fps: 30, config: { damping: 200 } });
  const cal = spring({ frame: f - 26, fps: 30, config: { damping: 18 } });
  const glowPulse = 0.75 + 0.25 * Math.sin(f / 6);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0f0c", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: push, rotate: `${rot}deg` }}>
        {background ? (
          <Img src={background} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) saturate(0.8)" }} />
        ) : (
          <FakeSatellite />
        )}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <path d={outline} fill={`rgba(4,239,251,${0.12 * draw})`} stroke="#9CFFF5" strokeWidth={5} strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} style={{ filter: `drop-shadow(0 0 ${10 * glowPulse}px #04EFFB) drop-shadow(0 0 ${22 * glowPulse}px #04EFFB)` }} />
        </svg>
        {callout ? (
          <>
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
              <line x1={calloutAt[0]} y1={calloutAt[1] + 40} x2={calloutAt[0]} y2={calloutAt[1] + 40 + 140 * cal} stroke={HD.yellow} strokeWidth={3} />
            </svg>
            <div
              style={{
                position: "absolute",
                left: calloutAt[0],
                top: calloutAt[1],
                translate: "-50% -50%",
                padding: "8px 16px",
                border: `2px solid ${HD.yellow}`,
                borderRadius: 6,
                background: "rgba(40,30,0,0.65)",
                color: HD.yellow,
                fontFamily: FONTS.body,
                fontWeight: 500,
                fontSize: 24,
                lineHeight: 1.25,
                textAlign: "center",
                opacity: cal,
                scale: interpolate(cal, [0, 1], [0.7, 1]),
              }}
            >
              {callout[0]}
              <br />
              {callout[1]}
            </div>
          </>
        ) : null}
        <div
          style={{
            position: "absolute",
            left: labelAt[0],
            top: labelAt[1],
            rotate: `${rotateDeg}deg`,
            fontFamily: FONTS.geo,
            fontWeight: 900,
            fontSize: 70,
            lineHeight: 1.05,
            filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.7))",
            opacity: lab,
            translate: `${interpolate(lab, [0, 1], [-40, 0])}px 0`,
          }}
        >
          {label.split("|").map((l, i) => (
            <div key={i} style={{ ...gradientText(HD.cyanTop, HD.cyanBottom), whiteSpace: "nowrap" }}>
              {l.trim()}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Nen "ve tinh" gia lap (thay anh that de video kiem chung khong dung tai san ban quyen). */
const FakeSatellite: React.FC = () => {
  const blocks = Array.from({ length: 260 }, (_, i) => ({
    x: random(`x${i}`) * 1180 - 50,
    y: random(`y${i}`) * 2020 - 50,
    w: 30 + random(`w${i}`) * 140,
    h: 30 + random(`h${i}`) * 140,
    c: random(`c${i}`),
  }));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 40% 45%, #2a3326, #121611 70%)" }}>
      <svg width={1080} height={1920}>
        {blocks.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={6} fill={b.c > 0.6 ? "#1d2a1a" : b.c > 0.3 ? "#2b302a" : "#3a3a33"} opacity={0.8} />
        ))}
        <path d="M-50 700 C 300 640, 700 820, 1150 760" stroke="#55594f" strokeWidth={26} fill="none" />
        <path d="M200 -50 C 260 600, 140 1300, 300 2000" stroke="#55594f" strokeWidth={20} fill="none" />
        <circle cx={760} cy={430} r={120} stroke="#4c5046" strokeWidth={18} fill="none" />
      </svg>
    </AbsoluteFill>
  );
};

/** Hieu ung 6 [XM vi tri / UD chuyen dong] — The anh PiP bo goc goc tren phai, truot + phong vao. */
export const HdPipCard: React.FC<{ src?: string; children?: React.ReactNode; duration: number }> = ({ src, children, duration }) => {
  const f = useFrame30();
  const s = spring({ frame: f, fps: 30, config: { damping: 16, stiffness: 160 } });
  const exit = interpolate(f, [duration - 6, duration], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        right: 40,
        width: 420,
        height: 270,
        borderRadius: 26,
        overflow: "hidden",
        border: "4px solid rgba(255,255,255,0.9)",
        boxShadow: "0 14px 30px rgba(0,0,0,0.45)",
        opacity: s * exit,
        scale: interpolate(s, [0, 1], [0.6, 1]),
        transformOrigin: "top right",
        translate: `${interpolate(s, [0, 1], [60, 0])}px 0`,
      }}
    >
      {src ? <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : children}
    </div>
  );
};

/** Hieu ung 7 [XM] — Watermark kenh 2 dong goc duoi trai, trang mo, co dinh suot video. */
export const HdWatermark: React.FC<{ line1: string; line2?: string; opacity?: number }> = ({ line1, line2, opacity = 0.75 }) => {
  const { width, height } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: width * 0.07,
        top: height * 0.775,
        color: "white",
        opacity,
        fontFamily: FONTS.body,
        fontWeight: 500,
        fontSize: 26,
        lineHeight: 1.2,
        textAlign: "center",
        textShadow: "0 1px 3px rgba(0,0,0,0.6)",
      }}
    >
      {line1}
      {line2 ? (
        <>
          <br />
          {line2}
        </>
      ) : null}
    </div>
  );
};
