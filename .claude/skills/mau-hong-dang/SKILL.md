---
name: mau-hong-dang
description: Dựng video dọc theo phong cách "Mẫu Hồng Đăng" (BĐS talking-head tối giản, chữ khóa gradient cyan hiện từng ký tự, thẻ câu hỏi vàng, số lớn vàng, icon 3D xoay, bản đồ vệ tinh HUD, PiP bo góc, watermark kênh). Dùng khi người dùng yêu cầu dựng/chỉnh video "kiểu Hồng Đăng", "mẫu Hồng Đăng", hoặc style hong-dang.
---

# Mẫu Hồng Đăng

Nguồn: 2 video mẫu trong `reference/` (chỉ đọc). Phân tích: `styles/hong-dang/analysis/` (JSON + contact sheet, có cache).

## Nguyên tắc phong cách (đã xác minh trên keyframe)
- **Không có phụ đề chạy liên tục.** Chỉ chèn chữ ở từ khóa/con số (~2–10 lần/phút).
- Chữ khóa: IN HOA, rất đậm, gradient cyan dọc `#04EFFB→#07B0F2`, bóng mềm, không viền; có dòng dẫn nhỏ trắng phía trên.
- Câu hỏi/chủ đề: hộp tối bán trong suốt, dòng 1 vàng IN HOA, dòng 2 trắng nhỏ; gõ từng ký tự.
- Số tiền/số liệu: vàng gradient, cỡ rất lớn, nửa trên khung.
- B-roll bản đồ vệ tinh tối, viền dự án phát sáng cyan, callout vàng, nhãn cyan nghiêng theo bản đồ.
- Nhịp cắt ~13–14 lần/phút, shot trung vị 2.8–4 s; luân phiên toàn cảnh ↔ cận (punch-in).
- Watermark 2 dòng góc dưới trái, trắng mờ, suốt video.

## Cách dùng
- Components: `src/styles/hongDang/components.tsx` — `HdKeywordReveal`, `HdSpinIcon3D`, `HdQuestionCard`, `HdBigNumber`, `HdMapHud`, `HdPipCard`, `HdWatermark` (timing theo frame@30, chạy đúng ở 30/60 FPS).
- Ví dụ ghép: `src/styles/hongDang/Verify.tsx` (composition `HongDangVerify`).
- Render: `npx remotion render src/index.ts HongDangVerify out/x.mp4` → `node scripts/pipeline/master-audio.mjs` → `node scripts/pipeline/qc.mjs`.
- Phân tích video mẫu mới: `.venv/bin/python -I scripts/style/analyze_reference.py <video> styles/hong-dang/analysis/<id>`.

## Quy tắc khi dựng
1. Chọn 1 từ khóa/câu → 1 hiệu ứng; không chồng 2 khối chữ cùng vùng (trừ BigNumber trên + Card dưới).
2. Giữ text trong vùng an toàn (xem `src/lib/safeZone.ts`); watermark mẫu nằm ~0.775H (có thể bị UI TikTok che — điều chỉnh nếu cần).
3. Watermark là tham số: chỉ dùng tên kênh của chính người dùng.
4. Chi tiết, thông số và mức độ chắc chắn: `references/style-spec.md`.
