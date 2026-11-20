# Typography (preset: presets/style.ts)
| Kiểu | Font mẫu (ước) → bản dùng | Màu | Cỡ | Hiệu ứng | Vào / giữ / ra |
|---|---|---|---|---|---|
| NEON chính | đứng hẹp IN HOA ≈ UTM Bebas [UD] → **Barlow Condensed 800** | lõi #e8ffff → #13fdfe [XM]; quầng cyan rộng + quầng hẹp | cao chữ HOA 111–155 px / 1920 [XM] → 150–220 font | glow 2 lớp, không viền | gõ từng ký tự, nhấp nháy 0→1→0,4→1 trong ~0,1 s/ký tự, cả dòng ~0,4 s [XM]; giữ tới cụm sau; ra mờ+nhoè 0,3 s [XM] |
| Chữ ký | mảnh 1 nét [UD] → **Ms Madi** | trắng (hoặc vàng #fddb5c khi đi với giá/ô tô) [XM] | ≈0,6× chữ neon | quầng trắng mềm | viết dần trái→phải 0,6 s [XM]; đặt lệch PHẢI-DƯỚI neon, nghiêng −5° |
| Dòng dẫn | sans mảnh → **Be Vietnam Pro 500** | trắng | 40–50 px | bóng tối nhẹ | hiện mờ 0,25 s trước số/neon |
| Số tiền | đứng hẹp → **Barlow Condensed 800** | gradient #fff4c2→#fddb5c→#e09a2c + quầng cam [XM] | 190–260 | | đếm 0→giá trị 0,45 s ease-out rồi đứng [XM] |
| Giá cũ | như trên, TRẮNG | #f2ffff + quầng lạnh | 165 | gạch đỏ #ff4d4d phát sáng, vẽ 0,3 s | |
| Số mảnh | serif tương phản cao [UD] → **Playfair 700** | trắng 90 % + quầng cyan | 420 (tự thu ≤740 px) | giãn chữ 0,25→0,08 em khi vào; **nằm SAU người** (`front={<PersonFront/>}`), chân chữ ngang/khuất sau đầu [XM 17 s] | đếm % nếu có |
Luật: 1 khối chữ chính tại một thời điểm; rộng tối đa 740 px (vùng an toàn); chữ đặt giữa ngang, y 0,37–0,42 (neon) hoặc 0,58 (giá thứ cấp); không đè mặt.
