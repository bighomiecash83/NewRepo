#!/bin/bash

# DMF Music Platform Frontend - Quick Start Script

echo "🚀 DMF Music Platform Frontend - Startup"
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "🔧 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your API keys"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Available commands:"
echo "  npm run dev     - Start development server (http://localhost:3000)"
echo "  npm run build   - Build for production"
echo "  npm start       - Run production server"
echo "  npm run lint    - Run ESLint"
echo ""
echo "📚 Backend endpoints:"
echo "  API URL: ${NEXT_PUBLIC_API_URL:=http://localhost:5001}"
echo ""
echo "Starting development server..."
echo ""

npm run dev
