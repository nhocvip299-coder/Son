"""Doi diem cat ve cho am thanh nho nhat (+-win s) va ghep thu am thanh de kiem lai bang Whisper.
Dung: python -I scripts/refedit/refine-edl.py <edl.json> <thu-muc-clip> <out_dir> [--win 0.25]
Clip: <thu-muc>/<clip>.mp4. Ra: <out_dir>/edl-refined.json, <out_dir>/ghep-thu.wav"""
import json, subprocess, sys, numpy as np
edl = json.load(open(sys.argv[1])); src = sys.argv[2]; out = sys.argv[3]
win = float(sys.argv[sys.argv.index("--win") + 1]) if "--win" in sys.argv else 0.25
sr = 16000; cache = {}
def audio(c):
    if c not in cache:
        cache[c] = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{src}/{c}.mp4", "-vn", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
    return cache[c]
def quiet(a, t):
    h = int(0.01 * sr); lo = max(0, int((t - win) * sr)); hi = min(len(a) - h, int((t + win) * sr))
    best, bt = 1e9, t
    for i in range(lo, hi, h // 2):
        e = float((a[i:i + h] ** 2).mean())
        if e < best: best, bt = e, i / sr + 0.005
    return round(bt, 3)
pieces = []; res = []
for k in edl["keep"]:
    a = audio(k["clip"]); ra, rb = quiet(a, k["a"]), quiet(a, k["b"])
    res.append({**k, "a": ra, "b": rb})
    seg = a[int(ra * sr):int(rb * sr)].copy()
    f = int(0.008 * sr); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    pieces.append(seg)
json.dump({**edl, "keep": res}, open(f"{out}/edl-refined.json", "w"), ensure_ascii=False, indent=1)
allw = np.concatenate(pieces)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-", f"{out}/ghep-thu.wav"], input=allw.tobytes())
print(f"{len(res)} doan, tong {len(allw)/sr:.1f}s")
