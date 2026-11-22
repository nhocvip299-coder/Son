"""Dat am luong TUNG SFX theo giong (giong giu nguyen 100%): dinh SFX (50ms) = muc giong quanh do (RMS 1s) + offset (mac dinh -8 dB).
Cho giong ngung: dung muc giong trung vi - 3 dB lam chuan (khong de SFX noi len giua khoang lang).
Dung: python -I scripts/refedit/sfx-level.py <sfx_stem.wav (render voi voiceVolume=0, volume SFX hien tai)> <voice source> <offset_db> plan1.json [plan2.json ...]
Chi GIAM am luong (Remotion volume <= 1). Ghi lai volume vao cac plan (khop theo atMs+sfx)."""
import json, subprocess, sys, numpy as np
def load(p): return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-vn","-ac","1","-ar","24000","-f","f32le","-"],capture_output=True).stdout,np.float32)
def db(x): return 20*np.log10(np.sqrt((x**2).mean())+1e-9)
stem, voice, off = load(sys.argv[1]), load(sys.argv[2]), float(sys.argv[3]); sr = 24000
plans = sys.argv[4:]
base = json.load(open(plans[0]))
seg = [db(voice[i:i+sr]) for i in range(0, len(voice)-sr, sr)]
vmed = float(np.median([x for x in seg if x > -50]))
new = {}
for c in base["sfx"]:
    a = int(c["atMs"]/1000*sr)
    pk = max(db(stem[a+i:a+i+int(0.05*sr)]) for i in range(0, int(0.3*sr), int(0.01*sr)))
    vl = max(db(voice[max(0,a-sr//2):a+sr//2]), vmed - 3)
    gain = 10 ** ((vl + off - pk) / 20)
    vol = round(float(min(1.0, c.get("volume", 1) * gain)), 3)
    new[(c["atMs"], c["sfx"])] = (vol, round(float(vl + off - pk), 1))
for p in plans:
    pl = json.load(open(p))
    for c in pl["sfx"]:
        k = (c["atMs"], c["sfx"])
        if k in new: c["volume"] = new[k][0]
    pl["voiceVolume"] = 1
    json.dump(pl, open(p, "w"), ensure_ascii=False, indent=1)
vols = [v[0] for v in new.values()]
print(f"{len(vols)} SFX: volume moi trung vi {np.median(vols):.2f} (min {min(vols):.2f}, max {max(vols):.2f}); muc giong trung vi {vmed:.1f} dB; muc tieu dinh SFX = giong {off:+.0f} dB")
