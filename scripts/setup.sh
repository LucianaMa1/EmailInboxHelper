#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed yet."
  echo "Please install Node.js 20+ from https://nodejs.org and run this script again."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not available."
  echo "Please install Node.js from https://nodejs.org and try again."
  exit 1
fi

echo "Installing Luci's Inbox Helper dependencies..."
npm install
echo
echo "Setup complete."
echo "Next time you can run:"
echo "  npm run easy:start"
