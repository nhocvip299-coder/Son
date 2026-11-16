---
name: text-presets-bds
description: Bộ 10 preset chữ động kiểu "CapCut text presets" cho video bất động sản dựng bằng Remotion — chữ phát sáng gradient, 3 tầng chữ (viết tay + đậm + serif), tracking-in, hiện từng ký tự, glitch, chữ viết tay hiện dần, gạch chân cong, gạch ngang đỏ, chip nhãn. Dùng khi người dùng muốn chèn chữ "trendy", "kiểu CapCut", chữ neon/glow, nhãn giá/diện tích/vị trí nổi bật, hoặc nhắc tới "text preset" trong video BĐS hay video ngắn.
---

# Text Presets BĐS

Học từ video quảng cáo "40 Text Presets" (người dùng gửi, `inputs/source3.mov`, chỉ đọc). Phân tích + ảnh so sánh: `styles/text-presets/analysis/`.

## Components (`src/styles/textPresets/presets.tsx`)
| Preset | Dùng cho | Chuyển động chính |
|---|---|---|
| `TpTrackHeader` | Tiêu đề chủ đề ("Bất động sản / Đáng sống") | tracking-in + viết tay |
| `TpOpportunity` | Hook kêu gọi ("Hãy nắm bắt / Cơ hội / Ngay bây giờ") | serif sáng + viết tay 2 phía |
| `TpValueSwoosh` | Giá trị ("trị giá / 100 Triệu / đồng") | hiện từng ký tự + gạch chân cong |
| `TpLabelChip` | Nhãn ("Vị Trí / trung tâm đắc địa") | chip mở ngang |
| `TpBigNumeral` | Số lượng ("1 Căn Hộ Đáng sống") | số nghiêng lớn + gạch cong |
| `TpEllipseTag` | Tiện ích ("Không Gian xanh") | chữ bậc thang + vòng elip vẽ dần |
| `TpGlitchValue` | Số tiết kiệm/giảm ("Tiết kiệm 50 TRIỆU") | glitch RGB |
| `TpStrike` | Cảnh báo/giá cũ ("Cẩn Thận") | gạch đỏ, chữ chuyển đỏ |
| `TpHighlightBlock` | Câu hỏi ("Tại sao? Nên mua ngay") | khối highlight quét |
| `TpGlitchChip` | Tag ("HOT TREND") | chip cyan + glitch |

Primitives tái dùng: `TrackIn`, `CharPop`, `GlitchChars`, `ScriptWipe`, `DrawPath`, `ChipBox`, `glowFill`, `solidGlow` (`primitives.tsx`). Timing theo frame@30.

## Cách dùng
- Đặt preset trong `<Sequence>` và bọc `div` định vị (`position:absolute; left/top`). Tham số `u` = cỡ chữ chính (px), `delay` = frame@30.
- Giữ trong vùng an toàn (`src/lib/safeZone.ts`), không chồng với chữ khác cùng lúc.
- Demo: composition `TextPresetsGallery` → `out/text-presets-bds-demo.mp4`.
- Dùng kèm `mau-hong-dang`: thay `HdKeywordReveal` bằng preset phù hợp khi muốn phong cách "trendy" hơn.

## Lưu ý kỹ thuật
- Gradient `background-clip:text` phải đặt trên TỪNG ký tự khi tách ký tự (đã xử lý trong `splitPaint`), nếu không chữ vô hình.
- Luôn chừa padding trên cho dấu tiếng Việt khi dùng gradient.
- Chi tiết, mức độ xác minh: `references/spec.md`.
