#!/usr/bin/env bash
# Dong goi skill reference-video-edit-thinking + TAI NGUYEN khong dua len Git (bo SFX pack, font Nexa) -> 1 file zip de lan sau tai su dung.
# Dung: bash scripts/refedit/pack-assets.sh [out.zip]
set -euo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:-out/reference-video-edit-thinking-goi.zip}"
TMP="$(mktemp -d)"; D="$TMP/reference-video-edit-thinking"
mkdir -p "$D/assets/sfx/pack" "$D/assets/fonts" "$D/skill" "$D/code/src" "$D/code/scripts"
cp public/sfx/pack/*.wav "$D/assets/sfx/pack/"
cp public/sfx/{bubble,tick,keyspace}.wav public/sfx/key*.wav "$D/assets/sfx/" 2>/dev/null || true
cp public/fonts/*.otf "$D/assets/fonts/"
cp -r .claude/skills/reference-video-edit-thinking/. "$D/skill/"
cp -r src/styles/refEdit "$D/code/src/"
cp -r scripts/refedit "$D/code/scripts/"
cp styles/reference-01/timeline.json "$D/skill/references/timeline-video-mau.json"
cp scripts/refedit/install-assets.sh "$D/"
cat > "$D/DOC-TRUOC.txt" <<'TXT'
GOI SKILL reference-video-edit-thinking
- skill/        : SKILL.md + references (tu duy editor, thong so, quy trinh, kiem chung)
- assets/sfx/pack: 15 SFX (bo cua editor TikTok @vietanh.videoeditor - chi dung noi bo, ban quyen thuoc tac gia)
- assets/fonts  : 1FTV Nexa Heavy (tu bo "100 Font chu Viet hoa" cua nguoi dung)
- code/         : ban sao component Remotion + script (ban chinh nam trong repo Son, nhanh claude/magical-heisenberg-xe4q1k)
Cai lai vao repo Son: bash install-assets.sh <duong-dan-goi.zip>   (hoac giai nen roi chay trong thu muc goc repo)
TXT
mkdir -p "$(dirname "$OUT")"; rm -f "$OUT"
(cd "$TMP" && zip -qr - reference-video-edit-thinking) > "$OUT"
rm -rf "$TMP"; ls -la "$OUT"
