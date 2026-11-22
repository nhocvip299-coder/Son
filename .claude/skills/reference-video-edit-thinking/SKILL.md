---
name: reference-video-edit-thinking
description: Dựng video dọc BĐS/chia sẻ kiến thức theo TƯ DUY EDITOR học từ video mẫu (reference/mau-ref-01) — tự đọc lời thoại, chọn hiệu ứng có lý do (badge chương, thẻ vàng, cột giá, giá giảm, so sánh VS, chữ đỏ nhấn, thẻ kính câu hỏi, cảnh trám thu người nói vào khung góc), chữ hiện kiểu gõ, SFX theo loại hiệu ứng (bộ SFX pack), render Remotion 1080x1920 60fps. Dùng khi người dùng nói "dựng theo video mẫu", "tư duy editor", "reference edit", "kiểu video mẫu", hoặc gửi video thô cần dựng theo phong cách đã duyệt.
---

# reference-video-edit-thinking

Học từ video mẫu 58s (TikTok, talking-head + kinetic text + nền trừu tượng). Phân tích lưu sẵn — **không học lại**:
`styles/reference-01/timeline.json` (từng sự kiện: thời điểm, lời thoại neo, độ lệch, màu, chuyển động, SFX, lý do).

## Nguyên tắc cốt lõi (đọc `references/tu-duy-editor.md`)
1. **Một thời điểm – một điểm nhìn.** Chữ là TỪ KHÓA, không phải phụ đề (~5 khối chữ/phút trên mặt).
2. **Cấu trúc → đồ họa có cấu trúc**: bước/chương → badge số + zoom; chuỗi thứ tự/≥3 ý → thẻ vàng; số liệu tăng → cột; giá giảm → gạch giá + mũi tên; so sánh → VS ✓/✕.
3. **Cảnh trám không phủ kín**: người nói thu vào khung bo góc dưới-trái, đồ họa phía trên.
4. **Đỉnh nội dung/cảm xúc** → chữ đỏ + zoom ramp. **Cấm/cảnh báo** → vàng nếu khối trước là đỏ.
5. **Giải thích lý do** ("vì…") → KHÔNG chữ (nghỉ mắt). Số không chắc (ASR) → không đưa lên màn hình.

## Mặc định đã được người dùng DUYỆT (bắt buộc)
- Font: chữ trắng **1FTV Nexa Heavy** (`public/fonts/`), chữ nhấn đỏ/vàng **Phudu 900**. KHÔNG dùng Poppins (thiếu ả/ỷ), Anton (lỗi dấu chồng), Netto (mất dấu nặng dưới Ộ).
- Chữ hiện **kiểu gõ** (22 ký tự/s, con trỏ), **không** tiếng gõ phím.
- SFX: bộ `public/sfx/pack/` gán theo loại hiệu ứng (`scripts/refedit/finalize-plan.mjs` → `SFX_MAP`); **giọng giữ nguyên 100%**, mỗi SFX **thấp hơn giọng 8 dB** (`sfx-level.py`).
- **Không tự render**: gửi khung hình timeline cho người dùng duyệt trước. Ưu tiên tốc độ → render 1 bản (hỏi có cần bản chạy chữ không).

## Quy trình (chi tiết lệnh: `references/quy-trinh.md`)
0. Thiếu `public/sfx/pack` hoặc font → `bash scripts/refedit/install-assets.sh <gói.zip>` (gói tạo bằng `pack-assets.sh`).
1. Proxy H.264 1080x1920 **60fps** → `analyze` + `transcribe` (Whisper large-v3-turbo) → `projects/<dự-án>/asr-fixes.json`.
2. `node scripts/refedit/decide.mjs work/<x> --source inputs/<x>.mp4 --fixes ... --no-cut` → bản nháp `plan.json` + `decisions.md` (lý do từng quyết định).
3. **DUYỆT bằng tư duy editor** (đừng nhận máy móc): bỏ bớt số đỏ trùng lặp, gom chuỗi số thành đồ họa, đặt cảnh trám, viết `projects/<x>/plan.mjs` (mẫu: `projects/vid2/plan.mjs`).
4. `finalize-plan.mjs` (gõ chữ + SFX + giọng 100%) → `timeline-frames.mjs` → gửi khung hình, chờ duyệt.
5. Render stem SFX (voiceVolume 0, `_audio.mjs`) → `sfx-level.py <stem> <nguồn> -8 <plan...>` → nghe thử mp3 nếu người dùng muốn.
6. `render-plan.mjs` → `master-audio.mjs` (-14 LUFS) → `qc.mjs --fps 60` → bản xem nhanh ~55 MB qua SendUserFile.

## Code
- Component: `src/styles/refEdit/components.tsx` (SetupPunch, StepBadge, YellowCard, GlassPill, ExampleList, EmphasisWipe, BigNumeral, Warning, ContrastPair, RecapBadges, LightLeak, FlareBurst, ClockProp, HourglassProp, AbstractBg, Typed+RevealCtx), `animations.tsx` (BarLadder, PriceDrop, VersusCompare), `RefEdit.tsx` (composition theo plan JSON; PiP góc; voiceVolume; reveal), `tokens.ts` (thông số đo từ video mẫu).
- Thông số + bảng SFX: `references/thong-so.md`. Kết quả kiểm chứng: `references/kiem-chung.md`.

## Phân biệt GỐC vs AI
Trong code/tài liệu: `[GOC]` = quan sát/đo trên video mẫu; `[AI]` = đề xuất/cải tiến (PiP góc, animation cột/giá/VS, CTA, đồng hồ/đồng hồ cát vẽ SVG thay asset 3D gốc).
