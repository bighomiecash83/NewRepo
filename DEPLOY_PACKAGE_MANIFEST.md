# DMF Music Platform — Complete Deploy Package Structure

**Ready-to-deploy package with all scaffolds and configurations**

---

## 📦 What's Included

This package contains everything you need to deploy DMF Music Platform:

```
dmf-music-platform/
├─ apps/
│  └─ web/                         # Loveable-exported React/Next app
│     ├─ package.json
│     ├─ next.config.js
│     ├─ .env.local                # (local dev)
│     ├─ .env.production           # (production)
│     ├─ src/ (or app/)
│     │  ├─ pages/
│     │  ├─ components/
│     │  └─ lib/api.ts             # API client (points to /api/*)
│     └─ public/
│
├─ functions/                      # Firebase Cloud Functions (Node 20 + TS)
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ src/
│  │  ├─ index.ts                  # Express app + function exports
│  │  ├─ apiRouter.ts              # All endpoints (health, artist, subscribe, googleai, analytics)
│  │  ├─ proxies/
│  │  │  └─ googleAiProxy.ts       # OpenAI/Gemini proxy (server-side keys)
│  │  ├─ services/
│  │  │  ├─ supabaseClient.ts      # Supabase Postgres client
│  │  │  ├─ mongoClient.ts         # MongoDB Atlas client
│  │  │  └─ firestoreClient.ts     # (Firebase Firestore, optional)
│  │  ├─ crypto/
│  │  │  └─ envelope.ts            # KMS envelope encryption
│  │  ├─ mw/
│  │  │  └─ verifyHmac.ts          # HMAC verification middleware
│  │  └─ types/
│  │     └─ index.ts               # TypeScript interfaces
│  └─ dist/                        # Build output (gitignore)
│
├─ firebase.json                   # Hosting + Functions config
├─ .firebaserc                     # Firebase project mapping
├─ package.json                    # Root workspace config
├─ tsconfig.json                   # TypeScript root config
│
├─ docs/
│  ├─ LOVEABLE_INTEGRATION_CHECKLIST.md      # How to export from Loveable
│  ├─ PRODUCTION_DEPLOYMENT_GUIDE.md         # Step-by-step deploy to Firebase
│  ├─ SYSTEM_COMPONENT_INVENTORY.md          # All components mapped
│  ├─ DURYIA_BRAIN_CODE_REFERENCE.md         # Du'ryia permission engine
│  └─ SECURITY.md                            # Security best practices
│
└─ .github/
   └─ workflows/
      └─ deploy.yml                # GitHub Actions CI/CD (optional)
```

---

## 🚀 Quick Start (5 minutes)

### 1. Extract & Install
```bash
unzip dmf-music-platform.zip
cd dmf-music-platform
npm install
npm -w apps/web install
npm -w functions install
```

### 2. Set Secrets
```bash
firebase login
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set SUPABASE_URL
firebase functions:secrets:set SUPABASE_SERVICE_ROLE
firebase functions:secrets:set MONGO_URI
firebase functions:secrets:set JWT_SECRET
firebase functions:secrets:set DMF_HMAC_SHARED_SECRET
```

### 3. Build & Deploy
```bash
npm run build
firebase deploy --project=your-project-id
```

**Done!** Your platform is live at `https://your-project-id.web.app`

---

## 📋 Complete File Checklist

### Root Level
- [ ] `package.json` — Workspace root with build/deploy scripts
- [ ] `firebase.json` — Hosting + Functions configuration
- [ ] `.firebaserc` — Project ID mapping
- [ ] `tsconfig.json` — Root TypeScript config
- [ ] `.gitignore` — Excludes secrets, node_modules, build output

### Frontend (`apps/web`)
- [ ] `package.json` — Next.js/React dependencies
- [ ] `next.config.js` — Next.js configuration + API rewrites
- [ ] `tsconfig.json` — Frontend TypeScript config
- [ ] `.env.local` — Local dev environment (NEXT_PUBLIC_API_URL=http://localhost:5000)
- [ ] `.env.production` — Production environment (NEXT_PUBLIC_API_URL=https://yourdomain.web.app)
- [ ] `.eslintrc.json` — Linting rules
- [ ] `app/` or `src/pages/` — React/Next pages (from Loveable export)
- [ ] `src/components/` — Reusable UI components
- [ ] `src/lib/api.ts` — API client wrapper (calls /api/*)
- [ ] `public/` — Static assets
- [ ] `build/` or `.next/` — Build output (generated, gitignore)

### Functions (`functions`)
- [ ] `package.json` — Dependencies (express, firebase-functions, openai, supabase, mongodb, etc.)
- [ ] `tsconfig.json` — Functions TypeScript config
- [ ] `src/index.ts` — Main Express app + function exports
- [ ] `src/apiRouter.ts` — All endpoints (GET /health, POST /subscribe, POST /googleai, GET /analytics, GET /artist/:id)
- [ ] `src/proxies/googleAiProxy.ts` — OpenAI/Gemini proxy (server-side API key)
- [ ] `src/services/supabaseClient.ts` — Supabase Postgres client
- [ ] `src/services/mongoClient.ts` — MongoDB Atlas client
- [ ] `src/services/firestoreClient.ts` — Firebase Firestore client (optional)
- [ ] `src/crypto/envelope.ts` — KMS envelope encryption (optional)
- [ ] `src/mw/verifyHmac.ts` — HMAC middleware for request verification
- [ ] `src/types/index.ts` — TypeScript interfaces and types
- [ ] `dist/` — Build output (generated, gitignore)
- [ ] `.env.local` — Local dev secrets (for emulator)

### Documentation
- [ ] `LOVEABLE_INTEGRATION_CHECKLIST.md` — How to export from Loveable and integrate
- [ ] `PRODUCTION_DEPLOYMENT_GUIDE.md` — Step-by-step Firebase deployment
- [ ] `SYSTEM_COMPONENT_INVENTORY.md` — All system components mapped
- [ ] `DURYIA_BRAIN_CODE_REFERENCE.md` — Permission engine documentation
- [ ] `SECURITY.md` — Security best practices and hardening

### CI/CD (Optional)
- [ ] `.github/workflows/deploy.yml` — Automatic deploy on push to main

---

## 🔑 Required Credentials

Before deploying, you'll need:

1. **Firebase Project**
   - Firebase Console: https://console.firebase.google.com
   - Create new project or select existing
   - Copy project ID to `.firebaserc`

2. **OpenAI API Key**
   - Get from: https://platform.openai.com/api-keys
   - Set via: `firebase functions:secrets:set OPENAI_API_KEY`

3. **Supabase Project**
   - Create at: https://supabase.com
   - Get URL from: Settings > API
   - Get service role key from: Settings > API > Service Role Key
   - Set via: `firebase functions:secrets:set SUPABASE_URL` and `SUPABASE_SERVICE_ROLE`

4. **MongoDB Atlas Connection**
   - Create cluster at: https://cloud.mongodb.com
   - Get connection string: Clusters > Connect > Copy Connection String
   - Replace `<password>` with your database user password
   - Set via: `firebase functions:secrets:set MONGO_URI`

5. **Firebase Service Account** (for GitHub Actions)
   - Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Add to GitHub Secrets as `FIREBASE_SERVICE_ACCOUNT`

---

## 📝 Environment Variables

### Frontend (`.env.local`, `.env.production`)
```
# Safe to expose (public)
NEXT_PUBLIC_API_URL=http://localhost:5000          # local dev
NEXT_PUBLIC_API_URL=https://yourdomain.web.app     # production

# DO NOT add API keys here! Use backend proxy instead.
```

### Functions (Firebase Secrets)
```
# Set with: firebase functions:secrets:set KEY_NAME
OPENAI_API_KEY=sk_...
GEMINI_API_KEY=...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE=eyJ...
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
DMF_HMAC_SHARED_SECRET=...
```

---

## 🛠️ Build & Deploy Commands

```bash
# Install all dependencies
npm install && npm -w apps/web install && npm -w functions install

# Local development (2 terminals)
# Terminal 1: Frontend
npm -w apps/web run dev
# Opens http://localhost:3000

# Terminal 2: Functions emulator
npm -w functions run serve
# Listens on http://localhost:5001

# Build for production
npm run build

# Deploy to Firebase
firebase deploy --project=your-firebase-project-id

# View logs
firebase functions:log --limit 50 --project=your-firebase-project-id

# Verify health
curl https://yourdomain.web.app/api/health
```

---

## 🔍 What Each Endpoint Does

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/health` | GET | None | Liveness check |
| `/api/artist/:id` | GET | None | Get artist profile (cached) |
| `/api/subscribe` | POST | JWT | Subscribe to plan |
| `/api/googleai` | POST | JWT | Call OpenAI/Gemini (server-side key) |
| `/api/analytics/:artistId` | GET | JWT | Get analytics dashboard |

---

## 🔐 Security Notes

✅ **Implemented:**
- API keys stored in Firebase Functions secrets (not in code)
- Frontend calls `/api/googleai` proxy (server-side key)
- HMAC middleware for request verification
- KMS envelope encryption for sensitive fields
- Audit logging for all API calls
- Firebase Auth + custom JWT claims

⚠️ **To Implement:**
- Enable Firebase App Check (optional but recommended)
- Setup Firestore security rules (included in docs)
- Configure CORS whitelist for production domain
- Rate limiting per endpoint (template provided)
- Database encryption at rest (Supabase + MongoDB support it)

---

## 📊 Database Schema

### Supabase (Postgres)
```sql
-- Pricing plans
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY,
  name TEXT,
  price NUMERIC,
  billing_cycle_days INT,
  created_at TIMESTAMPTZ
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id TEXT,
  plan_id UUID,
  status TEXT,
  started_at TIMESTAMPTZ,
  renews_at TIMESTAMPTZ
);

-- Analytics (pre-aggregated)
CREATE TABLE analytics_daily (
  id UUID PRIMARY KEY,
  artist_id TEXT,
  date DATE,
  streams INT,
  listeners INT,
  engagement_rate FLOAT
);
```

### MongoDB
```javascript
// Collections
db.createCollection("artists");
db.createCollection("releases");
db.createCollection("analytics_raw");
db.createCollection("audit_logs");

// Indexes
db.artists.createIndex({ _id: 1 });
db.releases.createIndex({ artist_id: 1, created_at: -1 });
db.analytics_raw.createIndex({ artist_id: 1, timestamp: -1 });
db.audit_logs.createIndex({ timestamp: -1 });
```

### Firebase (Firestore)
```
/artists/{artistId}           # Public profile cache
/charts/{chartId}             # Top charts
/user_sessions/{userId}       # Active sessions
```

---

## 🎯 Next Steps After Deployment

1. **Test Endpoints**
   ```bash
   curl https://yourdomain.web.app/api/health
   ```

2. **Monitor Performance**
   - Google Cloud Console > Functions > Metrics
   - Check error rates, latency, memory usage

3. **Setup Alerts**
   - Error rate > 1% → Email
   - Latency > 1s → Slack
   - Memory > 256MB → Console log

4. **Configure CI/CD** (optional)
   - Add `.github/workflows/deploy.yml`
   - Setup automatic deployment on push

5. **Iterate & Improve**
   - Monitor user feedback
   - Collect analytics
   - Optimize endpoints based on usage
   - Scale functions/databases as needed

---

## 📞 Support & Resources

- **Firebase**: https://firebase.google.com/docs
- **Supabase**: https://supabase.com/docs
- **MongoDB**: https://docs.mongodb.com
- **OpenAI**: https://platform.openai.com/docs
- **Google Cloud Functions**: https://cloud.google.com/functions/docs

---

## ✨ You're Ready!

Everything in this package is production-ready. Just:

1. Extract the zip
2. Set your secrets
3. Run `firebase deploy`
4. Celebrate! 🎉

**Questions?** Check the docs in the `docs/` folder or review the inline code comments.
