# Deploy .NET Backend to Google Cloud Run

**Project:** dmf-music-platform  
**Region:** us-central1  
**Result:** `https://dmf-music-backend-XXXX-uc.a.run.app`

---

## Prerequisites

```bash
# Install Google Cloud CLI (gcloud)
# https://cloud.google.com/sdk/docs/install

# Verify auth
gcloud auth login
gcloud config set project dmf-music-platform
gcloud config list  # Should show your project
```

---

## Deploy Steps

**From your .NET project root** (where `dmf-music-platform.Web.Api.csproj` lives):

### 1. Build & Push Docker Image

```bash
gcloud builds submit \
  --tag gcr.io/dmf-music-platform/dmf-music-backend \
  --timeout=1800s
```

This will:
- Build your .NET app
- Create Docker image
- Push to Google Container Registry
- **Takes 2-3 minutes**

Expected output: `Images successfully built and pushed`

### 2. Deploy to Cloud Run

```bash
gcloud run deploy dmf-music-backend \
  --image gcr.io/dmf-music-platform/dmf-music-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 3600 \
  --set-env-vars ASPNETCORE_ENVIRONMENT=Production
```

This will:
- Deploy the image to Cloud Run
- Make it publicly accessible
- Assign a permanent HTTPS URL
- **Takes 1-2 minutes**

Expected output:
```
Service URL: https://dmf-music-backend-XXXXXXXX-uc.a.run.app
Status: ✓
```

---

## 3. Test It Works

Once deployment finishes, copy the Service URL and test:

```bash
# Replace XXXX with your actual service ID
curl https://dmf-music-backend-XXXX-uc.a.run.app/health
```

Should return:
```json
{
  "status": "OK",
  "mongo": "OK",
  "env": {...}
}
```

If you get 200 → **Backend is live!** ✅

---

## 4. Save This URL

Copy the exact **Service URL** (looks like `https://dmf-music-backend-XXXXXXXX-uc.a.run.app`)

You'll add it to Lovable as:
```env
NEXT_PUBLIC_API_BASE_URL=https://dmf-music-backend-XXXXXXXX-uc.a.run.app
```

---

## If It Fails

| Error | Fix |
|-------|-----|
| `Authentication required` | Run `gcloud auth login` |
| `Project not set` | Run `gcloud config set project dmf-music-platform` |
| `Dockerfile not found` | Create Dockerfile in project root |
| `Build timed out` | Increase `--timeout` value |
| `Container won't start` | Check Cloud Run logs: `gcloud run logs dmf-music-backend --limit 50` |

---

## Next Steps

1. Run the deploy commands above
2. Paste the **Service URL** here
3. I'll add it to Lovable env vars + create the frontend API client
4. Test end-to-end: Lovable → Backend → MongoDB

---

