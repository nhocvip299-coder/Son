"""Kiem tra SFX nghe ro: nang luong 2-10kHz trong [t, t+0.18s] cua ban dung so voi giong goc cung moc.
Dung: python -I scripts/refedit/sfx-check.py <render.mp4> <source> <plan.json>"""
import json, subprocess, sys, numpy as np
from math import log10
def load(p):
    raw = subprocess.run(["ffmpeg","-v","error","-i",p,"-vn","-ac","1","-ar","24000","-f","f32le","-"],capture_output=True).stdout
    return np.frombuffer(raw, np.float32)
def hf(a, t, sr=24000, d=0.18):
    s = a[int(t*sr):int((t+d)*sr)]
    if len(s) < 64: return -120
    S = np.abs(np.fft.rfft(s*np.hanning(len(s))))**2; f = np.fft.rfftfreq(len(s), 1/sr)
    return 10*log10(S[(f>2000)&(f<10000)].sum()+1e-12)
r, src = load(sys.argv[1]), load(sys.argv[2]); plan = json.load(open(sys.argv[3]))
# chuan hoa ve cung muc giong: so nang luong toan bai
g = 10*log10((r**2).mean()/((src[:len(r)]**2).mean()+1e-12))
rows = [(c["atMs"]/1000, c["sfx"], hf(r, c["atMs"]/1000) - g - hf(src, c["atMs"]/1000)) for c in plan["sfx"]]
d = np.array([x[2] for x in rows])
print(f"{len(rows)} SFX | tang cao tan so voi giong goc: trung vi {np.median(d):.1f} dB, thap nhat {d.min():.1f} dB, so cue >= +3dB: {(d>=3).sum()}/{len(d)}")
for t,n,x in sorted(rows, key=lambda z:z[2])[:int(sys.argv[4]) if len(sys.argv)>4 else 5]: print(f"  yeu nhat: {t:.2f}s {n} +{x:.1f} dB")
