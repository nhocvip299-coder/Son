import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { createTikTokStyleCaptions, type Caption, type TikTokPage } from "@remotion/captions";
import { FONTS } from "../lib/fonts";
import { BANDS, contentWidth } from "../lib/safeZone";
import { extrude, strokeStyle } from "../lib/textFx";
import type { Theme } from "../lib/theme";
import { useFitLines } from "../lib/useFit";

/**
 * Phu de kieu TikTok: moi trang 1–2 dong, tu dang noi duoc to sang + nay nhe.
 * Luon nam trong band "caption" (an toan khoi giao dien TikTok), khong chong voi tieu de (band "headline").
 */
const Page: React.FC<{ page: TikTokPage; theme: Theme; duration: number; uppercase: boolean }> = ({
  page,
  theme,
  duration,
  uppercase,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const band = BANDS(height).caption;
  const font = FONTS[theme.fontCaption];
  const size = useFitLines(page.text.trim(), font, 900, contentWidth(width) - 40, 92, 2, uppercase ? "uppercase" : "none");
  const nowMs = page.startMs + (frame / fps) * 1000;
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 220 } });
  return (
    <AbsoluteFill
      style={{
        top: band.top,
        height: band.bottom - band.top,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 20,
        opacity: interpolate(frame, [duration - 3, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}
    >
      <div
        style={{
          width: contentWidth(width),
          textAlign: "center",
          fontFamily: font,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.18,
          textTransform: uppercase ? "uppercase" : "none",
          scale: interpolate(enter, [0, 1], [0.85, 1]),
          translate: `0px ${interpolate(enter, [0, 1], [24, 0])}px`,
        }}
      >
        {page.tokens.map((t, i) => {
          const active = nowMs >= t.fromMs && nowMs < t.toMs;
          const sinceMs = nowMs - t.fromMs;
          const pop = active ? interpolate(sinceMs, [0, 90, 180], [1, 1.12, 1.06], { extrapolateRight: "clamp" }) : 1;
          const lead = t.text.match(/^\s*/)?.[0] ?? "";
          return (
            <React.Fragment key={i}>
              {lead ? " " : null}
              <span
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  margin: active ? "0 0.07em" : undefined,
                  color: active ? theme.accent : theme.text,
                  textShadow: extrude(active ? 9 : 6, active ? theme.extrude : "#141414", { shadow: theme.shadow }),
                  ...strokeStyle(3, theme.stroke),
                  scale: pop,
                }}
              >
                {t.text.trim()}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const KaraokeCaptions: React.FC<{
  captions: Caption[];
  theme: Theme;
  combineMs?: number;
  uppercase?: boolean;
}> = ({ captions, theme, combineMs = 1100, uppercase = false }) => {
  const { fps } = useVideoConfig();
  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: combineMs }),
    [captions, combineMs],
  );
  return (
    <>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const endMs = Math.min(next ? next.startMs : Infinity, page.startMs + page.durationMs + 400);
        const from = Math.round((page.startMs / 1000) * fps);
        const dur = Math.max(1, Math.round((endMs / 1000) * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={`Caption ${i + 1}`} layout="none">
            <Page page={page} theme={theme} duration={dur} uppercase={uppercase} />
          </Sequence>
        );
      })}
    </>
  );
};
