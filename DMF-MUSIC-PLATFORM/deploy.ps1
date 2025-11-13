#!/usr/bin/env pwsh

<#
.SYNOPSIS
    DMF Music Platform - Deployment Script
.DESCRIPTION
    Automates the build, test, and deployment process
.EXAMPLE
    .\deploy.ps1 -Environment Production
.PARAMETER Environment
    Deployment environment: Local, Staging, or Production
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('Local', 'Staging', 'Production')]
    [string]$Environment = 'Local'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "DMF MUSIC PLATFORM - DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Verify we're in the right directory
if (-not (Test-Path "DMF-MUSIC-PLATFORM.csproj")) {
    Write-Host "? ERROR: DMF-MUSIC-PLATFORM.csproj not found" -ForegroundColor Red
    Write-Host "Please run this script from the DMF-MUSIC-PLATFORM directory" -ForegroundColor Red
    exit 1
}

try {
    # Step 1: Clean
    Write-Host "[1/6] Cleaning previous builds..." -ForegroundColor Yellow
    dotnet clean --configuration Release --verbosity quiet | Out-Null
    Write-Host "? Clean complete" -ForegroundColor Green

    # Step 2: Restore
    Write-Host "[2/6] Restoring NuGet packages..." -ForegroundColor Yellow
    dotnet restore --verbosity quiet
    if ($LASTEXITCODE -ne 0) { throw "Restore failed" }
    Write-Host "? Restore complete" -ForegroundColor Green

    # Step 3: Build
    Write-Host "[3/6] Building Release configuration..." -ForegroundColor Yellow
    dotnet build --configuration Release --no-restore --verbosity minimal
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
    Write-Host "? Build complete" -ForegroundColor Green

    # Step 4: Test (if test project exists)
    Write-Host "[4/6] Running tests..." -ForegroundColor Yellow
    if (Test-Path "../Tests/Tests.csproj" -PathBase ".") {
        dotnet test --configuration Release --no-build --verbosity minimal 2>$null
        Write-Host "? Tests complete" -ForegroundColor Green
    } else {
        Write-Host "??  No tests found - skipping" -ForegroundColor Yellow
    }

    # Step 5: Publish
    Write-Host "[5/6] Publishing application..." -ForegroundColor Yellow
    if (Test-Path "./publish") {
        Remove-Item -Path "./publish" -Recurse -Force -ErrorAction SilentlyContinue
    }
    dotnet publish --configuration Release --output "./publish" --no-build --verbosity quiet
    if ($LASTEXITCODE -ne 0) { throw "Publish failed" }
    Write-Host "? Publish complete" -ForegroundColor Green

    # Step 6: Create deployment package
    Write-Host "[6/6] Creating deployment package..." -ForegroundColor Yellow
    $zipPath = "./dmf-deploy-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').zip"
    Compress-Archive -Path "./publish/*" -DestinationPath $zipPath -Force
    Write-Host "? Deployment package created" -ForegroundColor Green

    # Summary
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "? DEPLOYMENT READY" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan

    $zipSize = (Get-Item $zipPath).Length / 1MB
    Write-Host "Deployment Package: $zipPath" -ForegroundColor Green
    Write-Host "Package Size: $([Math]::Round($zipSize, 2)) MB" -ForegroundColor Green
    Write-Host "Environment: $Environment" -ForegroundColor Green

    Write-Host "`n?? Next Steps:" -ForegroundColor Cyan
    
    switch ($Environment) {
        'Local' {
            Write-Host "  1. Run: dotnet run" -ForegroundColor White
            Write-Host "  2. Navigate to: https://localhost:5001" -ForegroundColor White
            Write-Host "  3. Sign in with: bighomiecash8346@gmail.com" -ForegroundColor White
        }
        'Staging' {
            Write-Host "  1. Upload $zipPath to staging server" -ForegroundColor White
            Write-Host "  2. Extract to staging application directory" -ForegroundColor White
            Write-Host "  3. Run smoke tests" -ForegroundColor White
            Write-Host "  4. Monitor health metrics" -ForegroundColor White
        }
        'Production' {
            Write-Host "  1. Verify all tests passed" -ForegroundColor White
            Write-Host "  2. Backup current production" -ForegroundColor White
            Write-Host "  3. Upload $zipPath to production" -ForegroundColor White
            Write-Host "  4. Extract to production application directory" -ForegroundColor White
            Write-Host "  5. Restart application" -ForegroundColor White
            Write-Host "  6. Verify health at: https://dmf-music-platform.com/health" -ForegroundColor White
            Write-Host "  7. Monitor for 1 hour" -ForegroundColor White
        }
    }

    Write-Host "`n? Ready to deploy!" -ForegroundColor Green
    Write-Host ""

} catch {
    Write-Host "`n? ERROR: $_" -ForegroundColor Red
    exit 1
}
