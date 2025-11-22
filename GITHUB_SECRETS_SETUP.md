# GitHub Secrets Setup for Azure Deployment

## Required Secrets for GitHub Actions CI/CD

Add these secrets to your GitHub repository at **Settings → Secrets and variables → Actions → New repository secret**:

### 1. AZURE_CREDENTIALS (Service Principal JSON)

Generate via Azure Cloud Shell:

```bash
az ad sp create-for-rbac --name "dmf-github-deployer" \
  --role contributor \
  --scopes /subscriptions/<YOUR_SUBSCRIPTION_ID> \
  --json-auth
```

Copy the entire JSON output and paste as `AZURE_CREDENTIALS` secret.

Example format:
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "..."
}
```

### 2. ACR_NAME

Value: `dmfpricingacr0123` (or your unique container registry name)

### 3. AZURE_RG

Value: `dmf-pricing-rg` (resource group name)

### 4. WEBAPP_NAME

Value: `dmf-pricing-api` (must be globally unique on Azure)

---

## GitHub Actions Workflow

The workflow (`.github/workflows/azure-container-deploy.yml`) will:

1. Build Docker image from `Dockerfile`
2. Push to Azure Container Registry
3. Deploy to Azure Web App (container instance)
4. Update app settings on the running instance

Trigger: Push to `main` or `master` branch, or manual dispatch from Actions dashboard.

---

## Post-Workflow: Manual Azure Portal Steps

After GitHub Actions completes:

1. Go to Azure Portal → App Services → `dmf-pricing-api`
2. Click **Configuration** (left sidebar)
3. Update app settings:
   - `MONGODB_PROD_PASSWORD` = your actual MongoDB password
   - `Jwt__Key` = strong 64+ character random string
   - `Jwt__Issuer` = `dmf.local`
   - `Jwt__Audience` = `dmf.clients`

4. Click **Save** → app will restart

5. Test: `curl https://dmf-pricing-api.azurewebsites.net/api/pricing/public/plans`

---

## Local Deployment (Alternative)

If you prefer to deploy without GitHub Actions:

```bash
# 1. Ensure az CLI is installed and you're logged in
az login

# 2. Make script executable
chmod +x azure-deploy.sh

# 3. Edit variables in script (ACR_NAME, APP_SERVICE_NAME, etc.)
nano azure-deploy.sh

# 4. Run deployment
./azure-deploy.sh

# 5. Script will prompt for MongoDB password and JWT key
```

---

## Verify Deployment

```bash
# Public endpoint (no auth)
curl https://dmf-pricing-api.azurewebsites.net/api/pricing/public/plans

# Should return 200 with JSON:
# [{ "_id": "...", "name": "...", "price": ..., "active": true }]
```

If 500 error: check app settings (MONGODB_PROD_PASSWORD, Jwt__Key) in Azure Portal.
If 404 error: check API routing in backend code.

---

## Troubleshooting

**GitHub Actions fails with "AZURE_CREDENTIALS is invalid"**
- Regenerate service principal: `az ad sp create-for-rbac ...`
- Update secret in GitHub

**Docker build fails**
- Ensure `Dockerfile` exists in repo root
- Ensure .NET project paths match: `dmf-music-platform.Web/dmf-music-platform.Web.Api.csproj`

**Web App deployment fails**
- Check Azure Portal logs: App Service → Monitoring → Log stream
- Ensure ACR credentials are correct in app settings

---

**Next:** Deploy frontend to Firebase (see `DEPLOYMENT_CHECKLIST.md`)
