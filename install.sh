#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/joeconstanti/agentos.git"

# ── Node.js check ──────────────────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1; then
  printf '\e[31mAgentOS requires Node.js ≥ 18.\e[0m  Install from: https://nodejs.org\n' >&2
  exit 1
fi

# ── Locate or clone the repo ───────────────────────────────────────────────────
SCRIPT_PATH="${BASH_SOURCE[0]:-}"

if [[ -f "$SCRIPT_PATH" ]] && [[ "$(basename "$SCRIPT_PATH")" == "install.sh" ]]; then
  # Running as a local file — use the script's own directory
  ROOT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
else
  # Running via pipe (curl | bash) — clone first
  DEFAULT_DIR="$HOME/agentos"

  if [[ -n "${1:-}" ]]; then
    ROOT_DIR="${1/#\~/$HOME}"
  else
    printf '\e[36m?\e[0m  Install location \e[2m[%s]\e[0m: ' "$DEFAULT_DIR" >/dev/tty
    read -r ROOT_DIR </dev/tty
    ROOT_DIR="${ROOT_DIR:-$DEFAULT_DIR}"
    ROOT_DIR="${ROOT_DIR/#\~/$HOME}"
    echo >/dev/tty
  fi

  if [[ -d "$ROOT_DIR/.git" ]]; then
    printf '\e[2m  Using existing repo at %s\e[0m\n' "$ROOT_DIR"
  else
    printf '\e[2m  Cloning AgentOS...\e[0m\n'
    git clone --quiet "$REPO_URL" "$ROOT_DIR"
  fi
fi

# ── Bootstrap the Ink installer ───────────────────────────────────────────────
cd "$ROOT_DIR/installer"

if [[ ! -d node_modules ]]; then
  printf '\e[2m  Setting up installer...\e[0m\n'
  npm install --silent
fi

exec ./node_modules/.bin/tsx index.tsx "$ROOT_DIR"
