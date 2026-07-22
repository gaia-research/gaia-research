#!/usr/bin/env bash
# M2 "tool in action" demo — vanilla vs floor vs curated, driven by the
# skill-heaven bin, on a LIVE Claude Code. Produces the three deliverables the
# owner asked for:
#   1. vanilla (native) vs floor on the same repo: the firecrawl-crawl listing
#      drops YES -> NO, with a LIVE per-turn token delta.
#   2. curated re-admission of one real skill (impeccable) with its chars4 dose.
#   3. validator-clean hh-ledger/v1 records emitted (floor placebo + curated
#      heaven) — appended to the ledger-of-record as a separate reviewed step.
#
# METHOD (per RATIFICATION D12 / gate-a): the PROMPT/per-turn TOKEN count is the
# hard signal; the firecrawl-crawl YES/NO self-report is corroborating only
# (haiku under-reports). Tokens win where they disagree.
#
# Version discipline: the T9/T9b routes use the undocumented
# CLAUDE_CODE_DISABLE_BUNDLED_SKILLS knob — re-verify per CLI upgrade. This run
# records `claude --version` in every emitted record's harness.version.
#
# Usage:  bash demo-m2-floor-live.sh            (runs the probes; prints summary)
# Output: records + raw JSON under scripts/.hh-demo/ (gitignored). Appending to
#         the ledger is a deliberate follow-up (the script PRINTS the commands,
#         it does not mutate the ledger-of-record itself).
set -euo pipefail

command -v jq >/dev/null || { echo "need jq"; exit 2; }

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SH_DIR="${SKILL_HEAVEN_DIR:-$HOME/Documents/skill-heaven}"
SH_BIN="$SH_DIR/packages/core/bin/skill-heaven.mjs"
IMPECCABLE="$REPO_ROOT/.agents/skills/impeccable"
# Sonnet at low reasoning is the owner's preferred probe model: haiku
# under-reports its own skill listing (a self-report flake that falsified the
# 2026-07-21 gate-(a) pass). Override with MODEL=/EFFORT= if cost-constrained.
MODEL="${MODEL:-sonnet}"
EFFORT="${EFFORT:-low}"
OUT="$REPO_ROOT/scripts/.hh-demo"
mkdir -p "$OUT"

[ -f "$SH_BIN" ]     || { echo "skill-heaven bin not found: $SH_BIN (set SKILL_HEAVEN_DIR)"; exit 2; }
[ -d "$IMPECCABLE" ] || { echo "impeccable fixture not found: $IMPECCABLE"; exit 2; }

CLAUDE_VER="$(claude --version)"
# YES/NO works cleanly for the eviction direction (native=YES, floor=NO). For the
# re-admission direction haiku's YES/NO self-report flakes (it answered NO to a
# skill that IS loaded), so curated uses an ENUMERATION probe: the model lists
# available skills and returns "heaven-set:impeccable" — matched by /impeccable/.
# Tokens remain the hard signal per D12; the probe answer corroborates.
BQ_FC='Is a skill named exactly "firecrawl-crawl" listed in your available skills? Reply ONLY YES or NO.'
BQ_IMP='List the exact names of all skills currently available to you, one per line. If none, reply NONE.'

# perTurn (input+cache_creation+cache_read+output) straight off an emitted record.
per_turn() { jq -r '.tokens.perTurn' "$1"; }
endpoint() { jq -r '.objectiveEndpoint.pass' "$1"; }
result_of() { jq -r 'select(.tokens).notes? // empty' "$1" >/dev/null 2>&1; }  # noop guard

echo "### skill-heaven M2 live demo   |   $CLAUDE_VER   |   model: $MODEL"
echo "### repo: $REPO_ROOT"
echo "### skill-heaven: $SH_DIR"
echo

# --- 0. Show the tool composing each profile (FREE — no quota) ------------------
echo "== compiled profiles (skill-heaven --print; no quota) =="
node "$SH_BIN" --posture floor --harness claude --model "$MODEL" --effort "$EFFORT" -p "$BQ_FC" --print \
  | jq -c '{posture:"floor", command, argv, env}' | tee "$OUT/print-floor.json"
node "$SH_BIN" --posture curated --harness claude --skill "$IMPECCABLE" --model "$MODEL" -p "$BQ_IMP" --print \
  | jq -c '{posture:"curated", command, argv, env, dose:.doseSummary}' | tee "$OUT/print-curated.json"
echo

# --- 1. native (vanilla) — heaven arm, listing probe ----------------------------
echo "== [1/3] native (vanilla claude, no flags): firecrawl-crawl listing =="
node "$SH_BIN" --posture native --harness claude --model "$MODEL" --effort "$EFFORT" \
  -p "$BQ_FC" --record --benchmark-id hh-m2-smoke --task listing-probe-native \
  --arm heaven --endpoint-regex '^YES' --record-out "$OUT/rec-native.json" \
  >/dev/null 2>"$OUT/native.stderr" || { echo "native run failed"; cat "$OUT/native.stderr"; exit 1; }
T_NAT="$(per_turn "$OUT/rec-native.json")"
E_NAT="$(endpoint "$OUT/rec-native.json")"
echo "   perTurn=$T_NAT tok   firecrawl-crawl listed (regex ^YES pass)=$E_NAT"
echo

# --- 2. floor — placebo arm, the same listing probe -----------------------------
echo "== [2/3] floor (skill-heaven --posture floor): firecrawl-crawl listing =="
node "$SH_BIN" --posture floor --harness claude --model "$MODEL" --effort "$EFFORT" \
  -p "$BQ_FC" --record --benchmark-id hh-m2-smoke --task listing-probe \
  --arm placebo --endpoint-regex '^NO' --record-out "$OUT/rec-floor.json" \
  --note "M2 live demo re-verification on $CLAUDE_VER (T9b floor). perTurn is the hard signal; firecrawl-crawl YES->NO corroborates the listing drop." \
  >/dev/null 2>"$OUT/floor.stderr" || { echo "floor run failed"; cat "$OUT/floor.stderr"; exit 1; }
T_FLR="$(per_turn "$OUT/rec-floor.json")"
E_FLR="$(endpoint "$OUT/rec-floor.json")"
echo "   perTurn=$T_FLR tok   firecrawl-crawl dropped to NONE (regex ^NO pass)=$E_FLR"
echo

# --- 3. curated — re-admit one real skill (impeccable) --------------------------
echo "== [3/3] curated (skill-heaven --posture curated --skill impeccable) =="
node "$SH_BIN" --posture curated --harness claude --skill "$IMPECCABLE" --model "$MODEL" --effort "$EFFORT" \
  -p "$BQ_IMP" --record --benchmark-id hh-m2-smoke --task readmit-probe \
  --arm heaven --endpoint-regex 'impeccable' --record-out "$OUT/rec-curated.json" \
  --note "M2 live demo re-verification on $CLAUDE_VER (T9 curated route). Enumeration probe (YES/NO self-report flakes on haiku; tokens+enumeration are authoritative). Curated listing = heaven-set:impeccable ONLY; standing dose is the chars4 census number." \
  >/dev/null 2>"$OUT/curated.stderr" || { echo "curated run failed"; cat "$OUT/curated.stderr"; exit 1; }
T_CUR="$(per_turn "$OUT/rec-curated.json")"
E_CUR="$(endpoint "$OUT/rec-curated.json")"
DOSE_LINE="$(grep -o 'curated loadout dose.*' "$OUT/curated.stderr" || true)"
echo "   perTurn=$T_CUR tok   impeccable re-admitted (regex /impeccable/ pass)=$E_CUR"
echo "   $DOSE_LINE"
echo

# --- summary --------------------------------------------------------------------
DELTA=$(( T_NAT - T_FLR ))
echo "==================== SUMMARY ($CLAUDE_VER, model $MODEL) ===================="
printf '  native (vanilla) perTurn : %8s tok   firecrawl-crawl listed = %s\n' "$T_NAT" "$E_NAT"
printf '  floor            perTurn : %8s tok   firecrawl-crawl = NONE  = %s\n' "$T_FLR" "$E_FLR"
printf '  curated(impecc.) perTurn : %8s tok   impeccable listed      = %s\n' "$T_CUR" "$E_CUR"
printf '  LIVE per-turn delta (native - floor) : %s tok saved by the floor\n' "$DELTA"
echo
echo "Records written (validator-clean by construction — record.ts calls validateRecord):"
ls -1 "$OUT"/rec-*.json
echo
echo "To append the floor placebo + curated heaven pair to the ledger-of-record and validate:"
echo "  npx tsx scripts/hell-heaven-bench/ledger.ts append --record \"\$(cat $OUT/rec-floor.json)\""
echo "  npx tsx scripts/hell-heaven-bench/ledger.ts append --record \"\$(cat $OUT/rec-curated.json)\""
echo "  npx tsx scripts/hell-heaven-bench/ledger.ts validate"
