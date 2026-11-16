"""Phan tich video mau (chi doc, khong sua file goc) -> JSON + contact sheet + keyframes.

Dung: .venv/bin/python -I scripts/style/analyze_reference.py <video> <out_dir> [--max-keyframes 12]
Ket qua cache: neu <out_dir>/analysis.json da ton tai va cung kich thuoc file -> bo qua.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

W, H, FPS = 108, 192, 10  # khung nho de phan tich nhanh


def run(cmd):
    return subprocess.run(cmd, capture_output=True, check=True).stdout


def probe(path):
    return json.loads(run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", path]))


def frames(path):
    raw = run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={FPS},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32)


def audio(path, sr=16000):
    raw = run(["ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32), sr


def edges(g):
    gx = np.abs(np.diff(g, axis=1))[:-1, :]
    gy = np.abs(np.diff(g, axis=0))[:, :-1]
    return (gx + gy) > 60


def main():
    src, out = sys.argv[1], Path(sys.argv[2])
    maxk = int(sys.argv[sys.argv.index("--max-keyframes") + 1]) if "--max-keyframes" in sys.argv else 12
    out.mkdir(parents=True, exist_ok=True)
    cache = out / "analysis.json"
    size = Path(src).stat().st_size
    if cache.exists() and json.loads(cache.read_text()).get("size") == size:
        print("cache:", cache)
        return

    meta = probe(src)
    v = next(s for s in meta["streams"] if s["codec_type"] == "video")
    dur = float(meta["format"]["duration"])
    f = frames(src)
    n = len(f)
    t = np.arange(n) / FPS
    gray = f.mean(axis=3)

    # 1. Shot boundaries: chenh lech histogram mau + chenh lech pixel
    hist = np.stack([np.concatenate([np.histogram(fr[..., c], 16, (0, 255))[0] for c in range(3)]) for fr in f]).astype(np.float32)
    hist /= hist.sum(1, keepdims=True)
    hd = np.r_[0, 0.5 * np.abs(np.diff(hist, axis=0)).sum(1)]
    pd = np.r_[0, np.abs(np.diff(gray, axis=0)).mean((1, 2)) / 255]
    score = hd * 0.6 + pd * 2.0
    thr = max(0.18, np.percentile(score, 97))
    cuts = [i for i in range(1, n) if score[i] > thr and score[i] >= score[max(0, i - 2):i + 3].max()]
    cuts = [c for k, c in enumerate(cuts) if k == 0 or c - cuts[k - 1] >= 3]
    shots = np.diff([0] + cuts + [n]) / FPS

    # 2. Su kien chu/overlay: canh (edge) moi xuat hien trong khi khung tong the it doi
    E = np.stack([edges(g) for g in gray])
    band = lambda a, b: slice(int(a * (H - 1)), int(b * (H - 1)))
    ed = np.r_[0, (E[1:] & ~E[:-1]).mean((1, 2))]
    text_ev = [i for i in range(1, n - 1) if ed[i] > max(0.02, np.percentile(ed, 95)) and pd[i] < 0.08 and ed[i] >= ed[i - 1:i + 2].max()]
    # vi tri doc cua mat do canh (chu thuong tap trung) theo 10 dai ngang
    rows = E.mean(axis=(0, 2))
    bands = [float(rows[band(k / 10, (k + 1) / 10)].mean()) for k in range(10)]

    # 3. Mau chu dao (k-means don gian tren mau khung)
    px = f[:: max(1, n // 60)].reshape(-1, 3)[::7]
    rng = np.random.default_rng(0)
    C = px[rng.choice(len(px), 6, replace=False)]
    for _ in range(12):
        lab = ((px[:, None] - C[None]) ** 2).sum(2).argmin(1)
        C = np.stack([px[lab == k].mean(0) if (lab == k).any() else C[k] for k in range(6)])
    share = np.bincount(lab, minlength=6) / len(lab)
    palette = [{"hex": "#%02x%02x%02x" % tuple(int(x) for x in c), "share": round(float(s), 3)} for c, s in sorted(zip(C, share), key=lambda z: -z[1])]
    # mau bao hoa cao (thuong la mau nhan chu/HUD)
    hsv_s = (px.max(1) - px.min(1)) / (px.max(1) + 1e-6)
    vivid = px[(hsv_s > 0.6) & (px.max(1) > 150)]
    accents = []
    if len(vivid):
        q = (vivid // 32).astype(int)
        keys, cnt = np.unique(q[:, 0] * 64 + q[:, 1] * 8 + q[:, 2], return_counts=True)
        for k in keys[np.argsort(-cnt)][:5]:
            m = vivid[(q[:, 0] * 64 + q[:, 1] * 8 + q[:, 2]) == k].mean(0)
            accents.append("#%02x%02x%02x" % tuple(int(x) for x in m))
    # khung am ban / nen trang: do sang trung binh rat cao
    bright = gray.mean((1, 2))
    flash = [round(float(t[i]), 2) for i in range(1, n) if bright[i] - bright[i - 1] > 60]

    # 4. Am thanh: onset (SFX/nhip), RMS
    a, sr = audio(src)
    hop = 160
    rms = np.sqrt(np.convolve(a ** 2, np.ones(hop) / hop, "same")[::hop] + 1e-10)
    db = 20 * np.log10(rms)
    flux = np.r_[0, np.diff(db)]
    on = [i * hop / sr for i in range(2, len(db)) if flux[i] > 10 and db[i] > -40 and flux[i] >= flux[i - 2:i + 3].max()]
    onsets = [round(x, 2) for k, x in enumerate(on) if k == 0 or x - on[k - 1] > 0.08]
    # trung hop onset voi diem cat (SFX khop chuyen canh)
    cut_t = [c / FPS for c in cuts]
    sync = sum(any(abs(o - c) < 0.12 for o in onsets) for c in cut_t) / max(1, len(cut_t))

    # 5. Chon keyframe: uu tien su kien chu + diem cat (lay frame 0.4s sau su kien de chu da on dinh)
    cand = sorted(set([min(n - 1, i + 4) for i in text_ev] + [min(n - 1, c + 4) for c in cuts]))
    pr = {i: ed[max(0, i - 4)] * 3 + score[max(0, i - 4)] for i in cand}
    pick = []
    for i in sorted(cand, key=lambda i: -pr[i]):
        if all(abs(i - j) > 8 for j in pick):
            pick.append(i)
        if len(pick) >= maxk:
            break
    pick = sorted(pick) or list(np.linspace(0, n - 1, maxk, dtype=int))
    kdir = out / "keyframes"
    kdir.mkdir(exist_ok=True)
    kf = []
    for k, i in enumerate(pick):
        p = kdir / f"k{k:02d}_{t[i]:06.2f}s.jpg"
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t[i]:.2f}", "-i", src, "-frames:v", "1", "-vf", "scale=540:-2", "-q:v", "3", str(p)])
        kf.append({"file": str(p), "t": round(float(t[i]), 2)})
    cols = 6
    rows_n = (len(kf) + cols - 1) // cols
    inputs = sum([["-i", k["file"]] for k in kf], [])
    pads = "".join(f"[{i}]scale=270:480,drawtext=text='{kf[i]['t']}s':x=8:y=8:fontsize=26:fontcolor=yellow:box=1:boxcolor=black@0.6[v{i}];" for i in range(len(kf)))
    layout = "|".join(f"{(i % cols) * 270}_{(i // cols) * 480}" for i in range(len(kf)))
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", pads + "".join(f"[v{i}]" for i in range(len(kf))) + f"xstack=inputs={len(kf)}:layout={layout}:fill=black", str(out / "contact_sheet.jpg")])

    res = {
        "source": src,
        "size": size,
        "duration": round(dur, 2),
        "video": {"codec": v["codec_name"], "w": v["width"], "h": v["height"], "fps": v["r_frame_rate"]},
        "cuts": {"count": len(cuts), "times": [round(c / FPS, 2) for c in cuts], "avg_shot_s": round(float(shots.mean()), 2), "median_shot_s": round(float(np.median(shots)), 2), "per_min": round(len(cuts) / dur * 60, 1)},
        "text_events": {"count": len(text_ev), "per_min": round(len(text_ev) / dur * 60, 1), "times": [round(i / FPS, 2) for i in text_ev]},
        "edge_density_by_band_top_to_bottom": [round(b, 4) for b in bands],
        "palette": palette,
        "accent_colors": accents,
        "brightness_flashes": flash,
        "audio": {"onsets_count": len(onsets), "onsets_per_min": round(len(onsets) / dur * 60, 1), "cut_onset_sync_ratio": round(sync, 2), "onsets": onsets},
        "keyframes": kf,
    }
    cache.write_text(json.dumps(res, ensure_ascii=False, indent=1))
    print(json.dumps({k: res[k] for k in ["duration", "cuts", "text_events"]}, ensure_ascii=False)[:600])


main()
