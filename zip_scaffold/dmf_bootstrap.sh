#!/bin/bash
set -e

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_ROOT"

echo "========================================"
echo "DMF Music Platform - Bootstrap Setup"
echo "========================================"
echo ""

# Step 1: Install root packages
echo "[1/5] Installing root dependencies..."
npm install

# Step 2: Install frontend
echo "[2/5] Installing frontend dependencies..."
cd apps/web
npm install
cd ../..

# Step 3: Install functions
echo "[3/5] Installing function dependencies..."
cd functions
npm install
cd ..

# Step 4: Create .env placeholders
echo "[4/5] Creating environment files..."

# Frontend .env
cat > apps/web/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5001/dmf-music-platform/us-central1/apiGateway
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dmf-music-platform
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy_REPLACE_WITH_YOUR_KEY
EOF

# Functions .env
cat > functions/.env << 'EOF'
FIREBASE_PROJECT_ID=dmf-music-platform
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGc_REPLACE_WITH_YOUR_KEY
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dmf_db
OPENAI_API_KEY=sk-_REPLACE_WITH_YOUR_KEY
DMF_HMAC_SHARED_SECRET=your-secret-key-min-32-chars
EOF

# Step 5: Build frontend & functions
echo "[5/5] Building frontend and functions..."
cd apps/web
npm run build
echo "✅ Frontend built"
cd ../..

cd functions
npm run build
echo "✅ Functions built"
cd ..

echo ""
echo "========================================"
echo "✅ Bootstrap Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Update .env files with real credentials:"
echo "   - apps/web/.env.local"
echo "   - functions/.env"
echo ""
echo "2. Set Firebase secrets (required):"
echo "   firebase functions:secrets:set OPENAI_API_KEY"
echo "   firebase functions:secrets:set SUPABASE_URL"
echo "   firebase functions:secrets:set SUPABASE_SERVICE_ROLE"
echo "   firebase functions:secrets:set MONGO_URI"
echo "   firebase functions:secrets:set DMF_HMAC_SHARED_SECRET"
echo ""
echo "3. Deploy to Firebase:"
echo "   firebase deploy --only hosting,functions"
echo ""
echo "4. Local development:"
echo "   firebase emulators:start"
echo ""
