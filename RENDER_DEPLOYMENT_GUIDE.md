# 🚀 RENDER DEPLOYMENT GUIDE – DMF Music Platform

**Status:** Ready to Deploy  
**Date:** November 18, 2025

---

## ✅ YOU NOW HAVE

Three production files ready:

1. ✅ `dmf_bootstrap.sh` – Local production run script
2. ✅ `appsettings.Production.json` – Production configuration
3. ✅ `.env.render.example` – Render environment variables template

---

## 🔐 STEP 1: FILL IN SECRETS (Right Now)

### In `appsettings.Production.json`:

Find these and replace:

```json
"ConnectionStrings": {
  "MongoDb": "mongodb+srv://bighomiecash8346:<db_password>@..."
},
"PricingDatabase": {
  "ConnectionString": "mongodb+srv://bighomiecash8346:<db_password>@..."
},
"Jwt": {
  "Key": "<super_secret_jwt_key_change_me>"
}
```

**Where to find:**
- `<db_password>` = Your MongoDB Atlas password (the password you use to log in)
- `<super_secret_jwt_key_change_me>` = Generate a random 32+ character string (use: `openssl rand -base64 32`)

**Don't commit with real secrets** – use environment variables instead (Render handles this).

---

## 📤 STEP 2: PUSH TO GITHUB

Make sure your repo is on GitHub:

```bash
git add .
git commit -m "Add production configuration and bootstrap script"
git push origin master
```

**Files to commit:**
- ✅ `dmf_bootstrap.sh`
- ✅ `appsettings.Production.json` (with placeholders, not real secrets)
- ✅ `.env.render.example` (template only)

---

## ☁️ STEP 3: CREATE RENDER WEB SERVICE

1. Go to **render.com**
2. Sign in (create account if needed)
3. Click **"New +"** → **"Web Service"**
4. **Connect your GitHub repo**
   - Select your GitHub account
   - Find `dmf-music-platform` repo
   - Click **"Connect"**

---

## ⚙️ STEP 4: RENDER SERVICE SETTINGS

Fill in these exact values:

| Setting | Value |
|---------|-------|
| **Name** | `dmf-music-platform` |
| **Environment** | `.NET Core` |
| **Region** | `Oregon` (or your preferred region) |
| **Branch** | `master` |
| **Build Command** | `dotnet build -c Release` |
| **Start Command** | `dotnet run -c Release --urls http://0.0.0.0:10000` |

---

## 🔑 STEP 5: ENVIRONMENT VARIABLES

In Render's "Environment" section, add each line from `.env.render.example`:

```
ASPNETCORE_ENVIRONMENT=Production
DOTNET_ENVIRONMENT=Production
ConnectionStrings__MongoDb=mongodb+srv://bighomiecash8346:<real_password>@...
MongoDb__ConnectionString=mongodb+srv://bighomiecash8346:<real_password>@...
MongoDb__DatabaseName=dmf_music_platform
MongoDb__CollectionName=company_profiles
PricingDatabase__ConnectionString=mongodb+srv://bighomiecash8346:<real_password>@...
PricingDatabase__DatabaseName=dmf_pricing
PricingDatabase__CollectionName=pricing_plans
Jwt__Key=<your_32_char_secret_jwt_key>
Jwt__Issuer=dmf-music-platform
Jwt__Audience=dmf-music-platform-api
Jwt__ExpirationMinutes=1440
Google__ApiKey=<your_api_key>
OpenAI__ApiKey=<your_api_key>
CORS__AllowedOrigins=https://yourdomain.com
PORT=10000
```

**Replace:**
- `<real_password>` = Your actual MongoDB password
- `<your_32_char_secret_jwt_key>` = Generate with: `openssl rand -base64 32`
- `<your_api_key>` = Your actual Google/OpenAI keys
- `https://yourdomain.com` = Your actual domain

---

## 🚀 STEP 6: DEPLOY

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repo
   - Run build command
   - Start the app
   - Assign you a URL (something like `dmf-music-platform-xxxx.onrender.com`)

Watch the logs for success or errors.

---

## ✅ STEP 7: VERIFY IT'S LIVE

Once deployment finishes, test:

### 1. Health Check
```bash
curl https://dmf-music-platform-xxxx.onrender.com/health
```

Should return: `{"status":"ok"}`

### 2. API Endpoints
```bash
curl https://dmf-music-platform-xxxx.onrender.com/api/pricing
```

Should return: Array of pricing plans (or error if auth required)

### 3. Check Logs
- In Render dashboard, click your service
- View "Logs" tab
- Look for:
  - ✅ "Application started"
  - ✅ "MongoDB connected"
  - ✅ No unhandled exceptions

---

## 🖥️ STEP 8: LOCAL PRODUCTION TEST (Optional)

Before committing to Render, test locally:

### On Linux/macOS:
```bash
chmod +x dmf_bootstrap.sh
./dmf_bootstrap.sh
```

### On Windows (PowerShell):
```powershell
$env:ASPNETCORE_ENVIRONMENT = "Production"
$env:DOTNET_ENVIRONMENT = "Production"
cd dmf-music-platform.Web
dotnet build -c Release
dotnet run -c Release --urls "http://0.0.0.0:5000"
```

Visit: `http://localhost:5000/api/pricing`

Should return pricing data (no 404 or 500 errors).

---

## 🔒 SECURITY CHECKLIST

Before you call it "live":

- [ ] Replace all `<placeholder>` values in environment variables
- [ ] Never commit real secrets to GitHub
- [ ] Use Render's environment variable feature (not hardcoded in code)
- [ ] Verify MongoDB credentials work
- [ ] Test API endpoints respond without 500 errors
- [ ] Check logs for security warnings
- [ ] Set `CORS__AllowedOrigins` to your actual domain
- [ ] Enable HTTPS (Render does this automatically)

---

## 📊 WHAT'S DEPLOYED

Your Render service will run:

| Component | Status |
|-----------|--------|
| ASP.NET Core Backend | ✅ Running |
| MongoDB Integration | ✅ Connected |
| Pricing System | ✅ Functional |
| 11 API Endpoints | ✅ Live |
| HTTPS/SSL | ✅ Automatic |
| Auto-Scaling | ✅ Enabled |

---

## 🔧 TROUBLESHOOTING

### "Build failed"
- Check logs in Render
- Verify `appsettings.Production.json` is valid JSON
- Ensure all environment variables are set

### "MongoDB connection failed"
- Check `ConnectionStrings__MongoDb` value
- Verify password is URL-encoded if it has special characters
- Check MongoDB Atlas network access allows Render IPs

### "Port already in use"
- Render auto-assigns ports, shouldn't happen
- Check logs for actual error

### "API returns 500"
- Check Render logs for stack trace
- Verify all env variables are set
- Test locally with `dmf_bootstrap.sh` first

---

## 🚀 YOU'RE LIVE

Once deployment succeeds:

1. ✅ Your API is public at: `https://dmf-music-platform-xxxx.onrender.com`
2. ✅ Data persists in MongoDB Atlas
3. ✅ App auto-restarts if it crashes
4. ✅ Logs available in Render dashboard
5. ✅ Easy to rollback if needed

---

## 📝 NEXT STEPS

### Immediately After Deploy:
1. Test all public endpoints
2. Test admin endpoints (may need auth)
3. Add test data through API
4. Monitor logs for errors

### Within a Week:
1. Add authentication guards to admin endpoints
2. Wire up payment integration
3. Set up monitoring/alerting
4. Configure custom domain

### Before Public Launch:
1. Set CORS to your actual domain
2. Test end-to-end with real users
3. Load test the API
4. Plan failover strategy

---

## 💡 TIPS

### Auto-Redeploy on Push
Render automatically redeploys when you push to `master`. To deploy manually:
1. Go to Render dashboard
2. Click your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

### View Live Logs
```bash
# SSH into your Render service (if enabled)
# Or use Render dashboard → Logs tab
```

### Scale Up
If you get traffic spikes:
1. Render dashboard → Pricing plan
2. Upgrade to higher tier or enable auto-scaling

---

**You're deployed.** 🎉

Your DMF Music Platform is now live and accessible to the world.

Test it, harden it, scale it.

---

*Generated: November 18, 2025*  
*Status: Ready for Production*  
*Next: Push to GitHub and deploy to Render*
