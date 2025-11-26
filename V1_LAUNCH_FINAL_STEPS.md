# 🚀 Final v1 Launch Checklist

**Status:** Core infrastructure ✅ | Pages ✅ | Now: Environment & Domain Setup

---

## #3: Lock Environment Variables in Lovable

### In Lovable Project Settings, set these environment variables:

**Core API Configuration:**
```
ASPNETCORE_ENVIRONMENT=Production
CORE_API_BASE_URL=https://api.dmf-music-platform.com  [PICK REAL DOMAIN]
```

**MongoDB (Real Production Cluster):**
```
MONGO_CONNECTION_STRING=mongodb+srv://bighomiecash8346:***@dmf-music-platform.pfqrhc.mongodb.net/
MONGO_DATABASE_NAME=DMF_MUSIC_PLATFORM
```

**Supabase (Real Production Instance):**
```
SUPABASE_URL=https://<your-supabase>.supabase.co
SUPABASE_ANON_KEY=***
SUPABASE_SERVICE_ROLE_KEY=***
SUPABASE_DB_CONNECTION_STRING=postgresql://postgres:***@db.*****.supabase.co:5432/postgres
```

**Frontend Configuration:**
```
VITE_API_BASE_URL=https://api.dmf-music-platform.com  [SAME AS CORE_API_BASE_URL]
VITE_APP_ENVIRONMENT=production
```

**Secrets:**
```
DMF_APP_API_KEY=dmf_prod_***  [Generate a strong key]
OPENAI_API_KEY=sk-***
GEMINI_API_KEY=AIza***
JWT_SECRET=***
```

---

## #6: Pick Your Real Domain & Point It

### Option A: Use subdomain of existing domain
- `api.dmfmusicplatform.com` → points to Lovable backend
- `app.dmfmusicplatform.com` → points to Lovable frontend
- `portal.dmfrecords.com` → all-in-one

### Option B: Register new domain
- `dmf-music-platform.com`
- `streamgod-api.com`
- Your choice

### Once domain is picked:

1. **Point DNS to Lovable:**
   - Get Lovable's hosting IP/CNAME
   - Point domain A record / CNAME to Lovable

2. **Update `CORE_API_BASE_URL`:**
   - Backend: `https://api.dmfmusicplatform.com`
   - Frontend: `VITE_API_BASE_URL=https://api.dmfmusicplatform.com`

3. **Verify HTTPS:**
   - Lovable auto-provisions SSL (Let's Encrypt)
   - Test: `curl https://api.dmfmusicplatform.com/health`
   - Should return: `{"status":"OK","mongo":"OK","env":{...}}`

---

## What's Ready to Test (#5 E2E):

Once ENV vars are locked in Lovable, you can run the full 7-step flow:

1. ✅ **Login** → Supabase auth (users table)
2. ✅ **Load Roster** → MongoDB (artists collection)
3. ✅ **Pick Artist** → UI filters from Mongo
4. ✅ **Attach Release** → MongoDB (releases collection with UPC/ISRC)
5. ✅ **Trigger StreamGod** → GET `/api/catalog/health` 
6. ✅ **Generate Statement** → POST `/api/royalties` → Mongo stores
7. ✅ **View in Dashboard** → GET `/api/royalties/me` → displays earnings

All 7 use the **same Core API** (no direct DB access from frontend).

---

## Quick Test Before Launch:

```bash
# 1. Health check (no API key needed)
curl https://api.dmfmusicplatform.com/health

# 2. System status check (no API key needed)
curl https://api.dmfmusicplatform.com/system/status

# 3. Protected endpoint (NEEDS API key)
curl -H "x-dmf-api-key: dmf_prod_***" \
  https://api.dmfmusicplatform.com/api/artists
```

If #1 and #2 return OK, and #3 requires the key → **you're ready for soft launch.**

---

## Summary: What's Done vs What's Next

✅ **DONE:**
- Prod v1 stack locked in (Lovable + MongoDB + Supabase)
- API key wall implemented (middleware + auto-injection)
- 4 new pages built (Royalties, Distribution, Settings, SystemStatus)
- `/health` endpoint (Mongo + env validation)
- `/system/status` endpoint (all 6 services)
- Shared `dmf_api_client.ts` for all frontends
- Repository interfaces for clean data separation

⏳ **NEXT (TODAY):**
1. Set env vars in Lovable (5 min)
2. Pick real domain + point DNS (5 min)
3. Test: login → artists → releases → earnings (30 min)
4. Fix any bugs (if any)
5. Give access to internal team (Freezzo + 1-2 artists)

---

## Success Criteria for Soft Launch:

- [ ] Login works (Supabase user created)
- [ ] Artist roster loads (MongoDB query returns artists)
- [ ] Can attach release to artist (UPC/ISRC in Mongo)
- [ ] StreamGod check shows catalog health
- [ ] Royalty statement generates and saves to Mongo
- [ ] Dashboard shows earnings correctly
- [ ] All pages load under 2 seconds
- [ ] No console errors in browser
- [ ] System Status page shows ✅ for all 6 services

Once all ✅ → **ready for public marketing push.**

