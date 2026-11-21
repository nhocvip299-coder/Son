"""Do bbox khoi chu theo lop mau tai cac moc thoi gian (toa do chuan hoa 0..1).
Dung: .venv/bin/python -I scripts/refedit/measure.py <video> <json_events> -> in JSON
events: [{"t":0.8,"cls":"red","roi":[x0,y0,x1,y1]}]  (roi chuan hoa, tuy chon)
"""
import cv2, numpy as np, sys, json

def masks(f):
    b, g, r = [f[..., i].astype(int) for i in range(3)]
    mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b)
    s = (mx - mn) / (mx + 1e-6)
    return {
        "red": (r > 200) & (g < 90) & (b < 90) & (s > 0.65),
        "badge": (r > 150) & (g < 90) & (b > 40) & (b < 120) & (s > 0.55),
        "yellow": (r > 210) & (g > 170) & (b < 100),
        "white": (mn > 228),
    }

def bbox(m, roi):
    H, W = m.shape
    x0, y0, x1, y1 = [int(v * d) for v, d in zip(roi, (W, H, W, H))]
    sub = m[y0:y1, x0:x1]
    # bo nhieu: chi giu hang/cot co >= 3 px
    rows = np.where(sub.sum(1) >= 3)[0]; cols = np.where(sub.sum(0) >= 3)[0]
    if len(rows) == 0: return None
    return {"x0": round((x0 + cols[0]) / W, 3), "x1": round((x0 + cols[-1]) / W, 3), "y0": round((y0 + rows[0]) / H, 3), "y1": round((y0 + rows[-1]) / H, 3), "px": int(sub.sum())}

def main():
    cap = cv2.VideoCapture(sys.argv[1])
    ev = json.load(open(sys.argv[2]))
    out = []
    for e in ev:
        cap.set(cv2.CAP_PROP_POS_MSEC, e["t"] * 1000)
        ok, f = cap.read()
        m = masks(f)[e["cls"]]
        out.append({**e, "bbox": bbox(m, e.get("roi", [0, 0.08, 0.92, 0.95]))})
    print(json.dumps(out, ensure_ascii=False))

if __name__ == "__main__":
    main()
