# 🚀 DMF Deployment Ready — Next Steps

**Status**: All deployment artifacts created and ready to commit.

---

## What Was Just Created

| File/Folder | Purpose |
|---|---|
| `Dockerfile` | Container image for ASP.NET Core backend |
| `azure-deploy.sh` | Bash script to deploy locally via Azure CLI |
| `.github/workflows/azure-container-deploy.yml` | GitHub Actions CI/CD pipeline |
| `GITHUB_SECRETS_SETUP.md` | Guide to configure GitHub Secrets |
| `DEPLOYMENT_CHECKLIST.md` | Full checklist with all deployment steps |
| `scripts/create_admin_user.js` | Firebase Admin SDK script to create Freezzo |
| `scripts/generate_jwt.sh` | Helper to generate test JWT tokens |
| `appsettings.Production.json` | Production config template (already exists) |
| `firebase.json` | Firebase Hosting config (already exists) |

---

## ✅ Quick Start: 5-Step Deployment

### Step 1: Set GitHub Secrets (2 min)

Go to **GitHub → Settings → Secrets and variables → Actions → New repository secret**

1. **AZURE_CREDENTIALS**: Run in Azure Cloud Shell:
   ```bash
   az ad sp create-for-rbac --name "dmf-github-deployer" --role contributor --scopes /subscriptions/<YOUR_SUBSCRIPTION_ID> --json-auth
   ```
   Paste entire JSON output.

2. **ACR_NAME**: `dmfpricingacr0123`
3. **AZURE_RG**: `dmf-pricing-rg`
4. **WEBAPP_NAME**: `dmf-pricing-api`

### Step 2: Commit & Push (1 min)

```bash
cd c:\Users\bigho\source\repos\dmf-music-platform
git add Dockerfile azure-deploy.sh .github/workflows/ GITHUB_SECRETS_SETUP.md DEPLOYMENT_CHECKLIST.md
git commit -m "feat: add Docker & Azure CI/CD deployment pipeline"
git push origin main
```

### Step 3: Monitor GitHub Actions (5-10 min)

1. Go to **GitHub → Actions**
2. Watch **"Build & Deploy to Azure WebApp"** workflow run
3. Workflow will:
   - Build Docker image
   - Push to Azure Container Registry (ACR)
   - Deploy to Azure App Service
   - Expose at: `https://dmf-pricing-api.azurewebsites.net`

### Step 4: Set Azure App Settings (2 min)

While workflow runs, go to **Azure Portal**:

1. Navigate to: **App Services → dmf-pricing-api → Configuration**
2. Edit **App settings**:
   - `MONGODB_PROD_PASSWORD` = your MongoDB Atlas password
   - `Jwt__Key` = strong 64+ char random string (e.g., from `openssl rand -base64 48`)
3. Click **Save** → app will restart

### Step 5: Deploy Frontend & Test (5 min)

```bash
# Build frontend with production API URL
cd web
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Test endpoints
curl https://dmf-music-platform.web.app/pricing
curl https://dmf-pricing-api.azurewebsites.net/api/pricing/public/plans
```

---

## 📋 Verification Checklist

After all 5 steps, verify:

- [ ] GitHub Actions workflow completed successfully
- [ ] Backend health check: `curl https://dmf-pricing-api.azurewebsites.net/api/pricing/public/plans` → **200 OK**
- [ ] Frontend loaded: `https://dmf-music-platform.web.app/pricing` → **renders with Tailwind styling**
- [ ] Admin panel: `https://dmf-music-platform.web.app/admin/pricing` → **loads without errors**

---

## 🔐 Create Firebase Admin User (Optional Now, Required Before Onboarding)

When ready to onboard Freezzo:

```bash
# 1. Download Firebase service account key
#    Firebase Console → Project Settings → Service Accounts → Generate new key
#    Save as: scripts/serviceAccountKey.json

# 2. Install dependencies
cd scripts
npm init -y
npm install firebase-admin

# 3. Create admin user
node create_admin_user.js

# Output will show:
# ✓ User created with UID: ...
# Email: freezzo.dmf@gmail.com
# Password: ChangeMeToSecurePassword123!
```

---

## 🎯 Next Actions After Deployment

1. **Verify all endpoints** (see checklist above)
2. **Onboard Freezzo**: Send login link + password
3. **Create test campaign**: $100 budget, Instagram + TikTok
4. **Trigger bot cycle**: `POST /api/ad-orchestration/run-due`
5. **Monitor bot actions** in BotActionsFeed

---

## 📚 Reference Docs

- **GITHUB_SECRETS_SETUP.md**: Detailed secrets configuration
- **DEPLOYMENT_CHECKLIST.md**: Complete step-by-step with troubleshooting
- **firebase.json**: Frontend hosting configuration
- **appsettings.Production.json**: Backend configuration template

---

## ⚠️ Important Notes

- **Dockerfile**: Uses .NET 9.0 (verify your SDK version matches)
- **ACR_NAME**: Must be globally unique (lowercase, alphanumeric only)
- **WEBAPP_NAME**: Must be globally unique on Azure
- **JWT_KEY**: Must be 64+ characters; use: `openssl rand -base64 48`
- **MONGODB_PROD_PASSWORD**: Replace placeholder in Azure Portal, not in config files

---

## 🚨 Troubleshooting

**GitHub Actions fails**: Check `AZURE_CREDENTIALS` secret is valid JSON
**Backend can't start**: Check MONGODB_PROD_PASSWORD and Jwt__Key in Azure Portal
**Frontend can't reach backend**: Check `VITE_API_BASE_URL` in `.env.production`
**JWT validation fails**: Ensure Jwt__Key matches the key used to generate token

---

**Status**: Ready to deploy. Commit artifacts and push to `main` branch to trigger GitHub Actions.

**Next Command**: `git push origin main` → watch GitHub Actions → verify endpoints → onboard Freezzo.
