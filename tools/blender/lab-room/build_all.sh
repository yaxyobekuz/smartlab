#!/usr/bin/env bash
# Rebuild the chemistry lab room end to end and copy the web assets into client/public/models/lab-room.
# Usage: ./build_all.sh [--size 4096] [--samples 1024] [--no-copy]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
BLENDER="${BLENDER:-/opt/homebrew/bin/blender}"
SIZE=4096
SAMPLES=1024
COPY=1
while [[ $# -gt 0 ]]; do
  case "$1" in
    --size) SIZE="$2"; shift 2 ;;
    --samples) SAMPLES="$2"; shift 2 ;;
    --no-copy) COPY=0; shift ;;
    *) echo "unknown arg $1"; exit 1 ;;
  esac
done
B() { "$BLENDER" --background --factory-startup --python "$@"; }
mkdir -p "$HERE/build/logs"

echo "== 1/7 download CC0 assets";   python3 "$HERE/download_assets.py"
echo "== 2/7 prepare textures";      B "$HERE/prepare_textures.py" > "$HERE/build/logs/prepare.log" 2>&1
echo "== 3/7 build room";            B "$HERE/build_room.py" > "$HERE/build/logs/build.log" 2>&1
echo "== 4/7 bake lightmap ($SIZE px, $SAMPLES spp)"
B "$HERE/bake_lightmap.py" -- --size "$SIZE" --samples "$SAMPLES" > "$HERE/build/logs/bake.log" 2>&1
echo "== 5/7 refine + encode + export"
B "$HERE/refine_lightmap.py" > "$HERE/build/logs/refine.log" 2>&1
B "$HERE/export_room.py" > "$HERE/build/logs/export.log" 2>&1
echo "== 6/7 optimize + web assets"; node "$HERE/node/finalize_assets.cjs" "$HERE/build" "$HERE/build/out"
echo "== 7/7 verify";                node "$HERE/node/inspect_glb.cjs" "$HERE/build/out/room.glb" --json "$HERE/build/out-inspect.json" | tail -3
if [[ $COPY == 1 ]]; then
  DEST="$REPO/client/public/models/lab-room"
  mkdir -p "$DEST"
  cp "$HERE"/build/out/{room.glb,lightmap-high.webp,lightmap-low.webp,exterior.jpg,colliders.json,room-meta.json} "$DEST/"
  echo "copied to $DEST"
fi
