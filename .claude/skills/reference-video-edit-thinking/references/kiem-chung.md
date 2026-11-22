# Kết quả kiểm chứng (đã chạy thật)

## A. Dựng lại 4 phân cảnh video mẫu (`projects/ref01-verify/*.json`, `out/refverify/`)
Footage mặt = "clean plate" (đoạn không chữ) của chính video mẫu; tiếng = tiếng gốc đúng đoạn → so được thời điểm.
| Cảnh | Gốc | Sai lệch phát hiện → đã sửa |
|---|---|---|
| S1 Bước 1 (7,9–9,75s) | badge + nhãn nhòe→nét + light leak | nhãn nhỏ 15% (86→100px), gốc hiện mờ sớm hơn (labelAt 0.25→0), leak yếu (tăng độ phủ) |
| S2 Danh sách (14,4–20,6s) | tiêu đề gõ + mục zig-zag | mục giãn 0,042→0,066H, chữ 70→80px, tiêu đề gõ nhanh hơn (90 ký tự/s) |
| S3 3 thẻ vàng (25,7–32,9s) | thẻ nở + chữ gõ | thẻ nở đồng thời 2 chiều 0,65s gần tuyến tính (đo lại), nền thẻ vàng hơn, chữ 56→62px |
| S4 Nhấn mạnh (36,25–39,75s) | QUAN TRỌNG NHẤT → 1 VẤN ĐỀ → ĐỪNG NÓI | chữ đỏ là Poppins-đậm không phải Montserrat; "1" to hơn; ĐỪNG NÓI trễ 0,25s; số "1" còn mờ phía sau |

## B. Engine trên lời thoại video mẫu
recall 0,95 · precision 0,95 · lệch thời gian TB 0,20s (19/20 sự kiện). Sự kiện "lệch" còn lại là do timeline gốc tách 2 dòng chữ thành 2 sự kiện.

## C. Video thật Happy Home (118,5s) — bản người dùng nhận
- QC: 1080x1920, 60fps, 7110 khung, -13,9 LUFS, true peak -3,7 dBTP, 0 lỗi.
- Giọng giữ nguyên (chênh tổng -0,18 dB do SFX + nhạc nền). SFX: 51/51 thấp hơn giọng (trung vị -8,0 dB); 44/51 vẫn nhận ra trên giọng (cao tần ≥ +3 dB).
- Font: kiểm ở độ phân giải đầy đủ, đúng dấu "TRẦM LẮNG", "Trả", "tỷ".

## D. Lịch sử phản hồi người dùng (đã đưa vào mặc định)
1. Font lỗi → Phudu + Nexa Heavy (bộ 100 font Việt hoá của người dùng).
2. Cảnh trám không phủ kín → người nói thu vào khung góc; dùng animation cho điểm nhấn.
3. Chữ kiểu gõ bàn phím; SFX từ bộ TikTok; chọn A = không tiếng gõ phím.
4. SFX nhỏ hơn giọng, giọng giữ nguyên.
5. Duyệt khung hình timeline trước khi render; ưu tiên thời gian → 1 bản.
