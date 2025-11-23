#!/usr/bin/env pwsh
# add-github-secrets.ps1
# Automatically add all 4 GitHub secrets via GitHub CLI
# Usage: pwsh ./add-github-secrets.ps1

param(
    [string]$Repo = "bighomiecash83/NewRepo",
    [string]$AzureSpFile = "./azure-sp.json"
)

Write-Host "🔐 DMF GitHub Secrets Setup" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

# Check if gh CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI (gh) not found" -ForegroundColor Red
    Write-Host "Install from: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check if authenticated
try {
    $status = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Not authenticated with GitHub CLI" -ForegroundColor Red
        Write-Host "Run: gh auth login" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ GitHub CLI error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "✓ GitHub CLI authenticated" -ForegroundColor Green
Write-Host ""

# Check if azure-sp.json exists
if (-not (Test-Path $AzureSpFile)) {
    Write-Host "❌ Azure service principal file not found: $AzureSpFile" -ForegroundColor Red
    Write-Host "Create it with:" -ForegroundColor Yellow
    Write-Host '@"' -ForegroundColor White
    Write-Host "{" -ForegroundColor White
    Write-Host '  "clientId": "YOUR_CLIENT_ID",' -ForegroundColor White
    Write-Host '  "clientSecret": "YOUR_CLIENT_SECRET",' -ForegroundColor White
    Write-Host '  "subscriptionId": "YOUR_SUBSCRIPTION_ID",' -ForegroundColor White
    Write-Host '  "tenantId": "YOUR_TENANT_ID",' -ForegroundColor White
    Write-Host '  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",' -ForegroundColor White
    Write-Host '  "resourceManagerEndpointUrl": "https://management.azure.com/",' -ForegroundColor White
    Write-Host '  "activeDirectoryGraphResourceId": "https://graph.windows.net/",' -ForegroundColor White
    Write-Host '  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",' -ForegroundColor White
    Write-Host '  "galleryEndpointUrl": "https://gallery.azure.com/",' -ForegroundColor White
    Write-Host '  "managementEndpointUrl": "https://management.core.windows.net/"' -ForegroundColor White
    Write-Host "}" -ForegroundColor White
    Write-Host '"@ | Out-File -Encoding utf8 azure-sp.json' -ForegroundColor White
    exit 1
}

Write-Host "Reading Azure service principal from: $AzureSpFile" -ForegroundColor Green

# Read SP JSON
$azCreds = Get-Content $AzureSpFile -Raw
if (-not $azCreds) {
    Write-Host "❌ Failed to read Azure SP file" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Azure SP loaded (size: $($azCreds.Length) bytes)" -ForegroundColor Green
Write-Host ""

# Define other secrets
$secrets = @{
    "AZURE_CREDENTIALS" = $azCreds
    "ACR_NAME" = "dmfpricingacr0123"
    "AZURE_RG" = "dmf-pricing-rg"
    "WEBAPP_NAME" = "dmf-pricing-api"
}

Write-Host "Adding secrets to repo: $Repo" -ForegroundColor Cyan
Write-Host ""

# Add each secret
$successCount = 0
$failCount = 0

foreach ($secretName in $secrets.Keys) {
    $secretValue = $secrets[$secretName]
    
    Write-Host "  Adding: $secretName..." -NoNewline
    
    try {
        # Use echo to pipe secret value to gh
        $secretValue | gh secret set $secretName --repo $Repo 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✓" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " ❌" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host " ❌ Error: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Results: $successCount added, $failCount failed" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan

if ($failCount -eq 0) {
    Write-Host ""
    Write-Host "🎉 All secrets configured successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to GitHub → Settings → Secrets and variables → Actions" -ForegroundColor White
    Write-Host "2. Verify all 4 secrets are listed" -ForegroundColor White
    Write-Host "3. Push a commit to master to trigger GitHub Actions:" -ForegroundColor White
    Write-Host "   git commit --allow-empty -m 'trigger: CI/CD deployment'" -ForegroundColor White
    Write-Host "   git push origin master" -ForegroundColor White
    Write-Host ""
    Write-Host "GitHub Actions will then:" -ForegroundColor Cyan
    Write-Host "  → Build Docker image" -ForegroundColor White
    Write-Host "  → Push to Azure Container Registry" -ForegroundColor White
    Write-Host "  → Deploy to Azure App Service" -ForegroundColor White
    Write-Host ""
    Write-Host "Estimated time: 10-15 minutes" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "⚠️  Some secrets failed. Check the errors above." -ForegroundColor Yellow
    exit 1
}
