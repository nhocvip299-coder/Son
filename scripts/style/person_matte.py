"""Tach nguoi (MediaPipe selfie_multiclass) + vi tri khuon mat theo tung khung.

Dung: .venv/bin/python -I scripts/style/person_matte.py <video> <out_dir> [--fps 30] [--start 0] [--dur 0]
Ra:
- <out_dir>/person.webm : VP9 co kenh alpha = chi nguoi (dat len tren lop chu -> chu nam SAU lung nguoi)
- <out_dir>/faces.json  : [{t, face:[x0,y0,x1,y1] | null, person:[x0,y0,x1,y1] | null}] (ti le 0..1)
Model: models/selfie_multiclass_256x256.tflite (lop 1 toc, 2 da than, 3 da mat, 4 quan ao, 5 khac).
"""
import json
import subprocess
import sys
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np

ROOT = Path(__file__).resolve().parents[2]


def arg(n, d):
    return type(d)(sys.argv[sys.argv.index(n) + 1]) if n in sys.argv else d


src, out = sys.argv[1], Path(sys.argv[2])
fps, start, dur = arg("--fps", 30.0), arg("--start", 0.0), arg("--dur", 0.0)
out.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1920
opts = mp.tasks.vision.ImageSegmenterOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path=str(ROOT / "models/selfie_multiclass_256x256.tflite")),
    running_mode=mp.tasks.vision.RunningMode.VIDEO,
    output_confidence_masks=True,
    output_category_mask=False,
)
seg = mp.tasks.vision.ImageSegmenter.create_from_options(opts)
# ban tach thu 2 (che do ANH) cho vung cat quanh nguoi o xa
seg2 = mp.tasks.vision.ImageSegmenter.create_from_options(mp.tasks.vision.ImageSegmenterOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path=str(ROOT / "models/selfie_multiclass_256x256.tflite")),
    running_mode=mp.tasks.vision.RunningMode.IMAGE, output_confidence_masks=True, output_category_mask=False))
inp = ["ffmpeg", "-nostdin", "-v", "error", "-ss", str(start), "-i", src] + (["-t", str(dur)] if dur else []) + \
      ["-vf", f"fps={fps},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
rd = subprocess.Popen(inp, stdout=subprocess.PIPE)
wr = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
                       "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-crf", "12", "-b:v", "0", "-deadline", "good", "-cpu-used", "4", "-row-mt", "1",  # gan khong mat net: lop nguoi de len video goc phai SAC nhu goc
                       "-auto-alt-ref", "0", str(out / "person.webm")], stdin=subprocess.PIPE)
faces, i, prev = [], 0, None
bbox = lambda m: (lambda ys, xs: [round(xs.min() / m.shape[1], 3), round(ys.min() / m.shape[0], 3), round(xs.max() / m.shape[1], 3), round(ys.max() / m.shape[0], 3)] if len(xs) else None)(*np.where(m))
while True:
    buf = rd.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    fr = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    small = cv2.resize(fr, (720, 1280))  # do phan giai cao hon -> vien toc/vai chinh xac hon
    r = seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=small), int(i * 1000 / fps))
    cm = [np.squeeze(m.numpy_view()) for m in r.confidence_masks]  # 0 nen, 1 toc, 2 than, 3 mat, 4 ao, 5 khac
    person = np.clip(1.0 - cm[0], 0, 1)
    # NGUOI NHO (dung xa): cat vung quanh nguoi, phong to roi tach lai -> dau/toc/mat khong bi mat
    ys, xs = np.where(person > 0.4)
    if len(ys) > 50 and (ys.max() - ys.min()) < 0.6 * person.shape[0]:
        h0, w0 = person.shape
        y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
        py, px = int((y1 - y0) * 0.25) + 10, int((x1 - x0) * 0.35) + 10
        y0, y1, x0, x1 = max(0, y0 - py), min(h0, y1 + py), max(0, x0 - px), min(w0, x1 + px)
        sy, sx = H / h0, W / w0
        crop = fr[int(y0 * sy):int(y1 * sy), int(x0 * sx):int(x1 * sx)]
        k = 1024 / max(crop.shape[:2])
        cz = cv2.resize(crop, (max(8, int(crop.shape[1] * k)) // 2 * 2, max(8, int(crop.shape[0] * k)) // 2 * 2))
        r2 = seg2.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(cz)))
        c2 = [np.squeeze(m.numpy_view()) for m in r2.confidence_masks]
        p2 = np.clip(1.0 - c2[0], 0, 1)
        head = np.clip(c2[1] + c2[3], 0, 1)  # toc + mat: luon giu dac
        p2 = np.maximum(p2, (head > 0.25).astype(np.float32))
        person = person.copy()
        person[y0:y1, x0:x1] = np.maximum(person[y0:y1, x0:x1] * 0.3, cv2.resize(p2, (x1 - x0, y1 - y0)))
    if prev is not None:  # lam muot theo thoi gian, giam rung vien
        person = 0.85 * person + 0.15 * prev  # it lam muot -> vien khong tre khi nguoi di (het bong ma)
    prev = person
    # NGUOI KHONG BI KHUYET: mat na dac -> giu manh lon nhat, lap lo thung (to cung/ken ao), dong kin khe, gian nhe vien
    hard = (person > 0.4).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(hard, 8)
    if n > 1:
        keep = 1 + np.argsort(stats[1:, cv2.CC_STAT_AREA])[::-1][:2]  # nguoi + (tay/vat cam) lon thu 2
        hard = np.isin(lab, [k for k in keep if stats[k, cv2.CC_STAT_AREA] > 0.02 * stats[1:, cv2.CC_STAT_AREA].max()]).astype(np.uint8)
    hard = cv2.morphologyEx(hard, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    ff = hard.copy(); mask = np.zeros((ff.shape[0] + 2, ff.shape[1] + 2), np.uint8)
    cv2.floodFill(ff, mask, (0, 0), 1)
    holes = (1 - ff).astype(np.uint8)  # lo kin ben trong
    hn, hl, hs, _ = cv2.connectedComponentsWithStats(holes, 8)
    lim = 0.015 * max(1, int(hard.sum()))
    small_holes = np.isin(hl, [k for k in range(1, hn) if hs[k, cv2.CC_STAT_AREA] < lim])  # chi lap lo NHO (khuyet), giu khe giua 2 chan/tay
    hard = hard | small_holes.astype(np.uint8)
    hard = cv2.dilate(hard, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
    a = cv2.resize(hard.astype(np.float32), (W, H), interpolation=cv2.INTER_LINEAR)
    a = cv2.GaussianBlur(a, (0, 0), 1.2)  # vien mem 1–2px, loi dac 100%
    a = np.clip(a * 1.6, 0, 1)
    rgba = np.dstack([fr, (a * 255).astype(np.uint8)])
    wr.stdin.write(rgba.tobytes())
    face = (cm[3] + cm[1] * 0.5) > 0.5
    faces.append({"t": round(start + i / fps, 3), "face": bbox(face), "person": bbox(person > 0.5)})
    i += 1
wr.stdin.close()
wr.wait()
(out / "faces.json").write_text(json.dumps(faces))
print(i, "khung ->", out / "person.webm")
