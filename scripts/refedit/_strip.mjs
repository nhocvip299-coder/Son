// Dai khung lien tiep (de duyet chuyen dong go chu): node scripts/refedit/_strip.mjs plan.json out.jpg t0 t1 step [crop_y crop_h]
import path from "node:path"; import fs from "node:fs"; import { spawnSync } from "node:child_process";
import { bundle } from "@remotion/bundler"; import { renderStill, selectComposition } from "@remotion/renderer";
import { BROWSER, ROOT } from "../pipeline/lib.mjs";
const [planP, out, t0, t1, step, cy = "1050", ch = "420"] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync(planP, "utf8"));
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), publicDir: path.join(ROOT, "public") });
const common = { browserExecutable: BROWSER, chromiumOptions: { gl: "swangle" }, logLevel: "error" };
const composition = await selectComposition({ serveUrl, id: "RefEdit", inputProps: { plan }, ...common });
const files = [];
for (let t = Number(t0), i = 0; t <= Number(t1) + 1e-6; t += Number(step), i++) {
  const f = `/tmp/claude-0/sp_${i}.png`;
  await renderStill({ serveUrl, composition, inputProps: { plan }, frame: Math.round(t * plan.fps), output: f, ...common });
  const g = `/tmp/claude-0/sp_${i}.jpg`;
  spawnSync("ffmpeg", ["-v", "error", "-y", "-i", f, "-vf", `crop=1080:${ch}:0:${cy},scale=540:-2,drawtext=text='${t.toFixed(2)}s':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6`, g]);
  files.push(g);
}
const cols = 3; const h = Number(ch) / 2;
const layout = files.map((_, i) => `${(i % cols) * 540}_${Math.floor(i / cols) * h}`).join("|");
spawnSync("ffmpeg", ["-v", "error", "-y", ...files.flatMap((f) => ["-i", f]), "-filter_complex", `${files.map((_, i) => `[${i}]`).join("")}xstack=inputs=${files.length}:layout=${layout}:fill=black`, out]);
console.log("ok", out);
