---
name: mau-quyet-tran-lux
description: Dựng video dọc BĐS theo phong cách "Mẫu Quyết Trần Lux" — sang trọng kiểu điện ảnh: chữ trắng Montserrat nghiêng (dòng dẫn mảnh + từ khóa đậm IN HOA) hiện mờ-nhòe-trồi lên, phụ đề nhỏ chữ thường, số liệu căn trái, chữ hiện rải rác giãn-khép, trang ghép 3 ảnh nền xám tối, nháy trắng + whoosh, dip qua đen, nhạc nền nhẹ. Dùng khi người dùng muốn dựng/chỉnh video "kiểu Quyết Trần", "style lux", "sang trọng/cao cấp như video TikTok mẫu", dự án nghỉ dưỡng, villa, căn hộ hạng sang.
---

# Mẫu Quyết Trần Lux

Học từ 2 video TikTok (skill `hoc-mau-bds`). Phân tích: `styles/quyet-tran-lux/analysis/`. Đặc tả đầy đủ + mức chắc chắn: `references/style-spec.md`.

## Nguyên tắc phong cách (đã xác minh)
- Theo góp ý người dùng (v2): chữ nhỏ không được mảnh (≥600), phải có **chữ âm bản** và **chữ chạy theo lời nói** — đây là 2 dấu ấn chính của kênh, đặc biệt ở hook 10 giây đầu.
- **Tiết chế**: chữ trắng, bóng mềm, không viền, không màu chói. Footage phải là nhân vật chính.
- **Phụ đề chạy theo cụm 3–7 tiếng** (chữ thường, nhỏ, ~0.53H), hiện đúng lúc nói; **tắt** trong lúc có tiêu đề lớn.
- Chữ lớn hiện **trùng tiếng đầu** của cụm khóa (≤0.1 s); dòng dẫn = lời vừa nói trước con số.
- Chữ chỉ cho **con số, tên riêng, tên mục/đặc quyền**; ~2–4 tiêu đề/phút. Câu dẫn dùng phụ đề nhỏ.
- Tiêu đề 2 dòng: dẫn Montserrat 500 nghiêng (≈0.66×) + CHÍNH 800 nghiêng IN HOA ~108px, căn giữa ở 0.62H (hoặc 0.21H khi phần dưới khung bận).
- Số liệu căn trái x≈0.22W, đơn vị mũ IN HOA.
- Vào: mờ-nhòe-trồi lên 0.4 s, dòng chính trễ 0.18 s. Thoát: mờ + nhòe 0.3 s.
- Nháy trắng ~1.5 lần/phút ở điểm cắt, **luôn kèm SFX** (whoosh + shine). Dip qua đen khi chuyển đoạn.
- Nhạc nền suốt video (ambient/piano nhẹ, ~0.18) dưới giọng nói.
- Chỉnh màu ấm nhẹ + vignette mềm (`QtGrade`).

## Lựa chọn ĐÃ DUYỆT của người dùng (ưu tiên cao nhất)
- **Chữ kính vàng** (`glass.tsx` → `QtGlassText`): SVG tô gradient vàng kim trực tiếp, trắng → vàng bằng mặt nạ mềm — KHÔNG dùng clip-path (răng cưa). Toàn video một tông VÀNG KIM.
- **Trực quan = ICON 3D VÀNG KIM (kiểu A)** (`icon3d.tsx` → `QtIcon3D`, mặc định `gold`): Fluent Emoji 3D đổi chất liệu vàng, bật/lướt vào, lơ lửng, bóng đổ. KHÔNG dùng sơ đồ vẽ phẳng (mặt cắt, sơ đồ ngã 3, danh sách ghim) — người dùng đã từ chối; KHÔNG dùng icon màu hoạt hình.
- **SFX thu thật** (`scripts/style/fetch_sfx.py`, Mixkit) + **canh điểm đỉnh** (`sfxHits.json`): cue = mốc chữ + 0.08 s − hit. Chỉ dùng SFX sáng cao tần cho chữ; kiểm bằng stem tách (`sfx_vs_voice.py`, ≥ +3 dB).
- **Keyframe đa dạng, mềm** (`keyframes.ts`): vào từ dưới lên / từ 2 bên / lấy nét / phóng to, có keyframe RA; chọn theo bố cục cảnh.
- **Không đặt chữ/icon lên mặt**: đo `faces.json` từng đoạn, dùng dải trống trên đầu hoặc 2 bên; chữ lớn có thể nằm SAU lưng người (`QtPersonFront`), chữ sau lưng phải ĐẬM, DÀY.
- **Hỏi trước khi sửa** bản dựng: làm clip thử (`QtlLab6`) → người dùng duyệt → mới dựng bản thật.

## Components — `src/styles/quyetTranLux/components.tsx` (timing theo giây, đúng ở 30/60 fps)
| Component | Dùng cho |
|---|---|
| `QtRunText` | **chữ chạy theo lời nói** kiểu "Có một / SỰ THẬT LÀ ở phía nam / HÀ NỘI": dòng bậc thang, lead nhỏ nghiêng trắng + main lớn đứng thẳng màu kem #E8E6D6, mỗi mảnh hiện đúng lúc nói; `fx:"slide"` lao vào từ trái nhòe chuyển động ("HỒ HOÀN KIẾM"), `fx:"neg"` âm bản. Dùng làm hiệu ứng CHÍNH cho phần lớn câu |
| `QtNegative` | **chữ âm bản** (ruột chữ đảo màu nền + quầng trắng, hiện từng ký tự); `cross` = 2 dòng nghiêng ngược chiều chéo nhau khi lời nói có ý "giao nhau / ngã 3 / kết nối" |
| `QtPhraseCaptions` | phụ đề cụm từ transcript (`words` = captions.json, `mute` = các khoảng có tiêu đề) |
| `QtTitle` | "IXORA 2 có / 63 CĂN" — tên riêng + con số |
| `QtTrackingReveal` | "sân golf / THE BLUFFS" — tiện ích/địa danh nổi bật |
| `QtNumber` | "Mỗi căn rộng từ / 224 - 300 m²" — diện tích, giá |
| `QtHeading` | "DANH SÁCH ĐƠN VỊ TƯ VẤN" — tên mục (`dark` trên nền sáng) |
| `QtSubtitle` | cụm câu dẫn ngắn, chữ thường |
| `QtCardStack` | trang ghép 1–3 ảnh + tiêu đề dọc + nhãn |
| `QtDarkCard` | màn chữ trên nền tối (câu chuyển ý) |
| `QtFlash`, `QtDip` | chuyển cảnh |
| `QtGrade` | bọc footage |

Ví dụ ghép đầy đủ: `src/styles/quyetTranLux/Verify.tsx` (composition `QuyetTranLuxVerify` / `QuyetTranLuxVerify60`).

## Dựng video thật — composition `QuyetTranLuxEdit`
Mẫu kế hoạch: `projects/san-ho-09-2/lux-plan.json` (item neo theo chỉ số từ `at` hoặc giây `atSec`; loại: run, neg, title, tracking, number, heading, cards, flash, dip; mỗi item có `sfx`; `run` có `lines[].pieces[].at` neo từng mảnh theo từ).
1. Proxy 60fps vào `public/inputs/`, phiên âm (đường dẫn tuyệt đối), áp `asr-fixes.json` → `work/<du-an>/words.json`.
2. Ghép props: `{ plan: { ...lux-plan, words, durationSec, captions: "phrase" | "wbw" } }` → 2 file props.
3. Xem trước: `node scripts/style/stills.mjs QuyetTranLuxEdit <props> <thư-mục> 2.5 7 10.9 ...` (đừng chạy nhiều `remotion still` song song — tràn RAM).
4. Render 2 bản → `master-audio` → `qc` → `hf_peaks.py` ở các mốc SFX.
Ảnh cho `cards` lấy từ b-roll của chính footage người dùng (không dùng ảnh kênh mẫu).

## Quy tắc khi dựng
1. Một khoảnh khắc — một khối chữ. Không chồng tiêu đề lên phụ đề cùng vùng.
2. Giữ chữ trong `src/lib/safeZone.ts`; tiêu đề trên dùng y≥0.2H để không bị thanh TikTok che.
3. Mỗi tiêu đề/nháy trắng có SFX — tiêu đề: `sparkle` hoặc `swish` (KHÔNG dùng `shimmer`: gần như không có cao tần, bị giọng nói lấp); nháy trắng: `whoosh` + `shine`. Kiểm bằng `hf_peaks.py` (> +12 dB).
4. **Không** dùng logo "Q", tên kênh hay khuôn mặt của kênh mẫu; watermark (nếu có) là tên kênh người dùng.
5. Bản thường dùng `QtPhraseCaptions` (đúng mẫu). Theo CLAUDE.md luôn xuất thêm bản chạy chữ từng chữ (`WordByWord`) thay cho phụ đề cụm; với style này đặt chữ ~0.62H, trắng (giữ tinh thần tiết chế).
6. Render 60fps → `master-audio` (-14 LUFS) → `qc`; bản xem nhanh ~60 MB gửi qua SendUserFile.
