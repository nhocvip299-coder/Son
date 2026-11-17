# Thông số 4 style

## A — Kính vàng (đã duyệt, xem skill `mau-quyet-tran-lux`)
`QtGlassText tint="gold"` (#a8742a → #dcae52 → #fff0c4), icon nét mảnh vàng `QtLineIcon`, chữ dẫn trắng nghiêng 44 px (`KText blurIn`).

## B — Bóc tách số liệu (ref08)
- `StackText palette="mint"`: chính Oswald 700 IN HOA, gradient #c9fff3 → #45f2d2 → #10c4a3; quầng #38f3d3 loé 100 % → 38 % trong 0.75 s; bóng #00241d nhòe 7 px.
- Dẫn/phụ: Be Vietnam 600 (dẫn, có thể nghiêng) / 700 (phụ), trắng, cỡ 0.34× chữ chính.
- Vào: chính `zoomSettle` (×1.3 → 1, nhòe 14 → 0, lệch dưới 26 px, 0.4 s); dẫn/phụ `blurIn`. Ra: `blurUp`/`toLeft`/`scaleOut`.
- Số chạy: `count: { to, dec, dur }` + text "{n} M²" (định dạng VN: 486,5; 1.200). Gõ ký tự: `type: true` (0.07 s/ký tự).
- So le chéo: 2 dòng chính với `dx` −0.12 / +0.14.
- Card ảnh: `PhotoCard` bo 34 px, viền trắng 4 px, bóng đổ, bật outBack 0.42 s + nghiêng −3°, nhãn Oswald bạc hà dưới card; SFX `lux-pop`, ra `qtl-pop-whoosh-hot`.
- Đóng băng + quét tầng: `FreezeScan` (nháy trắng 0.2 s + `lux-shutter`, đẩy vào ×1.05, vạch bạc hà vẽ từ trái mỗi 0.2 s kèm `lux-tick`, chip nhãn bên phải; tầng trên cùng chip đặc).
- Phụ đề `box`: hộp rgba(18,20,22,0.58) bo 18 px, Be Vietnam 600 40 px.

## B' — Khoảng cách sơn đường
- `RoadText value unit at end y=0.9 size=300`: `perspective(700px) rotateX(60deg)`, quét hiện từ gần ra xa 0.45 s, số chạy 0 → giá trị 0.6 s, viền sáng bạc hà, `mix-blend-mode: screen` như sơn.
- Đặt DƯỚI `QtPersonFront` (lớp người) → người đứng trước chữ.
- Tên tiện ích: `StackText` bạc hà cỡ ~104–116 ở dải trời (y ≈ 0.17), dẫn "cách …" nghiêng.
- SFX: tên tiện ích `lux-ting`, số `lux-ding` + 4 `lux-tick`.

## C — Hạ tầng trắng (ref07)
- `StackText palette="white"`: chính Be Vietnam 800 trắng, quầng trắng nhẹ; dẫn 600 trắng 0.3×.
- Cụm 4 dòng được: dẫn / CHÍNH / phụ / CHÍNH ("nằm giữa / NGÃ 3 / mặt tiền lên tới / 8M").
- Chuyển vào style: `WhiteFlash` + `qtl-transition`. Phụ đề `plain` 42 px bóng mềm.

## D — Điện ảnh (ref09)
- `Letterbox bar=0.17` (+ màn tối mềm dưới thanh trên để chữ trắng đọc rõ trên tường sáng).
- `SerifTitle`: Playfair 700 (thường) / 500 nghiêng, giãn chữ 0.42em → 0.12em trong 1.1 s, nhòe 10 → 0, bóng kép.
- `SpecBox`: viền 2.5 px tự vẽ 0.6 s, nền đen 45 %, dòng trên Be Vietnam 500 giãn 0.12em, dòng dưới Playfair 52 px.
- SFX: tiêu đề `lux-boom` + `qtl-sparkle-sweep`; khung `lux-ding`; ra khỏi style `lux-whip`.
- Phụ đề `cinema`: Be Vietnam 500 36 px màu ngà trong thanh đen dưới.

## Bảng SFX (public/sfx/real, tải bằng fetch_sfx.py)
| Tên | Nguồn Mixkit | Dùng cho |
|---|---|---|
| lux-ting | 939 Christmas magic bell hit | tiêu đề bạc hà |
| lux-ding | 586 Attention bell ding | số liệu, khung thông số |
| lux-tick | 1125 Typewriter soft click | số chạy, vạch tầng |
| lux-pop | 2364 Hard pop click | card ảnh |
| lux-shutter | 1432 Camera digital shutter | đóng băng khung |
| lux-whip | 869 Flying fast swoosh (đoạn đỉnh) | lia máy nhòe |
| lux-boom | 2650 Movie whoosh impact | tiêu đề điện ảnh |
