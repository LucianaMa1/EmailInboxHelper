#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed yet."
  echo "Install Node.js 20+ from https://nodejs.org and then run this again."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not available."
  echo "Install Node.js from https://nodejs.org and then run this again."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "First run detected. Installing dependencies..."
  npm install
elif [ package-lock.json -nt node_modules ]; then
  echo "Dependencies changed. Refreshing install..."
  npm install
fi

echo
echo "Starting Luci's Inbox Helper at http://localhost:3030"
echo "Keep this Terminal window open while Luci is running."
echo

if command -v open >/dev/null 2>&1; then
  (
    sleep 2
    open "http://localhost:3030"
  ) >/dev/null 2>&1 &
fi

exec npm start
