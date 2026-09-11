# Orchestrator Brief — Context Compaction Phase 2 Benchmark

**You are the orchestrator.** This is your complete dispatch brief. Execute it
exactly as written. Do not improvise the protocol — every decision is pre-made.

Umbrella issue: #222
Plan: `docs/plans/context-compaction-phase-2/PLAN.md`

---

## Pre-Flight Checklist

Run these before anything else. If any check fails, stop and report.

```bash
# 1. Verify herdr is running
herdr status
# → server.status: running

# 2. Verify pi version (must be 0.83.0+)
pi --version
# → record exact version in data/run-metadata.json

# 3. Verify current models.json has the providers you expect
jq '.providers | keys[]' ~/.pi/agent/models.json
# → should include antigravity, google-antigravity, and any local providers (lmstudio, etc.)

# 4. Verify jq is available (used by the sandbox script)
jq --version
# → must be jq-1.6 or later

# 5. Verify sandbox script creates a valid sandbox
source scripts/compaction-bench/sandbox/create-sandbox.sh A-test 100000
echo "providers: $(jq '.providers | keys' "$SANDBOX_DIR/models.json")"
rm -rf "$SANDBOX_DIR" && unset PI_CODING_AGENT_DIR SANDBOX_DIR

# 6. Verify skill-cost is available
python3 ~/skill-cost/cost.py --help

# 7. Verify antigravity tokens are available (not quota-limited)
# Send a single test prompt in a throwaway pane
TEST_PANE=$(herdr pane split --current --direction right --ratio 0.3 --cwd "$PWD" --no-focus \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['pane']['pane_id'])")
herdr pane send-text "$TEST_PANE" 'pi --model antigravity/gemini-3.8-flash:high -p --no-session "Respond with exactly: PONG"
'
sleep 15
herdr pane read "$TEST_PANE" --source recent-unwrapped --lines 10
# → must see "PONG", not "Quota reached"
herdr pane close "$TEST_PANE"
```

If step 7 shows "Quota reached", wait until tokens reset. Do not proceed with quota-limited tokens — all cost data will be zeros.

---

## The Arm Loop

You run ONE arm at a time. Each arm gets its own **sandbox** — an isolated
`PI_CODING_AGENT_DIR` that symlinks everything from `~/.pi/agent` except
`models.json` (patched with `jq`) and `settings.json` (patched for A-disabled).
The production config is **never written to.**

### For each arm:

```
ARM=<arm-name>           # e.g., "A-100k"
CONTEXT_WINDOW=<value>   # e.g., 100000
SCENARIO=<1-6>
WORKLOAD=<bugfix|feature|refactor|endurance>
```

The context-window values per arm:

| Arm | `CONTEXT_WINDOW` |
|---|---|
| A-50k | 50000 |
| A-100k | 100000 |
| A-150k | 150000 |
| A-200k | 200000 |
| A-272k | 272000 |
| A-500k | 500000 |
| A-1M | 1048576 |
| A-disabled | 1048576 |

#### Step 1 — Create the sandbox

```bash
# Creates /tmp/compaction-bench-sandbox-${ARM} with:
#   - symlinks to ~/.pi/agent/* (auth, skills, extensions, themes, etc.)
#   - jq-patched models.json (only antigravity contextWindow changed; other providers like lmstudio preserved)
#   - own settings.json (compaction.enabled=false for A-disabled, enabled for all others)
#   - symlinks ~/.pi/agent/sessions so skill-cost discovers sessions natively
# Exports PI_CODING_AGENT_DIR and SANDBOX_DIR.
source scripts/compaction-bench/sandbox/create-sandbox.sh "$ARM" "$CONTEXT_WINDOW"
```

#### Step 2 — Create a worktree

```bash
BENCH_DIR="/tmp/compaction-bench-${ARM}-scenario-${SCENARIO}"
git worktree add "$BENCH_DIR" --detach HEAD
```

#### Step 3 — Split a pane and start pi

```bash
ARM_PANE=$(herdr pane split --current --direction right --ratio 0.45 --cwd "$BENCH_DIR" --no-focus \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['pane']['pane_id'])")

# Export the sandbox directory in the target pane's shell before starting the agent
herdr pane send-text "$ARM_PANE" "export PI_CODING_AGENT_DIR=\"$SANDBOX_DIR\"\n"
sleep 1

herdr agent start "${ARM}-s${SCENARIO}" --kind pi --pane "$ARM_PANE" --timeout 120000 \
  -- --model antigravity/gemini-3.8-flash:high
```

#### Step 4 — Verify the context window

```bash
# Read the bottom bar — must show the correct window size
sleep 5
herdr agent read "${ARM}-s${SCENARIO}" --source recent-unwrapped --lines 5 \
  | grep -oE '[0-9.]+%/[0-9]+k'
# Expected: "0.0%/100k" for A-100k, "0.0%/272k" for A-272k, etc.
```

If the window size is wrong, the sandbox models.json didn't take. Verify:
```bash
jq '.providers.antigravity.modelOverrides["gemini-3.8-flash"].contextWindow' "$SANDBOX_DIR/models.json"
```

#### Step 5 — Run the workload turn by turn

Set `MAX_TURNS` per scenario before entering the loop:

| Scenario | `MAX_TURNS` | Notes |
|---|---|---|
| 1 | 20 | Full bugfix workload |
| 2 | 30 | Full feature workload |
| 3 | varies | See Scenario 3 timing map |
| 4 | 25 | First 25 of 30-turn feature workload |
| 6 | 50 | Full endurance workload |

For each turn `T` from 1 to `MAX_TURNS` in the workload file:

```bash
# 5a. Read the turn prompt from the workload file
# NOTE: Uses python3 instead of `head -n -1` (illegal on macOS BSD coreutils)
# and handles the final turn correctly (no subsequent ## Turn header).
PROMPT=$(python3 -c "
import sys
with open('scripts/compaction-bench/workloads/${WORKLOAD}.md') as f:
    parts = f.read().split('## Turn ')
for p in parts[1:]:
    lines = p.strip().split('\\n')
    if lines[0].strip() == '${T}':
        print('\\n'.join(lines[1:]).strip())
        break
")

# 5b. Check if this turn needs an idle delay (scenario-specific)
case "$SCENARIO-$T" in
  1-6|1-11)  echo "[IDLE] Sleeping 420s to expire cache..."; sleep 420 ;;
  4-8|4-16)  echo "[IDLE] Sleeping 420s to expire cache..."; sleep 420 ;;
  *)         ;; # no delay
esac

# 5c. Send the prompt
herdr agent prompt "${ARM}-s${SCENARIO}" "$PROMPT" --wait --timeout 300000

# 5d. Scrape signals
PANE_OUTPUT=$(herdr agent read "${ARM}-s${SCENARIO}" --source recent-unwrapped --lines 80)

# 5e. Extract observables
CONTEXT_PCT=$(echo "$PANE_OUTPUT" | grep -oE '[0-9.]+%/[0-9]+k' | tail -1)
COMPACTION=$(echo "$PANE_OUTPUT" | grep -o 'Compacted from [0-9,]* tokens' | tail -1)
COMPACTION_COST=$(echo "$PANE_OUTPUT" | grep -oE '[0-9]+k tokens billed \(~\$[0-9.]+\)' | tail -1)
CACHE_MISS=$(echo "$PANE_OUTPUT" | grep -oE 'Cache miss after [0-9]+m[0-9]*s? idle: [0-9]+k tokens re-billed \(~\$[0-9.]+\)' | tail -1)

# Also handle the (?%/xxxk) post-compaction state
if echo "$PANE_OUTPUT" | grep -q '(?%/'; then
  CONTEXT_PCT="(?%/compacting)"
fi

# 5f. Get session JSONL path from agent metadata
SESSION_PATH=$(herdr agent get "${ARM}-s${SCENARIO}" 2>/dev/null \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['agent'].get('agent_session',{}).get('value',''))" 2>/dev/null)

# 5g. Extract per-turn usage from session JSONL (last message entry)
USAGE=$(python3 -c "
import json, sys
last_usage = None
with open('$SESSION_PATH') as f:
    for line in f:
        try:
            d = json.loads(line)
            u = d.get('message',{}).get('usage')
            if u: last_usage = u
        except: pass
if last_usage:
    print(json.dumps(last_usage))
else:
    print('{}')
" 2>/dev/null)

# 5h. Compute cumulative cost from skill-cost
# NOTE: cost.py --session matches against the session UUID, not a file path.
# Extract the UUID from the JSONL filename, and read grand_total_cost_usd (not total_cost).
SESSION_ID=$(basename "$SESSION_PATH" .jsonl | sed 's/.*_//')
CUMULATIVE=$(python3 ~/skill-cost/cost.py --session "$SESSION_ID" --json 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('grand_total_cost_usd', 0))" 2>/dev/null)

# 5i. Write the tick
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "{\"arm\":\"${ARM}\",\"scenario\":${SCENARIO},\"turn\":${T},\"timestamp\":\"${TIMESTAMP}\",\"context_pct\":\"${CONTEXT_PCT}\",\"compaction_event\":\"${COMPACTION}\",\"compaction_cost\":\"${COMPACTION_COST}\",\"cache_miss_event\":\"${CACHE_MISS}\",\"session_usage\":${USAGE:-{}},\"cumulative_cost\":${CUMULATIVE:-0}}" \
  >> "scripts/compaction-bench/data/runs/run-$(date +%Y-%m-%d)-${ARM}-scenario-${SCENARIO}.jsonl"

# 5j. Print live tick for the operator
echo "[TICK] Arm=${ARM} Scenario=${SCENARIO} Turn=${T}"
echo "  Context: ${CONTEXT_PCT}"
echo "  Compaction: ${COMPACTION:-none}"
echo "  Cache miss: ${CACHE_MISS:-none}"
echo "  Cumulative: \$${CUMULATIVE:-?}"
echo "  ──────────────────────────"
```

#### Step 6 — Post-run collection

```bash
# Copy the session JSONL for archiving
cp "$SESSION_PATH" "scripts/compaction-bench/data/sessions/session-${ARM}-s${SCENARIO}.jsonl"

# Extract session UUID for skill-cost query
SESSION_ID=$(basename "$SESSION_PATH" .jsonl | sed 's/.*_//')

# Run skill-cost for the authoritative total
python3 ~/skill-cost/cost.py --session "$SESSION_ID" --json \
  > "scripts/compaction-bench/data/summary/${ARM}-s${SCENARIO}-cost.json"

# Print summary
echo "=== ARM ${ARM} SCENARIO ${SCENARIO} COMPLETE ==="
python3 ~/skill-cost/cost.py --session "$SESSION_ID"
```

#### Step 7 — Archive and cleanup

```bash
# Archive the pane (don't close — it's evidence)
# Create archive tab if it doesn't exist
ARCHIVE_TAB=$(herdr tab list --workspace "$HERDR_WORKSPACE_ID" 2>/dev/null \
  | python3 -c "
import sys,json
tabs = json.load(sys.stdin).get('result',{}).get('tabs',[])
for t in tabs:
    if 'bench-archive' in t.get('label',''):
        print(t['tab_id']); break
else:
    print('NONE')
" 2>/dev/null)

if [ "$ARCHIVE_TAB" = "NONE" ]; then
  ARCHIVE_TAB=$(herdr tab create --label "bench-archive" --cwd "$PWD" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['tab']['tab_id'])")
fi

herdr pane move "$ARM_PANE" --tab "$ARCHIVE_TAB" --split down --no-focus

# Clean up worktree
git worktree remove "$BENCH_DIR" --force 2>/dev/null

# Clean up sandbox (production ~/.pi/agent was never touched)
rm -rf "$SANDBOX_DIR"
unset PI_CODING_AGENT_DIR SANDBOX_DIR
```

---

## Scenario-Specific Timing Maps

### Scenario 1: Cache-Cold Return
- Workload: `bugfix` (20 turns)
- **Turn 6:** `sleep 420` (7-min idle → cache expires)
- **Turn 11:** `sleep 420` (7-min idle → cache expires)
- All other turns: no delay

### Scenario 2: Always-Warm
- Workload: `feature` (30 turns)
- **No delays at all.** Every turn fires as soon as the previous completes.

### Scenario 3: Reasoning Token Inflation
- Workload: `refactor` (single task, repeated at 4 context sizes)
- This scenario is different: you don't vary `contextWindow`. You vary **how much context has accumulated** by running the agent for N turns first, then sending the measurement task.
  - Size 20k: fresh session, send the task immediately
  - Size 80k: send ~8 warm-up turns first, then the measurement task
  - Size 180k: send ~18 warm-up turns first
  - Size 272k: send ~28 warm-up turns first
- Run 3 repetitions per size. Record output token count (includes thinking tokens).

### Scenario 4: Compaction Curve (HEADLINE)
- Workload: `feature` (first 25 of 30 turns — set `MAX_TURNS=25`)
- **Turn 8:** `sleep 420`
- **Turn 16:** `sleep 420`
- All other turns: no delay

### Scenario 5: Code Quality
- Uses data from Scenarios 1, 2, 4 — not a separate run.
- Post-hoc analysis:
  - **5a:** Did the agent's final code pass the test suite? (check git log for test results)
  - **5b:** Count `read`, `grep`, `find` tool calls in the 3 turns after each compaction event
  - **5c:** Check if the planted instruction ("always use strict mode") was followed in the final output

### Scenario 6: 1M Endurance
- Workload: `endurance` (50 turns)
- Uses A-disabled arm ONLY
- **No delays.** Let the context grow unchecked.
- Record quality snapshots at turns 10, 20, 30, 40, 50

---

## Run Order (Recommended)

Start with the headline scenario to get the cost curve early. Then fill in the supporting data.

| Run | Arm | Scenario | Turns | Est. time (incl. idles) |
|---|---|---|---|---|
| 1 | A-50k | 4 | 25 | ~45 min |
| 2 | A-100k | 4 | 25 | ~45 min |
| 3 | A-150k | 4 | 25 | ~45 min |
| 4 | A-200k | 4 | 25 | ~45 min |
| 5 | A-272k | 4 | 25 | ~45 min |
| 6 | A-500k | 4 | 25 | ~45 min |
| 7 | A-1M | 4 | 25 | ~45 min |
| 8 | A-disabled | 4 | 25 | ~45 min |
| 9–16 | All arms | 1 | 20 | ~50 min each (incl. 2×7min idles) |
| 17–24 | All arms | 2 | 30 | ~30 min each |
| 25–28 | A-272k only | 3 | 4 sizes × 3 reps | ~2 hours |
| 29 | A-disabled | 6 | 50 | ~1.5 hours |

**Total estimated wall clock: ~24 hours** (spread across multiple days if needed).

Between arms: wait at least 10 minutes for cache to fully expire before starting the next arm. This ensures no cross-arm cache contamination.

---

## Success Criteria (per-arm)

An arm is complete when:

1. ✅ The tick JSONL has one entry per turn with non-null `session_usage`
2. ✅ The skill-cost JSON shows a non-zero total
3. ✅ The context meter was verified at turn 1 (correct window size)
4. ✅ The session JSONL is archived to `data/sessions/`
5. ✅ The pane is archived (not closed) to the bench-archive tab

---

## Post-Benchmark Analysis

After ALL arms for a scenario are complete:

```bash
# Compile the cost curve
npx tsx scripts/compaction-bench/analyze.ts

# Or manual inspection:
for f in scripts/compaction-bench/data/summary/*-cost.json; do
  ARM=$(basename "$f" | sed 's/-cost.json//')
  COST=$(python3 -c "import json; d=json.load(open('$f')); print(f'${ARM}: \${d.get(\"grand_total_cost_usd\",0):.4f}')")
  echo "$COST"
done
```

---

## If Something Goes Wrong

| Problem | Action |
|---|---|
| "Quota reached" mid-run | Pause. Note the turn number. Resume when tokens reset — pi sessions are resumable with `--continue` |
| Agent gets stuck / blocked | `herdr agent send-keys <name> ctrl+c`, then re-prompt |
| Wrong context window in TUI | Stop. Check `jq '.providers.antigravity' "$SANDBOX_DIR/models.json"`. Recreate the sandbox. |
| Compaction event shows `(?%/xxxk)` | Normal. Wait for the next turn — the percentage resolves after the model responds. |
| Pane is too narrow to read | `herdr pane resize $ARM_PANE --cols 100` or adjust ratio |
| models.json not taking effect | Verify `PI_CODING_AGENT_DIR=$SANDBOX_DIR` was exported in the pane before starting the agent. Close and re-start with the env var. |
