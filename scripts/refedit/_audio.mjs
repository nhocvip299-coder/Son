import path from "node:path"; import fs from "node:fs";
import { bundle } from "@remotion/bundler"; import { renderMedia, selectComposition } from "@remotion/renderer";
const ROOT="/home/user/Son"; const BROWSER="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const [planP,out]=process.argv.slice(2); const plan=JSON.parse(fs.readFileSync(planP,"utf8"));
const serveUrl=await bundle({entryPoint:path.join(ROOT,"src/index.ts"),publicDir:path.join(ROOT,"public")});
const common={browserExecutable:BROWSER,chromiumOptions:{gl:"swangle"},logLevel:"error"};
const composition=await selectComposition({serveUrl,id:"RefEdit",inputProps:{plan},...common});
await renderMedia({serveUrl,composition,inputProps:{plan},codec:"wav",outputLocation:out,...common}); console.log("ok");
