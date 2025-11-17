# 🚀 DMF Music Platform - Cloud Deployment Guide

**Status**: Ready for launch on Render, Railway, or Fly.io (no Docker Desktop needed)

## Quick Start: Deploy to Cloud (Pick One)

### Option 1: Render.com (Recommended for beginners)

1. **Create account** at https://render.com
2. **Connect GitHub** (authorize Render to access your repo)
3. **Create New → Web Service**
4. **Fill in:**
   - Name: `dmf-music-platform-api`
   - GitHub repo: `bighomiecash83/dmf-music-platform`
   - Branch: `master`
   - Runtime: `Docker`
   - Build command: (leave as auto-detected)
   - Start command: (leave as auto-detected)

5. **Set Environment Variables** (in Dashboard → Environment):
   ```
   ASPNETCORE_ENVIRONMENT=Production
   MONGODB_URI=mongodb+srv://bighomiecash8346:Dede8346$$@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?appName=DMF-MUSIC-platform
   DMF_OWNER=TRUE
   ASPNETCORE_URLS=http://+:8080
   ```

6. **Deploy** → Wait 5-10 minutes → Get URL like `https://dmf-music-platform-api.onrender.com`

---

### Option 2: Railway.app (Fast & Simple)

1. **Create account** at https://railway.app
2. **Create New Project → Deploy from GitHub**
3. **Select repo**: `bighomiecash83/dmf-music-platform`
4. **Add Service**:
   - Type: Docker
   - Dockerfile: `dmf-music-platform.Web/Dockerfile`
   - Port: `8080`

5. **Set Variables**:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   MONGODB_URI=mongodb+srv://bighomiecash8346:Dede8346$$@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?appName=DMF-MUSIC-platform
   DMF_OWNER=TRUE
   ```

6. **Deploy** → Get URL from "Deployments" tab

---

### Option 3: Fly.io (Good for production scale)

1. **Install flyctl**: `curl -L https://fly.io/install.sh | sh`
2. **Authenticate**: `fly auth login`
3. **Initialize**: 
   ```powershell
   cd C:\Users\bigho\source\repos\dmf-music-platform
   fly launch --image dmfmusicplatform/api:1.0.0
   ```
4. **Set secrets**:
   ```powershell
   fly secrets set ASPNETCORE_ENVIRONMENT=Production
   fly secrets set MONGODB_URI="mongodb+srv://bighomiecash8346:Dede8346$$@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?appName=DMF-MUSIC-platform"
   fly secrets set DMF_OWNER=TRUE
   ```
5. **Deploy**: `fly deploy`

---

## Verify Deployment Works

Once deployed, test the API:

```powershell
# Replace with your deployed URL
$apiUrl = "https://dmf-music-platform-api.onrender.com"

# Test main endpoint
Invoke-WebRequest -Uri "$apiUrl/" -UseBasicParsing

# Test Swagger docs
Start-Process "$apiUrl/swagger"

# Test Distributor API
$payload = @{ releaseType = 2; trackCount = 10; payoutTierCode = "indie_basic" } | ConvertTo-Json
Invoke-WebRequest -Uri "$apiUrl/api/distributor/release/quote" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body $payload
```

---

## Hook Frontends to Your API

### Google AI Studio

In your prompts/flows, use:
```
BASE_URL = https://dmf-music-platform-api.onrender.com
```

### Lovable

Update HTTP calls to:
```
GET/POST https://dmf-music-platform-api.onrender.com/api/...
```

---

## Local Windows EXE (Already Built)

Location: `C:\Users\bigho\source\repos\dmf-music-platform\publish\win-x64\dmf-music-platform.Web.exe`

To run in Owner Mode:
```powershell
$env:DMF_OWNER = 'TRUE'
$env:ASPNETCORE_ENVIRONMENT = 'Production'
$env:MONGODB_URI = 'mongodb+srv://bighomiecash8346:Dede8346$$@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?appName=DMF-MUSIC-platform'

C:\Users\bigho\source\repos\dmf-music-platform\publish\win-x64\dmf-music-platform.Web.exe
```

Then visit: `http://localhost:8080`

---

## Architecture After Launch

```
┌─────────────────┐
│  Google AI      │
│  Studio         │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐      ┌─────────────────┐
│  DMF API        │─────▶│  MongoDB Atlas  │
│  (Render/Fly)   │      │  (Cloud)        │
└─────────────────┘      └─────────────────┘
         ▲
         │ HTTP
┌────────┴────────┐
│  Lovable        │
│  Flows          │
└─────────────────┘

Local Owner Mode:
┌─────────────────┐      ┌─────────────────┐
│  DMF EXE        │─────▶│  MongoDB Atlas  │
│  (Windows)      │      │  (Cloud)        │
└─────────────────┘      └─────────────────┘
```

---

## Status Checklist

- ✅ Web project builds clean (0 errors)
- ✅ Windows EXE built (106MB, self-contained)
- ✅ Dockerfile ready for cloud deployment
- ✅ MongoDB configured
- ✅ Distributor + Payout Engine locked in
- ✅ API documented (API.md)
- ⏳ Ready to deploy to cloud

**Next Step**: Pick a cloud platform above and deploy! 🚀
