import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const WHISPER_DIR = path.join(ROOT, "whisper.cpp");
export const WHISPER_VERSION = "1.7.6";
export const BROWSER =
  process.env.REMOTION_BROWSER ??
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";

export const log = (step, msg) => console.log(`\x1b[36m[${step}]\x1b[0m ${msg}`);

export const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 60) || "video";

export const workDir = (slug) => {
  const d = path.join(ROOT, "work", slug);
  fs.mkdirSync(d, { recursive: true });
  return d;
};

export const probe = (file) =>
  JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-of", "json", file]).toString());

export const ffmpegStderr = (args) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8" }).stderr;

export const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
export const writeJson = (p, o) => fs.writeFileSync(p, JSON.stringify(o, null, 2));

/** Lay cac tham so dang --key value */
export const parseArgs = (argv) => {
  const pos = [];
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const k = argv[i].slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      opts[k] = v;
    } else pos.push(argv[i]);
  }
  return { pos, opts };
};

export const isMain = (metaUrl) => process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(metaUrl);
