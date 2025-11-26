# 🎬 Action Plan: #3, #5, #6 (ENV → E2E → Domain)

## #3: Lock ENV Vars in Lovable (5 min)

### Go to Lovable.dev Project Settings

1. **Login to Lovable** → Select your DMF project
2. **Click Settings** (gear icon)
3. **Environment Variables** section
4. **Add these variables:**

```
# ========== CORE API ==========
ASPNETCORE_ENVIRONMENT=Production
CORE_API_BASE_URL=https://api.dmf-music-platform.com

# ========== MONGODB (REAL PRODUCTION) ==========
MONGO_CONNECTION_STRING=mongodb+srv://bighomiecash8346:***@dmf-music-platform.pfqrhc.mongodb.net/
MONGO_DATABASE_NAME=DMF_MUSIC_PLATFORM

# ========== SUPABASE (REAL PRODUCTION) ==========
SUPABASE_URL=https://[your-instance].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
SUPABASE_DB_CONNECTION_STRING=postgresql://postgres:[pass]@db.[instance].supabase.co:5432/postgres

# ========== FRONTEND CONFIG ==========
VITE_API_BASE_URL=https://api.dmf-music-platform.com
VITE_APP_ENVIRONMENT=production

# ========== SECRETS ==========
DMF_APP_API_KEY=dmf_prod_[generate-strong-key]
OPENAI_API_KEY=sk-[your-key]
GEMINI_API_KEY=AIza[your-key]
JWT_SECRET=[generate-strong-secret]
```

5. **Click Deploy** (Lovable will rebuild with these vars)
6. **Wait for deployment to complete** (usually 2-5 min)

### Verify Deployment

Once deployed, test:

```bash
# No API key needed - should return OK
curl https://api.dmf-music-platform.com/health

# Should show status of all 6 services
curl https://api.dmf-music-platform.com/system/status
```

If both return JSON with no errors → **ENV vars are locked in. ✅**

---

## #5: Run Full E2E Test (30 min)

### Prerequisites (before testing)

**You need:**
- Real artist data in MongoDB (at least 1 artist with email)
- Real release data in MongoDB (at least 1 release with UPC/ISRC)
- Supabase configured (users table, auth enabled)

### 7-Step E2E Flow

**Go to: https://api.dmf-music-platform.com** (or your deployed Lovable URL)

#### Step 1: LOGIN
- Click "Login"
- Create new Supabase user (email + password)
- Email verification optional in dev
- **Expected:** Redirected to dashboard
- **Test result:** ✅ / ❌

#### Step 2: LOAD ARTIST ROSTER
- Click "Artists" in sidebar
- **Expected:** List of artists from MongoDB
- **Should show:** email, stage_name, monthly_listeners, is_active
- **Test result:** ✅ / ❌

#### Step 3: PICK ONE ARTIST
- Click on an artist name
- **Expected:** Artist detail page loads
- **Should show:** bio, releases count, total earnings
- **Test result:** ✅ / ❌

#### Step 4: ATTACH/VIEW RELEASE
- Click "Releases" in sidebar
- **Expected:** List of releases from MongoDB
- **Should show:** title, release_date, UPC, ISRC, tracks, status
- Click on a release to view details
- **Test result:** ✅ / ❌

#### Step 5: TRIGGER STREAMGOD
- Click "System Status" (in Settings or Admin)
- **Expected:** Page shows 6 services
- **Look for:** StreamGod = ✅ (green)
- Catalog health showing % ready
- **Test result:** ✅ / ❌

#### Step 6: GENERATE ROYALTY STATEMENT
- Click "Artist Earnings" or "Royalties"
- **Expected:** Current earnings statement displays
- **Should show:** period, gross earnings, fees, net earnings, status, payout date
- **If no data:** Create test statement via API:
  ```bash
  curl -X POST https://api.dmf-music-platform.com/api/royalties \
    -H "x-dmf-api-key: dmf_prod_***" \
    -H "Content-Type: application/json" \
    -d '{
      "artist_id": "[artist-from-mongo]",
      "period_start": "2025-11-01",
      "period_end": "2025-11-30",
      "gross_earnings": 1250.50,
      "fees": 125.05,
      "status": "pending"
    }'
  ```
- **Test result:** ✅ / ❌

#### Step 7: VIEW IN DASHBOARD
- Click "Dashboard" (main view)
- **Expected:** All stats update from real Mongo data
- **Should show:**
  - Total artists
  - Total releases
  - Total earnings
  - Active payouts
  - Monthly growth
- **Test result:** ✅ / ❌

### Success = All 7 ✅

If all 7 steps work with real data → **E2E is PASS. ✅**

If any fail:
1. Check browser console (F12) for errors
2. Check `/system/status` endpoint for which service is down
3. Verify ENV vars in Lovable match production MongoDB/Supabase
4. Check MongoDB Atlas for actual data
5. Check Supabase for user creation + tables

---

## #6: Attach Real Domain + HTTPS (5 min)

### Option A: Use existing domain you own

**Example:** `dmf-music-platform.com`

1. **Add subdomain records in your DNS provider:**

```
Type: A or CNAME
Name: api
Points to: [lovable-deployment-ip-or-cname]
TTL: 3600
```

Or:

```
Type: CNAME
Name: portal
Points to: [lovable-deployment-cname]
TTL: 3600
```

2. **Lovable auto-provisions HTTPS** (Let's Encrypt)
   - Wait 5-10 minutes for SSL cert to generate
   - Test: `curl https://api.dmfmusicplatform.com/health`

3. **Update ENV vars in Lovable:**
   - Change `CORE_API_BASE_URL=https://api.dmf-music-platform.com`
   - Change `VITE_API_BASE_URL=https://api.dmf-music-platform.com`
   - **Redeploy**

### Option B: Register new domain

1. **Pick domain:**
   - `dmf-api.com`
   - `streamgod-records.com`
   - `portal.dmfrecords.com`
   - etc.

2. **Register with GoDaddy, Namecheap, etc.**

3. **Point nameservers to Lovable** (Lovable provides DNS instructions after you connect domain)

4. **Lovable provisions HTTPS** (automatic)

5. **Update ENV vars** and redeploy

### Verify HTTPS Works

```bash
# Should return 200 OK with JSON
curl -I https://api.dmf-music-platform.com/health

# Should show certificate is valid
curl -v https://api.dmf-music-platform.com/health 2>&1 | grep "subject="
```

---

## Summary: What Happens Next

| Step | Action | Owner | Time |
|------|--------|-------|------|
| #3 | Set ENV vars in Lovable + deploy | You | 5 min |
| #3 | Verify `/health` + `/system/status` | You | 2 min |
| #5 | Run 7-step E2E flow on deployed app | You | 30 min |
| #5 | Fix any bugs (only blocking ones) | You | ? |
| #6 | Pick domain + update DNS | You | 5 min |
| #6 | Verify HTTPS cert is live | You | 5 min |
| #7 | Give Freezzo + 1-2 artists access | You | 5 min |

**Total time to soft launch:** ~60 minutes (if no bugs found)

---

## Expected Outcomes

**After #3 (ENV vars):**
- All endpoints accessible via HTTPS
- Mongo connected (check `/health`)
- Supabase connected (check `/system/status`)

**After #5 (E2E test):**
- Users can log in (Supabase)
- Artists visible (MongoDB)
- Releases visible (MongoDB)
- Earnings calculated (MongoDB)
- Dashboard updates live

**After #6 (Domain):**
- Beautiful HTTPS URL instead of random Lovable link
- Ready for marketing materials
- Can share with team + artists

---

## Red Flags (Watch For)

| Issue | Solution |
|-------|----------|
| `/health` returns 500 | MongoDB connection string wrong. Check MONGO_CONNECTION_STRING in Lovable env vars. |
| `/system/status` shows Mongo = DOWN | MongoDB IP whitelist. Go to MongoDB Atlas → Network Access → add Lovable IP. |
| `/system/status` shows Supabase = DOWN | Supabase connection string wrong or instance doesn't exist. Check SUPABASE_URL. |
| Login fails (creates user but can't sign in) | Supabase auth not enabled. Go to Supabase → Authentication → Providers → Email auth ON. |
| Artists list is empty | No artists in MongoDB. Insert test data or check MONGO_DATABASE_NAME is correct. |
| Earnings show $0 | No royalty statements created yet. Either create via API (step #6) or check MongoDB for data. |
| HTTPS cert not working | Wait 10 minutes for Let's Encrypt to provision. Check Lovable deployment logs. |

---

## You're Ready. Let's Go.

**Next:** Execute #3 now. Report back with results.

