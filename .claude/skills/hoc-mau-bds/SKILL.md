---
name: hoc-mau-bds
description: Học phong cách hình ảnh từ video mẫu bất động sản trên mạng (link TikTok, YouTube, Facebook Reels, hoặc Drive) rồi đóng gói thành style + skill Remotion mới dùng lại được, và dựng thử lên video của người dùng. Dùng skill này mỗi khi người dùng gửi link/video BĐS của kênh khác và muốn "làm giống video này", "học style kênh X", "lấy ý tưởng hiệu ứng từ video mẫu", "bắt chước cách chèn chữ/màu/nhịp cắt", "tạo mẫu mới từ video trên mạng" — kể cả khi họ không nói chữ "style" hay "skill". Không dùng khi chỉ dựng video theo style đã có sẵn (dùng mau-hong-dang / text-presets-bds).
---

# Học mẫu video BĐS từ mạng → style mới

Đầu vào: 1–5 link video mẫu (cùng một kênh/phong cách) + (tuỳ chọn) video người dùng tự quay.
Đầu ra:
1. `styles/<id>/` — `style.json`, `analysis/`, `references/style-spec.md`
2. `src/styles/<camelId>/` — components Remotion + `Verify.tsx` (composition kiểm chứng)
3. `.claude/skills/mau-<id>/SKILL.md` — skill mới để lần sau chỉ cần nói "dựng kiểu <tên>"
4. Video demo trên footage người dùng: bản thường **và** bản chạy chữ từng chữ (yêu cầu cố định trong CLAUDE.md)

Mẫu tham khảo đã làm xong theo đúng quy trình này: skill `mau-hong-dang`. Mở nó ra xem trước khi viết — nó là thước đo "xong" trông như thế nào.

## Vì sao làm theo trình tự này
Phong cách nằm ở chi tiết đo được (màu hex, vị trí theo % chiều cao, thời gian vào/thoát, nhịp cắt), không nằm ở ấn tượng chung. Nếu nhìn 1–2 keyframe rồi viết component ngay, kết quả thường "na ná" nhưng người dùng thấy ngay là sai. Vì vậy: tải → đo → nhìn kỹ → ghi đặc tả có mức độ chắc chắn → dựng → so cạnh nhau với mẫu → sửa.

## Bước 1 — Tải video mẫu
```bash
python3 -I scripts/style/fetch_reference.py <style-id> <link1> [<link2> ...]
```
- `<style-id>`: chữ thường-gạch-nối, theo tên kênh/phong cách người dùng gọi (vd `kenh-abc`). Hỏi lại nếu không rõ.
- Lưu vào `reference/<id>/` (đã bị `.gitignore` — video của người khác **không bao giờ đưa lên Git**), kèm `sources.json` (link, tiêu đề, kênh) và proxy H.264 1080x1920 (Chromium không giải mã HEVC).
- Nếu in `MANG_BI_CHAN`: môi trường chưa cho truy cập TikTok/YouTube/FB. Báo người dùng một dòng và đề nghị cách nhanh nhất: tải video về điện thoại → up Google Drive (chia sẻ "bất kỳ ai có link") → gửi link Drive; script nhận link Drive như bình thường. Không tự bịa phân tích khi chưa có video.
- Video ngang 16:9 vẫn học được (proxy có viền đen) nhưng ghi chú vào đặc tả là bố cục khác.

## Bước 2 — Đo tự động
Với mỗi `refNN_proxy.mp4`:
```bash
python3 -I scripts/style/analyze_reference.py reference/<id>/refNN_proxy.mp4 styles/<id>/analysis/refNN
```
Ra `analysis.json` (điểm cắt/phút, shot trung vị, thời điểm sự kiện chữ, mật độ chữ theo dải dọc, bảng màu, màu nhấn, nháy sáng, onset âm thanh, tỉ lệ SFX trùng điểm cắt) + `contact_sheet.jpg` + `keyframes/`.

Phiên âm mẫu (whisper, như quy trình chuẩn) để biết **chữ trên màn hình ứng với lời nói nào** — đây là phần "tư duy nhấn mạnh" của kênh (họ chèn chữ ở con số? địa danh? câu hỏi?).

## Bước 3 — Nhìn kỹ và đo animation
Đọc contact sheet và từng keyframe (Read ảnh). Liệt kê **các loại thành phần đồ hoạ** lặp lại (chữ khoá, thẻ câu hỏi, số lớn, bản đồ, PiP, icon, khung giá, CTA, watermark, thanh tiến trình…). Thường 4–8 loại.

Mỗi loại, cắt dải khung dày quanh lúc nó xuất hiện để thấy cách vào/thoát:
```bash
python3 -I scripts/style/strip.py reference/<id>/refNN_proxy.mp4 <t> styles/<id>/analysis/strips/<ten>_<t>.jpg --crop 0.5:0.8
```
Từ dải khung suy ra: thời lượng vào (số khung đến khi ổn định), kiểu vào (pop/trượt/gõ từng ký tự/mask), có overshoot không, thoát thế nào, giữ bao lâu.

Đo màu bằng pixel (đọc giá trị trong vùng chữ bằng ffmpeg/numpy), không đoán bằng mắt. Font: so dáng chữ với các font đã cài (`package.json` → `@fontsource/*`) và ghi là ước đoán.

## Bước 4 — Viết đặc tả `styles/<id>/references/style-spec.md`
Theo cấu trúc của `.claude/skills/mau-hong-dang/references/style-spec.md`: bảng dữ liệu nguồn, Typography, Chuyển động, Âm thanh, Tư duy nhấn mạnh, Chưa tái tạo được. Gắn nhãn mỗi thông số **[XM]** (đã xác minh bằng số đo/khung hình) hoặc **[UD]** (ước đoán). Nhãn này giúp người dùng biết chỗ nào cần góp ý, và giúp lần sau sửa đúng chỗ.

Tạo `styles/<id>/style.json` (schema `src/styles/types.ts`, `status: "calibrating"`) và đăng ký trong `src/styles/registry.ts`.

## Bước 5 — Dựng components
`src/styles/<camelId>/components.tsx`, mỗi loại thành phần một component, đặt tên tiền tố ngắn của style.
- **Tái sử dụng trước khi viết mới**: nhiều hiệu ứng đã có trong `src/styles/hongDang/components.tsx` và 40 preset ở `src/styles/textPresets/` (skill `text-presets-bds`). Nếu hiệu ứng mẫu gần giống preset có sẵn, bọc lại với màu/font/timing mới thay vì viết lại — nhanh hơn và đã qua QC.
- Chữ phải đạt chuẩn CapCut của người dùng: bóng/phát sáng đủ, có vào **và** thoát mượt, SFX khi chữ xuất hiện nghe rõ trên giọng nói.
- Timing tính theo giây/`fps` để chạy đúng cả 30 và 60 fps; giữ chữ trong `src/lib/safeZone.ts`.
- Tiếng Việt có dấu: kiểm tra dấu không bị cắt ở dòng trên (line-height, padding).

## Bước 6 — Kiểm chứng cạnh nhau với mẫu
Tạo `src/styles/<camelId>/Verify.tsx` (đăng ký trong `src/Root.tsx`) tái hiện vài khoảnh khắc của mẫu (cùng chữ, cùng vị trí) trên nền giả lập hoặc footage người dùng. Render rồi so:
```bash
python3 -I scripts/style/compare.py reference/<id>/ref01_proxy.mp4 out/<id>-verify.mp4 styles/<id>/analysis/verify/compare_round1.jpg 6.7:1.0 12.8:4.0 ...
```
Xem ảnh so sánh, ghi các sai khác (vị trí, cỡ, màu, độ dày bóng) rồi sửa; thường 2 vòng là đủ. Lưu ảnh mỗi vòng (`compare_roundN.jpg`) — gửi vòng cuối cho người dùng xem.

## Bước 7 — Đóng gói skill mới
Viết `.claude/skills/mau-<id>/SKILL.md` theo khuôn `mau-hong-dang`: frontmatter (name, description "dựng kiểu <tên>…"), Nguyên tắc phong cách (đã xác minh), Cách dùng (components, composition, lệnh render), Quy tắc khi dựng, trỏ tới `style-spec.md` (copy sang `references/` của skill).

## Bước 8 — Demo trên video người dùng
Nếu người dùng có footage: chạy quy trình chuẩn trong CLAUDE.md (proxy → analyze → transcribe + `asr-fixes.json` → kịch bản neo theo chỉ số từ → plan → preview stills → render 60fps → `master-audio` -14 LUFS → `qc`). Xuất **2 bản**: thường + chạy chữ từng chữ (`WordByWord`). Kiểm SFX nghe rõ bằng đo năng lượng cao tần quanh mốc SFX. Gửi bản xem nhanh ~60 MB qua SendUserFile; bản đầy đủ ở `out/`.
Nếu chưa có footage: render `Verify` làm demo và hỏi người dùng gửi video.

## Bản quyền & nhận diện
Học **cách làm** (màu, nhịp, kiểu chuyển động), không sao chép **danh tính** của kênh mẫu: không dùng logo, watermark, tên kênh, khuôn mặt hay câu slogan riêng của họ trong video của người dùng. Watermark là tham số — chỉ điền tên kênh của người dùng. Không cắt ghép footage của video mẫu vào sản phẩm.

## Báo cáo cho người dùng (ngắn, tiếng Việt)
- 3–6 gạch đầu dòng: đặc điểm chính của phong cách (con số đo được).
- Ảnh so sánh mẫu ↔ bản dựng, video demo (2 bản).
- Những gì là ước đoán [UD] → mời góp ý cụ thể (vd "font có đúng không?").
- Commit code/đặc tả/skill (không commit video) lên nhánh làm việc.
