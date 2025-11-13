# DMF Music Platform - Cloud Run Deployment Script
# Usage: .\deploy-cloud-run.ps1 -ProjectId "your-gcp-project-id"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1",
    
    [Parameter(Mandatory=$false)]
    [string]$ServiceName = "dmf-music-platform"
)

# Colors for output
$Green = @{ ForegroundColor = "Green" }
$Yellow = @{ ForegroundColor = "Yellow" }
$Red = @{ ForegroundColor = "Red" }

Write-Host "?? DMF Music Platform - Cloud Run Deployment" @Green
Write-Host "=============================================" @Green
Write-Host ""

# Step 1: Verify gcloud is installed
Write-Host "? Checking gcloud CLI..." @Yellow
try {
    $gcloudVersion = gcloud --version 2>&1
    Write-Host "  ? gcloud CLI found" @Green
} catch {
    Write-Host "  ? gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install" @Red
    exit 1
}

# Step 2: Set project
Write-Host ""
Write-Host "? Setting GCP project to: $ProjectId" @Yellow
gcloud config set project $ProjectId
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ? Failed to set project" @Red
    exit 1
}
Write-Host "  ? Project set" @Green

# Step 3: Navigate to repo
Write-Host ""
Write-Host "? Navigating to repository..." @Yellow
$repoPath = "C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM"
if (-not (Test-Path $repoPath)) {
    Write-Host "  ? Repository path not found: $repoPath" @Red
    exit 1
}
Set-Location $repoPath
Write-Host "  ? In repository: $(Get-Location)" @Green

# Step 4: Build Docker image
Write-Host ""
Write-Host "? Building Docker image..." @Yellow
Write-Host "  This may take 2-3 minutes..." @Yellow
gcloud builds submit --tag "gcr.io/$ProjectId/$ServiceName"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ? Docker build failed" @Red
    exit 1
}
Write-Host "  ? Docker image built and pushed" @Green

# Step 5: Deploy to Cloud Run
Write-Host ""
Write-Host "? Deploying to Cloud Run..." @Yellow
Write-Host "  Region: $Region" @Yellow
Write-Host "  This may take 1-2 minutes..." @Yellow

gcloud run deploy $ServiceName `
  --image "gcr.io/$ProjectId/$ServiceName" `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --memory 512M `
  --cpu 1 `
  --port 8080 `
  --set-env-vars="Google__ProjectId=$ProjectId"

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ? Cloud Run deployment failed" @Red
    exit 1
}

Write-Host "  ? Deployment complete!" @Green

# Step 6: Get service URL
Write-Host ""
Write-Host "? Retrieving service URL..." @Yellow
$serviceUrl = gcloud run services describe $ServiceName --region $Region --format 'value(status.url)'
Write-Host "  ? Service URL retrieved" @Green

# Success message
Write-Host ""
Write-Host "?? DEPLOYMENT SUCCESSFUL!" @Green
Write-Host "=============================================" @Green
Write-Host ""
Write-Host "Your app is now LIVE at:" @Green
Write-Host "  ?? $serviceUrl" @Green
Write-Host ""
Write-Host "Next steps:" @Yellow
Write-Host "  1. Visit the URL above" @Yellow
Write-Host "  2. Sign in with Google" @Yellow
Write-Host "  3. Create a test release" @Yellow
Write-Host "  4. Verify everything works" @Yellow
Write-Host ""
Write-Host "View logs:" @Yellow
Write-Host "  gcloud run logs read --limit 50 --service=$ServiceName --region=$Region" @Yellow
Write-Host ""
Write-Host "Update environment variables:" @Yellow
Write-Host "  gcloud run deploy $ServiceName --region=$Region --update-env-vars=KEY=VALUE" @Yellow
Write-Host ""
