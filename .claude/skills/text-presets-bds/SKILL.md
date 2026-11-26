---
name: text-presets-bds
description: Thư viện 40 hiệu ứng chữ (text preset) bất động sản dựng lại bằng Remotion TỪ DỮ LIỆU CAPCUT THẬT (Presets.zip "Kobe Text 01–40") — đúng văn bản, cỡ, màu, bóng, vị trí, animation, phát sáng, mask, âm thanh khi chữ xuất hiện, kèm khối hình (thẻ, khung, viên thuốc, elip, đường cong). Dùng khi người dùng muốn chèn chữ hiệu ứng/"kiểu CapCut"/template chữ vào video BĐS (giá, diện tích, vị trí, tiện ích, CTA, hook), nhắc "Kobe Text", "text preset", "hiệu ứng chữ", hoặc gửi preset CapCut mới cần chuyển sang Remotion.
---

# Text Presets BĐS — từ dữ liệu CapCut

Nguồn: `Presets.zip` người dùng gửi (giải nén chỉ đọc ở `styles/text-presets/source-zip/`), 40 thư mục `Kobe Text NN` (draft CapCut + ảnh bìa). Video mẫu đối chiếu: `inputs/source2.mov`, `inputs/source3.mov`.

## Dùng nhanh (chèn vào video)
```tsx
import { CC_PRESETS, CapcutPreset } from "src/styles/textPresets/capcut/CapcutPreset";
const p = CC_PRESETS.find((x) => x.id === "Kobe Text 40")!; // "tri gia 100 Trieu dong"
<Sequence from={5 * fps} durationInFrames={3 * fps}>
  <CapcutPreset preset={p} fit={{ cx: 540, cy: 1150, width: 820 }} texts={{ "100 Triệu": "5,2 Tỷ" }} />
</Sequence>
```
- `fit`: đặt preset vào vùng (tâm + chiều rộng px); `"cover"` = khung như ảnh bìa CapCut. Giữ trong vùng an toàn TikTok (`src/lib/safeZone.ts`), tránh mặt người nói.
- `texts`: thay chữ theo văn bản gốc (khóa = chữ gốc). Các lớp trùng chữ (lớp phát sáng/mask) đổi cùng nhau.
- Âm thanh tự phát đúng thời điểm trong dữ liệu (`withAudio={false}` để tắt).
- Chọn preset: `references/capcut-catalog.md` (40 dòng: chữ, animation, SFX, khối hình). Xem tất cả: `out/capcut-40-presets-bds.mp4` (mỗi preset 3 s, có mã số).

## Bắt buộc khi xuất video
- Luôn có **2 bản**: thường + **chạy chữ từng chữ** (`plan.words` → `WordByWord`, preset dời lên ~80px để không chồng).
- SFX phải nghe rõ: `sfxGain` (≥0.55); kiểm năng lượng >3 kHz quanh mốc SFX sau render.
- Mỗi preset có thoát mượt 0.3s (`ExitFade` trong `CapcutEdit`) + nền tối mềm (`Backdrop`) khi chèn lên video sáng.

## Hiệu chỉnh đã làm (so với video quay màn hình CapCut, trang B)
- Phát sáng "Phát sáng 2": 3 lớp drop-shadow (45/110/220 × size) + brightness(1+lum×0.8).
- Nghiêng theo dữ liệu (`italic_degree`, mặc định 10°) bằng skewX.
- Hệ số cỡ theo font thay thế `FONT_MAP.k`: serif Noto 0.82, viết tay Great Vibes 0.8, Playfair 0.88.
- `DTPhudu-Black` (Kobe 05 "CAPCUT", 09 "50 TRIỆU", 26 "KOBE MEDIA") dùng **font Phudu thật** (`FONTS.phudu`, 900, giãn chữ +0.05em, k 1.06) — đã đối chiếu ảnh bìa. Phudu chỉ có chữ IN HOA.
- Còn lệch: "1 Căn Hộ", "Không Gian" (font CapCut chưa có bản tương đương).

## Pipeline (thêm preset CapCut mới)
1. Giải nén vào `styles/text-presets/source-zip/` (không chạy file trong gói).
2. `python3 -I scripts/style/extract_capcut_presets.py <thu-muc-Presets> src/styles/textPresets/capcut_presets.json` — đệ quy clip ghép theo mã liên kết (extra_material_refs), gộp vị trí/tỉ lệ/lật/xoay, kế thừa animation/hiệu ứng/mask của clip cha, đo khung bao ảnh bìa.
3. Nếu preset có khối hình: thêm vào `capcut/shapes.tsx` (đo trên ảnh bìa phóng to có lưới).
4. Đối chiếu: render ảnh tĩnh (`work/cc_stills.mjs`) + `work/cc_compare.py` → `styles/text-presets/analysis/cc_compare_*.jpg`.

## Đã xác minh / ước đoán
- **Xác minh (từ dữ liệu):** văn bản, cỡ tương đối, màu, giãn chữ, bóng (góc/khoảng cách/độ mờ), vị trí/tỉ lệ/xoay/lật, thời điểm, tên + thời lượng animation, tham số "Phát sáng 2", mask Filmstrip, tên + thời điểm + âm lượng SFX.
- **Ước đoán:** font (CapCut chỉ lưu mã → bảng `FONT_MAP` trong `CapcutPreset.tsx`); hình dạng chuyển động theo tên animation (34 loại → `animStyle`); cách vẽ mask; âm thanh thay bằng SFX tự tổng hợp cùng loại (file gốc không có trong gói, bảng `SFX_MAP`); khối hình đo từ ảnh bìa.
- Cỡ tuyệt đối không suy được từ ảnh bìa (CapCut tự căn giữa + phóng vừa) → luôn dùng `fit`.

## Thành phần cũ
`engine.tsx` + `presets40.ts` là bản ước đoán trước khi có dữ liệu — giữ để tham khảo, ưu tiên dùng `capcut/`.
