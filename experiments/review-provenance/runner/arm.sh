#!/usr/bin/env bash
# One arm of the review-provenance experiment. Usage: arm.sh <control|treatment> <rep> [probe]
# probe mode: same argv and environment, trivial prompt, no evaluation (exposure signal only).
# Env: EFFORT (default high), VARIANT (default empty = v1 ids; e.g. v2 -> ids prefixed v2-).
set -uo pipefail
ARM="$1"; REP="$2"; MODE="${3:-run}"
X="$HOME/.local/state/skill-heaven/issue-116/experiments/review-provenance"
EV="$HOME/.local/state/skill-heaven/issue-116/worktrees/research-e-case/experiments/review-provenance"
TREAT="$X/treatment/SKILL.md"
EXT="$HOME/.pi/agent/npm/node_modules/pi-antigravity/src/index.ts"
EFFORT="${EFFORT:-high}"; VARIANT="${VARIANT:-}"
MODEL="antigravity/gemini-3.8-flash:${EFFORT}"
ID="${VARIANT:+${VARIANT}-}${MODE}-rep${REP}-${ARM}"
RUN="$X/runs/$ID"
[ -e "$RUN" ] && { echo "refusing: $RUN exists (no retries)"; exit 2; }
mkdir -p "$RUN/session"
TASKROOT="$(mktemp -d "${TMPDIR:-/tmp}/rp-task-XXXXXX")"
cp "$EV/task/installability.ts" "$TASKROOT/installability.ts"

if [ "$MODE" = probe ]; then PROMPT="Reply with exactly the word OK."; else PROMPT="$(cat "$EV/task/prompt.md")"; fi

ARGV=(pi --model "$MODEL" --no-skills --no-context-files --no-prompt-templates --no-themes
      --no-extensions -e "$EXT" --no-approve --tools read,edit,write --session-dir "$RUN/session")
[ "$ARM" = treatment ] && ARGV+=(--append-system-prompt "$TREAT")
ARGV+=(--print "$PROMPT")

STARTED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "== $ID  cwd=$TASKROOT"
printf '%q ' "${ARGV[@]:0:${#ARGV[@]}-1}"; echo "<prompt sha256 $(printf '%s' "$PROMPT" | shasum -a 256 | cut -c1-12)>"
( cd "$TASKROOT" && "${ARGV[@]}" ) >"$RUN/stdout.txt" 2>"$RUN/stderr.txt"
PI_EXIT=$?
ENDED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "pi exit=$PI_EXIT"

EVAL_EXIT=null
if [ "$MODE" = run ]; then
  cp "$TASKROOT/installability.ts" "$RUN/result.ts"
  ( cd "$EV/../.." && NODE_NO_WARNINGS=1 node --experimental-strip-types experiments/review-provenance/evaluator.mjs --task "$RUN/result.ts" ) >"$RUN/eval.json" 2>"$RUN/eval.stderr"
  EVAL_EXIT=$?
  echo "eval exit=$EVAL_EXIT"
fi
( cd "$TASKROOT" && find . -type f | sort ) >"$RUN/taskroot-files.txt"

python3 - "$RUN" "$ID" "$ARM" "$REP" "$MODE" "$STARTED" "$ENDED" "$PI_EXIT" "$EVAL_EXIT" "$TASKROOT" "$MODEL" "$EV" "$TREAT" <<'PY'
import sys, json, hashlib, glob, os, subprocess
run, id_, arm, rep, mode, started, ended, piexit, evexit, taskroot, model, ev, treat = sys.argv[1:]
sha = lambda p: hashlib.sha256(open(p,'rb').read()).hexdigest() if os.path.exists(p) else None
sessions = sorted(glob.glob(f"{run}/session/**/*.jsonl", recursive=True))
usage = []
for s in sessions:
    for line in open(s):
        try: o = json.loads(line)
        except Exception: continue
        m = o.get("message") or {}
        if m.get("role") == "assistant" and m.get("usage"):
            u = m["usage"]; usage.append({k: u.get(k) for k in ("input","output","cacheRead","cacheWrite","totalTokens")})
        if o.get("type") == "model_change": model_seen = f'{o.get("provider")}/{o.get("modelId")}'
ev_out = None
if evexit != "null":
    try: ev_out = json.load(open(f"{run}/eval.json"))
    except Exception: ev_out = None
failed = None
if ev_out is not None:
    cs = ev_out.get("checks") or []
    failed = [c.get("id") for c in cs if not (c.get("passed") or c.get("pass"))]
rec = {
  "schema": "gaia.research-arbor-review-provenance-run/v1",
  "id": id_, "mode": mode, "arm": arm, "replication": int(rep),
  "startedAt": started, "endedAt": ended,
  "harness": {"name": "pi", "version": subprocess.run(["pi","--version"],capture_output=True,text=True).stdout.strip(),
              "extensionsLoaded": ["pi-antigravity"], "tools": ["read","edit","write"],
              "skillsDiscovery": False, "contextFiles": False},
  "model": {"requested": model, "observedInSession": locals().get("model_seen")},
  "treatmentDelivery": ({"method": "append-system-prompt", "sha256": sha(treat), "bytes": os.path.getsize(treat)} if arm == "treatment" else None),
  "sessionFiles": [os.path.relpath(s, run) for s in sessions],
  "assistantUsage": usage,
  "piExit": int(piexit),
  "taskRootFiles": open(f"{run}/taskroot-files.txt").read().split(),
  "artifacts": {"taskInSha256": sha(f"{ev}/task/installability.ts"), "resultSha256": sha(f"{run}/result.ts"),
                "promptSha256": sha(f"{ev}/task/prompt.md"), "evaluatorSha256": sha(f"{ev}/evaluator.mjs"),
                "fixtureSha256": sha(f"{ev}/fixture.json")},
  "evaluation": None if evexit == "null" else {"exit": int(evexit), "failedChecks": failed},
}
json.dump(rec, open(f"{run}/record.json","w"), indent=2)
print(json.dumps({"id": id_, "piExit": rec["piExit"], "model": rec["model"]["observedInSession"], "firstInput": usage[0] if usage else None, "turns": len(usage), "eval": rec["evaluation"]}))
PY
