# Sound design
Đo `hf_peaks.py` (năng lượng >3 kHz quanh mốc, so nền): [XM]
- Nhạc nền suốt video (p5 thấp hơn p50 17,8 dB).
- Chuyển cảnh lớn (bùng sáng, vào/ra bản đồ, thẻ kính): +20…+34 dB — impact/whoosh RÕ.
- Chữ neon/số: +3…+10 dB — SFX NHẸ hoặc không có; chữ dựa vào nhịp lời nói.
Luật dùng (preset `VESM_SFX`):
1. `burst` (impact) CHỈ ở bùng sáng/đổi chủ đề. 2. `page`/`whoosh` khi vào/ra trang kính, bản đồ.
3. `count` tick 3–4 nhịp khi số đếm, `land` (ding) khi số dừng. 4. `chip` mỗi chip ✓. 5. `type` âm nhẹ (0,6–0,7) cho neon — không bắt buộc.
6. Không đặt 2 SFX lớn cách nhau < 0,4 s; giọng nói luôn rõ (nhạc nền ~0,1). Kiểm: `sfx_vs_voice.py` ≥ +3 dB ở SFX chính.
