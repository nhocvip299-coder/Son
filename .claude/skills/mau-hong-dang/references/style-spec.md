# Đặc tả "Mẫu Hồng Đăng"

Ký hiệu: **[XM]** đã xác minh trên keyframe/số đo · **[UD]** ước đoán, cần xác nhận với nguồn gốc.

## Dữ liệu nguồn (ffprobe) [XM]
| | ref1 | ref2 |
|---|---|---|
| Thời lượng | 71.6 s | 119.5 s |
| Hình | HEVC 1080x1920 59.94fps | H.264 576x1024 30fps |
| Âm | AAC 44.1k | AAC 44.1k |
| Điểm cắt | 17 (14.2/phút), shot TB 3.98 s | 26 (13.1/phút), trung vị 2.8 s |
| Sự kiện chữ (phát hiện tự động) | 2 | 19 |
Chi tiết: `styles/hong-dang/analysis/ref*/analysis.json`, contact sheet cùng thư mục.

## Typography
| Thành phần | Thông số | Mức |
|---|---|---|
| Font chữ khóa | Sans hình học siêu đậm, IN HOA (ước lượng: Montserrat 900 / SVN-Gilroy Black) | [UD] font |
| Màu chữ khóa | gradient dọc #04EFFB → #07B0F2 | [XM] |
| Màu nhấn phụ | vàng ~#F4F205 (thẻ câu hỏi, số tiền) | [XM] |
| Dòng dẫn | trắng, nhỏ (~1/3 cỡ chữ khóa), chữ thường, có thể nghiêng | [XM] vị trí / [UD] nghiêng |
| Bóng | bóng đổ mềm tối, không stroke | [XM] |
| Âm bản / nháy trắng | không thấy chữ âm bản; có 5 lần nháy sáng ở ref2 khi chuyển cảnh | [XM] |
| Vị trí chữ khóa | 0.58–0.68H, có lúc lệch trái (~0.3W) cạnh tay người nói | [XM] |
| Thẻ câu hỏi | hộp tối ~55% opacity bo góc, ~0.62H | [XM] |
| Số lớn | ~0.15–0.2H, vàng, pop-in | [XM] |
| Watermark | 2 dòng, ~0.07W/0.775H, trắng mờ | [XM] |

## Chuyển động
| Hiệu ứng | Mô tả | Mức |
|---|---|---|
| Keyword reveal | hiện từng ký tự trái→phải | [XM]; easing spring + rơi nhẹ từ trên [UD] |
| Icon 3D | "$" đùn khối cyan xoay liên tục quanh trục Y + tam giác chỉ xuống nhấp nháy | [XM] hình; tốc độ ~1 vòng/1.5 s [UD] |
| Thẻ câu hỏi | gõ dòng 1 rồi dòng 2 | [XM] |
| Số lớn | mờ→rõ + phóng (strip 0.25 s/khung) | [XM] xuất hiện; overshoot [UD] |
| Bản đồ HUD | push-in + xoay nhẹ, viền phát sáng, callout + leader line, nhãn nghiêng ~-12° | [XM] tĩnh; tốc độ vẽ viền [UD] |
| PiP | thẻ ảnh bo góc góc trên phải, viền sáng | [XM] vị trí; animation vào [UD] |
| Chuyển cảnh | chủ yếu cắt cứng, punch-in toàn↔cận | [XM] |

## Âm thanh
- Onset ~43–49/phút nhưng chỉ 24–27% điểm cắt trùng onset → **SFX không bám điểm cắt** [XM].
- Loại SFX cụ thể (pop/whoosh), có nhạc nền hay không: **chưa tách được khỏi giọng nói** [UD]. Video kiểm chứng dùng SFX tự tổng hợp làm gợi ý.

## Tư duy nhấn mạnh [UD, suy từ nội dung keyframe]
Chỉ hiển thị khái niệm then chốt (chi phí, giá "5 TỶ", "METRO", vị trí "HÒA LẠC", "MÔ HÌNH ALL-IN-ONE"); câu hỏi gợi tò mò ở đầu đoạn; bản đồ minh họa vị trí ngay khi nhắc địa danh.

## Chưa tái tạo được
- Footage người nói thật, ảnh vệ tinh thật (dùng nền giả lập).
- Font gốc chính xác; SFX/nhạc gốc.
- Hiệu ứng "CHUYÊN GIA" (ref2 ~103.9 s) chưa đọc đủ khung để xác minh.
- Kiểm chứng vòng 2: `styles/hong-dang/analysis/verify/compare_round2.jpg` (hàng trên = mẫu, dưới = bản dựng).
