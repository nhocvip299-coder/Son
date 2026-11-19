import { Config } from "@remotion/cli/config";

// YEU CAU NGUOI DUNG: video co the Full HD nhung CHU PHAI 4K SAC NET
// -> moi lan render (video + anh tinh) deu x2 = 2160x3840: chu/SVG duoc dan trang o 4K, video goc 1080 duoc phong len.
// Khung trung gian PNG (khong nen) de canh chu khong bi vien JPEG.
Config.setScale(2);
Config.setVideoImageFormat("png");
Config.setCodec("h264");
Config.setCrf(16);
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
