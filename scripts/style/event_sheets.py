"""Bang anh cho tung doan co chu chen: moi doan 4 khung (bat dau, +0.2s, +0.5s, giua), 3 doan/hang, 4 hang/bang.

Dung: python3 -I scripts/style/event_sheets.py <video> <overlay_events.json> <out_prefix> [--minh 45]
"""
import json
import re
import subprocess
import sys

src, evp, pre = sys.argv[1], sys.argv[2], sys.argv[3]
minh = int(sys.argv[sys.argv.index("--minh") + 1]) if "--minh" in sys.argv else 45
ev = [e for e in json.load(open(evp)) if len(re.findall(r"[^\W\d_]{2,}", e["text"])) >= 2 or e["maxh_px"] >= 80]
ev = [e for e in ev if e["maxh_px"] >= minh or len(e["text"]) > 12]
W = 180
per_sheet = 12
n = 0
for s in range(0, len(ev), per_sheet):
    chunk = ev[s:s + per_sheet]
    ins, filt, labels = [], "", []
    k = 0
    for e in chunk:
        st, en = e["start"], e["end"]
        for dt in [0.0, 0.2, 0.5, max(0.8, (en - st) / 2)]:
            t = min(st + dt, en)
            ins += ["-ss", f"{max(0, t - 0.05):.2f}", "-i", src]
            lab = f"{t:.2f}"
            filt += f"[{k}:v]trim=end_frame=1,scale={W}:-2,drawtext=text='{lab}':x=3:y=3:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.6[v{k}];"
            k += 1
    rows = []
    for r in range(0, k, 12):
        ids = "".join(f"[v{j}]" for j in range(r, min(k, r + 12)))
        cnt = min(k, r + 12) - r
        filt += f"{ids}hstack=inputs={cnt}[r{r}];" if cnt > 1 else f"{ids}null[r{r}];"
        rows.append(f"[r{r}]")
    # can bang chieu rong hang cuoi
    filt += ("".join(rows) + f"xstack=inputs={len(rows)}:layout=" + "|".join(f"0_{i*320}" for i in range(len(rows))) + ":fill=black" if len(rows) > 1 else rows[0] + "null")
    out = f"{pre}_{n:02d}.jpg"
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *ins, "-filter_complex", filt, "-frames:v", "1", "-q:v", "4", out], check=True)
    print(out, ", ".join(f"{e['start']:.1f}" for e in chunk))
    n += 1
