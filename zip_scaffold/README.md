# DMF Music Platform — Full Stack Deployment Package

**Production-ready Next.js 14 + Firebase Functions + Supabase + MongoDB**

---

## 📦 Contents

```
DMF-MUSIC-PLATFORM/
├─ apps/web/                  ← Next.js 14 frontend
│  ├─ src/
│  │  ├─ app/                 (layout.tsx, page.tsx)
│  │  ├─ components/          (ChatInterface, MediaGrid, SubscribeCard)
│  │  └─ lib/                 (api.ts client layer)
│  └─ package.json
│
├─ functions/                 ← Firebase Cloud Functions (Node 20)
│  ├─ src/
│  │  ├─ index.ts             (entry point)
│  │  ├─ apiRouter.ts         (/api/artist, /api/subscribe, /api/me)
│  │  ├─ googleAiProxy.ts     (/api/googleai with OpenAI proxy)
│  │  └─ services/            (mongoClient, supabaseClient)
│  └─ package.json
│
├─ dmf_bootstrap.sh           ← One-shot setup script
├─ .env.example               ← Environment template
└─ README.md                  ← This file
```

---

## 🚀 Quick Start

### 1. Run Bootstrap Script

```bash
bash dmf_bootstrap.sh
```

This will:
- ✅ Install all npm packages (frontend + functions)
- ✅ Create `.env` files with placeholders
- ✅ Build frontend (Next.js) and backend (TypeScript)
- ✅ Ready for deployment

### 2. Fill in Environment Variables

Edit these files with real credentials:

**`apps/web/.env.local`:**
```
NEXT_PUBLIC_API_URL=<your-firebase-functions-url>
NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-key>
```

**`functions/.env`:**
```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
MONGO_URI=mongodb+srv://...
```

### 3. Set Firebase Secrets (Required)

```bash
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set SUPABASE_URL
firebase functions:secrets:set SUPABASE_SERVICE_ROLE
firebase functions:secrets:set MONGO_URI
```

### 4. Deploy to Firebase

```bash
firebase deploy --only hosting,functions
```

---

## 🔌 API Endpoints

**Frontend calls backend via `/api/*` proxy:**

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/health` | GET | Liveness check | ❌ |
| `/api/googleai` | POST | AI chat proxy | ❌ |
| `/api/artist/:id` | GET | Artist profile | ❌ |
| `/api/subscribe` | POST | User subscription | ✅ |
| `/api/me` | GET | Current user | ✅ |

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 + React 18 + Tailwind CSS
- **Backend**: Firebase Cloud Functions (Node 20)
- **Databases**:
  - Firestore (profiles, metadata)
  - Supabase PostgreSQL (subscriptions, relational)
  - MongoDB Atlas (media, logs, audit trail)
- **AI/LLM**: OpenAI GPT-4o + Gemini (via backend proxy)
- **Deployment**: Firebase Hosting + Functions

---

## 📝 Features

✅ **AI Chat Interface** - Call OpenAI via safe backend proxy  
✅ **Artist Roster** - Grid view of music releases with Unsplash placeholders  
✅ **Subscription Plans** - Free / Pro / Enterprise tiers  
✅ **Multi-Database** - Firestore + Supabase + MongoDB integration  
✅ **Rate Limiting** - 10 AI calls/min, 100 API calls/min  
✅ **HMAC Security** - Request signature verification  
✅ **Audit Logging** - All transactions logged to MongoDB  
✅ **TypeScript** - Full type safety frontend + backend  

---

## 🧪 Local Development

### Start Firebase Emulator

```bash
firebase emulators:start
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5001`

### Test AI Endpoint

```bash
curl -X POST http://localhost:5001/dmf-music-platform/us-central1/apiGateway/api/googleai \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## 📊 Database Schemas

### Firestore
- `artists/{id}` → Profile (name, bio, image)
- `subscriptions/{userId}` → Plan (free/pro/enterprise)
- `audit_log/{id}` → Transaction logs

### Supabase PostgreSQL
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255),
  plan VARCHAR(50),
  created_at TIMESTAMP DEFAULT now()
);
```

### MongoDB
- `artists` → Artist metadata
- `media` → Tracks, albums, releases
- `audit_log` → All API transactions
- `bots` → 10,000-bot playground (optional)

---

## 🔐 Security

- ✅ API keys stored in **Firebase Functions secrets** (NOT in code)
- ✅ **HMAC-SHA256** verification on requests
- ✅ **Firebase Auth** for protected endpoints
- ✅ **Firestore rules** prevent unauthorized writes
- ✅ **Envelope encryption** ready (KMS + AES-256-GCM)

---

## 📈 Monitoring & Logs

### View Functions Logs

```bash
firebase functions:log --limit 50
```

### Google Cloud Logging

https://console.cloud.google.com/logs

### Supabase Analytics

https://app.supabase.com/project/[project]/analytics

---

## 🚨 Troubleshooting

### Build fails?
```bash
cd functions && npm run build
```

### Dependencies missing?
```bash
npm install && npm -w apps/web install && npm -w functions install
```

### Can't connect to MongoDB?
- Verify `MONGO_URI` in `functions/.env`
- Check IP whitelist in MongoDB Atlas

### Functions returning 500?
```bash
firebase functions:log --tail
```

---

## 📚 Next Steps

1. **Export from Loveable** → Replace `apps/web` with Loveable export
2. **Create Supabase tables** → Use schema migration script
3. **Seed MongoDB** → Run `activate-streamgod-bots.js` for sample data
4. **Configure custom domain** → Add DNS records
5. **Setup CI/CD** → GitHub Actions for auto-deploy

---

## 📞 Support

- Firebase: https://firebase.google.com/docs
- Supabase: https://supabase.com/docs
- MongoDB: https://docs.mongodb.com
- Next.js: https://nextjs.org/docs
- TypeScript: https://www.typescriptlang.org/docs

---

**Ready to go live? Run `firebase deploy --only hosting,functions` now!** 🚀
