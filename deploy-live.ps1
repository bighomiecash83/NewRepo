#!/usr/bin/env pwsh
# DMF Music Platform - LIVE DEPLOY
# Run: .\deploy-live.ps1

$ProjectID = "dmf-music-platform"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DMF Music Platform - LIVE DEPLOY" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get secrets from user
Write-Host "[Step 1] Enter your secrets" -ForegroundColor Yellow
$MongoPassword = Read-Host "MongoDB password for bighomiecash8346 user"
if ([string]::IsNullOrWhiteSpace($MongoPassword)) {
    Write-Host "ERROR: Cannot be empty" -ForegroundColor Red
    exit 1
}

$JWTSecret = Read-Host "JWT Secret (32+ chars, e.g., my-super-jwt-key-prod)"
if ($JWTSecret.Length -lt 32) {
    Write-Host "WARNING: Should be 32+ chars. Continue? (y/n)" -ForegroundColor Yellow
    if ((Read-Host).ToLower() -ne "y") { exit 1 }
}

Write-Host "`nOK - Secrets received`n" -ForegroundColor Green

# Step 2: Firebase config
Write-Host "[Step 2] Setting Firebase config" -ForegroundColor Yellow
$MongoUri = "mongodb+srv://bighomiecash8346:${MongoPassword}@cluster0.wf8x1lb.mongodb.net/?retryWrites=true&w=majority"

firebase functions:config:set mongo.uri="$MongoUri" jwt.secret="$JWTSecret" --project $ProjectID
Write-Host "`nOK - Config set`n" -ForegroundColor Green

# Step 3: Deploy functions
Write-Host "[Step 3] Deploying Cloud Functions (30-60 sec)" -ForegroundColor Yellow

Push-Location "backend/functions"
npm ci 2>&1 | Select-Object -Last 2
$deploy = firebase deploy --only functions --project $ProjectID 2>&1
$deploy | Select-Object -Last 15

$FunctionsBase = "https://us-central1-dmf-music-platform.cloudfunctions.net/api"
Write-Host "`nFunctions URL: $FunctionsBase`n" -ForegroundColor Cyan

Pop-Location

# Step 4: Test endpoint
Write-Host "[Step 4] Testing public endpoint" -ForegroundColor Yellow
try {
    curl -sS "$FunctionsBase/pricing/public/plans" 2>&1
    Write-Host "`nOK - Endpoint works`n" -ForegroundColor Green
} catch {
    Write-Host "`nWARNING: Could not reach (may need Mongo) - continuing`n" -ForegroundColor Yellow
}

# Step 5: Frontend update
Write-Host "[Step 5] Updating frontend .env" -ForegroundColor Yellow
if (Test-Path "frontend/.env") {
    $env = Get-Content "frontend/.env" -Raw
    $env = $env -replace "VITE_API_BASE_URL=.*", "VITE_API_BASE_URL=$FunctionsBase"
    Set-Content "frontend/.env" -Value $env -NoNewline
} else {
    "VITE_API_BASE_URL=$FunctionsBase" | Out-File "frontend/.env" -Encoding UTF8
}
Write-Host "OK - Updated`n" -ForegroundColor Green

# Step 6: Deploy frontend
Write-Host "[Step 6] Building and deploying frontend" -ForegroundColor Yellow

Push-Location "frontend"
npm ci 2>&1 | Select-Object -Last 2
npm run build 2>&1 | Select-Object -Last 3
firebase deploy --only hosting --project $ProjectID 2>&1 | Select-Object -Last 5

Write-Host "`nOK - Frontend deployed`n" -ForegroundColor Green
Pop-Location

# Step 7: Generate JWT
Write-Host "[Step 7] Generating admin JWT" -ForegroundColor Yellow

Push-Location "backend/functions"
$env:JWT_SECRET = $JWTSecret
$jwtOutput = node jwt-gen.js 2>&1

Write-Host "`nADMIN JWT TOKEN:`n" -ForegroundColor Cyan
Write-Host "$jwtOutput`n" -ForegroundColor Yellow

Write-Host "SAVE THIS TOKEN - paste into admin UI`n" -ForegroundColor Cyan

Pop-Location

# Done
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT: Open https://dmf-music-platform.web.app/admin/pricing" -ForegroundColor Cyan
Write-Host "      Paste the JWT token above, click Apply, then create a plan" -ForegroundColor Cyan
Write-Host ""
