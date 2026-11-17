"""Chon vi tri doc an toan cho khoi chu: KHONG de chu len mat nhan vat.

Dung: python3 -I scripts/style/place_text.py <faces.json> <t0> <t1> <chieu-cao-khoi(ti le H)> [--prefer 0.6] [--margin 0.04]
In ra: y (dinh khoi, ti le H) an toan + ly do. Uu tien: giu `prefer` neu khong cham mat;
neu cham -> dat ngay duoi cam (mat_duoi + margin), neu khong du cho -> tren dau (mat_tren - margin - cao)
-> neu van khong duoc: "behind" (dat SAU lung nguoi bang QtPersonFront, chu bat buoc dam day).
Vung an toan TikTok: 0.11H .. 0.73H.
"""
import json
import sys

F = json.load(open(sys.argv[1]))
t0, t1, h = float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
arg = lambda n, d: float(sys.argv[sys.argv.index(n) + 1]) if n in sys.argv else d
prefer, m = arg("--prefer", 0.6), arg("--margin", 0.04)
TOP, BOT = 0.11, 0.73
fs = [f["face"] for f in F if t0 <= f["t"] <= t1 and f["face"]]
if not fs:
    print(json.dumps({"y": prefer, "mode": "free", "why": "khong co mat trong khoang nay"}))
    sys.exit()
ftop, fbot = min(f[1] for f in fs), max(f[3] for f in fs)
hit = lambda y: not (y + h < ftop - m or y > fbot + m)
if not hit(prefer) and TOP <= prefer and prefer + h <= BOT:
    r = {"y": prefer, "mode": "free", "why": f"mat {ftop:.2f}-{fbot:.2f}, khong cham"}
elif fbot + m + h <= BOT:
    r = {"y": round(fbot + m, 3), "mode": "below-face", "why": f"mat {ftop:.2f}-{fbot:.2f} -> dat duoi cam"}
elif ftop - m - h >= TOP:
    r = {"y": round(ftop - m - h, 3), "mode": "above-head", "why": f"mat {ftop:.2f}-{fbot:.2f} -> dat tren dau"}
else:
    r = {"y": round(max(TOP, ftop - h * 0.4), 3), "mode": "behind", "why": f"mat {ftop:.2f}-{fbot:.2f} chiem het cho trong -> dat SAU LUNG nguoi, chu dam day"}
print(json.dumps(r, ensure_ascii=False))
