// Thumbnail doc 4K (2160x3840) tu 1 frame clip goc: nhan vang tren + 2 dong tieu de lon (trang / vang phat sang) + dong phu, font DT Phudu 900.
// Dung: node scripts/review/thumbnail.cjs <clip.mp4> <giay> <out.jpg> "<NHAN TREN>" "<DONG 1>" "<DONG 2>" "<DONG PHU>"
// Chon frame: mat ro + cam mon an + bieu cam manh (thuong la cau hook). Chu dat nua duoi, tranh mat, chua le day ~13% cho giao dien TikTok.
const { execFileSync } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const { chromium } = require("playwright");
const [clip, sec, out, tag, h1, h2, sub] = process.argv.slice(2);
const T = fs.mkdtempSync(path.join(os.tmpdir(), "thumb-"));
const F = path.resolve("node_modules/@fontsource/phudu/files");
execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", sec, "-i", clip, "-frames:v", "1", "-vf", "scale=2160:3840:force_original_aspect_ratio=increase:flags=lanczos,crop=2160:3840,unsharp=5:5:0.6", `${T}/bg.png`]);
const esc = (s) => (s || "").replace(/[<&]/g, (c) => ({ "<": "&lt;", "&": "&amp;" })[c]);
const VI = "U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB";
fs.writeFileSync(`${T}/t.html`, `<html><head><meta charset="utf-8"><style>
@font-face{font-family:P;font-weight:900;src:url(file://${F}/phudu-vietnamese-900-normal.woff2);unicode-range:${VI}}
@font-face{font-family:P;font-weight:900;src:url(file://${F}/phudu-latin-900-normal.woff2)}
body{margin:0;width:2160px;height:3840px;position:relative;overflow:hidden;font-family:P;font-weight:900}
.bg{position:absolute;inset:0;background:url(file://${T}/bg.png)}
.shade{position:absolute;left:0;right:0;bottom:0;height:1700px;background:linear-gradient(transparent,rgba(0,0,0,.82))}
.t{position:absolute;left:0;right:0;text-align:center;white-space:nowrap;line-height:1.02;letter-spacing:.03em;paint-order:stroke fill}
.tag{top:150px;left:50%;right:auto;transform:translateX(-50%) rotate(-3deg);white-space:nowrap;background:#F6EC14;color:#111;font-size:150px;padding:20px 60px;border-radius:30px;box-shadow:0 16px 40px rgba(0,0,0,.5)}
.h1{bottom:1080px;font-size:270px;color:#fff;-webkit-text-stroke:30px #000;text-shadow:0 18px 40px rgba(0,0,0,.7)}
.h2{bottom:740px;font-size:270px;color:#F6EC14;-webkit-text-stroke:32px #000;text-shadow:0 0 60px rgba(246,236,20,.55),0 18px 40px rgba(0,0,0,.7)}
.sub{bottom:520px;font-size:120px;color:#fff;-webkit-text-stroke:16px #000}
</style></head><body><div class=bg></div><div class=shade></div>
${tag ? `<div class="t tag">${esc(tag)}</div>` : ""}<div class="t h1"><span>${esc(h1)}</span></div><div class="t h2"><span>${esc(h2)}</span></div><div class="t sub"><span>${esc(sub)}</span></div></body></html>`);
(async () => {
  const b = await chromium.launch({ args: ["--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 2160, height: 3840 } });
  await p.goto(`file://${T}/t.html`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  // tu thu nho chu neu tran ngang
  await p.evaluate(() => document.querySelectorAll(".t span").forEach((sp) => { const e = sp.parentElement; let s = parseFloat(getComputedStyle(e).fontSize); while (sp.getBoundingClientRect().width > 2000 && s > 60) { s -= 8; e.style.fontSize = s + "px"; } }));
  await p.screenshot({ path: `${T}/t.png` });
  await b.close();
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", `${T}/t.png`, "-q:v", "1", out]);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", `${T}/t.png`, "-vf", "scale=540:-1", out.replace(/\.jpg$/, "-xem.jpg")]);
  console.log("OK", out);
})();
