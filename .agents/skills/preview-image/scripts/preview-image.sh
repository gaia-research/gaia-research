#!/usr/bin/env bash
set -euo pipefail

usage() {
  printf 'Usage: %s <image-path> [--port PORT] [--copy-downloads]\n' "$0" >&2
  exit 64
}

[[ $# -ge 1 ]] || usage
IMAGE_PATH=$1
shift
PORT=4177
COPY_DOWNLOADS=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      [[ $# -ge 2 ]] || usage
      PORT=$2
      shift 2
      ;;
    --copy-downloads)
      COPY_DOWNLOADS=true
      shift
      ;;
    *) usage ;;
  esac
done

[[ "$PORT" =~ ^[0-9]{2,5}$ ]] || { printf 'Port must be numeric.\n' >&2; exit 64; }
[[ -f "$IMAGE_PATH" ]] || { printf 'Image not found: %s\n' "$IMAGE_PATH" >&2; exit 66; }

IMAGE_PATH=$(python3 -c 'import os, sys; print(os.path.realpath(sys.argv[1]))' "$IMAGE_PATH")
IMAGE_DIR=$(dirname "$IMAGE_PATH")
IMAGE_NAME=$(basename "$IMAGE_PATH")
ENCODED_NAME=$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$IMAGE_NAME")
STATE_DIR="${PREVIEW_IMAGE_STATE_DIR:-.asset-cache}"
PID_FILE="$STATE_DIR/preview-image-server.pid"
LOG_FILE="$STATE_DIR/preview-image-server.log"
mkdir -p "$STATE_DIR"

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  kill "$(cat "$PID_FILE")" || true
fi

python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$IMAGE_DIR" >"$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
URL="http://127.0.0.1:${PORT}/${ENCODED_NAME}"

for _ in 1 2 3 4 5; do
  if curl --fail --silent --output /dev/null "$URL"; then
    break
  fi
  sleep 1
done
curl --fail --silent --output /dev/null "$URL"

if [[ "$COPY_DOWNLOADS" == true ]]; then
  DOWNLOADS_DIR="$HOME/storage/downloads"
  [[ -d "$DOWNLOADS_DIR" ]] || { printf 'Android Downloads is unavailable: %s\n' "$DOWNLOADS_DIR" >&2; exit 69; }
  DOWNLOAD_PATH="$DOWNLOADS_DIR/$IMAGE_NAME"
  cp "$IMAGE_PATH" "$DOWNLOAD_PATH"
  printf 'Copied: %s\n' "$DOWNLOAD_PATH"
fi

if command -v termux-open-url >/dev/null 2>&1; then
  termux-open-url "$URL"
else
  am start -a android.intent.action.VIEW -d "$URL" >/dev/null
fi

printf 'Opened: %s\nServer PID: %s\n' "$URL" "$(cat "$PID_FILE")"
