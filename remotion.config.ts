import { Config } from "@remotion/cli/config";

// Chat luong uu tien: khung hinh JPEG 95, H.264 CRF 17, audio 320k
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(17);
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
Config.setAudioBitrate("320k");
Config.setConcurrency(4);
Config.setOverwriteOutput(true);

// Dung Chromium headless shell co san tren may chu (remotion.media bi chan boi mang).
// Ghi de bang bien moi truong REMOTION_BROWSER neu chay noi khac.
import fs from "node:fs";
const LOCAL_SHELL =
  process.env.REMOTION_BROWSER ??
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (fs.existsSync(LOCAL_SHELL)) {
  Config.setBrowserExecutable(LOCAL_SHELL);
}
Config.setChromiumOpenGlRenderer("swangle");
