---
name: gelexia-food-review
description: "Edit review quán ăn của Sơn theo mẫu Gelexia đã chốt: Phudu đậm, 3D cạnh ngắn vàng ấm, nền xám mờ bo góc, chuyển động đồng bộ cả khối, ghim địa chỉ, nhãn đường, chữ nhấn món ăn và thẻ kết. Dùng khi gọi mẫu Gelexia, phong cách Mõ Làng Review, edit review theo mẫu cũ hoặc yêu cầu giữ nhất quán typography và hiệu ứng của bộ review này."
---

# Gelexia food review

## Nguồn chuẩn

- Ưu tiên ảnh Sơn gửi `assets/reference/IMG_7589-user-reference.jpeg` và đối chiếu clip gốc để phân biệt chữ với vật thể trong cảnh. Ảnh này là chuẩn hình thức mới nhất; không lấy các bản Adam tái dựng làm chuẩn.
- Xem `assets/reference/gelexia-reference-540p30.mp4` và các ảnh đi kèm trước khi dựng. Nguồn chuẩn là **Gelexia gốc**, không phải các bản Adam sửa lại. Sơn đã nhận xét các bản Adam chưa nhất quán.
- Đọc [style-spec.md](references/style-spec.md) và [qa.md](references/qa.md). Khi cần bản 4K60, khôi phục nguồn theo [source.json](references/source.json) bằng skill Library hiện hành. Proxy chỉ để đối chiếu, không dùng làm footage cho tập mới.
- Không yêu cầu Sơn nhắc lại font, màu, nền, vùng an toàn đã ghi trong skill. Chỉ hỏi thông tin còn thiếu ảnh hưởng trực tiếp nội dung tập mới.
- Đọc [episode-workflow.md](references/episode-workflow.md) khi bắt đầu tập mới: dùng toàn bộ mặc định đã lưu, không mở lại vòng hỏi về phong cách. “Mẫu Mõ Làng Review” và “mẫu Gelexia” đều gọi skill này.
- Yêu cầu đóng gói/cập nhật skill chỉ cập nhật quy trình; không tự tiếp tục render video mà người dùng đã tạm dừng.

## Ràng buộc không được tùy ý đổi

1. Dựng **Phudu đậm, viền tối mảnh, cạnh nổi ngắn** như ảnh IMG_7589: mặt vàng ấm `#ffdd66`, trắng cho phần còn lại, stroke 0,85 logical px và cạnh đổ xuống ~2 px. Không dùng khối cạnh vàng nâu dày/mặt cam của bản Adam trước. Bắt đầu ở weight 800 (đối chiếu mặt chữ ảnh/clip); font 900 là mặc định tái dựng cũ, không phải metadata gốc được xác minh. Dùng token `edge`, `shadow`, `goldShadow`; không kéo ngang glyph. Phần chữ phụ/địa chỉ dùng Be Vietnam Pro SemiBold, không đùn cạnh. Đợi font tải trước khi đo/render.
2. Khóa phụ đề ở 56 theo sân khấu 1080×1920. Chia trang/ngắt dòng khi dài, tối đa hai dòng; không co từng câu xuống 46 cho vừa. Giữ đường đáy, line-height và khoảng đệm.
3. Giữ bố cục cả cụm trong suốt lượt đọc. Chỉ đổi từ đang đọc sang vàng; phần còn lại trắng. Không tái bố trí câu khi đổi từ.
4. Cho **nền + chữ chính + chữ phụ nằm trong cùng wrapper chuyển động**. Cùng scale, translate, opacity khi vào/giữ/ra. Không phóng chữ trên nền đứng yên.
5. Dùng nền xám mờ bo góc đo theo nội dung, có max-width. Không biến câu ngắn thành bảng rộng cố định.
6. Phân biệt bốn vai trò: mở đầu, nhãn đường, nhấn món, thẻ kết. Không áp một thẻ tiêu đề vàng + giải thích trắng cho mọi câu. Xen khoảng nghỉ chỉ có phụ đề.
7. Ghim tên và địa chỉ ở phía trên, **căn giữa** (cập nhật 17/11 theo yêu cầu Sơn: mọi khối chữ căn giữa đối xứng, lề 150/150, nằm trong vùng an toàn chung TikTok+Reels trên 220 / dưới 520 / hai bên 150 — thay lề lệch trái 90/230 của mẫu gốc). Trượt cả cụm vào rồi giữ yên; không xuất hiện lại mỗi lần đổi cảnh.
8. Tách phong cách khỏi danh tính: logo trong nguồn chỉ là tham khảo. Chỉ thêm logo được giao cho tập mới; không tự chèn Mõ Làng/Cô Bé Ham Ăn.
9. Chỉ kể cảnh, món, giá, trải nghiệm và đường đi có căn cứ. Không mang lộ trình Gelexia sang tập mới. Lệnh riêng mỗi tập ưu tiên hơn mẫu; ví dụ tập Adam/Felix đã yêu cầu bỏ cảnh vỉ sườn, nhưng đó không phải lệnh cấm cho mọi tập tương lai.

## Quy trình

1. Kiểm tra metadata nguồn, lập bảng cảnh theo thời gian, đánh dấu cảnh loại theo yêu cầu. Dùng file thoại người dùng gửi làm nguồn chính; ưu tiên lựa chọn giọng mới (ví dụ Adam) hơn mặc định nữ cũ.
2. Khi được giao viết thoại, căn lời theo độ dài/cảnh. Có thể dùng tao–chúng mày, cà khịa đời thường theo yêu cầu; không tự thêm chuyện người đi cùng hoặc nếm thử. Không tạo lại file ElevenLabs đã giao.
3. Căn tiếng trước, hình sau. Nếu thoại dài hơn hình, nêu cách xử lý trong cập nhật ngắn. Ưu tiên thêm phần cảnh có nội dung/góc cận; không tự tăng tốc giọng, cắt câu hoặc kéo đứng hình dài.
4. Chép lời sang JSON Caption (`text/startMs/endMs/timestampMs/confidence`), sửa tên riêng theo dữ liệu được xác nhận. Chia trang theo ý và nhịp nói, ngắt dòng cố định cho cả trang. Căn lại timestamp khi thay timeline.
5. Chọn callout theo ý nghĩa bằng `intro`, `route`, `food`, `cta`; không gắn kiểu cố định với câu chữ lịch sử. Chữ nhấn ngắn và sát từ khóa; tránh lặp nguyên câu thoại trên–dưới.
6. Với ảnh thử chỉ kiểm tra chữ và không có địa điểm, đặt `mode: demo` và `brand.showAddress: false`; không bịa địa điểm để vượt checker. Tập thật vẫn yêu cầu đầy đủ thông tin. Chạy `python scripts/bootstrap.py /absolute/project-path`, sửa `public/project.json`. Template là overlay độc lập; ghép footage/voice ở project chính, không ghi đè nguồn.
7. Dùng component trong `assets/remotion-template`. Đây là **mã tái dựng**, không phải mã gốc trích xuất hay bản render đã được Sơn duyệt. Lấy video Gelexia làm trọng tài khi lệch. Dùng Remotion theo frame/fps, không CSS animation/transition theo đồng hồ.
8. Nếu cần SFX và skill `sound-eff` có sẵn, dùng bộ âm của Sơn; căn âm với chuyển động và không đè thoại. Không lặng lẽ thay bộ âm bằng click tổng hợp.
9. Đặt `mode` thành `production` cho tập thật (`demo` chỉ để smoke-test). Chạy `python scripts/check_project.py PROJECT/public/project.json` và `python scripts/check_style.py PROJECT`, rồi kiểm tra ảnh và clip vào–giữ–ra theo [qa.md](references/qa.md). Kiểm tra thêm cận cảnh ở kích thước xuất và bản xem điện thoại: mặt vàng ấm đúng ảnh, viền tối mảnh và cạnh nổi ngắn, không che lòng chữ. Không tuyên bố khớp mẫu chỉ từ một ảnh tĩnh/compile thành công.
10. Xuất đúng yêu cầu. Với 4K, render chữ trực tiếp ở 2160×3840 bằng scale đồng bộ sân khấu 1080×1920 lên 2; không upscale video 1080p đã có chữ. Không gọi footage 1440p upscale là nguồn 4K gốc. Giữ fps đã chốt.
11. Lưu/giao theo Library hoặc vị trí được yêu cầu. Lưu MP4 cùng gói mã nguồn sản xuất có episode.json, cue/cut/audio/SFX và nguồn Library ID theo episode-workflow.md; tạo gói bằng snapshot_project.py. Không coi scratch là bản lưu lâu dài, không báo hoàn tất khi chỉ có file tạm. Chỉ đưa liên kết sau khi lưu thành công. Không hứa lên xu hướng hay tránh phát hiện trùng.

## Preset địa điểm

Chỉ dùng khi tập mới vẫn về **Cơm Tấm Sườn Khói**: địa chỉ **30 lô 2, Đền Lừ 1, Hoàng Mai**. Không áp địa chỉ này cho quán khác. Phân biệt Gelexia Tam Trinh và Felix/Feliz theo thông tin mới nhất; không tự cho là cùng một lộ trình.

## Tài nguyên và kết luận

- `assets/reference/`: proxy toàn clip, ảnh kiểu chữ, chuỗi ảnh vào chữ; nguồn chuẩn từ phiên bản 2.
- `assets/fonts/`: font và giấy phép OFL; bootstrap tự sao chép vào public.
- `assets/remotion-template/`: token, component và dữ liệu ví dụ để tái sử dụng hệ thống.
- `assets/cases/adam-felix-caption-case.json`: ca hồi quy có input Library ID và timeline Adam; chỉ để khôi phục/kiểm tra tập này, không mang lời/đường/timestamp sang tập mới. Căn highlight phục hồi ở bước 33ms, không coi là forced alignment gốc.
- `scripts/bootstrap.py`: tạo project mới, từ chối ghi đè project hiện hữu.
- `scripts/check_project.py`: kiểm tra dữ liệu/time/role trước QA bằng mắt.
- `scripts/check_style.py`: chặn cạnh nâu dày, sai màu/weight/viền so với preset ảnh IMG_7589.
- `scripts/snapshot_project.py`: chụp gói dự án sản xuất để khôi phục, bỏ cache/frame và giữ ID/cách dựng lại media lớn; không phải ZIP cài skill.
- [episode-workflow.md](references/episode-workflow.md): đầu vào tối thiểu, mặc định không hỏi lại và quy trình lưu/khôi phục từng tập.
- Bóng elip dưới bảng “SƯỜN KHÓI” là **bóng đèn đường trong footage**: đã đối chiếu 5,3–5,7 giây, bóng di chuyển xuống trong khi bảng đứng yên. Không tạo thêm elip hoặc mô phỏng thành hiệu ứng chữ.
- [runtime.md](references/runtime.md): phiên bản tái lập và cách xử lý lỗi Remotion đã ghi nhận; chỉ dùng workaround khi lỗi tương ứng xuất hiện.

Chỉ báo những phần đã kiểm chứng. Nếu còn lệch chuyển động/bố cục, nêu đúng phần lệch và tiếp tục sửa trong phạm vi được giao; không nói “giống 100%” từ một screenshot.

## Áp dụng trong repo Son (Claude Code)

Skill gốc viết cho môi trường có "Library ID". Ở repo này:

- **Component đã port**: `src/styles/gelexia/GelexiaOverlay.tsx` + `style.ts` (token giữ nguyên bản skill), font ở `public/fonts/gelexia/`. Composition `GelexiaEdit` trong `src/Root.tsx`, nhận prop `project` (schema `public/project.json` của template + tùy chọn `background.video`, `voice`, `sfx[]` — đường dẫn trong `public/`). Ví dụ: `src/styles/gelexia/demo-project.json`.
- Không dùng `bootstrap.py` (tạo project riêng, Remotion 4.0.535). Dùng Remotion 4.0.544 của repo; dự án mới đặt ở `projects/<tap>/project.json` và render `npx remotion render src/index.ts GelexiaEdit out/<tap>.mp4 --props=projects/<tap>/props.json` với props `{ "project": ... }`.
- Kiểm tra: `python3 -I .claude/skills/gelexia-food-review/scripts/check_project.py <project.json>` và `python3 -I .claude/skills/gelexia-food-review/scripts/check_style.py src/styles/gelexia`.
- Thay "Library ID" bằng: Drive file id (`drive.usercontent.google.com/download?id=...&confirm=t`) hoặc đường dẫn upload; ghi vào `episode.json` của tập. `snapshot_project.py` vẫn dùng được nếu ghi id vào trường `library_file_id`.
- Proxy mẫu `assets/reference/gelexia-reference-540p30.mp4` KHÔNG đưa lên Git (gitignore); bản cục bộ ở `reference/gelexia/`. Nếu mất (container mới) → xin lại file zip skill.
- Phụ đề mẫu này **đã là chạy chữ từng chữ** (từ đang đọc vàng). Theo CLAUDE.md vẫn xuất kèm bản `WordByWord` CapCut nếu người dùng muốn bản đối chiếu; SFX phải nghe rõ trên giọng (đo năng lượng cao tần quanh mốc SFX), bộ âm ở `public/sfx/` (thay cho skill `sound-eff`).
- **Bộ SFX CC0 cho mẫu này**: `public/sfx/cc0/` (11 âm Kenney + audio-mcp-assets, CC0, nguồn trong `LICENSE-CC0.md`; đã đo đều nghe rõ trên giọng −14 LUFS, tăng >3 kHz ≥ +6 dB ở volume 0.8). Gắn theo vai trò trong `src/styles/gelexia/sfx.ts`: header→`whoosh-ui`, intro→`rise-maximize`, route→`whoosh-swipe`, food→`sparkle-glass`, cta→`select-chime`; dự phòng `pop-pluck`, `powerup`, `coins` (giá), `confirm`, `page-flip`, `tick`. Đặt `autoSfx: true` trong project để tự gắn, hoặc khai báo `sfx[]` thủ công. Không gắn SFX cho từng từ phụ đề. Âm gốc CapCut không tải được (thư viện độc quyền trong app) — đây là bộ thay thế hợp lệ bản quyền.
- Quy trình chung (proxy H.264, whisper, `asr-fixes.json`, render 60fps, `master-audio` -14 LUFS, `qc`, gửi bản xem nhanh ~60 MB) theo CLAUDE.md. Đầu ra mặc định 1080×1920@60; 4K chỉ khi được yêu cầu (đổi `width/height` project thành 2160×3840, chữ tự scale).
