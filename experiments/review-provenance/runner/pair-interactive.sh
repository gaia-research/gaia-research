#!/usr/bin/env bash
# v3: one replication pair, control and treatment run concurrently in two visible
# herdr panes through the pi-zero door in interactive mode.
# Usage: pair-interactive.sh <rep> <control_pane> <treatment_pane>
set -uo pipefail
REP="$1"; PC="$2"; PT="$3"
X="$HOME/.local/state/skill-heaven/issue-116/experiments/review-provenance"
EV="$HOME/.local/state/skill-heaven/issue-116/worktrees/research-e-case/experiments/review-provenance"
HEAVEN="$HOME/.local/state/skill-heaven/issue-116/worktrees/heaven-a-finish"
PZ="$HEAVEN/packages/pi-zero/bin/pi-zero.mjs"
TREAT="$X/treatment"
MODEL="antigravity/gemini-3.8-flash:${EFFORT:-medium}"
VARIANT="${VARIANT:-v3}"
# Prompt: task/prompt.md flattened to one line so it submits as a single message.
PROMPT="$(python3 -c 'import sys,re; t=open(sys.argv[1]).read(); print(re.sub(r"\s+"," ",t).strip())' "$EV/task/prompt.md")"

start_arm() {  # arm pane
  local ARM="$1" P="$2" ID="${VARIANT}-run-rep${REP}-$1"
  local RUN="$X/runs/$ID"
  [ -e "$RUN" ] && { echo "refusing: $RUN exists (no retries)"; return 2; }
  mkdir -p "$RUN/session"
  local TR; TR="$(mktemp -d "${TMPDIR:-/tmp}/rp-task-XXXXXX")"
  cp "$EV/task/installability.ts" "$TR/installability.ts"
  printf '%s' "$PROMPT" >"$RUN/prompt.txt"
  local LEVEL=(--level zero); [ "$ARM" = treatment ] && LEVEL=(--level low --skill "$TREAT")
  local EXTRA=(--no-context-files --no-prompt-templates --no-approve --tools read,edit,write --session-dir "$RUN/session")
  local CMD; CMD="cd $(printf '%q' "$TR") && clear && echo '== $ID ($ARM) via pi-zero ${LEVEL[*]}' && node $(printf '%q' "$PZ") ${LEVEL[*]} --model $MODEL -- ${EXTRA[*]}"
  python3 -c 'import json,sys; print(json.dumps({"doorCommit": sys.argv[1], "level": sys.argv[2:4], "piArgs": sys.argv[4:]}))' \
    "$(git -C "$HEAVEN" rev-parse HEAD)" "${LEVEL[@]:0:2}" "${EXTRA[@]}" >"$RUN/launch.json"
  echo "$RUN|$TR|$(date -u +%Y-%m-%dT%H:%M:%SZ)" >"$RUN/.state"
  herdr pane run "$P" "$CMD" >/dev/null
}

wait_ready() {  # pane
  for _ in $(seq 1 45); do herdr pane read "$1" 2>/dev/null | grep -q "gemini-3.8-flash" && { sleep 3; return 0; }; sleep 2; done
  echo "pane $1 never showed the model footer"; return 1
}

finish_arm() {  # arm pane
  local ARM="$1" P="$2" ID="${VARIANT}-run-rep${REP}-$1"
  local RUN="$X/runs/$ID"
  herdr agent wait "$P" --until working --timeout 120000 >/dev/null 2>&1
  # idle must hold for 20s to count as finished
  while :; do
    herdr agent wait "$P" --until idle --timeout 2400000 >/dev/null 2>&1 || break
    sleep 20
    herdr agent list | python3 -c "import sys,json; a=[x for x in json.load(sys.stdin)['result']['agents'] if x['pane_id']=='$P']; sys.exit(0 if a and a[0]['agent_status']=='idle' else 1)" && break
  done
  IFS='|' read -r _ TR STARTED <"$RUN/.state"
  python3 "$X/runner/finish.py" "$RUN" "$ID" "$ARM" "$REP" "$STARTED" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    "$TR" "$MODEL" "$EV" "$TREAT" "$(cat "$RUN/launch.json")"
}

start_arm control "$PC" || exit 2
start_arm treatment "$PT" || exit 2
wait_ready "$PC" && wait_ready "$PT" || exit 3
herdr pane run "$PC" "$PROMPT" >/dev/null
herdr pane run "$PT" "$PROMPT" >/dev/null
finish_arm control "$PC" &
finish_arm treatment "$PT" &
wait
