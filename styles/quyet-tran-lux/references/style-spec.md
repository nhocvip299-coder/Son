# Đặc tả "Mẫu Quyết Trần Lux" (BĐS cao cấp, điện ảnh)

Ký hiệu: **[XM]** đã xác minh bằng số đo/khung hình · **[UD]** ước đoán, cần xác nhận.
Nguồn: 2 video TikTok của kênh @quyettranlux (link trong `reference/quyet-tran-lux/sources.json`, video không đưa lên Git).

## Dữ liệu nguồn [XM]
| | ref01 (Rivea Residences) | ref02 (IXORA 2 Beachfront Villa) |
|---|---|---|
| Thời lượng | 230.2 s | 204.6 s |
| Gốc | HEVC 1080x1920 30 fps | HEVC 1080x1920 30 fps |
| Điểm cắt | 59 (15.4/phút), shot trung vị 3.25 s | 42 (12.3/phút), trung vị 4.5 s |
| Nháy sáng (flash) | 6 (1.6/phút) | 4 (1.2/phút) |
| Onset âm thanh | 75.6/phút | 58.1/phút |
Chi tiết: `styles/quyet-tran-lux/analysis/ref0*/analysis.json`, contact sheet, `strips/`, `frames/`.

## Tổng quan cảm giác
Sang trọng, tiết chế, "điện ảnh": footage đẹp (mô hình sa bàn ánh vàng, drone biển, nội thất), người dẫn mặc vest. **Không** có màu chói, viền, sticker hay chữ nhảy múa. Chữ trắng, bóng mềm, xuất hiện thưa và nhẹ.

## Typography
| Thành phần | Thông số | Mức |
|---|---|---|
| Font | Sans hình học (Montserrat): dòng dẫn **500 nghiêng**, từ khóa **800 nghiêng** | [XM] dáng chữ / [UD] đúng tên font |
| Màu chữ | trắng ~#F8F9FD; trên nền sáng đổi sang đen ~#111214 (không viền) | [XM] |
| Bóng | đổ mềm tối, lan rộng, không stroke | [XM] hình / [UD] thông số |
| Tiêu đề 2 dòng | dẫn nhỏ (≈0.66× cỡ chính) + CHÍNH IN HOA ~108px; căn giữa; y ≈ 0.57/0.62H ("IXORA 2 có / 63 CĂN") hoặc 0.16/0.21H ("sân golf / THE BLUFFS") | [XM] |
| Số liệu | căn trái x≈0.22–0.25W, y≈0.62H; dẫn rất nhỏ nghiêng mờ + SỐ ~108px đậm, đơn vị mũ IN HOA ("224 - 300 M²") | [XM] |
| Tiêu đề mục | IN HOA 800 không nghiêng ~54px, căn giữa ("DANH SÁCH ĐƠN VỊ TƯ VẤN", "SỨC KHỎE & CÂN BẰNG") | [XM] |
| Phụ đề | **chạy liên tục theo cụm 3–7 tiếng**, chữ thường, trắng ~38px, nhẹ (400), y ≈ 0.53H (lên 0.22–0.3H khi nửa dưới bận); hiện đúng lúc tiếng đầu cụm được nói, ngắt ở từ mở đầu mệnh đề ("Trong khi đó"@10.0 s, "Anh chị hãy nhìn vào"@49.6 s, "Như là"@86.8 s). **Bị thay** bằng tiêu đề lớn khi tới cụm khóa ("danh sách đơn vị tư vấn" → heading @50.3 s; "Trần cao tới 6.8" → thẻ ảnh @162.4 s) | [XM] transcript ref01 |
| Trang ghép ảnh | nền gradient xám tối (#3a3a3c→#0e0e10), 3 thẻ ảnh 0.81W × 0.258H, khe 0.008H, viền trắng ~3px; tiêu đề IN HOA dọc trên-trái thẻ 1 ("TRẦN / CAO / 6.8 m"), nhãn nhỏ dưới-phải thẻ 2 ("HỒ BƠI RIÊNG") | [XM] |
| Màn chữ trên nền tối | gradient đen-xám, chữ nhỏ giữa màn ("như là") | [XM] |

## Hook 0–10 s (ref01) — bổ sung sau góp ý người dùng [XM]
| Mốc | Hiệu ứng |
|---|---|
| 0.7–1.9 s | **Chữ chạy theo lời nói**: "Có một" (nhỏ nghiêng trắng) → "SỰ THẬT LÀ" (lớn đứng thẳng, kem #E8E6D6 đo pixel) → "ở phía nam" (nhỏ, cuối dòng) → "HÀ NỘI" (lớn, căn phải, hiện nhòe/âm bản rồi rõ); mỗi mảnh trễ ≤0.1 s so với lời |
| 2.5–4.3 s | "Khu vực giao giữa" + **"HOÀNG MAI - HAI BÀ TRƯNG" âm bản** (ruột chữ đảo màu nền), sát trên trái 0.1H |
| 5.6–7.0 s | **"ĐIỂM GIAO NHAU" (nghiêng xuống ~+7°) / "VÔ CÙNG SÔI ĐỘNG" (nghiêng lên ~-7°)**: 2 dòng chéo nhau minh họa chữ "giao nhau", âm bản + quầng trắng, hiện từng ký tự rải rác |
| 7.6–9.6 s | "Chỉ mất chưa đến **10 PHÚT** / để đến / **HỒ HOÀN KIẾM**": chữ chạy; dòng cuối lao từ trái vào, nhòe chuyển động, ánh âm bản xanh |
| 10.0 s | nháy trắng + whoosh sang b-roll |

## Chuyển động
| Hiệu ứng | Mô tả | Mức |
|---|---|---|
| Blur-rise | mờ + nhòe → rõ, trồi lên ~25px, ~0.4 s, ease-out; dòng chính trễ ~0.2 s so với dòng dẫn | [XM] strip r2_63can |
| Thoát | mờ dần + nhòe ~0.3 s ("164 HA" 130.6→130.9 s) | [XM] |
| Tracking reveal | từng ký tự hiện rải rác, giãn chữ khép lại trong ~0.6 s ("THE BLUFFS") | [XM] strip r2_bluffs |
| Dip qua đen | nền trắng → đen → video sáng dần ~0.5 s, chữ giữ nguyên | [XM] strip r2_suckhoe |
| Nháy trắng | ~1.2–1.6 lần/phút ở điểm cắt | [XM] |
| Thẻ ảnh | xuất hiện ngay sau nháy trắng; tiêu đề hiện từng dòng | [XM] / cách thẻ vào [UD] |
| Logo kênh "Q" xoay ở trên | là nhận diện của kênh mẫu → **không tái tạo** | — |

## Âm thanh
- Mỗi nháy trắng và mỗi tiêu đề có SFX rõ: năng lượng cao tần +14…+30 dB quanh mốc [XM] → whoosh/shimmer/shine.
- Có **nhạc nền suốt video**: đoạn nhỏ nhất chỉ thấp hơn trung vị ~13 dB [XM]. Loại nhạc: piano/ambient sang trọng [UD].
- SFX không bám mọi điểm cắt (chỉ 25% điểm cắt trùng onset) [XM].

## Đồng bộ với lời nói [XM]
Chữ lớn xuất hiện **trùng tiếng đầu tiên** của cụm khóa (lệch ≤0.1 s): số "224 - 300 m²" khi nói "224"; nhãn "HỒ BƠI RIÊNG" khi nói "hồ" (164.1 s). Dòng dẫn chữ nhỏ là chính lời vừa nói trước con số ("Mỗi căn rộng từ").

## Tư duy nhấn mạnh
Chỉ đưa lên màn hình: **con số** (63 căn, 164 ha, 224–300 m², 6.8 m), **tên riêng** (IXORA 2, THE BLUFFS), **tên mục/đặc quyền** (SỨC KHỎE & CÂN BẰNG, CHỖ ĐỖ XE ĐỊNH DANH, HỒ BƠI RIÊNG), và phụ đề ngắn cho câu dẫn ("Anh chị hãy nhìn vào", "Trong khi đó"). [XM qua keyframe; xem transcript `work/qtl-ref0*/` nếu có]

## Component tương ứng (`src/styles/quyetTranLux/components.tsx`)
`QtPhraseCaptions` (phụ đề cụm, tự ẩn trong khoảng `mute` khi có tiêu đề lớn), `QtTitle`, `QtTrackingReveal`, `QtNumber`, `QtHeading`, `QtSubtitle`, `QtCardStack`, `QtDarkCard`, `QtFlash`, `QtDip`, `QtGrade`.

## Kiểm chứng
- Vòng 1 → 2: tăng cỡ chữ chính ~15–20 %, dòng dẫn 0.56→0.66×, heading 700→800, số 84→108px + đơn vị IN HOA, thẻ ảnh cao hơn/khe hẹp hơn.
- `styles/quyet-tran-lux/analysis/verify/compare_round2.jpg` (hàng trên = mẫu, dưới = bản dựng).

## Chưa tái tạo được
- Font gốc chính xác; nhạc nền và SFX gốc.
- Cách thẻ ảnh vào (bị nháy trắng che).
- Chữ trên nền sáng tự đổi màu: hiện phải đặt `dark` thủ công.
- Ngắt cụm phụ đề đôi khi tách từ ghép ("danh sách đơn | vị") vì Whisper không cho khoảng nghỉ giữa âm tiết [UD] — sửa tay nếu cụm đó không bị tiêu đề che.
