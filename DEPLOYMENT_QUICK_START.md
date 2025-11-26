# DMF Deployment Quick Reference

## 🚀 TL;DR Deployment (5 Steps, ~30 minutes total)

### Step 1: Verify Build ✅
```bash
cd web
npm run build
# Expected: "✔ Compiled successfully" with no errors
cd ..
```

### Step 2: Setup GCP (15 min)
```bash
bash scripts/setup-production-environment.sh
# Prompts for:
# - Project ID: dmf-music-platform-5f1a5
# - MongoDB URI (from MongoDB Atlas)
# - OpenAI API Key
# Output: Save all values displayed
```

### Step 3: Configure GitHub Secrets (10 min)
```bash
gh secret set GCP_PROJECT_ID -b "dmf-music-platform-5f1a5"
gh secret set WORKLOAD_IDENTITY_PROVIDER -b "projects/XXX/locations/global/workloadIdentityPools/github-pool/providers/github"
gh secret set SERVICE_ACCOUNT -b "github-actions-sa@dmf-music-platform-5f1a5.iam.gserviceaccount.com"

firebase login:ci  # Copy output
gh secret set FIREBASE_TOKEN -b "PASTE_TOKEN_HERE"

gh secret set SLACK_WEBHOOK -b "https://hooks.slack.com/services/..." # optional
gh secret set MODEL_BUDGET_LIMIT -b "500"
```

### Step 4: Deploy (2 min)
```bash
git add .
git commit -m "Deploy portless stack"
git push origin main
# GitHub Actions starts automatically
# Wait 3-5 minutes for deployment to complete
```

### Step 5: Verify ✅
```bash
# Test frontend
curl https://dmf-music-platform-5f1a5.web.app

# Test API
curl https://dmf-music-platform-5f1a5.web.app/api/health

# Expected: {"status":"healthy",...}
```

---

## 📋 Critical Resources

| Resource | Link |
|----------|------|
| **GitHub Actions** | https://github.com/YOUR_ORG/dmf-music-platform/actions |
| **Firebase Console** | https://console.firebase.google.com/project/dmf-music-platform-5f1a5 |
| **Cloud Run** | https://console.cloud.google.com/run?project=dmf-music-platform-5f1a5 |
| **Cloud Functions** | https://console.cloud.google.com/functions?project=dmf-music-platform-5f1a5 |
| **Pub/Sub Topics** | https://console.cloud.google.com/cloudpubsub?project=dmf-music-platform-5f1a5 |
| **Cloud Logs** | https://console.cloud.google.com/logs?project=dmf-music-platform-5f1a5 |

---

## 🔍 Monitoring Commands

```bash
# Check deployment status
firebase hosting:channel:list

# View Cloud Functions logs
gcloud functions logs read api --limit 50

# View Cloud Run logs
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=streamgod-worker" \
  --limit 20

# Check Pub/Sub queue depth
gcloud pubsub subscriptions describe releases-sub --format='value(backlog_bytes)'
gcloud pubsub subscriptions describe bots-sub --format='value(backlog_bytes)'

# Test endpoints
curl https://dmf-music-platform-5f1a5.web.app/api/health
```

---

## 🚨 Emergency Procedures

### **Rollback to Previous Version**
```bash
git revert HEAD
git push origin main
# GitHub Actions will redeploy with previous code
```

### **Stop Cloud Run Worker**
```bash
gcloud run services delete streamgod-worker --region=us-central1 --quiet
# Messages will accumulate in Pub/Sub - redeploy when ready
```

---

## 📊 Costs Summary

| Load | Monthly Cost |
|------|---|
| Light (dev) | $50-100 |
| Medium (staging) | $150-250 |
| Heavy (production) | $300-500 |

**Set budget alert at $400** to stay safe.

---

## 🎯 Pre-Deployment Checklist

- [ ] `npm run build` passes in `web/`
- [ ] All `.env.local` files excluded from git
- [ ] GitHub Actions secrets are configured (7 total)
- [ ] GCP Project created: dmf-music-platform-5f1a5
- [ ] MongoDB Atlas configured
- [ ] Firebase project initialized

**Once all checked ✅, deploy with `git push origin main`**

---

## 📞 Useful Commands

```bash
# Deploy components
firebase deploy --only functions,hosting

# View service status
gcloud run services list
gcloud functions describe api

# Check costs
gcloud billing accounts list

# View logs
gcloud logging read --limit 100 --format=json

# Test API
curl https://dmf-music-platform-5f1a5.web.app/api/health
```

---

## 🎉 Success Indicators

✅ All complete when:
1. GitHub Actions workflow shows green
2. Frontend loads at https://dmf-music-platform-5f1a5.web.app/
3. API responds to health check
4. Cloud Run worker status is "Ready"
5. No errors in Cloud Logs (past 5 min)

**Then your platform is live!** 🚀
