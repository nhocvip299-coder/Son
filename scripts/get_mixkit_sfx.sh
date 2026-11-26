#!/usr/bin/env bash
# Tai bo SFX that tu Mixkit (Mixkit Sound Effects Free License: dung mien phi trong video, ke ca thuong mai;
# KHONG phan phoi lai file roi -> khong dua len Git, chay script nay de tai lai). Chuyen sang WAV 48kHz.
set -euo pipefail
cd "$(dirname "$0")/../public/sfx" && mkdir -p mixkit
get() { [ -f "mixkit/$2.wav" ] || { curl -sL --retry 3 "https://assets.mixkit.co/active_storage/sfx/$1/$1-preview.mp3" -o "mixkit/$2.mp3" && ffmpeg -v error -y -i "mixkit/$2.mp3" -ar 48000 -ac 2 "mixkit/$2.wav" && rm "mixkit/$2.mp3"; }; }
get 3005 pop-whoosh        # Explainer video pops whoosh light pop
get 2357 bubble-pop        # Bubble pop up alert notification
get 2358 long-pop          # Long pop
get 166  small-sweep       # Fast small sweep transition
get 175  short-sweep       # Short transition sweep
get 3115 fast-swoosh       # Fast transitions swoosh
get 1125 type-click        # Typewriter soft click
get 1107 page-chime        # Page forward single chime
get 2870 correct-tone      # Correct answer tone
get 952  correct-reward    # Correct answer reward
get 2903 whoosh-impact     # Movie whoosh impact presentation
get 2350 sparkle-whoosh    # Magic sparkle whoosh
ls mixkit
