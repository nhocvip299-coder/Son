"""Do moc SFX trong video mau: dot bien nang luong cao tan (3-12 kHz) so voi nen 1.5 s xung quanh.
In: thoi diem, do vot (dB), do dai uoc luong, phan loai tho (whoosh = keo dai/len dan, pop = ngan gat, sparkle = rat cao).

Dung: python3 -I scripts/style/sfx_onsets.py <video> <out.json> [--thr 9]
"""
import json
import subprocess
import sys

import numpy as np

SR = 32000
src, out = sys.argv[1], sys.argv[2]
thr = float(sys.argv[sys.argv.index("--thr") + 1]) if "--thr" in sys.argv else 9.0
x = np.frombuffer(subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
hop, win = 320, 1024  # 10 ms
n = (len(x) - win) // hop
w = np.hanning(win)
f = np.fft.rfftfreq(win, 1 / SR)
hi = (f > 3000) & (f < 12000)
vhi = f > 7000
mid = (f > 200) & (f < 3000)
E, V, M = np.zeros(n), np.zeros(n), np.zeros(n)
for i in range(n):
    F = np.abs(np.fft.rfft(x[i * hop: i * hop + win] * w)) ** 2
    E[i], V[i], M[i] = F[hi].sum(), F[vhi].sum(), F[mid].sum()
dB = 10 * np.log10(E + 1e-12)
# nen = trung vi 1.5 s
k = 75
base = np.array([np.median(dB[max(0, i - k): i + k]) for i in range(n)])
ex = dB - base
ev = []
i = 0
while i < n:
    if ex[i] > thr and ex[i] == ex[max(0, i - 15): i + 15].max():
        # bien: tu luc vuot thr-6 den luc tut
        a = i
        while a > 0 and ex[a - 1] > thr - 6:
            a -= 1
        b = i
        while b < n - 1 and ex[b + 1] > thr - 6:
            b += 1
        dur = (b - a + 1) * hop / SR
        rise = (i - a) * hop / SR
        bright = 10 * np.log10((V[a:b + 1].sum() + 1e-12) / (E[a:b + 1].sum() + 1e-12))
        kind = "sparkle" if bright > -4 else "whoosh" if rise > 0.12 or dur > 0.45 else "pop"
        ev.append({"t": round(a * hop / SR, 2), "peak": round(i * hop / SR, 2), "over_db": round(float(ex[i]), 1), "dur": round(dur, 2), "rise": round(rise, 2), "bright_db": round(float(bright), 1), "kind": kind})
        i = b + 15
    else:
        i += 1
json.dump(ev, open(out, "w"), ensure_ascii=False, indent=1)
dur_total = len(x) / SR
print(f"{len(ev)} moc SFX / {dur_total:.0f}s  ({len(ev) / dur_total * 60:.0f}/phut)")
from collections import Counter
print(Counter(e["kind"] for e in ev))
for e in ev[:60]:
    print(f"{e['t']:7.2f}  +{e['over_db']:4.1f}dB  {e['dur']:.2f}s  {e['kind']}")
