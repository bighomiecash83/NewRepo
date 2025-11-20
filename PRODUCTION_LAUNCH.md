# 🚀 DMF Music Platform – Production Launch Checklist v1

**Status:** Ready for production deployment  
**Built:** November 20, 2025  
**System:** 4-layer bot architecture (Think → Talk → Act → Audit)  

---

## 🎯 Production Configuration (LOCKED)

### 1️⃣ Domains

| Layer | URL | Service |
|-------|-----|---------|
| **Frontend (Artist App)** | `https://app.dmf-music-platform.com` | Firebase Hosting |
| **Backend (API)** | `https://api.dmf-music-platform.com` | Azure App Hosting |
| **Fallback Frontend** | `https://dmf-music-platform.web.app` | Firebase Hosting (until DNS ready) |
| **Fallback API** | `https://dmf-music-platform.azurewebsites.net` | Azure App Hosting (until DNS ready) |

### 2️⃣ MongoDB Atlas (Production Database)

**Cluster:** `dmf-music-platform` on MongoDB Atlas

```
Server:   dmf-music-platform.pfqrhc.mongodb.net
Username: bighomiecash8346
Database: dmf_music_platform_prod
```

**Connection String (template):**
```
mongodb+srv://bighomiecash8346:<MONGODB_PROD_PASSWORD>@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform_prod
```

**Collections created on first run:**
- `ad_bots`
- `ad_playbooks`
- `ad_campaigns`
- `ad_creatives`
- `ad_metrics_daily`
- `ad_bot_runs`
- `ad_policy_flags`
- `ad_campaign_change_logs`

### 3️⃣ Firebase Project (Production Auth)

**Project ID:** `studio-5828448336-5a604`

**Initial Users (Create in Firebase Console):**

| Email | Role | Permissions | Notes |
|-------|------|-------------|-------|
| `bighomiecash8346@gmail.com` | `owner` | Full system access, StreamGod dashboard, all artist data | Primary admin account |
| `freezzo.dmf@gmail.com` | `artist` | View own campaigns, bot actions, change logs, earnings | Day 1 priority artist |
| `dmf.test.artist@gmail.com` | `artist_test` | Test environment, sandbox campaigns, no real budget | QA/demo testing |
| `obmb.dmf@gmail.com` | `artist` | View own campaigns, bot actions, change logs, earnings | Secondary roster artist |

---

## 📋 Pre-Deployment Checklist

### Backend Setup

- [ ] **Set MongoDB password in Azure environment variables**
  ```bash
  az functionapp config appsettings set \
    --name dmf-music-platform \
    --resource-group dmf-music-platform-rg \
    --settings MONGODB_PROD_PASSWORD="<your-atlas-password>"
  ```

- [ ] **Update `appsettings.Production.json`** (✅ already done)
  - Connection string template uses `${MONGODB_PROD_PASSWORD}`
  - Database name: `dmf_music_platform_prod`
  - CORS enabled for production domains

- [ ] **Verify `Program.cs` reads environment variables** (✅ already done)
  - Loads `appsettings.Production.json` in production
  - Expands `${VAR_NAME}` in connection strings
  - Loads environment variables via `.AddEnvironmentVariables()`

- [ ] **Build backend locally to verify no errors**
  ```powershell
  cd c:\Users\bigho\source\repos\dmf-music-platform
  dotnet build dmf-music-platform.Web.Api.csproj
  ```

### Frontend Setup

- [ ] **Set Firebase environment variables in `.env.local`**
  ```bash
  VITE_FIREBASE_API_KEY=AIzaSyBp5xj...
  VITE_FIREBASE_PROJECT_ID=studio-5828448336-5a604
  VITE_FIREBASE_APP_ID=1:706134522109:web:3877779360d155c4f6e694
  VITE_API_BASE_URL=https://api.dmf-music-platform.com
  ```

- [ ] **Build frontend**
  ```bash
  cd dmf-music-platform.Web
  npm install
  npm run build
  ```

- [ ] **Verify build output in `dist/`**
  ```bash
  ls -la dmf-music-platform.Web/dist
  # Should contain index.html, assets/, etc.
  ```

### Firebase Authentication

- [ ] **In Firebase Console → Authentication → Users**
  - Add: `bighomiecash8346@gmail.com`
  - Add: `freezzo.dmf@gmail.com`
  - Add: `dmf.test.artist@gmail.com`
  - Add: `obmb.dmf@gmail.com` (optional)
  - Set temporary passwords, notify users

- [ ] **Create custom claims (optional but recommended)**
  ```bash
  # Using Firebase Admin SDK or CLI
  firebase auth:import users.json --hash-algo=scrypt
  ```
  Or via console: User details → Custom claims → Add role

### Azure Deployment

- [ ] **Create Azure App Hosting resource** (if not exists)
  ```bash
  az group create \
    --name dmf-music-platform-rg \
    --location eastus

  az apphosting create \
    --name dmf-music-platform \
    --resource-group dmf-music-platform-rg \
    --region eastus
  ```

- [ ] **Deploy backend to Azure App Hosting**
  ```bash
  az apphosting up \
    --project dmf-music-platform \
    --region eastus \
    --service-name api
  ```

- [ ] **Verify backend is running**
  ```bash
  curl -k https://dmf-music-platform.azurewebsites.net/api/ad-orchestration/summary
  # Should return: {"totalBots": 0, "totalCampaigns": 0, ...}
  ```

### Firebase Hosting Deployment

- [ ] **Deploy frontend to Firebase Hosting**
  ```bash
  cd dmf-music-platform.Web
  firebase login
  firebase deploy --only hosting
  ```

- [ ] **Verify frontend is live**
  ```bash
  curl https://dmf-music-platform.web.app
  # Should return index.html with React app
  ```

- [ ] **Test Firebase auth flow in browser**
  - Open: `https://dmf-music-platform.web.app`
  - Sign in with: `bighomiecash8346@gmail.com`
  - Should redirect to dashboard

### DNS Configuration (Final Step)

Once everything is verified on fallback URLs:

- [ ] **Point `app.dmf-music-platform.com` → Firebase Hosting**
  ```
  Type: A
  Name: app
  Value: Firebase Hosting IP (from Firebase Console)
  ```

- [ ] **Point `api.dmf-music-platform.com` → Azure App Hosting**
  ```
  Type: CNAME
  Name: api
  Value: dmf-music-platform.azurewebsites.net
  ```

- [ ] **Verify DNS propagation**
  ```bash
  nslookup app.dmf-music-platform.com
  nslookup api.dmf-music-platform.com
  ```

---

## 🔧 Post-Deployment Verification

### Backend API Endpoints

```bash
# Summary of bots and campaigns
curl https://api.dmf-music-platform.com/api/ad-orchestration/summary

# Example response:
# {
#   "totalBots": 2,
#   "totalCampaigns": 5,
#   "totalCreatives": 12,
#   "botRunsLast24h": 48,
#   "status": "healthy"
# }

# Get campaign change logs
curl https://api.dmf-music-platform.com/api/ad-campaign-changes?limit=10

# Execute a dry-run bot action
curl -X POST https://api.dmf-music-platform.com/api/ad-actions/apply \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "...", "dryRun": true, "recommendation": {...}}'
```

### Frontend Features

- [ ] **Login works** – Sign in with Firebase account
- [ ] **Dashboard loads** – Bot Actions Feed shows real-time decisions
- [ ] **Campaign list loads** – See campaigns in the system
- [ ] **Change log works** – View audit trail of budget changes
- [ ] **Logout works** – Sign out and return to login page

### Database Health

```bash
# Connect to MongoDB Atlas
mongosh "mongodb+srv://bighomiecash8346:<password>@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform_prod"

# Check collections exist
show collections
# Output should show:
# ad_bots, ad_campaigns, ad_creatives, ad_metrics_daily, 
# ad_bot_runs, ad_policy_flags, ad_campaign_change_logs, pricing_plans

# Check indexes
db.ad_campaign_change_logs.getIndexes()
# Should show 3 composite indexes for fast queries
```

---

## 🎯 Next Steps After Launch

### Week 1: Initial Operations

1. **Onboard Freezzo**
   - Send login link: `https://app.dmf-music-platform.com`
   - Create first campaign with test budget ($100)
   - Run manual bot action to verify flow

2. **Test Bot Brain Loop**
   - Manually trigger bot via: `POST /api/ad-orchestration/run-due`
   - Verify recommendations are generated
   - Verify change log records all decisions

3. **Set Up Scheduler**
   - Configure Azure Logic App or Cloud Scheduler
   - Trigger `POST /api/ad-orchestration/run-due` every 4 hours
   - Monitor for errors

4. **Monitor System**
   - Check Azure Application Insights for errors
   - Check Firebase Console for auth issues
   - Monitor MongoDB Atlas for slow queries

### Week 2+: Scaling & Optimization

- [ ] Add more artists to the system
- [ ] Create real campaigns with production budgets
- [ ] Collect bot performance metrics
- [ ] Optimize index performance
- [ ] Set up automated backups

---

## 🔐 Security Checklist

- [ ] **MongoDB**: Network access restricted to Azure + your IP
- [ ] **Firebase**: Only allow requests from `app.dmf-music-platform.com` domain
- [ ] **Azure**: HTTPS enforced, certificate auto-renewed
- [ ] **Secrets**: All passwords in environment variables, never in code
- [ ] **CORS**: Only allow frontend domain in API
- [ ] **Backups**: MongoDB Atlas automated backups enabled
- [ ] **Monitoring**: Application Insights alerts configured

---

## 📞 Troubleshooting

### Backend won't start

```
Error: MongoDB connection failed
Fix: Verify MONGODB_PROD_PASSWORD is set in Azure environment variables
```

### Frontend can't reach API

```
Error: CORS error or 404 from API
Fix: Verify API_BASE_URL in .env matches actual Azure URL
```

### Firebase auth fails

```
Error: Firebase project not initialized or invalid credentials
Fix: Verify VITE_FIREBASE_* variables in .env match Firebase Console
```

### MongoDB indexes not created

```
Error: Command createIndexes not found
Fix: Ensure user has admin permissions; restart backend to trigger index creation on startup
```

---

## 📊 System Architecture (Production)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐                ┌──────────────────┐     │
│  │ Firebase Hosting │                │  Azure App       │     │
│  │                  │                │  Hosting         │     │
│  │ Frontend React   │─────────────→  │  Backend ASP.NET │     │
│  │ App              │  HTTPS/API    │  Core 9.0        │     │
│  │ (dmf-music...)   │                │                  │     │
│  └──────────────────┘                └──────────────────┘     │
│         │                                    │                │
│         │ Firebase Auth                      │ MongoDB        │
│         │                                    │                │
│  ┌─────────────────┐              ┌──────────────────────┐   │
│  │ Firebase Auth   │              │  MongoDB Atlas       │   │
│  │ (User Login)    │              │  (dmf_music_platform │   │
│  └─────────────────┘              │   _prod)             │   │
│                                   └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

**Ready to deploy? Follow the checklist above, and the system will be live within hours.**

Last updated: November 20, 2025
