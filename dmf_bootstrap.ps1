# DMF Music Platform Bootstrap Launcher (PowerShell for Windows)
# One-shot script to verify, build, and launch the backend
# Usage: .\dmf_bootstrap.ps1

param(
    [string]$Configuration = "Release",
    [int]$Port = 5000
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 DMF Music Platform Bootstrap Launcher (PowerShell)" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Colors
$Success = "Green"
$Warning = "Yellow"
$Error = "Red"
$Info = "Cyan"

# 1. Check .NET SDK
Write-Host -NoNewline "🔍 Checking .NET SDK... "
try {
    $dotnetVersion = & dotnet --version
    Write-Host "✅ Found: $dotnetVersion" -ForegroundColor $Success
} catch {
    Write-Host "❌ .NET SDK not found" -ForegroundColor $Error
    Write-Host "Install from: https://dotnet.microsoft.com/download" -ForegroundColor $Error
    exit 1
}

Write-Host ""

# 2. Verify backend project exists
Write-Host -NoNewline "🔍 Checking backend project... "
$projectPath = Join-Path $PSScriptRoot "dmf-music-platform.Web"
$projectFile = Join-Path $projectPath "dmf-music-platform.Web.csproj"

if ((Test-Path $projectPath) -and (Test-Path $projectFile)) {
    Write-Host "✅ Found dmf-music-platform.Web" -ForegroundColor $Success
} else {
    Write-Host "❌ Backend project not found" -ForegroundColor $Error
    Write-Host "Expected: $projectFile" -ForegroundColor $Error
    Write-Host "Run from solution root." -ForegroundColor $Error
    exit 1
}

Write-Host ""

# 3. Verify config file
Write-Host -NoNewline "🔍 Checking DMF config file... "
$configPath = Join-Path $projectPath "Config\dmf_company_profile.json"

if (Test-Path $configPath) {
    Write-Host "✅ Found dmf_company_profile.json" -ForegroundColor $Success
} else {
    Write-Host "❌ Config file not found" -ForegroundColor $Error
    Write-Host "Expected: $configPath" -ForegroundColor $Error
    exit 1
}

Write-Host ""

# 4. Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor $Info

# MongoDB URI
if ([string]::IsNullOrEmpty($Env:DMF_MONGO_URI)) {
    $defaultUri = "mongodb+srv://bighomiecash8346:ENTER_YOUR_PASSWORD_HERE@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?retryWrites=true&w=majority"
    Write-Host "⚠️  DMF_MONGO_URI not set. Using placeholder." -ForegroundColor $Warning
    Write-Host "   Set before running: `$Env:DMF_MONGO_URI = 'mongodb+srv://...'" -ForegroundColor $Warning
    $Env:DMF_MONGO_URI = $defaultUri
} else {
    Write-Host "✅ DMF_MONGO_URI set" -ForegroundColor $Success
}

$Env:ASPNETCORE_ENVIRONMENT = "Development"
$Env:ASPNETCORE_URLS = "http://localhost:$Port"

Write-Host "✅ ASPNETCORE_ENVIRONMENT = Development" -ForegroundColor $Success
Write-Host "✅ ASPNETCORE_URLS = http://localhost:$Port" -ForegroundColor $Success

Write-Host ""

# 5. Restore NuGet packages
Write-Host "📦 Restoring NuGet packages..." -ForegroundColor $Info
Push-Location $projectPath
try {
    & dotnet restore | Out-Null
    Write-Host "✅ Restore complete" -ForegroundColor $Success
} catch {
    Write-Host "❌ Restore failed: $_" -ForegroundColor $Error
    exit 1
} finally {
    Pop-Location
}

Write-Host ""

# 6. Build
Write-Host "🔨 Building backend..." -ForegroundColor $Info
Push-Location $projectPath
try {
    & dotnet build --configuration $Configuration | Out-Null
    Write-Host "✅ Build complete" -ForegroundColor $Success
} catch {
    Write-Host "❌ Build failed: $_" -ForegroundColor $Error
    exit 1
} finally {
    Pop-Location
}

Write-Host ""

# 7. Launch
Write-Host "🚀 Launching DMF backend..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend running at: http://localhost:$Port" -ForegroundColor $Success
Write-Host ""
Write-Host "Test these endpoints:" -ForegroundColor $Info
Write-Host "  📄 Company Profile:" -ForegroundColor $Info
Write-Host "     http://localhost:$Port/api/company/profile" -ForegroundColor $Info
Write-Host ""
Write-Host "  🏢 Service Divisions:" -ForegroundColor $Info
Write-Host "     http://localhost:$Port/api/company/services" -ForegroundColor $Info
Write-Host ""
Write-Host "  🏥 Health Check:" -ForegroundColor $Info
Write-Host "     http://localhost:$Port/api/company/health" -ForegroundColor $Info
Write-Host ""
Write-Host "Press CTRL+C to stop." -ForegroundColor $Warning
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

Push-Location $projectPath
try {
    & dotnet run --configuration $Configuration --no-build
} catch {
    Write-Host "❌ Run failed: $_" -ForegroundColor $Error
    exit 1
} finally {
    Pop-Location
}
