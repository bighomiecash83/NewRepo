#!/bin/bash

# 🤖 STREAMGOD CLOUD SHELL SETUP SCRIPT
# Prepares your environment for rapid DMF development with Gemini CLI

set -e  # Exit on error

echo "🚀 Starting StreamGod Cloud Shell Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# 1. AUTHENTICATE WITH GOOGLE CLOUD
# ============================================================================

echo -e "${CYAN}📦 Step 1: Authenticating with Google Cloud${NC}"
gcloud auth application-default login || true
gcloud config set project dmf-music-platform-prod
echo -e "${GREEN}✓ Authentication complete${NC}"
echo ""

# ============================================================================
# 2. CHECK DIRECTORY STRUCTURE
# ============================================================================

echo -e "${CYAN}📁 Step 2: Setting up project directory${NC}"

# If not in correct directory, navigate there
if [ ! -d "dmf-firebase-backend-main" ]; then
  echo "🔍 Looking for dmf-firebase-backend-main..."
  if [ -d "~/dmf/dmf-firebase-backend-main" ]; then
    cd ~/dmf/dmf-firebase-backend-main
    echo -e "${GREEN}✓ Found at ~/dmf/dmf-firebase-backend-main${NC}"
  elif [ -d "../dmf-firebase-backend-main" ]; then
    cd ../dmf-firebase-backend-main
    echo -e "${GREEN}✓ Found parent directory${NC}"
  else
    echo "❌ Could not find dmf-firebase-backend-main directory"
    echo "Please run this script from your dmf project root or ~/dmf/"
    exit 1
  fi
fi

# Create pages directory if it doesn't exist
mkdir -p web/dmf-dashboard/src/pages
echo -e "${GREEN}✓ Pages directory ready${NC}"
echo ""

# ============================================================================
# 3. VERIFY FIREBASE SETUP
# ============================================================================

echo -e "${CYAN}🔥 Step 3: Verifying Firebase setup${NC}"

if [ -f ".firebaserc" ]; then
  echo -e "${GREEN}✓ .firebaserc found${NC}"
else
  echo "⚠️  .firebaserc not found. Creating basic config..."
  cat > .firebaserc << 'EOF'
{
  "projects": {
    "default": "mf-firebase-backend-main"
  }
}
EOF
  echo -e "${GREEN}✓ .firebaserc created${NC}"
fi

if [ -f "firebase.json" ]; then
  echo -e "${GREEN}✓ firebase.json found${NC}"
else
  echo "⚠️  firebase.json not found. Creating basic config..."
  cat > firebase.json << 'EOF'
{
  "hosting": {
    "public": "web/dmf-dashboard/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "functions"
  }
}
EOF
  echo -e "${GREEN}✓ firebase.json created${NC}"
fi
echo ""

# ============================================================================
# 4. INSTALL DEPENDENCIES
# ============================================================================

echo -e "${CYAN}📚 Step 4: Installing dependencies${NC}"

# Frontend dependencies
if [ -d "web/dmf-dashboard" ]; then
  cd web/dmf-dashboard
  if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install > /dev/null 2>&1
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
  else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
  fi
  cd ../..
fi

# Backend dependencies
if [ -d "functions" ]; then
  cd functions
  if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install > /dev/null 2>&1
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
  else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
  fi
  cd ..
fi
echo ""

# ============================================================================
# 5. CREATE USEFUL ALIASES
# ============================================================================

echo -e "${CYAN}⚡ Step 5: Creating shell aliases${NC}"

# Create .streamgod-aliases file
cat > ~/.streamgod-aliases << 'EOF'
#!/bin/bash

# DMF Development Aliases
alias dmf-dev='cd ~/dmf/dmf-firebase-backend-main && echo "✓ In DMF root"'
alias dmf-frontend='cd ~/dmf/dmf-firebase-backend-main/web/dmf-dashboard && echo "✓ In frontend"'
alias dmf-backend='cd ~/dmf/dmf-firebase-backend-main/functions && echo "✓ In backend"'

# Build commands
alias dmf-build='cd ~/dmf/dmf-firebase-backend-main/web/dmf-dashboard && npm run build && echo "✓ Build complete"'
alias dmf-deploy='cd ~/dmf/dmf-firebase-backend-main && firebase deploy --only hosting && echo "✓ Deployed to Firebase Hosting"'
alias dmf-dev-server='cd ~/dmf/dmf-firebase-backend-main/web/dmf-dashboard && npm run dev'

# Helper commands
alias dmf-log='cd ~/dmf/dmf-firebase-backend-main && firebase functions:log'
alias dmf-status='firebase projects:list'
alias dmf-files='ls -la ~/dmf/dmf-firebase-backend-main/STREAMGOD_GEMINI_MASTER_PROMPT.md'

# Editor shortcuts
alias dmf-edit-firebase='nano ~/dmf/dmf-firebase-backend-main/web/dmf-dashboard/src/firebase.js'
alias dmf-edit-app='nano ~/dmf/dmf-firebase-backend-main/web/dmf-dashboard/src/App.jsx'
alias dmf-edit-functions='nano ~/dmf/dmf-firebase-backend-main/functions/index.js'
EOF

# Source aliases in bashrc
if ! grep -q "streamgod-aliases" ~/.bashrc; then
  echo "source ~/.streamgod-aliases" >> ~/.bashrc
  echo -e "${GREEN}✓ Aliases added to ~/.bashrc${NC}"
else
  echo -e "${GREEN}✓ Aliases already configured${NC}"
fi

source ~/.streamgod-aliases
echo ""

# ============================================================================
# 6. CREATE QUICK START GUIDE
# ============================================================================

echo -e "${CYAN}📖 Step 6: Creating quick start guide${NC}"

cat > ~/dmf-streamgod-quickstart.sh << 'EOF'
#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           🤖 STREAMGOD GEMINI - QUICK START GUIDE              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Current Directory: $(pwd)"
echo ""
echo "1️⃣  START GEMINI CHAT:"
echo "   gcloud beta bard chat"
echo ""
echo "2️⃣  PASTE THE MASTER PROMPT:"
echo "   Content from: STREAMGOD_GEMINI_MASTER_PROMPT.md"
echo ""
echo "3️⃣  EXAMPLE FIRST REQUEST TO GEMINI:"
echo "   'Create the Firebase frontend init file.'"
echo "   'File path: web/dmf-dashboard/src/firebase.js'"
echo "   'It should import and export: app, db, auth'"
echo ""
echo "4️⃣  USEFUL ALIASES (type these anytime):"
echo "   dmf-dev          → Go to project root"
echo "   dmf-frontend     → Go to React app"
echo "   dmf-backend      → Go to Cloud Functions"
echo "   dmf-build        → Build React app"
echo "   dmf-deploy       → Deploy to Firebase Hosting"
echo "   dmf-dev-server   → Start local dev server (npm run dev)"
echo ""
echo "5️⃣  BUILD & DEPLOY WORKFLOW:"
echo "   1. Ask Gemini for a component"
echo "   2. Paste code into correct file (nano or vim)"
echo "   3. dmf-build"
echo "   4. dmf-deploy"
echo "   5. Check live URL"
echo ""
echo "6️⃣  LIVE URL:"
echo "   https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app"
echo ""
echo "7️⃣  FILES YOU'LL NEED:"
echo "   STREAMGOD_GEMINI_MASTER_PROMPT.md  → Master prompt for Gemini"
echo "   FIREBASE_HOSTING_DEPLOYMENT_GUIDE.md → Setup reference"
echo "   DMF_COMPLETE_STACK_INTEGRATION.md  → Architecture overview"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Ready? Start: gcloud beta bard chat                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
EOF

chmod +x ~/dmf-streamgod-quickstart.sh
echo -e "${GREEN}✓ Quick start guide created${NC}"
echo ""

# ============================================================================
# 7. PRINT SETUP SUMMARY
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         ✅ STREAMGOD SETUP COMPLETE                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✓ Authentication configured${NC}"
echo -e "${GREEN}✓ Project directories verified${NC}"
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo -e "${GREEN}✓ Useful aliases created${NC}"
echo -e "${GREEN}✓ Quick start guide ready${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Start Gemini chat:"
echo -e "   ${CYAN}gcloud beta bard chat${NC}"
echo ""
echo "2. Paste the master prompt from:"
echo -e "   ${CYAN}cat STREAMGOD_GEMINI_MASTER_PROMPT.md${NC}"
echo ""
echo "3. Ask for your first component!"
echo ""
echo "   Example:"
echo -e "   ${CYAN}Create the Firebase frontend init file at:${NC}"
echo -e "   ${CYAN}web/dmf-dashboard/src/firebase.js${NC}"
echo ""
echo "Then use these aliases:"
echo -e "   ${CYAN}dmf-build${NC}    - Build the app"
echo -e "   ${CYAN}dmf-deploy${NC}   - Deploy to Firebase Hosting"
echo ""
echo "Live URL:"
echo -e "   ${CYAN}https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app${NC}"
echo ""
echo -e "${GREEN}Let's ship DMF! 🚀${NC}"
echo ""
