#!/usr/bin/env bash
set -euo pipefail
GAS_URL='https://script.google.com/macros/s/AKfycbzZg11UDcIZGbwHvrtxb5E2enGspkQnjsBPbCP5Aw6BYP5Jo5cq3JqPr8PHOZgbgn2kOg/exec'
COMBOS=("default:classic" "ocean:zen" "forest:funfair" "midnight:retro" "sakura:classic")
for c in "${COMBOS[@]}"; do
  theme=${c%%:*}
  pack=${c##*:}
  unlockedThemes='["default","ocean","forest","midnight","sakura"]'
  unlockedPacks='["classic","zen","funfair","retro"]'
  userId="sim_${theme}_${pack}"
  gameStats='{"totalWins":5,"easyWins":3,"mediumWins":1,"hardWins":1,"perfectWins":0,"fastWins":1}'
  echo "CALL: $userId -> theme=$theme pack=$pack"
  curl -sS -G "$GAS_URL" \
    --data-urlencode "action=saveUserState" \
    --data-urlencode "userId=$userId" \
    --data-urlencode "unlockedThemes=$unlockedThemes" \
    --data-urlencode "unlockedSoundPacks=$unlockedPacks" \
    --data-urlencode "activeTheme=$theme" \
    --data-urlencode "activeSoundPack=$pack" \
    --data-urlencode "gameStats=$gameStats" \
    --max-time 30 || echo "curl failed for $userId"
  echo -e "\n---"
  sleep 0.3
done
