#!/usr/bin/env node
// Chup 1 khung FULL do phan giai (kiem do net chu): node scripts/refedit/_full.mjs <plan.json> <out.png> <giay>
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
const [planP, out, ...ts] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync(planP, "utf8"));
const common = { browserExecutable: "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", chromiumOptions: { gl: "swangle" }, logLevel: "error" };
const serveUrl = await bundle({ entryPoint: "src/index.ts", publicDir: "public" });
process.on("exit", () => { try { fs.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const composition = await selectComposition({ serveUrl, id: "RefEdit", inputProps: { plan }, ...common });
for (const t of ts) await renderStill({ serveUrl, composition, inputProps: { plan }, frame: Math.round(Number(t) * plan.fps), output: out.replace(".png", `-${t}.png`), imageFormat: "png", ...common });
console.log("ok");
