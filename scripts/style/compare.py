"""Anh so sanh: hang tren = video mau, hang duoi = ban dung, tai cac cap moc thoi gian.

Dung: python3 -I scripts/style/compare.py <mau.mp4> <ban-dung.mp4> <out.jpg> <tMau:tDung> [<tMau:tDung> ...]
Vi du: ... ref01_proxy.mp4 out/verify.mp4 cmp.jpg 6.7:1.0 12.8:4.0 22.4:7.5
"""
import subprocess
import sys

a, b, out, pairs = sys.argv[1], sys.argv[2], sys.argv[3], [p.split(":") for p in sys.argv[4:]]
if not pairs:
    sys.exit(__doc__)
inputs, f = [], ""
for i, (ta, tb) in enumerate(pairs):
    inputs += ["-ss", ta, "-i", a, "-ss", tb, "-i", b]
for i, (ta, tb) in enumerate(pairs):
    for j, (src, lab) in enumerate([(2 * i, f"MAU {ta}s"), (2 * i + 1, f"DUNG {tb}s")]):
        f += (f"[{src}:v]trim=end_frame=1,scale=270:480:force_original_aspect_ratio=decrease,pad=270:480:(ow-iw)/2:(oh-ih)/2,"
              f"drawtext=text='{lab}':x=6:y=6:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.6[v{i}_{j}];")
n = len(pairs)
f += "".join(f"[v{i}_0]" for i in range(n)) + f"hstack=inputs={n}[top];" if n > 1 else "[v0_0]null[top];"
f += "".join(f"[v{i}_1]" for i in range(n)) + f"hstack=inputs={n}[bot];" if n > 1 else "[v0_1]null[bot];"
f += "[top][bot]vstack=inputs=2"
r = subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", f, "-frames:v", "1", "-q:v", "3", out],
                   capture_output=True, text=True)
if r.returncode:
    sys.exit(r.stderr[-600:])
print(out)
