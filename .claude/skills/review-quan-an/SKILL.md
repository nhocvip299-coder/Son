---
name: review-quan-an
description: Dựng trọn gói video dọc REVIEW QUÁN ĂN / food vlog có lời thoại từ nhiều clip gốc (DJI/điện thoại, HEVC) — cắt lỗi + khoảng lặng, tua nhanh x2/x3 đoạn ăn không thoại (nhãn "x2 ▶▶"), đưa câu hook đắt nhất lên đầu, phụ đề karaoke + bản chạy chữ từng chữ (DT Phudu), chữ hiệu ứng kiểu CapCut đặt TRÁNH MẶT + SFX nhẹ, render 1080x1920 60fps từ file gốc, gửi bản xem nhanh + bản đầy đủ cắt phần, rồi làm thumbnail 4K + caption TikTok/Facebook. Dùng khi người dùng gửi link Drive clip review quán/món ăn, "dựng video review", "cắt ghép tua nhanh đoạn ăn", "làm thumbnail + caption".
---

# Review quán ăn — quy trình đóng gói (mẫu: dự án `projects/ngon-eco`, Quán Ngon Eco)

Trả lời tiếng Việt, ngắn. **Người dùng duyệt trước khi render bản cuối** (gửi `edl.txt` + bản xem nhẹ).

## Sở thích đã chốt của người dùng
- Cắt lỗi/nói lặp/khoảng lặng; đoạn ăn uống không thoại → **x2 hoặc x3, tắt tiếng gốc**, về 1x khi có thoại.
- **Giữ câu hook đắt nhất đưa lên đầu** (vd "được ăn là hạnh phúc nhất cuộc đời").
- **Đoạn nói không rõ → không phụ đề** (`noCaption` trong EDL). Phụ đề chỉ ở đoạn 1x.
- **Chữ/phụ đề không đè mặt** (faces.py + `y` cố định khi cần).
- Chữ hiệu ứng kiểu demo-phudu: `zoomPunch`/`popBounce`/`slideMask`/`typewriter`, **không dùng `neonGlitch` (hologram)**.
- **SFX nhẹ, hay, không to**: Mixkit, 1 tiếng/tiêu đề, ~8 dB dưới giọng (`gain = 10^((-22 - Mmax)/20)`), không SFX từng chữ.
- Có tiêu đề **giá thanh toán** ở cuối ("THANH TOÁN *90K*").
- Bản cuối **render từ file gốc, 1080x1920 60fps** (không dùng proxy — proxy làm mờ). Luôn 2 bản: thường + chạy chữ từng chữ.
- Font DT Phudu (`FONTS.phudu`).

## Các bước
1. **Tải** clip vào `work/<du-an>/raw/` (Drive: `drive.usercontent.google.com/download?id=...&confirm=t`). Không đưa video lên Git.
2. **Nguồn**: `bash scripts/review/prep_sources.sh work/<du-an> <du-an>` → proxy 1080 H.264 + `source.mp4` (xem/phân tích) + `source-goc1080.mp4` (từ gốc, CRF 12, unsharp nhẹ) + hardlink vào `public/inputs/<du-an>/`; in ra offset từng clip cho `edl.json.clips`.
3. **Lời**: `node scripts/pipeline/transcribe.mjs` cho từng clip với **đường dẫn tuyệt đối** → `work/<du-an>/asr/<clip>/captions.json`. Rồi `.venv/bin/python -I scripts/review/speech_scan.py work/<du-an>` → `words.json`, `vad.json` + bảng từ theo vùng giọng (số trong ngoặc = năng lượng so p90; ≤ −15 thường là Whisper ảo giác, vd "Hãy subscribe...").
4. **Kịch bản** `projects/<du-an>/edl.json` (xem mẫu `projects/ngon-eco/edl.json`):
   - `clips` (offset), `segments: [{clip,a,b,speed,note}]` (giây theo clip; đoạn 1 = hook), `dropped`, `noCaption: [{clip,a,b}]`,
   - `titles: [{clip,at,dur,effect,text,y?}]` — `*từ*` = tô vàng, `|` = xuống dòng; 1 tiêu đề / 15–25 s: hook, giờ/tình huống, tên quán + địa chỉ, giá, món, nhận xét/chấm điểm, thanh toán.
   - Sửa tên riêng: `projects/<du-an>/asr-fixes.json` (khóa `"clip:từ"` hoặc `"từ"`).
5. **Plan**: `.venv/bin/python -I scripts/review/build_plan.py projects/<du-an> work/<du-an>` → `plan.json` (karaoke), `plan-wbw.json`, `edl.txt` (gửi người dùng duyệt). Sau đó `.venv/bin/python -I scripts/review/faces.py projects/<du-an> work/<du-an>` (cần `opencv-python-headless<5`) rồi chạy lại build_plan để đặt tiêu đề tránh mặt. Tiêu đề vẫn đè mặt → đặt `"y"` cố định trong EDL (px tâm chữ @1920, vd 1190) + `noCaption` đoạn đó.
6. **SFX**: `bash scripts/get_mixkit_sfx.sh` (→ `public/sfx/mixkit/`, gitignore). Map trong build_plan: zoomPunch→pop-whoosh, popBounce→bubble-pop, slideMask→small-sweep, typewriter→page-chime, có giá/điểm thêm correct-tone; vào đoạn tua nhanh → short-sweep.
7. **Xem thử** (trước duyệt): render `ReviewEdit` với `plan.json` (nguồn proxy) bản nhẹ, stills vài mốc tiêu đề để kiểm tra đè mặt.
8. **Bản cuối + giao**: `bash scripts/review/deliver.sh projects/<du-an> <du-an> <ten-file>` (~1 giờ cho 3.5 phút, chạy nền):
   - `out/<ten>.mp4`, `out/<ten>-wbw.mp4`: 1080p60 CRF 15, master −14 LUFS, QC.
   - `out/<ten>(-wbw)-xemnhanh.mp4`: ~58 MB 1080p30 → gửi bằng SendUserFile.
   - `out/phan/<ten>(-wbw)-phanNN.mp4`: bản 1080p60 17.5 Mbps cắt ~24 s/phần (≤ ~75 MB) → gửi khi người dùng muốn bản đầy đủ. **SendUserFile không nhận file lớn (~444 MB vẫn bị từ chối); Drive connector chỉ nhận < 10 MB** → luôn cắt phần, ghép theo thứ tự 00→NN trong CapCut.
9. **Thumbnail 4K**: chọn frame (mặt rõ + cầm món + biểu cảm mạnh, thường là câu hook; xem lưới ảnh nhỏ trước), rồi
   `node scripts/review/thumbnail.cjs work/<du-an>/raw/<clip>.mp4 <giây> out/<ten>-thumbnail-4k.jpg "<NHÃN TRÊN>" "<DÒNG 1>" "<DÒNG 2>" "<DÒNG PHỤ>"`
   → 2160x3840 JPG (+ `-xem.jpg` để tự kiểm). Clip DJI gốc 1728x3072 → nói rõ là phóng lên 4K + làm nét.
10. **Caption** (mẫu `caption-mau.txt`): TikTok < 400 ký tự, 3 dòng kể chuyện (tình huống → món/điểm ngon → giá + câu hook) + **5 hashtag**; Facebook < 100 ký tự. **Không ký tự đặc biệt** (không emoji, không dấu câu trang trí; chỉ giữ `#` của hashtag). Đếm ký tự bằng `python3 len()` trước khi gửi. Lưu `out/<ten>-caption.txt`.

## Lỗi đã gặp
- Chromium không giải mã HEVC → luôn dùng proxy/hq1080 H.264. Remotion không đọc symlink → hardlink.
- Node fetch bỏ qua proxy → tải model Whisper bằng curl. transcribe.mjs cần đường dẫn tuyệt đối.
- zoomPunch hiện dấu `*` → build_plan bỏ `*` cho zoomPunch. WordByWord giữ từ qua điểm cắt → `maxEndMs`.
- Bản xem nhanh 720p 2 Mbps trông mờ → dùng 1080p30 2-pass.
