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

# ---- Phim go ban phim (co) — 5 bien the + phim cach: click cao tan + "thock" tram + tieng nha phim ----
def key(seed, f_body=210, click_hp=2500, dur=0.09, space=False):
    r = np.random.default_rng(seed)
    t = np.arange(int(SR * dur)) / SR
    noise = r.standard_normal(len(t))
    # loc thong cao don gian (sai phan) cho click
    hp = np.diff(noise, prepend=0)
    click = hp * np.exp(-t * (900 if not space else 600))
    body = np.sin(2 * np.pi * f_body * t) * np.exp(-t * (70 if not space else 45)) * (0.6 if not space else 0.9)
    rel = np.zeros_like(t)
    a = int(SR * (0.045 + r.uniform(0, 0.01)))
    n = int(SR * 0.012)
    rel[a:a + n] = np.diff(r.standard_normal(n), prepend=0) * np.exp(-np.arange(n) / SR * 700) * 0.35
    return click * 1.8 + body * 0.6 + rel * 1.4  # nhan manh "tach" cao tan de noi tren giong

def loud(x, drive=3.0):
    """nen mem (tanh) de tang do to cam nhan cua tieng phim ngan ma khong vo dinh"""
    x = x / (np.abs(x).max() + 1e-9)
    return np.tanh(drive * x)

for i in range(5):
    save(f"key{i + 1}.wav", loud(key(100 + i, f_body=190 + i * 18)))
save("keyspace.wav", loud(key(200, f_body=140, dur=0.12, space=True)))
print("ok key1-5.wav keyspace.wav")
