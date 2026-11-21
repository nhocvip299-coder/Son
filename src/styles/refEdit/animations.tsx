/**
 * Animation minh hoa cho canh tram (nguoi noi thu vao khung goc) — [AI, theo yeu cau nguoi dung]:
 * khi loi thoai co diem nhan dang so lieu/so sanh, ve no thanh chuyen dong thay vi chi chu.
 *  - BarLadder: thang gia tang dan (cot moc len + so dem)
 *  - PriceDrop: gia goc bi gach -> mui ten xuong -> gia moi dem lui
 *  - VersusCompare: 2 cot so sanh, dau tick/x bat ra tung dong
 * Mau/font/bong lay tu tokens cua video mau (do, vang, the vang phat sang).
 */
import React from "react";
import { Easing, interpolate, spring } from "remotion";
import { Place, Typed, redText, useSec, whiteText, yellowText } from "./components";
import { RT } from "./tokens";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.out(Easing.cubic);
const vn = (n: number, dec = 0) => n.toFixed(dec).replace(".", ",");

// ---------- Thang gia ----------
export type Bar = { label: string; value: number; unit: string; at: number; hot?: boolean };
export const BarLadder: React.FC<{ title?: string; bars: Bar[]; y?: number }> = ({ title, bars, y = 0.4 }) => {
  const { t } = useSec();
  const max = Math.max(...bars.map((b) => b.value));
  const H = 470; // chieu cao vung cot
  const bw = 210;
  const gap = 60;
  const x0 = (RT.W - (bars.length * bw + (bars.length - 1) * gap)) / 2;
  const base = y * RT.H + H / 2;
  return (
    <>
      {title ? (
        <Place y={y - H / RT.H / 2 - 0.1}>
          <Typed text={title} at={0} style={whiteText(64)} />
        </Place>
      ) : null}
      {/* duong day */}
      <div style={{ position: "absolute", left: x0 - 30, width: bars.length * bw + (bars.length - 1) * gap + 60, top: base, height: 4, background: "rgba(255,255,255,0.7)", borderRadius: 2 }} />
      {bars.map((b, i) => {
        const p = interpolate(t, [b.at, b.at + 0.7], [0, 1], { ...C, easing: ease });
        const h = Math.max(6, (b.value / max) * H * p);
        const x = x0 + i * (bw + gap);
        const col = b.hot ? "#F62A15" : RT.color.cardBorder;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: x,
                width: bw,
                top: base - h,
                height: h,
                opacity: interpolate(t, [b.at, b.at + 0.1], [0, 1], C),
                borderRadius: "18px 18px 4px 4px",
                background: b.hot ? "linear-gradient(180deg, #FF7A62, #D81A08)" : RT.color.cardFill,
                border: `4px solid ${col}`,
                boxShadow: `0 0 18px ${b.hot ? "rgba(246,42,21,0.8)" : "rgba(250,229,57,0.75)"}`,
              }}
            />
            <div style={{ position: "absolute", left: x - 40, width: bw + 80, top: base - h - 96, textAlign: "center", opacity: p }}>
              <span style={b.hot ? redText(fitNum(b), "'Phudu'") : yellowText(fitNum(b))}>
                {vn(b.value * p)}
                <span style={{ fontSize: "0.5em" }}> {b.unit}</span>
              </span>
            </div>
            <div style={{ position: "absolute", left: x - 40, width: bw + 80, top: base + 18, textAlign: "center", opacity: interpolate(t, [b.at, b.at + 0.2], [0, 1], C) }}>
              <span style={whiteText(44)}>{b.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};
const fitNum = (b: Bar) => (String(b.value).length > 2 ? 78 : 90);

// ---------- Gia giam ----------
export const PriceDrop: React.FC<{ from: string; to: number; toPrefix?: string; unit: string; label?: string; at?: number; dropAt?: number; y?: number }> = ({
  from,
  to,
  toPrefix = "",
  unit,
  label,
  at = 0,
  dropAt = 0.6,
  y = 0.3,
}) => {
  const { t, f, fps } = useSec();
  const pin = interpolate(t, [at, at + 0.25], [0, 1], { ...C, easing: ease });
  const strike = interpolate(t, [at + dropAt - 0.35, at + dropAt], [0, 1], C);
  const arrow = interpolate(t, [at + dropAt, at + dropAt + 0.35], [0, 1], { ...C, easing: ease });
  const s = spring({ frame: f - Math.round((at + dropAt + 0.3) * fps), fps, config: { damping: 11, stiffness: 200, mass: 0.6 } });
  const count = interpolate(t, [at + dropAt + 0.3, at + dropAt + 1.0], [Number(from.replace(",", ".")) || to * 2, to], { ...C, easing: ease });
  return (
    <>
      {label ? (
        <Place y={y - 0.07}>
          <Typed text={label} at={at} style={whiteText(58)} />
        </Place>
      ) : null}
      <Place y={y}>
        <div style={{ position: "relative", opacity: pin * (1 - strike * 0.45), scale: String(interpolate(pin, [0, 1], [0.8, 1])) }}>
          <span style={{ ...whiteText(120), fontFamily: RT.font.punch, fontWeight: 900 }}>
            {from} {unit}
          </span>
          <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 12, background: "#F62A15", borderRadius: 6, transformOrigin: "left", scale: `${strike} 1`, rotate: "-6deg", boxShadow: "0 0 14px rgba(246,42,21,0.9)" }} />
        </div>
      </Place>
      <Place y={y + 0.1}>
        <svg width="140" height="150" viewBox="0 0 140 150" style={{ opacity: arrow, translate: `0 ${(1 - arrow) * -30}px`, filter: "drop-shadow(0 0 12px rgba(250,229,57,0.8))" }}>
          <path d="M55 0 H85 V85 H125 L70 148 L15 85 H55 Z" fill={RT.color.cardBorder} />
        </svg>
      </Place>
      <Place y={y + 0.21}>
        <div style={{ ...redText(170, RT.font.punch), opacity: s > 0.01 ? 1 : 0, scale: String(interpolate(s, [0, 1], [1.6, 1])) }}>
          {toPrefix}
          {vn(count, count < 10 && to % 1 !== 0 ? 1 : 0)} {unit}
        </div>
      </Place>
    </>
  );
};

// ---------- So sanh 2 cot ----------
export type VsSide = { title: string; at: number; rows: Array<{ text: string; at: number; good: boolean }> };
export const VersusCompare: React.FC<{ left: VsSide; right: VsSide; y?: number }> = ({ left, right, y = 0.17 }) => {
  const { t, f, fps } = useSec();
  const col = (side: VsSide, x: number, accent: string) => {
    const p = interpolate(t, [side.at, side.at + 0.35], [0, 1], { ...C, easing: ease });
    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: y * RT.H,
          width: 470,
          opacity: p,
          translate: `0 ${(1 - p) * 60}px`,
          borderRadius: 26,
          border: `5px solid ${accent}`,
          background: accent === RT.color.cardBorder ? RT.color.cardFill : "rgba(120,20,15,0.55)",
          boxShadow: `0 0 18px ${accent}cc, 0 0 40px ${accent}55`,
          padding: "26px 22px 30px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 18 }}><Typed text={side.title.toUpperCase()} at={side.at + 0.15} style={{ ...whiteText(54), whiteSpace: "normal" }} /></div>
        {side.rows.map((r, i) => {
          const s = spring({ frame: f - Math.round(r.at * fps), fps, config: { damping: 10, stiffness: 240, mass: 0.5 } });
          const o = interpolate(t, [r.at, r.at + 0.1], [0, 1], C);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, opacity: o, translate: `${(1 - o) * -30}px 0` }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  flex: "0 0 58px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  scale: String(interpolate(s, [0, 1], [0.2, 1])),
                  background: r.good ? "#2BC46B" : "#E0322A",
                  boxShadow: `0 0 14px ${r.good ? "rgba(43,196,107,0.8)" : "rgba(224,50,42,0.8)"}`,
                  color: "#fff",
                  fontFamily: RT.font.body,
                  fontWeight: 900,
                  fontSize: 38,
                }}
              >
                {r.good ? "✓" : "✕"}
              </div>
              <Typed text={r.text} at={r.at + 0.1} style={{ ...whiteText(46), whiteSpace: "normal", lineHeight: 1.1 }} />
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <>
      {col(left, 50, RT.color.cardBorder)}
      {col(right, 560, "#F62A15")}
      <Place y={y - 0.035} x={0.5}>
        <div style={{ ...yellowText(70), opacity: interpolate(t, [right.at, right.at + 0.2], [0, 1], C) }}>VS</div>
      </Place>
    </>
  );
};
