"""Phan loai SFX tai cac moc chu/chuyen canh: tim dinh tang nang luong cao tan (onset) gan moc,
roi do dac trung trong 0.7s: tang HF (dB), tang tram (<150Hz), thoi luong, tam pho dau/cuoi (quet len/xuong),
do dot ngot -> gan nhan whoosh / swoosh-down / riser / pop / shimmer / impact / khong-ro.

Dung: python3 -I scripts/style/sfx_classify.py <video> <text_types.json> <key ref01|ref02> <out.json>
"""
import json
import subprocess
import sys

import numpy as np

src, tp, key, out = sys.argv[1:5]
ev = json.load(open(tp))[key]
sr, hop, win = 32000, 320, 1024  # 10 ms
a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
n = (len(a) - win) // hop
idx = np.arange(win)[None, :] + hop * np.arange(n)[:, None]
S = np.abs(np.fft.rfft(a[idx] * np.hanning(win), axis=1)) + 1e-9
f = np.fft.rfftfreq(win, 1 / sr)
band = lambda lo, hi: 10 * np.log10((S[:, (f >= lo) & (f < hi)] ** 2).sum(1))
hf, vhf, low = band(4000, 14000), band(9000, 15000), band(30, 150)
cent = (S * f).sum(1) / S.sum(1)
sm = lambda x, k=5: np.convolve(x, np.ones(k) / k, "same")
hf_s = sm(hf)
res = []
for t, typ, txt in ev:
    i0, i1 = int((t - 0.45) * 100), int((t + 0.45) * 100)
    base_i = slice(max(0, i0 - 60), max(1, i0))
    flux = np.r_[0, np.diff(hf_s)]
    on = i0 + int(np.argmax(flux[i0:i1])) - 2
    base = np.median(hf_s[base_i])
    seg = hf_s[on:on + 70]
    rise = float(seg.max() - base)
    above = seg > base + 6
    dur = float(above.sum() / 100)
    pk = on + int(np.argmax(seg))
    c0, c1 = float(np.median(cent[on:on + 10])), float(np.median(cent[pk + 5:pk + 25]))
    lrise = float(sm(low)[on:on + 40].max() - np.median(sm(low)[base_i]))
    vh = float(sm(vhf)[on:on + 70].max() - np.median(sm(vhf)[base_i]))
    attack = float((pk - on) / 100)
    if rise < 6:
        lab = "khong ro / chim duoi giong"
    elif lrise > 10 and dur < 0.4:
        lab = "impact/boom (tram manh)"
    elif dur <= 0.15:
        lab = "pop/click (ngan, dot ngot)"
    elif vh > rise - 2 and dur > 0.3:
        lab = "shimmer/sparkle (cao tan sang, ngan nga)"
    elif attack > 0.18:
        lab = "riser/whoosh len (tang dan)"
    elif c1 < c0 - 800:
        lab = "swoosh xuong (quet xuong)"
    else:
        lab = "whoosh (gio luot)"
    res.append({"t": t, "type": typ, "text": txt, "onset": round(on / 100, 2), "hf_rise_db": round(rise, 1), "vhf_rise_db": round(vh, 1),
                "low_rise_db": round(lrise, 1), "dur_s": round(dur, 2), "attack_s": round(attack, 2), "centroid_hz": [round(c0), round(c1)], "sfx": lab})
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
for r in res:
    print(f"{r['t']:6.1f} {r['type']:8} {r['hf_rise_db']:5.1f}dB dur{r['dur_s']:.2f} atk{r['attack_s']:.2f} low{r['low_rise_db']:5.1f} vhf{r['vhf_rise_db']:5.1f} | {r['sfx']:34} | {r['text'][:28]}")
