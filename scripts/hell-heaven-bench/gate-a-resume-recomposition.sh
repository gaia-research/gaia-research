#!/usr/bin/env bash
# WS3 gate (a) — DETERMINISTIC repro of the in-session posture-slider findings in
# docs/labs/harness-capability-matrix.md ("gate (a)"). Re-run on EVERY Claude Code
# upgrade: the T9 env knob (CLAUDE_CODE_DISABLE_BUNDLED_SKILLS) is undocumented and
# version-pinned. Verified on 2.1.216 (2026-07-22).
#
# METHOD — do NOT trust "list your skills" self-reports (haiku under-reports; that
# falsified the 2026-07-21 pass). Ground truth is the PROMPT-TOKEN COUNT from
# `--output-format json` (usage.input + cache_creation + cache_read). A single
# user-scope skill's YES/NO survival is reported as a corroborating (soft) signal.
#
# Core finding this asserts: on a CONTINUED session, neither `--resume` nor
# `--resume --fork-session` recomposes the *subtractive* (curated/floor) profile —
# they land well above the fresh clean-room floor. Subtractive recomposition and
# history survival are mutually exclusive; the floor is launcher-locked.
#
# Expected (2.1.216):
#   POLE native   ~25.2k tok   POLE floor (T9 fresh) ~17.0k tok
#   GA-1 resume + curated  ~19.2k tok  (>> floor  -> NEGATIVE: not recomposed)
#   GA-2 fork   + curated  ~19.2k tok  (>> floor  -> NEGATIVE: fork == resume on composition)
#   GA-3 fork history / GA-3b resume history -> codeword recalled (history carries both ways)
set -euo pipefail

command -v jq >/dev/null || { echo "need jq"; exit 2; }
command -v uuidgen >/dev/null || { echo "need uuidgen"; exit 2; }

# User-scope probe skill (survival is a SOFT/corroborating signal — tokens are the
# hard gate). haiku self-reports some skills unreliably, so prefer a known-stable
# one (firecrawl-crawl), else fall back to the first user skill dir.
PROBE_SKILL=""
if [ -d "$HOME/.claude/skills/firecrawl-crawl" ]; then
  PROBE_SKILL="firecrawl-crawl"
else
  PROBE_SKILL="$(find "$HOME/.claude/skills" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; 2>/dev/null | sort | head -1 || true)"
fi
[ -z "$PROBE_SKILL" ] && { echo "SKIP: no user-scope skill in ~/.claude/skills to probe with"; exit 0; }

WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
HS="$WORK/heaven-set"; PROJ="$WORK/proj"
mkdir -p "$HS/.claude-plugin" "$HS/skills/gate-a-probe" "$PROJ"
cat > "$HS/.claude-plugin/plugin.json" <<'JSON'
{ "name": "heaven-set", "description": "curated clean-room set (gate-a probe)", "version": "0.0.0" }
JSON
cat > "$HS/skills/gate-a-probe/SKILL.md" <<'MD'
---
name: gate-a-probe
description: Marker skill for Skill Heaven WS3 gate (a). Never invoked.
version: 0.0.0
---
Marker.
MD

CURATED=(--setting-sources project --strict-mcp-config --mcp-config '{"mcpServers":{}}' --plugin-dir "$HS")
cd "$PROJ"

BQ="Is a skill named exactly \"$PROBE_SKILL\" listed in your available skills? Reply ONLY YES or NO."
JQ_TOKS='if type=="array" then .[-1] else . end | .usage | (.input_tokens + .cache_creation_input_tokens + .cache_read_input_tokens)'
JQ_RES='if type=="array" then .[-1] else . end | .result'
# claude --output-format json can emit raw (unescaped) control chars inside the
# .result string when haiku answers multi-line; strip 0x00-0x1F so jq can parse
# (structural JSON whitespace is optional, so this is lossless for our fields).
scrub() { tr -d '\000-\037'; }

# probe <env-prefixed argv...> -> prints "TOKENS<TAB>YES|NO"
probe() {
  local out; out=$("$@" --output-format json 2>/dev/null <<<"$BQ" | scrub)
  printf '%s\t%s\n' "$(jq -r "$JQ_TOKS" <<<"$out")" "$(jq -r "$JQ_RES" <<<"$out" | tr -dc 'A-Za-z')"
}

echo "### claude $(claude --version)  |  user-scope probe skill: $PROBE_SKILL"

IFS=$'\t' read -r T_NAT R_NAT < <(probe claude -p --model haiku)
IFS=$'\t' read -r T_FLR R_FLR < <(CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 probe claude -p --model haiku "${CURATED[@]}")

# Composition (token) probes — resume a vanilla-seeded session with the curated argv.
CSID=$(uuidgen)
echo "seed. reply OK." | claude -p --model haiku --session-id "$CSID" >/dev/null 2>&1
IFS=$'\t' read -r T_RES R_RES < <(CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 probe claude -p --model haiku --resume "$CSID" "${CURATED[@]}")
IFS=$'\t' read -r T_FRK R_FRK < <(CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 probe claude -p --model haiku --resume "$CSID" --fork-session "${CURATED[@]}")

# History probes — use a PRISTINE dedicated seed (decoupled from the composition
# session above, which repeated resumes/forks can churn into a transient NONE).
HSID=$(uuidgen)
echo "The secret codeword is ZEPHYR-7. Reply OK." | claude -p --model haiku --session-id "$HSID" >/dev/null 2>&1
HQ='What was the secret codeword? Reply with ONLY the codeword, or NONE.'
CW_FRK=$(echo "$HQ" | CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 claude -p --model haiku --resume "$HSID" --fork-session "${CURATED[@]}" --output-format json 2>/dev/null | scrub | jq -r "$JQ_RES")
CW_RES=$(echo "$HQ" | claude -p --model haiku --resume "$HSID" --output-format json 2>/dev/null | scrub | jq -r "$JQ_RES")

printf 'POLE native            : %6s tok   %s=%s\n' "$T_NAT" "$PROBE_SKILL" "$R_NAT"
printf 'POLE floor (T9 fresh)  : %6s tok   %s=%s\n' "$T_FLR" "$PROBE_SKILL" "$R_FLR"
printf 'GA-1  resume + curated : %6s tok   %s=%s\n' "$T_RES" "$PROBE_SKILL" "$R_RES"
printf 'GA-2  fork   + curated : %6s tok   %s=%s\n' "$T_FRK" "$PROBE_SKILL" "$R_FRK"
printf 'GA-3  fork history     : %s\n' "$CW_FRK"
printf 'GA-3b resume history   : %s\n' "$CW_RES"

# --- Hard assertions (token-based; deterministic, immune to self-report flake) ---
MARGIN=1000   # a continued session that truly recomposed would sit at ~floor
fail=0
[ "$T_FLR" -lt "$T_NAT" ]                 || { echo "ASSERT FAIL: T9 floor not < native (curated route broken on this version?)"; fail=1; }
[ $((T_RES - T_FLR)) -ge "$MARGIN" ]      || { echo "ASSERT FAIL: plain resume reached the floor — matrix says it does NOT recompose subtractively"; fail=1; }
[ $((T_FRK - T_FLR)) -ge "$MARGIN" ]      || { echo "ASSERT FAIL: fork reached the floor — matrix says --fork-session does NOT recompose subtractively"; fail=1; }
case "$CW_FRK" in *ZEPHYR-7*) : ;; *) echo "ASSERT FAIL: fork lost conversation history";  fail=1;; esac
case "$CW_RES" in *ZEPHYR-7*) : ;; *) echo "ASSERT FAIL: resume lost conversation history"; fail=1;; esac

# Soft corroboration: user-scope skill should survive resume/fork (a lone NO is a
# known haiku self-report flake — warn, don't fail).
[ "$R_FLR" = "NO" ]  || echo "WARN: floor did not self-report evicting $PROBE_SKILL (tokens are authoritative)"
[ "$R_RES" = "YES" ] || echo "WARN: resume self-reported $PROBE_SKILL=$R_RES (expected YES; likely a haiku self-report flake — re-run to confirm)"
[ "$R_FRK" = "YES" ] || echo "WARN: fork self-reported $PROBE_SKILL=$R_FRK (expected YES; likely a haiku self-report flake — re-run to confirm)"

if [ "$fail" = 0 ]; then
  echo "PASS: gate (a) NEGATIVE-for-subtractive confirmed — resume & fork stay >=${MARGIN} tok above the floor; history carries both ways."
fi
exit "$fail"
