#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Preparing AgentOS vault folders"

mkdir -p \
  "$ROOT_DIR/notes" \
  "$ROOT_DIR/specs" \
  "$ROOT_DIR/agents" \
  "$ROOT_DIR/playbooks" \
  "$ROOT_DIR/archive"

echo "==> Folders ready"

encode_path() {
  if command -v python3 >/dev/null 2>&1; then
    python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$1"
  elif command -v node >/dev/null 2>&1; then
    node -e 'console.log(encodeURIComponent(process.argv[1]))' "$1"
  else
    return 1
  fi
}

if command -v obsidian >/dev/null 2>&1; then
  echo "==> Opening vault in Obsidian"
  obsidian "$ROOT_DIR" >/dev/null 2>&1 || true
  echo "Done. If Obsidian did not open, run it manually and open: $ROOT_DIR"
  exit 0
fi

if ENCODED_PATH="$(encode_path "$ROOT_DIR")"; then
  URI="obsidian://open?path=$ENCODED_PATH"
  echo "==> Attempting to open Obsidian URI"

  case "$(uname -s)" in
    Darwin)
      open "$URI" >/dev/null 2>&1 || true
      ;;
    Linux)
      xdg-open "$URI" >/dev/null 2>&1 || true
      ;;
    MINGW*|MSYS*|CYGWIN*)
      cmd //c start "" "$URI" >/dev/null 2>&1 || true
      ;;
    *)
      ;;
  esac
fi

echo "Done. If Obsidian did not open, install it from https://obsidian.md/download"
echo "Then open this folder as a vault: $ROOT_DIR"
