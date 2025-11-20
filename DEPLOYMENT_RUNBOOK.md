# 🚀 DMF Music Platform – Deployment Runbook

**Last Updated:** November 20, 2025  
**Status:** READY FOR DEPLOYMENT  
**Author:** Copilot (AI Toolkit)  

This is your **complete operational guide** to go from code repository to live production system in under 1 hour.

---

## ⚡ Quick Summary

**What's built:**
- ✅ Backend: C# ASP.NET Core 9.0 (3 controllers, MongoDB integration)
- ✅ Frontend: React + TypeScript + Firebase Auth
- ✅ Database: MongoDB Atlas configured with indexes
- ✅ Deployment configs: Azure App Hosting + Firebase Hosting
- ✅ All code committed to GitHub master (commit: a347919)

**What's locked in:**
- ✅ Production domain: `app.dmf-music-platform.com`
- ✅ API domain: `api.dmf-music-platform.com`
- ✅ MongoDB database: `dmf_music_platform_prod`
- ✅ Firebase project: `studio-5828448336-5a604`
- ✅ Initial users defined (owner + 3 artists)

**What you need to do:**
1. Set MongoDB password in Azure
2. Create Firebase users
3. Deploy backend to Azure
4. Deploy frontend to Firebase
5. Point DNS to go live

---

## 🔧 Step 1: Prepare Your Machine

### 1.1 Install Required Tools

```powershell
# Azure CLI (if not installed)
choco install azure-cli

# Firebase CLI
npm install -g firebase-tools

# .NET 9 SDK (if not installed)
choco install dotnet-sdk-9.0

# Verify installations
az --version
firebase --version
dotnet --version
```

### 1.2 Authenticate with Azure and Firebase

```powershell
# Login to Azure
az login

# Select your subscription (if you have multiple)
az account set --subscription "<your-subscription-id>"

# Login to Firebase
firebase login
```

### 1.3 Set Your Credentials

```powershell
# Set environment variable for MongoDB password
$env:MONGODB_PROD_PASSWORD = "<your-mongodb-atlas-password>"

# Verify it's set
$env:MONGODB_PROD_PASSWORD
# Should output your password
```

---

## 🏗️ Step 2: Build and Test Locally

### 2.1 Build Backend

```powershell
cd c:\Users\bigho\source\repos\dmf-music-platform

# Clean build
dotnet clean dmf-music-platform.Web.Api.csproj
dotnet build dmf-music-platform.Web.Api.csproj -c Release

# Expected output:
# Build succeeded. 0 errors, 2 warnings.
```

### 2.2 Build Frontend

```powershell
cd dmf-music-platform.Web

# Install dependencies
npm install

# Build for production
npm run build

# Expected output:
# ✓ 342 modules transformed
# dist/index.html 0.45 kB
```

### 2.3 Verify Builds

```powershell
# Backend should produce DLL
ls -la bin\Release\net9.0\*.dll | Select-Object Name, Length

# Frontend should have dist folder
ls -la dmf-music-platform.Web\dist\
```

---

## 🌐 Step 3: Create Azure Resources

### 3.1 Create Resource Group

```powershell
$rgName = "dmf-music-platform-rg"
$location = "eastus"

az group create \
  --name $rgName \
  --location $location
```

### 3.2 Create App Hosting Service

```powershell
az apphosting create \
  --name dmf-music-platform-api \
  --resource-group dmf-music-platform-rg \
  --runtime dotnet \
  --runtime-version 9.0
```

### 3.3 Set Environment Variables in Azure

```powershell
# Set the MongoDB password
az appservice config appsettings set \
  --resource-group dmf-music-platform-rg \
  --name dmf-music-platform-api \
  --settings MONGODB_PROD_PASSWORD="<your-password>"

# Verify it's set (should show the setting)
az appservice config appsettings list \
  --resource-group dmf-music-platform-rg \
  --name dmf-music-platform-api \
  | Select-String "MONGODB_PROD_PASSWORD"
```

---

## 📤 Step 4: Deploy Backend to Azure

### 4.1 Deploy Using Azure CLI

```powershell
cd c:\Users\bigho\source\repos\dmf-music-platform

# Deploy from local build
az appservice up \
  --name dmf-music-platform-api \
  --resource-group dmf-music-platform-rg \
  --plan dmf-music-platform-plan \
  --runtime "dotnet:9.0" \
  --runtime-version 9.0
```

### 4.2 Monitor Deployment

```powershell
# Watch deployment progress
az appservice deployment list \
  --resource-group dmf-music-platform-rg \
  --name dmf-music-platform-api \
  --format table

# Expected: DeploymentState = "Succeeded"
```

### 4.3 Get Backend URL

```powershell
# Get the Azure App URL
$backendUrl = az appservice show \
  --resource-group dmf-music-platform-rg \
  --name dmf-music-platform-api \
  --query "defaultHostName" \
  --output tsv

Write-Host "✅ Backend URL: https://$backendUrl"
# Example: https://dmf-music-platform-api.azurewebsites.net
```

### 4.4 Verify Backend is Working

```powershell
# Test the API
$response = Invoke-WebRequest \
  -Uri "https://$backendUrl/api/ad-orchestration/summary" \
  -SkipCertificateCheck

$response.Content | ConvertFrom-Json | Format-Table

# Expected response:
# {
#   "totalBots": 0,
#   "totalCampaigns": 0,
#   "totalCreatives": 0,
#   "botRunsLast24h": 0,
#   "status": "healthy"
# }
```

---

## 🔥 Step 5: Deploy Frontend to Firebase

### 5.1 Initialize Firebase (if not done)

```powershell
cd dmf-music-platform.Web

firebase init hosting
# Select: Use existing project (studio-5828448336-5a604)
# Public directory: dist
# Configure as single-page app: Yes
```

### 5.2 Update `.env.production`

```bash
VITE_FIREBASE_API_KEY=AIzaSyBp5xj...
VITE_FIREBASE_PROJECT_ID=studio-5828448336-5a604
VITE_FIREBASE_APP_ID=1:706134522109:web:3877779360d155c4f6e694
VITE_API_BASE_URL=https://$backendUrl/api
NODE_ENV=production
```

### 5.3 Build and Deploy

```powershell
# Build if not already done
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Expected output:
# ✔ Deploy complete!
# Project Console: https://console.firebase.google.com/project/studio-5828448336-5a604
# Hosting URL: https://dmf-music-platform.web.app
```

### 5.4 Verify Frontend is Working

```powershell
# Test the frontend
Invoke-WebRequest -Uri "https://dmf-music-platform.web.app" -SkipCertificateCheck | Select-Object -ExpandProperty Content | Head -c 200

# Expected: Should return HTML with React app
```

---

## 🔐 Step 6: Set Up Firebase Authentication

### 6.1 Create Users in Firebase Console

Go to: **Firebase Console → studio-5828448336-5a604 → Authentication → Users**

**Create these 4 users:**

1. **Owner Account**
   - Email: `bighomiecash8346@gmail.com`
   - Temporary password: (your choice)
   - Role: `owner` (via Custom Claims)

2. **Artist Account (Freezzo)**
   - Email: `freezzo.dmf@gmail.com`
   - Temporary password: (your choice)
   - Role: `artist` (via Custom Claims)

3. **Test Artist Account**
   - Email: `dmf.test.artist@gmail.com`
   - Temporary password: (your choice)
   - Role: `artist_test` (via Custom Claims)

4. **Artist Account (OBMB)**
   - Email: `obmb.dmf@gmail.com`
   - Temporary password: (your choice)
   - Role: `artist` (via Custom Claims)

### 6.2 Set Custom Claims (Optional but Recommended)

```bash
# For each user, set their role
firebase auth:set-custom-claims bighomiecash8346@gmail.com --claims='{"role":"owner"}'
firebase auth:set-custom-claims freezzo.dmf@gmail.com --claims='{"role":"artist"}'
firebase auth:set-custom-claims dmf.test.artist@gmail.com --claims='{"role":"artist_test"}'
firebase auth:set-custom-claims obmb.dmf@gmail.com --claims='{"role":"artist"}'
```

### 6.3 Send Login Instructions to Users

Email each user:
```
Hi [Name],

Welcome to DMF Music Platform!

Your account has been created. Here's how to get started:

1. Go to: https://dmf-music-platform.web.app
2. Click "Sign In"
3. Enter: [email you created]
4. Password: [temporary password]
5. Set a new password
6. You're in!

Questions? Contact: bighomiecash8346@gmail.com

—DMF Team
```

---

## 🌍 Step 7: Configure DNS (Final Step)

### 7.1 Get Firebase Hosting IP

```bash
firebase hosting:sites:list
# Note the Firebase Hosting URL from the output
```

### 7.2 Point DNS Records

In your domain registrar (GoDaddy, Namecheap, etc.):

**Record 1: Frontend**
```
Type: A (or CNAME)
Name: app
Value: (Firebase Hosting IP or CNAME)
TTL: 3600
```

**Record 2: Backend API**
```
Type: CNAME
Name: api
Value: dmf-music-platform-api.azurewebsites.net
TTL: 3600
```

### 7.3 Verify DNS Propagation

```powershell
# Check DNS resolution (may take a few minutes)
nslookup app.dmf-music-platform.com
nslookup api.dmf-music-platform.com

# Expected: Should return your IP/CNAME
```

---

## ✅ Post-Deployment Verification

### Test 1: Backend API

```powershell
# Test summary endpoint
$response = Invoke-WebRequest `
  -Uri "https://api.dmf-music-platform.com/api/ad-orchestration/summary" `
  -SkipCertificateCheck

$response.Content | ConvertFrom-Json
```

### Test 2: Frontend Login

1. Open: `https://app.dmf-music-platform.com`
2. Click "Sign In"
3. Use: `bighomiecash8346@gmail.com` (your email)
4. Password: (your Firebase password)
5. Should see dashboard

### Test 3: Campaign Change Log

1. Logged in as owner
2. Go to: `/campaign-logs` (or see in dashboard)
3. Should be empty (no campaigns yet)
4. Refresh button should work

### Test 4: Bot Actions Feed

1. Go to: `/bot-actions` (or in dashboard)
2. Should show: "No bot runs yet" or "Waiting for first run"
3. Refresh button should work

---

## 🚀 Next Steps (Operations)

Once everything is verified:

### Week 1: Onboarding

```powershell
# 1. Onboard Freezzo
# - Send login link: https://app.dmf-music-platform.com
# - Have them create first test campaign ($100 budget)
# - Verify they can see Bot Actions Feed

# 2. Run First Bot Cycle (Manual)
$response = Invoke-WebRequest `
  -Uri "https://api.dmf-music-platform.com/api/ad-orchestration/run-due" `
  -Method POST `
  -SkipCertificateCheck

# 3. Check Results
# - Verify bot generated recommendations
# - Check Bot Actions Feed
# - Verify change log recorded decisions
```

### Week 1-2: Scheduler Setup

```bash
# Create Azure Logic App to trigger bot every 4 hours
# Trigger: POST https://api.dmf-music-platform.com/api/ad-orchestration/run-due
# Schedule: Every 4 hours

# Monitor: Set up alerts for failures
az monitor metrics alert create \
  --name "Bot Run Failure Alert" \
  --resource-group dmf-music-platform-rg \
  --condition "avg HttpFailures > 0"
```

### Week 2+: Monitoring

```powershell
# Check Application Insights
az monitor app-insights component show \
  --resource-group dmf-music-platform-rg \
  --app dmf-music-platform-api

# Check Firebase performance
# Go to: Firebase Console → Performance
```

---

## 🆘 Troubleshooting

### Backend won't start (502 Bad Gateway)

**Symptom:** `https://api.dmf-music-platform.com` returns 502

**Solution:**
```powershell
# 1. Check if MongoDB password is set
az appservice config appsettings list \
  --resource-group dmf-music-platform-rg \
  --name dmf-music-platform-api | grep MONGODB

# 2. If missing, set it
az appservice config appsettings set \
  --resource-group dmf-music-platform-rg \
  --name dmf-music-platform-api \
  --settings MONGODB_PROD_PASSWORD="your-password"

# 3. Restart app
az appservice restart \
  --resource-group dmf-music-platform-rg \
  --name dmf-music-platform-api
```

### Frontend can't reach API (CORS error)

**Symptom:** Browser console shows "CORS error" or API 404

**Solution:**
```powershell
# 1. Verify API_BASE_URL in frontend .env
cat dmf-music-platform.Web\.env.production | grep API_BASE

# 2. Update if needed
# VITE_API_BASE_URL=https://api.dmf-music-platform.com

# 3. Rebuild frontend
npm run build

# 4. Redeploy
firebase deploy --only hosting
```

### Firebase auth fails (Invalid credentials)

**Symptom:** "Failed to initialize Firebase" or auth doesn't work

**Solution:**
```powershell
# 1. Verify Firebase config in frontend
cat dmf-music-platform.Web/src/config/index.ts | grep FIREBASE

# 2. Go to Firebase Console → Project Settings
# 3. Copy your Firebase config
# 4. Update src/config/index.ts
# 5. Rebuild and redeploy

npm run build && firebase deploy --only hosting
```

### MongoDB connection timeout

**Symptom:** Backend logs show "MongoDB connection timeout"

**Solution:**
```bash
# 1. Verify connection string format in appsettings.Production.json
# Should be: mongodb+srv://bighomiecash8346:${MONGODB_PROD_PASSWORD}@...

# 2. Check MongoDB Atlas whitelist
# Go to: MongoDB Atlas → Network Access
# Ensure Azure IP is whitelisted (or allow all: 0.0.0.0/0 for testing)

# 3. Test connection locally
mongosh "mongodb+srv://bighomiecash8346:password@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform_prod"
```

---

## 📋 Checklist to Go Live

- [ ] Azure CLI, Firebase CLI, .NET SDK installed
- [ ] Logged in to Azure and Firebase
- [ ] `MONGODB_PROD_PASSWORD` env var set locally
- [ ] Backend builds without errors
- [ ] Frontend builds without errors
- [ ] Azure resource group created
- [ ] Azure App Hosting service created
- [ ] MongoDB password set in Azure environment variables
- [ ] Backend deployed to Azure
- [ ] Backend API responding at https://api.dmf-music-platform.com/api/ad-orchestration/summary
- [ ] Frontend built and deployed to Firebase
- [ ] Frontend loads at https://dmf-music-platform.web.app
- [ ] Firebase users created (4 accounts)
- [ ] Can sign in as owner
- [ ] Can sign in as artist
- [ ] DNS records pointing to Azure and Firebase
- [ ] Both `app.dmf-music-platform.com` and `api.dmf-music-platform.com` resolve
- [ ] Verified bot endpoint `/api/ad-orchestration/run-due` responds
- [ ] Verified `/api/ad-campaign-changes` endpoint works
- [ ] Application Insights monitoring configured
- [ ] Alerts set up for errors
- [ ] First manual bot run successful
- [ ] Freezzo onboarded
- [ ] Scheduler configured for automated bot runs

---

## 🎉 You're Live!

Once all checks pass, congratulations! Your DMF Music Platform is live and:

✅ Artists can log in  
✅ Bots are analyzing campaigns  
✅ Changes are logged and auditable  
✅ Your system is production-ready  

Next: Monitor the first week, iterate based on feedback, and scale.

---

**Last Updated:** November 20, 2025  
**Status:** Ready to deploy  
**Questions?** See PRODUCTION_LAUNCH.md for detailed checklist
