#!/bin/bash
set -euo pipefail

# Scenario 3 Auto-Replenishment Resume Script
export HOME="/Users/marcotiongson"
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/Users/marcotiongson/.local/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HERDR_ENV=1
export HERDR_WORKSPACE_ID="w7"
export HERDR_TAB_ID="w7:t3"
export HERDR_SOCKET_PATH="/Users/marcotiongson/.config/herdr/herdr.sock"
export HERDR_BIN_PATH="/Users/marcotiongson/.local/bin/herdr"

cd /Users/marcotiongson/gaia-research

LOG_FILE="/Users/marcotiongson/gaia-research/scripts/compaction-bench/cron.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Replenishment cron triggered. Resuming Scenario 3 remaining runs..." >> "$LOG_FILE" 2>&1
/opt/homebrew/bin/python3 scripts/compaction-bench/runner.py --scenario 3 --auto-remaining >> "$LOG_FILE" 2>&1
