#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

CACHE_DIR=".asset-cache/preview"
PID_FILE="$CACHE_DIR/next-dev.pid"
LOG_FILE="$CACHE_DIR/next-dev.log"
LEGACY_PID_FILE=".asset-cache/next-dev.pid"
LEGACY_LOG_FILE=".asset-cache/next-dev.log"
PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"
LOCAL_URL="http://127.0.0.1:${PORT}"
COMMAND="${1:-start}"

mkdir -p "$CACHE_DIR"

pid_alive() {
  local pid="$1"
  [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1
}

pid_from_file() {
  local file="$1"
  [[ -f "$file" ]] || return 1
  tr -cd '0-9' < "$file"
}

tracked_pid() {
  local pid=""
  if pid="$(pid_from_file "$PID_FILE" 2>/dev/null)" && pid_alive "$pid"; then
    echo "$pid|$PID_FILE|$LOG_FILE|current"
    return 0
  fi
  if pid="$(pid_from_file "$LEGACY_PID_FILE" 2>/dev/null)" && pid_alive "$pid"; then
    echo "$pid|$LEGACY_PID_FILE|$LEGACY_LOG_FILE|legacy"
    return 0
  fi
  return 1
}

http_code() {
  curl -L -s -o /dev/null -w "%{http_code}" "${LOCAL_URL}/" 2>/dev/null || true
}

print_urls() {
  cat <<EOF
Homepage: ${LOCAL_URL}/
Context Diet: ${LOCAL_URL}/labs/context-diet
Logs: ${LOG_FILE}
PID: ${PID_FILE}
EOF
}

wait_ready() {
  local code=""
  for _ in $(seq 1 45); do
    code="$(http_code)"
    if [[ "$code" == "200" ]]; then
      echo "Preview ready."
      print_urls
      return 0
    fi
    sleep 1
  done
  echo "Preview did not become ready in time. Last HTTP status: ${code:-none}" >&2
  echo "--- log tail ---" >&2
  tail -80 "$LOG_FILE" >&2 || true
  return 1
}

ensure_project() {
  if [[ ! -f package.json ]]; then
    echo "package.json not found. Run this from the Gaia Research repository root." >&2
    exit 1
  fi
  if ! node -e "const p=require('./package.json'); process.exit(p.scripts&&p.scripts.dev?0:1)" >/dev/null 2>&1; then
    echo "package.json does not define a dev script." >&2
    exit 1
  fi
  if [[ ! -d node_modules ]]; then
    echo "node_modules missing; running npm install first..."
    npm install
  fi
}

start_preview() {
  ensure_project

  local tracked=""
  if tracked="$(tracked_pid)"; then
    IFS='|' read -r pid pid_file log_file flavor <<< "$tracked"
    echo "Preview already has a tracked ${flavor} process: pid ${pid} (${pid_file})."
    local code="$(http_code)"
    echo "HTTP status: ${code:-none}"
    if [[ "$flavor" == "legacy" ]]; then
      echo "Note: this is the legacy preview started before the /preview skill existed. Restart to migrate logs/PID into ${CACHE_DIR}."
    fi
    print_urls
    return 0
  fi

  local code="$(http_code)"
  if [[ "$code" == "200" ]]; then
    echo "Port ${PORT} is already serving HTTP 200 at ${LOCAL_URL}/; not starting a duplicate server."
    print_urls
    return 0
  fi

  echo "Starting Next.js preview on ${HOST}:${PORT}..."
  nohup npm run dev -- --hostname "$HOST" --port "$PORT" > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  echo "Started pid $(cat "$PID_FILE")."
  wait_ready
}

status_preview() {
  local tracked=""
  if tracked="$(tracked_pid)"; then
    IFS='|' read -r pid pid_file log_file flavor <<< "$tracked"
    echo "Tracked ${flavor} process: pid ${pid} (${pid_file})"
    echo "Log file: ${log_file}"
  else
    echo "No tracked preview PID is alive."
  fi
  local code="$(http_code)"
  echo "HTTP status at ${LOCAL_URL}/: ${code:-none}"
  print_urls
}

logs_preview() {
  local lines="${2:-80}"
  local tracked=""
  if tracked="$(tracked_pid)"; then
    IFS='|' read -r _pid _pid_file log_file _flavor <<< "$tracked"
    tail -"$lines" "$log_file" || true
    return 0
  fi
  if [[ -f "$LOG_FILE" ]]; then
    tail -"$lines" "$LOG_FILE" || true
  elif [[ -f "$LEGACY_LOG_FILE" ]]; then
    tail -"$lines" "$LEGACY_LOG_FILE" || true
  else
    echo "No preview log file found."
  fi
}

stop_preview() {
  local stopped=0
  for file in "$PID_FILE" "$LEGACY_PID_FILE"; do
    local pid=""
    if pid="$(pid_from_file "$file" 2>/dev/null)" && pid_alive "$pid"; then
      echo "Stopping tracked preview pid ${pid} (${file})..."
      kill "$pid" >/dev/null 2>&1 || true
      stopped=1
    fi
    rm -f "$file"
  done
  if [[ "$stopped" == "0" ]]; then
    echo "No tracked preview process was alive."
  else
    echo "Stopped tracked preview process."
  fi
}

case "$COMMAND" in
  start|open)
    start_preview
    ;;
  status|check|health)
    status_preview
    ;;
  logs|log)
    logs_preview "$@"
    ;;
  stop)
    stop_preview
    ;;
  restart)
    stop_preview
    start_preview
    ;;
  urls|url)
    print_urls
    ;;
  help|-h|--help)
    cat <<EOF
Usage: $0 [start|status|logs [lines]|restart|stop|urls]

Defaults: HOST=${HOST}, PORT=${PORT}
EOF
    ;;
  *)
    echo "Unknown preview command: $COMMAND" >&2
    echo "Use: start, status, logs, restart, stop, urls" >&2
    exit 2
    ;;
esac
