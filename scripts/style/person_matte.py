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
inp = ["ffmpeg", "-nostdin", "-v", "error", "-ss", str(start), "-i", src] + (["-t", str(dur)] if dur else []) + \
      ["-vf", f"fps={fps},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
rd = subprocess.Popen(inp, stdout=subprocess.PIPE)
wr = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
                       "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "6M", "-deadline", "realtime", "-cpu-used", "8", "-row-mt", "1",
                       "-auto-alt-ref", "0", str(out / "person.webm")], stdin=subprocess.PIPE)
faces, i, prev = [], 0, None
bbox = lambda m: (lambda ys, xs: [round(xs.min() / m.shape[1], 3), round(ys.min() / m.shape[0], 3), round(xs.max() / m.shape[1], 3), round(ys.max() / m.shape[0], 3)] if len(xs) else None)(*np.where(m))
while True:
    buf = rd.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    fr = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    small = cv2.resize(fr, (540, 960))
    r = seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=small), int(i * 1000 / fps))
    cm = [np.squeeze(m.numpy_view()) for m in r.confidence_masks]  # 0 nen, 1 toc, 2 than, 3 mat, 4 ao, 5 khac
    person = np.clip(1.0 - cm[0], 0, 1)
    if prev is not None:  # lam muot theo thoi gian, giam rung vien
        person = 0.65 * person + 0.35 * prev
    prev = person
    a = cv2.resize(person, (W, H), interpolation=cv2.INTER_LINEAR)
    a = cv2.GaussianBlur(a, (0, 0), 1.6)
    a = np.clip((a - 0.35) / 0.4, 0, 1)
    rgba = np.dstack([fr, (a * 255).astype(np.uint8)])
    wr.stdin.write(rgba.tobytes())
    face = (cm[3] + cm[1] * 0.5) > 0.5
    faces.append({"t": round(start + i / fps, 3), "face": bbox(face), "person": bbox(person > 0.5)})
    i += 1
wr.stdin.close()
wr.wait()
(out / "faces.json").write_text(json.dumps(faces))
print(i, "khung ->", out / "person.webm")
