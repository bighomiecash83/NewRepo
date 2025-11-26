# DMF Music Platform - API Key Wall & Configuration Setup

## Overview

Your backend is now **locked behind a single API key wall** with a centralized config system. This makes it behave like a real product:

- ✅ Single `x-dmf-api-key` header protects all endpoints (except `/health`)
- ✅ `/health` endpoint checks Mongo + env vars in one call
- ✅ Central `dmf_app_config.json` for all frontends (no hard-coded URLs)
- ✅ One-shot `dmf_bootstrap.sh` script starts everything consistently
- ✅ All frontends auto-inject the API key via axios interceptor

---

## Quick Start

### 1. Set Your Environment Variables

Edit `dmf_bootstrap.sh` with your real credentials:

```bash
export MONGO_CONNECTION_STRING="mongodb+srv://username:password@cluster.mongodb.net/dmf_music_platform"
export DMF_APP_API_KEY="your-secret-app-key-here"
export OPENAI_API_KEY="sk-..."
export GEMINI_API_KEY="..."
```

### 2. Run the Bootstrap Script

```bash
chmod +x dmf_bootstrap.sh
./dmf_bootstrap.sh
```

This will:
- Load all env vars
- Start the .NET backend on `http://localhost:5000`
- Print the health check endpoint
- Keep the backend running in the foreground

### 3. Test the Health Endpoint

In another terminal:

```bash
# No API key required for /health
curl http://localhost:5000/health
```

Expected response:
```json
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
```

### 4. Test API Key Wall

Try calling any endpoint WITHOUT the key:

```bash
curl http://localhost:5000/api/catalog/health
```

Expected response (401 Unauthorized):
```json
{
  "error": "Invalid or missing API key"
}
```

Call WITH the key:

```bash
curl -H "x-dmf-api-key: your-secret-app-key-here" http://localhost:5000/api/catalog/health
```

This should work (if the endpoint exists).

---

## Configuration Files

### `dmf_app_config.json`

Central config that **all frontends** (React, Google AI Studio, Bolt, etc.) read:

```json
{
  "apiBaseUrl": "http://localhost:5000",
  "apiKey": "CHANGE_ME_DMF_APP_KEY",
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

**For production**, just swap:
- `apiBaseUrl` → your Cloud Run / Render URL
- `apiKey` → same value as `DMF_APP_API_KEY` env var

### `dmf_bootstrap.sh`

Bash script that:
1. Sets all env vars in one place
2. Starts the backend
3. Waits for it to boot
4. Prints the health check curl command

You can run it on any machine (dev, CI/CD, Docker, etc.) and get consistent startup.

---

## Backend Changes

### `Program.cs` - API Key Middleware

Added at startup:

```csharp
// 🔐 Pull the required API key from configuration/env
var requiredApiKey =
    app.Configuration["DMF_APP_API_KEY"] ??
    Environment.GetEnvironmentVariable("DMF_APP_API_KEY");

if (string.IsNullOrWhiteSpace(requiredApiKey))
{
    throw new InvalidOperationException(
        "DMF_APP_API_KEY is not configured. Set it as an environment variable.");
}

// 🔐 Global API key middleware
app.Use(async (context, next) =>
{
    // Let health check through without API key so you can debug
    if (context.Request.Path.StartsWithSegments("/health"))
    {
        await next();
        return;
    }

    if (!context.Request.Headers.TryGetValue("x-dmf-api-key", out var providedKey) ||
        !string.Equals(providedKey, requiredApiKey, StringComparison.Ordinal))
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsJsonAsync(new
        {
            error = "Invalid or missing API key"
        });
        return;
    }

    await next();
});
```

**Impact**: Every endpoint (except `/health`) now requires the `x-dmf-api-key` header.

### `Controllers/HealthController.cs` - Health Check Endpoint

New endpoint at `GET /health` that validates:

```json
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
```

Use this to instantly see if your backend is wired correctly.

---

## Frontend Changes

### `web/src/lib/api.ts`

Updated to use the config JSON:

```typescript
import appConfig from '../../dmf_app_config.json'

const API_BASE = appConfig.apiBaseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const DMF_API_KEY = appConfig.apiKey

const instance = axios.create({
  baseURL: API_BASE,
  headers: {
    'x-dmf-api-key': DMF_API_KEY,
  },
})
```

**Impact**: 
- All API calls automatically include `x-dmf-api-key`
- No more hard-coded URLs or ports
- Change `dmf_app_config.json` and all frontends see the new backend URL

---

## Production Deployment

### Step 1: Update `dmf_app_config.json`

```json
{
  "apiBaseUrl": "https://your-cloud-run-url.com",
  "apiKey": "CHANGE_ME_DMF_APP_KEY",
  ...
}
```

### Step 2: Set Backend Env Vars

On your Cloud Run / Render service, set:

```
DMF_APP_API_KEY=same-as-above
MONGO_CONNECTION_STRING=your-prod-mongo
OPENAI_API_KEY=...
GEMINI_API_KEY=...
```

### Step 3: Deploy Frontend

The React app (and any other frontend) will automatically:
- Read the new `apiBaseUrl`
- Use the new API key
- Point at your prod backend

No code changes needed.

---

## API Key Management

### Generating a Strong Key

```bash
# macOS/Linux
openssl rand -hex 32

# Windows PowerShell
[System.BitConverter]::ToString([System.Text.Encoding]::UTF8.GetBytes((Get-Random).ToString())) -replace '-',''
```

### Rotating Keys

1. Generate a new key
2. Update `DMF_APP_API_KEY` in:
   - `dmf_bootstrap.sh` (local dev)
   - Cloud Run / Render env vars (production)
   - `dmf_app_config.json` (frontends)
3. Redeploy frontend
4. Redeploy backend with new key

---

## Troubleshooting

### `/health` returns `mongo: "FAIL"`

**Problem**: MongoDB connection string is wrong or MongoDB is down.

**Fix**:
1. Check `MONGO_CONNECTION_STRING` in `dmf_bootstrap.sh`
2. Verify MongoDB is running (Atlas or local)
3. Test connection manually:
   ```bash
   mongosh "your-connection-string"
   ```

### `/health` returns `env.hasAppKey: false`

**Problem**: `DMF_APP_API_KEY` is not set.

**Fix**:
1. Check `dmf_bootstrap.sh` — is `DMF_APP_API_KEY` set?
2. Run: `echo $DMF_APP_API_KEY` to verify it's in your shell
3. Re-run `dmf_bootstrap.sh`

### API returns `401 Unauthorized`

**Problem**: API key header is missing or wrong.

**Fix**:
1. Make sure you're sending: `x-dmf-api-key: <your-key>`
2. Verify the key matches `DMF_APP_API_KEY` in your backend
3. Check capitalization: it's lowercase `x-dmf-api-key`

### React frontend can't connect to backend

**Problem**: `dmf_app_config.json` has wrong `apiBaseUrl` or wrong API key.

**Fix**:
1. Check `dmf_app_config.json` — does `apiBaseUrl` match where backend is running?
2. Check `apiKey` — does it match `DMF_APP_API_KEY`?
3. Open browser DevTools → Network tab → check the request headers
4. You should see `x-dmf-api-key` in every request

---

## Next Steps

Once this is working:

1. **Add rate limiting** to the API key middleware to prevent brute force
2. **Add request logging** to see who's calling what
3. **Rotate keys regularly** (every 90 days)
4. **Add key versioning** if you need multiple keys per environment

---

## Files Added/Modified

| File | Change | Purpose |
|------|--------|---------|
| `Program.cs` | Added API key middleware + IMongoClient registration | Lock all endpoints behind API key |
| `Controllers/HealthController.cs` | **New** | Health check with Mongo + env validation |
| `dmf_app_config.json` | **New** | Central config for all frontends |
| `dmf_bootstrap.sh` | **New** | One-shot startup script |
| `web/src/lib/api.ts` | Updated | Use config JSON + auto-inject API key |

---

**Status**: ✅ API key wall is live. Your backend now acts like a real product with a single authentication mechanism.

Run `./dmf_bootstrap.sh` to test it.
