@echo off
REM DMF Music Platform Frontend - Quick Start Script (Windows)

echo.
echo 🚀 DMF Music Platform Frontend - Startup
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo 🔧 Creating .env.local from .env.example...
    copy .env.example .env.local
    echo ⚠️  Please edit .env.local with your API keys
)

echo.
echo ✅ Setup complete!
echo.
echo 🎯 Available commands:
echo   npm run dev     - Start development server ^(http://localhost:3000^)
echo   npm run build   - Build for production
echo   npm start       - Run production server
echo   npm run lint    - Run ESLint
echo.
echo 📚 Backend endpoints:
echo   API URL: http://localhost:5001
echo.
echo Starting development server...
echo.

call npm run dev
