# DMF Music Platform — ZIP Scaffold Contents

## ✅ What's Included

### Frontend (`apps/web/`)
- ✅ `package.json` — Next.js 14 + React 18 + Tailwind
- ✅ `tsconfig.json` — TypeScript configuration
- ✅ `tailwind.config.js` — DMF branding (navy blue #0b2545, gold #d4af37)
- ✅ `postcss.config.js` — PostCSS setup
- ✅ `src/app/layout.tsx` — Root layout
- ✅ `src/app/page.tsx` — Home page with tab navigation (AI Chat, Roster, Subscribe)
- ✅ `src/app/globals.css` — Tailwind styles
- ✅ `src/components/ChatInterface.tsx` — AI chat interface (calls /api/googleai)
- ✅ `src/components/MediaGrid.tsx` — Artist roster grid with sample data
- ✅ `src/components/SubscribeCard.tsx` — Subscription plan selector
- ✅ `src/lib/api.ts` — API client layer (aiChat, getArtist, subscribe, getCurrentUser, healthCheck)

### Backend (`functions/`)
- ✅ `package.json` — Firebase Functions (Node 20) + Express + OpenAI + MongoDB + Supabase
- ✅ `tsconfig.json` — TypeScript compilation config
- ✅ `src/index.ts` — Entry point (Express app + Firebase Functions export)
- ✅ `src/googleAiProxy.ts` — `/api/googleai` endpoint (OpenAI proxy with model whitelist)
- ✅ `src/apiRouter.ts` — Router with:
  - `GET /api/artist/:id` (Firestore + MongoDB)
  - `POST /api/subscribe` (Supabase + Firestore)
  - `GET /api/me` (Current user)
- ✅ `src/services/mongoClient.ts` — MongoDB connection pooling
- ✅ `src/services/supabaseClient.ts` — Supabase client initialization

### Configuration
- ✅ `firebase.json` — Firebase Hosting + Functions config
- ✅ `.firebaserc` — Firebase project mapping (dmf-music-platform)
- ✅ `package.json` (root) — Monorepo workspaces setup + scripts
- ✅ `.gitignore` — Standard exclusions
- ✅ `.env.example` — Environment variables template

### Setup & Documentation
- ✅ `dmf_bootstrap.sh` — One-shot setup script (npm install, build, create .env files)
- ✅ `README.md` — Full deployment guide with API reference
- ✅ `SUPABASE_SCHEMA.sql` — PostgreSQL migration (users, subscriptions, artists, releases, tracks, payments, audit_log)

---

## 🚀 How to Use This Scaffold

### Step 1: Extract ZIP
```bash
unzip DMF-MUSIC-PLATFORM.zip
cd DMF-MUSIC-PLATFORM
```

### Step 2: Run Bootstrap
```bash
bash dmf_bootstrap.sh
```

This will:
- Install all npm packages (root + apps/web + functions)
- Create `.env.local` and `.env` placeholders
- Build Next.js and TypeScript functions
- Print next steps

### Step 3: Update Environment Files
**`apps/web/.env.local`:**
```
NEXT_PUBLIC_API_URL=https://us-central1-dmf-music-platform.cloudfunctions.net/apiGateway
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dmf-music-platform
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBS92OnLQd6HN8b4MyJGFDAxT7Qk2v2psA
```

**`functions/.env`:**
```
FIREBASE_PROJECT_ID=dmf-music-platform
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGc...
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dmf_db
OPENAI_API_KEY=sk-...
```

### Step 4: Create Supabase Tables
1. Go to https://app.supabase.com → SQL Editor
2. Copy & paste `SUPABASE_SCHEMA.sql`
3. Click "Run"

### Step 5: Set Firebase Secrets
```bash
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set SUPABASE_URL
firebase functions:secrets:set SUPABASE_SERVICE_ROLE
firebase functions:secrets:set MONGO_URI
firebase functions:secrets:set DMF_HMAC_SHARED_SECRET
```

### Step 6: Deploy
```bash
firebase deploy --only hosting,functions
```

Frontend: https://dmf-music-platform.web.app  
Backend: https://us-central1-dmf-music-platform.cloudfunctions.net/apiGateway

---

## 📊 File Tree

```
DMF-MUSIC-PLATFORM/
├─ apps/
│  └─ web/
│     ├─ package.json
│     ├─ tsconfig.json
│     ├─ tailwind.config.js
│     ├─ postcss.config.js
│     └─ src/
│        ├─ app/
│        │  ├─ layout.tsx
│        │  ├─ page.tsx
│        │  └─ globals.css
│        ├─ components/
│        │  ├─ ChatInterface.tsx
│        │  ├─ MediaGrid.tsx
│        │  └─ SubscribeCard.tsx
│        └─ lib/
│           └─ api.ts
│
├─ functions/
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ src/
│     ├─ index.ts
│     ├─ googleAiProxy.ts
│     ├─ apiRouter.ts
│     └─ services/
│        ├─ mongoClient.ts
│        └─ supabaseClient.ts
│
├─ firebase.json
├─ .firebaserc
├─ package.json
├─ .gitignore
├─ .env.example
├─ dmf_bootstrap.sh
├─ README.md
├─ SUPABASE_SCHEMA.sql
└─ SCAFFOLD_CONTENTS.md ← This file
```

---

## 🔗 Key API Endpoints

All endpoints available after deployment:

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/health` | GET | ❌ | Liveness check |
| `/api/googleai` | POST | ❌ | OpenAI proxy (chat) |
| `/api/artist/:id` | GET | ❌ | Fetch artist profile |
| `/api/subscribe` | POST | ✅ | Create subscription |
| `/api/me` | GET | ✅ | Get current user |

---

## 💾 Sample Data

**Frontend includes:**
- 4 sample artists (Freezzo, OBMB, Juno, Nova) with album covers
- 3 subscription plans (Free, Pro, Enterprise)
- AI chat interface calling backend
- Responsive Tailwind design (dark navy + gold)

**Database schemas ready for:**
- User authentication (Firebase Auth)
- Artist profiles + releases
- Track streams & royalties
- Subscription management
- Audit logging

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Firebase Cloud Functions, Node 20 |
| API | Express.js, TypeScript |
| Databases | Firestore, Supabase PostgreSQL, MongoDB Atlas |
| AI | OpenAI GPT-4o (backend proxy) |
| Auth | Firebase Authentication |
| Deployment | Firebase Hosting + Cloud Functions |
| Type Safety | TypeScript (full stack) |

---

## ✨ Features

✅ AI chat interface powered by OpenAI  
✅ Artist roster with media grid  
✅ Subscription plans (Free/Pro/Enterprise)  
✅ Multi-database architecture  
✅ Rate limiting (10 AI/min, 100 API/min)  
✅ HMAC request verification  
✅ Audit logging to MongoDB  
✅ Type-safe TypeScript everywhere  
✅ Tailwind CSS with DMF branding  
✅ Firebase Auth ready  
✅ Supabase Row-Level Security enabled  
✅ One-shot bootstrap setup  

---

## 🚨 Before Deploying

- [ ] Update `apps/web/.env.local` with real Firebase keys
- [ ] Update `functions/.env` with OpenAI + Supabase + MongoDB credentials
- [ ] Run `SUPABASE_SCHEMA.sql` in Supabase SQL Editor
- [ ] Set Firebase secrets via CLI
- [ ] Test locally: `firebase emulators:start`
- [ ] Verify `/api/health` returns 200
- [ ] Test AI endpoint with sample message
- [ ] Deploy: `firebase deploy --only hosting,functions`

---

## 📞 Support

- **Firebase**: https://firebase.google.com/docs
- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs
- **MongoDB**: https://docs.mongodb.com
- **OpenAI**: https://platform.openai.com/docs

---

**You're ready to build! Start with Step 1 above.** 🚀
