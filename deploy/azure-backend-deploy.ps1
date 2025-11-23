Param(
    [string]$AppName = "dmf-music-platform-api",
    [string]$ResourceGroup = "dmf-music-platform-rg",
    [string]$Location = "eastus",
    [string]$PlanName = "dmf-music-platform-plan",
    [string]$MongoPassword,
    [switch]$SkipCreate
)

Write-Host "=== DMF Backend Deployment (Azure App Service) ===" -ForegroundColor Cyan

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI (az) not found. Install from https://aka.ms/azure-cli then retry."; exit 1
}

if (-not $MongoPassword) {
    $MongoPassword = Read-Host -Prompt "Enter MongoDB production password (will be URL-encoded by app)"
}

# 1. Build & publish
Write-Host "[1/7] Building backend (Release)..." -ForegroundColor Yellow
dotnet publish .\dmf-music-platform.Web.Api.csproj -c Release -o publish || exit 1

# 2. Zip bundle
Write-Host "[2/7] Creating deployment zip..." -ForegroundColor Yellow
if (Test-Path backend.zip) { Remove-Item backend.zip -Force }
Compress-Archive -Path publish\* -DestinationPath backend.zip -Force

if (-not $SkipCreate) {
    # 3. Resource group
    Write-Host "[3/7] Ensuring resource group '$ResourceGroup'..." -ForegroundColor Yellow
    az group create --name $ResourceGroup --location $Location 1>$null

    # 4. App Service plan (Linux, B1)
    Write-Host "[4/7] Ensuring App Service plan '$PlanName'..." -ForegroundColor Yellow
    az appservice plan create --name $PlanName --resource-group $ResourceGroup --sku B1 --is-linux 1>$null

    # 5. Web App
    Write-Host "[5/7] Ensuring Web App '$AppName'..." -ForegroundColor Yellow
    az webapp create --name $AppName --resource-group $ResourceGroup --plan $PlanName --runtime "DOTNETCORE:9.0" 1>$null
}

# 6. App settings
Write-Host "[6/7] Setting app settings..." -ForegroundColor Yellow
az webapp config appsettings set --name $AppName --resource-group $ResourceGroup --settings MONGODB_PROD_PASSWORD="$MongoPassword" ASPNETCORE_ENVIRONMENT=Production 1>$null

# 7. Zip deploy
Write-Host "[7/7] Deploying zip bundle..." -ForegroundColor Yellow
az webapp deployment source config-zip --resource-group $ResourceGroup --name $AppName --src backend.zip 1>$null

Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Test endpoint:" -ForegroundColor Cyan
Write-Host "curl https://$AppName.azurewebsites.net/api/ad-orchestration/summary" -ForegroundColor White
