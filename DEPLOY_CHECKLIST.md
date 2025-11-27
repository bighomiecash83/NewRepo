# 🚀 Backend Deployment Checklist

## ✅ Ready to Deploy

- [x] Dockerfile exists and is correct
- [x] Program.cs has `/health` endpoint
- [x] API key middleware is in place
- [x] MongoDB connection configured
- [x] Code committed to git

## 📋 Deploy Now

**Prerequisites:**
- [ ] gcloud CLI installed: `gcloud --version`
- [ ] Logged in to GCP: `gcloud auth login`
- [ ] Project set: `gcloud config set project dmf-music-platform`

**Run these commands from project root:**

```bash
# 1. Build & push Docker image (3 min)
gcloud builds submit \
  --tag gcr.io/dmf-music-platform/dmf-music-backend \
  --timeout=1800s

# 2. Deploy to Cloud Run (2 min)
gcloud run deploy dmf-music-backend \
  --image gcr.io/dmf-music-platform/dmf-music-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 3600 \
  --set-env-vars ASPNETCORE_ENVIRONMENT=Production

# 3. Test (copy Service URL from output above)
curl https://dmf-music-backend-XXXX-uc.a.run.app/health
```

**Expected output on step 3:**
```json
{
  "status": "OK",
  "mongo": "OK",
  "env": {...}
}
```

## 📝 After Deployment

1. Copy the **Service URL** from Cloud Run output
2. Paste it here in next message
3. I'll add it to Lovable + create frontend API client
4. Test: Lovable → Backend → MongoDB ✅

