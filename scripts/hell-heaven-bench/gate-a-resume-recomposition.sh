#!/usr/bin/env bash
# WS3 gate (a) — does `claude --resume` compose a NEW --plugin-dir/--setting-sources
# profile at boot? Re-run on every Claude Code upgrade (the T9 env knob is undocumented
# and version-pinned). Findings recorded in docs/labs/harness-capability-matrix.md
# ("WS3 verification gates — gate (a)"). Verified on 2.1.216 (2026-07-21).
#
# Expected (2.1.216):
#   GA-C2 curated FRESH        -> heaven-set:gate-a-probe ONLY   (T9 route, zero residual)
#   GA-1  plain --resume       -> vanilla listing + gate-a-probe (ADDITIVE ONLY — no recompose)
#   GA-2  --resume --fork-session -> heaven-set:gate-a-probe ONLY (recomposes, == fresh)
#   GA-3  fork + history probe  -> recalls the codeword           (history carried forward)
set -euo pipefail

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
HS="$WORK/heaven-set"; PROJ="$WORK/proj"
mkdir -p "$HS/.claude-plugin" "$HS/skills/gate-a-probe" "$PROJ"

cat > "$HS/.claude-plugin/plugin.json" <<'JSON'
{ "name": "heaven-set", "description": "Session-scoped curated skill set (Skill Heaven gate-a probe)", "version": "0.0.0" }
JSON
cat > "$HS/skills/gate-a-probe/SKILL.md" <<'MD'
---
name: gate-a-probe
description: Distinctive marker skill used only to detect whether a curated --plugin-dir profile composed into a session. Never actually invoked.
version: 0.0.0
---
Marker skill for Skill Heaven WS3 gate (a).
MD

Q='Look at the list of available skills/slash-commands in your context. Reply with ONLY a comma-separated list of their names, or NONE if no skills are listed.'
CURATED=(--setting-sources project --strict-mcp-config --mcp-config '{"mcpServers":{}}' --plugin-dir "$HS")
cd "$PROJ"

echo "### claude $(claude --version)"
echo "### GA0 env-knob probe:"
strings "$(readlink -f "$(command -v claude)")" 2>/dev/null | grep -o 'CLAUDE_CODE_DISABLE_BUNDLED_SKILLS' | head -1 || echo "  KNOB MISSING — T9 route broken on this version"

echo "### GA-C2 curated FRESH (expect: heaven-set:gate-a-probe only):"
echo "$Q" | CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 claude -p --model haiku "${CURATED[@]}"

SID=$(uuidgen)
echo "The secret codeword for this conversation is ZEPHYR-7. Reply OK." | claude -p --model haiku --session-id "$SID" >/dev/null
echo "### GA-1 plain --resume + curated (expect: vanilla listing + gate-a-probe):"
echo "$Q" | CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 claude -p --model haiku --resume "$SID" "${CURATED[@]}"
echo "### GA-2 --resume --fork-session + curated (expect: heaven-set:gate-a-probe only):"
echo "$Q" | CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 claude -p --model haiku --resume "$SID" --fork-session "${CURATED[@]}"
echo "### GA-3 fork history probe (expect: ZEPHYR-7):"
echo "What was the secret codeword? Reply with ONLY the codeword, or NONE." | CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 claude -p --model haiku --resume "$SID" --fork-session "${CURATED[@]}"
