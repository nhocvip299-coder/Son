# Nghiên cứu 3 mẫu mới (ref07–09) — kênh @quyettranlux

Nguồn: `reference/quyet-tran-lux/sources.json` (video không đưa lên Git). Phân tích: `styles/quyet-tran-lux/analysis/ref07..09/` (contact_sheet, grid/ 1 khung/2 s, strips/ 0.1 s/khung, text/ OCR, sfx_onsets.json).

## ref07 — "Từ sân bay về Quận 2…" (79 s) → style C "Hạ tầng trắng"
- Bối cảnh: diễn giả trên sân khấu sự kiện + bản đồ kết nối; **trám b-roll thật cho MỌI địa danh được nhắc** (sân bay Long Thành 16–21 s, cảng Cái Mép 44–47 s, tàu khách 40 s, cao tốc 54–60 s). Quy tắc: nhắc địa danh nào → hình địa danh đó ngay lúc nói.
- Chữ: trắng đậm (sans dày kiểu SF/Be Vietnam 800), **dòng dẫn nhỏ phía trên** ("khai thác giai đoạn" / **"Đầu tiên"** 19.4 s; "chỉ chiếm" / **"2% - 3%"** 33–35 s).
- Keyframe vào (strip 19.0–20.4 s): chữ to hơn ~30 %, nhòe, lệch dưới-phải, độ mờ thấp → 0.3 s sau về đúng chỗ, nét → kiểu `zoomSettle`.
- Phụ đề: trắng nhỏ, chữ thường, bóng mềm, không hộp, ~0.78H.
- Chuyển cảnh mở đầu: **nháy trắng** toàn khung 0.8–2.0 s (0.12 s lên, 0.35 s tan).
- Logo kênh "Q." góc trên phải (KHÔNG sao chép).

## ref08 — "Tiêu chuẩn HẠNG SANG được đo bằng gì?" (172 s) → style B "Bóc tách số liệu"
- Bối cảnh: phỏng vấn studio (ghế cam, tường gỗ) xen render dự án.
- Chữ chính: **IN HOA dựng hẹp đậm màu xanh bạc hà** (#45f2d2), bóng tối mềm; quầng sáng **loé mạnh rồi dịu** ("THƯỚC ĐO" 21.0→21.3 s), dòng phụ trắng nhỏ hiện sau 0.6 s ("tiêu chuẩn HẠNG SANG").
- Bố cục đa dạng: dẫn trắng + CHÍNH ("và các phân khúc / HẠNG SANG"), CHÍNH + phụ ("8 NĂM / làm bất động sản cao cấp"), **2 dòng so le chéo** ("HẠNG SANG / ĐẲNG CẤP" 8 s), số lớn + phụ ("1 SÀN / -4-6 căn" 98 s), dòng trắng có số tô bạc hà ("Tổng diện tích **30.6 HA**" 36 s), nghiêng ("Bảo Chứng" 154 s).
- **"3KM" gõ từng ký tự** (3 → 3K → 3KM, 93.3–93.4 s) + "công viên sinh thái" trượt vào dưới; chữ **bám theo cảnh** (camera bay, chữ di chuyển cùng mặt nước).
- Chữ đặt cả trên ngực nhân vật, cả **phía sau đầu** ("TIÊU CHUẨN" 44 s) — tránh mặt.
- **Card ảnh bo góc** bật lên cạnh đầu kèm nhãn bạc hà phía trên ("Serenity Sky Villas (2015)" 54 s); 2 card nghiêng chồng ("SVĐ Rạch Chiếc / The Global City" 76 s); trang nền nhòe + 2 card xếp dọc + tiêu đề ("Ngôn ngữ nội thất" 138 s).
- Chuyển cảnh: **lia máy nhòe** giữa 2 render (41.0–42.0 s); nhòe cả khung khi chuyển ý (18 s, 48 s).
- Phụ đề: **chữ trắng trong hộp tối trong mờ bo góc**.
- SFX (sfx_onsets.json): tiếng "ting" sáng cao tần đúng lúc tiêu đề (0.02, 2.03, 7.23/7.80 hai nhịp cho 2 dòng, 12.06/12.55, 20.82 s…), whoosh ở chuyển cảnh (9.24, 19.34 s).

## ref09 — "68 đồng | Define | Capitaland" (39 s) → style D "Điện ảnh"
- Video ngang 2.39:1 đặt giữa khung dọc, nền đen trên/dưới (letterbox), nhạc là chính, không phụ đề.
- Mở đầu 0–2.6 s: **tiêu đề serif mảnh giãn chữ** "DEFINE CAPITALAND" khép dần + **khung viền mảnh** góc dưới phải "4PN - 325m2 / 68.000.000.000".
- Watermark chữ nhỏ góc phải trên thanh hình. Nhịp cắt theo nhạc (~2 s/cảnh), ngày → đêm.

## Áp dụng khi footage KHÔNG có b-roll (như San Hô 09-2)
| Ý trong lời nói | Trám bằng chính footage |
|---|---|
| số tầng / thiết kế | **đóng băng** khung quay toà nhà + vạch quét từng tầng (`FreezeScan`) |
| tên căn / dự án | **card ảnh** cắt từ khung quay mặt tiền (`PhotoCard`) |
| khoảng cách đến tiện ích | số khoảng cách **sơn trên mặt đường** phối cảnh, người đứng trước chữ (`RoadText` + `QtPersonFront`), tên tiện ích bạc hà trên khoảng trời |
| đổi chủ đề | lia máy nhòe (`WhipBlur`) / nháy trắng (`WhiteFlash`) |
