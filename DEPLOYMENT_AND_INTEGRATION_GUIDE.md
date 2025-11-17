# DMF Platform Integration & Deployment Guide

## 🚀 Quick Start

### 1. MongoDB Atlas Setup (REQUIRED)

Your MongoDB connection string needs the password configured:

```
mongodb+srv://bighomiecash8346:YOUR_PASSWORD_HERE@dmf-music-platform.pfqrhc.mongodb.net/?appName=DMF-MUSIC-platform
```

**Steps:**
1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Sign in to your account
3. Find your cluster password (Security → Database Access)
4. Copy your password
5. Update `appsettings.json`:
   ```json
   "MongoDb": {
     "ConnectionString": "mongodb+srv://bighomiecash8346:YOUR_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/?appName=DMF-MUSIC-platform",
     "DatabaseName": "dmf_music_platform"
   }
   ```

### 2. Extract DMF_Resources_v1.zip

From PowerShell in your solution root:

```powershell
$zipPath = "C:\path\to\DMF_Resources_v1.zip"
$destPath = ".\dmf-music-platform.Web\wwwroot\DMF_Resources_v1"

Expand-Archive -Path $zipPath -DestinationPath $destPath -Force

# Verify extraction
Get-ChildItem $destPath -Directory
```

Expected output:
```
dmf_branding/
dmf_splashes/
dmf_icons/
dmf_charts/
dmf_textures/
dmf_buttons/
dmf_ux_kit/
dmf_dsp_badges/
dashboard_assets/
app_builder_assets/
owner_console_assets/
```

### 3. Test Build & Run

```powershell
# Build the project
cd "c:\Users\bigho\source\repos\dmf-music-platform"
dotnet build -c Debug

# Run the backend
cd dmf-music-platform.Web
dotnet run --launch-profile https
```

Backend will be available at: `http://localhost:5183`

---

## 📁 Asset Organization Structure

```
wwwroot/
├── DMF_Resources_v1/
│   ├── dmf_branding/               # Logo variations
│   │   ├── dmf-logo-gold-shield.png
│   │   ├── dmf-logo-neon-blue-gold.png
│   │   ├── dmf-logo-crown.png
│   │   ├── dmf-logo-eagle.png
│   │   └── dmf-app-icon-256x256.png
│   │
│   ├── dmf_splashes/               # Full-screen splash screens
│   │   ├── splash-gold-shield-4k.png
│   │   ├── splash-eagle-descent-4k.png
│   │   ├── splash-crown-fade-4k.png
│   │   └── splash-neon-circuit-4k.png
│   │
│   ├── dmf_icons/                  # Component icons (24-48px)
│   │   ├── upload-icon.svg
│   │   ├── add-track-icon.svg
│   │   ├── qc-pass.svg
│   │   ├── qc-error.svg
│   │   ├── distributor.svg
│   │   ├── analytics.svg
│   │   ├── catalog.svg
│   │   ├── owner-mode.svg
│   │   ├── settings.svg
│   │   ├── cloud-sync.svg
│   │   └── dsp-delivered.svg
│   │
│   ├── dmf_charts/                 # Chart placeholders
│   │   ├── streams-chart-placeholder.svg
│   │   └── revenue-chart-placeholder.svg
│   │
│   ├── dmf_dsp_badges/             # DSP platform logos
│   │   ├── spotify-badge.svg
│   │   ├── apple-music-badge.svg
│   │   ├── youtube-music-badge.svg
│   │   ├── tiktok-badge.svg
│   │   ├── soundcloud-badge.svg
│   │   ├── amazon-music-badge.svg
│   │   ├── tidal-badge.svg
│   │   ├── deezer-badge.svg
│   │   └── pandora-badge.svg
│   │
│   ├── dashboard_assets/           # Dashboard UI elements
│   │   ├── album-cover-placeholder.svg
│   │   ├── avatar-placeholder.svg
│   │   ├── stat-card-template.svg
│   │   ├── earnings-graph-placeholder.svg
│   │   └── notification-badge.svg
│   │
│   ├── app_builder_assets/         # App builder / Ryia assets
│   │   ├── ryia-avatar.svg
│   │   ├── ryia-signature.svg
│   │   ├── streamgod-brain-node.svg
│   │   ├── editor-background.svg
│   │   └── code-block-texture.svg
│   │
│   ├── owner_console_assets/       # Owner control panel
│   │   ├── diagnostics-panel.svg
│   │   ├── log-viewer.svg
│   │   ├── dmf-badge-watermark.svg
│   │   └── gold-border-frame.svg
│   │
│   ├── dmf_buttons/                # Button styles
│   │   └── button-styles.css
│   │
│   ├── dmf_ux_kit/                 # Card & input styles
│   │   └── card-styles.css
│   │
│   └── dmf_textures/               # Background textures
│       └── carbon-fiber.txt
```

---

## 🎨 Using Assets in Components

### Splash Screen Example
```razor
<img src="DMF_Resources_v1/dmf_branding/dmf-logo-gold-shield.png" 
     alt="DMF Logo" 
     class="logo-image animate-pulse" />
```

### Charts in Analytics
```razor
<img src="DMF_Resources_v1/dmf_charts/streams-chart-placeholder.svg" 
     alt="Streams Chart" 
     class="w-full h-auto" />
```

### DSP Badges in Distribution Status
```razor
<img src="DMF_Resources_v1/dmf_dsp_badges/spotify-badge.svg" 
     alt="Spotify" 
     class="h-16" />
```

### Dashboard Assets
```razor
<img src="DMF_Resources_v1/dashboard_assets/avatar-placeholder.svg" 
     alt="Avatar" 
     class="h-24 w-24 rounded-full" />
```

---

## 🖼️ Upgrading to Real Brand Assets

### File Naming Convention

Keep these standardized names to avoid code changes later:

```
dmf-logo-gold-shield.png          # Primary logo
dmf-logo-neon-blue-gold.png       # Tech/AI variant
dmf-logo-crown.png                # Minimal variant
dmf-logo-eagle.png                # Premium/powerful variant
dmf-app-icon-256x256.png          # App icon (smallest)
dmf-app-icon-512x512.png          # App icon (medium)
dmf-app-icon-1024x1024.png        # App icon (largest)
```

### Color Standards

```
DMF Gold:       #FFD700
DMF Blue:       #00A8FF
DMF Black:      #070708
DMF White:      #FFFFFF
Accent Gold:    #D4A017
```

### How to Replace

1. Generate or design high-res PNG/SVG using the colors above
2. Save to: `wwwroot/DMF_Resources_v1/dmf_branding/[filename].png`
3. No code changes needed — your components already reference the correct paths

---

## 🐳 Docker & Container Deployment

### Build Docker Image

```bash
cd dmf-music-platform

docker build \
  -f dmf-music-platform.Web/Dockerfile \
  -t dmf-music-platform:latest \
  .
```

### Run Docker Container

```bash
docker run \
  -p 8080:8080 \
  -e MongoDb__ConnectionString="mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/?appName=DMF-MUSIC-platform" \
  -e MongoDb__DatabaseName="dmf_music_platform" \
  dmf-music-platform:latest
```

Container will listen on `http://localhost:8080`

---

## 🌐 Cloud Deployment Options

### Option A: Render.com (Recommended)

1. Push code to GitHub
2. Go to https://render.com
3. Connect your GitHub repo
4. Select "Web Service"
5. Build command: `dotnet build -c Release`
6. Start command: `dotnet dmf-music-platform.Web.dll`
7. Set environment variables:
   - `MongoDb__ConnectionString` = your Atlas URI with password
   - `MongoDb__DatabaseName` = `dmf_music_platform`

### Option B: Fly.io

```bash
# Install Fly CLI
# https://fly.io/docs/getting-started/installing-flyctl/

fly launch

# During setup, configure:
# - Internal port: 8080
# - Environment: MongoDb__ConnectionString and MongoDb__DatabaseName

fly deploy
```

### Option C: Railway

1. Go to https://railway.app
2. Connect GitHub repo
3. Select `dmf-music-platform.Web` as root directory
4. Set environment variables (same as above)
5. Deploy

---

## 🖥️ Build Installers for Windows/Mac/Linux

### Windows Self-Contained Executable

```powershell
cd dmf-music-platform.Web

dotnet publish `
  -c Release `
  -r win-x64 `
  --self-contained true `
  -p:PublishSingleFile=true `
  -p:IncludeNativeLibrariesForSelfExtract=true

# Output: bin\Release\net9.0\win-x64\publish\dmf-music-platform.Web.exe
```

Wrap the `publish` folder in an installer tool:
- **Inno Setup** (free): https://jrsoftware.org/isinfo.php
- **WiX Toolset** (advanced): https://wixtoolset.org

### macOS Arm64 (M1/M2)

```bash
dotnet publish \
  -c Release \
  -r osx-arm64 \
  --self-contained true \
  -p:PublishSingleFile=true

# Output: dmf-music-platform.Web/bin/Release/net9.0/osx-arm64/publish/dmf-music-platform.Web
```

Create `.dmg` with macOS packaging tool:
- **Platypus**: Convert shell scripts to apps
- **create-dmg**: Bash script to create DMG files

### Linux x64

```bash
dotnet publish \
  -c Release \
  -r linux-x64 \
  --self-contained true \
  -p:PublishSingleFile=true

# Output: dmf-music-platform.Web/bin/Release/net9.0/linux-x64/publish/dmf-music-platform.Web
```

Run directly:
```bash
./dmf-music-platform.Web
```

Or containerize with Docker (see section above).

---

## ✅ Integration Checklist

- [ ] MongoDB Atlas password configured in `appsettings.json`
- [ ] DMF_Resources_v1.zip extracted to `wwwroot/DMF_Resources_v1/`
- [ ] `dotnet build` completes without errors
- [ ] `dotnet run` starts backend on localhost:5183
- [ ] `/splash` page loads and shows DMF logo
- [ ] `/artist` dashboard shows avatar and earnings graph
- [ ] `/analytics` shows streams and revenue charts with DSP badges
- [ ] `/distributor/status` displays all DSP platform badges
- [ ] `/owner` console shows diagnostics panel and can execute commands
- [ ] All asset images load without 404 errors
- [ ] Dockerfile builds successfully
- [ ] Environment variables ready for cloud deployment

---

## 📚 API Endpoints to Test

Once backend is running:

```bash
# Health check
curl http://localhost:5183/api/config/pricing

# Get Ryia profile
curl http://localhost:5183/api/ryia/profile

# Send message to Ryia
curl -X POST http://localhost:5183/api/ryia/message \
  -H "Content-Type: application/json" \
  -d '{"mode":"plan","request":"What is your name?"}'
```

---

## 🔗 Integration with Google AI Studio + Lovable

Update your frontend configurations to point to:

```
API Base URL: http://localhost:5183
(or your deployed cloud URL)
```

Endpoints your frontend will call:
- `GET /api/config/pricing` — Pricing configuration
- `POST /api/distributor/release/quote` — Get distribution quote
- `GET /api/ryia/profile` — Ryia chatbot profile
- `POST /api/ryia/message` — Send message to Ryia
- `POST /api/builder/write` — Write files (when implemented)
- `GET /api/analytics/:releaseId` — Get analytics (when MongoDB integrated)

---

## 🐛 Troubleshooting

### "MongoDB connection string not configured"
→ Update `appsettings.json` with correct password

### "Assets not loading (404)"
→ Verify `DMF_Resources_v1` folder exists in `wwwroot/`

### "Backend won't start"
→ Check MongoDB Atlas is reachable from your IP (Whitelist in Atlas)

### "Docker build fails"
→ Ensure .git folder is present; Docker build needs the full repo structure

---

Generated: 2025-11-16
Version: DMF Platform v1.0.0
