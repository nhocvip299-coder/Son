import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { fitText, fitTextOnNLines } from "@remotion/layout-utils";

/** Cho font tai xong roi moi do kich thuoc chu (tranh do sai -> tran/chong chu). */
export const useFontsReady = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("Cho font tai xong"));
  useEffect(() => {
    document.fonts.ready.then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return ready;
};

/** Co chu lon nhat de 1 dong vua trong `width`, gioi han boi `max`. */
export const useFitOneLine = (
  text: string,
  fontFamily: string,
  fontWeight: string | number,
  width: number,
  max: number,
  extra: { letterSpacing?: string; textTransform?: "uppercase" | "none" } = {},
) => {
  const ready = useFontsReady();
  if (!ready) return max;
  const { fontSize } = fitText({
    text,
    withinWidth: width,
    fontFamily,
    fontWeight,
    letterSpacing: extra.letterSpacing,
    textTransform: extra.textTransform,
  });
  return Math.min(max, Math.floor(fontSize));
};

/** Co chu lon nhat de doan text vua `maxLines` dong trong `width`. */
export const useFitLines = (
  text: string,
  fontFamily: string,
  fontWeight: string | number,
  width: number,
  max: number,
  maxLines: number,
  textTransform?: "uppercase" | "none",
) => {
  const ready = useFontsReady();
  if (!ready) return max;
  const { fontSize } = fitTextOnNLines({
    text,
    maxLines,
    maxBoxWidth: width,
    fontFamily,
    fontWeight,
    maxFontSize: max,
    textTransform,
  });
  return Math.floor(fontSize);
};
