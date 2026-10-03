#!/usr/bin/env bash
# v3: one replication pair, control and treatment run concurrently in two visible
# herdr panes through the pi-zero door in interactive mode.
# Usage: pair-interactive.sh <rep> <control_pane> <treatment_pane>
set -uo pipefail
export LC_ALL=C
REP="$1"; PC="$2"; PT="$3"
X="$HOME/.local/state/skill-heaven/issue-116/experiments/review-provenance"
EV="$HOME/.local/state/skill-heaven/issue-116/worktrees/research-e-case/experiments/review-provenance"
HEAVEN="$HOME/.local/state/skill-heaven/issue-116/worktrees/heaven-a-finish"
PZ="$HEAVEN/packages/pi-zero/bin/pi-zero.mjs"
TREAT="$X/treatment"
MODEL_PREFIX="${MODEL_PREFIX:-antigravity/gemini-3.8-flash}"
MODEL="$MODEL_PREFIX:${EFFORT:-medium}"
VARIANT="${VARIANT:-v3}"
# ID_SUFFIX lets an infrastructure-abort rerun carry a fresh run id, as the
# preregistered infrastructureAbortRule requires ("rerun in full under a new
# attempt id"; the aborted attempt is kept).
ID_SUFFIX="${ID_SUFFIX:-}"
READY_FOOTER="${READY_FOOTER:-(antigravity) gemini-3.8-flash}"
# Prompt: task/prompt.md flattened to one line so it submits as a single message.
PROMPT="$(python3 -c 'import sys,re; t=open(sys.argv[1]).read(); print(re.sub(r"\s+"," ",t).strip())' "$EV/task/prompt.md")"

start_arm() {  # arm pane
  local ARM="$1" P="$2" ID="${VARIANT}-run-rep${REP}${ID_SUFFIX}-$1"
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

# READY_FOOTER: substring the pi status line must contain before the prompt is sent.
# Defaults to the v3 antigravity footer; v4 sets it to the space-bunny-alpha footer.
wait_ready() {  # pane
  for _ in $(seq 1 45); do herdr pane read "$1" 2>/dev/null | grep -qF "$READY_FOOTER" && { sleep 3; return 0; }; sleep 2; done
  echo "pane $1 never showed the model footer (expected: $READY_FOOTER)"; return 1
}

# agent_status PANE  -- prints working|idle|done|blocked|unknown|absent
agent_status() {
  herdr agent list | P="$1" python3 -c "import sys,json,os; a=[x for x in json.load(sys.stdin)['result']['agents'] if x['pane_id']==os.environ['P']]; print(a[0]['agent_status'] if a else 'absent')" 2>/dev/null || echo absent
}
wait_working() {  # bounded; non-zero only if the agent never registers as working
  for _ in $(seq 1 60); do
    case "$(agent_status "$1")" in working|idle|done) return 0 ;; esac
    sleep 2
  done
  return 1
}
wait_idle() {  # bounded; an arm that overruns this is a harness timeout, recorded as such
  for _ in $(seq 1 1800); do
    case "$(agent_status "$1")" in idle|done) return 0 ;; esac
    sleep 2
  done
  return 1
}
finish_arm() {  # arm pane
  local ARM="$1" P="$2" ID="${VARIANT}-run-rep${REP}${ID_SUFFIX}-$1"
  local RUN="$X/runs/$ID"
  wait_working "$P" || echo "WARN $ID: agent never reported working"
  # idle must hold for 20s to count as finished
  while :; do
    wait_idle "$P" || { echo "HARNESS-TIMEOUT $ID"; break; }
    sleep 20
    [ "$(agent_status "$P")" = idle ] && break
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
