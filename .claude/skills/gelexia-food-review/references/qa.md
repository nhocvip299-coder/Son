# QA Gelexia

## Trước xuất toàn bộ

1. Chạy check_project.py và check_style.py trên project thật. Đợi hai font tải xong trước đo chữ/render.
2. Đo dòng bằng browser: không quá vùng 760, tối đa hai dòng, không tự co font 56 xuống 46 hoặc kéo ngang.
3. So cận chữ chính trên cảnh đường và món ăn: Phudu 800, vàng ấm theo IMG_7589, viền tối mảnh + cạnh ngắn 1–2 px; chữ phụ không bị đùn theo. Xem thêm ở kích thước điện thoại, kiểm tra dấu Việt và lòng chữ không bị bít. Xem ảnh đầu/giữa/cuối của mỗi vai trò ở cùng kích thước với nguồn chuẩn. Không chỉ xem một ảnh mở đầu.
4. Xem clip vào–giữ–ra của header, caption, intro, route, food, CTA ở tốc độ thật và từng frame. So ở các mốc trước/0,1/0,2/0,4/0,8 giây từ lúc bắt đầu.
5. Nền và các dòng phải là một khối: cùng scale/translate/opacity, mép chữ so với nền không trượt. Không có nhấp nháy khi đổi từ vàng.
6. Caption một/hai dòng giữ cùng đường đáy. Ngắt trang theo ý, không đơn thuần đủ 8 từ. Không trang/word thời lượng 0.
7. Header không đè callout; chữ không vào UI TikTok/Reels. Xem cảnh đồ ăn để tránh che chi tiết chính.
8. Soát A/V, địa chỉ, tên riêng, dấu Việt, cảnh bị loại. Không thêm trải nghiệm nếm khi chỉ có cảnh đóng hộp.

## Sau xuất

- Dùng ffprobe kiểm tra duration/size/fps/audio. Xem hình và tiếng cuối không bị cắt.
- Xem lại chuyển động từ file MP4 cuối, không chỉ preview.
- Chỉ lưu/giao sau khi xử lý lỗi; nêu giới hạn nếu chưa đối chiếu đủ.

## Lỗi cần ngăn lặp

- Cạnh nâu đùn dày, vàng cam bão hòa hoặc highlight kim loại khác ảnh IMG_7589.
- Tự thêm bóng elip của đèn đường vào bảng chữ; phải xem chuyển động cảnh để phân biệt.
- Dựng theo ảnh tĩnh, giống màu/phông nhưng thiếu motion cả khối.
- Chữ scale trên nền đứng yên; nền và chữ fade không cùng nhịp.
- Co font từng câu, thay độ đậm/cỡ chữ không có quy tắc.
- Nền cố định quá rộng cho câu ngắn hoặc đổi line-height/đường đáy tùy trang.
- Mọi callout đều là tiêu đề vàng + giải thích trắng; thiếu nhãn đường gọn, nhấn món và thẻ kết.
- Quá nhiều bảng lặp phụ đề, không khoảng nghỉ.
- Tự chèn logo tham khảo, tái dùng đường đi/quán cũ trong tập khác.
- Lấy bản Adam phái sinh làm mẫu đã duyệt; tuyên bố khớp tuyệt đối từ một screenshot.

## Forward-test

Giao skill và lời thoại/địa điểm mới cho một phiên độc lập; không đưa chẩn đoán hoặc đáp án. Kiểm tra phiên đó tìm đúng mẫu, giữ bốn vai trò, không co font, không dùng logo/lộ trình cũ, và biết giới hạn thông số tái dựng.
