"""Kiem ke text tren video mau bang OCR (tesseract vie) theo thoi gian.

Dung: .venv/bin/python -I scripts/style/text_inventory.py <video> <out_dir> [--fps 4] [--jobs 8]
Ra: <out_dir>/ocr_frames.json (moi khung: cac tu + hop bao) va events.json (gom thanh su kien text:
bat dau/ket thuc, noi dung, hop bao, chieu cao chu). Mat do khung cao de bat ca chu hien 0.3s.
"""
import json
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


def arg(n, d):
    return type(d)(sys.argv[sys.argv.index(n) + 1]) if n in sys.argv else d


src, out = sys.argv[1], Path(sys.argv[2])
fps, jobs = arg("--fps", 4.0), arg("--jobs", 8)
fdir = out / "ocr_frames"
fdir.mkdir(parents=True, exist_ok=True)
if not any(fdir.iterdir()):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", src, "-vf", f"fps={fps},scale=720:-2", "-q:v", "2", str(fdir / "f%05d.jpg")], check=True)
files = sorted(fdir.glob("f*.jpg"))


def ocr(p):
    r = subprocess.run(["tesseract", str(p), "-", "-l", "vie", "--psm", "11", "tsv"], capture_output=True, text=True)
    words = []
    for ln in r.stdout.splitlines()[1:]:
        c = ln.split("\t")
        if len(c) < 12 or not c[11].strip():
            continue
        conf, txt = float(c[10]), c[11].strip()
        if conf < 55 or len([ch for ch in txt if ch.isalnum()]) < 2:
            continue
        x, y, w, h = map(int, c[6:10])
        words.append({"t": txt, "c": round(conf), "x": x / 720, "y": y / 1280, "w": w / 720, "h": h / 1280})
    return words


with ThreadPoolExecutor(jobs) as ex:
    res = list(ex.map(ocr, files))
frames = [{"t": round(i / fps, 2), "words": w} for i, w in enumerate(res)]
(out / "ocr_frames.json").write_text(json.dumps(frames, ensure_ascii=False))

# gom su kien: tap tu (chu thuong) giu on dinh qua cac khung lien tiep
events, cur = [], None
for f in frames:
    key = frozenset(w["t"].lower() for w in f["words"] if w["h"] > 0.008)
    if key and cur and len(key & cur["key"]) >= max(1, 0.5 * min(len(key), len(cur["key"]))):
        cur["end"] = f["t"]
        cur["key"] |= key
        cur["n"] += 1
        cur["words"] += [w for w in f["words"] if w["t"].lower() not in {x["t"].lower() for x in cur["words"]}]
    else:
        if cur and cur["n"] >= 1:
            events.append(cur)
        cur = {"start": f["t"], "end": f["t"], "key": key, "n": 1, "words": list(f["words"])} if key else None
if cur:
    events.append(cur)
ev = []
for e in events:
    ws = sorted(e["words"], key=lambda w: (round(w["y"], 2), w["x"]))
    ev.append({"start": e["start"], "end": round(e["end"] + 1 / fps, 2), "text": " ".join(w["t"] for w in ws),
               "y": round(min(w["y"] for w in ws), 3), "y2": round(max(w["y"] + w["h"] for w in ws), 3),
               "x": round(min(w["x"] for w in ws), 3), "maxh": round(max(w["h"] for w in ws) * 1920),
               "nframes": e["n"]})
(out / "events.json").write_text(json.dumps(ev, ensure_ascii=False, indent=1))
print(len(files), "khung,", len(ev), "su kien text")
