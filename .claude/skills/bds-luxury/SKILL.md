---
name: bds-luxury
description: Bộ skill dựng video dọc BĐS cao cấp với NHIỀU STYLE phối trong một video (học từ 9 video kênh TikTok @quyettranlux) — 4 style chữ (A kính vàng, B bóc tách số liệu xanh bạc hà, C hạ tầng chữ trắng, D điện ảnh letterbox serif), công thức theo từng phân đoạn (hook, diện tích/số tầng, vị trí/ngã 3, công năng, khoảng cách tiện ích, thanh toán, CTA) và cách "trám hình" khi footage không có b-roll (đóng băng + quét tầng, card ảnh, chữ sơn trên mặt đường, lia máy nhòe, nháy trắng). Dùng khi người dùng muốn dựng/chỉnh video BĐS "sang", "luxury", "kiểu Quyết Trần", muốn video đa dạng/không nhàm chán, hoặc hỏi cách thể hiện diện tích, số tầng, khoảng cách tiện ích bằng hình ảnh.
---

# bds-luxury — nhiều style trong một video

Mở rộng skill `mau-quyet-tran-lux` (style A đã duyệt) bằng 3 style mới học từ ref07–09.
Một video hoàn chỉnh **không dùng một style từ đầu đến cuối**: mỗi phân đoạn nội dung chọn style + cách trám phù hợp, đổi style bằng một chuyển cảnh có SFX.

Nghiên cứu gốc (mốc thời gian, dải khung): `references/nghien-cuu-ref07-09.md`.
Thông số từng style: `references/styles.md`. Công thức theo phân đoạn: `references/cong-thuc-phan-doan.md`.

## 4 style
| Style | Học từ | Chữ | Phụ đề | Chuyển cảnh | SFX chữ |
|---|---|---|---|---|---|
| **A Kính vàng** | ref01–06 | `QtGlassText` vàng kim + icon nét mảnh `QtLineIcon` | cụm chữ thường | vệt sáng `QtLightLeak` | `qtl-sparkle-whoosh-2`, `qtl-sparkle-sweep` |
| **B Bóc tách số** | ref08 | `StackText palette="mint"` — Oswald 700 IN HOA xanh bạc hà, loé sáng rồi dịu; dẫn trắng nghiêng trên, phụ trắng dưới; số CHẠY (`count`) / gõ từng ký tự (`type`) | hộp tối bo góc (`box`) | lia máy nhòe `WhipBlur` | `lux-ting` (+ `lux-tick` khi số chạy) |
| **C Hạ tầng trắng** | ref07 | `StackText palette="white"` — Be Vietnam 800 trắng, vào `zoomSettle`; cụm dẫn/CHÍNH/phụ/CHÍNH | trắng trơn bóng mềm (`plain`) | nháy trắng `WhiteFlash` | `qtl-sparkle-whoosh-2` |
| **D Điện ảnh** | ref09 | `SerifTitle` Playfair giãn chữ khép dần + `SpecBox` khung viền tự vẽ | chữ ngà trong thanh đen (`cinema`) | thanh đen `Letterbox` trượt | `lux-boom` + `qtl-sparkle-sweep`, `lux-ding` cho khung |

Code: `src/styles/bdsLuxury/` — `typo.tsx` (StackText, SerifTitle, SpecBox), `fill.tsx` (Letterbox, WhiteFlash, WhipBlur, FreezeScan, PhotoCard, RoadText), `captions.tsx` (LuxCaptions đổi kiểu theo `zones`). Keyframe dùng chung `quyetTranLux/keyframes.ts` (đã thêm `zoomSettle`).
Ví dụ ghép đủ 4 phân đoạn: `src/styles/bdsLuxury/SanHoDemo.tsx` (composition `BdsLuxuryDemo`).

## Quy trình
1. Chuẩn bị như `mau-quyet-tran-lux`: proxy 60fps, phiên âm (đường dẫn tuyệt đối) + `asr-fixes.json`, `person_matte.py` (lớp người + faces.json), `camera_track.py`.
2. **Xem lưới khung 1 giây/khung của footage** (`ffmpeg fps=1,tile`) để tìm: đoạn quay riêng công trình (dùng đóng băng/quét tầng), đoạn mặt đường/đại lộ (chữ sơn đường), khoảng trời trống (đặt chữ), khung có mặt nhân vật (tránh).
3. Chia transcript thành phân đoạn nội dung → chọn style + công thức theo `references/cong-thuc-phan-doan.md`. Quy tắc phối:
   - Hook: D hoặc A (ấn tượng, chậm). Số liệu/diện tích/tầng: B. Vị trí/công năng/liệt kê: C. Khoảng cách: B' (sơn đường) hoặc A (icon). Thanh toán/CTA: A.
   - Đổi style tối đa ~1 lần / 8–12 s, luôn có chuyển cảnh + SFX ở điểm đổi.
   - Một phân đoạn chỉ một style (không trộn vàng + bạc hà cùng khung).
4. **Hỏi trước khi sửa**: dựng demo/ảnh tĩnh (`node scripts/style/stills.mjs <Comp> <props> <dir> t1 t2 ...`), gửi người dùng duyệt rồi mới dựng bản đầy đủ.
5. Render 60fps 2 bản (phụ đề theo style + `WordByWord`) → `master-audio` → `qc` → render stem `--codec=wav` (`stem: "sfx" | "voice"`) → `sfx_vs_voice.py` tại mốc cue + 0.08 (≥ +3 dB).

## Quy tắc bắt buộc (từ góp ý người dùng)
- Không đặt chữ/icon lên mặt; chữ lớn có thể nằm sau người (`QtPersonFront`) hoặc người đứng TRƯỚC chữ sơn đường.
- Mỗi khối chữ có keyframe VÀO và RA rõ ràng; ra trước nhát cắt ~0.4–0.6 s.
- SFX gọn 0.12–0.45 s (boom ≤ 0.9 s, chỉ dùng cho tiêu đề điện ảnh), 1 tiếng/lần xuất hiện; số chạy thêm 4–5 tiếng tick nhỏ.
- SFX tải bằng `python3 -I scripts/style/fetch_sfx.py` (Mixkit, không đưa lên Git); điểm đỉnh trong `quyetTranLux/sfxHits.json`; cue = mốc chữ + 0.08 − hit.
- Ảnh tĩnh cho card/đóng băng lấy từ CHÍNH footage người dùng (`ffmpeg -ss t -frames:v 1` → `public/inputs/<du-an>-stills/`), không dùng ảnh của kênh mẫu.
- Không dùng logo "Q", tên kênh, khuôn mặt kênh mẫu.

## Sở thích người dùng (ưu tiên khi chọn style)
- **Rất thích chữ sơn chìm dưới chân** (`RoadText`, người đứng trước chữ — "300M" bản San Hô 57 s): ưu tiên dùng mỗi khi có cảnh mặt đường/sàn/sân.
- **Rất thích chữ vàng champagne** (style A `QtGlassText tint="gold"`): giữ làm màu chủ đạo của thương hiệu.
- **Chữ đậm** (góp ý Happy Home): chữ chính Be Vietnam/Montserrat 900 + viền cùng màu 2,8 % cỡ chữ; dẫn/phụ 700/800; serif Playfair 900; phụ đề 700–800.
- **Trám điểm nhấn** (KCN, trường đại học, bệnh viện…): nhắc tới đâu cắt `VideoCard` tới đó (~1 s/cảnh), ưu tiên b-roll của người dùng, thiếu thì stock Mixkit (giấy phép miễn phí) — `inputs/<du-an>/stock/`. Không dùng ảnh báo chí có bản quyền.
- **Chủ đầu tư**: ưu tiên logo THẬT trong footage (tường nhà mẫu, sa bàn) + `PushIn` zoom vào logo.


## Chữ viết tay + chữ dày bản, SFX theo tình huống
Xem `references/phufilms-chu-sfx.md` (nghiên cứu Phú Films): mẫu 1 dòng viết tay chéo + chữ khối dày + dòng phụ, quầng sáng gọn sát chữ; bảng SFX Riser → Highlight → Impact. Component: `src/styles/bdsLuxury/handBold.tsx`.


## CHỮ 4K (bắt buộc)
Video gốc có thể Full HD nhưng chữ phải 4K sắc nét: `remotion.config.ts` đặt `Config.setScale(2)` + khung PNG → mọi bản render/ảnh duyệt ra 2160x3840. Chữ luôn là SVG/text vẽ ở cỡ thật (không phóng to ảnh chữ; preset CapCut dùng `zoom` thay `transform: scale`). Bản xem nhanh giữ 4K, chỉ hạ bitrate (~5–6 Mbps).
