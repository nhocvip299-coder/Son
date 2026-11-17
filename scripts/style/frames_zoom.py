"""Cat vung chu o do phan giai goc, tung khung lien tiep, xep thanh luoi (de do chuyen dong chu tung khung).

Dung: python3 -I scripts/style/frames_zoom.py <video> <t0> <so_khung> <x0:x1:y0:y1 (ti le)> <out.jpg> [--every 1] [--cols 2] [--w 640]
"""
import subprocess
import sys

src, t0, n, box, out = sys.argv[1], float(sys.argv[2]), int(sys.argv[3]), sys.argv[4], sys.argv[5]
arg = lambda k, d: type(d)(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else d
every, cols, w = arg("--every", 1), arg("--cols", 2), arg("--w", 640)
x0, x1, y0, y1 = map(float, box.split(":"))
rows = (n + cols - 1) // cols
vf = (f"select='not(mod(n\\,{every}))',crop=iw*{x1 - x0}:ih*{y1 - y0}:iw*{x0}:ih*{y0},scale={w}:-2,"
      f"drawtext=text='%{{pts\\:hms\\:{t0}}}':x=4:y=4:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.7,"
      f"tile={cols}x{rows}:padding=3:color=black")
r = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{t0:.3f}", "-i", src, "-vf", vf, "-frames:v", "1", "-q:v", "3", out], capture_output=True, text=True)
if r.returncode:
    sys.exit(r.stderr[-400:])
print(out)
