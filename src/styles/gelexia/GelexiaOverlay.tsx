// Mẫu Gelexia / Mõ Làng Review — port từ skill gelexia-food-review (mã TÁI DỰNG, video mẫu là trọng tài).
// Không đổi token trong style.ts khi chỉ thay nội dung tập. Chạy check_style.py trên thư mục này.
import React, { useEffect, useState } from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, cancelRender, continueRender, delayRender,
  interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import type { Caption } from "@remotion/captions";
import { STYLE as S } from "./style";

export type Page = { startMs: number; endMs: number; lines: Caption[][] };
export type Callout = {
  kind: "intro" | "route" | "food" | "cta"; startMs: number; endMs: number; title: string;
  subtitle?: string; addressMain?: string; addressRest?: string;
};
export type GelexiaProject = {
  mode: "demo" | "production"; durationSeconds: number; fps: number; width: number; height: number;
  brand: { name: string; address: string; showAddress?: boolean; logoFile?: string };
  pages: Page[]; callouts: Callout[];
  /** Tùy chọn (dự án Son): footage nền + giọng + SFX, tất cả là đường dẫn trong public/. */
  background?: { video: string; startFromSec?: number; muted?: boolean };
  voice?: string;
  sfx?: { atMs: number; file: string; volume?: number }[];
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const heavy: React.CSSProperties = { fontFamily: "GelexiaPhudu", fontWeight: 800, color: S.white, WebkitTextStroke: S.edge, paintOrder: "stroke fill", textShadow: S.shadow };
const secondary: React.CSSProperties = { fontFamily: "GelexiaBody", fontWeight: 600, color: S.white };

let fontsPromise: Promise<unknown> | null = null;
const loadFonts = () => {
  if (!fontsPromise) {
    const faces = [
      new FontFace("GelexiaPhudu", `url(${staticFile("fonts/gelexia/Phudu.ttf")})`, { weight: "800" }),
      new FontFace("GelexiaBody", `url(${staticFile("fonts/gelexia/BeVietnamPro-SemiBold.ttf")})`, { weight: "600" }),
    ];
    fontsPromise = Promise.all(faces.map((f) => f.load().then((l) => document.fonts.add(l))));
  }
  return fontsPromise;
};
function useFonts() {
  const [handle] = useState(() => delayRender("Load exact Gelexia fonts"));
  useEffect(() => { let live = true; loadFonts().then(() => { if (live) continueRender(handle); }).catch(cancelRender); return () => { live = false; }; }, [handle]);
}

function entryState(local: number, duration: number, fps: number, kind: "caption" | "pop") {
  const seconds = kind === "caption" ? S.motion.captionSeconds : 0.12;
  const opacity = Math.min(
    interpolate(local, [0, seconds * fps], [0, 1], clamp),
    interpolate(local, [Math.max(0, duration - S.motion.exitSeconds * fps), duration], [1, 0], clamp),
  );
  const p = kind === "pop" ? spring({ frame: local, fps, config: S.motion.spring }) : interpolate(local, [0, S.motion.captionSeconds * fps], [0, 1], clamp);
  return { opacity, translate: `0px ${(1 - p) * (kind === "pop" ? 18 : 14)}px`, scale: kind === "pop" ? S.motion.popFromScale + (1 - S.motion.popFromScale) * p : 1 };
}

const Pin = () => (
  <svg width={S.header.pinWidth} height={S.header.pinHeight} viewBox="0 0 40 52">
    <path fill={S.pin} d="M20 0C8 0 0 8 0 19c0 13 20 33 20 33s20-20 20-33C40 8 32 0 20 0Z" />
    <circle cx="20" cy="18" r="7" fill="white" />
  </svg>
);

export const GelexiaOverlay: React.FC<{ project: GelexiaProject }> = ({ project }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const page = project.pages.find((p) => ms >= p.startMs && ms < p.endMs);
  const active = project.callouts.filter((c) => ms >= c.startMs && ms < c.endMs);
  const headerOpacity = interpolate(frame, [0, 0.2 * fps], [0, 1], clamp);
  const headerX = interpolate(frame, [0, S.motion.headerSeconds * fps], [-80, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: project.background ? "black" : "transparent" }}>
      {project.background && (
        <OffthreadVideo src={staticFile(project.background.video)} muted={project.background.muted ?? !!project.voice}
          startFrom={Math.round((project.background.startFromSec ?? 0) * fps)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {project.voice && <Audio src={staticFile(project.voice)} />}
      {project.sfx?.map((s, i) => (
        <Sequence key={i} from={Math.round((s.atMs / 1000) * fps)} durationInFrames={Math.round(2 * fps)}>
          <Audio src={staticFile(s.file)} volume={s.volume ?? 1} />
        </Sequence>
      ))}
      <div style={{ position: "absolute", width: S.logicalWidth, height: S.logicalHeight, transformOrigin: "top left", transform: `scale(${width / S.logicalWidth},${height / S.logicalHeight})` }}>
        {project.brand.showAddress !== false && (
          <div data-gelexia="header" style={{ position: "absolute", left: S.header.left, top: S.header.top, display: "flex", alignItems: "center", gap: 12, opacity: headerOpacity, translate: `${headerX}px 0px` }}>
            <Pin />
            <div style={{ background: S.panel, borderRadius: 10, padding: "10px 20px", maxWidth: 620 }}>
              <div style={{ ...heavy, fontSize: S.header.titleSize, lineHeight: 1.1, color: S.yellow, textShadow: S.goldShadow }}>{project.brand.name}</div>
              <div style={{ ...secondary, fontSize: S.header.addressSize, lineHeight: 1.35, marginTop: 5 }}>{project.brand.address}</div>
            </div>
          </div>
        )}
        {project.brand.logoFile && <Img src={staticFile(project.brand.logoFile)} style={{ position: "absolute", right: 230, top: 255, width: 170, height: 170, objectFit: "contain", opacity: headerOpacity }} />}
        {page && (
          <div style={{ position: "absolute", left: S.caption.left, right: S.caption.right, bottom: S.caption.bottom, textAlign: "center" }}>
            <div data-gelexia="caption-group" style={{ ...heavy, ...entryState(((ms - page.startMs) / 1000) * fps, ((page.endMs - page.startMs) / 1000) * fps, fps, "caption"), display: "inline-block", boxSizing: "border-box", maxWidth: "100%", background: S.panel, borderRadius: S.caption.radius, padding: `${S.caption.padY}px ${S.caption.padX}px`, fontSize: S.caption.size, lineHeight: S.caption.lineHeight }}>
              {page.lines.map((line, i) => (
                <div data-gelexia-line key={i} style={{ whiteSpace: "nowrap" }}>
                  {line.map((w, j) => {
                    const on = ms >= w.startMs && ms < w.endMs;
                    return <span key={j} style={{ color: on ? S.yellow : S.white, textShadow: on ? S.goldShadow : S.shadow }}>{w.text}</span>;
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
        {active.map((c, i) => {
          const motion = entryState(((ms - c.startMs) / 1000) * fps, ((c.endMs - c.startMs) / 1000) * fps, fps, "pop");
          if (c.kind === "cta")
            return (
              <div key={i} style={{ position: "absolute", left: S.cta.left, right: S.cta.right, top: S.cta.top, textAlign: "center" }}>
                <div data-gelexia="cta-group" style={{ ...motion, background: S.ctaPanel, borderRadius: 20, padding: "24px 30px" }}>
                  <div style={{ ...secondary, fontSize: 20, color: S.yellow }}>LƯU ĐƯỜNG ĐI ĂN</div>
                  <div style={{ ...heavy, fontSize: 40, marginTop: 8 }}>{c.title}</div>
                  <div style={{ ...heavy, fontSize: 48, color: S.yellow, textShadow: S.goldShadow, marginTop: 14 }}>{c.addressMain}</div>
                  <div style={{ ...secondary, fontSize: 28, marginTop: 5 }}>{c.addressRest}</div>
                </div>
              </div>
            );
          const size = c.kind === "route" ? S.callout.routeSize : c.kind === "food" ? S.callout.foodSize : S.callout.introSize;
          return (
            <div key={i} style={{ position: "absolute", left: S.callout.left, right: S.callout.right, top: S.callout.top, textAlign: "center" }}>
              <div data-gelexia="callout-group" style={{ ...motion, display: "inline-block", maxWidth: "100%", boxSizing: "border-box", padding: c.kind === "food" ? "12px 24px" : "20px 30px", background: S.panel, borderRadius: S.callout.radius }}>
                <div data-gelexia-title style={{ ...heavy, fontSize: size, lineHeight: 1.05, color: S.yellow, textShadow: S.goldShadow, whiteSpace: "pre-line" }}>{c.title}</div>
                {c.subtitle && c.kind !== "food" && <div style={{ ...secondary, fontSize: S.callout.bodySize, lineHeight: 1.3, marginTop: 10 }}>{c.subtitle}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
