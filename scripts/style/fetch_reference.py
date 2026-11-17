"""Tai video mau (TikTok/YouTube/Facebook/Drive/file) -> reference/<style-id>/ + proxy H.264 1080x1920.

Dung: python3 -I scripts/style/fetch_reference.py <style-id> <url-hoac-file> [<url> ...]
- Video goc giu nguyen (refNN.<ext>), proxy: refNN_proxy.mp4 (H.264, 1080x1920, giu fps <=60).
- Ghi nguon (url, tieu de, kenh, thoi luong) vao reference/<style-id>/sources.json.
- Khong dua len Git (.gitignore: reference/**).
Mang bi chan (403 CONNECT) -> in huong dan dung link Google Drive thay the.
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def sh(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def ensure_ytdlp():
    if shutil.which("yt-dlp"):
        return
    r = sh([sys.executable, "-m", "pip", "install", "-q", "yt-dlp"])
    if r.returncode or not shutil.which("yt-dlp"):
        sys.exit("Khong cai duoc yt-dlp: " + r.stderr[-400:])


def drive_id(url):
    m = re.search(r"(?:/d/|id=)([\w-]{20,})", url)
    return m.group(1) if m else None


def fetch(url, dest_stem):
    """Tra ve (path, meta)."""
    p = Path(url)
    if p.exists():
        out = dest_stem.with_suffix(p.suffix.lower())
        shutil.copy2(p, out)
        return out, {"source": str(p)}
    if "drive.google" in url:
        fid = drive_id(url)
        out = dest_stem.with_suffix(".mp4")
        r = sh(["curl", "-sSL", "-o", str(out), f"https://drive.usercontent.google.com/download?id={fid}&confirm=t"])
        if r.returncode or out.stat().st_size < 100_000:
            sys.exit(f"Tai Drive that bai ({url}). Kiem tra quyen chia se 'Bat ky ai co link'.")
        return out, {"source": url}
    ensure_ytdlp()
    tmpl = str(dest_stem) + ".%(ext)s"
    r = sh(["yt-dlp", "--no-playlist", "-f", "bv*[height<=1920]+ba/b", "--merge-output-format", "mp4",
            "--write-info-json", "-o", tmpl, url])
    if r.returncode:
        # Du phong: host audio rieng bi chan (vd TikTok mp3 o v16m.tiktokcdn-us.com) ->
        # lay video tot nhat (khong tieng) + am thanh tu ban ghep san (co tieng) roi tron lai.
        v = sh(["yt-dlp", "--no-playlist", "-f", "bv*[height<=1920]", "--write-info-json", "-o", str(dest_stem) + "_v.%(ext)s", url])
        a = sh(["yt-dlp", "--no-playlist", "-f", "b[acodec!=none][vcodec!=none]/b[acodec!=none]", "-o", str(dest_stem) + "_a.%(ext)s", url])
        if not v.returncode and not a.returncode:
            vf = next(dest_stem.parent.glob(dest_stem.name + "_v.*[!n]"))
            af = next(dest_stem.parent.glob(dest_stem.name + "_a.*"))
            out = dest_stem.with_suffix(".mp4")
            m = sh(["ffmpeg", "-v", "error", "-y", "-i", str(vf), "-i", str(af), "-map", "0:v:0", "-map", "1:a:0", "-c", "copy",
                    "-shortest", str(out)])
            if not m.returncode:
                vf.unlink(); af.unlink()
                ip = Path(str(dest_stem) + "_v.info.json")
                ip.rename(str(dest_stem) + ".info.json") if ip.exists() else None
                r = m
        for p in list(dest_stem.parent.glob(dest_stem.name + "*.part")) + list(dest_stem.parent.glob(dest_stem.name + ".f*")):
            p.unlink()
    if r.returncode:
        err = r.stderr[-800:]
        if "403" in err or "CONNECT" in err or "Unable to download webpage" in err:
            sys.exit("MANG_BI_CHAN: moi truong khong cho truy cap trang nay.\n"
                     "-> Cach nhanh: tai video ve dien thoai, up len Google Drive (chia se link) roi gui link Drive.\n"
                     "-> Hoac them ten mien vao Network access cua moi truong (xem SKILL.md).\n" + err)
        sys.exit("yt-dlp loi:\n" + err)
    info_p = Path(str(dest_stem) + ".info.json")
    info = json.loads(info_p.read_text()) if info_p.exists() else {}
    info_p.unlink(missing_ok=True)
    out = next(dest_stem.parent.glob(dest_stem.name + ".mp4"), None) or next(
        x for x in dest_stem.parent.glob(dest_stem.name + ".*") if x.suffix in (".mp4", ".webm", ".mkv", ".mov"))
    return out, {"source": url, "title": info.get("title"), "uploader": info.get("uploader"),
                 "duration": info.get("duration"), "upload_date": info.get("upload_date")}


def proxy(src, dst):
    pr = json.loads(sh(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=codec_name,width,height,r_frame_rate", "-of", "json", str(src)]).stdout)["streams"][0]
    num, den = map(int, pr["r_frame_rate"].split("/"))
    fps = min(60, round(num / den))
    vf = "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black"
    r = sh(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf", vf, "-r", str(fps), "-c:v", "libx264", "-preset", "veryfast",
            "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(dst)])
    if r.returncode:
        sys.exit("ffmpeg proxy loi: " + r.stderr[-400:])
    return pr


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    sid, urls = sys.argv[1], sys.argv[2:]
    d = ROOT / "reference" / sid
    d.mkdir(parents=True, exist_ok=True)
    sp = d / "sources.json"
    sources = json.loads(sp.read_text()) if sp.exists() else []
    known = {s["source"]: s for s in sources}
    for url in urls:
        if url in known and (d / known[url]["proxy"]).exists():
            print("da co:", known[url]["proxy"])
            continue
        k = len(sources) + 1
        path, meta = fetch(url, d / f"ref{k:02d}")
        px = d / f"ref{k:02d}_proxy.mp4"
        pr = proxy(path, px)
        meta.update({"id": f"ref{k:02d}", "file": path.name, "proxy": px.name,
                     "orig": f"{pr['codec_name']} {pr['width']}x{pr['height']} {pr['r_frame_rate']}"})
        sources.append(meta)
        sp.write_text(json.dumps(sources, ensure_ascii=False, indent=1))
        print(f"OK {meta['id']}: {meta.get('title') or url} -> {px.relative_to(ROOT)}")


main()
