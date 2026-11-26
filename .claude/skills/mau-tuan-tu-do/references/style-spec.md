# Spec phong cách "Tuấn Tự Do" (@tuantungtrai86) — đo ngày 26/11/2026

[XM] = đo/xác minh trên frame; [UD] = ước đoán. Video mẫu không lưu trong repo (chỉ `analysis.json`).

## 1. Nguồn mẫu
| ID | View | Thời lượng | Cắt/phút | Ghi chú |
|---|---|---|---|---|
| 7706777602547043636 | 7.1M | 7:20 | 11.9 | Cơm bụi cụ bà P1 — hook PiP chủ kênh tách nền |
| 7707100468639485205 | 2.2M | 3:26 | 7.9 | Cơm bụi P3 — hook teaser "ĂN TRỘM LÀ NHƯ NÀO" |
| 7706115299233238280 | 2.2M | 6:50 | 16.2 | Phòng chờ ngân hàng |
| 7705007698474962194 | 2.1M | 4:19 | 15.3 | Phòng chờ sân bay — chuyển cảnh vệt mực trắng, "?" |
| 7692390348395482386 | 2.0M | 5:30 | 13.4 | Nhà hàng P2 |
| 7692760077991693589 | 2.1M | 3:49 | 7.3 | Ngồi bàn ăn — "||||", vệt sáng vàng, thẻ tên 2 dòng |

## 2. Phụ đề (nhận diện chính)
- [XM] Có chữ ở 77–89% số frame. Tâm dọc median 0.196–0.230 H (6/6 video), căn giữa ngang.
- [XM] Chiều cao chữ IN HOA 0.025–0.027 H → font ~74 px @1920.
- [XM] Màu vàng mặt chữ `#F4E91B`…`#F7E015` (chọn `#F6EC14`); trắng `#FFF`; viền đen đặc ~0.11 em; bóng tối mờ.
- [XM] Font: sans tròn đầu, rất đậm, IN HOA, hơi hẹp. So 8 font tròn có tiếng Việt (Nunito, Baloo 2, M PLUS Rounded 1c, Quicksand, Varela Round, Mali, Coiny, Paytone One) với chữ cắt từ video: **Nunito 900 bóp ngang 0.9** khớp nhất (độ tròn, khoảng cách chữ, dấu); Baloo 2 nét giống nhưng chữ quá sát. Viền đen ~0.11 em.
- [XM] Cụm 2–4 từ ("THÌ 100 CUỘC", "NGOÀI NHỮNG THẰNG"), hiện dần từng từ theo lời ("CÓ 140 CỦ MA…" → "…MÀ NHẸ LẮM").
- [XM] Karaoke: chữ vàng nhảy sang từ đang nói ("VỪA VÀO LÂU", "THÌ BÀ Ở", "NHƯ NÀO NHÁ" — dời từng từ qua các frame liên tiếp).
- [XM] Từ khóa số/giá: vàng + to hơn ("CÓ 140 CỦ" to vàng, "MÀ NHẸ LẮM" nhỏ trắng).
- [XM] Lời người khác: tiền tố `*` nhỏ ("*6 VỚI 5 LÀ 11", "*CANH CẢI", "*ĐÂY NÀY GẮP Ở ĐÂY ĂN NÀY").
- [XM] Vào/ra gần như cắt cứng (không trượt/xoay); [UD] thêm nảy 0.9→1 trong 3 frame + mờ 2 frame cho mượt.

## 3. Hook mở đầu
- [XM] Video P3 mở bằng đoạn ở 61.7 s lặp lại tại 0 s (teaser) + "ĂN TRỘM LÀ NHƯ NÀO" vàng toàn bộ, kèm bản sao lớn hơn ~1.3–1.5x, mờ/nhòe phía sau, tắt sau ~1.5 s.
- [XM] Video P1 mở bằng ảnh chủ kênh tách nền ở góc trên trái (~0.04–0.42 W, 0.085–0.28 H) + câu thoại cạnh phải "CHO CHÁU DƯA XÀO ĐI" (từ khóa vàng).

## 4. Hiệu ứng phụ
- [XM] Thẻ tên 2 dòng: dòng 1 vàng to ("CHÚ HƯNG"), dòng 2 trắng nhỏ ("CHÚ TƯỞNG THẬT"), cùng vị trí phụ đề.
- [XM] Vệt sáng vàng ngang mờ (light leak) sau cụm "QUÁ SỞI LỞI LUÔN", ~1.5 s.
- [XM] Sticker "||||" vàng nghiêng, rung giật khi 2 người cười lớn (16–18 s), phía trên đầu.
- [XM] Dấu "?" vàng nhỏ quanh đầu nhân vật khi thắc mắc.
- [XM] Chuyển cảnh vệt mực/chất lỏng trắng loang từ dưới trái phủ kín rồi rút để lại giọt, ~0.4–0.5 s, khi đổi địa điểm (sảnh → lounge).
- [XM] Cuối mỗi phần: "CÒN TIẾP..." vàng rất to ở ~0.69 H + viền tối 4 góc (vignette), phụ đề vẫn chạy phía trên.
- [XM] Không có watermark động; logo in trên áo.

## 5. Âm thanh
- [XM] Không nhạc nền ở cả 6 video (phổ không có vạch hài âm kéo dài ngoài lời nói); giữ tiếng hiện trường.
- [XM] Mốc đột biến cao tần (≥5 kHz) thưa: 0.6–10/phút, phần lớn là tiếng hiện trường (bát đũa, xe), không gắn với chữ.
- [UD] Có tiếng "whoosh" ngắn quanh chuyển cảnh vệt mực (dải nhiễu rộng 0–12 kHz ~0.2 s trước flash trắng).
- Gợi ý SFX khi dựng lại (đã kiểm nghe rõ: năng lượng >3 kHz −17…−27 dB sau master −14 LUFS):
  | Item | SFX |
  |---|---|
  | hook | whoosh (−2f) + impact + sparkle |
  | ink | swish (−7f, tâm cắt) |
  | name | pop + ding |
  | laugh | pops + game |
  | question | blip8 |
  | glow | shine |
  | end | riser (−10f) + hit + shimmer |
  | pip | swoosh-down |

## 6. Dựng hình
- [XM] Quay 1 máy góc rộng (gimbal/POV), nhiều cảnh tay cầm đồ ăn từ trên xuống; selfie khi di chuyển.
- [XM] Đoạn mở cắt dày (shot 0.5–2 s), sau đó shot dài 10–40 s khi trò chuyện.
- [XM] Tông màu tự nhiên, không LUT mạnh; không khung/viền.
- Series nhiều phần (Phần 1…12), tiêu đề "Tên chuyến | Phần N | câu hook".
