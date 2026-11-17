# Nghiên cứu sâu text + hiệu ứng text — kênh mẫu @quyettranlux (2 video TikTok)

Nguồn đo: OCR Tesseract (tiếng Việt) 4 khung/giây trên toàn bộ 2 video (920 + 819 khung) → lọc theo transcript (chữ chèn luôn lặp lại lời nói ±3 s) → xem bằng mắt từng đoạn (`analysis/events/*.jpg`, mỗi đoạn 4 khung). Danh mục đầy đủ: `analysis/text_types.json`; SFX: `analysis/ref0*/sfx_by_text.json`.

## 1. Các loại text (theo mức độ xuất hiện)
| Loại | Ví dụ (thời điểm) | Cách hiện | Ghi chú |
|---|---|---|---|
| **Chữ chạy theo lời nói** (nhiều nhất) | "Có một / SỰ THẬT LÀ ở phía nam / HÀ NỘI" (ref01 0.7 s); "CHỦ ĐẦU TƯ MEYGROUP / của tập đoàn…" (43 s); "SỰ CHỊU CHI của dự án" (178.8 s) | từng mảnh hiện đúng lúc được nói; dòng nhỏ nghiêng trắng xen dòng lớn đứng thẳng màu kem #E8E6D6; dòng cuối hay căn phải | đặt ở khoảng trống: ngực, trần nhà, bầu trời |
| **Chữ trong suốt (âm bản)** | "HOÀNG MAI - HAI BÀ TRƯNG" (3.3 s), "AEDAS" (54.5 s), "CỰC KỲ HIẾM" (135.7 s), "96 CĂN DUPLEX" (155.5 s) | chữ hiện TRẮNG + quầng sáng, rồi từng ký tự TRÁI→PHẢI tan thành trong suốt; ruột chữ là cửa sổ nhìn sang MỘT LỚP VIDEO KHÁC (trời mây, đèn vàng, b-roll) | đã xác minh bằng ảnh phóng to: KHÔNG phải đảo màu |
| **Chữ sau lưng nhân vật (3D)** | "RIVEA RESIDENCES" (37.5 s), "ĐIỀU THỨ HAI" (74.2 s), "ALL IN ONE" (78.5 s), ref02 "NHƯ LÀ / CẢM XÚC" (5 s), "10 TRIỆU ĐÔ" (116 s), "164 HA" (128.6 s), "58M2" (172 s) | chữ lớn, ĐẬM, DÀY, người đứng che một phần | dùng khi không có khoảng trống, hoặc để nhấn mạnh |
| **Một chữ khổng lồ theo lời nhấn** | ref02 "ĐỂ" (18 s), "thực sự" (8.9 s) | 1 từ, rất to, sau đầu nhân vật, trong suốt | đúng từ nhân vật nhấn giọng |
| **2 dòng chéo nhau** | "ĐIỂM GIAO NHAU / VÔ CÙNG SÔI ĐỘNG" (5.6 s) | dòng 1 nghiêng xuống (~+7°), dòng 2 nghiêng lên (~−7°), trong suốt | minh họa nghĩa "giao nhau" |
| Ký tự bay ráp | "CHỖ ĐỖ XE ĐỊNH DANH" (167 s) | các ký tự lệch cao thấp rồi ráp thẳng hàng | |
| Từ xếp dọc | "TÒA / NHÀ / BIỂU / TƯỢNG" (194 s) | mỗi từ một dòng, cạnh nhân vật | |
| Gạch đầu dòng | "• TỐI ƯU ÁNH SÁNG • ĐẢM BẢO CÁCH ÂM - CÁCH NHIỆT" (198.8 s) | từng dòng hiện theo lời | |
| Chữ trên nền trắng | ref02 "họ chọn / SỨC KHỎE & CÂN BẰNG" (62.4 s), "một điểm / ĂN TIỀN NHẤT" (101 s) | chữ đen trên màn trắng | |
| Biểu tượng | "?" (ref02 48.3 s), quả địa cầu (132.5 s) | icon to + chữ | |
| Phụ đề nhỏ | gần như suốt video | cụm 3–7 tiếng, chữ thường | |

## 2. Hiệu ứng âm thanh theo loại text (đo năng lượng cao tần quanh mốc)
| Loại | SFX đo được | Gợi ý thư viện |
|---|---|---|
| Chữ chạy (dòng lớn) | gió sáng lấp lánh 0.4–0.6 s, +20…+50 dB cao tần; câu mở đầu/nhấn mạnh có thêm **bass thump** | sparkle / swish (+ impact nhỏ) |
| Chữ trong suốt, 2 dòng chéo | lấp lánh dài 0.4–0.65 s, rất sáng (+30…+50 dB) | sparkle |
| Chữ sau lưng nhân vật | lấp lánh + trầm (58M2, 164 HA); vài chỗ không có | sparkle + impact nhẹ |
| Một chữ khổng lồ | swoosh ngắn ~0.18 s | swish |
| Gạch đầu dòng | thump trầm rồi swoosh | impact + swish |
| Icon / chữ nền trắng | pop/click ngắn | pop |
| Chuyển cảnh vệt sáng cam / zoom nhòe | whoosh sáng 0.4–0.5 s | swish + sparkle (KHÔNG dùng whoosh.wav/shimmer.wav: thiếu cao tần, bị giọng nói lấp) |
~15 % mốc chữ không có SFX nghe được (chữ nhỏ, chữ phụ).

## 3. Trám (b-roll)
Mẫu chèn b-roll MỖI KHI nhắc tới thứ người xem không thấy: nguồn cung → drone thành phố đêm; không gian → flycam đất trống; Gia Lâm/Nam Từ Liêm → trang 2 ảnh; dự án → sa bàn, phối cảnh, nội thất; resort/golf → drone. Người dẫn quay lại khi nêu nhận định/kêu gọi.

## 4. Quy tắc đặt chữ với nhân vật (theo yêu cầu người dùng)
- KHÔNG đặt chữ lên mặt. Dùng `scripts/style/place_text.py` (vị trí mặt từng khung từ `person_matte.py`) — ưu tiên khoảng trống, rồi dưới cằm, rồi trên đầu, cuối cùng là SAU LƯNG.
- Chữ sau lưng nhân vật bắt buộc ĐẬM, DÀY (Montserrat 900, cỡ lớn) để vẫn đọc được khi bị che.
- Chữ âm bản đơn, to: đặt đúng các từ nhân vật NHẤN (đo âm lượng + cao độ + độ kéo dài so với ±3 s xung quanh).

## 5. Chuyển động chữ — đo TỪNG KHUNG (1/30 s) — `analysis/motion/z_*.jpg`
| Mẫu | Vào | Khi đứng | Ra |
|---|---|---|---|
| "SỰ THẬT LÀ" (ref01 0.70 s) | lao ngang từ PHẢI, vệt nhòe chuyển động ngang dài, ổn định sau **3 khung** | đứng yên; **bàn tay nhân vật đi ngang phía trước chữ** | theo nhát cắt |
| "HÀ NỘI" (1.70 s) | **tách màu RGB** + nhòe dọc, rõ sau **5 khung** | đứng yên | theo nhát cắt |
| "HỒ HOÀN KIẾM" (9.45 s) | **xoay 3D lao vào từ TRÁI** + nhòe, phẳng sau 5 khung; "HỒ" ánh xanh trong suốt | đứng yên | — |
| "HOÀNG MAI" (3.3 s) | ký tự bật ra | đứng yên; **vệt ánh kim vàng chạy qua ruột chữ** liên tục | — |
| "ĐỂ" khổng lồ (ref02 17.9 s) | bật ra | **bám theo camera** (lệch qua lại cùng khuôn mặt, ±20 px@540) | tắt gọn 2 khung |
Quy tắc: vào 3–5 khung, KHÔNG trôi lơ lửng, KHÔNG mờ dần chậm; chữ lớn luôn nằm SAU lớp người.
Cài đặt: `src/styles/quyetTranLux/kinetic.tsx` (QtKPiece slide/chroma/swing/pop/fade, QtKRun, QtTrack), `scripts/style/camera_track.py`, `scripts/style/frames_zoom.py`.

## 6. Danh mục KEYFRAME từ 6 video kênh (ref01–ref06, ~18 phút) — `analysis/keyframes/*.jpg`
Mỗi hàng ảnh = 1 khối chữ lớn: 10 khung lúc VÀO (1/30 s) + 6 khung lúc RA.
| Kiểu vào | Ví dụ | Thời lượng | Hay dùng cho |
|---|---|---|---|
| Quét mềm trái→phải (mép quét nhòe) | "CHOÁNG NGỢP", "THÔNG TẦNG" (ref03) | ~0.27 s | tính từ/cảm xúc chữ lớn |
| Lấy nét (nhòe→rõ, thu nhẹ) | "Đường kênh", "Đảm bảo" (ref05) | 0.2–0.3 s | danh từ ngắn, dòng phụ |
| Lao ngang + nhòe chuyển động | "SỰ THẬT LÀ" (ref01) | 0.1–0.17 s | câu mở |
| Tách màu RGB | "HÀ NỘI" | 0.17 s | địa danh |
| Xoay lao vào từ trái | "HỒ HOÀN KIẾM" | 0.17 s | dòng chốt |
| Ký tự bay ráp | "CHỖ ĐỖ XE ĐỊNH DANH" | 0.3 s | tiêu đề tính năng |
| Trắng → trong suốt có màu | "HOÀNG MAI", "AEDAS" | 0.4 s | tên riêng |
| Chữ nằm trên mặt đất bám flycam | "KIẾN TRÚC TÂN CỔ ĐIỂN" (ref06) | — | nhãn trên ảnh flycam |
| Sóng màu chạy qua chữ khi đứng | "Uppingham School" (ref05) | liên tục | tên tiện ích |
Ra: nhòe + mờ 0.2–0.3 s (phổ biến nhất), chớp sáng vàng/trắng, hoặc theo nhát cắt.
Trực quan: 3 thẻ ảnh so sánh (GARDEN/DUPLEX/PENTHOUSE), thẻ thông số nền xám, mặt bằng tầng, khối "CƠ CẤU SẢN PHẨM" gạch đầu dòng, nhãn bám trên flycam.

## 7. Storyboard trực quan đề xuất cho San Hô 09-2 (chờ duyệt)
| Giây | Lời nói | Hình + chữ |
|---|---|---|
| 0–4.4 | "tìm một căn liền kề vừa để ở mà vừa phù hợp kinh doanh" | hook: dòng nhỏ lấy nét; "CĂN LIỀN KỀ" vào từ trái; "KINH DOANH" vào từ phải; tránh mặt (trên đầu) |
| 5.5–8 | "căn liền kề San Hô 09-2" | chữ kính vàng "SAN HÔ / 09-2" từ dưới lên, phóng to |
| 8–15.8 | "căn góc, đất 132m², xây dựng 486,5m²" | thẻ thông số 2 dòng (đất / xây dựng) số đếm lên + viền lô góc |
| 16.7–19.6 | "4 tầng và 1 tum" | mặt cắt tòa nhà, tầng sáng dần T1→T4 + tum |
| 19.6–22.9 | "nằm giữa ngã 3, mặt tiền 8m" | sơ đồ NGÃ 3 (đường tự vẽ, lô góc nhấp nháy, kích thước 8M) |
| 23.6–29 | "tầng 1 kinh doanh, tầng trên homestay" | mặt cắt: T1 vàng KINH DOANH, T2–T4 xanh HOMESTAY (dải trống trên đầu) |
| 29–32 | "bàn giao thô, có cầu thang" | trang ghép 3 ảnh b-roll + "BÀN GIAO THÔ" |
| 32–34 | "vị trí siêu đặc địa" | chữ kính "SIÊU ĐẶC ĐỊA" sau lưng người |
| 34–42 | "cách 300m / 500m / 400m" | danh sách ghim, số mét đếm lên |
| 42–47 | "phương án thanh toán linh hoạt, đủ 3 phương án" | "LINH HOẠT" sau đầu + 3 thẻ 01/02/03 lật vào |
| 47–51 | "vừa kinh doanh vừa để ở" | biểu tượng cửa hàng ⇄ ngôi nhà ghép thành 1 (2 TRONG 1) |
| 51–54 | "Vinhomes Ocean Park 2" | chữ kính vàng sau lưng người |
| 54–57 | "liên hệ em Sơn" | thẻ liên hệ (tên kênh người dùng) |
