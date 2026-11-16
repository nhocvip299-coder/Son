---
name: text-presets-bds
description: Thư viện 40 hiệu ứng chữ (text preset) cho video bất động sản dựng bằng Remotion, học từ bộ "40 Text Presets" người dùng gửi — font viết tay/serif/đậm, chữ phát sáng gradient, tracking-in, hiện từng ký tự, glitch, chữ viết tay hiện dần, gạch chân cong, gạch đỏ, chip nhãn, cuộc gọi đến, đổi màu — kèm âm thanh khi chữ xuất hiện. Dùng khi người dùng muốn chèn chữ hiệu ứng, chữ "kiểu CapCut", nhãn giá/diện tích/vị trí/tiện ích/CTA vào video BĐS, hoặc nhắc tới "text preset", "hiệu ứng chữ", "template chữ".
---

# Text Presets BĐS (40 hiệu ứng)

Nguồn: 2 video mẫu người dùng gửi (`inputs/source2.mov`, `inputs/source3.mov`, chỉ đọc) — 4 trang × 10 preset. Phân tích/so sánh: `styles/text-presets/analysis/`.

## Dùng nhanh
```tsx
import { TextPreset, presetCues } from "src/styles/textPresets/engine";
import { presetById } from "src/styles/textPresets/presets40";
<Sequence from={...}><div style={{position:"absolute", left:120, top:1050}}>
  <TextPreset def={presetById("b02-tri-gia")} u={110} texts={["giá chỉ", "5,2 Tỷ", "đồng"]} />
</div></Sequence>
// am thanh: presetCues(def) -> SfxCue[] (frame@30, cong offset roi dua vao <SfxTrack>)
```
- `u` = cỡ chữ chính (px); `texts` ghi đè nội dung từng lớp theo thứ tự lớp.
- Chọn preset theo cột "Dùng cho" trong `references/catalog.md` (40 dòng: id, nội dung mẫu, mục đích, chuyển động).
- Xem tất cả: video `out/text-presets-40-danh-muc.mp4` (từng preset + âm thanh + mã số), `out/text-presets-40-trang.mp4` (4 trang như mẫu).

## Quy tắc chèn vào video BĐS
1. Một thời điểm chỉ một preset trong một vùng; đặt trong vùng an toàn TikTok (`src/lib/safeZone.ts`), tránh mặt người nói.
2. Thời lượng mỗi preset 1.5–3 s; bắt đầu ~0.1 s trước khi người nói nhắc từ khóa.
3. Hook đầu video: `b01-co-hoi`, `b06-dung-mua`, `d05-bi-quyet`, `a05-dang-goi`. Giá/số: `b02-tri-gia`, `c09-tiet-kiem`, `b08-1-can-ho`. Vị trí/tiện ích: `b03-vi-tri`, `a01-noi-bat`, `b05-khong-gian-xanh`. CTA: `d02-dang-ky`, `a06-bao-gia`, `a03-comment-so-hong`.
4. Âm thanh: dùng `presetCues` (tối đa 3 tiếng/preset); khi có nhiều preset liền nhau, giảm `master` volume của SfxTrack.

## Thành phần
- `engine.tsx`: bộ máy dựng theo cấu hình (lớp chữ + trang trí: swoosh, strike, ellipse, bar, phone) + gán SFX.
- `presets40.ts`: dữ liệu 40 preset. Thêm preset mới = thêm 1 object.
- `primitives.tsx`: TrackIn, CharPop, GlitchChars, ScriptWipe, DrawPath, ChipBox, glowFill.
- SFX tự tổng hợp: `public/sfx/` (pop, glitch, write, swish, click, ring, shimmer, hit, typing...), tạo bởi `scripts/make_sfx.py`.

## Mức xác minh
Xem `references/spec.md` (đặc điểm chung, chuyển động [XM]/[UD]) và `references/catalog.md`.
