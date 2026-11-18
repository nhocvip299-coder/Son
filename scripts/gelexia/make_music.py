"""Nhac nen vui tuoi cho style gelexia-food-review (tu tong hop bang numpy, khong vuong ban quyen).

112 BPM, giong Ab truong: kick + clap + hi-hat + bass + hop am pluck + chuong melody nhe.
Chay: .venv/bin/python scripts/gelexia/make_music.py [giay=48] -> public/music/gelexia-upbeat.wav
"""
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
BPM = 112
BEAT = 60 / BPM
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 48.0
OUT = Path(__file__).resolve().parents[2] / "public" / "music" / "gelexia-upbeat.wav"
rng = np.random.default_rng(3)
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def add(sig, t0, gl=1.0, gr=1.0):
    i = int(t0 * SR)
    if i >= N:
        return
    n = min(len(sig), N - i)
    L[i : i + n] += sig[:n] * gl
    R[i : i + n] += sig[:n] * gr


def tt(d):
    return np.arange(int(SR * d)) / SR


def kick():
    t = tt(0.35)
    f = 50 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.9


def clap():
    t = tt(0.22)
    n = rng.standard_normal(len(t))
    n = sosfilt(butter(2, [900, 5000], "bandpass", fs=SR, output="sos"), n)
    e = np.exp(-t * 22) + 0.6 * np.exp(-((t - 0.012) ** 2) / 1e-5)
    return n * e * 0.35


def hat(open_=False):
    t = tt(0.18 if open_ else 0.05)
    n = sosfilt(butter(2, 7000, "highpass", fs=SR, output="sos"), rng.standard_normal(len(t)))
    return n * np.exp(-t * (14 if open_ else 70)) * 0.12


def pluck(m, d=0.45, amp=0.12):
    t = tt(d)
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t) + 0.15 * np.sin(2 * np.pi * 3 * f * t)
    return s * np.exp(-t * 7) * amp


def bass(m, d):
    t = tt(d)
    f = hz(m)
    s = np.tanh(1.6 * np.sin(2 * np.pi * f * t)) * 0.8 + 0.2 * np.sin(np.pi * f * t)
    e = np.minimum(1, t / 0.008) * np.exp(-t * 2.2)
    return s * e * 0.28


def bell(m, d=0.6, amp=0.07):
    t = tt(d)
    f = hz(m)
    s = np.sin(2 * np.pi * f * t + 1.2 * np.sin(2 * np.pi * f * 3.5 * t) * np.exp(-t * 6))
    return s * np.exp(-t * 4.5) * amp


# Vong hop am I-V-vi-IV (Ab - Eb - Fm - Db)
CHORDS = [(56, [68, 72, 75]), (51, [67, 70, 75]), (53, [68, 72, 77]), (49, [68, 73, 77])]
MEL = [80, 82, 84, 82, 80, 77, 80, -1, 79, 80, 82, 79, 75, -1, 77, 80]
bar = 4 * BEAT
nbars = int(DUR / bar) + 1
for b in range(nbars):
    t0 = b * bar
    root, ch = CHORDS[b % 4]
    intro = b < 1
    for k in range(4):
        tb = t0 + k * BEAT
        if not intro:
            add(kick(), tb)
        if k in (1, 3) and not intro:
            add(clap(), tb, 0.9, 1.0)
        for h in range(2):
            add(hat(open_=(h == 1 and k == 3)), tb + h * BEAT / 2, 0.8, 1.0)
        # pluck nhip 8 dao
        for h in range(2):
            m = ch[(k * 2 + h) % 3]
            add(pluck(m), tb + h * BEAT / 2 + (BEAT / 4 if h else 0) * 0, 1.0, 0.75)
    if not intro:
        for k, off in enumerate([0, 1.5, 2.5, 3]):
            add(bass(root - 12 + (12 if k == 2 else 0), BEAT * 0.9), t0 + off * BEAT)
    if b >= 2:
        for i in range(4):
            m = MEL[(b % 4) * 4 + i]
            if m > 0:
                add(bell(m), t0 + i * BEAT, 0.7, 1.0)

mix = np.stack([L, R], 1)
mix = sosfilt(butter(1, 30, "highpass", fs=SR, output="sos"), mix, axis=0)
fade = int(SR * 2.0)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix[: int(SR * 0.05)] *= np.linspace(0, 1, int(SR * 0.05))[:, None]
mix = np.tanh(mix * 1.2)
mix /= np.abs(mix).max() / 10 ** (-1 / 20)
OUT.parent.mkdir(parents=True, exist_ok=True)
sf.write(OUT, mix.astype(np.float32), SR, subtype="PCM_16")
print("OK", OUT, f"{DUR:.1f}s")
