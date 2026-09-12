#!/usr/bin/env bash
# Create an isolated PI_CODING_AGENT_DIR sandbox for a benchmark arm.
#
# Usage:
#   source scripts/compaction-bench/sandbox/create-sandbox.sh <ARM> <CONTEXT_WINDOW>
#   # e.g.  source .../create-sandbox.sh A-100k 100000
#   # e.g.  source .../create-sandbox.sh A-disabled 1048576
#
# After sourcing, $SANDBOX_DIR and $PI_CODING_AGENT_DIR are set. The sandbox
# contains symlinks to every production file/directory *except*:
#   - models.json  → patched copy with the arm's contextWindow
#   - settings.json → patched copy (compaction disabled for A-disabled, enabled otherwise)
#
# sessions/ is symlinked to production ~/.pi/agent/sessions so skill-cost
# can discover benchmark sessions natively without collisions.
#
# The production ~/.pi/agent is NEVER written to.

if [ $# -lt 2 ]; then
  echo "Usage: source create-sandbox.sh <ARM> <CONTEXT_WINDOW>" >&2
  return 1 2>/dev/null || exit 1
fi

ARM="$1"
CONTEXT_WINDOW="$2"
PROD_DIR="${HOME}/.pi/agent"
SANDBOX_DIR="/tmp/compaction-bench-sandbox-${ARM}"

# -------------------------------------------------------------------
# 1. Clean slate
# -------------------------------------------------------------------
rm -rf "$SANDBOX_DIR"
mkdir -p "$SANDBOX_DIR"
mkdir -p "$PROD_DIR/sessions"

# -------------------------------------------------------------------
# 2. Symlink everything from production except models/settings
#    (sessions/ is symlinked so skill-cost discovers sessions natively)
# -------------------------------------------------------------------
for item in "$PROD_DIR"/*; do
  name=$(basename "$item")
  case "$name" in
    models.json|settings.json) ;;   # skip — we create our own
    *) ln -s "$item" "$SANDBOX_DIR/$name" ;;
  esac
done

# -------------------------------------------------------------------
# 3. Patch models.json with jq — only touch antigravity contextWindow
# -------------------------------------------------------------------
jq --argjson cw "$CONTEXT_WINDOW" '
  .providers.antigravity.modelOverrides["gemini-3.8-flash"].contextWindow = $cw
| .providers.antigravity.modelOverrides["gemini-3.7-flash"].contextWindow = $cw
| .providers["google-antigravity"].modelOverrides["gemini-3.8-flash"].contextWindow = $cw
| .providers["google-antigravity"].modelOverrides["gemini-3.7-flash"].contextWindow = $cw
' "$PROD_DIR/models.json" > "$SANDBOX_DIR/models.json"

# -------------------------------------------------------------------
# 4. Patch settings.json — disable compaction for A-disabled arm,
#    ensure enabled for all other arms
# -------------------------------------------------------------------
if [ "$ARM" = "A-disabled" ]; then
  jq '.compaction.enabled = false' "$PROD_DIR/settings.json" > "$SANDBOX_DIR/settings.json"
else
  jq '.compaction.enabled = true' "$PROD_DIR/settings.json" > "$SANDBOX_DIR/settings.json"
fi

# -------------------------------------------------------------------
# 5. Export for the caller
# -------------------------------------------------------------------
export PI_CODING_AGENT_DIR="$SANDBOX_DIR"
export SANDBOX_DIR

echo "[sandbox] Created: $SANDBOX_DIR"
echo "[sandbox] PI_CODING_AGENT_DIR=$PI_CODING_AGENT_DIR"
echo "[sandbox] contextWindow=$CONTEXT_WINDOW"
echo "[sandbox] compaction.enabled=$(jq '.compaction.enabled' "$SANDBOX_DIR/settings.json")"
echo "[sandbox] models.json providers preserved:"
jq -r '.providers | keys[]' "$SANDBOX_DIR/models.json" | sed 's/^/  - /'
