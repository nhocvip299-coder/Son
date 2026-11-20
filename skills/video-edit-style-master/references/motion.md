# Motion graphics & chuyển cảnh
| Thành phần | Component | Cơ chế [XM] |
|---|---|---|
| Bùng sáng | `LightBurst` | lên 0,18 s (radial kem-trắng), giữ tới 0,3 s, tắt 0,6 s; đặt tâm ở mốc cắt (−0,18 s). Dùng ở ĐỔI CHỦ ĐỀ, không ở mọi cắt |
| Trang kính | `GlassPage` | video nhoè 26 px + phủ teal 3 nấc + 44 vệt sáng rơi + 36 hạt nháy + vòng tròn mờ giãn dần |
| Hạ giá | `PriceDrop` | dẫn → chữ ký viết → giá cũ bật (back-out) → gạch đỏ → "giảm còn" → giá mới đếm lùi + khung 4 góc + vòng loé |
| Bản đồ | `MapRoute` | lưới nghiêng 2 hướng + sông; ghim rơi xuống (back-out), nhãn viên thuốc; đường vẽ bằng dashoffset 1,3 s; huy hiệu vàng giữa đường; ghim đích |
| Vỡ dải | `StripSlide` | 10 dải dọc trượt lên lệch nhau 0,03 s, ease-in 0,45 s |
| Zoom nhoè | `ZoomBlurOut` | 0,35 s cuối: scale 1→1,35, blur 0→18 px |
| Thẻ kính | `GlassCard` | bật 0,55→1 (back-out 0,35 s), viền #8ff5ee + quầng; tiêu đề chữ ký đè góc; chip ✓ mỗi 0,3 s |
| Viên SĐT | `PhonePill` | bật giữa khung, gõ 0,08 s/số, sau ~2,4 s thu 0,68× + trượt xuống y 0,715, giữ tới hết |
| Grade | `TealOrange` | soft-light teal + làm tối đáy |
Easing: vào = back-out (0.34,1.56,0.64,1) cho khối, out-cubic cho chữ/đếm; ra = mờ + nhoè 0,3 s.
