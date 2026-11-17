"""Do chuyen dong camera (tinh tien) tung khung de chu BAM THEO CANH (nhu mau: chu "ĐỂ" lech theo camera).

Dung: .venv/bin/python -I scripts/style/camera_track.py <video> <faces.json> <out.json> [--fps 30]
Phase correlation tren anh xam thu nho, CHE vung nguoi (hop "person" trong faces.json) de chi do nen.
Ra: {"fps":30, "dx":[...], "dy":[...]} = do dich chuyen TICH LUY cua nen (px @1080x1920) tu khung 0;
dung: offset chu = track[t] - track[t_bat_dau]. Tu dat lai 0 o diem cat canh (nhay lon).
"""
import json
import subprocess
import sys

import cv2
import numpy as np

src, fj, out = sys.argv[1:4]
fps = float(sys.argv[sys.argv.index("--fps") + 1]) if "--fps" in sys.argv else 30.0
faces = json.load(open(fj))
W, H = 270, 480
raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", src, "-vf", f"fps={fps},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
win = cv2.createHanningWindow((W, H), cv2.CV_32F)
dx, dy, cx, cy = [0.0], [0.0], 0.0, 0.0
for i in range(1, len(fr)):
    a, b = fr[i - 1].copy(), fr[i].copy()
    p = faces[min(i, len(faces) - 1)].get("person")
    if p:
        x0, y0, x1, y1 = int(p[0] * W), int(p[1] * H), int(p[2] * W), int(p[3] * H)
        m = np.ones_like(a); m[y0:y1, x0:x1] = 0
        a, b = a * m + a.mean() * (1 - m), b * m + b.mean() * (1 - m)
    (sx, sy), resp = cv2.phaseCorrelate(a, b, win)
    if abs(sx) > W * 0.08 or abs(sy) > H * 0.08 or resp < 0.05:  # cat canh / khong tin cay
        sx = sy = 0.0
        if abs(a.mean() - b.mean()) > 12 or resp < 0.05:
            cx = cy = 0.0
    cx += sx * 1080 / W
    cy += sy * 1920 / H
    dx.append(round(cx, 1)); dy.append(round(cy, 1))
json.dump({"fps": fps, "dx": dx, "dy": dy}, open(out, "w"))
print(len(dx), "khung; bien do dx", min(dx), max(dx), "dy", min(dy), max(dy))
