Param(
    [string]$ApiBaseUrl = "https://dmf-music-platform-api.azurewebsites.net",
    [switch]$SkipInstall
)

Write-Host "=== DMF Frontend Deployment (Firebase Hosting) ===" -ForegroundColor Cyan

if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Error "Firebase CLI not found. Install with: npm install -g firebase-tools"; exit 1
}

Push-Location .
if (Test-Path .\package.json) {
    Write-Host "Working directory contains package.json" -ForegroundColor Green
} else {
    Write-Warning "package.json not found in current directory. Change to frontend root and rerun."; exit 1
}

if (-not $SkipInstall) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install || exit 1
}

Write-Host "Injecting API base URL (temporary build override)..." -ForegroundColor Yellow
$env:VITE_API_BASE_URL = $ApiBaseUrl

Write-Host "Building production bundle..." -ForegroundColor Yellow
npm run build || exit 1

Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting || exit 1

Write-Host "=== Frontend Deployment Complete ===" -ForegroundColor Green
Write-Host "Visit: https://dmf-music-platform.web.app" -ForegroundColor Cyan
Write-Host "API Base: $ApiBaseUrl" -ForegroundColor White

Pop-Location
