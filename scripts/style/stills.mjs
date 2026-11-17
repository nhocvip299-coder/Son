import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
// Dung: node scripts/style/stills.mjs <CompositionId> <props.json> <out-dir> <giay1> [<giay2> ...]
// Dong goi 1 lan roi render tung anh xem truoc (nhanh va it ton RAM hon goi `remotion still` song song).
const [compId, propsPath, outDir, ...times] = process.argv.slice(2);
const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf8"));
const serveUrl = await bundle({ entryPoint: "/home/user/Son/src/index.ts", publicDir: "/home/user/Son/public" });
const browserExecutable = process.env.REMOTION_BROWSER ?? fs.globSync("/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell")[0];
const comp = await selectComposition({ serveUrl, id: compId, inputProps, browserExecutable });
const fpsOut = comp.fps;
for (const t of times) {
  await renderStill({ composition: comp, serveUrl, inputProps, frame: Math.round(Number(t) * comp.fps), output: `${outDir}/p_${t}.jpg`, imageFormat: "jpeg", scale: 0.33, timeoutInMilliseconds: 120000, browserExecutable, chromiumOptions: { gl: "swangle" } });
  process.stdout.write(t + " ");
}
