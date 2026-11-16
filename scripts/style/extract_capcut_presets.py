"""Trich xuat du lieu 40 preset CapCut (draft_content.json) -> JSON gon cho Remotion.

Dung: python3 -I scripts/style/extract_capcut_presets.py <thu-muc-Presets> <out.json>
Chi doc file, khong chay gi trong goi. Moi thoi gian doi tu micro-giay sang giay.
"""
import json
import re
import sys
from pathlib import Path

US = 1_000_000


def rgb_hex(c):
    return "#%02x%02x%02x" % tuple(max(0, min(255, round(v * 255))) for v in c[:3])


def font_name(path):
    """Font tu cai: ten file. Font thu vien CapCut (.../effect/<id>/<hash>/font.ttf): tra ve 'cc:<id>'."""
    if not path:
        return ""
    parts = path.replace("\\", "/").split("/")
    if parts[-1].lower().startswith("font.") and len(parts) >= 3:
        return "cc:" + parts[-3]
    return Path(path).stem


def parse_fill(fill):
    if not fill:
        return None
    c = fill.get("content", {})
    rt = c.get("render_type")
    if rt == "solid":
        return {"solid": rgb_hex(c["solid"]["color"])}
    if rt == "gradient":
        g = c.get("gradient", {})
        return {"gradient": [rgb_hex(x) for x in g.get("colors", [])], "angle": g.get("angle"), "stops": g.get("percents")}
    return {"raw": rt}


def parse_text(t, seg, anims_by_id, effects_by_id):
    content = json.loads(t["content"]) if isinstance(t.get("content"), str) else t.get("content", {})
    styles = []
    for s in content.get("styles", []):
        st = {
            "range": s.get("range"),
            "size": s.get("size"),
            "font": font_name((s.get("font") or {}).get("path", "")),
            "fill": parse_fill(s.get("fill")),
        }
        if s.get("strokes"):
            st["strokes"] = [{"width": k.get("width"), "fill": parse_fill(k.get("content") and {"content": k["content"]})} for k in s["strokes"]]
        if s.get("shadows"):
            st["shadows"] = [
                {
                    "color": parse_fill({"content": sh.get("content")}) if sh.get("content") else None,
                    "diffuse": sh.get("diffuse"),
                    "distance": sh.get("distance"),
                    "angle": sh.get("angle"),
                    "alpha": sh.get("alpha"),
                }
                for sh in s["shadows"]
            ]
        for k in ("bold", "italic", "underline"):
            if s.get(k):
                st[k] = s[k]
        styles.append(st)
    clip = seg.get("clip") or {}
    refs = seg.get("extra_material_refs") or []
    anims = []
    for r in refs:
        for a in anims_by_id.get(r, []):
            anims.append({"name": a.get("name"), "type": a.get("type"), "start": a.get("start", 0) / US, "duration": a.get("duration", 0) / US, "id": a.get("resource_id")})
    effs = [effects_by_id[r] for r in refs if r in effects_by_id]
    return {
        "text": content.get("text", ""),
        "styles": styles,
        "font": font_name(t.get("font_path")),
        "fontSize": t.get("font_size"),
        "color": t.get("text_color"),
        "alpha": t.get("text_alpha"),
        "letterSpacing": t.get("letter_spacing"),
        "lineSpacing": t.get("line_spacing"),
        "alignment": t.get("alignment"),
        "italicDegree": t.get("italic_degree"),
        "border": {"color": t.get("border_color"), "width": t.get("border_width"), "alpha": t.get("border_alpha")} if t.get("border_color") else None,
        "shadow": {"color": t.get("shadow_color"), "alpha": t.get("shadow_alpha"), "smoothing": t.get("shadow_smoothing"), "distance": t.get("shadow_distance"), "angle": t.get("shadow_angle")} if t.get("has_shadow") else None,
        "background": {"color": t.get("background_color"), "alpha": t.get("background_alpha"), "radius": t.get("background_round_radius"), "w": t.get("background_width"), "h": t.get("background_height"), "style": t.get("background_style")} if t.get("background_color") else None,
        "start": seg["target_timerange"]["start"] / US,
        "duration": seg["target_timerange"]["duration"] / US,
        "x": (clip.get("transform") or {}).get("x", 0),
        "y": (clip.get("transform") or {}).get("y", 0),
        "scale": (clip.get("scale") or {}).get("x", 1),
        "rotation": clip.get("rotation", 0),
        "flipH": bool((clip.get("flip") or {}).get("horizontal")),
        "flipV": bool((clip.get("flip") or {}).get("vertical")),
        "opacity": clip.get("alpha", 1),
        "animations": anims,
        "effects": effs,
    }


def parse_draft(dr, pool=None):
    """pool: danh sach draft con (clip ghep) chua dung, gan lan luot cho cac doan video 'Compound/Clip ghep'."""
    # pool: {id muc drafts -> draft}. Doan video clip ghep tro toi draft con qua extra_material_refs.
    pool = dict(pool or {})
    pool.update({x["id"]: x["draft"] for x in dr.get("materials", {}).get("drafts", []) if "draft" in x})
    m = dr.get("materials", {})
    texts = {t["id"]: t for t in m.get("texts", [])}
    anims_by_id = {a["id"]: a.get("animations", []) for a in m.get("material_animations", [])}
    audios = {a["id"]: a for a in m.get("audios", [])}
    effects = {e["id"]: {"name": e.get("name"), "id": e.get("effect_id"), "type": e.get("type")} for e in m.get("video_effects", [])}
    stickers = {s["id"]: s for s in m.get("stickers", [])}
    masks = {k["id"]: k.get("config") for k in m.get("common_mask", []) + m.get("masks", [])}
    videos = {v["id"]: v for v in m.get("videos", [])}
    out = {"duration": dr.get("duration", 0) / US, "canvas": [dr.get("canvas_config", {}).get("width"), dr.get("canvas_config", {}).get("height")], "layers": [], "audio": [], "effects": [], "stickers": [], "videos": []}
    for tr in dr.get("tracks", []):
        for seg in tr.get("segments", []):
            mid = seg.get("material_id")
            if tr["type"] == "text" and mid in texts:
                out["layers"].append(parse_text(texts[mid], seg, anims_by_id, effects))
            elif tr["type"] == "audio" and mid in audios:
                a = audios[mid]
                out["audio"].append({"name": a.get("name"), "start": seg["target_timerange"]["start"] / US, "duration": seg["target_timerange"]["duration"] / US, "volume": seg.get("volume", 1), "file": Path(a.get("path", "")).name})
            elif tr["type"] == "effect":
                for e in m.get("video_effects", []):
                    if e["id"] == mid:
                        out["effects"].append({"name": e.get("name"), "start": seg["target_timerange"]["start"] / US, "duration": seg["target_timerange"]["duration"] / US, "params": [(p.get("name"), p.get("value")) for p in e.get("adjust_params", [])]})
            elif tr["type"] == "sticker" and mid in stickers:
                s = stickers[mid]
                out["stickers"].append({"name": s.get("name"), "clip": seg.get("clip")})
            elif tr["type"] == "video" and mid in videos and not videos[mid].get("path") and any(r in pool for r in (seg.get("extra_material_refs") or [])):
                # clip ghep: draft con theo ma lien ket, gop transform + ke thua animation/hieu ung cua clip cha
                key = next(r for r in seg["extra_material_refs"] if r in pool)
                sub = parse_draft(pool[key], pool)
                clip = seg.get("clip") or {}
                vx, vy = (clip.get("transform") or {}).get("x", 0), (clip.get("transform") or {}).get("y", 0)
                vs = (clip.get("scale") or {}).get("x", 1)
                t0 = seg["target_timerange"]["start"] / US
                refs = seg.get("extra_material_refs") or []
                g_anims = [{"name": a.get("name"), "type": a.get("type"), "start": a.get("start", 0) / US, "duration": a.get("duration", 0) / US, "id": a.get("resource_id"), "group": True} for r in refs for a in anims_by_id.get(r, [])]
                g_effs = [effects[r] for r in refs if r in effects]
                g_mask = next((masks[r] for r in refs if r in masks), None)
                for L in sub["layers"]:
                    fh, fv = bool((clip.get("flip") or {}).get("horizontal")), bool((clip.get("flip") or {}).get("vertical"))
                    L["x"], L["y"], L["scale"] = vx + vs * (-L["x"] if fh else L["x"]), vy + vs * (-L["y"] if fv else L["y"]), vs * L["scale"]
                    L["flipH"], L["flipV"] = L.get("flipH", False) ^ fh, L.get("flipV", False) ^ fv
                    L["rotation"] = L.get("rotation", 0) + clip.get("rotation", 0)
                    L["start"] += t0
                    L["animations"] = g_anims + L["animations"]
                    L["effects"] = g_effs + L["effects"]
                    L["fromCompound"] = True
                    if g_mask:
                        L["mask"] = g_mask
                    out["layers"].append(L)
                for a in sub["audio"]:
                    a["start"] += t0
                    out["audio"].append(a)
                out["effects"] += sub["effects"]
            elif tr["type"] == "video" and mid in videos:
                v = videos[mid]
                out["videos"].append({"type": v.get("type"), "name": v.get("material_name"), "w": v.get("width"), "h": v.get("height"), "clip": seg.get("clip"), "start": seg["target_timerange"]["start"] / US, "duration": seg["target_timerange"]["duration"] / US})
    return out


def cover_box(path):
    """Khung bao noi dung anh bia (toa do khung 1080x1920). Anh bia CapCut tu can giua + phong vua."""
    import subprocess
    if not path:
        return None
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", "scale=180:320,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
    if len(raw) != 180 * 320:
        return None
    rows = [raw[i * 180:(i + 1) * 180] for i in range(320)]
    ys = [y for y, r in enumerate(rows) if max(r) > 70]
    xs = [x for x in range(180) if any(rows[y][x] > 70 for y in ys)]
    if not ys or not xs:
        return None
    return [min(xs) * 6, (max(xs) + 1) * 6, min(ys) * 6, (max(ys) + 1) * 6]


def main():
    root, out = Path(sys.argv[1]), Path(sys.argv[2])
    presets = []
    for d in sorted((p for p in root.iterdir() if p.is_dir()), key=lambda p: int(re.findall(r"\d+", p.name)[-1]) if re.findall(r"\d+", p.name) else 0):
        f = d / "preset_draft" / "draft_content.json"
        if not f.exists():
            continue
        top = json.loads(f.read_text(encoding="utf-8"))
        drafts = [x["draft"] for x in top.get("materials", {}).get("drafts", []) if "draft" in x]
        # draft day du nhat (nhieu lop nhat) la ban preset; draft con lai la ban rut gon
        best = max(drafts, key=lambda x: sum(len(t.get("segments", [])) for t in x.get("tracks", []))) if drafts else top
        p = parse_draft(best, {x["id"]: x["draft"] for x in top.get("materials", {}).get("drafts", []) if "draft" in x})
        p["id"] = d.name
        p["cover"] = str(next(d.glob("*.jpeg"), ""))
        p["coverBox"] = cover_box(p["cover"])
        presets.append(p)
    out.write_text(json.dumps(presets, ensure_ascii=False, indent=1), encoding="utf-8")
    # thong ke
    from collections import Counter

    fonts, anims, effs, auds, fills = Counter(), Counter(), Counter(), Counter(), Counter()
    for p in presets:
        for l in p["layers"]:
            fonts[l["font"]] += 1
            for st in l["styles"]:
                if st.get("font"):
                    fonts[st["font"]] += 0
                if st.get("fill"):
                    fills[list(st["fill"].keys())[0]] += 1
            for a in l["animations"]:
                anims[(a["type"], a["name"])] += 1
        for e in p["effects"]:
            effs[e["name"]] += 1
        for a in p["audio"]:
            auds[a["name"]] += 1
    print(f"{len(presets)} preset, {sum(len(p['layers']) for p in presets)} lop chu")
    print("FONT:", dict(fonts.most_common()))
    print("ANIM:", dict(anims.most_common()))
    print("EFFECT:", dict(effs.most_common()))
    print("AUDIO:", dict(auds.most_common()))
    print("FILL:", dict(fills))
    print("STICKERS/VIDEOS:", sum(len(p["stickers"]) for p in presets), sum(len(p["videos"]) for p in presets))


main()
