#!/usr/bin/env bash
set -e

echo "🛰  DMF Gateway bootstrap starting..."

# Move into this script's directory
cd "$(dirname "$0")"

# Basic checks
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is required. Install Node.js first."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is required. Install Node.js/npm first."
  exit 1
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing gateway dependencies..."
  npm install
else
  echo "📦 Dependencies already installed. Skipping npm install."
fi

# Export default port if not set
export PORT="${PORT:-5000}"

echo "✅ DMF Gateway ready. Starting on port ${PORT}..."
npm run start
