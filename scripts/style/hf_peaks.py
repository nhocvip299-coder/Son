"""Do do "nghe ro" cua SFX: dinh nang luong cao tan (5-12 kHz) quanh cac moc so voi trung vi ca video.

Dung: python3 -I scripts/style/hf_peaks.py <video> <t1> [<t2> ...] [--win 0.5] [--local]
--local: so voi nen NGAY TRUOC moc (dung cho clip day SFX; mac dinh so voi trung vi ca video).
- Video mau: chay o cac moc flash/text_events de biet mau co SFX o dau (> +12 dB = co SFX ro).
- Ban dung: chay o cac moc SFX cue de kiem SFX nghe ro tren giong noi (yeu cau CLAUDE.md).
In them muc nen: p5 thap hon p50 bao nhieu dB (< ~18 dB => co nhac nen suot video).
"""
import subprocess
import sys

import numpy as np

args = [a for a in sys.argv[1:]]
win = 0.5
local = "--local" in args
if local:
    args.remove("--local")
if "--win" in args:
    i = args.index("--win"); win = float(args[i + 1]); del args[i:i + 2]
src, times = args[0], [float(x) for x in args[1:]]
sr, hop = 32000, 1600  # 50 ms
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
a = np.frombuffer(raw, np.float32)
n = len(a) // hop
S = np.abs(np.fft.rfft(a[: n * hop].reshape(n, hop) * np.hanning(hop), axis=1))
f = np.fft.rfftfreq(hop, 1 / sr)
hf = 20 * np.log10(S[:, (f > 5000) & (f < 12000)].sum(1) + 1e-9)
tot = 20 * np.log10(S.sum(1) + 1e-9)
med = np.median(hf)
print(f"nen: p5 thap hon p50 {np.percentile(tot, 50) - np.percentile(tot, 5):.1f} dB (< ~18 dB => co nhac nen)")
w = int(win * 20)
for t in times:
    i = int(t * 20)
    seg = hf[max(0, i - w): i + w + 1]
    pk = (max(0, i - w) + int(seg.argmax())) / 20
    ref = np.median(hf[max(0, i - 12): max(1, i - 3)]) if local else med  # --local: so voi 0.15-0.6s truoc moc
    d = seg.max() - ref
    print(f"{t:8.2f}s: +{d:5.1f} dB @ {pk:.2f}s  {'RO' if d > 12 else 'yeu/khong co'}")
