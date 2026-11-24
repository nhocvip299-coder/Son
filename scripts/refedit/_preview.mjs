#!/usr/bin/env node
// Xem thu 1 doan ngan (khong phai ban render chinh): node scripts/refedit/_preview.mjs <plan.json> <out.mp4> <t0> <t1> [scale=0.5]
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
const [planP, out, t0, t1, sc = "0.5"] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync(planP, "utf8"));
const BROWSER = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const common = { browserExecutable: BROWSER, chromiumOptions: { gl: "swangle" }, logLevel: "error" };
const serveUrl = await bundle({ entryPoint: "src/index.ts", publicDir: "public" });
process.on("exit", () => { try { fs.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const inputProps = { plan };
const composition = await selectComposition({ serveUrl, id: "RefEdit", inputProps, ...common });
await renderMedia({ serveUrl, composition, inputProps, codec: "h264", outputLocation: out, scale: Number(sc), crf: 24, frameRange: [Math.round(t0 * plan.fps), Math.round(t1 * plan.fps) - 1], ...common });
console.log("ok", out);
