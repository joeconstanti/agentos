#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/joeconstanti/agentos.git"

if [[ ! -r /dev/tty ]] || [[ ! -w /dev/tty ]]; then
  printf 'This installer runs in interactive mode. Run it from a terminal session.\n' >&2
  exit 1
fi

prompt_input() {
  local message="$1"
  local default_value="${2:-}"
  local value

  printf '%s [%s]: ' "$message" "$default_value" >/dev/tty
  read -r value </dev/tty
  if [[ -z "$value" ]]; then
    value="$default_value"
  fi
  printf '%s' "$value"
}

confirm() {
  local message="$1"
  local default_answer="${2:-y}"
  local answer

  while true; do
    if [[ "$default_answer" == "y" ]]; then
      printf '%s [Y/n]: ' "$message" >/dev/tty
    else
      printf '%s [y/N]: ' "$message" >/dev/tty
    fi

    read -r answer </dev/tty
    answer="$(printf '%s' "$answer" | tr '[:upper:]' '[:lower:]')"

    if [[ -z "$answer" ]]; then
      answer="$default_answer"
    fi

    case "$answer" in
      y|yes) return 0 ;;
      n|no) return 1 ;;
    esac

    printf 'Please answer y or n.\n' >/dev/tty
  done
}

obsidian_config_path() {
  local platform="$1"
  case "$platform" in
    Darwin) printf '%s/Library/Application Support/obsidian/obsidian.json' "$HOME" ;;
    Linux) printf '%s/.config/obsidian/obsidian.json' "$HOME" ;;
    *) return 1 ;;
  esac
}

register_obsidian_vault() {
  local platform="$1"
  local vault_path="$2"
  local config_path

  config_path="$(obsidian_config_path "$platform")" || return 0

  if ! command -v python3 >/dev/null 2>&1; then
    return 0
  fi

  python3 - "$config_path" "$vault_path" <<'PY' >/dev/null 2>&1
import json
import os
import secrets
import sys
import time

config_path = sys.argv[1]
vault_path = os.path.abspath(sys.argv[2])
os.makedirs(os.path.dirname(config_path), exist_ok=True)

if os.path.exists(config_path):
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except Exception:
        config = {}
else:
    config = {}

vaults = config.get("vaults")
if not isinstance(vaults, dict):
    vaults = {}

already_registered = False
for v in vaults.values():
    if isinstance(v, dict) and os.path.abspath(v.get("path", "")) == vault_path:
        v["open"] = True
        v["ts"] = int(time.time() * 1000)
        already_registered = True
        break

if not already_registered:
    vaults[secrets.token_hex(8)] = {"path": vault_path, "ts": int(time.time() * 1000), "open": True}

config["vaults"] = vaults

with open(config_path, "w", encoding="utf-8") as f:
    json.dump(config, f)
PY
}

if ! command -v git >/dev/null 2>&1; then
  printf '\e[31mGit is required to install AgentOS.\e[0m\n' >&2
  exit 1
fi

DEFAULT_PARENT_DIR="${1:-$HOME}"

while true; do
  PARENT_DIR="$(prompt_input 'Clone directory' "$DEFAULT_PARENT_DIR")"
  PARENT_DIR="${PARENT_DIR/#\~/$HOME}"
  ROOT_DIR="$PARENT_DIR/agentos"

  if [[ ! -d "$PARENT_DIR" ]]; then
    printf '\e[31mDirectory does not exist:\e[0m %s\n' "$PARENT_DIR" >/dev/tty
    continue
  fi

  if [[ -e "$ROOT_DIR" ]] && [[ ! -d "$ROOT_DIR/.git" ]]; then
    printf '\e[31mTarget path exists and is not an AgentOS git repo:\e[0m %s\n' "$ROOT_DIR" >/dev/tty
    continue
  fi

  break
done

printf '\nInstallation plan:\n' >/dev/tty
printf '  - Clone/use repo: %s\n' "$ROOT_DIR" >/dev/tty
printf '  - Install Obsidian\n' >/dev/tty
printf '  - Open vault in Obsidian\n\n' >/dev/tty

if ! confirm 'Continue?' 'y'; then
  printf 'Installation cancelled.\n' >/dev/tty
  exit 0
fi

if [[ -d "$ROOT_DIR/.git" ]]; then
  printf '\e[2m  Using existing repo at %s\e[0m\n' "$ROOT_DIR"
else
  printf '\e[2m  Cloning AgentOS to %s...\e[0m\n' "$ROOT_DIR"
  git clone --quiet "$REPO_URL" "$ROOT_DIR"
fi

OS="$(uname -s)"
case "$OS" in
  Darwin)
    if [[ -e "/Applications/Obsidian.app" ]] || [[ -e "$HOME/Applications/Obsidian.app" ]] || brew list --cask obsidian >/dev/null 2>&1; then
      printf '\e[2m  Obsidian is already installed. Skipping install.\e[0m\n'
    else
      if ! command -v brew >/dev/null 2>&1; then
        printf '\e[31mHomebrew is required on macOS to install Obsidian.\e[0m\n' >&2
        printf 'Install Homebrew from https://brew.sh and run this script again.\n' >&2
        exit 1
      fi
      printf '\e[2m  Installing Obsidian with Homebrew...\e[0m\n'
      brew install --cask obsidian
    fi
    ;;
  Linux)
    if command -v obsidian >/dev/null 2>&1; then
      printf '\e[2m  Obsidian is already installed. Skipping install.\e[0m\n'
    else
      if ! command -v snap >/dev/null 2>&1; then
        printf '\e[31msnap is required on Linux to install Obsidian.\e[0m\n' >&2
        printf 'Install snapd and run this script again.\n' >&2
        exit 1
      fi
      printf '\e[2m  Installing Obsidian with snap...\e[0m\n'
      sudo snap install obsidian --classic
    fi
    ;;
  *)
    printf '\e[31mUnsupported OS:\e[0m %s\n' "$OS" >&2
    exit 1
    ;;
esac

printf '\e[2m  Opening vault in Obsidian...\e[0m\n'
if [[ "$OS" == "Darwin" ]]; then
  register_obsidian_vault "$OS" "$ROOT_DIR"
  if command -v python3 >/dev/null 2>&1; then
    ENCODED_ROOT="$(python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))' "$ROOT_DIR")"
    ENCODED_VAULT="$(python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))' "$(basename "$ROOT_DIR")")"
    if ! open "obsidian://open?path=$ENCODED_ROOT" >/dev/null 2>&1; then
      if ! open "obsidian://open?vault=$ENCODED_VAULT" >/dev/null 2>&1; then
        open -a Obsidian "$ROOT_DIR"
      fi
    fi
  else
    open -a Obsidian "$ROOT_DIR"
  fi
else
  register_obsidian_vault "$OS" "$ROOT_DIR"
  if command -v python3 >/dev/null 2>&1; then
    ENCODED_ROOT="$(python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))' "$ROOT_DIR")"
    ENCODED_VAULT="$(python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))' "$(basename "$ROOT_DIR")")"
  else
    ENCODED_ROOT=""
    ENCODED_VAULT=""
  fi

  if command -v xdg-open >/dev/null 2>&1 && [[ -n "$ENCODED_ROOT" ]]; then
    if ! xdg-open "obsidian://open?path=$ENCODED_ROOT" >/dev/null 2>&1; then
      if ! xdg-open "obsidian://open?vault=$ENCODED_VAULT" >/dev/null 2>&1; then
        if command -v obsidian >/dev/null 2>&1; then
          obsidian "$ROOT_DIR" >/dev/null 2>&1 &
        else
          xdg-open "$ROOT_DIR" >/dev/null 2>&1 &
        fi
      fi
    fi
  elif command -v obsidian >/dev/null 2>&1; then
    obsidian "$ROOT_DIR" >/dev/null 2>&1 &
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$ROOT_DIR" >/dev/null 2>&1 &
  else
    printf '\e[33mCould not auto-open Obsidian. Open this path manually:\e[0m %s\n' "$ROOT_DIR"
  fi
fi

printf '\e[32mDone.\e[0m AgentOS is ready at %s\n' "$ROOT_DIR"
