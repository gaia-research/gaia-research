#!/bin/bash
set -euo pipefail

# Context Compaction Phase 2 — Scenario 1 Runner Wrapper
# Sets complete environment required for herdr, pi, git, and python execution.

export HOME="/Users/marcotiongson"
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/Users/marcotiongson/.local/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HERDR_ENV=1
export HERDR_WORKSPACE_ID="w7"
export HERDR_TAB_ID="w7:t3"
export HERDR_SOCKET_PATH="/Users/marcotiongson/.config/herdr/herdr.sock"
export HERDR_BIN_PATH="/Users/marcotiongson/.local/bin/herdr"

cd /Users/marcotiongson/gaia-research

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting run-scenario1.sh..."
exec /opt/homebrew/bin/python3 scripts/compaction-bench/scenario1_orchestrator.py "$@"
