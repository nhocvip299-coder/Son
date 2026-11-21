"""Duong cong xuat hien cua 1 lop mau trong ROI theo tung frame (do thoi luong animation vao/ra).
Dung: python -I scripts/refedit/curve.py <video> <t0> <t1> <cls> x0 y0 x1 y1
In: t, so px (chuan hoa theo max), cx, cy (trong tam)"""
import cv2, numpy as np, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from measure import masks
v, t0, t1, cls = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
x0, y0, x1, y1 = map(float, sys.argv[5:9])
cap = cv2.VideoCapture(v); fps = cap.get(5)
cap.set(cv2.CAP_PROP_POS_MSEC, t0 * 1000)
rows = []
t = t0
while t <= t1:
    ok, f = cap.read()
    if not ok: break
    H, W = f.shape[:2]
    m = masks(f)[cls][int(y0*H):int(y1*H), int(x0*W):int(x1*W)]
    ys, xs = np.nonzero(m)
    rows.append((round(t, 3), int(m.sum()), round(xs.mean()/W + x0, 3) if len(xs) else 0, round(ys.mean()/H + y0, 3) if len(ys) else 0, round(xs.min()/W+x0,3) if len(xs) else 0, round(xs.max()/W+x0,3) if len(xs) else 0))
    t += 1 / fps
mx = max(r[1] for r in rows) or 1
print(" ".join(f"{r[0]:.2f}:{r[1]/mx:.2f}@{r[2]:.2f},{r[3]:.2f}[{r[4]:.2f}-{r[5]:.2f}]" for r in rows))
