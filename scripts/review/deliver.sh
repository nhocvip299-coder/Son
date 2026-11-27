#!/usr/bin/env bash
# Render ban hoan chinh tu nguon goc 1080p60 (ban thuong + ban chay chu tung chu), master -14 LUFS, QC,
# ban xem nhanh ~58 MB (1080p30) va ban 1080p60 cat phan ~24 s (<75 MB/phan) de gui qua SendUserFile.
# Dung: bash scripts/review/deliver.sh projects/<du-an> <ten-du-an> <ten-file-ra>
set -euo pipefail
PJ=$1; P=$2; O=$3; S=$(mktemp -d)
python3 - "$PJ" "$P" "$S" <<'PY'
import json,sys
pj,p,s=sys.argv[1:]
for n in ('plan','plan-wbw'):
    d=json.load(open(f'{pj}/{n}.json')); d['source']=f'inputs/{p}/source-goc1080.mp4'; d['fps']=60
    json.dump({'plan':d},open(f'{s}/{n}.json','w'),ensure_ascii=False)
PY
mkdir -p out/phan
for pair in plan:$O plan-wbw:$O-wbw; do pp=${pair%%:*}; o=${pair#*:}
  npx remotion render src/index.ts ReviewEdit out/$o-raw.mp4 --props=$S/$pp.json --crf=15
  node scripts/pipeline/master-audio.mjs out/$o-raw.mp4 out/$o.mp4
  node scripts/pipeline/qc.mjs out/$o.mp4 --fps 60
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/$o.mp4)
  VB=$(python3 -c "print(int(56*8*1024/$D-130))")  # ~58 MB
  (cd $S && ffmpeg -v error -y -i $OLDPWD/out/$o.mp4 -vf fps=30 -c:v libx264 -preset slow -b:v ${VB}k -pass 1 -an -f null /dev/null && ffmpeg -v error -y -i $OLDPWD/out/$o.mp4 -vf fps=30 -c:v libx264 -preset slow -b:v ${VB}k -pass 2 -c:a aac -b:a 128k -movflags +faststart $OLDPWD/out/$o-xemnhanh.mp4)
  (cd $S && ffmpeg -v error -y -i $OLDPWD/out/$o.mp4 -c:v libx264 -preset medium -b:v 17500k -maxrate 25M -bufsize 35M -pass 1 -an -f null /dev/null && ffmpeg -v error -y -i $OLDPWD/out/$o.mp4 -c:v libx264 -preset medium -b:v 17500k -maxrate 25M -bufsize 35M -pass 2 -c:a copy -movflags +faststart $OLDPWD/out/$o-1080p60-gui.mp4)
  ffmpeg -v error -y -i out/$o-1080p60-gui.mp4 -c copy -map 0 -f segment -segment_time 24 -reset_timestamps 1 -segment_format_options movflags=+faststart out/phan/$o-phan%02d.mp4
done
ls -la out/$O* out/phan/$O*
