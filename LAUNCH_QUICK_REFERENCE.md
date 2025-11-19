# 🚀 PRODUCTION LAUNCH – QUICK REFERENCE CARD

**Everything you need to go live, right now.**

---

## 📋 THREE FILES JUST CREATED

```
✅ dmf_bootstrap.sh
   └─ Local production run (one-shot script)

✅ appsettings.Production.json  
   └─ Production configuration with placeholders

✅ .env.render.example
   └─ Render environment variables template

✅ RENDER_DEPLOYMENT_GUIDE.md
   └─ Step-by-step deployment instructions
```

---

## 🔐 SECRETS TO FILL IN (Before Pushing)

### What to Find:
- `<db_password>` → Your MongoDB Atlas password
- `<super_secret_jwt_key_change_me>` → Generate random 32+ chars
- `<google_api_key>` → Your Google API key
- `<openai_api_key>` → Your OpenAI API key

### Where:
- `appsettings.Production.json` – In the Web project root
- `.env.render.example` – In the repo root

### Generate JWT Key:
```bash
openssl rand -base64 32
```

---

## 📤 DEPLOY FLOW (3 Steps)

### 1. Fill Secrets
```
appsettings.Production.json
└─ Replace all <placeholder> values
```

### 2. Push to GitHub
```bash
git add .
git commit -m "Add production config"
git push origin master
```

### 3. Deploy to Render
- Go to render.com
- New Web Service
- Connect repo
- Set env vars (from `.env.render.example`)
- Deploy

---

## ⚙️ RENDER SERVICE SETTINGS (Copy/Paste)

| Setting | Value |
|---------|-------|
| **Runtime** | `.NET Core` |
| **Build Command** | `dotnet build -c Release` |
| **Start Command** | `dotnet run -c Release --urls http://0.0.0.0:10000` |
| **Environment** | `ASPNETCORE_ENVIRONMENT=Production` |

---

## 🖥️ LOCAL PRODUCTION TEST (Before Render)

### Linux/macOS:
```bash
chmod +x dmf_bootstrap.sh
./dmf_bootstrap.sh
```

### Windows (PowerShell):
```powershell
$env:ASPNETCORE_ENVIRONMENT = "Production"
cd dmf-music-platform.Web
dotnet build -c Release
dotnet run -c Release --urls "http://0.0.0.0:5000"
```

Visit: `http://localhost:5000/api/pricing`

---

## ✅ VERIFICATION CHECKLIST

After deploying to Render:

- [ ] Build succeeded in Render logs
- [ ] App started without errors
- [ ] Health endpoint responds: `/health`
- [ ] API endpoint responds: `/api/pricing`
- [ ] MongoDB connected (check logs)
- [ ] No 500 errors in response
- [ ] HTTPS working (automatic)

---

## 🔍 QUICK TESTS

### Health Check:
```bash
curl https://your-url.onrender.com/health
```

### API Endpoints:
```bash
curl https://your-url.onrender.com/api/pricing
curl https://your-url.onrender.com/api/pricing/categories
```

### Logs:
1. Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Look for "Application started" ✅

---

## 📝 ENVIRONMENT VARIABLES (Full List)

Required for Render:

```
ASPNETCORE_ENVIRONMENT=Production
DOTNET_ENVIRONMENT=Production
ConnectionStrings__MongoDb=<your_connection_string>
MongoDb__ConnectionString=<your_connection_string>
MongoDb__DatabaseName=dmf_music_platform
PricingDatabase__ConnectionString=<your_connection_string>
PricingDatabase__DatabaseName=dmf_pricing
Jwt__Key=<your_32_char_key>
Jwt__Issuer=dmf-music-platform
Jwt__Audience=dmf-music-platform-api
Google__ApiKey=<your_key>
OpenAI__ApiKey=<your_key>
CORS__AllowedOrigins=https://yourdomain.com
PORT=10000
```

---

## 🆘 QUICK TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| Build fails | Check `appsettings.Production.json` syntax |
| MongoDB fails | Verify connection string + password correct |
| 500 error | Check Render logs for stack trace |
| Port error | Render auto-assigns, shouldn't happen |
| CORS error | Update `CORS__AllowedOrigins` in env vars |

---

## 🎯 NEXT IMMEDIATE ACTIONS

### Right Now:
1. [ ] Fill in secrets in `appsettings.Production.json`
2. [ ] Replace values in `.env.render.example`
3. [ ] Push to GitHub

### Then:
1. [ ] Go to render.com
2. [ ] Create Web Service
3. [ ] Deploy
4. [ ] Test endpoints

### After Deploy:
1. [ ] Verify health endpoint
2. [ ] Test API endpoints
3. [ ] Check MongoDB connection
4. [ ] Monitor logs

---

## 📞 HELP

- Full guide: `RENDER_DEPLOYMENT_GUIDE.md`
- Architecture: `PRICING_SYSTEM_COMPLETE_ARCHITECTURE.md`
- API docs: `PRICING_API_REFERENCE.md`

---

## 🚀 YOU'RE READY

✅ Config files created  
✅ Deployment guide written  
✅ Bootstrap script ready  
✅ No blockers  

**Next: Fill in secrets, push to GitHub, deploy to Render.**

---

**Time to Live:** ~15 minutes (after filling secrets)

**Status:** Ready to Deploy ✅
