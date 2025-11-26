#!/bin/bash

# DMF Music Platform - Setup Script for macOS/Linux
# This script automates the installation and configuration

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   DMF MUSIC PLATFORM - SETUP SCRIPT v1.0 (macOS/Linux)        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v25.2.0+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm v11.6.2+"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo "✅ Git $(git --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."

echo "  Installing root dependencies..."
npm install > /dev/null 2>&1

echo "  Installing backend functions..."
cd Backend/functions
npm install > /dev/null 2>&1
cd ../..

echo "  Installing frontend dependencies..."
cd web
npm install > /dev/null 2>&1
cd ..

echo "✅ Dependencies installed successfully!"
echo ""

# Create environment file
echo "⚙️  Setting up environment..."

if [ ! -f ".env.local" ]; then
    cat > .env.local << 'EOF'
# Firebase Configuration
FIREBASE_PROJECT_ID=dmf-music-platform
FIREBASE_API_KEY=AIzaSyBdJAQCyf-jTdi1yTCY9ggBep_YsFTT49A
FIREBASE_AUTH_DOMAIN=dmf-music-platform.firebaseapp.com
FIREBASE_STORAGE_BUCKET=dmf-music-platform.firebasestorage.app

# Database Configuration
MONGO_URI=mongodb+srv://bighomiecash8346:bighomiecash8346@cluster0.wf8x1lb.mongodb.net/dmf_db
SUPABASE_URL=https://db.qfjriirqfgitbsifrjoi.supabase.co
SUPABASE_KEY=your_supabase_key_here

# API Keys
JWT_SECRET=dmf-super-secret-jwt-key-2025-firebase-production
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_AI_API_KEY=AIzaSyBS92OnLQd6HN8b4MyJGFDAxT7Qk2v2psA
EOF
    echo "✅ Created .env.local"
else
    echo "ℹ️  .env.local already exists"
fi

echo ""
echo "✅ Environment setup complete!"
echo ""

# Verify Firebase configuration
echo "🔥 Verifying Firebase setup..."

if [ -f "firebase.json" ]; then
    echo "✅ firebase.json found"
else
    echo "⚠️  firebase.json not found"
fi

if [ -f ".firebaserc" ]; then
    echo "✅ .firebaserc found"
else
    echo "⚠️  .firebaserc not found"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║             ✅ SETUP COMPLETE - READY TO USE ✅              ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                  ║"
echo "║  Start development server:                                     ║"
echo "║    firebase serve                                              ║"
echo "║                                                                  ║"
echo "║  🌐 Frontend:  http://localhost:5000                           ║"
echo "║  🔌 API:       http://localhost:5000/pricing/**                ║"
echo "║  💚 Health:    http://localhost:5000/health                    ║"
echo "║                                                                  ║"
echo "║  📚 Documentation: See SETUP_GUIDE.md                           ║"
echo "║                                                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
