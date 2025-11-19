#!/bin/bash

# 🤖 STREAMGOD CLOUD SHELL HELPER FUNCTIONS
# Source this file: source ~/.streamgod-functions.sh
# Then use: streamgod-help, dmf-new-page, etc.

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

streamgod-help() {
  cat << 'EOF'

╔════════════════════════════════════════════════════════════════╗
║           🤖 STREAMGOD HELPER FUNCTIONS                        ║
╚════════════════════════════════════════════════════════════════╝

AVAILABLE COMMANDS:

Development:
  dmf-dev          Go to project root
  dmf-frontend     Go to React folder
  dmf-backend      Go to Cloud Functions folder
  dmf-build        Build React app (npm run build)
  dmf-deploy       Deploy to Firebase Hosting
  dmf-dev-server   Start local dev server
  dmf-log          View Firebase logs
  dmf-status       Check Firebase status

Helper Functions:
  streamgod-help            Show this help message
  streamgod-quickstart      Show getting started guide
  streamgod-new-page NAME   Create new page template
  streamgod-new-function NAME  Create new Cloud Function template
  streamgod-check-build      Check if build works
  streamgod-show-url        Show live URL
  streamgod-open-docs       Open documentation directory

Examples:
  $ streamgod-new-page Dashboard
    Creates: web/dmf-dashboard/src/pages/Dashboard.jsx

  $ streamgod-new-function hello
    Adds: helloDmf function to functions/index.js

  $ streamgod-check-build
    Runs build and shows any errors

EOF
}

streamgod-quickstart() {
  cat << 'EOF'

╔════════════════════════════════════════════════════════════════╗
║           🚀 STREAMGOD QUICKSTART (10 minutes)                 ║
╚════════════════════════════════════════════════════════════════╝

STEP 1: Navigate to project
  $ cd ~/dmf/dmf-firebase-backend-main

STEP 2: Run setup (first time only)
  $ bash streamgod-setup.sh

STEP 3: Start Gemini
  $ gcloud beta bard chat

STEP 4: Paste master prompt
  Copy entire content from: STREAMGOD_GEMINI_MASTER_PROMPT.md
  Paste into Gemini chat

STEP 5: Ask Gemini for first component
  Example: "Create Firebase init file at web/dmf-dashboard/src/firebase.js"

STEP 6: Create the file
  $ nano web/dmf-dashboard/src/firebase.js
  Paste Gemini's code
  Ctrl+X, Y, Enter

STEP 7: Build and deploy
  $ dmf-build
  $ dmf-deploy

STEP 8: Check live URL
  https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app

STEP 9: Repeat for next component!

EOF
}

streamgod-new-page() {
  local PAGE_NAME=$1
  
  if [ -z "$PAGE_NAME" ]; then
    echo "Usage: streamgod-new-page PageName"
    echo "Example: streamgod-new-page Dashboard"
    return 1
  fi
  
  local FILE_PATH="web/dmf-dashboard/src/pages/${PAGE_NAME}.jsx"
  
  echo "📄 Creating page: $PAGE_NAME"
  echo "📍 Path: $FILE_PATH"
  
  cat > "$FILE_PATH" << EOF
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

/**
 * $PAGE_NAME Page
 * 
 * TODO: Implement this page
 * - Add useEffect to fetch data from Firestore
 * - Display content
 * - Handle loading and error states
 */
export default function $PAGE_NAME() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    // TODO: Fetch data from Firestore
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>$PAGE_NAME</h1>
      <p>Page content here</p>
    </div>
  );
}
EOF

  echo "✅ File created: $FILE_PATH"
  echo ""
  echo "Next steps:"
  echo "1. Ask Gemini to complete this page"
  echo "2. Copy Gemini's code"
  echo "3. nano $FILE_PATH (paste code)"
  echo "4. dmf-build && dmf-deploy"
  
  # Offer to edit
  read -p "Edit now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    nano "$FILE_PATH"
  fi
}

streamgod-new-function() {
  local FUNC_NAME=$1
  
  if [ -z "$FUNC_NAME" ]; then
    echo "Usage: streamgod-new-function functionName"
    echo "Example: streamgod-new-function hello"
    return 1
  fi
  
  echo "⚡ Creating Cloud Function: $FUNC_NAME"
  echo "📍 Path: functions/index.js"
  echo ""
  echo "Template created. Now:"
  echo "1. Ask Gemini to implement: $FUNC_NAME"
  echo "2. Copy Gemini's code"
  echo "3. nano functions/index.js"
  echo "4. Paste code into file"
  echo "5. firebase deploy --only functions"
}

streamgod-check-build() {
  echo "🔨 Checking if build works..."
  cd ~/dmf/dmf-firebase-backend-main/web/dmf-dashboard
  
  if npm run build > /tmp/dmf-build.log 2>&1; then
    echo "✅ Build successful!"
    du -sh dist/
  else
    echo "❌ Build failed. Errors:"
    cat /tmp/dmf-build.log | grep -i "error" || cat /tmp/dmf-build.log | tail -20
  fi
}

streamgod-show-url() {
  echo "🌐 Your live DMF app:"
  echo ""
  echo "https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app"
  echo ""
  echo "Press Ctrl+Click to open in browser, or copy and paste the URL."
}

streamgod-open-docs() {
  cd ~/dmf/dmf-firebase-backend-main
  echo "📚 Documentation files:"
  ls -1 STREAMGOD*.md | while read f; do
    echo "  - $f"
  done
  echo ""
  read -p "Which file to read? (e.g., STREAMGOD_QUICK_REFERENCE.md) " -r FILE
  if [ -f "$FILE" ]; then
    less "$FILE"
  fi
}

streamgod-status() {
  echo "📊 StreamGod Status:"
  echo ""
  
  # Check if in right directory
  if [ -f "firebase.json" ]; then
    echo "✅ Firebase config found"
  else
    echo "❌ Firebase config missing"
  fi
  
  # Check if frontend exists
  if [ -d "web/dmf-dashboard" ]; then
    echo "✅ React app folder exists"
  else
    echo "❌ React app folder missing"
  fi
  
  # Check if Cloud Functions exist
  if [ -d "functions" ]; then
    echo "✅ Cloud Functions folder exists"
  else
    echo "❌ Cloud Functions folder missing"
  fi
  
  # Check if node_modules installed
  if [ -d "web/dmf-dashboard/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
  else
    echo "⚠️  Frontend dependencies not installed"
  fi
  
  # Check if dist folder exists
  if [ -d "web/dmf-dashboard/dist" ]; then
    echo "✅ Build output exists"
    SIZE=$(du -sh web/dmf-dashboard/dist | cut -f1)
    echo "   Size: $SIZE"
  else
    echo "⚠️  Build output missing (need to run: dmf-build)"
  fi
  
  echo ""
  echo "Commands:"
  echo "  dmf-build     - Build React app"
  echo "  dmf-deploy    - Deploy to Firebase"
  echo "  dmf-dev-server - Start dev server"
}

streamgod-quick-requests() {
  cat << 'EOF'

📝 COPY-PASTE REQUESTS FOR GEMINI:

=== Request 1: Firebase Init ===
Create the Firebase frontend init file.
File path: web/dmf-dashboard/src/firebase.js
It should:
- Import initializeApp, getFirestore, and getAuth
- Create config object with placeholder values
- Initialize Firebase
- Export: app, db, and auth

=== Request 2: React Router ===
Create the main App component with React Router.
File path: web/dmf-dashboard/src/App.jsx
It should:
- Use BrowserRouter and Routes
- Have 11 routes for all pages
- Include sidebar navigation
- Render based on current route

=== Request 3: OwnerDashboard ===
Create the OwnerDashboard page.
File path: web/dmf-dashboard/src/pages/OwnerDashboard.jsx
It should:
- Query Firestore "releases", "artists", "clients"
- Show total counts
- Show releases by status (LIVE_SYMPHONIC, LIVE_DMF, DRAFT, BLOCKED)
- Handle loading and errors

=== Request 4: Catalog Page ===
Create the Catalog page.
File path: web/dmf-dashboard/src/pages/Catalog.jsx
It should:
- Display table of releases from Firestore
- Show: coverArtUrl, title, primaryArtistName, label, status
- Include search/filter by title
- Handle loading and errors

=== Request 5: StreamGod Console ===
Create the StreamGodConsole page.
File path: web/dmf-dashboard/src/pages/StreamGodConsole.jsx
It should:
- Have textarea for prompt
- Button to send prompt to backend function
- Display response from function
- Show loading state

=== Request 6: Cloud Function ===
Create a test Cloud Function.
File path: functions/index.js
Add function: helloDmf
It should:
- Be HTTP function
- Accept GET requests
- Return JSON: { message: "Hello DMF", timestamp: Date.now() }

EOF
}

# ============================================================================
# ALIAS SHORTCUTS (These also work with auto-setup)
# ============================================================================

alias dmf-dev='cd ~/dmf/dmf-firebase-backend-main && echo "✓ DMF Root"'
alias dmf-frontend='cd ~/dmf/dmf-firebase-backend-main/web/dmf-dashboard && echo "✓ Frontend"'
alias dmf-backend='cd ~/dmf/dmf-firebase-backend-main/functions && echo "✓ Backend"'
alias dmf-build='cd ~/dmf/dmf-firebase-backend-main/web/dmf-dashboard && npm run build && echo "✓ Build complete" && cd ~/dmf/dmf-firebase-backend-main'
alias dmf-deploy='cd ~/dmf/dmf-firebase-backend-main && firebase deploy --only hosting && echo "✓ Deployed"'
alias dmf-dev-server='cd ~/dmf/dmf-firebase-backend-main/web/dmf-dashboard && npm run dev'
alias dmf-log='firebase functions:log'
alias dmf-status='streamgod-status'

echo "🤖 StreamGod functions loaded!"
echo "Type: streamgod-help"

