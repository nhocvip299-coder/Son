#!/usr/bin/env node
// Render plan RefEdit -> MP4 (Remotion). Dung: node scripts/refedit/render-plan.mjs <plan.json> <out.mp4> [--words captions.json] [--crf 18]
import fs from "node:fs";
import { renderComposition } from "../pipeline/render.mjs";
import { parseArgs } from "../pipeline/lib.mjs";
const { pos, opts } = parseArgs(process.argv.slice(2));
const plans = [];
for (let i = 0; i < pos.length; i += 2) plans.push([pos[i], pos[i + 1]]);
for (const [p, out] of plans) {
  const plan = JSON.parse(fs.readFileSync(p, "utf8"));
  const t0 = Date.now();
  await renderComposition({ id: "RefEdit", inputProps: { plan }, output: out, crf: Number(opts.crf ?? 18) });
  console.log("xong", out, ((Date.now() - t0) / 1000).toFixed(0) + "s");
}
