#!/usr/bin/env bash

set -euo pipefail

REPO_URL="https://github.com/joeconstanti/agentos.git"

# Detect if running via pipe (curl | bash) or as a local file
SCRIPT_PATH="${BASH_SOURCE[0]:-}"
if [[ -f "$SCRIPT_PATH" ]] && [[ "$(basename "$SCRIPT_PATH")" == "install.sh" ]]; then
  # Running as a local file — use the script's directory
  ROOT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
else
  # Running via pipe — clone the repo first
  DEFAULT_DIR="$HOME/agentos"
  INSTALL_DIR="${1:-}"

  if [[ -z "$INSTALL_DIR" ]]; then
    read -rp "Install location [$DEFAULT_DIR]: " INSTALL_DIR
    INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_DIR}"
  fi

  # Expand ~ manually in case read doesn't expand it
  INSTALL_DIR="${INSTALL_DIR/#\~/$HOME}"

  echo "📦 Cloning AgentOS into $INSTALL_DIR..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  ROOT_DIR="$INSTALL_DIR"
fi

echo "╔═══════════════════════════════════════╗"
echo "║      AgentOS Installation Setup       ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "Welcome to AgentOS — your personal vault + agent workspace."
echo ""

# Create directory structure
echo "📁 Creating workspace structure..."
mkdir -p \
  "$ROOT_DIR/00_INBOX" \
  "$ROOT_DIR/01_PROJECTS" \
  "$ROOT_DIR/02_AREAS" \
  "$ROOT_DIR/03_RESOURCES" \
  "$ROOT_DIR/04_ARCHIVE"

echo "✓ Workspace folders created"
echo ""

# Function to encode path for URI
encode_path() {
  if command -v python3 >/dev/null 2>&1; then
    python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$1"
  elif command -v node >/dev/null 2>&1; then
    node -e 'console.log(encodeURIComponent(process.argv[1]))' "$1"
  else
    echo "$1"
  fi
}

# Function to open Obsidian
open_obsidian() {
  echo "🚀 Attempting to open Obsidian..."

  if command -v obsidian >/dev/null 2>&1; then
    obsidian "$ROOT_DIR" >/dev/null 2>&1 &
    echo "✓ Obsidian opened successfully"
    return 0
  fi

  if ENCODED_PATH="$(encode_path "$ROOT_DIR")"; then
    URI="obsidian://open?path=$ENCODED_PATH"

    case "$(uname -s)" in
      Darwin)
        open "$URI" >/dev/null 2>&1 && echo "✓ Obsidian opened via URI" && return 0
        ;;
      Linux)
        xdg-open "$URI" >/dev/null 2>&1 && echo "✓ Obsidian opened via URI" && return 0
        ;;
      MINGW*|MSYS*|CYGWIN*)
        cmd //c start "" "$URI" >/dev/null 2>&1 && echo "✓ Obsidian opened via URI" && return 0
        ;;
    esac
  fi

  return 1
}

# Function to install Obsidian on macOS
install_obsidian_macos() {
  if command -v brew >/dev/null 2>&1; then
    echo "📥 Installing Obsidian via Homebrew..."
    brew install --cask obsidian && echo "✓ Obsidian installed successfully"
  else
    echo "⚠️  Homebrew not found. Opening download page..."
    open "https://obsidian.md/download"
    echo "Please download and install Obsidian, then run this script again."
    exit 0
  fi
}

# Function to install Obsidian on Linux
install_obsidian_linux() {
  echo "📥 For Linux, please choose an installation method:"
  echo "  1. Download AppImage from https://obsidian.md/download"
  echo "  2. Install via Snap: sudo snap install obsidian --classic"
  echo "  3. Install via Flatpak: flatpak install flathub md.obsidian.Obsidian"
  echo ""

  if command -v xdg-open >/dev/null 2>&1; then
    read -p "Open download page in browser? (y/n): " open_browser
    if [[ "$open_browser" =~ ^[Yy] ]]; then
      xdg-open "https://obsidian.md/download" >/dev/null 2>&1 &
    fi
  fi

  echo "Please install Obsidian and run this script again."
  exit 0
}

# Check if Obsidian is already installed
if command -v obsidian >/dev/null 2>&1 || open_obsidian 2>/dev/null; then
  echo "✓ Obsidian is already available on this system"
  open_obsidian || true
else
  echo "ℹ️  Obsidian is not currently installed."
  echo ""
  echo "Would you like to:"
  echo "  1. Install Obsidian automatically (requires Homebrew on macOS)"
  echo "  2. Skip installation (I'll install it manually later)"
  echo "  3. Open download page in browser"
  echo ""
  read -p "Enter your choice (1/2/3): " choice

  case "$choice" in
    1)
      case "$(uname -s)" in
        Darwin)
          install_obsidian_macos
          open_obsidian || echo "⚠️  Please open Obsidian manually and select: $ROOT_DIR"
          ;;
        Linux)
          install_obsidian_linux
          ;;
        *)
          echo "⚠️  Automatic installation not supported on this platform."
          echo "Please download from: https://obsidian.md/download"
          ;;
      esac
      ;;
    2)
      echo "⏭️  Skipping Obsidian installation."
      echo "You can install it later from: https://obsidian.md/download"
      echo "Then open this folder as a vault: $ROOT_DIR"
      ;;
    3)
      case "$(uname -s)" in
        Darwin)
          open "https://obsidian.md/download"
          ;;
        Linux)
          xdg-open "https://obsidian.md/download" >/dev/null 2>&1 &
          ;;
        MINGW*|MSYS*|CYGWIN*)
          cmd //c start "" "https://obsidian.md/download"
          ;;
      esac
      echo "✓ Download page opened in browser"
      echo "After installing, open this folder as a vault: $ROOT_DIR"
      ;;
    *)
      echo "⚠️  Invalid choice. Exiting."
      exit 1
      ;;
  esac
fi

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║          Setup Complete! ✅           ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  • Obsidian: Open this repo as a vault to navigate your knowledge"
echo "  • AI Agent: Point your AI agent (Cursor, Claude Code, etc.) at this directory"
echo "  • Start: Begin capturing notes in 00_INBOX/ and organize into projects/areas"
echo ""
echo "Workspace location: $ROOT_DIR"
echo ""
