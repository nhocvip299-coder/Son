"""Do vi tri mat (Haar, opencv-python-headless<5) moi 0.5 s tren timeline dau ra -> work/<du-an>/faces.json.
build_plan.py dung file nay de dat tieu de tranh mat. Chay: plan.json truoc -> faces.py -> build_plan.py lai.
Dung: .venv/bin/python -I scripts/review/faces.py projects/<du-an> work/<du-an>
"""
import cv2, json, sys
import numpy as np
proj, W = sys.argv[1], sys.argv[2]
plan = json.load(open(f"{proj}/plan.json"))
cas = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
prof = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")
segs, t = [], 0
for s in plan["segments"]:
    d = (s["srcEndMs"] - s["srcStartMs"]) / s["speed"]; segs.append((t, t + d, s)); t += d
def src_at(o):
    for a, b, s in segs:
        if a <= o < b: return (s["srcStartMs"] + (o - a) * s["speed"]) / 1000
res, cap = [], cv2.VideoCapture(f"{W}/source.mp4")
for o in np.arange(0, t, 500):
    st = src_at(o)
    if st is None: continue
    cap.set(cv2.CAP_PROP_POS_MSEC, st * 1000); ok, fr = cap.read()
    if not ok: continue
    g = cv2.cvtColor(cv2.resize(fr, (270, 480)), cv2.COLOR_BGR2GRAY)
    fs = list(cas.detectMultiScale(g, 1.1, 5, minSize=(28, 28))) + list(prof.detectMultiScale(g, 1.1, 5, minSize=(28, 28)))
    if fs:
        x, y, w, h = max(fs, key=lambda f: f[2] * f[3]); res.append([int(o), int(y * 4), int((y + h) * 4)])
    else: res.append([int(o), None, None])
json.dump(res, open(f"{W}/faces.json", "w"))
print(len(res), "mau,", sum(r[1] is not None for r in res), "co mat")
