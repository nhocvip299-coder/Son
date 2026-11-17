# Tái sử dụng Mõ Làng Review

## Mặc định đã có, không hỏi lại

- Lấy video Mõ Làng/Gelexia gốc trong source.json và ảnh IMG_7589 làm chuẩn; không lấy bản Adam phái sinh làm bản được duyệt.
- Giữ nguyên token/component đi kèm: Phudu đậm vàng ấm–trắng, viền tối mảnh, cạnh 3D ngắn, nền xám mờ bo góc, highlight theo từ và motion cả khối. Không tự thiết kế lại kiểu chữ cho mỗi tập.
- Giữ ghim địa điểm, bốn vai trò intro/route/food/cta và vùng an toàn TikTok/Reels. Thay câu chữ theo ý nghĩa tập mới.
- Dùng audio người dùng giao, giữ tốc độ/cao độ. Khi đã có lồng tiếng, mặc định tắt audio gốc tránh chồng tiếng. Không ép giọng Adam hoặc giọng nữ của tập cũ sang tập khác.
- Nếu viết thoại: dùng giọng review cà khịa, tao–chúng mày theo yêu cầu đã có; căn cảnh/thời lượng, chỉ kể điều có căn cứ. Lời thoại người dùng giao có ưu tiên.
- Dùng bộ sound-eff đã lưu khi cần SFX; chỉ nhấn những điểm chính, không phủ âm từng từ. Giữ trạng thái đã/nghe chưa kiểm chứng.
- Tỷ lệ mặc định 9:16, đầu ra 4K60 như bản mẫu; yêu cầu mới về kích thước/fps có ưu tiên. Render chữ ở đúng kích thước xuất. Không gọi footage upscale là nguồn 4K gốc.
- Logo chỉ thêm khi được giao cho tập mới. Không chép logo Mõ Làng hoặc địa chỉ/lộ trình cũ vào quán khác.

## Nhận tư liệu và làm ngay

1. Đọc metadata video, audio, logo và thông tin quán đã có trong tin nhắn/tệp. Tự tìm lại dữ liệu đã lưu bằng ID; không yêu cầu gửi lại khi còn khôi phục được.
2. Chỉ hỏi thông tin thật sự chưa có và ảnh hưởng độ chính xác, như tên/địa chỉ quán mới. Không hỏi lại font, màu, nền, motion, nơi đặt chữ hoặc cách xuất.
3. Tạo project bằng bootstrap.py. Ghi project.json cho câu chữ/timestamp/callout, episode.json cho nguồn và cách dựng; không sửa template phong cách khi chỉ thay nội dung.
4. Căn audio trước, bố trí cảnh sau; giữ danh sách cắt/crop/tốc độ và cảnh loại riêng mỗi tập. Chỉ báo ngắn khi cần kéo dài hình cho khớp audio, không tự tăng tốc giọng.
5. Chạy check_project.py và check_style.py; kiểm tra cận chữ, dấu Việt, overflow, đầu/giữa/cuối mỗi role và clip vào–giữ–ra theo qa.md. Không thêm bóng đèn đường trong ảnh vào hiệu ứng chữ.
6. Xuất MP4, kiểm tra duration/fps/audio và vài cảnh từ file cuối. Dự toán bitrate theo giới hạn file trước xuất, tránh phải encode lại vì vượt dung lượng.
7. Lưu MP4 và project có thể khôi phục trước khi đưa liên kết. Không báo hoàn tất nếu mới có file tạm, ảnh still hoặc kiểm tra compile.

## Lưu dự án để không mất việc khi hết phiên

Không dựa vào đường dẫn scratch như bản sao lâu dài. Mỗi tập lưu kèm gói mã nguồn sản xuất (khác gói cài skill), gồm src, project.json, font, logo/tài sản nhỏ, package-lock, script dựng, episode.json và checkpoint.json.

episode.json ghi:

```json
{
  "title": "Tên tập mới từ dữ liệu thật",
  "inputs": [
    {"role": "footage", "path": "public/raw.mov", "library_file_id": "ID thật từ tệp đã nhận"},
    {"role": "voice", "path": "public/voice.mp3", "library_file_id": "ID thật từ tệp đã nhận"}
  ],
  "derived": [
    {"path": "base-native.mp4", "rebuild_script": "scripts/build_base.py"}
  ],
  "outputs": ["output/final.mp4"],
  "shots": [],
  "audio": {"speed": 1},
  "decisions": []
}
```

Đây là schema minh họa, không sao chép ID hoặc thông tin giả vào tập thật. Ghi thêm địa điểm, phiên bản nguồn, đường dẫn/ID logo nếu có, SFX/hit timing, audio mix, lệnh render và Library ID của đầu ra khi đã lưu. Script tái dựng trong derived phải có trong gói; shots phải có đủ source in/out, output duration và crop.

Chạy `python scripts/snapshot_project.py PROJECT OUTPUT.zip`. Helper loại cache/node_modules/frames và asset lớn đã có nguồn khôi phục; không âm thầm bỏ file lớn chưa có ID hoặc script dựng lại. Lưu gói sản xuất cạnh MP4 theo skill Library hiện hành. Không gửi ZIP cài skill trừ khi người dùng yêu cầu ZIP.

Khi tiếp tục: khôi phục gói sản xuất, lấy lại input qua ID, cài dependency đã pin, cập nhật các đường dẫn đã đổi và chạy script/cue đã lưu. Giữ nguyên quyết định/cảnh loại của tập đó. Không chép transcript của tập Adam hoặc kịch bản Gelexia vào nội dung mới.

## Câu gọi ngắn

“Dùng mẫu Mõ Làng Review đã lưu để edit tư liệu này.”

Hiểu câu này là dùng skill gelexia-food-review, tự nạp toàn bộ preset và quy trình trên; không bắt người dùng mô tả lại phong cách.
