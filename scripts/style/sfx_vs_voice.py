"""Do SFX co NGHE RO tren giong noi khong: so nang luong SFX (stem chi SFX) voi giong (stem chi giong)
o dai 2-12 kHz trong [moc-0.05, moc+0.35]s. >= +3 dB = RO; 0..3 = vua; < 0 = bi giong lap.

Dung: python3 -I scripts/style/sfx_vs_voice.py <sfx.wav> <voice.wav> <t1> [<t2> ...]
"""
import subprocess
import sys

import numpy as np

def load(p):
    return np.frombuffer(subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", p, "-ac", "1", "-ar", "32000", "-f", "f32le", "-"], capture_output=True).stdout, np.float32)

S, V = load(sys.argv[1]), load(sys.argv[2])
def band(x, t):
    a = x[int(max(0, t - 0.05) * 32000): int((t + 0.35) * 32000)]
    if len(a) < 512:
        return 1e-12
    F = np.abs(np.fft.rfft(a * np.hanning(len(a)))) ** 2
    f = np.fft.rfftfreq(len(a), 1 / 32000)
    return F[(f > 2000) & (f < 12000)].sum() + 1e-12
for t in map(float, sys.argv[3:]):
    d = 10 * np.log10(band(S, t) / band(V, t))
    print(f"{t:7.2f}s  SFX/giong {d:+6.1f} dB  {'RO' if d >= 3 else 'vua' if d >= 0 else 'BI LAP'}")
