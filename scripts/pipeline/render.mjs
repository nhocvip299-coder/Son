#!/usr/bin/env node
// Buoc 7 — Render bang Remotion (that su dung React/Remotion de dung hieu ung, khong thay bang FFmpeg).
import path from "node:path";
import os from "node:os";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { BROWSER, ROOT, isMain, log, parseArgs, readJson } from "./lib.mjs";

let bundled = null;
const getBundle = async () => {
  if (!bundled) {
    log("render", "Dong goi du an Remotion...");
    bundled = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), publicDir: path.join(ROOT, "public") });
  }
  return bundled;
};

const common = {
  browserExecutable: BROWSER,
  chromiumOptions: { gl: "swangle" },
  timeoutInMilliseconds: 120000,
  logLevel: "error",
};

export const renderComposition = async ({ id, inputProps = {}, output, crf = 17 }) => {
  const serveUrl = await getBundle();
  const composition = await selectComposition({ serveUrl, id, inputProps, ...common });
  log("render", `${id}: ${composition.width}x${composition.height} ${composition.fps}fps ${composition.durationInFrames} khung`);
  let last = -1;
  await renderMedia({
    serveUrl,
    composition,
    inputProps,
    outputLocation: output,
    codec: "h264",
    crf,
    pixelFormat: "yuv420p",
    colorSpace: "bt709",
    imageFormat: "jpeg",
    jpegQuality: 95,
    audioBitrate: "320k",
    // tran bitrate: giu chat luong cao nhung khong phinh file vo ly (TikTok/Reels se ma hoa lai)
    encodingMaxRate: "30M",
    encodingBufferSize: "60M",
    concurrency: Math.max(1, os.cpus().length),
    overwrite: true,
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 10);
      if (p !== last) {
        last = p;
        log("render", `${p * 10}%`);
      }
    },
    ...common,
  });
  return composition;
};

/** Anh xem truoc tai cac moc thoi gian (de xem nhanh tren dien thoai). */
export const renderPreviews = async ({ id, inputProps, framesList, outPattern }) => {
  const serveUrl = await getBundle();
  const composition = await selectComposition({ serveUrl, id, inputProps, ...common });
  const files = [];
  for (const f of framesList) {
    const out = outPattern.replace("%d", String(f));
    await renderStill({ serveUrl, composition, inputProps, frame: Math.min(f, composition.durationInFrames - 1), output: out, scale: 0.5, imageFormat: "jpeg", jpegQuality: 85, ...common });
    files.push(out);
  }
  return files;
};

if (isMain(import.meta.url)) {
  const { pos, opts } = parseArgs(process.argv.slice(2));
  // node render.mjs <CompositionId> <out.mp4> [--plan work/x/plan.json]
  const inputProps = opts.plan ? { plan: readJson(opts.plan) } : {};
  await renderComposition({ id: pos[0], output: pos[1], inputProps });
}
