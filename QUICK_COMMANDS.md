# ⚡ DMF Platform - Quick Command Reference

## 🔐 1. MongoDB Password Setup (DO THIS FIRST)

```powershell
# Edit appsettings.json
notepad "dmf-music-platform.Web\appsettings.json"

# Find and replace:
# "ConnectionString": "mongodb+srv://bighomiecash8346:REPLACE_WITH_PASSWORD@..."
# With:
# "ConnectionString": "mongodb+srv://bighomiecash8346:YOUR_ACTUAL_PASSWORD@..."
```

## 📦 2. Extract DMF Assets

```powershell
cd "c:\Users\bigho\source\repos\dmf-music-platform"

# If you have the DMF_Resources_v1.zip file:
$zipPath = "C:\Users\bigho\OneDrive\Documents\DMF_Resources_v1.zip"
$dest = ".\dmf-music-platform.Web\wwwroot\DMF_Resources_v1"

Expand-Archive -Path $zipPath -DestinationPath $dest -Force

# Verify it worked:
Get-ChildItem $dest -Directory
```

## 🏗️ 3. Build the Project

```powershell
cd "c:\Users\bigho\source\repos\dmf-music-platform\dmf-music-platform.Web"

# Debug build (for local testing)
dotnet build -c Debug

# Release build (for deployment)
dotnet build -c Release
```

## ▶️ 4. Run Locally

```powershell
cd "c:\Users\bigho\source\repos\dmf-music-platform\dmf-music-platform.Web"

# Run with HTTPS
dotnet run --launch-profile https

# Or plain HTTP
dotnet run
```

**Then visit:**
- Splash: `http://localhost:5183/splash`
- Artist Dashboard: `http://localhost:5183/artist`
- Analytics: `http://localhost:5183/analytics`
- Distributor Status: `http://localhost:5183/distributor/status`
- Owner Console: `http://localhost:5183/owner`

## 🧪 5. Test API Endpoints

```bash
# Health check
curl http://localhost:5183/api/config/pricing

# Get Ryia profile
curl http://localhost:5183/api/ryia/profile

# Send message to Ryia
curl -X POST http://localhost:5183/api/ryia/message \
  -H "Content-Type: application/json" \
  -d '{"mode":"plan","request":"Hello"}'
```

## 🐳 6. Build Docker Image

```bash
cd c:\Users\bigho\source\repos\dmf-music-platform

docker build \
  -f dmf-music-platform.Web\Dockerfile \
  -t dmf-platform:latest \
  .
```

## 🚀 7. Run Docker Container

```bash
docker run \
  -p 8080:8080 \
  -e MongoDb__ConnectionString="mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/?appName=DMF-MUSIC-platform" \
  -e MongoDb__DatabaseName="dmf_music_platform" \
  dmf-platform:latest
```

**Then test:** `http://localhost:8080/splash`

## 📦 8. Create Self-Contained Executable

### Windows
```powershell
cd dmf-music-platform.Web

dotnet publish `
  -c Release `
  -r win-x64 `
  --self-contained true `
  -p:PublishSingleFile=true `
  -p:IncludeNativeLibrariesForSelfExtract=true
```

Output: `bin\Release\net9.0\win-x64\publish\dmf-music-platform.Web.exe`

### macOS (M1/M2)
```bash
cd dmf-music-platform.Web

dotnet publish \
  -c Release \
  -r osx-arm64 \
  --self-contained true \
  -p:PublishSingleFile=true
```

Output: `dmf-music-platform.Web/bin/Release/net9.0/osx-arm64/publish/dmf-music-platform.Web`

### Linux
```bash
cd dmf-music-platform.Web

dotnet publish \
  -c Release \
  -r linux-x64 \
  --self-contained true \
  -p:PublishSingleFile=true
```

Output: `dmf-music-platform.Web/bin/Release/net9.0/linux-x64/publish/dmf-music-platform.Web`

## ☁️ 9. Deploy to Render.com

```bash
# Push your code to GitHub first
git add .
git commit -m "DMF Platform with MongoDB integration and assets"
git push origin master

# Then:
# 1. Go to https://render.com
# 2. New → Web Service
# 3. Connect your GitHub repo
# 4. Build Command: dotnet build -c Release
# 5. Start Command: dotnet dmf-music-platform.Web.dll
# 6. Set Environment Variables:
#    - MongoDb__ConnectionString=mongodb+srv://...
#    - MongoDb__DatabaseName=dmf_music_platform
# 7. Deploy
```

## ☁️ 10. Deploy to Fly.io

```bash
# Install flyctl from https://fly.io/docs/getting-started/installing-flyctl/

fly auth login

fly launch

# Follow prompts, then:

fly deploy
```

## 🔍 11. Check Build Status

```powershell
cd "c:\Users\bigho\source\repos\dmf-music-platform"

# See all build warnings/errors
dotnet build 2>&1 | Select-String "error"

# Clean and rebuild
dotnet clean
dotnet build -c Release
```

## 📊 12. View Project Structure

```powershell
# List key folders
Get-ChildItem "dmf-music-platform.Web" -Directory

# Check asset structure
Get-ChildItem "dmf-music-platform.Web\wwwroot\DMF_Resources_v1" -Directory

# List all Razor components
Get-ChildItem "dmf-music-platform.Web\Components" -Recurse -Filter "*.razor"
```

## 🛠️ 13. Troubleshooting

```powershell
# MongoDB won't connect
# → Check appsettings.json has correct password

# Assets not loading (404)
# → Verify DMF_Resources_v1 folder exists in wwwroot/
# Get-ChildItem "dmf-music-platform.Web\wwwroot\DMF_Resources_v1"

# Port 5183 already in use
# → Kill the process: taskkill /PID {PID} /F
# Or use different port: dotnet run --urls="http://localhost:5184"

# Docker build fails
# → Make sure .git folder exists (needed for Docker build)
# → Check .dockerignore isn't excluding important files
```

## 📝 14. Environment Variables for Deployment

```
# For any cloud deployment, set these:

MongoDb__ConnectionString=mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/?appName=DMF-MUSIC-platform
MongoDb__DatabaseName=dmf_music_platform
ASPNETCORE_ENVIRONMENT=Production
```

## 🎯 Workflow Summary

```
1. Configure MongoDB password
   ↓
2. Extract DMF_Resources_v1.zip
   ↓
3. Build: dotnet build
   ↓
4. Test locally: dotnet run → visit /splash
   ↓
5. Docker build: docker build -f Dockerfile -t dmf:latest .
   ↓
6. Deploy: 
   - Option A: docker push → cloud registry
   - Option B: dotnet publish → executables
   - Option C: Push to GitHub → Render/Fly/Railway
```

---

**Last Updated:** 2025-11-16  
**For detailed info:** See DEPLOYMENT_AND_INTEGRATION_GUIDE.md
