# Quy trình lệnh (video mới → MP4 1080x1920 60fps)

```bash
X=ten-du-an                       # vd vid3
# 0. Tai nguyen (lan dau o phien moi): SFX pack + font Nexa
bash scripts/refedit/install-assets.sh /duong/dan/reference-video-edit-thinking-goi.zip
# 1. Tai + proxy + phan tich + boc loi (Drive: drive.usercontent.google.com/download?id=...&confirm=t)
mkdir -p inputs work/$X projects/$X
ffmpeg -i inputs/$X.mov -vf scale=1080:1920 -r 60 -c:v libx264 -crf 18 -pix_fmt yuv420p -g 60 -c:a aac -b:a 256k public/inputs/$X.mp4
node scripts/pipeline/analyze.mjs inputs/$X.mov work/$X/analysis.json
node scripts/pipeline/transcribe.mjs "$PWD/inputs/$X.mov" "$PWD/work/$X"      # whisper large-v3-turbo
#    -> viet projects/$X/asr-fixes.json (khoa 1 tu hoac cum nhieu tu)
# 2. Ban nhap cua engine (kem ly do tung quyet dinh)
node scripts/refedit/decide.mjs work/$X --source inputs/$X.mp4 --fixes projects/$X/asr-fixes.json --no-cut
#    -> work/$X/plan.json, plan-chay-chu.json (co words), decisions.md
# 3. DUYET (Claude): doc decisions.md, ap references/tu-duy-editor.md muc 3.
#    Cach nhanh: chinh work/$X/plan.json. Cach day du: viet projects/$X/plan.mjs theo mau projects/vid2/plan.mjs
# 4. Ap phong cach da duyet (go chu, SFX pack, giong 100%) + khung hinh de NGUOI DUNG DUYET (khong render)
node scripts/refedit/finalize-plan.mjs work/$X/plan.json work/$X/plan-final.json --words work/$X/plan-chay-chu.json
node scripts/refedit/timeline-frames.mjs work/$X/plan-final.json out/$X/timeline     # -> SendUserFile
# 5. Muc SFX theo giong (-8 dB)
node -e 'const f=require("fs");const p=JSON.parse(f.readFileSync("work/'$X'/plan-final.json"));p.voiceVolume=0;p.music=undefined;f.writeFileSync("/tmp/stem.json",JSON.stringify(p))'
node scripts/refedit/_audio.mjs /tmp/stem.json /tmp/stem.wav
.venv/bin/python -I scripts/refedit/sfx-level.py /tmp/stem.wav inputs/$X.mov -8 work/$X/plan-final.json work/$X/plan-final-chay-chu.json
#    (tuy chon) nghe thu: node scripts/refedit/_audio.mjs work/$X/plan-final.json /tmp/mix.wav -> mp3
# 6. Render (CHI khi nguoi dung dong y) -> master -> QC -> ban xem nhanh
node scripts/refedit/render-plan.mjs work/$X/plan-final.json out/$X/$X-raw.mp4        # ~13s render/1s video (4 CPU)
node scripts/pipeline/master-audio.mjs out/$X/$X-raw.mp4 out/$X/$X.mp4
node scripts/pipeline/qc.mjs out/$X/$X.mp4 --fps 60
ffmpeg -i out/$X/$X.mp4 -c:v libx264 -b:v 3700k -maxrate 5000k -bufsize 8000k -c:a aac -b:a 160k -movflags +faststart out/$X/$X-xem-nhanh.mp4
```

## Công cụ kiểm
- `scripts/refedit/compare-stills.mjs <plan> <out.jpg> t...` — so khung GỐC | DỰNG LẠI (dùng với plan kiểm chứng `projects/ref01-verify/*.json`).
- `scripts/refedit/_strip.mjs <plan> <out.jpg> t0 t1 step [cropY cropH]` — dải khung liên tiếp (duyệt chuyển động gõ chữ).
- `scripts/refedit/measure.py`, `curve.py` — đo bbox/đường cong xuất hiện theo lớp màu trên video mẫu mới.
- `scripts/refedit/eval-engine.mjs <plan> <timeline.json>` — chấm engine so với timeline editor thật.
- Học video mẫu MỚI: `scripts/style/analyze_reference.py` + strip/khung như đã làm → viết `styles/<id>/timeline.json` theo cùng schema.

## Bẫy đã gặp
- Proxy phải H.264 (HEVC iPhone không giải mã trong Chromium); render 60fps → proxy 60fps.
- `background-clip:text` bỏ qua opacity của con → `Typed` tách phần đã gõ / chưa gõ (visibility:hidden).
- Regex chữ hoa tiếng Việt: dùng `ch !== ch.toLowerCase()`, KHÔNG dùng `[A-ZÀ-Ỹ]` (bắt cả chữ thường).
- Nền trừu tượng: không dùng CSS blur lớn (render chậm 5×) — dùng radial-gradient mềm.
- Remotion `volume` ≤ 1: muốn SFX to hơn phải giảm giọng; người dùng muốn giọng giữ nguyên → chỉ giảm SFX.
