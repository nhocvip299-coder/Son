"""Tai + cat + chuan hoa SFX thu that (Mixkit, giay phep mien phi dung trong video) vao public/sfx/real/.
File am thanh KHONG dua len Git (giay phep khong cho phan phoi lai file goc) — chay lai script nay de tai.

Dung: python3 -I scripts/style/fetch_sfx.py
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/sfx/real"
OUT.mkdir(parents=True, exist_ok=True)
# ten -> (id mixkit, cat tu giay, do dai giay, ghi chu) — chon theo do khop pho cao tan voi SFX video mau
SFX = {
    # v8 "gon": cat ngan 0.3-0.45s, fade-out 0.1s (nguoi dung: am thanh hoi dai dong)
    "qtl-sparkle": (2589, 1.55, 0.45, "Fairy magic sparkle — doan bung sang"),
    "qtl-sparkle-whoosh": (1345, 0.35, 0.5, "Fairy sparkle whoosh — phan dinh"),
    "qtl-sparkle-whoosh-2": (867, 0.0, 0.42, "Fairy sparkle whoosh — sang ngay (chu chinh)"),
    "qtl-sparkle-sweep": (3082, 0.0, 0.45, "Sparkle hybrid transition — sang ngay (chu kinh)"),
    "qtl-pop-whoosh": (2350, 0.22, 0.4, "Explainer pops whoosh — pop gon (icon)"),
    "qtl-transition": (3062, 0.0, 0.45, "Fairy sparkle whoosh — chuyen canh"),
    "qtl-swoosh": (1478, 0.0, 0.35, "Quick swoosh accent — chu ra/nho"),
    "qtl-impact": (1287, 0.45, 0.6, "Cool impact — tham tram ngan"),
}
items = json.load(open(Path(__file__).with_name("mixkit_items.json"))) if Path(__file__).with_name("mixkit_items.json").exists() else {}
hits = {}
for name, (mid, ss, dur, note) in SFX.items():
    url = next((u for u in items if f"/{mid}/" in u), f"https://assets.mixkit.co/active_storage/sfx/{mid}/{mid}-preview.mp3")
    tmp = OUT / f"_{mid}.mp3"
    if not tmp.exists():
        subprocess.run(["curl", "-sSL", "-m", "60", "-o", str(tmp), url], check=True)
    # cat tu diem bat dau that (bo im lang dau), chuan hoa dinh -1 dBFS, fade out 60ms
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(tmp), "-af",
                    f"atrim=start={ss}:duration={dur},afade=t=out:st={max(0, dur - 0.12)}:d=0.12,loudnorm=I=-12:TP=-0.5:LRA=11,aresample=48000",
                    "-ac", "2", str(OUT / f"{name}.wav")], check=True)
    # diem dinh (hit point): cuc dai nang luong lam muot 50ms -> cue = moc chu - hit
    import numpy as np
    a = np.frombuffer(subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(OUT / f"{name}.wav"), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
    env = np.convolve(a ** 2, np.ones(800) / 800, "same")
    hits[name] = round(float(env.argmax() / 16000), 3)
    print("OK", name, "<-", mid, "hit", hits[name], "s |", note)

json.dump(hits, open(ROOT / "src/styles/quyetTranLux/sfxHits.json", "w"), indent=1)
