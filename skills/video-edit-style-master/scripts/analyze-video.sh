#!/usr/bin/env bash
# Phan tich video (mau hoac goc moi) -> <out>/: probe.json, analysis.json (cat canh, mau, chu, onset), timeline_2fps_*.jpg, asr/
# Dung: bash skills/video-edit-style-master/scripts/analyze-video.sh <video> <out_dir> [--no-asr]
set -euo pipefail
V=$(realpath "$1"); O=$(realpath -m "$2"); mkdir -p "$O"
cd "$(dirname "$0")/../../.."
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration,bit_rate -of json "$V" > "$O/probe.json"
P="$O/proxy.mp4"
# Chromium khong giai ma HEVC -> proxy H.264 1080x1920 (chi de phan tich/dung, khong ghi de goc)
[ -s "$P" ] || ffmpeg -nostdin -v error -y -i "$V" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -crf 16 -preset fast -c:a aac -b:a 192k "$P"
python3 -I scripts/style/analyze_reference.py "$P" "$O" > /dev/null
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V"); D=${D%.*}
for s in $(seq 0 28 "$D"); do ffmpeg -nostdin -v error -y -ss "$s" -t 28 -i "$P" -vf "fps=2,scale=135:240,tile=14x4" -frames:v 1 "$O/timeline_2fps_$s.jpg"; done
[ "${3:-}" = "--no-asr" ] || node scripts/pipeline/transcribe.mjs "$P" "$O/asr" > /dev/null
echo "XONG -> $O"
