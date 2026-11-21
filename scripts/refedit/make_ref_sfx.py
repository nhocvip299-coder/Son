"""SFX bo sung cho phong cach mau-ref-01 (tu tong hop, khong ban quyen) -> public/sfx/.
- tick.wav  : tic-tac dong ho 4 nhip (quan sat: 4.2-5.0s video mau)
- bubble.wav: 'pop' co cao do ~0.8-1.4kHz ngan (quan sat: vach am sac ngan quanh moc chu hien)
Dung: .venv/bin/python -I scripts/refedit/make_ref_sfx.py
"""
import wave, numpy as np
from pathlib import Path
SR = 48000
OUT = Path(__file__).resolve().parents[2] / "public" / "sfx"

def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.89  # -1 dBFS
    st = np.stack([x, x], 1)
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())

def tick(f0, d=0.045):
    t = np.arange(int(SR * d)) / SR
    rng = np.random.default_rng(int(f0))
    click = rng.standard_normal(len(t)) * np.exp(-t * 400)
    tone = np.sin(2 * np.pi * f0 * t) * np.exp(-t * 120) + 0.5 * np.sin(2 * np.pi * f0 * 2.7 * t) * np.exp(-t * 200)
    return 0.6 * click + tone

out = np.zeros(int(SR * 1.0))
for i, st in enumerate([0.0, 0.25, 0.5, 0.75]):
    s = tick(3200 if i % 2 == 0 else 2500)
    a = int(st * SR); out[a:a + len(s)] += s
save("tick.wav", out)

d = 0.16
t = np.arange(int(SR * d)) / SR
f = 780 + 620 * (1 - np.exp(-t * 40))  # chirp len
ph = 2 * np.pi * np.cumsum(f) / SR
env = np.minimum(1, t / 0.004) * np.exp(-t * 28)
x = (np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.12 * np.sin(3.1 * ph)) * env
# lop "tinh" cao tan 3.5-5kHz de noi tren giong noi (kiem bang sfx-check.py)
x += 0.55 * np.sin(2 * np.pi * np.cumsum(3500 + 1500 * (1 - np.exp(-t * 60))) / SR) * np.minimum(1, t / 0.002) * np.exp(-t * 45)
# them chut "click" cao tan de nghe ro tren giong noi
x[: int(SR * 0.006)] += np.random.default_rng(3).standard_normal(int(SR * 0.006)) * 0.35
save("bubble.wav", x)
print("ok tick.wav bubble.wav")

# ---- Phim go ban phim v2 (giong ghi am that hon): nhan (click nhua) + cham day (thock) + cong huong vo + nha phim ----
def bandnoise(r, n, lo, hi):
    x = r.standard_normal(n)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, n)

def key2(seed, space=False):
    r = np.random.default_rng(seed)
    dur = 0.16 if space else 0.12
    n = int(SR * dur); t = np.arange(n) / SR; x = np.zeros(n)
    # 1) nhan: click nhua sac 2-6kHz, 3-5ms
    L = int(SR * 0.006)
    x[:L] += bandnoise(r, L, 2000, 6500) * np.exp(-np.arange(L) / SR * 900) * 1.0
    # 2) cham day sau ~6-10ms: thock 300-1500Hz
    a = int(SR * r.uniform(0.006, 0.010)); L2 = int(SR * 0.03)
    x[a:a + L2] += bandnoise(r, L2, 250 if space else 350, 1400) * np.exp(-np.arange(L2) / SR * (120 if space else 180)) * (1.3 if space else 0.9)
    # 3) cong huong vo ban phim (sine tat dan)
    for fr, amp in [(r.uniform(900, 1500), 0.25), (r.uniform(2000, 3200), 0.15)]:
        x[a:] += amp * np.sin(2 * np.pi * fr * t[: n - a]) * np.exp(-t[: n - a] * 90)
    # 4) nha phim nhe sau 55-85ms
    b = int(SR * r.uniform(0.055, 0.085)); L3 = int(SR * 0.008)
    if b + L3 < n:
        x[b:b + L3] += bandnoise(r, L3, 1800, 5000) * np.exp(-np.arange(L3) / SR * 700) * 0.35
    if space:  # tieng lach cach thanh cach
        c = int(SR * 0.02); L4 = int(SR * 0.04)
        x[c:c + L4] += bandnoise(r, L4, 600, 3000) * np.exp(-np.arange(L4) / SR * 80) * 0.3
    return x

def loud(x, drive=2.2):
    x = x / (np.abs(x).max() + 1e-9)
    return np.tanh(drive * x)

for i in range(8):
    save(f"key{i + 1}.wav", loud(key2(300 + i)))
save("keyspace.wav", loud(key2(400, space=True)))
print("ok key1-8.wav keyspace.wav (v2)")
