# Viết kịch bản lời thoại cho ElevenLabs (đã chốt với Sơn)

Chỉ viết kịch bản khi được yêu cầu; **không tự dựng video** cho tới khi Sơn gửi file mp3 và ra lệnh edit.

## 1. Thu thông tin trước (hỏi nếu thiếu)
- Tên quán / tên gọi trên biển, **địa chỉ đầy đủ** (số nhà, ngõ, tổ, phường, thành phố).
- **Giá** và giá đã gồm gì (vd "15K cả quẩy"), khoảng giá menu nếu có.
- **Giờ bán** (sáng / chiều tối…), chỗ đỗ xe nếu có căn cứ.
- **Cảm nhận vị thật** của Sơn (vd "nóng hổi, ngọt thỉu"). Không tự bịa vị, dịch vụ, điểm số — câu chưa có căn cứ phải liệt kê cuối tin nhắn để Sơn xác nhận.
- Xem footage trước (contact sheet) để lời bám đúng cảnh: đường đi, mặt tiền, cách làm, món, ăn, vét bát.

## 2. Cấu trúc (học từ video mẫu "Cơm tấm sườn khói" + yêu cầu TikTok)
1. **Hook 2 giây đầu**: giá + món + khu vực ngay câu đầu ("Mười lăm nghìn một bát cháo trai… ngay giữa Tương Mai Hà Nội") + câu khiêu khích.
2. **Hành trình/vị trí**: kể đường vào theo cảnh quay (ngõ, chợ, mốc dễ nhận), giọng vênh váo.
3. **Đến nơi + đọc địa chỉ lần 1**.
4. **Soi cách làm** (nguyên liệu, làm tại chỗ) → **chất lượng món** (theo cảm nhận thật) → **giá** ("… mà lèo tèo thì tao quay xe").
5. **Dịch vụ/trải nghiệm** có căn cứ (ghế vỉa hè, bưng ra nhanh, giờ bán…).
6. **Chấm điểm**: "chấm 9 điểm, trừ 1 điểm vì…/để lần sau soi tiếp".
7. **CTA**: câu hỏi kéo comment ("Hà Nội còn chỗ nào 15K ngon hơn không?") + lưu lại + tag bạn + **đọc địa chỉ lần 2** + câu kết nối lại hook (vòng lặp: "Mười lăm nghìn đấy, nghe chưa!").

Yếu tố TikTok: từ khóa món/giá/phường/thành phố được **đọc to** và có trên chữ màn hình; câu hỏi gây comment; kêu gọi lưu/tag; kết vòng lặp. Không hứa lên xu hướng.

## 2b. Tiêu chí TikTok "Đăng về địa điểm" (Sơn gửi ảnh hướng dẫn TikTok 24/11 — bắt buộc đủ)
1. **Giới thiệu địa điểm** bằng cả 3 kênh: **âm thanh** (đọc tên quán + địa chỉ), **video** (chữ trên màn hình, kiểu "Mới đến quán … hôm nay!"/ghim địa chỉ), **mô tả** (caption có địa chỉ); nhắc Sơn **gắn thẻ vị trí** khi đăng.
2. **Chia sẻ thêm về địa điểm**, mỗi mục ít nhất một câu:
   - Ẩm thực/sản phẩm, **dịch vụ**, **bầu không khí**, hoạt động.
   - **Thông tin hữu ích**: giá (và giá gồm gì, topping gọi thêm), **ưu đãi** nếu có, **chỉ đường**, **mẹo** (giờ mở cửa, chỗ để xe, nên gọi gì).
   - **Trải nghiệm cá nhân** của người review.
Checklist trước khi giao kịch bản: tên quán · địa chỉ đọc 2 lần · chỉ đường · giá + topping · giờ mở · để xe · không khí · dịch vụ · vị (đã xác nhận) · mẹo · trải nghiệm cá nhân · câu hỏi comment · lưu/tag.

## 3. Giọng điệu
- Xưng **tao – chúng mày**, bình dân, cà khịa. Các tông đã dùng: *chua – hỗn – đanh đá* (nữ), *ngông cuồng*.
- Hạn chế chửi thề (một chữ "đéo" là tối đa; báo Sơn có thể đổi để tránh bị bóp tương tác).
- Không tự thêm chuyện người đi cùng/nếm thử nếu footage và Sơn không xác nhận.

## 4. Viết cho máy đọc
- **Số và mã viết bằng chữ**: "mười lăm nghìn", "hai chín A", "Ca Tê mười hai", "tổ mười ba". Chữ trên màn hình hiển thị lại dạng 15K / 29A / KT12 (sửa ở `asr-fixes.json`).
- Độ dài mục tiêu **50–65 giây** (~4,5–5 từ/giây ở Speed 1.1–1.2).

## 5. Định dạng giao — mặc định là BẢN LIỀN MẠCH (Sơn thích nhất)
- **Một đoạn duy nhất**, nối bằng dấu phẩy, không "…", không xuống đoạn, không thẻ thở dài/cười giữa câu.
- Một thẻ đầu đoạn: `[fast, energetic, arrogant, rapid-fire, no pauses]` (đổi tính từ theo tông: `sassy, high-pitched` cho giọng chua).
- Kết bằng dấu "!".
- Cài đặt gợi ý: Eleven v3 · Speed 1.15–1.2 · Stability ~40% · tạo **một lần cả đoạn** (không chia nhỏ ghép lại).
- Nếu Sơn muốn bản có biểu cảm: thêm bản v3 có thẻ theo câu (`[sarcastic]`, `[scoffs]`, `[laughs]`…), Stability ~30%.

## 6. Kèm theo trong cùng tin nhắn
- Bảng dàn cảnh: giây | clip | ý | chữ trên màn hình.
- Danh sách câu cần Sơn xác nhận.
- Khi video xong: caption 2–3 lựa chọn + 8–10 hashtag (rộng + địa phương, vd `#chaotrai #anngonhanoi #reviewdoan #quanngonhanoi #tuongmai #hoangmai #anvahe #foodtiktok`) + nhắc gắn Location trong app.
