# DMF Music Platform — Complete Firebase + MongoDB + React Setup

## ✅ Scaffold Created

Your complete Firebase Functions backend + React frontend scaffold is ready:

```
dmf-music-platform/
├── backend/functions/
│   ├── index.js                # Express app with public + admin routes
│   ├── pricingPublic.js        # GET /api/pricing/public/plans
│   ├── pricingAdmin.js         # POST/PUT/DELETE /api/pricing/admin/plans (JWT-protected)
│   ├── jwt-gen.js              # Generate test admin JWT tokens
│   ├── package.json            # Dependencies: express, mongodb, jwt, firebase-functions
│   └── .env.example            # MongoDB + JWT secrets template
├── frontend/src/pages/
│   ├── PricingPlansPage.jsx    # Public pricing display (axios to backend)
│   └── AdminPricingPlans.jsx   # Admin CRUD interface with JWT auth
└── web/                        # Vite React app (already exists)
```

---

## 🔌 Connect Everything (5 minutes)

### Step 1: Set Firebase Functions Config (Secrets)

Open a terminal and run these commands from your project root:

```bash
# Store your actual values
export MONGO_PASSWORD="YOUR_MONGODB_PASSWORD_HERE"
export JWT_SECRET="choose-a-strong-secret-32-chars-minimum"
export GOOGLE_AI_KEY="your-google-ai-key-optional"

# Build the MongoDB URI
export MONGO_URI="mongodb+srv://bighomiecash8346:${MONGO_PASSWORD}@cluster0.wf8x1lb.mongodb.net/dmf_db"

# Deploy these secrets to Firebase Functions (they'll be in functions.config())
firebase functions:config:set \
  mongo.uri="${MONGO_URI}" \
  jwt.secret="${JWT_SECRET}" \
  googleai.key="${GOOGLE_AI_KEY}"
```

**That command stores the secrets securely in Firebase — they're NOT in your code.**

---

### Step 2: Deploy Backend (Cloud Functions)

```bash
cd backend/functions
npm ci
firebase deploy --only functions
```

This deploys your Express API to `https://us-central1-YOUR_PROJECT.cloudfunctions.net/api`

---

### Step 3: Update Frontend API Base URL

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=https://us-central1-dmf-music-platform.cloudfunctions.net/api
```

(Replace `dmf-music-platform` with your actual Firebase project ID.)

---

### Step 4: Deploy Frontend (Hosting)

```bash
cd ../web
npm ci
npm run build
firebase deploy --only hosting
```

Your frontend is now live at `https://dmf-music-platform.web.app`

---

### Step 5: Generate Admin JWT for Testing

```bash
cd ../backend/functions
export JWT_SECRET="the-same-secret-you-set-in-step-1"
node jwt-gen.js
```

You'll see a token. Copy it.

---

## 🧪 Smoke Tests (Verify Everything Works)

### 1. Health Check (should return 200)

```bash
curl -sS https://us-central1-dmf-music-platform.cloudfunctions.net/api/health | jq .
```

Expected: `{"ok":true,"time":1234567890}`

### 2. Public Plans (should return empty array initially)

```bash
curl -sS https://us-central1-dmf-music-platform.cloudfunctions.net/api/pricing/public/plans | jq .
```

Expected: `[]`

### 3. Admin Plans Without Token (should return 401)

```bash
curl -i https://us-central1-dmf-music-platform.cloudfunctions.net/api/pricing/admin/plans
```

Expected: `401 Unauthorized`

### 4. Admin Create Plan (with JWT token)

```bash
TOKEN="paste-the-token-from-step-5"
curl -sS -X POST https://us-central1-dmf-music-platform.cloudfunctions.net/api/pricing/admin/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Basic Plan","price":9.99,"active":true}' | jq .
```

Expected: `201 Created` with the plan object including `_id`.

### 5. Frontend Test

1. Open https://dmf-music-platform.web.app
2. Navigate to `/pricing` — should show "Public Plans" (empty or with plans you created)
3. Navigate to `/admin/pricing` — paste your JWT token, click Apply
4. Create a plan: name="Pro", price=29.99, click Create
5. See it appear in the list
6. Click Deactivate/Activate — should update in real-time
7. Click Delete — should remove it

---

## 🔐 Security Checklist

- [x] Backend functions config stores secrets (not in code)
- [x] Admin endpoints require JWT token
- [x] MongoDB connection string stored in Firebase config
- [x] Frontend connects to deployed Cloud Functions (not local)
- [ ] MongoDB Atlas whitelist: add Firebase IP ranges (or allow 0.0.0.0/0 for dev)
- [ ] Firebase Auth optional: gate admin UI behind sign-in for production
- [ ] CORS enabled: functions accept requests from your frontend domain

---

## 📝 What's Wired

### Public API (`/api/pricing/public/plans`)
- **Method**: GET
- **Auth**: None
- **Connects to**: MongoDB dmf_db.plans collection
- **Returns**: JSON array of all plans

### Admin API (`/api/pricing/admin/*`)
- **Methods**: GET (list), POST (create), PUT (update), DELETE (delete)
- **Auth**: JWT Bearer token (from functions.config().jwt.secret)
- **Connects to**: MongoDB dmf_db.plans collection
- **Operations**:
  - POST `/api/pricing/admin/plans` → Insert plan
  - PUT `/api/pricing/admin/plans/:id` → Update plan
  - DELETE `/api/pricing/admin/plans/:id` → Delete plan
  - GET `/api/pricing/admin/plans` → List all plans

### Frontend Integration
- React hooks fetch data from backend via Axios
- JWT token stored in localStorage (for persistence)
- Optimistic UI updates (list refreshes after CRUD)
- Error alerts on API failures

---

## 🆘 Troubleshooting

**Functions deploy fails with "MONGO_URI not configured"**
→ Run the `firebase functions:config:set` command from Step 1

**Frontend shows "Cannot GET /api/pricing/public/plans"**
→ Check that `VITE_API_BASE_URL` in `.env` matches your functions URL
→ Check that functions are deployed: `firebase functions:list`

**JWT token returns 401 Unauthorized**
→ Ensure the JWT_SECRET in Firebase config matches the one used to generate the token
→ Token must not be expired (jwt-gen.js sets 8h expiry)

**MongoDB connection times out**
→ MongoDB Atlas must whitelist Firebase IPs or allow 0.0.0.0/0
→ Check: https://cloud.mongodb.com/v2/..../security/network/access

**Frontend deploys but shows old API URL**
→ Rebuild frontend: `npm run build`
→ Check `web/dist/` contains updated index.html with correct API URL
→ Re-run `firebase deploy --only hosting`

---

## 📚 Next Steps

1. **Production Hardening**:
   - Add Firebase Auth to gate admin UI
   - Use MongoDB IP whitelist (not 0.0.0.0/0)
   - Rotate JWT secret periodically
   - Enable HTTPS (Firebase handles this)

2. **Google AI Integration**:
   - Add `googleai.key` to Firebase config (already set in Step 1)
   - Create backend endpoint that calls Google AI with the key
   - Frontend calls your backend endpoint (not direct AI API)

3. **Database Seeding**:
   - Create initial plans via admin API after first deploy
   - Or seed via MongoDB Atlas UI directly

4. **Monitoring**:
   - Check Firebase Console → Cloud Functions for logs
   - Monitor MongoDB Atlas for slow queries

---

## 🚀 You're Ready!

Everything is wired and connected. Run the smoke tests above to verify, then start using the admin UI to create plans.

Questions? Check the code in:
- Backend: `backend/functions/index.js` (Express setup)
- Frontend: `frontend/src/pages/AdminPricingPlans.jsx` (Admin UI)
- Database: Uses MongoDB Atlas cluster (dmf_db.plans collection)

Good luck! 🎉
