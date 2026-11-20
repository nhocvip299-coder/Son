# progress — Video Edit Style Master
Nguồn: reference/mau.mp4 (= reference/mau-drive-1/ref01.mp4, 1440x2560 30fps 83,4s; gitignored). Proxy dựng: public/inputs/vesm/mau.mp4.
- [x] Môi trường: Linux, Node 22.23, Remotion 4.0.544, React 19, TS 7, ffmpeg/ffprobe 6.1, whisper.cpp large-v3-turbo, Chromium headless
- [x] Phân tích: analysis.json, dải khung 2 fps toàn video, 10 fps quanh hiệu ứng, đo màu pixel, hf_peaks SFX, phiên âm (work/vesm/asr)
- [x] references/ (7 file), presets/style.ts + rules.ts, components/ (9 component + core)
- [x] tests/rules.test.ts — 8/8 qua
- [x] Verify vòng 1 + 2 (ảnh so cạnh nhau: work/vesm/still/c1–c3.jpg)
- [x] Render MP4 kiểm chứng out/vesm-verify.mp4 (1080x1920 30fps 22,5 s) + out/vesm-so-sanh-mau-vs-dung.mp4
- [x] check-output: PASS (cảnh báo đứng hình = nền đóng băng có chủ đích; true peak đã master về −14 LUFS)
- [x] sfx_vs_voice (giọng = tiếng gốc của mẫu, CÓ SẴN SFX của mẫu): 11,6 / 18,1 / 21,3 / 5,85 s rõ (+15…+26 dB); 8,5 / 14,1 s bị lấp vì trùng tiếng impact gốc của mẫu, 22,2 s +1,7 dB — trên video mới (giọng sạch) cần đo lại
## Chưa đạt / khác mẫu
- Giá mới trang hạ giá nhỏ hơn mẫu ~10 % (giới hạn 740 px vùng an toàn; mẫu rộng ~800 px).
- Font là bản miễn phí tương đương (Barlow Condensed / Ms Madi / Playfair) — dáng gần, không trùng.
- Đường bản đồ là đường cong cố định, không theo bản đồ thật; tên đường dọc tuyến chưa vẽ.
- SFX là thư viện có sẵn, không phải file gốc của mẫu.
