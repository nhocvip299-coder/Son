# Tài liệu tham chiếu cho style `cyberpunk-hologram`

Đặt vào thư mục này:
- 2–5 video mẫu (.mp4) của phong cách cần học.
- Ảnh chụp màn hình khung chữ đẹp nhất (tùy chọn).
- Ghi chú/brief của bạn (`brief.md`): font, màu, nhịp, câu cửa miệng, SFX hay dùng.

Sau đó nói với Claude: **"Học phong cách cyberpunk-hologram từ video mẫu"**.
Claude sẽ chạy `node scripts/pipeline/analyze-style.mjs styles/cyberpunk-hologram/references` để đo nhịp cắt,
màu chủ đạo, vị trí/cỡ chữ, rồi đề xuất cập nhật `style.json` (status: calibrating → calibrated chỉ khi bạn xác nhận).
