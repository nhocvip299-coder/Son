# Tư duy editor (Editing Decision Engine)

Nguồn: video mẫu `reference/mau-ref-01.mp4` (58s nội dung + 4s outro TikTok, không phải của editor).
Dữ liệu từng sự kiện: `styles/reference-01/timeline.json`. Ký hiệu: **[GỐC]** quan sát/đo được · **[SUY LUẬN]** lý do AI suy ra · **[AI]** đề xuất thêm.

## 1. Cấu trúc video mẫu (đo được)
| Thời gian | Loại cảnh | Hiệu ứng [GỐC] | Lời thoại neo | Lý do [SUY LUẬN] |
|---|---|---|---|---|
| 0.2–1.2 | mặt | "2 NĂM" đỏ + đồng hồ cát 3D, thoát bằng flare | "mất **2 năm**" | Hook = con số chứng minh công sức + vật thể cụ thể |
| 1.4–3.6 | mặt | "Tìm ra quy trình" trắng / "LÀM VIDEO BĐS" đỏ | "tìm…làm video" | Cặp 2 tầng: ngữ cảnh nhỏ + chủ đề to |
| 4.2–6.0 | mặt | đồng hồ 3D cạnh mặt, tan bụi | "5 **phút**" | Minh hoạ khái niệm thời gian, không che mặt |
| 8.0–9.7 | mặt + zoom | ① CHỌN NỘI DUNG, light leak đóng chương | "**Bước 1**" | Mốc chương → badge + zoom + chuyển cảnh |
| 10.8–14.4 | mặt mờ | 2 thẻ kính nghiêng (câu hỏi) | "2 câu hỏi…?" | Câu hỏi = thẻ; nền mờ để đọc |
| 14.4–20.6 | nền trừu tượng | tiêu đề gõ + mục zig-zag | "ví dụ khách mua ở, tiện ích…" | ≥3 ví dụ → rời mặt, não chỉ đọc danh sách |
| 23.3–25.7 | mặt | "KHÔNG CẦN ĐẸP" / "RÕ" "ĐÚNG" đỏ | "không cần… chỉ cần rõ và đúng" | Phủ định (trắng) → khẳng định (đỏ, từng từ) |
| 27.1–32.9 | nền | 3 thẻ vàng xếp dọc | "thứ nhất/hai/ba" | KHUNG hiện ở từ đếm, CHỮ gõ khi nói nội dung |
| 36.3–39.7 | mặt + zoom | "QUAN TRỌNG NHẤT" đỏ → "1 VẤN ĐỀ DUY NHẤT" → "ĐỪNG NÓI" vàng | "quan trọng nhất…đừng nói" | Đỉnh nội dung → đỏ + zoom; cảnh báo → vàng vì khối trước đỏ |
| 41.1–50.7 | nền | thẻ vàng 3D checklist + chữ đỏ cấm | "1 kênh, 1 khung giờ… tuyệt đối không" | Quy tắc có số lượng → checklist; điều cấm đặt dưới |
| 50.7–53.3 | mặt | **không chữ** | "Vì TikTok…" | Giải thích lý do → nghỉ mắt |
| 54.3–55.8 | mặt | ①②③ nổ tia | "**3 bước** này" | Tóm tắt cuối |

Nhịp: 13 điểm cắt/58s, shot trung vị 3,7s; zoom ramp ~20% trong 0,5–0,8s ở mốc chương/đỉnh; ~5 khối chữ/phút trên mặt.
Độ lệch chữ so với từ được nói: thường **+0,1 đến +0,3s** (hiện ngay sau khi nói); badge/hook hiện **trước** 0,1–0,2s.

## 2. Luật quyết định (engine `scripts/refedit/decide.mjs`)
| Luật | Tín hiệu lời thoại | Quyết định |
|---|---|---|
| R10 Hook | số + đơn vị trong 4s đầu (chọn số cuối của chuỗi liệt kê, bỏ "1 X") | chữ đỏ lớn + flare; đạo cụ 3D chỉ khi đơn vị là thời gian |
| R5 Chương | "bước/phần/mẹo N", "ưu điểm/lý do thứ N" | badge số + nhãn ≤4 từ (sau "chính là", ý sau "nhưng") + zoom ramp + light leak |
| R3 Thứ tự | "thứ nhất/hai/ba", "đầu tiên…cuối cùng" | nền + thẻ vàng; khung ở từ đếm, chữ ở nội dung |
| R3 Checklist | ≥3 cụm ngắn có số lượng liền nhau | 1 thẻ vàng 3D, từng dòng gõ khi được nói |
| R4 Liệt kê | "ví dụ…", ≥3 cụm ngắn, "kết nối tới A, B, C" (tên riêng) | nền + tiêu đề + mục zig-zag |
| Câu hỏi | câu kết thúc "?" (có lead "N câu hỏi") | thẻ kính nghiêng, nền footage mờ |
| Đối lập | "không cần X… chỉ cần Y" | dòng trắng + từng từ đỏ |
| R6 Đỉnh | "quan trọng nhất/đáng chú ý nhất/đáng nói nhất/điểm ăn tiền" | chữ đỏ + zoom ramp (+ "1…duy nhất" → số lớn) |
| R7 Cảnh báo | "đừng/không nên/tuyệt đối không/tránh" | vàng nếu khối trước đỏ, ngược lại đỏ |
| R8 Nghỉ | "vì/bởi vì/tại vì/lý do" đầu câu | không chữ, zoom chậm |
| R9 Tóm tắt | "N bước/điều" ở 30% cuối | badge 1..N nổ tia |
| R11 Số liệu | tỷ/triệu/%/m²/tầng giữa bài | chữ đỏ là con số + dòng trắng ngữ cảnh |
| R12 CTA [AI] | "liên hệ/gọi/inbox" ở 25% cuối | "Liên hệ trực tiếp" + tên đỏ |
| R2 Lấp | ≥2s không có điểm nhìn, cụm ≥3 từ nội dung | dòng trắng + cụm đỏ là từ khóa cuối câu (giữ từ ghép: BĐS, tối ưu…) |

Đánh giá trên chính video mẫu: **recall 95%, precision 95%, lệch thời gian trung bình 0,2s** (`references/engine-eval-video-mau.json`). Lưu ý: đây là dữ liệu đã học → chỉ chứng minh engine mã hoá đúng tư duy, không chứng minh tổng quát.

## 3. Lớp DUYỆT của Claude (bắt buộc — engine chỉ là bản nháp)
Bài học từ video Happy Home (2 phút, kể chuyện so sánh): engine đề xuất 14 số đỏ → quá dày, máy móc. Khi duyệt:
- **Gom chuỗi số liên quan** thành 1 đồ họa: thang giá 20→40→146 → `bars`; giá gốc → giá sau ưu đãi → `priceDrop`; ưu đãi liệt kê → `cards`.
- **Câu chuyện 2 chủ thể** → 2 badge chương dù người nói không nói "phần 1/2" [AI].
- **Kết bài so sánh 2 lựa chọn** → `versus` ✓/✕ theo đúng từ được nói.
- Đếm mật độ: trên mặt ≤ ~6 khối/phút; cảnh trám 5–13s, người nói thu vào khung góc.
- Số/cụm ASR không chắc → không hiển thị, báo người dùng.
- Nhãn ≤4 từ, IN HOA cho badge/thẻ; chữ đỏ ≤ ~16 ký tự (tự co cỡ nếu dài).
