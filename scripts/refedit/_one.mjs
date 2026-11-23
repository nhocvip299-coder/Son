import path from "node:path"; import fs from "node:fs";
import { bundle } from "@remotion/bundler"; import { renderStill, selectComposition } from "@remotion/renderer";
const ROOT="/home/user/Son"; const BROWSER="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const plan=JSON.parse(fs.readFileSync("work/vid2/plan-final.json","utf8"));
const serveUrl=await bundle({entryPoint:path.join(ROOT,"src/index.ts"),publicDir:path.join(ROOT,"public")});
process.on("exit", () => { try { fs.rmSync(serveUrl, { recursive: true, force: true }); } catch {} }); // xoa ban dong goi tam (moi lan chep ca public/)
const common={browserExecutable:BROWSER,chromiumOptions:{gl:"swangle"},logLevel:"error"};
const composition=await selectComposition({serveUrl,id:"RefEdit",inputProps:{plan},...common});
for (const t of [11.4, 29.6, 47.0]) await renderStill({serveUrl,composition,inputProps:{plan},frame:Math.round(t*60),output:`/tmp/claude-0/full_${t}.png`,...common});
