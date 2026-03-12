#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "🔧 AgentOS installer (pretty TUI via Ink)"

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is required but was not found in PATH."
  echo "   Please install Node.js (v18+ recommended) from https://nodejs.org/ then re-run ./install.sh"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is required but was not found in PATH."
  echo "   Please install Node.js with npm included, then re-run ./install.sh"
  exit 1
fi

if [ ! -d "node_modules/ink" ]; then
  echo "📦 Installing local Node dependencies (ink + react)..."
  if [ ! -f "package.json" ]; then
    npm init -y >/dev/null 2>&1
  fi
  npm install ink react --silent
fi

echo "🚀 Launching Ink-based setup wizard..."
echo

node ./scripts/agentos-install.mjs

