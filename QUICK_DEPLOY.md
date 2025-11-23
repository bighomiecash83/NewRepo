# 🚀 DMF Platform — Deploy in 5 Minutes

## What You Have

✅ **Backend**: Firebase Cloud Functions with Express.js + MongoDB + JWT auth
✅ **Frontend**: React pages for public pricing + admin CRUD
✅ **Database**: MongoDB Atlas (cluster0.wf8x1lb.mongodb.net)
✅ **All Wired**: API calls, JWT tokens, error handling, optimistic UI

---

## Copy-Paste Commands (Windows PowerShell)

### 1️⃣ Set Firebase Secrets

```powershell
$env:MONGO_PASSWORD = "YOUR_DB_PASSWORD"
$env:JWT_SECRET = "change-me-to-a-strong-secret"
$MONGO_URI = "mongodb+srv://bighomiecash8346:$($env:MONGO_PASSWORD)@cluster0.wf8x1lb.mongodb.net/dmf_db"

firebase functions:config:set `
  mongo.uri="$MONGO_URI" `
  jwt.secret="$($env:JWT_SECRET)" `
  googleai.key="optional-key"
```

### 2️⃣ Deploy Backend

```powershell
cd backend/functions
npm ci
firebase deploy --only functions
```

### 3️⃣ Update Frontend API URL

Edit `frontend/.env`:
```
VITE_API_BASE_URL=https://us-central1-dmf-music-platform.cloudfunctions.net/api
```

### 4️⃣ Deploy Frontend

```powershell
cd ../../web
npm ci
npm run build
firebase deploy --only hosting
```

### 5️⃣ Generate Admin JWT

```powershell
cd ../backend/functions
$env:JWT_SECRET = "the-same-secret-from-step-1"
node jwt-gen.js
# Copy the token output
```

---

## Verify It Works

```bash
# Health check
curl https://us-central1-dmf-music-platform.cloudfunctions.net/api/health

# Create a plan (replace TOKEN)
curl -X POST https://us-central1-dmf-music-platform.cloudfunctions.net/api/pricing/admin/plans `
  -H "Authorization: Bearer TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{"name":"Test","price":9.99,"active":true}'

# View public plans
curl https://us-central1-dmf-music-platform.cloudfunctions.net/api/pricing/public/plans
```

---

## File Map

| File | Purpose |
|------|---------|
| `backend/functions/index.js` | Express app + JWT middleware |
| `backend/functions/pricingPublic.js` | Public GET /plans |
| `backend/functions/pricingAdmin.js` | Admin POST/PUT/DELETE /plans |
| `backend/functions/jwt-gen.js` | Generate test tokens |
| `frontend/src/pages/PricingPlansPage.jsx` | Display public plans |
| `frontend/src/pages/AdminPricingPlans.jsx` | Admin CRUD UI + JWT |
| `SCAFFOLD_SETUP_GUIDE.md` | Full troubleshooting + details |

---

## Key Connections

✅ Frontend → Axios calls → Cloud Functions URL
✅ Cloud Functions → MongoDB Atlas (via functions.config())
✅ JWT Secret → Shared between token generator + functions
✅ Database → dmf_db.plans collection
✅ Secrets → Stored in Firebase config (not in code)

---

## 🎯 Next

1. Follow the 5 commands above in order
2. Run smoke tests to verify
3. Open https://dmf-music-platform.web.app and test the admin UI
4. Read `SCAFFOLD_SETUP_GUIDE.md` for troubleshooting

**You're live in < 5 minutes!** 🚀
