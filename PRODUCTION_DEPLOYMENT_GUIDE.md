# DMF Music Platform — Production Deployment Guide

**Status**: Ready to deploy  
**Last Updated**: November 23, 2025  
**Architecture**: Loveable (React/Next) + Firebase Functions + Supabase + MongoDB

---

## 📋 Pre-Deployment Checklist

- [ ] Clone/setup repo with `apps/web` and `functions` folders
- [ ] All API keys removed from frontend code
- [ ] Firebase project created and authenticated
- [ ] Supabase project created and credentials obtained
- [ ] MongoDB Atlas cluster created and connection URI obtained
- [ ] OpenAI API key obtained
- [ ] Google Cloud KMS keys created (optional but recommended)
- [ ] All environment variables documented

---

## 🔧 Step 1: Initialize Project Structure

```bash
# Clone repo
git clone <your-repo> dmf-music-platform
cd dmf-music-platform

# Install root dependencies
npm install

# Install workspace dependencies
npm -w apps/web install
npm -w functions install

# Verify structure
ls -la
# Should show: apps/, functions/, firebase.json, package.json, etc.
```

---

## 🔐 Step 2: Set Firebase Secrets

All sensitive keys are stored in Firebase Functions secrets (NOT in code or .env files).

```bash
# Navigate to Firebase project directory
cd dmf-music-platform

# Authenticate with Firebase
firebase login

# Set each secret
firebase functions:secrets:set OPENAI_API_KEY --project=your-firebase-project
# Paste your OpenAI API key when prompted

firebase functions:secrets:set GEMINI_API_KEY --project=your-firebase-project
# Paste your Google AI API key (if using)

firebase functions:secrets:set SUPABASE_URL --project=your-firebase-project
# Paste your Supabase project URL (e.g., https://xxxxx.supabase.co)

firebase functions:secrets:set SUPABASE_SERVICE_ROLE --project=your-firebase-project
# Paste your Supabase service role key (from Settings > API)

firebase functions:secrets:set MONGO_URI --project=your-firebase-project
# Paste your MongoDB connection string (mongodb+srv://...)

firebase functions:secrets:set DMF_HMAC_SHARED_SECRET --project=your-firebase-project
# Generate a random 32-char secret: openssl rand -hex 16

firebase functions:secrets:set JWT_SECRET --project=your-firebase-project
# Generate a random 64-char secret: openssl rand -hex 32
```

**Verify secrets were set:**
```bash
firebase functions:config:list --project=your-firebase-project
```

---

## 📁 Step 3: Create Firebase Config Files

### `firebase.json` (Root)

```json
{
  "hosting": {
    "public": "apps/web/.next",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/googleai",
        "function": "googleAiProxy"
      },
      {
        "source": "/api/**",
        "function": "apiGateway"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/api/**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20",
    "timeoutSeconds": 540,
    "memory": "256MB"
  },
  "emulators": {
    "functions": {
      "host": "localhost",
      "port": 5001
    },
    "hosting": {
      "host": "localhost",
      "port": 5000
    }
  }
}
```

### `.firebaserc`

```json
{
  "projects": {
    "default": "your-firebase-project-id",
    "staging": "your-firebase-staging-id"
  },
  "targets": {
    "your-firebase-project-id": {
      "hosting": {
        "web": ["dmf-music-platform-web"]
      }
    }
  }
}
```

---

## 📦 Step 4: Build Frontend & Functions

### Build Frontend (Next.js)

```bash
cd apps/web

# Ensure .env.production is set
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://dmf-music-platform.web.app
EOF

# Build
npm run build

# Verify output
ls -la .next/
# Should contain: server/, static/, public/, etc.

cd ../..
```

### Build Functions (TypeScript)

```bash
cd functions

# Build TypeScript
npm run build

# Verify output
ls -la dist/
# Should contain: index.js, apiRouter.js, services/, etc.

cd ..
```

---

## 🚀 Step 5: Deploy to Firebase

```bash
# Full deployment (hosting + functions)
firebase deploy --project=your-firebase-project-id

# Or deploy individually:
firebase deploy --only hosting --project=your-firebase-project-id
firebase deploy --only functions --project=your-firebase-project-id
```

**Monitor deployment:**
```bash
firebase functions:log --limit 50 --project=your-firebase-project-id
```

---

## ✅ Step 6: Verify Deployment

### Check Frontend
```bash
# Should return 200 with HTML
curl -I https://dmf-music-platform.web.app
```

### Check API Health
```bash
# Should return: {"ok":true, "services": {...}}
curl https://dmf-music-platform.web.app/api/health
```

### Check Functions Logs
```bash
firebase functions:log --limit 20 --project=your-firebase-project-id
```

---

## 📊 Step 7: Setup Monitoring & Alerts

### Enable Google Cloud Logging

```bash
# View all functions logs in real-time
gcloud functions describe apiGateway \
  --gen2 \
  --region=us-central1 \
  --project=your-firebase-project-id

# Stream logs
gcloud functions logs read apiGateway \
  --gen2 \
  --region=us-central1 \
  --project=your-firebase-project-id \
  --limit=50
```

### Create Alert Policies (Optional but recommended)

1. Go to Google Cloud Console > Monitoring > Alert Policies
2. Create alert for:
   - **Error rate** > 1% → Email notification
   - **Function timeout** > 30s → Slack notification
   - **Memory usage** > 200MB → Dashboard log

---

## 🔄 Step 8: Continuous Deployment (GitHub Actions)

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          npm -w apps/web install
          npm -w functions install

      - name: Build frontend
        run: npm -w apps/web run build

      - name: Build functions
        run: npm -w functions run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: your-firebase-project-id
          channelId: live
```

**To setup:**
1. Create Firebase service account key (Firebase Console > Project Settings > Service Accounts)
2. Add as GitHub secret: `FIREBASE_SERVICE_ACCOUNT`
3. Commit `.github/workflows/deploy.yml`

---

## 📈 Step 9: Monitor & Maintain

### Daily Checks

```bash
# Check deployment status
firebase hosting:sites:list --project=your-firebase-project-id

# Check function errors
firebase functions:log --limit 50 --project=your-firebase-project-id | grep ERROR

# Check uptime
curl https://dmf-music-platform.web.app/api/health
```

### Weekly Maintenance

1. Review error logs in Google Cloud Logging
2. Check Supabase database usage and quotas
3. Check MongoDB storage and data growth
4. Monitor OpenAI API costs

### Monthly Tasks

1. Rotate secrets (optional)
2. Update dependencies: `npm update`
3. Review security audit logs
4. Backup critical databases

---

## 🆘 Troubleshooting

### Functions not deploying?

```bash
# Check for build errors
npm -w functions run build

# Check TypeScript compilation
npx tsc --noEmit

# Clear Firebase cache
rm -rf .firebase/ dist/
firebase deploy --only functions
```

### Frontend not updating?

```bash
# Clear build cache
rm -rf apps/web/.next/

# Rebuild
npm -w apps/web run build

# Deploy
firebase deploy --only hosting
```

### API returning 500 errors?

```bash
# Check function logs
firebase functions:log --limit 20

# Check environment variables
firebase functions:config:list

# Verify secrets are accessible
firebase functions:secrets:list
```

### Secrets not accessible in functions?

```bash
# Verify secret was created
firebase functions:secrets:list --project=your-firebase-project-id

# Re-deploy functions to load new secrets
firebase deploy --only functions --project=your-firebase-project-id
```

---

## 📚 Reference Commands

```bash
# View all deployed functions
firebase functions:list --project=your-firebase-project-id

# Get function details
firebase functions:describe apiGateway --project=your-firebase-project-id

# Call function locally
firebase emulators:start

# View Firebase config
firebase setup:web --project=your-firebase-project-id

# View hosting sites
firebase hosting:sites:list --project=your-firebase-project-id

# View deployment history
firebase hosting:channels:list --project=your-firebase-project-id
```

---

## ✨ You're Live!

Your DMF Music Platform is now deployed and accessible at:
- **Frontend**: https://dmf-music-platform.web.app
- **API**: https://dmf-music-platform.web.app/api/*
- **Logs**: Google Cloud Console > Cloud Functions

**Next**: Monitor the dashboard, collect user feedback, and iterate! 🚀

---

## 📞 Support

- Firebase Documentation: https://firebase.google.com/docs
- Supabase Documentation: https://supabase.com/docs
- MongoDB Documentation: https://docs.mongodb.com/manual
- OpenAI API Documentation: https://platform.openai.com/docs
- Google Cloud Functions: https://cloud.google.com/functions/docs
