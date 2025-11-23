#!/usr/bin/env bash
set -euo pipefail

echo "[DMF] Bootstrapping pricing frontend (Vite)";

if [ ! -f package.json ]; then
  echo "ERROR: Run inside web/ directory" >&2
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "[DMF] Created .env from example"
fi

npm install

echo "[DMF] Starting dev server on http://localhost:5173";
npm run dev
