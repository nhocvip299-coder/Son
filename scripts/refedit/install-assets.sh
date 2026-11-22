#!/usr/bin/env bash
# Cai tai nguyen tu goi zip (SFX pack + font Nexa) vao repo Son. Dung (o thu muc goc repo): bash scripts/refedit/install-assets.sh <goi.zip>
set -euo pipefail
ZIP="${1:?Can duong dan file goi .zip}"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
TMP="$(mktemp -d)"; unzip -q "$ZIP" -d "$TMP"
S="$TMP/reference-video-edit-thinking/assets"
mkdir -p "$ROOT/public/sfx/pack" "$ROOT/public/fonts"
cp "$S"/sfx/pack/*.wav "$ROOT/public/sfx/pack/"
cp -n "$S"/sfx/*.wav "$ROOT/public/sfx/" 2>/dev/null || true
cp "$S"/fonts/*.otf "$ROOT/public/fonts/"
rm -rf "$TMP"
echo "Da cai: $(ls "$ROOT/public/sfx/pack" | wc -l) SFX pack, font: $(ls "$ROOT/public/fonts")"
