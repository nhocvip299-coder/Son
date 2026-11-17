"""Hoc 'mau am' SFX cua video mau theo LOAI chu: pho cong suat trung binh theo thoi gian (da tru pho giong noi nen),
roi TONG HOP SFX moi bang nhieu dinh hinh theo dung khuon do (khong cat am thanh goc).

Dung: .venv/bin/python -I scripts/style/sfx_template.py <text_types.json> <out_dir>
Doc: reference/quyet-tran-lux/ref0*_proxy.mp4, analysis/ref0*/sfx_by_text.json (moc onset da do).
Ra: <out_dir>/<nhom>.wav + <nhom>_template.png (pho do duoc) + templates.json
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
SR, N, HOP = 44100, 2048, 512
GROUPS = {  # nhom -> (cac loai chu, nguong do ro dB)
    "text_main": (["run"], 18),
    "text_trans": (["trans", "cross"], 18),
    "text_behind": (["behind", "giant"], 15),
    "transition": (["tr_leak", "tr_zoom", "tr_flash"], 18),
}


def load(p):
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)


def stft(x):
    n = (len(x) - N) // HOP
    idx = np.arange(N)[None, :] + HOP * np.arange(n)[:, None]
    return np.fft.rfft(x[idx] * np.hanning(N), axis=1)


aud = {k: load(ROOT / f"reference/quyet-tran-lux/{k}_proxy.mp4") for k in ["ref01", "ref02"]}
ev = []
for k in ["ref01", "ref02"]:
    for e in json.load(open(ROOT / f"styles/quyet-tran-lux/analysis/{k}/sfx_by_text.json")):
        ev.append((k, e))
frames_pre, frames_post = int(0.6 * SR / HOP), int(0.9 * SR / HOP)
res = {}
for g, (types, thr) in GROUPS.items():
    acc = []
    for k, e in ev:
        if e["type"] not in types or e["hf_rise_db"] < thr:
            continue
        on = int(e["onset"] * SR) - int(0.05 * SR)
        seg = aud[k][max(0, on - frames_pre * HOP - N): on + frames_post * HOP + N]
        P = np.abs(stft(seg)) ** 2
        base = np.median(P[: frames_pre - 2], axis=0)
        post = P[frames_pre: frames_pre + frames_post]
        acc.append(np.clip(post - base * 1.3, 0, None))  # phan vuot nen ~ SFX
    if not acc:
        continue
    T = np.median(np.stack(acc), axis=0)  # median: loai bo giong noi dao dong
    T = np.convolve(T.mean(1), np.ones(3) / 3, "same")[:, None] * 0 + T  # giu nguyen
    # tong hop: nhieu trang -> STFT -> nhan bien do theo khuon (sqrt cong suat) -> ISTFT
    rng = np.random.default_rng(1)
    L = (T.shape[0] + 4) * HOP + N
    Z = stft(rng.standard_normal(L).astype(np.float32))[: T.shape[0]]
    Z = Z / (np.abs(Z) + 1e-9) * np.sqrt(T)
    y = np.zeros(L)
    win = np.hanning(N)
    for i, fr in enumerate(np.fft.irfft(Z, n=N, axis=1)):
        y[i * HOP: i * HOP + N] += fr * win
    y = y[: T.shape[0] * HOP]
    fade = np.ones_like(y); fl = int(0.03 * SR); fade[-fl:] = np.linspace(1, 0, fl); fade[: int(0.004 * SR)] = np.linspace(0, 1, int(0.004 * SR))
    y = y * fade
    y = y / (np.abs(y).max() + 1e-9) * 0.9
    import wave
    with wave.open(str(out / f"{g}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((y * 32767).astype(np.int16).tobytes())
    f = np.fft.rfftfreq(N, 1 / SR)
    E = T.sum(1); dur = (E > E.max() * 0.1).sum() * HOP / SR
    cen = (T * f).sum(1) / (T.sum(1) + 1e-9)
    pk = int(E.argmax())
    res[g] = {"n_events": len(acc), "dur_s": round(float(dur), 2), "peak_at_s": round(pk * HOP / SR, 3),
              "centroid_hz_start_peak_end": [int(cen[1]), int(cen[pk]), int(cen[min(len(cen) - 1, int(dur * SR / HOP))])],
              "band_share_%": {b: round(float(T[:, (f >= lo) & (f < hi)].sum() / T.sum() * 100), 1) for b, (lo, hi) in
                               {"<200": (0, 200), "200-2k": (200, 2000), "2k-6k": (2000, 6000), "6k-12k": (6000, 12000), ">12k": (12000, 22050)}.items()}}
    print(g, res[g])
json.dump(res, open(out / "templates.json", "w"), indent=1)
