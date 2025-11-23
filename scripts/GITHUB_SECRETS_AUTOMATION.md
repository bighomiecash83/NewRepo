# ⚡ Add GitHub Secrets — Automated Setup

Run this PowerShell script to add all 4 GitHub secrets in one shot via GitHub CLI.

## Prerequisites

1. **Install GitHub CLI** (if not already installed):
   ```powershell
   # Using winget (Windows 10/11)
   winget install GitHub.cli
   
   # Or download from: https://cli.github.com/
   ```

2. **Authenticate with GitHub**:
   ```powershell
   gh auth login
   
   # Choose:
   # - GitHub.com
   # - HTTPS
   # - Y (for git credential manager)
   # - Y (for SSH key)
   # - Personal access token (if prompted)
   #   → Generate at https://github.com/settings/tokens
   #   → Scopes: repo, workflow
   ```

3. **Verify authentication**:
   ```powershell
   gh auth status
   # Should show: Logged in to github.com as YOUR_USERNAME
   ```

---

## Step 1: Create Azure Service Principal JSON

Run in PowerShell (from your repo root or any folder):

```powershell
# First, get your Azure subscription ID and create service principal
# (You should have done this in Azure Cloud Shell earlier)

# Once you have the service principal JSON, save it as azure-sp.json:

@"
{
  "clientId": "YOUR_CLIENT_ID_HERE",
  "clientSecret": "YOUR_CLIENT_SECRET_HERE",
  "subscriptionId": "YOUR_SUBSCRIPTION_ID_HERE",
  "tenantId": "YOUR_TENANT_ID_HERE",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
"@ | Out-File -Encoding utf8 azure-sp.json

# Verify file was created
cat azure-sp.json
```

**⚠️ Important**: Replace the placeholder values with your actual Azure SP credentials from Azure Cloud Shell:

```bash
# If you haven't created service principal yet, run in Azure Cloud Shell:
az ad sp create-for-rbac --name "dmf-github-deployer" \
  --role contributor \
  --scopes /subscriptions/<YOUR_SUBSCRIPTION_ID> \
  --json-auth

# Copy the entire JSON output and paste it into azure-sp.json above
```

---

## Step 2: Run the Automated Script

Create file: **`add-github-secrets.ps1`** (in repo root)

```powershell
# add-github-secrets.ps1
# Automatically add all 4 GitHub secrets via GitHub CLI

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
    Write-Host "Create it with the commands above." -ForegroundColor Yellow
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
    
    Write-Host "Adding: $secretName..." -NoNewline
    
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
}
```

Now run it:

```powershell
# From repo root
pwsh ./add-github-secrets.ps1

# Or with custom repo name if different
pwsh ./add-github-secrets.ps1 -Repo "YOUR_USERNAME/YOUR_REPO"
```

**Expected output:**
```
🔐 DMF GitHub Secrets Setup
===========================

✓ GitHub CLI authenticated
Reading Azure service principal from: ./azure-sp.json
✓ Azure SP loaded (size: 456 bytes)

Adding secrets to repo: bighomiecash83/NewRepo

Adding: AZURE_CREDENTIALS... ✓
Adding: ACR_NAME... ✓
Adding: AZURE_RG... ✓
Adding: WEBAPP_NAME... ✓

════════════════════════════════════════════
✅ Results: 4 added, 0 failed
════════════════════════════════════════════

🎉 All secrets configured successfully!

Next steps:
1. Go to GitHub → Settings → Secrets and variables → Actions
2. Verify all 4 secrets are listed
3. Push a commit to master to trigger GitHub Actions
```

---

## Step 3: Verify Secrets in GitHub UI

1. Go to: **GitHub.com → Your Repo → Settings → Secrets and variables → Actions**
2. You should see all 4 secrets listed:
   - `AZURE_CREDENTIALS` (hidden, masked)
   - `ACR_NAME`
   - `AZURE_RG`
   - `WEBAPP_NAME`

---

## Step 4: Trigger Deployment

Now push a commit to trigger GitHub Actions:

```powershell
cd c:\Users\bigho\source\repos\dmf-music-platform

# Create empty commit to trigger workflow
git commit --allow-empty -m "trigger: initiate Azure CI/CD deployment"

# Push to master
git push origin master
```

This will trigger the **"Build & Deploy to Azure WebApp"** workflow.

---

## Step 5: Monitor Deployment

Go to: **GitHub.com → Your Repo → Actions**

Watch the workflow progress:
1. ✓ Checkout code
2. ✓ Azure login
3. 🔄 Build Docker image (3 min)
4. 🔄 Push to ACR (2 min)
5. 🔄 Deploy to Web App (3 min)
6. 🔄 Verify deployment (1 min)

**Total time**: ~10-15 minutes

When complete, backend will be live at: `https://dmf-pricing-api.azurewebsites.net`

---

## Troubleshooting

**"gh: command not found"**
→ Install GitHub CLI from https://cli.github.com/

**"GitHub CLI not authenticated"**
→ Run: `gh auth login` and follow prompts

**"azure-sp.json not found"**
→ Create the file with your Azure service principal JSON (see Step 1)

**"Secrets failed to add"**
→ Check you're logged in: `gh auth status`
→ Verify repo name is correct: `gh repo view <REPO>`

**Workflow doesn't trigger**
→ Check GitHub Actions is enabled: Settings → Actions → Allow all actions

---

## Complete: You're Now Automated! 🚀

After this script runs successfully:
- All secrets are configured
- GitHub Actions can authenticate with Azure
- Next deployment trigger: `git push` to `master`

Continue with **LAUNCH_CHECKLIST.md** Step 2 (Monitor GitHub Actions).
