# DMF Portless Stack - Deployment Guide

Complete guide to deploy the DMF Music Platform to Google Cloud using a portless, serverless architecture.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet/Users                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Firebase Hosting    │
          │  (Frontend + CDN)    │
          └────────┬─────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────────┐   ┌──────────────────┐
│  Cloud Functions │   │  Cloud Functions │
│   (API Routes)   │   │  (Webhooks)      │
└────────┬─────────┘   └──────────────────┘
         │
    ┌────▼────────────────────┐
    │   Firestore (Data)      │
    │   - Artists             │
    │   - Releases            │
    │   - Audit Logs          │
    └─────────────────────────┘

┌──────────────────────────────────┐
│    Pub/Sub (Async Queues)        │
│  - releases-queue                │
│  - bots-commands                 │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Cloud Run (Worker Services)     │
│  - streamgod-worker (Private)    │
│  - Processes Pub/Sub messages    │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  MongoDB Atlas (Private VPC)     │
│  - Bot state                     │
│  - Analytics                     │
│  - Audit logs                    │
└──────────────────────────────────┘
```

## Pre-Deployment Checklist

### ✅ Prerequisites

- [ ] Google Cloud Account with billing enabled
- [ ] Firebase Project created (dmf-music-platform-5f1a5)
- [ ] MongoDB Atlas cluster set up
- [ ] GitHub repository (with admin access)
- [ ] `gcloud` CLI installed
- [ ] `firebase` CLI installed
- [ ] `docker` CLI installed (for building images locally)
- [ ] Node.js 20+ installed

### ✅ Code Verification

- [ ] `npm run build` passes in `web/` directory
- [ ] No TypeScript errors in `Backend/functions/`
- [ ] `streamgod/` directory has `worker.js`, `package.json`, `Dockerfile`
- [ ] All environment variables defined in `.env.local` (development only)
- [ ] `.gitignore` excludes `.env.local` and Firebase secrets

### ✅ Google Cloud Setup

- [ ] GCP Project created: `dmf-music-platform-5f1a5`
- [ ] Firestore enabled (Native mode)
- [ ] Firebase project initialized
- [ ] Billing account linked

### ✅ GitHub Actions Secrets

These must be added to GitHub (Settings → Secrets and Variables → Actions):

```
GCP_PROJECT_ID = dmf-music-platform-5f1a5
WORKLOAD_IDENTITY_PROVIDER = projects/XXX/locations/global/workloadIdentityPools/github-pool/providers/github
SERVICE_ACCOUNT = github-actions-sa@dmf-music-platform-5f1a5.iam.gserviceaccount.com
FIREBASE_TOKEN = <output from 'firebase login:ci'>
SLACK_WEBHOOK = https://hooks.slack.com/services/... (optional)
MODEL_BUDGET_LIMIT = 500
```

## Step-by-Step Deployment

### Phase 1: Cloud Environment Setup (One-Time)

```bash
# 1. Authenticate with Google Cloud
gcloud auth login
gcloud config set project dmf-music-platform-5f1a5

# 2. Run the production environment setup script
cd scripts
bash setup-production-environment.sh

# Follow the prompts to:
# - Create service accounts
# - Set up Pub/Sub topics and subscriptions
# - Create Cloud Secrets for MongoDB URI, API keys
# - Configure IAM roles
# - Create Artifact Registry repository
# - Set up VPC Connector
# - Create Workload Identity Provider for GitHub Actions

# Output: Save the displayed configuration values
```

### Phase 2: Firebase CLI Configuration

```bash
# 1. Get Firebase token for CI/CD
firebase login:ci

# 2. Copy the output token and add to GitHub Secrets as FIREBASE_TOKEN

# 3. Verify Firebase CLI configuration
firebase projects:list
firebase projects:addfirebaseapp
```

### Phase 3: MongoDB Atlas Configuration

```bash
# 1. Log into MongoDB Atlas console
# https://cloud.mongodb.com

# 2. Create VPC peering or Private Endpoint:
#    - Network Access → Private Endpoints
#    - Create endpoint for GCP us-central1
#    - Note the service attachment name

# 3. Add Cloud Functions/Run service accounts to IP whitelist:
#    - Network Access → IP Whitelist
#    - Add: 0.0.0.0/0 (Cloud Run uses dynamic IPs, use Private Endpoint instead)

# 4. Get connection string:
#    - Databases → dmf_analytics → Connect
#    - Driver: Node.js
#    - Copy connection string
#    - Add to Google Cloud Secrets: gcloud secrets create MONGO_URI --data-file=-
```

### Phase 4: GitHub Actions Secrets Configuration

```bash
# Add to GitHub repository: Settings → Secrets and Variables → Actions

# Execute this script to add all secrets at once:
#!/bin/bash
gh secret set GCP_PROJECT_ID -b "dmf-music-platform-5f1a5"
gh secret set WORKLOAD_IDENTITY_PROVIDER -b "projects/XXX/locations/global/workloadIdentityPools/github-pool/providers/github"
gh secret set SERVICE_ACCOUNT -b "github-actions-sa@dmf-music-platform-5f1a5.iam.gserviceaccount.com"
gh secret set FIREBASE_TOKEN -b "$(firebase login:ci)"
gh secret set MODEL_BUDGET_LIMIT -b "500"

# Optional for notifications:
gh secret set SLACK_WEBHOOK -b "https://hooks.slack.com/services/..."
```

### Phase 5: Initial Deployment

```bash
# 1. Clone repository and create feature branch
git clone https://github.com/YOUR_ORG/dmf-music-platform.git
cd dmf-music-platform
git checkout -b feature/production-deploy

# 2. Verify all files are in place
ls -la .github/workflows/deploy-portless.yml  # GitHub Actions
ls -la streamgod/                             # Cloud Run worker
ls -la Backend/functions/                     # Cloud Functions
ls -la web/.next/                             # Built frontend (should exist after build)

# 3. Push to main to trigger workflow
git push origin main

# 4. Monitor deployment in GitHub Actions
# https://github.com/YOUR_ORG/dmf-music-platform/actions

# 5. View Cloud Console
# Firebase: https://console.firebase.google.com/project/dmf-music-platform-5f1a5
# Cloud Run: https://console.cloud.google.com/run?project=dmf-music-platform-5f1a5
# Cloud Functions: https://console.cloud.google.com/functions?project=dmf-music-platform-5f1a5
```

### Phase 6: Verify Deployment

```bash
# 1. Check Firebase Hosting deployment
firebase hosting:channel:list

# 2. Test frontend
curl https://dmf-music-platform-5f1a5.web.app

# 3. Test API health check
curl https://dmf-music-platform-5f1a5.web.app/api/health

# 4. Verify Pub/Sub topics exist
gcloud pubsub topics list | grep releases-queue
gcloud pubsub topics list | grep bots-commands

# 5. Check Cloud Run worker status
gcloud run services describe streamgod-worker --region us-central1 --format='value(status.conditions[0].message)'

# 6. View Cloud Logs
gcloud functions logs read api --limit 100
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=streamgod-worker" --limit 50
```

## Environment Variables Configuration

### Frontend (Web) - `.env.local` for development

```bash
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dmf-music-platform-5f1a5
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBS92OnLQd6HN8b4MyJGFDAxT7Qk2v2psA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dmf-music-platform-5f1a5.firebaseapp.com
NEXT_PUBLIC_API_URL=http://localhost:5001  # Local dev only
```

### Production - Firebase Hosting automatically passes these to Functions

```bash
# Backend/functions/.env.production
FIREBASE_PROJECT_ID=dmf-music-platform-5f1a5
NODE_ENV=production
# Other secrets retrieved from Google Cloud Secret Manager
```

### Cloud Run Worker - Set via GitHub Actions

```bash
export FIREBASE_PROJECT_ID=dmf-music-platform-5f1a5
export MONGO_URI=$(gcloud secrets versions access latest --secret=MONGO_URI)
export JWT_SECRET=$(gcloud secrets versions access latest --secret=JWT_SECRET)
export OPENAI_API_KEY=$(gcloud secrets versions access latest --secret=OPENAI_API_KEY)
```

## Post-Deployment Tasks

### 1. Enable Firestore Security Rules

```bash
# Update firebase.json to deploy rules
firebase deploy --only firestore:rules
```

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Artists collection - authenticated users can read, creators can write
    match /artists/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.claims.isArtist == true;
      allow update, delete: if request.auth != null && resource.data.createdBy == request.auth.uid;
    }
    
    // Releases collection
    match /releases/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.claims.isArtist == true;
      allow update, delete: if request.auth != null && resource.data.createdBy == request.auth.uid;
    }
    
    // Audit logs - read-only for admins
    match /audit_logs/{document=**} {
      allow read: if request.auth != null && request.auth.claims.admin == true;
    }
  }
}
```

### 2. Monitor Cloud Costs

```bash
# Set up budget alerts
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT \
  --display-name="DMF Monthly Budget" \
  --budget-amount=500 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90

# View spending dashboard
# https://console.cloud.google.com/billing/projects/dmf-music-platform-5f1a5
```

### 3. Configure Cloud Logging

```bash
# Create log sink for important events
gcloud logging sinks create dmf-error-sink \
  logging.googleapis.com/projects/dmf-music-platform-5f1a5/logs/error-events \
  --log-filter='severity>=ERROR'
```

### 4. Set up Cloud Monitoring Alerts

```bash
# Alert on Cloud Functions errors
gcloud alpha monitoring policies create \
  --notification-channels=YOUR_CHANNEL_ID \
  --display-name="Cloud Functions Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05
```

### 5. Enable Application Performance Monitoring

```bash
# Add Cloud Trace integration to track latency
firebase deploy --only extensions:enable-cloud-trace

# View traces in Cloud Console
# https://console.cloud.google.com/traces?project=dmf-music-platform-5f1a5
```

## Troubleshooting

### GitHub Actions Workflow Fails

1. **"Resource already exists"**
   - Normal on first deployment run
   - Check Cloud Console to verify resources were created

2. **"Permission denied"**
   - Verify Workload Identity Provider is configured
   - Check GitHub Secrets are set correctly
   - Run: `gcloud iam service-accounts get-iam-policy github-actions-sa@dmf-music-platform-5f1a5.iam.gserviceaccount.com`

3. **"Cloud Run deployment timeout"**
   - Check Docker image builds locally: `docker build -f streamgod/Dockerfile -t test .`
   - Verify Artifact Registry has space (check quota)

### Frontend Not Loading

1. **Blank page in browser**
   - Check Firebase Hosting deployment: `firebase hosting:channel:list`
   - Verify rewrites in firebase.json: `/api/**` should route to Functions

2. **API calls return 403**
   - Check Cloud Functions IAM: only Firebase Functions service account should be public
   - Verify frontend token interceptor is working

### Worker Not Processing Messages

1. **Pub/Sub messages stuck in subscription**
   - Check Cloud Run service is running: `gcloud run services list`
   - View Cloud Logs: `gcloud logging read --limit 50 | grep streamgod-worker`

2. **"MongoDB connection refused"**
   - Verify VPC Connector is bound to Cloud Run
   - Check MongoDB Atlas IP whitelist includes VPC CIDR range
   - Test connectivity: `gcloud run deploy test-mongo --image=busybox --vpc-connector=dmf-connector -- sleep 300`

## Rollback Procedure

```bash
# If deployment has critical issues:

# 1. Revert to previous Hosting version
firebase hosting:channels:deploy CHANNEL_NAME

# 2. Or redeploy from previous git commit
git checkout PREVIOUS_COMMIT
firebase deploy --only hosting

# 3. Check and revert Cloud Functions
gcloud functions list --project=dmf-music-platform-5f1a5
gcloud functions delete api --project=dmf-music-platform-5f1a5 --region=us-central1 --quiet
# Redeploy: firebase deploy --only functions

# 4. Verify Pub/Sub messages are not lost
gcloud pubsub subscriptions pull releases-sub --limit=10
```

## Cost Estimation

Monthly estimated costs (production scale with 10k bots, 100k releases/month):

| Service | Usage | Cost |
|---------|-------|------|
| Cloud Functions | 100M invocations | ~$20 |
| Firestore | 1B reads, 100M writes | ~$80 |
| Cloud Run | 100k hours/month | ~$150 |
| Pub/Sub | 10M messages | ~$5 |
| Cloud Storage | 100 GB egress | ~$20 |
| MongoDB Atlas | M10+ cluster (shared) | ~$70 |
| **Total** | | **~$345/month** |

⚠️ **Note**: Costs can spike with heavy bot activity. Use budget alerts and rate limiting.

## Success Criteria

✅ Deployment is complete when:

1. GitHub Actions workflow completes successfully (all jobs green)
2. Firebase Hosting shows production deployment active
3. Frontend loads at https://dmf-music-platform-5f1a5.web.app
4. API health check responds: `curl https://dmf-music-platform-5f1a5.web.app/api/health`
5. Cloud Run worker status shows "Ready"
6. Pub/Sub subscriptions have 0 unacked messages (worker is consuming)
7. No errors in Cloud Logs for past 5 minutes

🎉 **Deployment successful!**
