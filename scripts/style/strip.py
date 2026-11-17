"""Cat day khung day dac quanh 1 moc de do animation chu (vao/thoat, easing, toc do go chu).

Dung: python3 -I scripts/style/strip.py <video> <t_giay> <out.jpg> [--dur 1.2] [--step 0.1] [--crop y0:y1] [--before 0.3]
- Lay khung tu (t - before) den (t + dur), moi `step` giay; --crop 0.5:0.75 = chi lay dai doc 50%-75% chieu cao.
- Moi khung gan nhan thoi gian; xep 1 hang ngang (toi da 12 khung/hang).
"""
import subprocess
import sys


def arg(name, default):
    return type(default)(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default


src, t, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
dur, step, before, crop = arg("--dur", 1.2), arg("--step", 0.1), arg("--before", 0.3), arg("--crop", "0:1")
y0, y1 = map(float, crop.split(":"))
start = max(0.0, t - before)
n = int(round((dur + before) / step)) + 1
cols = min(12, n)
rows = (n + cols - 1) // cols
w = 270
vf = (f"fps={1/step},scale={w}:-2,crop=iw:ih*{y1 - y0}:0:ih*{y0},"
      f"drawtext=text='%{{pts\\:hms\\:{start}}}':x=6:y=6:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.6,"
      f"tile={cols}x{rows}:padding=4:color=black")
r = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{start:.3f}", "-t", f"{dur + before:.3f}", "-i", src,
                    "-vf", vf, "-frames:v", "1", "-q:v", "3", out], capture_output=True, text=True)
if r.returncode:
    sys.exit(r.stderr[-500:])
print(out, f"({n} khung, {step}s/khung, tu {start:.2f}s)")
