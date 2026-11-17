"""Danh muc KEYFRAME: moi khoi chu LON -> 1 hang anh: 10 khung luc VAO (moi 1/30s tu 0.1s truoc) + 6 khung luc RA.
Cat sat quanh hop chu (OCR) de thay ro huong vao, do nhoe, vuot, cach ra.

Dung: python3 -I scripts/style/keyframe_sheets.py <video> <events.json> <out_prefix> [--minh 50] [--per 6]
"""
import json
import re
import subprocess
import sys

src, evp, pre = sys.argv[1:4]
arg = lambda k, d: type(d)(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else d
minh, per = arg("--minh", 50), arg("--per", 6)
ev = json.load(open(evp))
ev = [e for e in ev if e["maxh"] >= minh and len(re.findall(r"[^\W\d_]{2,}|\d{2,}", e["text"])) >= 1 and e["nframes"] >= 2]
# gop su kien sat nhau (cung khoi chu bi OCR tach)
out = []
for e in ev:
    if out and e["start"] - out[-1]["end"] < 0.4 and abs(e["y"] - out[-1]["y"]) < 0.08:
        out[-1]["end"] = e["end"]; out[-1]["y2"] = max(out[-1]["y2"], e["y2"]); continue
    out.append(dict(e))
ev = out
print(len(ev), "khoi chu lon")
TW = 200
for s in range(0, len(ev), per):
    chunk = ev[s:s + per]
    ins, filt, rows = [], "", []
    k = 0
    for r, e in enumerate(chunk):
        y0 = max(0.0, e["y"] - 0.06); y1 = min(1.0, e["y2"] + 0.06)
        times = [e["start"] - 0.25 + j / 30 for j in range(10)] + [e["end"] - 0.2 + j / 30 * 2 for j in range(6)]
        ids = []
        for j, t in enumerate(times):
            ins += ["-ss", f"{max(0, t):.3f}", "-i", src]
            col = "yellow" if j < 10 else "cyan"
            filt += (f"[{k}:v]trim=end_frame=1,crop=iw:ih*{y1 - y0:.3f}:0:ih*{y0:.3f},scale={TW}:-2,"
                     f"drawtext=text='{t:.2f}':x=2:y=2:fontsize=13:fontcolor={col}:box=1:boxcolor=black@0.6[v{k}];")
            ids.append(f"[v{k}]"); k += 1
        filt += "".join(ids) + f"hstack=inputs={len(ids)},scale={TW * 16}:-2,pad={TW * 16}:ih+4:0:0:black[r{r}];"
        rows.append(f"[r{r}]")
    filt += "".join(rows) + (f"vstack=inputs={len(rows)}" if len(rows) > 1 else "null")
    o = f"{pre}_{s // per:02d}.jpg"
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *ins, "-filter_complex", filt, "-frames:v", "1", "-q:v", "4", o], check=True)
    print(o, " | ".join(f"{e['start']:.1f}:{e['text'][:18]}" for e in chunk))
json.dump(ev, open(f"{pre}_events.json", "w"), ensure_ascii=False, indent=1)
