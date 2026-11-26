---
name: mau-tuan-tu-do
description: Dựng video dọc theo phong cách kênh TikTok "Tuấn Tự Do" (@tuantungtrai86, food-vlog/đời thường) — phụ đề karaoke IN HOA chữ tròn đậm viền đen ở 1/5 trên khung, từ đang nói đổi vàng, mở đầu bằng teaser + tiêu đề vàng có bóng phóng to, chuyển cảnh vệt mực trắng, sticker "||||" khi cười, dấu "?" vàng, thẻ tên 2 dòng, vệt sáng vàng sau câu đắt, end card "CÒN TIẾP..." + viền tối. Dùng khi người dùng muốn dựng/chỉnh video "kiểu Tuấn Tự Do", "kiểu tuantungtrai", vlog ăn uống/review quán/talking-head đời thường có phụ đề chạy theo lời.
---

# Mẫu Tuấn Tự Do

Nguồn: 6 video xem nhiều nhất của kênh (0.5–7.1 triệu view, 3.5–7.3 phút, 576x1024@30). Số đo: `styles/tuan-tu-do/analysis/<id>/analysis.json`. Spec chi tiết + mức độ chắc chắn: `references/style-spec.md`.

## Nguyên tắc phong cách (đã đo/xác minh trên frame)
- **Phụ đề chạy suốt video** (~80–89% thời lượng có chữ), cụm 2–4 từ, IN HOA, font **DT Phudu 800** (`FONTS.phudu`, giãn chữ 0.04em, kéo ngang 1.1x — `TTD.tracking/squeeze`), viền đen dày + bóng mờ, **tâm ở 0.20–0.23 H** (nửa trên, không phải đáy).
- **Karaoke**: từ hiện dần theo lời, **từ đang nói vàng `#F6EC14`**, còn lại trắng. Từ khóa (số tiền, giá, món) luôn vàng và to 1.25x ("CÓ 140 CỦ mà nhẹ lắm").
- Lời người khác (bà bán hàng, khách) → tiền tố `*`, cỡ nhỏ hơn ("*6 VỚI 5 LÀ 11").
- **Hook**: 1–2 s đầu là **teaser** cắt từ khoảnh khắc đắt nhất giữa video + tiêu đề vàng toàn bộ có bản sao phóng to mờ phía sau. Hoặc PiP chủ kênh tách nền góc trên trái + câu thoại.
- Nhịp cắt ~7–20 lần/phút, shot trung vị ~2 s ở đoạn mở, sau đó để shot dài (quay 1 máy, POV gimbal).
- **Không nhạc nền**, giữ âm thanh hiện trường; hiệu ứng thưa: vệt mực trắng khi đổi địa điểm, "||||" khi cười, "?" khi thắc mắc, vệt sáng vàng sau câu cảm thán, "CÒN TIẾP..." cuối mỗi phần (series Phần 1, 2, 3…).

## Cách dùng
- Components: `src/styles/tuanTuDo/components.tsx` — `TtdKaraokeCaptions` (+`ttdChunks`), `TtdHookTitle`, `TtdNameTag`, `TtdGlowBand`, `TtdLaughMarks`, `TtdQuestionMarks`, `TtdInkWipe`, `TtdToBeContinued`, `TtdReactionPip`, `Stroked` (chữ viền đen 2 lớp).
- Composition `TuanTuDoEdit` nhận `plan: TtdPlan` (`src/styles/tuanTuDo/TuanTuDoEdit.tsx`): `segments` (đoạn 1 = teaser), `words` (timeline đầu ra), `keywordRe`, `items`, `captionMode: "karaoke" | "wordbyword"`. Chữ không có SFX (bật bằng `textSfx: true`).
- Ví dụ plan: `src/styles/tuanTuDo/Verify.tsx` (`TTD_VERIFY_PLAN`); `TuanTuDoVerifyWbw` = cùng plan, bản chạy chữ từng chữ.
- Render (luôn 2 bản theo CLAUDE.md):
  ```
  npx remotion render src/index.ts TuanTuDoEdit out/x.mp4 --props=plan.json
  # bản chạy chữ từng chữ: cùng plan với "captionMode":"wordbyword"
  node scripts/pipeline/master-audio.mjs out/x.mp4 out/x-master.mp4 && node scripts/pipeline/qc.mjs out/x-master.mp4 --fps 60
  ```
- Phân tích video mẫu mới của kênh: `yt-dlp` tải → `scripts/style/analyze_reference.py` (cắt/chữ/màu) → `scripts/style/measure_captions.py` (vị trí/cỡ/màu phụ đề) → `scripts/style/detect_sfx_onsets.py` (mốc âm thanh đột biến).

## Quy tắc khi dựng
1. Teaser 1.5–3 s ở đầu (cắt từ câu đắt nhất), `hook` đè lên, `ink` ngay sau teaser → vào câu chuyện.
2. Ẩn phụ đề khi có hook/thẻ tên/end card (composition tự làm qua `hideRanges`).
3. Sửa lỗi tên riêng ASR trước (`projects/<du-an>/asr-fixes.json`); đánh `other: true` cho lời người khác.
4. Mỗi 20–40 s tối đa 1 hiệu ứng phụ (laugh/question/glow); `ink` chỉ khi đổi địa điểm.
5. **Không gắn SFX cho chữ** (mặc định `textSfx: false`, theo yêu cầu người dùng; kênh gốc cũng không dùng). Chỉ giữ tiếng "swish" của chuyển cảnh vệt mực. Nếu bật lại `textSfx: true`: SFX trầm luôn ghép 1 lớp sáng và phải nghe rõ trên giọng nói.
6. Không dùng tên/logo/watermark kênh Tuấn Tự Do — chỉ học cách dựng; watermark/tên là của người dùng.
