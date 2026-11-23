# Dự án Son — dựng video BĐS dọc bằng Remotion

Người dùng điều khiển từ iPhone/iPad bằng tiếng Việt. Trả lời tiếng Việt, ngắn gọn.

## Yêu cầu cố định của người dùng (bắt buộc áp dụng)
- **Mỗi lần dựng/chỉnh sửa video: luôn xuất thêm bản "chạy chữ từng chữ"** (phụ đề hiện từng từ đang nói — `WordByWord` trong `src/styles/textPresets/capcut/`), bên cạnh bản thường.
- Chữ hiệu ứng phải giống mẫu CapCut: đủ độ bóng/phát sáng, chuyển động mượt (có vào + thoát), **sound effect phải nghe rõ** trên giọng nói (kiểm bằng đo năng lượng cao tần quanh mốc SFX).
- Gửi bản xem nhanh (~60 MB) qua SendUserFile; bản đầy đủ để trong `out/`.
- **Mỗi lần xong clip hoàn chỉnh: làm thêm ảnh bìa (thumbnail 1080×1920, composition `RefThumbnail`) và caption riêng cho TikTok và Facebook Reels** (lưu `out/<dự-án>/caption.txt`, số liệu chỉ lấy từ lời trong video).
- Không sửa/xóa file gốc; video gốc/mẫu không đưa lên Git.

## Quy trình chuẩn
1. Tải video (Drive: `drive.usercontent.google.com/download?id=...&confirm=t`), tạo proxy H.264 1080x1920 (HEVC không giải mã được trong Chromium).
2. `analyze` + `transcribe` (whisper.cpp large-v3-turbo, đường dẫn tuyệt đối) → sửa lỗi tên riêng bằng `projects/<du-an>/asr-fixes.json`.
3. Kịch bản neo theo chỉ số từ → plan → preview stills → render 60fps → `master-audio` (-14 LUFS) → `qc`.
4. Skills: `reference-video-edit-thinking` (phong cách + tư duy editor video mẫu — MẶC ĐỊNH cho video kiểu chia sẻ kiến thức/BĐS), `mau-hong-dang` (phong cách), `text-presets-bds` (40 preset CapCut từ dữ liệu thật).

## Sở thích đã chốt (video Happy Home, 11/2026)
- Font: chữ trắng 1FTV Nexa Heavy, chữ nhấn Phudu. Không Poppins/Anton/Netto (lỗi dấu).
- Cảnh trám không phủ kín: thu người nói vào khung góc; điểm nhấn dùng animation.
- Chữ hiện kiểu gõ (không tiếng gõ phím). SFX = bộ pack TikTok, nhỏ hơn giọng 8 dB; giọng giữ nguyên.
- Gửi khung hình timeline để duyệt TRƯỚC khi render; khi người dùng ưu tiên thời gian chỉ render 1 bản (có thể bỏ bản chạy chữ).
- Tài nguyên không lên Git (SFX pack, font Nexa): gói zip tạo bằng `scripts/refedit/pack-assets.sh`, cài bằng `install-assets.sh`.
