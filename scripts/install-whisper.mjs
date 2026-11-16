// Cai whisper.cpp (CPU) + model qua goi chinh thuc @remotion/install-whisper-cpp
import path from "node:path";
import { installWhisperCpp, downloadWhisperModel } from "@remotion/install-whisper-cpp";
const to = path.join(process.cwd(), "whisper.cpp");
const model = process.argv[2] ?? "medium";
await installWhisperCpp({ to, version: "1.7.6" });
await downloadWhisperModel({ model, folder: to });
console.log("OK whisper.cpp + model", model);
