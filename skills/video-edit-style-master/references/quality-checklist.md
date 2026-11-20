# Checklist chất lượng (chạy `scripts/check-output.mjs <video> [--fps] [--duration]`)
Tự động: kích thước 1080x1920, FPS, yuv420p, có tiếng, lệch hình/tiếng < 0,05 s, không đoạn đen > 0,5 s, không đứng hình > 1,5 s (trừ chủ đích), −14 LUFS ±1, true peak < −1 dBTP.
Thủ công (ảnh khung có khung đỏ vùng an toàn): chữ trong lề 150/220/520 px; không 2 khối chữ chồng; không đè mặt; chữ giữ ≥ 1,2 s; tiếng Việt đủ dấu (Barlow Condensed/Ms Madi có dấu); SFX chính ≥ +3 dB trên giọng (`sfx_vs_voice.py`); nội dung chữ đúng lời nói, không thêm thông tin.
