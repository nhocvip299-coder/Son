# Ảnh bìa (thumbnail) TikTok — luôn làm 2 mẫu

Hai composition (1080×1920, render bằng `npx remotion still`):

1. **ThumbBold – kiểu "giá to"** (mẫu Sơn gửi 17/11): món ăn nửa dưới, khối chữ nửa trên.
   Props `projects/<tap>/thumb-bold.json`:
   `{"image","imageShiftY":380–420,"imageScale":1,"sharpFromPct":22,"pill","line","price","sub","question"}`
   - `pill` ≤ ~22 ký tự (tên quán • ngõ/phố), `line` ≤ ~12 ký tự ("CẢ QUẨY CHỈ", "CHỈ TỪ"), `price` ngắn ("15K"), `sub` ≤ ~11 ký tự ("MỘT BÁT"), `question` ≤ ~16 ký tự ("CÓ RẺ QUÁ KHÔNG?").
   - Ảnh: cận món sắc nét, có món phụ (vd bát cháo đang chấm quẩy). Món phải nằm nửa dưới sau khi dịch.
2. **GelexiaCover – kiểu Gelexia lưới 4 ảnh**: nền 2×2, khối chữ giữa nằm trong vùng 3:4 (lưới hồ sơ TikTok cắt 1080×1440).
   Props `projects/<tap>/cover-grid.json`:
   `{"images":[4 ảnh],"kicker","highlight","title":"…\n…","name","address"}`
   - 4 ảnh nên gồm: món + món phụ, cận lúc ăn, cách làm, mặt tiền/đường vào.

Quy tắc:
- Lấy khung hình từ proxy H.264 của tập (`ffmpeg -ss <t> -i all.mp4 -frames:v 1 -q:v 2 public/inputs/<tap>/cover/f<t>.jpg`), xem dải ứng viên trước khi chọn; tránh khung nhòe chuyển động.
- Giá chỉ ghi đúng điều đã xác nhận; menu có khoảng giá thì dùng "TỪ 35K"/"CHỈ TỪ".
- Xuất `out/<tap>-thumbnail-gia-to.png` và `out/<tap>-thumbnail-gelexia.png`, ghép xem thử cạnh nhau, rồi gửi bằng SendUserFile (display render). Commit 2 file props.
- Lệnh: `npx remotion still src/index.ts ThumbBold out/<tap>-thumbnail-gia-to.png --props=projects/<tap>/thumb-bold.json` và tương tự `GelexiaCover`.
