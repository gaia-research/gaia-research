#!/usr/bin/env bash
# KC9 — the complete three-minute demo, on a LIVE Claude Code.
#
#   native  ->  measured bloat  ->  curated launch  ->  successful task
#
# ONE task, asked THREE ways. The prompt is byte-identical across all three
# arms; the loadout is the only variable, and the objective endpoint is the
# SAME regex for all three (it is the *task*, not a per-arm goalpost). That is
# the whole design: if the endpoint moved per arm, "curated succeeds" would be
# a definition rather than a result.
#
# THE TASK. A teammate proposes `.card { border-left: 4px solid var(--accent) }`.
# Name the anti-pattern an available skill refuses it as. The answer term
# ("side-stripe borders") is a coinage of ONE skill — this repo's
# .agents/skills/impeccable, first entry under its "Absolute bans". It is not
# a term a model produces by chance, and it is deliberately NOT in the prompt,
# so an arm that answers it has actually read the contract it came from.
#
# WHY THIS DEMOS. On this workstation `impeccable` is not installed under
# ~/.claude/skills (verified: 67 skills there, impeccable is not one of them) —
# it lives only in this repo's .agents/skills/. So:
#   * native  pays for 67 standing skill listings and STILL cannot do the task,
#     because the one skill that knows the answer is not among them;
#   * floor   pays for none, and also cannot do the task — a *verified negative*,
#     recorded with the same rigor as a positive (B4);
#   * curated pays for exactly one skill listing, reads that one contract, and
#     completes the task.
# The bloat is not rhetoric: it is (native perTurn - floor perTurn), measured
# live, and on this task it buys nothing.
#
# METHOD (per RATIFICATION D12 / gate-a): the per-turn TOKEN count is the hard
# signal. The model's own reply text is the objective endpoint here (a coined
# term either appears or it does not), not a self-report about its own listing.
#
# Version discipline: the floor/curated routes use the undocumented
# CLAUDE_CODE_DISABLE_BUNDLED_SKILLS knob — re-verify per CLI upgrade. This run
# records `claude --version` in every emitted record's harness.version.
#
# F7 (+515 tok, the product floor's door cost) is LOCKED by founder ruling and
# is NOT touched, re-derived, or implied by anything this script measures.
# Cursor is DEFERRED (no availability): there is no cursor arm, here or anywhere.
#
# Usage:  bash demo-kc9-live.sh          (runs the three arms; prints summary)
# Output: records + raw JSON + the kc9-demo-transcript/v1 JSONL under
#         scripts/.hh-demo/ (gitignored). Appending to the ledger-of-record is a
#         deliberate follow-up: the script PRINTS the commands, it never mutates
#         the ledger itself.
set -euo pipefail

command -v jq >/dev/null || { echo "need jq"; exit 2; }

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SH_DIR="${SKILL_HEAVEN_DIR:-$HOME/Documents/skill-heaven}"
SH_BIN="$SH_DIR/packages/core/bin/skill-heaven.mjs"
IMPECCABLE="$REPO_ROOT/.agents/skills/impeccable"
# Sonnet at low reasoning is the owner's preferred probe model (haiku
# under-reports; see demo-m2-floor-live.sh). Override with MODEL=/EFFORT=.
MODEL="${MODEL:-sonnet}"
EFFORT="${EFFORT:-low}"
OUT="$REPO_ROOT/scripts/.hh-demo"
TRANSCRIPT="$OUT/kc9-transcript.jsonl"
mkdir -p "$OUT"
: > "$TRANSCRIPT"

[ -f "$SH_BIN" ]     || { echo "skill-heaven bin not found: $SH_BIN (set SKILL_HEAVEN_DIR)"; exit 2; }
[ -d "$IMPECCABLE" ] || { echo "impeccable fixture not found: $IMPECCABLE"; exit 2; }

CLAUDE_VER="$(claude --version)"
BENCH_ID="hh-kc9-demo"

# The one prompt. Identical bytes for every arm. The answer term is NOT in it.
read -r -d '' TASK <<'PROMPT' || true
A teammate proposes this CSS for a card component: `.card { border-left: 4px solid var(--accent); }`. Does any skill currently available to you explicitly name this as an anti-pattern you must refuse and rewrite? Consult your available skills; do not search the web and do not read this project's files. Reply with EXACTLY one line and nothing else: `FLAGGED: <the exact term that skill uses for this anti-pattern>` if an available skill names it, or `NONE` if no available skill names it.
PROMPT

# The one endpoint. Identical for every arm — it is the task, not a goalpost.
ENDPOINT='^FLAGGED:.*[Ss]ide-[Ss]tripe'

per_turn()  { jq -r '.tokens.perTurn'          "$1"; }
standing()  { jq -r '.tokens.skillStanding'    "$1"; }
endpoint()  { jq -r '.objectiveEndpoint.pass'  "$1"; }
wallclock() { jq -r '.wallClockMs'             "$1"; }

# One kc9-demo-transcript/v1 line per beat. A strict superset of what the
# rec-*.json files carry, sequenced so the replay page can step through it.
emit_beat() {
  local beat="$1" label="$2" posture="$3" arm="$4" committed="$5" rec="$6" stderr_f="$7" print_f="$8"
  local reply dose
  reply="$(sed -n 's/^\[skill-heaven\] result: //p' "$stderr_f" | head -1)"
  dose="$(sed -n 's/^\[skill-heaven\] curated loadout dose (chars4): //p' "$stderr_f" | head -1)"
  jq -n \
    --argjson beat "$beat" --arg label "$label" --arg posture "$posture" --arg arm "$arm" \
    --argjson committed "$committed" --arg reply "$reply" --arg dose "$dose" \
    --arg endpoint "$ENDPOINT" --arg task "$TASK" \
    --slurpfile rec "$rec" --slurpfile printed "$print_f" \
    '{
      schema: "kc9-demo-transcript/v1",
      beat: $beat, label: $label, posture: $posture, arm: $arm, committed: $committed,
      recordedAt: $rec[0].recordedAt,
      benchmarkId: $rec[0].benchmarkId, taskId: $rec[0].task,
      prompt: $task,
      command: ($printed[0].command + " " + ($printed[0].argv | map(select(. != $task)) | join(" "))),
      env: $printed[0].env,
      model: $rec[0].model, harness: $rec[0].harness,
      skillsLoaded: $rec[0].skillsLoaded,
      tokens: $rec[0].tokens,
      wallClockMs: $rec[0].wallClockMs,
      reply: $reply,
      doseSummary: (if $dose == "" then null else $dose end),
      objectiveEndpoint: { kind: "regex-match", regex: $endpoint, pass: $rec[0].objectiveEndpoint.pass }
    }' >> "$TRANSCRIPT"
}

echo "### KC9 three-minute demo   |   $CLAUDE_VER   |   model: $MODEL (effort $EFFORT)"
echo "### repo: $REPO_ROOT"
echo "### skill-heaven: $SH_DIR"
echo "### one task, three loadouts, ONE endpoint: /$ENDPOINT/"
echo

# --- 0. Show the tool composing each profile (FREE — no quota) ------------------
echo "== compiled profiles (skill-heaven --print; no quota spent) =="
node "$SH_BIN" --posture native  --harness claude --model "$MODEL" --effort "$EFFORT" -p "$TASK" --print \
  > "$OUT/print-native.json"
node "$SH_BIN" --posture floor   --harness claude --model "$MODEL" --effort "$EFFORT" -p "$TASK" --print \
  > "$OUT/print-floor.json"
node "$SH_BIN" --posture curated --harness claude --skill "$IMPECCABLE" --model "$MODEL" --effort "$EFFORT" -p "$TASK" --print \
  > "$OUT/print-curated.json"
for f in native floor curated; do
  jq -c --arg p "$f" --arg t "$TASK" '{posture:$p, command, argv:(.argv|map(select(. != $t))), env, dose:.doseSummary}' "$OUT/print-$f.json"
done
echo

# --- 1. native — the bloat pole. 67 standing listings, none of them the one -----
echo "== [1/3] NATIVE (vanilla claude, no flags) =="
node "$SH_BIN" --posture native --harness claude --model "$MODEL" --effort "$EFFORT" \
  -p "$TASK" --record --benchmark-id "$BENCH_ID" --task side-stripe-review \
  --arm heaven --endpoint-regex "$ENDPOINT" --record-out "$OUT/rec-native.json" \
  --note "KC9 demo, NATIVE pole on $CLAUDE_VER. NOT appended to the ledger: hh-ledger/v1 has no native arm and arm:heaven with an empty loadout would misrepresent the vanilla pole (the m2-live-demo.md / claim-index C3 precedent). Uncommitted workstation context." \
  >/dev/null 2>"$OUT/native.stderr" || { echo "native run failed"; cat "$OUT/native.stderr"; exit 1; }
T_NAT="$(per_turn "$OUT/rec-native.json")"; E_NAT="$(endpoint "$OUT/rec-native.json")"; W_NAT="$(wallclock "$OUT/rec-native.json")"
R_NAT="$(sed -n 's/^\[skill-heaven\] result: //p' "$OUT/native.stderr" | head -1)"
printf '   perTurn=%s tok  %sms   reply: %s   task solved=%s\n' "$T_NAT" "$W_NAT" "$R_NAT" "$E_NAT"
emit_beat 1 native native heaven false "$OUT/rec-native.json" "$OUT/native.stderr" "$OUT/print-native.json"
echo

# --- 2. floor — the placebo-of-record. The measured bloat is native minus this --
echo "== [2/3] FLOOR (skill-heaven --posture floor) — the own-placebo anchor =="
node "$SH_BIN" --posture floor --harness claude --model "$MODEL" --effort "$EFFORT" \
  -p "$TASK" --record --benchmark-id "$BENCH_ID" --task side-stripe-review \
  --arm placebo --endpoint-regex "$ENDPOINT" --record-out "$OUT/rec-floor.json" \
  --note "KC9 demo, doorless benchmark floor on $CLAUDE_VER (own-placebo anchor, B2). Same prompt and same endpoint as the other two arms. pass:false is a VERIFIED NEGATIVE (B4): with zero skills loaded the model cannot name a term it has never been shown, and says so." \
  >/dev/null 2>"$OUT/floor.stderr" || { echo "floor run failed"; cat "$OUT/floor.stderr"; exit 1; }
T_FLR="$(per_turn "$OUT/rec-floor.json")"; E_FLR="$(endpoint "$OUT/rec-floor.json")"; W_FLR="$(wallclock "$OUT/rec-floor.json")"
R_FLR="$(sed -n 's/^\[skill-heaven\] result: //p' "$OUT/floor.stderr" | head -1)"
printf '   perTurn=%s tok  %sms   reply: %s   task solved=%s\n' "$T_FLR" "$W_FLR" "$R_FLR" "$E_FLR"
printf '   >> MEASURED BLOAT (native - floor) = %s tok of standing dose, live, on this workstation\n' "$(( T_NAT - T_FLR ))"
emit_beat 2 floor floor placebo true "$OUT/rec-floor.json" "$OUT/floor.stderr" "$OUT/print-floor.json"
echo

# --- 3. curated — one skill admitted on purpose; the task completes -------------
echo "== [3/3] CURATED (skill-heaven --posture curated --skill impeccable) =="
node "$SH_BIN" --posture curated --harness claude --skill "$IMPECCABLE" --model "$MODEL" --effort "$EFFORT" \
  -p "$TASK" --record --benchmark-id "$BENCH_ID" --task side-stripe-review \
  --arm heaven --endpoint-regex "$ENDPOINT" --record-out "$OUT/rec-curated.json" \
  --note "KC9 demo, curated loadout = exactly one skill (impeccable) on $CLAUDE_VER. Same prompt and same endpoint as the other two arms. perTurn here includes the skill body actually being read during the run, so it is NOT a standing-dose figure and must not be differenced against the floor as if it were; skillStanding (chars4) prices the listing separately (B1)." \
  >/dev/null 2>"$OUT/curated.stderr" || { echo "curated run failed"; cat "$OUT/curated.stderr"; exit 1; }
T_CUR="$(per_turn "$OUT/rec-curated.json")"; E_CUR="$(endpoint "$OUT/rec-curated.json")"; W_CUR="$(wallclock "$OUT/rec-curated.json")"
S_CUR="$(standing "$OUT/rec-curated.json")"
R_CUR="$(sed -n 's/^\[skill-heaven\] result: //p' "$OUT/curated.stderr" | head -1)"
DOSE_LINE="$(sed -n 's/^\[skill-heaven\] //p' "$OUT/curated.stderr" | grep '^curated loadout dose' || true)"
printf '   perTurn=%s tok  %sms   reply: %s   task solved=%s\n' "$T_CUR" "$W_CUR" "$R_CUR" "$E_CUR"
printf '   %s\n' "$DOSE_LINE"
emit_beat 3 curated curated heaven true "$OUT/rec-curated.json" "$OUT/curated.stderr" "$OUT/print-curated.json"
echo

# --- summary --------------------------------------------------------------------
# ONLY the floor placebo + curated heaven records are ledger candidates. The
# native pole and the native-floor delta are NOT committed — they live in the
# gitignored scripts/.hh-demo/ only, and print with a ‡ marker so any writeup
# drafted from this output inherits "uncommitted context" instead of laundering
# them into "committed evidence" (enforced by check-claims.ts).
echo "==================== SUMMARY ($CLAUDE_VER, model $MODEL) ===================="
printf '  %-28s %8s tok  %6sms  solved=%-5s  %s\n' "native (vanilla)"        "$T_NAT ‡" "$W_NAT" "$E_NAT" "‡ uncommitted pole"
printf '  %-28s %8s tok  %6sms  solved=%-5s  %s\n' "floor (placebo)"         "$T_FLR"   "$W_FLR" "$E_FLR" "committed (verified negative)"
printf '  %-28s %8s tok  %6sms  solved=%-5s  %s\n' "curated (impeccable)"    "$T_CUR"   "$W_CUR" "$E_CUR" "committed (task solved)"
echo
printf '  measured bloat  (native - floor) : %s tok ‡  — standing dose that bought nothing on this task\n' "$(( T_NAT - T_FLR ))"
printf '  curated standing dose (chars4)   : %s tok    — one skill listing, committed on the curated record\n' "$S_CUR"
echo "  ‡ = uncommitted workstation context (gitignored .hh-demo/), NOT a ledger record."
echo "  NOTE: curated perTurn includes reading the skill body during the run; it is not a"
echo "        standing-dose figure and is not differenced against the floor as if it were."
echo
echo "Transcript (kc9-demo-transcript/v1, $(wc -l < "$TRANSCRIPT" | tr -d ' ') beats): $TRANSCRIPT"
echo "Render the shareable replay page:"
echo "  node scripts/hell-heaven-bench/render-kc9-replay.mjs $TRANSCRIPT \\"
echo "       content/reports/hh-benchmark/data/kc9-demo-replay.html"
echo
echo "Records written (validator-clean by construction — record.ts calls validateRecord):"
ls -1 "$OUT"/rec-*.json
echo
echo "To append the floor placebo + curated heaven pair to the ledger-of-record and validate:"
echo "  npx tsx scripts/hell-heaven-bench/ledger.ts append --record \"\$(cat $OUT/rec-floor.json)\""
echo "  npx tsx scripts/hell-heaven-bench/ledger.ts append --record \"\$(cat $OUT/rec-curated.json)\""
echo "  npx tsx scripts/hell-heaven-bench/ledger.ts validate"
