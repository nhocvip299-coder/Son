# Chuẩn Gelexia

## Nguồn và mức chắc chắn

Nguồn: `Mo_Lang_Review_Com_Tam_Suon_Khoi_4K60.mp4`, 53,5 giây, 2160×3840, 60 fps, Library version 2. Xem source.json. Không thay bằng video TikTok khác hay các bản Adam phái sinh đã bị góp ý.

Layout dưới đây ghi lại từ quy trình Gelexia và đối chiếu hình. Spring trong template là điểm khởi đầu tái dựng, chưa có mã gốc để chứng minh thông số giống tuyệt đối. Video chuẩn luôn có ưu tiên cao hơn template.

## Token layout (sân khấu 1080×1920)

| Vai trò | Chuẩn |
|---|---|
| Phụ đề | trái 90/phải 230/đáy 574; max-width 760; Phudu 56, weight 800; line-height 1.12; tối đa 2 dòng |
| Intro/cảm xúc | trái 90/phải 230/top 455; Phudu 70; chữ phụ Be Vietnam Pro 28 |
| Nhãn đường | cùng vùng chữ nhấn; Phudu 60; dòng phụ chỉ khi cần |
| Nhấn món | Phudu 70, ngắn, thường một dòng; không mặc định dòng giải thích |
| Ghim địa điểm | trái 90/top 275; pin 40×52; tên Phudu 37; địa chỉ Be Vietnam Pro 23; nền gọn |
| Thẻ kết | trái 100/phải 230/top khoảng 475; tên trắng, số/địa chỉ chính vàng; tách phụ đề |

Scale toàn sân khấu, không scale font riêng. Dùng Phudu variable đính kèm, không giả đậm bằng stroke lớn. Kiểm tra dấu tiếng Việt và family thực tế sau tải font.

## Màu/nền theo ảnh IMG_7589

- Chuẩn trực quan mới nhất: `assets/reference/IMG_7589-user-reference.jpeg`; đối chiếu chuỗi 5,3–5,7 giây của clip gốc, không chỉ một ảnh.
- Mặt chữ vàng ấm `#ffdd66`, trắng `#ffffff`. Trong crop 4K của “SƯỜN” ở 5,4s, vùng mặt vàng có median RGB ~255/221/101; đây là màu pixel đã nén, token #ffdd66 là tái dựng gần, không phải mã gốc trích xuất. JPEG màn hình có sai lệch màu; không ép độ bão hòa cao như #ffd42a.
- Phudu weight 800 là điểm tái dựng khớp hình tốt hơn bản 900 trong đối chiếu mask 600/700/800/900. Không khẳng định biết metadata font gốc. Dùng cùng weight/cỡ cho toàn hệ thống, không giả đậm hoặc kéo ngang.
- Viền tối mảnh 0,85 px logical, `paintOrder: stroke fill`; mặt glyph giữ kích thước. Cạnh nổi ngắn 1–2 px đổ xuống, bóng tối mềm sát chân chữ. Không cạnh vàng nâu dày 5 px, không highlight bóng kim loại.
- Nền `rgba(48,51,48,.44)`, bo caption ~12, callout ~20; CTA ~.63. Caption padding 14 dọc/20 ngang; nền đo theo nội dung, tối đa 760.
- Be Vietnam Pro cho chữ phụ/địa chỉ vẫn phẳng. Logo chỉ dùng khi tập mới được giao logo.
- **Không thêm bóng elip dưới bảng**: chuỗi gốc 5,3–5,7s cho thấy đó là bóng đèn đường đi xuống theo chuyển động xe, còn bảng đứng yên. Không coi chi tiết cảnh quay này là template.
- Baseline caption điều chỉnh xuống 6 logical px so với bản tái dựng cũ (đáy 574), theo đối chiếu mask mặt chữ. Không dùng UI iOS/khung screenshot làm vùng video.

## Bốn vai trò trong video chuẩn

1. Đầu clip (~0,5–2 giây): thẻ “GELEXIA / TAM TRINH”, dòng phụ “Trưa nay ăn gì?”.
2. Đường đi (~8 giây): “VIỆN PHÁP Y”; ~12 giây “NGÃ TƯ TAM TRINH”. Nhãn gọn, mục đích định hướng.
3. Món ăn (~24 giây): “KHÓI NGHI NGÚT”; ~32 giây “THÊM MỠ HÀNH!”. Nhấn ngắn, không cần thẻ diễn giải lớn.
4. Kết (~48–52 giây): thẻ lưu địa chỉ có tên quán và số nhà phân cấp trắng/vàng.

Các mốc chỉ giúp tìm mẫu, không ép tập mới dùng lịch đó. Đặt thời gian mới theo tiếng/cảnh.

## Chuyển động

- Header trượt nhẹ từ trái, tăng opacity, rồi đứng yên xuyên clip.
- Caption: cả nền và câu đi lên nhẹ/tăng opacity khi đổi trang. Trong trang chỉ đổi màu từ đang đọc; không nảy lại theo mỗi từ.
- Callout: scale/translate/opacity trên **một parent** chứa nền và toàn bộ chữ. Bật nhẹ rồi ổn định, không rung liên tục/mỗi dòng một easing.
- Ra chữ đồng bộ cả khối. Không để nền lưu lại hoặc biến mất trước chữ.
- Xen đoạn chỉ có phụ đề. Chọn callout theo ý nghĩa, không nhân đôi toàn bộ lời thoại trên–dưới.
- Giữ cùng motion token trong một vai trò. Không chữa chữ dài bằng đổi cỡ/scaleX.

## Trạng thái template

Template bảo đảm các ràng buộc hệ thống và wrapper chung; không đại diện một bản render được Sơn duyệt. Khi dùng lần đầu/đổi engine, kiểm tra clip chuyển động cạnh video chuẩn. ASS/FFmpeg có thể dùng ghép/encode; không âm thầm thay motion bằng chữ ASS rồi gọi là cùng mẫu.
