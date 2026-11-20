---
name: video-edit-style-master
description: Dựng video BĐS dọc 9:16 theo phong cách "trang kính teal + chữ neon cyan + số vàng đếm chạy" học từ reference/mau.mp4 — tự phân tích lời thoại, chọn hiệu ứng theo ngữ nghĩa (giá, hạ giá, diện tích, vị trí/bản đồ, % vay, thẻ kính, SĐT), dựng bằng Remotion và xuất MP4. Dùng khi người dùng nói "Video Edit Style Master", "dựng theo phong cách mẫu kính xanh", "edit giống video mẫu", hoặc đưa video gốc mới và muốn dựng theo phong cách đã học.
---
# Video Edit Style Master

## Kích hoạt
"dựng kiểu Video Edit Style Master / kính xanh / giống video mẫu" + một video gốc (Drive, file upload). Không dùng khi người dùng đã chọn phong cách khác (bds-luxury, mau-hong-dang…).

## Đầu vào → đầu ra
- Vào: video gốc dọc (1080x1920 hoặc lớn hơn, HEVC/H.264), tuỳ chọn SĐT, tên.
- Ra: MP4 H.264 1080x1920 9:16, FPS theo nguồn, −14 LUFS; bản xem nhanh ~60 MB. KHÔNG xuất phụ đề chạy chữ (người dùng bỏ yêu cầu). Chữ render ×2 nếu cần 4K.

## Quy trình (đã chạy được trên repo này)
1. `bash skills/video-edit-style-master/scripts/analyze-video.sh <video> work/<du-an>` → probe, cắt cảnh, dải khung 2 fps, phiên âm `asr/captions.json`. Sửa tên riêng bằng `projects/<du-an>/asr-fixes.json`.
2. Đi qua từng câu, gọi `pickCue(câu, {prevPrice})` (presets/rules.ts) → loại hiệu ứng; đối chiếu `references/editor-thinking.md` (khi nào KHÔNG dùng hiệu ứng).
3. Viết composition: nền = video gốc trong `<TealOrange>`; mỗi cue một `<Sequence>` bắt đầu ĐÚNG đầu từ khoá (−0,1…+0,2 s), giữ tới cue sau (≥1,2 s). Bùng sáng chỉ ở ranh giới chủ đề. Mẫu tham khảo: `examples/VerifyMau.tsx`.
4. SFX theo `references/sound-design.md` (preset `VESM_SFX`), dùng `SfxTrack` (src/compositions/shared).
5. Ảnh duyệt trước (`npx remotion still … --scale=0.5`) → render (`npx remotion render <Comp> out/x.mp4 --scale=1 --image-format=png --crf=16`) → `node scripts/pipeline/master-audio.mjs` → `node skills/video-edit-style-master/scripts/check-output.mjs out/x.mp4 --fps 60 --duration N` → `scripts/style/sfx_vs_voice.py` trên stem.

## Bảng chọn hiệu ứng
| Lời thoại | Cue | Component |
|---|---|---|
| số tiền | gold | `GoldNumber` (lead = cụm trước số) |
| giá cũ → còn/giảm | price-drop | `LightBurst` + `GlassPage` + `PriceDrop` |
| ngang/sâu/phòng/WC/sân/sổ hồng/nội thất | neon | `NeonTitle` (+ `script` bổ nghĩa) |
| cách … km/phút, tới chợ/trường | map | `StripSlide` → `MapRoute` → `ZoomBlurOut` |
| % / km đơn lẻ | thin | `ThinBig` + `PersonFront` (chữ SAU LƯNG người, đầu che chân chữ) |
| vay, hỗ trợ, sở hữu | card | `GlassPage` + `GlassCard` (chips) |
| số điện thoại | phone | `PhonePill` (gõ theo lời đọc, dính đáy) |
| câu đệm | none | để khung sạch |
Tất cả nhận dữ liệu qua props, tự thu chữ vào 740 px (vùng an toàn), màu/font/thời gian ở `presets/style.ts`.

## Bảng màu chữ
`<TextTheme value="neon">` (mặc định, mẫu kính xanh: cyan + vàng) hoặc `"aqua"` (mẫu xanh điện quang, reference/mau-upload-2: gradient chéo #13489c↔#16fff4, chữ ký trắng). SB-145 dùng "aqua".

## Kiểm chứng
`npx remotion render VesmVerify out/vesm-verify.mp4` — dựng lại 0–22,5 s của mẫu; `out/vesm-so-sanh-mau-vs-dung.mp4` để so cạnh nhau. Test luật: `node --experimental-strip-types --test skills/video-edit-style-master/tests/rules.test.ts`.

## Tài liệu
references/: style-analysis · timeline · typography · motion · sound-design · editor-thinking · quality-checklist. Tiến độ: progress.md.
