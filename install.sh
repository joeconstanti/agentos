#!/usr/bin/env bash

set -euo pipefail

REPO_URL="https://github.com/joeconstanti/agentos.git"

# ── Colors & styles ───────────────────────────────────────────────────────────
if [[ -t 1 ]] || [[ -t 2 ]]; then
  BOLD=$'\e[1m'
  DIM=$'\e[2m'
  RESET=$'\e[0m'
  CYAN=$'\e[36m'
  GREEN=$'\e[32m'
  YELLOW=$'\e[33m'
  RED=$'\e[31m'
  WHITE=$'\e[97m'
  BG_DARK=$'\e[48;5;234m'
else
  BOLD='' DIM='' RESET='' CYAN='' GREEN='' YELLOW='' RED='' WHITE='' BG_DARK=''
fi

# ── Helpers ───────────────────────────────────────────────────────────────────
print_header() {
  echo ""
  echo "${BG_DARK}${CYAN}${BOLD}"
  echo "  ┌─────────────────────────────────────────┐  "
  echo "  │                                         │  "
  echo "  │   █████╗  ██████╗ ███████╗███╗   ██╗   │  "
  echo "  │  ██╔══██╗██╔════╝ ██╔════╝████╗  ██║   │  "
  echo "  │  ███████║██║  ███╗█████╗  ██╔██╗ ██║   │  "
  echo "  │  ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   │  "
  echo "  │  ██║  ██║╚██████╔╝███████╗██║ ╚████║   │  "
  echo "  │  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   │  "
  echo "  │                                         │  "
  echo "  │        your AI workspace, installed     │  "
  echo "  │                                         │  "
  echo "  └─────────────────────────────────────────┘  "
  echo "${RESET}"
  echo ""
}

step()    { echo "  ${CYAN}${BOLD}→${RESET}  $*"; }
ok()      { echo "  ${GREEN}${BOLD}✓${RESET}  $*"; }
warn()    { echo "  ${YELLOW}${BOLD}!${RESET}  $*"; }
info()    { echo "  ${DIM}ℹ  $*${RESET}"; }
die()     { echo "  ${RED}${BOLD}✗${RESET}  $*" >&2; exit 1; }
blank()   { echo ""; }

prompt() {
  # $1 = message  $2 = default value
  local msg="$1" default="$2" reply
  printf "  ${CYAN}?${RESET}  %s ${DIM}[%s]${RESET}: " "$msg" "$default"
  if [[ -t 0 ]]; then
    read -r reply
  else
    read -r reply </dev/tty
  fi
  echo "${reply:-$default}"
}

prompt_choice() {
  # $1 = message
  local msg="$1" reply
  printf "  ${CYAN}?${RESET}  %s: " "$msg"
  if [[ -t 0 ]]; then
    read -r reply
  else
    read -r reply </dev/tty
  fi
  echo "$reply"
}

print_divider() {
  echo "  ${DIM}──────────────────────────────────────────${RESET}"
}

# ── Clone or use local dir ────────────────────────────────────────────────────
SCRIPT_PATH="${BASH_SOURCE[0]:-}"

print_header

if [[ -f "$SCRIPT_PATH" ]] && [[ "$(basename "$SCRIPT_PATH")" == "install.sh" ]]; then
  ROOT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
  info "Using existing clone at ${WHITE}$ROOT_DIR${RESET}"
else
  blank
  step "Where should AgentOS be installed?"
  blank
  INSTALL_DIR="${1:-}"

  if [[ -z "$INSTALL_DIR" ]]; then
    INSTALL_DIR="$(prompt "Install location" "$HOME/agentos")"
  fi

  INSTALL_DIR="${INSTALL_DIR/#\~/$HOME}"
  blank

  if [[ -d "$INSTALL_DIR" ]]; then
    warn "Directory already exists: ${WHITE}$INSTALL_DIR${RESET}"
    CONFIRM="$(prompt_choice "Continue anyway? (y/n)")"
    [[ "$CONFIRM" =~ ^[Yy] ]] || die "Aborted."
    blank
  fi

  step "Cloning AgentOS into ${WHITE}$INSTALL_DIR${RESET}"
  git clone --quiet "$REPO_URL" "$INSTALL_DIR"
  ok "Repository cloned"
  ROOT_DIR="$INSTALL_DIR"
fi

blank
print_divider
blank

# ── Create vault structure ────────────────────────────────────────────────────
step "Creating workspace structure..."
mkdir -p \
  "$ROOT_DIR/00_INBOX" \
  "$ROOT_DIR/01_PROJECTS" \
  "$ROOT_DIR/02_AREAS" \
  "$ROOT_DIR/03_RESOURCES" \
  "$ROOT_DIR/04_ARCHIVE"
ok "Vault folders ready"
blank

# ── Path encoding ─────────────────────────────────────────────────────────────
encode_path() {
  if command -v python3 >/dev/null 2>&1; then
    python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$1"
  elif command -v node >/dev/null 2>&1; then
    node -e 'console.log(encodeURIComponent(process.argv[1]))' "$1"
  else
    echo "$1"
  fi
}

# ── Open Obsidian ─────────────────────────────────────────────────────────────
open_obsidian() {
  if command -v obsidian >/dev/null 2>&1; then
    obsidian "$ROOT_DIR" >/dev/null 2>&1 &
    ok "Obsidian opened"
    return 0
  fi

  if ENCODED_PATH="$(encode_path "$ROOT_DIR")"; then
    URI="obsidian://open?path=$ENCODED_PATH"
    case "$(uname -s)" in
      Darwin)      open "$URI" >/dev/null 2>&1 && ok "Obsidian opened via URI" && return 0 ;;
      Linux)       xdg-open "$URI" >/dev/null 2>&1 && ok "Obsidian opened via URI" && return 0 ;;
      MINGW*|MSYS*|CYGWIN*) cmd //c start "" "$URI" >/dev/null 2>&1 && ok "Obsidian opened via URI" && return 0 ;;
    esac
  fi

  return 1
}

install_obsidian_macos() {
  if command -v brew >/dev/null 2>&1; then
    step "Installing Obsidian via Homebrew..."
    brew install --cask obsidian && ok "Obsidian installed"
  else
    warn "Homebrew not found — opening download page..."
    open "https://obsidian.md/download"
    info "Install Obsidian, then run this script again."
    exit 0
  fi
}

install_obsidian_linux() {
  blank
  info "Choose a Linux installation method:"
  echo "     1. AppImage  →  https://obsidian.md/download"
  echo "     2. Snap      →  sudo snap install obsidian --classic"
  echo "     3. Flatpak   →  flatpak install flathub md.obsidian.Obsidian"
  blank

  if command -v xdg-open >/dev/null 2>&1; then
    OPEN_BROWSER="$(prompt_choice "Open download page in browser? (y/n)")"
    if [[ "$OPEN_BROWSER" =~ ^[Yy] ]]; then
      xdg-open "https://obsidian.md/download" >/dev/null 2>&1 &
    fi
  fi

  info "Install Obsidian, then run this script again."
  exit 0
}

# ── Obsidian setup ────────────────────────────────────────────────────────────
print_divider
blank
step "Checking for Obsidian..."
blank

if command -v obsidian >/dev/null 2>&1 || open_obsidian 2>/dev/null; then
  ok "Obsidian is available"
  open_obsidian || true
else
  warn "Obsidian is not installed"
  blank
  echo "     1.  Install automatically ${DIM}(Homebrew on macOS)${RESET}"
  echo "     2.  Open download page in browser"
  echo "     3.  Skip — I'll install it later"
  blank
  CHOICE="$(prompt_choice "Your choice (1/2/3)")"

  case "$CHOICE" in
    1)
      blank
      case "$(uname -s)" in
        Darwin) install_obsidian_macos; open_obsidian || warn "Open Obsidian manually and select: $ROOT_DIR" ;;
        Linux)  install_obsidian_linux ;;
        *)      warn "Automatic install not supported on this platform."; info "Download from: https://obsidian.md/download" ;;
      esac
      ;;
    2)
      case "$(uname -s)" in
        Darwin)              open "https://obsidian.md/download" ;;
        Linux)               xdg-open "https://obsidian.md/download" >/dev/null 2>&1 & ;;
        MINGW*|MSYS*|CYGWIN*) cmd //c start "" "https://obsidian.md/download" ;;
      esac
      ok "Download page opened"
      info "After installing, open this folder as a vault: $ROOT_DIR"
      ;;
    3)
      info "Skipping — open this folder as a vault when ready: $ROOT_DIR"
      ;;
    *)
      die "Invalid choice."
      ;;
  esac
fi

# ── Done ──────────────────────────────────────────────────────────────────────
blank
print_divider
blank
echo "  ${GREEN}${BOLD}  Setup complete!${RESET}"
blank
echo "  ${WHITE}${BOLD}Next steps${RESET}"
echo "  ${DIM}──────────${RESET}"
echo "  ${CYAN}→${RESET}  ${BOLD}Obsidian${RESET}   open the vault to navigate your knowledge graph"
echo "  ${CYAN}→${RESET}  ${BOLD}AI Agent${RESET}   point Claude Code, Cursor, etc. at this directory"
echo "  ${CYAN}→${RESET}  ${BOLD}Capture${RESET}    start dropping notes into ${WHITE}00_INBOX/${RESET}"
blank
echo "  ${DIM}Workspace: ${WHITE}$ROOT_DIR${RESET}"
blank
