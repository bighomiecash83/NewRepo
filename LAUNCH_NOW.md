# ⚡ INSTANT GITHUB SECRETS SETUP

Run this NOW to configure GitHub Secrets for Azure deployment:

---

## Step 1: Create Azure Service Principal

Run in **Azure Cloud Shell** (https://shell.azure.com):

```bash
# Get your subscription ID first
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "Subscription: $SUBSCRIPTION_ID"

# Create service principal for GitHub
az ad sp create-for-rbac --name "dmf-github-deployer" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID \
  --json-auth
```

Copy entire JSON output.

---

## Step 2: Add GitHub Secrets

Go to: **GitHub.com → Your Repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value |
|---|---|
| `AZURE_CREDENTIALS` | Paste the JSON from Step 1 |
| `ACR_NAME` | `dmfpricingacr0123` |
| `AZURE_RG` | `dmf-pricing-rg` |
| `WEBAPP_NAME` | `dmf-pricing-api` |

**Note**: ACR_NAME must be globally unique and lowercase. If `dmfpricingacr0123` is taken, use: `dmfacr` + your random suffix (e.g., `dmfacr8346`).

---

## Step 3: Monitor GitHub Actions

Go to: **GitHub.com → Your Repo → Actions**

Look for: **"Build & Deploy to Azure WebApp (Container)"**

Status will show:
- 🟡 In Progress (building Docker, pushing to ACR, deploying to App Service)
- ✅ Complete (took ~5-10 minutes)

---

## Step 4: Configure Azure App Settings (while workflow runs)

Go to: **Azure Portal → App Services → dmf-pricing-api → Configuration**

Click **Edit** on App settings and update:

| Setting | Value |
|---|---|
| `MONGODB_PROD_PASSWORD` | Your MongoDB Atlas password |
| `Jwt__Key` | Strong 64+ char key (generate: `openssl rand -base64 48` or use a password manager) |
| `Jwt__Issuer` | `dmf.local` |
| `Jwt__Audience` | `dmf.clients` |

Click **Save** → app will restart (takes 1-2 min).

---

## Step 5: Deploy Frontend to Firebase

```powershell
cd c:\Users\bigho\source\repos\dmf-music-platform\web

# Build with production API URL
$env:VITE_API_BASE_URL="https://dmf-pricing-api.azurewebsites.net"
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
# Output: https://dmf-music-platform.web.app
```

---

## Step 6: Test Everything

```bash
# Backend public endpoint
curl https://dmf-pricing-api.azurewebsites.net/api/pricing/public/plans
# Expect: 200 with JSON array

# Frontend
open https://dmf-music-platform.web.app/pricing
# Expect: Tailwind styled pricing table

# Admin panel
open https://dmf-music-platform.web.app/admin/pricing
# Expect: Create/toggle/delete with toast feedback
```

---

**TOTAL TIME**: ~15 minutes

**NEXT**: Onboard Freezzo + run first bot cycle
