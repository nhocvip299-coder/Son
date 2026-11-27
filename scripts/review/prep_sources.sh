#!/usr/bin/env bash
# Chuan bi nguon tu clip goc (DJI HEVC 1728x3072): proxy H.264 de xem/phan tich + ban trung gian chat luong cao tu goc de render cuoi.
# Dung: bash scripts/review/prep_sources.sh work/<du-an> <ten-du-an>   (clip goc dat san trong work/<du-an>/raw/*.mp4)
set -euo pipefail
W=$1; P=$2; cd "$W"; mkdir -p proxy hq1080
ls raw/*.mp4 | xargs -P 4 -I{} sh -c 'n=$(basename {} .mp4); [ -f proxy/$n.mp4 ] || ffmpeg -v error -y -i {} -map 0:v:0 -map 0:a:0 -vf "scale=1080:1920:flags=lanczos,fps=60,format=yuv420p" -c:v libx264 -preset veryfast -crf 18 -g 30 -c:a aac -b:a 192k -ar 48000 -ac 2 proxy/$n.mp4'
ls raw/*.mp4 | xargs -P 4 -I{} sh -c 'n=$(basename {} .mp4); [ -f hq1080/$n.mp4 ] || ffmpeg -v error -y -i {} -map 0:v:0 -map 0:a:0 -vf "scale=1080:1920:flags=lanczos,unsharp=5:5:0.45:5:5:0,fps=60,format=yuv420p" -c:v libx264 -preset slow -crf 12 -g 30 -c:a aac -b:a 256k -ar 48000 -ac 2 hq1080/$n.mp4'
for d in proxy hq1080; do ls $d/*.mp4 | sed "s|$d/|file '|;s/$/'/" > $d/list.txt; done
ffmpeg -v error -y -f concat -safe 0 -i proxy/list.txt -c copy source.mp4
ffmpeg -v error -y -f concat -safe 0 -i hq1080/list.txt -c copy source-goc1080.mp4
cd - >/dev/null; mkdir -p public/inputs/$P
# hardlink (Remotion khong doc symlink)
ln -f "$W/source.mp4" public/inputs/$P/source.mp4; ln -f "$W/source-goc1080.mp4" public/inputs/$P/source-goc1080.mp4
echo '"clips" offsets (giay) cho edl.json:'
python3 - "$W" <<'P'
import subprocess,sys,json,glob,os
t=0;o={}
for f in sorted(glob.glob(sys.argv[1]+'/proxy/*.mp4')):
    o[os.path.basename(f)[:-4]]=round(t,3)
    t+=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f],capture_output=True,text=True).stdout)
print(json.dumps(o)); print('tong', round(t,3),'s')
P
