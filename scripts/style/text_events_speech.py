"""Loc su kien chu CHEN (overlay) tu OCR: giu tu OCR trung voi loi noi (transcript) trong cua so [t-3s, t+1s].

Dung: python3 -I scripts/style/text_events_speech.py <ocr_frames.json> <captions.json> <out.json>
Ra: cac doan co chu chen: start, end, cac tu khop, vung doc (y), chieu cao chu lon nhat (px@1920).
"""
import json
import sys
import unicodedata


def norm(s):
    s = unicodedata.normalize("NFC", s.lower())
    return "".join(ch for ch in s if ch.isalnum())


fr = json.load(open(sys.argv[1]))
cap = json.load(open(sys.argv[2]))
spoken = [(c["startMs"] / 1000, norm(c["text"])) for c in cap]
rows = []
for f in fr:
    t = f["t"]
    near = {w for s, w in spoken if t - 3.0 <= s <= t + 1.0 and len(w) >= 2}
    hit = [w for w in f["words"] if norm(w["t"]) in near or (norm(w["t"]).isdigit() and len(norm(w["t"])) >= 2)]
    rows.append((t, hit))
segs, cur = [], None
for t, hit in rows:
    if hit:
        if cur and t - cur["end"] <= 0.5:
            cur["end"] = t
            for w in hit:
                cur["w"].setdefault(w["t"], w)
        else:
            if cur:
                segs.append(cur)
            cur = {"start": t, "end": t, "w": {w["t"]: w for w in hit}}
if cur:
    segs.append(cur)
out = []
for s in segs:
    ws = sorted(s["w"].values(), key=lambda w: (round(w["y"], 2), w["x"]))
    out.append({"start": s["start"], "end": round(s["end"] + 0.25, 2), "text": " ".join(w["t"] for w in ws),
                "y": round(min(w["y"] for w in ws), 2), "y2": round(max(w["y"] + w["h"] for w in ws), 2),
                "maxh_px": round(max(w["h"] for w in ws) * 1920)})
json.dump(out, open(sys.argv[3], "w"), ensure_ascii=False, indent=1)
for o in out:
    print(f"{o['start']:6.2f}-{o['end']:6.2f} y{o['y']:.2f}-{o['y2']:.2f} h{o['maxh_px']:3d} | {o['text'][:90]}")
