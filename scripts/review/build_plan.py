"""Dung plan ReviewEdit tu EDL + loi Whisper theo clip.
Dung: .venv/bin/python -I scripts/review/build_plan.py projects/<du-an> work/<du-an>  -> <du-an>/plan.json, plan-wbw.json, edl.txt
"""
import json, re, sys
from pathlib import Path

proj, work = Path(sys.argv[1]), Path(sys.argv[2])
edl = json.loads((proj / "edl.json").read_text())
fixes = {k: v for k, v in json.loads((proj / "asr-fixes.json").read_text()).items() if not k.startswith("_")}
words = json.loads((work / "words.json").read_text())
vad = json.loads((work / "vad.json").read_text())
off = edl["clips"]
FPS = 60

# 1) timeline dau ra
segs, t = [], 0.0
for s in edl["segments"]:
    o = (s["b"] - s["a"]) / s["speed"]
    segs.append({**s, "out": t, "outEnd": t + o})
    t += o
total = t

def to_out(clip, sec):
    for s in segs:
        if s["clip"] == clip and s["a"] <= sec < s["b"]:
            return s["out"] + (sec - s["a"]) / s["speed"], s
    return None, None

def fix(clip, w):
    core = re.sub(r"[.,!?…]+$", "", w)
    tail = w[len(core):]
    rep = fixes.get(f"{clip}:{core}") or fixes.get(core)
    return (rep + tail) if rep else w

# 2) phu de: theo tung doan 1x (doan hook lap lai cung co phu de); neo dau tu vao vung co giong (VAD)
caps = []
for sg in segs:
    if sg["speed"] != 1:
        continue
    clip = sg["clip"]
    regions = vad.get(clip, [])
    for (sm, em, text, _e) in words[clip]:
        a, b = sm / 1000, em / 1000
        if b - a > 0.9:
            act = [r for r in regions if r[1] > a and r[0] < b]
            if act:
                a = max(a, act[0][0])
            b = min(b, a + 0.7)
        if any(n["clip"] == clip and n["a"] <= a < n["b"] for n in edl.get("noCaption", [])):
            continue  # doan nghe khong ro -> bo phu de
        if not (sg["a"] <= a < sg["b"] - 0.12) or re.search(r"subscribe|bỏ lỡ", text, re.I):
            continue
        o = sg["out"] + a - sg["a"]
        ob = min(sg["outEnd"], o + (b - a))
        caps.append({"text": " " + fix(clip, text), "startMs": round(o * 1000), "endMs": round(ob * 1000), "timestampMs": round(o * 1000), "confidence": None, "maxEndMs": round(sg["outEnd"] * 1000)})
caps.sort(key=lambda c: c["startMs"])

# 3) tieu de
titles = []
for ti in edl["titles"]:
    o, s = to_out(ti["clip"], ti["at"])
    if o is None:
        print("!! tieu de ngoai doan giu:", ti["text"]); continue
    txt = ti["text"].replace("*", "") if ti["effect"] == "zoomPunch" else ti["text"]  # zoomPunch khong doc dau *
    titles.append({"text": txt, "effect": ti["effect"], "startMs": round(o * 1000), "durationMs": round(ti["dur"] * 1000), **({"yFixed": ti["y"]} if "y" in ti else {})})

# 3b) dat tieu de TRANH MAT: do mat (work/faces.json, Haar) trong luc tieu de hien
faces_p = work / "faces.json"
if faces_p.exists():
    faces = json.loads(faces_p.read_text())
    for ti in titles:
        if "yFixed" in ti:
            ti["y"] = ti.pop("yFixed"); continue  # vi tri dat tay trong edl
        near = [f for f in faces if ti["startMs"] - 250 <= f[0] <= ti["startMs"] + ti["durationMs"] and f[1] is not None and f[2] - f[1] > 150]
        if not near:
            ti["y"] = 520; continue
        top = min(f[1] for f in near); chin = max(f[2] for f in near)
        if top >= 560:  # mat nho/thap (canh di bo) -> chu phia tren dau
            ti["y"] = max(400, top - 190)
        else:  # can mat -> chu duoi cam, tren phu de
            ti["y"] = min(980, chin + 170)

# 3c) SFX cho chu: bo Mixkit nhe, MOI CHU 1 TIENG. Muc = 10^((-22 - Mmax)/20): dinh momentary SFX ~ -22 LUFS,
#     thap hon giong noi (~-14 LUFS, dinh -8) khoang 8 dB -> nghe ro nhung khong lan at giong.
SFX_M = {"pop-whoosh": -16.7, "bubble-pop": -16.8, "small-sweep": -14.0, "page-chime": -14.0, "correct-tone": -12.2, "short-sweep": -16.0}
gain = lambda n, extra=0: round(min(1.0, 10 ** ((-22 + extra - SFX_M[n]) / 20)), 2)
TITLE_SFX = {
    "zoomPunch": [("pop-whoosh", 0)],
    "popBounce": [("bubble-pop", 0)],
    "slideMask": [("small-sweep", -40)],
    "typewriter": [("page-chime", 700)],
}
for ti in titles:
    cues = list(TITLE_SFX[ti["effect"]])
    if re.search(r"\d+/10|\d+K\*?$", ti["text"]):
        cues.append(("correct-tone", 450))  # diem so: tieng "ting" dung
    ti["sfx"] = [{"sfx": f"mixkit/{n}", "offsetMs": o, "volume": gain(n)} for n, o in cues]

# 4) SFX: whoosh nhe khi vao/ra doan tua nhanh
sfx = []
for i, s in enumerate(segs):
    if s["speed"] > 1 and (i == 0 or segs[i - 1]["speed"] == 1):
        sfx.append({"sfx": "mixkit/short-sweep", "atMs": round(max(0, s["out"] - 0.15) * 1000), "volume": gain("short-sweep", -2)})

# an phu de karaoke khi dang co chu hieu ung (tranh 2 khoi chu cung luc); ban chay chu tung chu van giu du
def busy(c):
    return any(t["startMs"] - 1000 <= c["startMs"] < t["startMs"] + t["durationMs"] for t in titles)
caps_k = caps  # giu du phu de (an theo tieu de lam cau bi cut nghia)

plan = {
    "source": edl["source"], "fps": FPS,
    "segments": [{"srcStartMs": round((off[s["clip"]] + s["a"]) * 1000), "srcEndMs": round((off[s["clip"]] + s["b"]) * 1000), "speed": s["speed"], "note": f'{s["clip"]} {s["note"]}'} for s in segs],
    "captions": caps_k, "titles": titles, "sfx": sfx, "captionMode": "karaoke", "captionOffset": 80,
}
(proj / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=1))
(proj / "plan-wbw.json").write_text(json.dumps({**plan, "captions": caps, "captionMode": "wordbyword"}, ensure_ascii=False, indent=1))

# 5) bang EDL de duyet
fmt = lambda x: f"{int(x // 60)}:{x % 60:04.1f}"
lines = [f"Tổng: {fmt(total)} (quay gốc 5:48)"]
for i, s in enumerate(segs, 1):
    tag = "1x" if s["speed"] == 1 else f"x{s['speed']} ▶▶"
    lines.append(f"{i:2d}. {fmt(s['out'])}–{fmt(s['outEnd'])}  {tag:6s} clip {s['clip']} {s['a']:.1f}–{s['b']:.1f}s  {s['note']}")
lines.append("\nBỏ phụ đề (nghe không rõ):")
for n in edl.get("noCaption", []):
    lines.append(f"  clip {n['clip']} {n['a']:.1f}–{n['b']:.1f}s: {n['why']}")
lines.append("\nChữ hiệu ứng:")
for ti in titles:
    lines.append(f"  {fmt(ti['startMs']/1000)}  {ti['effect']:10s} {ti['text']}  (y={ti.get('y')})")
(proj / "edl.txt").write_text("\n".join(lines) + "\n")
print("\n".join(lines))
print(f"\n{len(caps)} tu phu de, {len(sfx)} SFX chuyen toc do")
