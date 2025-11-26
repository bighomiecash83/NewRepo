# 🚀 QUICK START - Copy & Paste Commands

## Step 1: Configure Your Environment (Edit This File First)

File: `dmf_bootstrap.sh`

Open it and set your real values:

```bash
# EDIT THESE 4 LINES WITH YOUR ACTUAL CREDENTIALS
export MONGO_CONNECTION_STRING="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/dmf_music_platform"
export DMF_APP_API_KEY="GENERATE_A_STRONG_KEY_HERE"
export OPENAI_API_KEY="sk-proj-YOUR_KEY_HERE"
export GEMINI_API_KEY="YOUR_GEMINI_KEY_HERE"
```

**How to generate a strong API key:**

```bash
# macOS / Linux
openssl rand -hex 32

# Windows PowerShell
[System.BitConverter]::ToString([System.Random]::new().GetBytes(32)) -replace '-',''
```

Example strong key output:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

---

## Step 2: Update `dmf_app_config.json`

File: `dmf_app_config.json`

Must match your backend setup:

```json
{
  "apiBaseUrl": "http://localhost:5000",
  "apiKey": "SAME_VALUE_AS_DMF_APP_API_KEY_IN_dmf_bootstrap.sh",
  "llmProviders": {
    "openai": {
      "enabled": true,
      "model": "gpt-4-mini"
    },
    "googleGemini": {
      "enabled": true,
      "model": "gemini-1.5-flash"
    }
  }
}
```

---

## Step 3: Run the Backend

Copy and paste this into your terminal:

```bash
# Navigate to repo root
cd /path/to/dmf-music-platform

# Make script executable (first time only)
chmod +x dmf_bootstrap.sh

# Run the bootstrap script
./dmf_bootstrap.sh
```

**Expected output:**
```
🔥 DMF-MUSIC-PLATFORM tight bootstrap in /path/to/dmf-music-platform
✅ Env vars loaded:
   MONGO_CONNECTION_STRING: mongodb+srv://...
   DMF_APP_API_KEY: a1b2c3d4e5...
   OPENAI_API_KEY: configured
   GEMINI_API_KEY: configured

➡️ Starting .NET backend...
⏳ Waiting for backend to start...

🔍 Checking health...
{
  "status": "OK",
  "mongo": "OK",
  "env": {
    "hasMongoUri": true,
    "hasAppKey": true,
    "hasOpenAiKey": true,
    "hasGeminiKey": true
  }
}

✅ Backend should now be live on http://localhost:5000

🔑 Use this API key for all requests:
   x-dmf-api-key: a1b2c3d4e5...

📝 Example health check:
   curl -H "x-dmf-api-key: a1b2c3d4e5..." http://localhost:5000/health

📝 Example API call (requires API key):
   curl -H "x-dmf-api-key: a1b2c3d4e5..." http://localhost:5000/api/catalog/health

🚀 Backend running. Press Ctrl+C to stop.
```

---

## Step 4: Test the API

Open a **new terminal** (keep the first one running backend):

### Test 1: Health Check (No API Key Required)

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status":"OK",
  "mongo":"OK",
  "env":{
    "hasMongoUri":true,
    "hasAppKey":true,
    "hasOpenAiKey":true,
    "hasGeminiKey":true
  }
}
```

If mongo shows `FAIL`: Your MongoDB connection string is wrong.

### Test 2: API Without Key (Should Fail)

```bash
curl http://localhost:5000/api/catalog/health
```

Expected response:
```json
{
  "error":"Invalid or missing API key"
}
```

HTTP Status: `401 Unauthorized` ✅

### Test 3: API With Correct Key (Should Work)

```bash
# Replace with YOUR actual API key
curl -H "x-dmf-api-key: YOUR_API_KEY_HERE" http://localhost:5000/api/catalog/health
```

Expected response:
- If endpoint exists: `200 OK` with data
- If endpoint doesn't exist: `404 Not Found`

Either way, you passed the API key wall! ✅

### Test 4: API With Wrong Key (Should Fail)

```bash
curl -H "x-dmf-api-key: wrong-key-here" http://localhost:5000/api/catalog/health
```

Expected response:
```json
{
  "error":"Invalid or missing API key"
}
```

HTTP Status: `401 Unauthorized` ✅

---

## Step 5: Test Frontend

In the `web` directory:

```bash
cd web

# Install dependencies
npm install

# Start dev server
npm run dev
```

The React frontend will:
1. Read `dmf_app_config.json` from repo root
2. Get `apiBaseUrl` and `apiKey`
3. Make requests to backend with header: `x-dmf-api-key: YOUR_API_KEY`
4. Automatically authenticated! ✅

---

## Troubleshooting

### Issue: "DMF_APP_API_KEY is not configured"

**Fix:**
```bash
# Check if env var is set
echo $DMF_APP_API_KEY

# Should print your key

# If empty, edit dmf_bootstrap.sh again
nano dmf_bootstrap.sh

# Then run again
./dmf_bootstrap.sh
```

### Issue: Health shows `mongo: "FAIL"`

**Fix:**
```bash
# 1. Check your connection string
grep MONGO_CONNECTION_STRING dmf_bootstrap.sh

# 2. Test it directly (if you have mongosh installed)
mongosh "mongodb+srv://your_connection_string"

# 3. Common issues:
#    - Wrong username/password
#    - Wrong cluster name
#    - MongoDB service not running (Atlas must be running)
#    - IP whitelist not set (allow 0.0.0.0/0 in Atlas)
```

### Issue: Frontend can't connect

**Fix:**
```bash
# 1. Check config file
cat dmf_app_config.json

# 2. Verify values match:
#    - apiBaseUrl matches where backend is running
#    - apiKey matches DMF_APP_API_KEY in dmf_bootstrap.sh

# 3. Check browser console for errors
#    Open DevTools → Console tab → look for errors
```

### Issue: Backend won't start

**Fix:**
```bash
# 1. Check if port 5000 is already in use
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# 2. Kill the process using it
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# 3. Try again
./dmf_bootstrap.sh
```

---

## Production Deployment Checklist

- [ ] Generate strong API key using `openssl rand -hex 32`
- [ ] Update `dmf_app_config.json` with production backend URL
- [ ] Deploy backend to Cloud Run / Render / Railway
- [ ] Set `DMF_APP_API_KEY` env var in cloud platform
- [ ] Set `MONGO_CONNECTION_STRING` env var in cloud platform
- [ ] Deploy React frontend to Vercel / Netlify
- [ ] Test health endpoint: `curl https://your-backend.com/health`
- [ ] Test with API key: `curl -H "x-dmf-api-key: YOUR_KEY" https://your-backend.com/api/...`
- [ ] Monitor error logs for `401 Unauthorized` (shouldn't happen if keys match)

---

## Reference: File Locations

```
dmf-music-platform/
├── dmf_bootstrap.sh                    ← Edit this with your credentials
├── dmf_app_config.json                 ← Frontend reads this
├── Program.cs                          ← API key middleware (already added)
├── Controllers/
│   └── HealthController.cs             ← Health endpoint (already added)
└── web/
    └── src/
        └── lib/
            └── api.ts                  ← Frontend client (already updated)
```

---

## Summary

You now have a **production-grade API key wall** with:

1. ✅ Single `x-dmf-api-key` header authentication
2. ✅ `/health` endpoint for debugging
3. ✅ Central `dmf_app_config.json` for all frontends
4. ✅ One-shot `dmf_bootstrap.sh` startup
5. ✅ Axios interceptor auto-injects key on every request

**Status**: Ready for production. Run `./dmf_bootstrap.sh` now.
