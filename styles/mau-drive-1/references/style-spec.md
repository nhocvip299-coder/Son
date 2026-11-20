# Mẫu "trang kính xanh" (video Drive 1zgJkx…, 83,4 s, 1440x2560 30fps) — học cách làm, không dùng footage/danh tính
Nguồn lưu `reference/mau-drive-1/` (gitignore). Phân tích: `styles/mau-drive-1/analysis/`.
- Nhịp: 18 cắt / 83 s (12,9/phút), shot trung vị 3,5 s [XM analyze].
- Grade xanh cyan-teal toàn video [XM khung].
- **Trang kính xanh** (chớp trắng → video nhoè + phủ teal, vệt sáng rơi dọc, hạt sáng, vòng tròn mờ): dùng cho đoạn GIÁ, VỊ TRÍ (bản đồ lưới), THẺ KÍNH [XM 8,5–14 s, 18–22 s, 41–59 s].
- **Chốt giá**: "Hôm nay" (sans trắng nhỏ) / viết tay vàng / giá cũ gạch đỏ / "giảm còn" / giá mới vàng đếm lùi 2,85→2,76→2,66→2,59→2,55 trong khung góc [XM 9–14 s].
- **Chữ neon**: chữ đứng hẹp cyan phát sáng (KHU NHÀ GIÁ RẺ, NGANG 5M, SÂN TRƯỚC) + viết tay trắng đè, dòng dẫn trắng mảnh [XM].
- **Số đếm chạy** "300 TRIỆU" (15→290→300) [XM 4–8 s]; chữ mảnh to trong suốt "3KM", "70%" [XM].
- **Thẻ kính**: video trong khung bo góc viền neon cyan, tiêu đề viết tay đè góc, chip ✓ hiện dần [XM 41–59 s].
- **Bản đồ lưới tối**: đường đi tự vẽ, ghim, nhãn "3 KM", viết tay "chỉ vài phút" [XM 18–22 s].
- **Viên SĐT** cố định cuối video + "GỌI NGAY" neon [XM 59–83 s].
- Font: viết tay ≈ Great Vibes, chữ hẹp ≈ Oswald/Bebas [UD]. SFX chưa đo [UD].
Áp dụng: `src/styles/bdsLuxury/mauKinhXanh.tsx` (KxPage, KxPrice, KxCard, KxPhone), đổi màu sang xanh dương + trắng.

## Phong cách EDIT (đo thêm: dải khung 10 hình/giây, hf_peaks)
- **Chuyển cảnh = bùng sáng (light burst)**: khung chuyển trắng-kem loá ~0,3 s rồi mở ra cảnh mới (8,5 s; 14,1 s; 33,9 s; 45,8 s; 63,7 s) [XM]. Mỗi lần có SFX whoosh/impact rất to (+33 dB) [XM].
- **Vào bản đồ = trượt khối pixel**: cảnh cũ vỡ thành các dải bậc thang trượt đi (18,1 s) [XM]. Ra bản đồ = **zoom nhoè** về cảnh quay (22,2 s) [XM].
- **Grade teal–orange toàn video**: bóng/sàn ngả xanh teal, đèn/gỗ ngả cam [XM palette #1a2b25, accent #0df9f8, #cf8f4b].
- **Chữ neon cyan** (đứng hẹp, IN HOA, phát sáng #0df9f8): hiện **từng ký tự trái→phải** ~0,4 s, chữ ký trắng nhỏ phía trên/dưới [XM 33–35 s "không gian / PHÒNG THỜ"]. Thoát: mờ + nhoè ~0,3 s [XM 3,3 s].
- **Số tiền vàng** (#cf8f4b → vàng sáng): **đếm chạy** 15→193→249→284→297→300 trong ~0,5 s rồi đứng [XM 4,7 s]; chữ dẫn trắng nhỏ phía trên.
- **Chữ ký viết tay trắng** hiện **viết dần** (~0,6 s) [XM 29 s "Diện tích", 46 s "Hoàn thiện"].
- **Thẻ kính**: sau bùng sáng, thẻ bật từ nhỏ → to (~0,3 s), viền neon, chip ✓ hiện lần lượt ~0,3 s/chip; thoát bằng zoom nhoè [XM 45–55 s].
- Nhạc nền suốt video (p5–p50 17,8 dB) [XM]; chữ thường có SFX nhẹ, chuyển cảnh SFX mạnh.
- Nhịp: 12,9 cắt/phút, shot trung vị 3,5 s [XM].
