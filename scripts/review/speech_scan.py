"""Quet loi noi tung clip: words.json (tu Whisper + do nang luong giong -> loc tu ao giac) va vad.json (vung co giong).
Can chay transcribe truoc: work/<du-an>/asr/<clip>/captions.json (whisper.cpp, duong dan tuyet doi).
Dung: .venv/bin/python -I scripts/review/speech_scan.py work/<du-an>   -> in bang tu+vung giong de viet EDL
"""
import json, subprocess, sys, glob, os
import numpy as np
from scipy.signal import butter, sosfilt

W = sys.argv[1]
clips = [os.path.basename(p) for p in sorted(glob.glob(f"{W}/asr/*")) if os.path.exists(f"{p}/captions.json")]
def pcm(n):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{W}/raw/{n}.mp4", "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
def env(x, lo, hi, hop):
    y = sosfilt(butter(4, [lo, hi], "bp", fs=16000, output="sos"), x)
    return 20 * np.log10(np.array([np.sqrt((y[i:i + hop] ** 2).mean()) for i in range(0, len(y) - hop, hop)]) + 1e-9)
words, vad = {}, {}
for n in clips:
    x = pcm(n)
    db = env(x, 250, 3500, 160); p90 = np.percentile(db, 90)  # 10 ms
    ws = []
    for c in json.load(open(f"{W}/asr/{n}/captions.json")):
        a, b = c["startMs"] // 10, max(c["startMs"] // 10 + 1, c["endMs"] // 10)
        ws.append((c["startMs"], c["endMs"], c["text"].strip(), round(float(db[a:b].max() - p90)) if a < len(db) else -99))
    words[n] = ws  # cot 4 = nang luong so p90 (dB); < -15 thuong la ao giac/khong ro
    d2 = np.convolve(env(x, 300, 3400, 320), np.ones(10) / 10, "same")  # 20 ms
    act = d2 > np.percentile(d2, 92) - 16
    segs, i = [], 0
    while i < len(act):
        if act[i]:
            j = i
            while j < len(act) and act[j]: j += 1
            segs.append([i * 0.02, j * 0.02]); i = j
        else: i += 1
    m = []
    for s in segs:
        if m and s[0] - m[-1][1] < 0.45: m[-1][1] = s[1]
        else: m.append(s)
    vad[n] = [[round(a, 2), round(b, 2)] for a, b in m if b - a >= 0.25]
    print(f"\n== {n} ({len(x)/16000:.1f}s)")
    for a, b in vad[n]:
        print(f"  {a:6.1f}-{b:6.1f}  " + " ".join(f"{w[2]}({w[3]})" for w in ws if w[0] / 1000 < b and w[1] / 1000 > a)[:160])
json.dump(words, open(f"{W}/words.json", "w"), ensure_ascii=False)
json.dump(vad, open(f"{W}/vad.json", "w"))
