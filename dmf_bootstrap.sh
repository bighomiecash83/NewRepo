#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "🔥 DMF-MUSIC-PLATFORM tight bootstrap in $ROOT"

# 1) ENV – EDIT THESE ONCE, THEN LEAVE THEM ALONE
export MONGO_CONNECTION_STRING="${MONGO_CONNECTION_STRING:-mongodb+srv://YOUR_REAL_URI_HERE}"
export DMF_APP_API_KEY="${DMF_APP_API_KEY:-CHANGE_ME_DMF_APP_KEY}"
export OPENAI_API_KEY="${OPENAI_API_KEY:-sk-your-openai-key}"
export GEMINI_API_KEY="${GEMINI_API_KEY:-your-gemini-key}"

echo "✅ Env vars loaded:"
echo "   MONGO_CONNECTION_STRING: ${MONGO_CONNECTION_STRING:0:50}..."
echo "   DMF_APP_API_KEY: ${DMF_APP_API_KEY:0:20}..."
echo "   OPENAI_API_KEY: configured"
echo "   GEMINI_API_KEY: configured"

# 2) BACKEND
if command -v dotnet >/dev/null 2>&1; then
  echo ""
  echo "➡️ Starting .NET backend..."
  cd "$ROOT"
  dotnet run &
  BACKEND_PID=$!
else
  echo "❌ dotnet SDK not found. Install .NET 8+ SDK first."
  exit 1
fi

# Give backend time to start
echo "⏳ Waiting for backend to start..."
sleep 7

echo ""
echo "🔍 Checking health..."
HEALTH=$(curl -s http://localhost:5000/health || echo "failed")
echo "$HEALTH" | head -20

echo ""
echo "✅ Backend should now be live on http://localhost:5000"
echo ""
echo "🔑 Use this API key for all requests:"
echo "   x-dmf-api-key: $DMF_APP_API_KEY"
echo ""
echo "📝 Example health check:"
echo "   curl -H \"x-dmf-api-key: $DMF_APP_API_KEY\" http://localhost:5000/health"
echo ""
echo "📝 Example API call (requires API key):"
echo "   curl -H \"x-dmf-api-key: $DMF_APP_API_KEY\" http://localhost:5000/api/catalog/health"
echo ""
echo "🚀 Backend running. Press Ctrl+C to stop."
echo ""

# Wait on backend so the script doesn't exit immediately
wait $BACKEND_PID
