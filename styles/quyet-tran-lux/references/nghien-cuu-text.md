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
