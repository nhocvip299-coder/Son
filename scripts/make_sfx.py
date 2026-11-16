"""Tong hop thu vien sound effect (SFX) tu dau bang numpy -> public/sfx/*.wav.

Tu tao nen khong vuong ban quyen. Moi file 48kHz stereo, chuan hoa dinh -1 dBFS.
Chay: .venv/bin/python scripts/make_sfx.py
"""
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.005, r=0.2, curve=3.0):
    """Attack tuyen tinh + release mu."""
    x = np.ones(n)
    na = max(1, int(SR * a))
    x[:na] = np.linspace(0, 1, na)
    x[na:] = np.exp(-curve * np.linspace(0, 1, n - na) / max(r, 1e-3))
    return x


def bp(x, lo, hi, order=4):
    sos = butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return sosfilt(sos, x)


def lp(x, f, order=4):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def sweep_noise(d, f0, f1, q=0.35):
    """Noise loc bang thong quet tan so (whoosh)."""
    n = int(SR * d)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    blocks = 64
    edges = np.linspace(0, n, blocks + 1, dtype=int)
    for i in range(blocks):
        c = f0 * (f1 / f0) ** (i / (blocks - 1))
        s, e = edges[i], edges[i + 1]
        seg = bp(noise[max(0, s - 2048):e], max(40, c * (1 - q)), min(SR / 2 - 100, c * (1 + q)), 2)
        out[s:e] = seg[-(e - s):]
    return out


def stereo(x, width=0.0, pan_sweep=False):
    if pan_sweep:
        p = np.linspace(-0.6, 0.6, len(x))
    else:
        p = np.zeros(len(x))
    l = x * np.sqrt((1 - p) / 2) * np.sqrt(2)
    r = x * np.sqrt((1 + p) / 2) * np.sqrt(2)
    if width:
        d = int(SR * 0.012)
        r = np.concatenate([np.zeros(d), r[:-d]]) * (1 - width) + r * width
    return np.stack([l, r], axis=1)


def norm(x, peak_db=-1.0):
    peak = np.max(np.abs(x)) or 1.0
    return x / peak * 10 ** (peak_db / 20)


def save(name, x):
    OUT.mkdir(parents=True, exist_ok=True)
    if x.ndim == 1:
        x = stereo(x)
    # fade 3ms cuoi de tranh tieng click
    f = int(SR * 0.003)
    x[-f:] *= np.linspace(1, 0, f)[:, None]
    sf.write(OUT / f"{name}.wav", norm(x).astype(np.float32), SR, subtype="PCM_24")
    print("wrote", name, f"{len(x) / SR:.2f}s")


# 1. whoosh: noise quet 300 -> 4000 Hz, envelope hinh chuong
d = 0.55
w = sweep_noise(d, 300, 4000)
w *= np.sin(np.pi * np.linspace(0, 1, len(w))) ** 1.5
save("whoosh", stereo(w, pan_sweep=True))

# 2. swoosh-down: nguoc lai, ngan hon
d = 0.4
w = sweep_noise(d, 5000, 400)
w *= np.sin(np.pi * np.linspace(0, 1, len(w))) ** 2
save("swoosh-down", stereo(w, pan_sweep=True))

# 3. pop: sine pitch-drop + click nhe
tt = t(0.12)
f = 900 * np.exp(-tt * 35) + 180
pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.001, 0.08, 4)
pop += 0.25 * bp(rng.standard_normal(len(tt)), 2000, 8000) * env(len(tt), 0.0005, 0.01, 5)
save("pop", pop)

# 4. impact (boom dien anh): sub 50Hz + noise burst + tail
tt = t(1.3)
sub = np.sin(2 * np.pi * np.cumsum(55 * np.exp(-tt * 2) + 35) / SR) * env(len(tt), 0.002, 0.9, 3)
burst = lp(rng.standard_normal(len(tt)), 1800) * env(len(tt), 0.001, 0.15, 5)
save("impact", stereo(sub * 1.0 + burst * 0.6, width=0.6))

# 5. ding: chuong (cac partial khong dieu hoa)
tt = t(1.4)
ding = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * k)
           for f, a, k in [(1318, 1, 3), (2637, 0.45, 5), (3520, 0.25, 7), (5274, 0.12, 9)])
ding *= env(len(tt), 0.002, 10, 0.1)
save("ding", stereo(ding, width=0.5))

# 6. riser: noise + sine tang dan, 1.2s (dung truoc cao trao)
d = 1.2
tt = t(d)
r = sweep_noise(d, 400, 7000, 0.25) * 0.7
r += 0.3 * np.sin(2 * np.pi * np.cumsum(200 + 1200 * (tt / d) ** 2) / SR)
r *= (tt / d) ** 2.2
save("riser", stereo(r, width=0.5))

# 7. click (UI tap)
tt = t(0.05)
c = bp(rng.standard_normal(len(tt)), 2500, 9000) * env(len(tt), 0.0003, 0.008, 6)
c += 0.5 * np.sin(2 * np.pi * 1800 * tt) * env(len(tt), 0.0003, 0.015, 6)
save("click", c)

# 8. glitch: cac manh square/noise ngau nhien
d = 0.35
n = int(SR * d)
g = np.zeros(n)
pos = 0
while pos < n:
    L = int(SR * rng.uniform(0.008, 0.04))
    kind = rng.integers(0, 3)
    tt = np.arange(L) / SR
    if kind == 0:
        seg = np.sign(np.sin(2 * np.pi * rng.uniform(80, 1200) * tt))
    elif kind == 1:
        seg = rng.standard_normal(L)
    else:
        seg = np.zeros(L)
    g[pos:pos + L] = seg[: n - pos] * rng.uniform(0.3, 1)
    pos += L
save("glitch", stereo(lp(g, 9000) * 0.8, width=0.3))

# 9. typing (go phim) - 8 nhip
d = 0.8
n = int(SR * d)
ty = np.zeros(n)
for i in range(8):
    s = int(SR * (i * 0.09 + rng.uniform(0, 0.02)))
    L = int(SR * 0.03)
    k = bp(rng.standard_normal(L), 1500, 7000) * env(L, 0.0003, 0.01, 6)
    ty[s:s + L] += k[: n - s] * rng.uniform(0.6, 1)
save("typing", ty)

# 10. sparkle (lap lanh): nhieu sine cao ngan
d = 0.9
n = int(SR * d)
sp = np.zeros(n)
for i in range(14):
    s = int(rng.uniform(0, 0.6) * SR)
    L = int(SR * 0.25)
    tt = np.arange(L) / SR
    note = np.sin(2 * np.pi * rng.uniform(2500, 6000) * tt) * np.exp(-tt * 18)
    sp[s:s + L] += note[: n - s]
save("sparkle", stereo(sp, width=0.7))

print("Done ->", OUT)


# ---- Nhac nen ambient 16s (tu tong hop): Am - F - C - G, pad + nhip pulse nhe ----
def make_bed(seconds=16.0, bpm=96):
    n = int(SR * seconds)
    tt = np.arange(n) / SR
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # MIDI
    bar = seconds / 4
    out = np.zeros((n, 2))
    for ci, ch in enumerate(chords):
        s, e = int(ci * bar * SR), int((ci + 1) * bar * SR)
        seg_t = tt[: e - s]
        xfade = np.minimum(1, np.minimum(seg_t / 0.4, (bar - seg_t) / 0.4))
        for k, m in enumerate(ch + [ch[0] - 12]):
            f = 440 * 2 ** ((m - 69) / 12)
            for det, side in ((-0.12, 0), (0.12, 1)):
                ff = f * 2 ** (det / 12)
                saw = 2 * ((seg_t * ff) % 1) - 1
                out[s:e, side] += saw * 0.12 * xfade
    pad = np.stack([lp(out[:, 0], 1400), lp(out[:, 1], 1400)], axis=1)
    beat = 60 / bpm
    kick = np.zeros(n)
    for b in np.arange(0, seconds, beat):
        i = int(b * SR)
        L = int(0.25 * SR)
        kt = np.arange(L) / SR
        k = np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-kt * 30)) / SR) * np.exp(-kt * 14)
        kick[i:i + L] += k[: n - i] * 0.5
    hat = np.zeros(n)
    for b in np.arange(beat / 2, seconds, beat):
        i = int(b * SR)
        L = int(0.04 * SR)
        hat[i:i + L] += bp(rng.standard_normal(L), 7000, 14000) * np.exp(-np.arange(L) / SR * 90)[: n - i] * 0.15
    mix = pad + np.stack([kick + hat, kick + hat], axis=1)
    mix[: int(0.5 * SR)] *= np.linspace(0, 1, int(0.5 * SR))[:, None]
    p = OUT.parent / "music"
    p.mkdir(parents=True, exist_ok=True)
    sf.write(p / "bed-ambient.wav", norm(mix, -3).astype(np.float32), SR, subtype="PCM_24")
    print("wrote music/bed-ambient", seconds, "s")



# ---- SFX bo sung cho Text Presets ----
# 11. write: tieng but viet tren giay (noise loc + bien do theo net)
d = 0.55
n = int(SR * d)
tt = np.arange(n) / SR
strokes = np.clip(np.sin(2 * np.pi * 7.5 * tt) * 0.5 + 0.6 + 0.3 * rng.standard_normal(n).cumsum() / np.sqrt(n), 0, 1)
w = bp(rng.standard_normal(n), 2500, 9000) * strokes * np.minimum(1, tt / 0.03) * np.minimum(1, (d - tt) / 0.08)
save("write", stereo(w * 0.7, width=0.3))

# 12. swish: vut nhe, ngan (ve duong cong / gach)
d = 0.28
w = sweep_noise(d, 1500, 7000, 0.3)
w *= np.sin(np.pi * np.linspace(0, 1, len(w))) ** 2
save("swish", stereo(w, pan_sweep=True))

# 13. shimmer: lap lanh doi mau (arpeggio sine cao)
d = 0.9
n = int(SR * d)
sh = np.zeros(n)
for i, m in enumerate([84, 88, 91, 96, 100]):
    s0 = int(i * 0.07 * SR)
    tt = np.arange(n - s0) / SR
    sh[s0:] += np.sin(2 * np.pi * 440 * 2 ** ((m - 69) / 12) * tt) * np.exp(-tt * 6) * 0.4
save("shimmer", stereo(sh, width=0.6))

# 14. ring: chuong dien thoai ngan (2 hoi)
d = 1.0
tt = t(d)
gate = ((tt % 0.5) < 0.38).astype(float)
ring = (np.sin(2 * np.pi * 440 * tt) + np.sin(2 * np.pi * 480 * tt)) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 20 * tt))) * gate
save("ring", stereo(lp(ring, 4000) * 0.6))

# 15. hit: tieng "dap" khi ca trang chu xuat hien (sub + noise burst ngan)
tt = t(0.6)
hit = np.sin(2 * np.pi * np.cumsum(80 * np.exp(-tt * 9) + 45) / SR) * env(len(tt), 0.001, 0.35, 4)
hit += 0.5 * lp(rng.standard_normal(len(tt)), 5000) * env(len(tt), 0.0005, 0.05, 5)
save("hit", stereo(hit, width=0.5))


# ---- SFX bam ten am thanh trong preset CapCut (tu tong hop, to + ro hon) ----
def sq(f, tt):
    return np.sign(np.sin(2 * np.pi * f * tt))

def note(m, d, wave="sine", dec=8.0):
    tt = t(d)
    f = 440 * 2 ** ((m - 69) / 12)
    w = np.sin(2 * np.pi * f * tt) if wave == "sine" else sq(f, tt) * 0.5
    return w * np.exp(-tt * dec) * np.minimum(1, tt / 0.003)

def seq(parts):
    n = max(int(o * SR) + len(x) for o, x in parts)
    out = np.zeros(n)
    for o, x in parts:
        i = int(o * SR)
        out[i:i + len(x)] += x
    return out

# positive: hop am di len sang + shimmer (PositiveTransition_*)
pos = seq([(i * 0.06, note(m, 0.6, dec=5) * (0.9 - i * 0.1)) for i, m in enumerate([72, 76, 79, 84, 88])])
pos += 0.25 * np.resize(bp(rng.standard_normal(len(pos)), 6000, 12000), len(pos)) * np.exp(-np.arange(len(pos)) / SR * 4)
save("positive", stereo(pos, width=0.6))
# shine: lap lanh sang, nhieu not cao ngau nhien (Shine Collect / glitter / star)
sh = seq([(rng.uniform(0, 0.35), note(rng.integers(90, 104), 0.35, dec=14) * rng.uniform(0.4, 1)) for _ in range(16)])
save("shine", stereo(sh, width=0.8))
# reverse-swish: noise phong to dan roi cat (Reverse Swish)
d = 0.6
r = sweep_noise(d, 600, 6000, 0.35) * np.linspace(0, 1, int(SR * d)) ** 2.5
save("reverse-swish", stereo(r, pan_sweep=True))
# flat: tieng "tac" mem, go nhe (Flat_03)
tt = t(0.12)
fl = np.sin(2 * np.pi * np.cumsum(420 * np.exp(-tt * 25) + 180) / SR) * np.exp(-tt * 40) + 0.4 * bp(rng.standard_normal(len(tt)), 1500, 5000) * np.exp(-tt * 120)
save("flat", fl)
# blip8: 2 not vuong 8-bit (8bit_08)
save("blip8", stereo(seq([(0, note(84, 0.07, "sq", 10)), (0.07, note(91, 0.12, "sq", 10))]), width=0.2))
# game: arpeggio 8-bit di len (Game_02/06)
save("game", stereo(seq([(i * 0.05, note(m, 0.08, "sq", 12)) for i, m in enumerate([72, 76, 79, 84, 88, 91])]), width=0.2))
# pops: chuoi bong bong noi (Pops Up / Pop Bubbles / 水面冒泡 / water drop)
def bub(f0):
    tt = t(0.07)
    return np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.8 * tt / 0.07)) / SR) * np.exp(-tt * 45)
save("pops", stereo(seq([(i * 0.06 + rng.uniform(0, 0.02), bub(rng.uniform(500, 1100))) for i in range(5)]), width=0.4))
# hud: beep so hoa ngan (HUD Interface)
save("hud", stereo(seq([(0, note(96, 0.05, "sq", 30) * 0.6), (0.06, note(100, 0.05, "sq", 30) * 0.6), (0.12, note(103, 0.1, "sine", 20))]), width=0.3))
# mouse: double click (Mouse Clicks)
cl = bp(rng.standard_normal(int(SR * 0.012)), 2000, 9000) * np.exp(-np.arange(int(SR * 0.012)) / SR * 400)
save("mouse", seq([(0, cl), (0.09, cl * 0.8)]))
# coin: 2 not chuong (Earn Coins)
save("coin", stereo(seq([(0, note(88, 0.09, dec=20)), (0.08, note(95, 0.5, dec=6))]), width=0.3))
# paper: lat giay (Turn the paper)
d = 0.35
pa = bp(rng.standard_normal(int(SR * d)), 1500, 8000) * np.sin(np.pi * np.linspace(0, 1, int(SR * d))) ** 3
save("paper", stereo(pa, pan_sweep=True))

make_bed()
