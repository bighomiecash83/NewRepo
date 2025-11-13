# DMF Music Platform - Azure App Service Deployment Script
# Usage: .\deploy-azure.ps1 -SubscriptionId "your-subscription-id" -ResourceGroup "dmf-music-rg"

param(
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId,
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "dmf-music-rg",
    
    [Parameter(Mandatory=$false)]
    [string]$AppServicePlan = "dmf-music-plan",
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "dmf-music-platform",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus"
)

# Colors for output
$Green = @{ ForegroundColor = "Green" }
$Yellow = @{ ForegroundColor = "Yellow" }
$Red = @{ ForegroundColor = "Red" }

Write-Host "?? DMF Music Platform - Azure App Service Deployment" @Green
Write-Host "=====================================================" @Green
Write-Host ""

# Step 1: Verify Azure CLI is installed
Write-Host "? Checking Azure CLI..." @Yellow
try {
    $azVersion = az --version 2>&1
    Write-Host "  ? Azure CLI found" @Green
} catch {
    Write-Host "  ? Azure CLI not found. Install from: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows" @Red
    exit 1
}

# Step 2: Set subscription (optional)
if ($SubscriptionId) {
    Write-Host ""
    Write-Host "? Setting Azure subscription..." @Yellow
    az account set --subscription $SubscriptionId
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ? Failed to set subscription" @Red
        exit 1
    }
    Write-Host "  ? Subscription set" @Green
}

# Step 3: Create resource group
Write-Host ""
Write-Host "? Creating resource group: $ResourceGroup" @Yellow
az group create --name $ResourceGroup --location $Location
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ? Failed to create resource group" @Red
    exit 1
}
Write-Host "  ? Resource group created/verified" @Green

# Step 4: Create app service plan
Write-Host ""
Write-Host "? Creating app service plan: $AppServicePlan" @Yellow
az appservice plan create `
  --name $AppServicePlan `
  --resource-group $ResourceGroup `
  --sku B1 `
  --is-linux
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ? Failed to create app service plan" @Red
    exit 1
}
Write-Host "  ? App service plan created/verified" @Green

# Step 5: Create web app
Write-Host ""
Write-Host "? Creating web app: $AppName" @Yellow
az webapp create `
  --resource-group $ResourceGroup `
  --plan $AppServicePlan `
  --name $AppName `
  --runtime "DOTNETCORE|10.0"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ? Failed to create web app" @Red
    exit 1
}
Write-Host "  ? Web app created" @Green

# Step 6: Publish app
Write-Host ""
Write-Host "? Publishing application..." @Yellow
Write-Host "  Building release configuration..." @Yellow

$repoPath = "C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM"
Set-Location $repoPath

dotnet publish DMF-MUSIC-PLATFORM/DMF-MUSIC-PLATFORM.csproj -c Release -o ./publish
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ? Failed to publish application" @Red
    exit 1
}
Write-Host "  ? Application published" @Green

# Step 7: Create deployment package
Write-Host ""
Write-Host "? Creating deployment package..." @Yellow
Set-Location ./publish
Compress-Archive -Path * -DestinationPath ../dmf-app.zip -Force
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ? Failed to create zip file" @Red
    exit 1
}
Write-Host "  ? Deployment package created" @Green

# Step 8: Deploy to Azure
Write-Host ""
Write-Host "? Deploying to Azure App Service..." @Yellow
Write-Host "  This may take 2-3 minutes..." @Yellow

az webapp deployment source config-zip `
  --resource-group $ResourceGroup `
  --name $AppName `
  --src ../dmf-app.zip

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ? Deployment failed" @Red
    exit 1
}
Write-Host "  ? Deployment complete!" @Green

# Success message
Write-Host ""
Write-Host "?? DEPLOYMENT SUCCESSFUL!" @Green
Write-Host "=====================================================" @Green
Write-Host ""
Write-Host "Your app is now LIVE at:" @Green
Write-Host "  ?? https://$AppName.azurewebsites.net" @Green
Write-Host ""
Write-Host "Next steps:" @Yellow
Write-Host "  1. Visit https://$AppName.azurewebsites.net" @Yellow
Write-Host "  2. Sign in with Google" @Yellow
Write-Host "  3. Create a test release" @Yellow
Write-Host "  4. Verify everything works" @Yellow
Write-Host ""
Write-Host "View logs:" @Yellow
Write-Host "  az webapp log tail --resource-group $ResourceGroup --name $AppName" @Yellow
Write-Host ""
Write-Host "Restart app:" @Yellow
Write-Host "  az webapp restart --resource-group $ResourceGroup --name $AppName" @Yellow
Write-Host ""
