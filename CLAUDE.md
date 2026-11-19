# Dự án Son — dựng video BĐS dọc bằng Remotion

Người dùng điều khiển từ iPhone/iPad bằng tiếng Việt. Trả lời tiếng Việt, ngắn gọn.

## Yêu cầu cố định của người dùng (bắt buộc áp dụng)
- **Mỗi lần dựng/chỉnh sửa video: luôn xuất thêm bản "chạy chữ từng chữ"** (phụ đề hiện từng từ đang nói — `WordByWord` trong `src/styles/textPresets/capcut/`), bên cạnh bản thường.
- Chữ hiệu ứng phải giống mẫu CapCut: đủ độ bóng/phát sáng, chuyển động mượt (có vào + thoát), **sound effect phải nghe rõ** trên giọng nói (kiểm bằng đo năng lượng cao tần quanh mốc SFX).
- **Chữ tuyệt đối phải 4K sắc nét** (video gốc có thể Full HD): luôn render x2 = 2160x3840 (`Config.setScale(2)` + khung PNG), chữ vẽ SVG/text ở cỡ thật, không phóng to ảnh chữ (dùng `zoom`, không `transform: scale` cho preset). Bản xem nhanh cũng giữ 4K, chỉ hạ bitrate.
- Gửi bản xem nhanh (~60 MB) qua SendUserFile; bản đầy đủ để trong `out/`.
- Không sửa/xóa file gốc; video gốc/mẫu không đưa lên Git.

## Quy trình chuẩn
1. Tải video (Drive: `drive.usercontent.google.com/download?id=...&confirm=t`), tạo proxy H.264 1080x1920 (HEVC không giải mã được trong Chromium).
2. `analyze` + `transcribe` (whisper.cpp large-v3-turbo, đường dẫn tuyệt đối) → sửa lỗi tên riêng bằng `projects/<du-an>/asr-fixes.json`.
3. Kịch bản neo theo chỉ số từ → plan → preview stills → render 60fps → `master-audio` (-14 LUFS) → `qc`.
4. Skills: `mau-hong-dang` (phong cách), `text-presets-bds` (40 preset CapCut từ dữ liệu thật).
