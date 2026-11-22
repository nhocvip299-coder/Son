# Thông số hiệu ứng, typography, SFX

Nguồn số: `src/styles/refEdit/tokens.ts` (đo trên video mẫu 576x1024, quy đổi ×1,875 → 1080x1920).

## Màu [GỐC — đo pixel]
| Vai trò | Mã |
|---|---|
| Chữ trắng | #F6F4F6, bóng tối mềm dưới + quầng trắng nhẹ |
| Chữ đỏ | #F62A15, lõi sáng #FFD9D0 (gradient trong), viền đỏ phát sáng 7px + 20px |
| Chữ vàng | #FACF1E (gradient #FFE460→#F2B705) |
| Badge | #D13049 (điểm sáng #F0606F) |
| Thẻ vàng | viền #FAE539 5px + glow, nền rgba(226,214,66,0.6), bo 26px |
| Nền trừu tượng | #6F839C (sáng) / #30425A / #1F2834 (tối), blob tối trôi chậm |

## Font (đã duyệt)
| Lớp | Font | Ghi chú |
|---|---|---|
| Chữ trắng | 1FTV Nexa Heavy (`public/fonts/1FTV-Nexa-Heavy.otf`, nạp trong `src/lib/fonts.ts`) | giống chữ trắng gốc nhất; đủ 134 ký tự Việt |
| Chữ nhấn đỏ/vàng | Phudu 900 (@fontsource/phudu) | đủ dấu chồng |
| Dự phòng | Be Vietnam Pro | nếu thiếu file Nexa |
| ĐÃ LOẠI | Poppins (thiếu ả/ỷ), Anton (lỗi dấu chồng TRẦM→TRÂM), Netto (NỘI→NÔI) | kiểm bằng fontTools + in mẫu |
Kiểm font mới: phủ 134 ký tự Việt (`fontTools` cmap) **và** in mẫu "Trả 800 triệu – 1 tỷ / CHỌN NỘI DUNG / KHỞI ĐIỂM" để nhìn dấu chồng.

## Cỡ & vị trí (1080x1920)
| Thành phần | Cỡ | Tâm dọc |
|---|---|---|
| Dòng trắng ngữ cảnh | 74px | 0,615H |
| Chữ đỏ nhấn | 128px (tự co ≤930px) | 0,673H |
| Badge / nhãn | Ø160 / 100px | 0,625H / 0,705H |
| Tiêu đề danh sách / mục | 104 / 80px | 0,18H / từ 0,30H, cách 0,066H |
| Thẻ vàng (cảnh trám) | 762×220, chữ 62px | 0,20 / 0,34 / 0,48H |
| Khung người nói (PiP) | 470×620, x44 y1110, bo 34, viền trắng 5px | góc dưới-trái (tránh cột nút TikTok bên phải) |

## Thời lượng [GỐC — đo đường cong pixel 30fps]
gõ gốc 45 ký tự/s (chế độ đã duyệt: 22 ký tự/s, nhịp lệch ±35%) · nhòe→nét 0,23s · wipe đỏ 0,23s · thẻ nở 0,65s · zoom ramp 0,7s (+20%) · light leak 0,35–0,4s trước điểm cắt · badge 1-2-3 cách 0,14s.

## SFX (`public/sfx/pack/`, bảng trong `finalize-plan.mjs` → `SFX_MAP`)
| Hiệu ứng | SFX | Nhóm |
|---|---|---|
| Dòng chữ trắng, mở priceDrop | ui-digital | UI |
| Chữ đỏ nhấn, cột giá cao nhất | correct-jewel | Xuất hiện |
| Badge chương, thẻ câu hỏi | ui-notification | UI |
| Thẻ vàng, tiêu đề VS, dòng ✓ | pop-bells-sang | Xuất hiện |
| Cột giá thường | ui-digital | UI |
| Gạch giá, dòng ✕, cảnh báo vàng | ui-error | UI |
| Giá mới sau ưu đãi | es-success | Xuất hiện |
| Cảnh báo đỏ / điểm cộng | sparkle-bonus | Xuất hiện |
| Flare, light leak | camera-flash | Chuyển cảnh |
| Người nói thu vào khung góc | ui-whoosh | UI |
Còn dư (chưa dùng): pop-up (quá trầm — bị giọng át), page-turn, camera-shot, camera-shutter, ui-whoosh-2/3.
Mức: **giọng 100%**, đỉnh SFX (50ms) = mức giọng RMS 1s quanh đó **−8 dB** (khoảng lặng dùng mức giọng trung vị −3 dB). Kiểm: `sfx-level.py` (nhỏ hơn giọng) + `sfx-check.py` (còn nghe được, cao tần ≥ +3 dB).
Nguồn SFX: cắt từ video TikTok @vietanh.videoeditor người dùng gửi — **chỉ dùng nội bộ, không đưa lên Git**.
