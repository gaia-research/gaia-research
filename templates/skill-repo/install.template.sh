#!/usr/bin/env bash
#
# install.sh — one-liner installer for {{skill_display_name}}
#
# Usage:
#   bash <(curl -fsSL https://raw.githubusercontent.com/gaia-research/{{repo_slug}}/main/install.sh)

set -euo pipefail

REPO="gaia-research/{{repo_slug}}"
RAW="https://raw.githubusercontent.com/${REPO}/main"
SKILL_NAME="{{skill_name}}"
INVOKE_TRIGGER="{{invoke_trigger}}"

FILES=({{files_to_fetch}})

# ---------------------------------------------------------------------------
# Colors (auto-disabled when stdout is not a TTY)
# ---------------------------------------------------------------------------
if [ -t 1 ]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; GREEN=$'\033[32m'
  YELLOW=$'\033[33m'; BLUE=$'\033[34m'; RESET=$'\033[0m'
else
  BOLD=''; DIM=''; GREEN=''; YELLOW=''; BLUE=''; RESET=''
fi

say()  { printf '%s\n' "$*"; }
info() { printf '%s→%s %s\n' "$BLUE"   "$RESET" "$*"; }
ok()   { printf '%s✓%s %s\n' "$GREEN"  "$RESET" "$*"; }
warn() { printf '%s!%s %s\n' "$YELLOW" "$RESET" "$*"; }

# ---------------------------------------------------------------------------
# Locate skills directory
# ---------------------------------------------------------------------------
CANDIDATES=()
[ -d ".claude/skills"        ] && CANDIDATES+=(".claude/skills")
[ -d ".agents/skills"        ] && CANDIDATES+=(".agents/skills")
[ -d ".codex/skills"         ] && CANDIDATES+=(".codex/skills")
[ -d ".cursor/skills"        ] && CANDIDATES+=(".cursor/skills")
[ -d "$HOME/.claude/skills"  ] && CANDIDATES+=("$HOME/.claude/skills")
[ -d "$HOME/.agents/skills"  ] && CANDIDATES+=("$HOME/.agents/skills")

TARGET_DIR=""
if [ "${#CANDIDATES[@]}" -eq 0 ]; then
  info "No skills directory found — creating ${BOLD}.agents/skills${RESET}"
  mkdir -p ".agents/skills"
  TARGET_DIR=".agents/skills"
elif [ "${#CANDIDATES[@]}" -eq 1 ]; then
  TARGET_DIR="${CANDIDATES[0]}"
  info "Detected: ${BOLD}${TARGET_DIR}${RESET}"
else
  say ""
  say "${BOLD}Multiple skills directories found:${RESET}"
  i=1
  for c in "${CANDIDATES[@]}"; do
    printf "  ${BOLD}%d)${RESET} %s\n" "$i" "$c"
    i=$((i + 1))
  done
  say ""
  printf "Select [1-${#CANDIDATES[@]}]: "
  read -r choice
  if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt "${#CANDIDATES[@]}" ]; then
    warn "Invalid selection. Aborting."
    exit 1
  fi
  TARGET_DIR="${CANDIDATES[$((choice - 1))]}"
fi

INSTALL_DIR="${TARGET_DIR}/${SKILL_NAME}"

# ---------------------------------------------------------------------------
# Overwrite confirmation
# ---------------------------------------------------------------------------
if [ -d "$INSTALL_DIR" ]; then
  warn "${BOLD}${INSTALL_DIR}${RESET} already exists."
  printf "Overwrite? [y/N]: "
  read -r reply
  case "$reply" in
    y|Y|yes|YES) rm -rf "$INSTALL_DIR" ;;
    *) info "Aborted."; exit 0 ;;
  esac
fi

mkdir -p "$INSTALL_DIR"

# ---------------------------------------------------------------------------
# Fetch files
# ---------------------------------------------------------------------------
for f in "${FILES[@]}"; do
  info "Fetching ${f}..."
  curl -fsSL "${RAW}/${f}" -o "${INSTALL_DIR}/$(basename "$f")"
done
find "$INSTALL_DIR" -maxdepth 1 -name '*.py' -o -name '*.sh' | xargs -r chmod +x

ok "Installed to ${BOLD}${INSTALL_DIR}${RESET}"

# ---------------------------------------------------------------------------
# Requirements check
# ---------------------------------------------------------------------------
say ""
say "${BOLD}Requirements check${RESET}"

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    ok "gh CLI installed and authenticated"
  else
    warn "gh CLI found but not authenticated — run: ${BOLD}gh auth login${RESET}"
  fi
else
  warn "gh CLI not found — https://cli.github.com"
fi

if command -v python3 >/dev/null 2>&1; then
  PYVER=$(python3 -c 'import sys; print("%d.%d" % sys.version_info[:2])')
  ok "python3 ${PYVER} available"
else
  warn "python3 not found — skill requires Python 3.8+"
fi

# ---------------------------------------------------------------------------
# Post-install hint
# ---------------------------------------------------------------------------
say ""
say "${BOLD}${GREEN}${SKILL_NAME} is ready.${RESET}"
say ""
say "  ${DIM}# From an agent conversation:${RESET}"
say "  ${BOLD}${INVOKE_TRIGGER}${RESET}"
say ""
say "  ${DIM}# Directly:${RESET}"
say "  ${BOLD}python3 ${INSTALL_DIR}/{{script_name}}${RESET}"
say ""
