#!/usr/bin/env bash
# Firebase deploy — run this to complete launch
# Prerequisites: firebase-tools installed, logged in

set -euo pipefail

echo "🚀 DMF Firebase Frontend Deployment"
echo "===================================="
echo ""

# Check if dist folder exists
if [ ! -d "web/dist" ]; then
  echo "❌ dist folder not found. Run: cd web && npm run build"
  exit 1
fi

# Check if Firebase is logged in
if ! firebase projects:list &>/dev/null; then
  echo "⚠️  Firebase CLI not authenticated. Run: firebase login"
  exit 1
fi

echo "📤 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Frontend deployed!"
echo "🌍 Visit: https://dmf-music-platform.web.app"
echo ""
echo "Next steps:"
echo "1. Test public plans: https://dmf-music-platform.web.app/pricing"
echo "2. Test admin panel: https://dmf-music-platform.web.app/admin/pricing"
echo "3. If backend still spinning up, wait 5-10 minutes and refresh"
