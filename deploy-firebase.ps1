#!/usr/bin/env pwsh
# Firebase Deployment Script for DMF Music Platform
# Prerequisites: firebase-tools installed, authenticated with: firebase login

param(
    [string]$MongoPassword = "<db_password>",
    [string]$FirebaseProject = "dmf-music-platform"
)

Write-Host "🚀 DMF Music Platform - Firebase Deployment Script" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Validate Firebase CLI
Write-Host "Step 1: Checking Firebase CLI..." -ForegroundColor Yellow
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Firebase CLI not found. Install with: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Firebase CLI found" -ForegroundColor Green

# Step 2: Check Firebase authentication
Write-Host "Step 2: Checking Firebase authentication..." -ForegroundColor Yellow
$authStatus = firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not authenticated with Firebase. Run: firebase login" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Firebase authenticated" -ForegroundColor Green

# Step 3: Navigate to backend directory
Write-Host "Step 3: Setting up backend configuration..." -ForegroundColor Yellow
Push-Location backend

# Step 4: Build .env.local for functions
$mongoUri = "mongodb+srv://bighomiecash8346:$MongoPassword@cluster0.wf8x1lb.mongodb.net/dmf_db?retryWrites=true&w=majority"
$jwtSecret = "dmf-super-secret-jwt-key-2025-firebase-production"

# Create functions/.env if needed
$functionsEnv = @"
MONGO_URI=$mongoUri
JWT_SECRET=$jwtSecret
"@

Set-Content -Path "functions/.env.local" -Value $functionsEnv
Write-Host "✓ Backend configuration created" -ForegroundColor Green

# Step 5: Install backend dependencies
Write-Host "Step 5: Installing backend dependencies..." -ForegroundColor Yellow
npm install 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Step 6: Deploy Functions
Write-Host "Step 6: Deploying Firebase Functions..." -ForegroundColor Yellow
Write-Host "(This may take 2-3 minutes)" -ForegroundColor Gray
firebase deploy --only functions
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Functions deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Functions deployed successfully" -ForegroundColor Green

# Step 7: Get deployed function URL
Write-Host "Step 7: Getting deployed function URL..." -ForegroundColor Yellow
$functionUrl = firebase functions:describe api --json | ConvertFrom-Json | Select-Object -ExpandProperty httpsTrigger | Select-Object -ExpandProperty url
Write-Host "✓ Function deployed at: $functionUrl" -ForegroundColor Green

# Step 8: Update frontend config
Pop-Location
Write-Host "Step 8: Updating frontend configuration..." -ForegroundColor Yellow

$apiBase = $functionUrl -replace '/\s*$', ''
$frontendEnv = @"
# Firebase Configuration
REACT_APP_API_BASE=$apiBase
"@

Set-Content -Path "frontend/.env.local" -Value $frontendEnv
Write-Host "✓ Frontend configuration updated" -ForegroundColor Green

# Step 9: Deploy Frontend Hosting
Write-Host "Step 9: Deploying Firebase Hosting..." -ForegroundColor Yellow
Write-Host "(This may take 1-2 minutes)" -ForegroundColor Gray
firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Hosting deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Hosting deployed successfully" -ForegroundColor Green

# Final Summary
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         ✅ DEPLOYMENT COMPLETE - DMF IS LIVE! ✅          ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend URL:  https://dmf-music-platform.web.app" -ForegroundColor Cyan
Write-Host "API Base:      $apiBase" -ForegroundColor Cyan
Write-Host "Database:      MongoDB Atlas (cluster0)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit https://dmf-music-platform.web.app" -ForegroundColor White
Write-Host "2. View public pricing plans on /pricing page" -ForegroundColor White
Write-Host "3. Go to /admin/pricing to create plans (requires JWT token)" -ForegroundColor White
Write-Host "4. To generate JWT token, run:" -ForegroundColor White
Write-Host "   node -e \"console.log(require('jsonwebtoken').sign({id:'admin'}, 'dmf-super-secret-jwt-key-2025-firebase-production'))\"" -ForegroundColor Gray
Write-Host ""
Write-Host "Monitor logs:" -ForegroundColor Yellow
Write-Host "firebase functions:log" -ForegroundColor Gray
Write-Host ""
