# 🚀 DMF v2.0 Launch Day Script

**Purpose:** Complete, step-by-step checklist for production launch.

**Timeline:** ~30 mins (preflight) + smoke tests + internal comms

**Audience:** DevOps Lead, Product Lead, Engineering Lead

---

## 🔧 Phase 1: Preflight (10 mins)

### Environment & Services

- [ ] **Backend Service Healthy**
  - [ ] SSH/RDP into production server
  - [ ] Confirm `dmf-music-platform.Web` process running
  - [ ] Check: `curl -s https://api.yourdomain.com/health | jq .`
  - [ ] Expected: `{"status":"ok","timestamp":"2025-11-19T..."}`

- [ ] **Frontend Service Healthy**
  - [ ] Confirm `dmf-music-platform` React app serving
  - [ ] Check: `curl -s https://yourdomain.com/ | grep -q "DMF"` (200 OK)

- [ ] **Database Connected**
  - [ ] MongoDB connection test:
    ```bash
    mongosh "mongodb+srv://user:pass@cluster.mongodb.net/dmf_music_platform" \
      --eval "db.users.countDocuments()"
    ```
  - [ ] Expected: Returns count >= 1 (at least admin user)

- [ ] **Redis/Cache (if used)**
  - [ ] Connect: `redis-cli ping`
  - [ ] Expected: `PONG`

### Git & Code

- [ ] **Git Status Clean on Main**
  - [ ] `git status` shows no uncommitted changes
  - [ ] All features merged into `main` branch
  - [ ] Branch is up-to-date with origin

- [ ] **Last Tag Verified**
  - [ ] `git describe --tags --abbrev=0` shows `v2.0-streamgod-dashboards` or later
  - [ ] Confirm this tag is deployed (not older code)

- [ ] **Environment Variables Set**
  - [ ] `echo $JWT_SECRET_KEY` | wc -c  → >= 32 characters
  - [ ] `echo $MONGO_CONNECTION_STRING` → starts with `mongodb+srv://`
  - [ ] All critical env vars present (no placeholder values)

- [ ] **HTTPS Certificate Valid**
  - [ ] `openssl s_client -connect yourdomain.com:443 -showcerts | grep "Verify return code"`
  - [ ] Expected: `Verify return code: 0 (ok)`

---

## 🧪 Phase 2: Smoke Tests (10–15 mins)

### Public Routes (No Auth Required)

```bash
# Test 1: Landing page
curl -s https://yourdomain.com/ -w "HTTP %{http_code}\n" -o /dev/null
# Expected: HTTP 200

# Test 2: Pricing page
curl -s https://yourdomain.com/pricing -w "HTTP %{http_code}\n" -o /dev/null
# Expected: HTTP 200

# Test 3: Public pricing API
curl -s https://api.yourdomain.com/api/pricing/plans | jq '.length'
# Expected: >= 1 (at least one plan)
```

### Health & Status Endpoints

```bash
# Test 4: Health endpoint
curl -s https://api.yourdomain.com/health | jq '.status'
# Expected: "ok"

# Test 5: Company profile (if public)
curl -s https://api.yourdomain.com/api/company/profile | jq '.branding.shortName'
# Expected: "DMF" or your company name
```

### Authentication

```bash
# Test 6: Login endpoint (POST)
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourAdminPassword"}' \
  | jq '.token'
# Expected: Long JWT token (starts with eyJ...)

# Save token for next tests
TOKEN="eyJ..."
```

### Protected Routes (Admin)

```bash
# Test 7: Owner dashboard (requires admin/owner role)
curl -s https://api.yourdomain.com/api/dashboard/owner \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.totalStreamsLast30'
# Expected: Number (can be 0 if no test data)

# Test 8: Admin releases
curl -s https://api.yourdomain.com/api/admin/releases \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.length'
# Expected: >= 0 (array)
```

### Artist Routes (With Artist Token)

```bash
# Test 9: Login as artist (if test artist exists)
ARTIST_TOKEN=$(curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"artist1","password":"password"}' \
  | jq -r '.token')

# Test 10: Artist dashboard (artist-specific data)
curl -s https://api.yourdomain.com/api/dashboard/artist/artist1 \
  -H "Authorization: Bearer $ARTIST_TOKEN" \
  | jq '.streamsLast30'
# Expected: Number (can be 0)

# Test 11: Artist tries to access another artist's data
curl -s https://api.yourdomain.com/api/dashboard/artist/artist2 \
  -H "Authorization: Bearer $ARTIST_TOKEN" \
  -w "HTTP %{http_code}\n" -o /dev/null
# Expected: HTTP 403 (Forbidden)
```

### CORS & Headers

```bash
# Test 12: CORS headers present
curl -s -I https://api.yourdomain.com/api/pricing/plans \
  -H "Origin: https://yourdomain.com" \
  | grep "Access-Control"
# Expected: Access-Control-Allow-Origin: https://yourdomain.com

# Test 13: Security headers
curl -s -I https://api.yourdomain.com/health | grep -E "X-Content-Type-Options|X-Frame-Options"
# Expected: Both headers present
```

### Browser Walkthrough (Frontend)

1. [ ] **Open https://yourdomain.com in browser**
   - [ ] Page loads without console errors
   - [ ] Logo/branding visible
   - [ ] Navigation works

2. [ ] **Click `/pricing`**
   - [ ] Pricing plans load
   - [ ] Can see at least one plan with price

3. [ ] **Click "Login" (top-right)**
   - [ ] Login form appears
   - [ ] Enter admin username/password
   - [ ] Redirects to `/dashboard/owner`

4. [ ] **Verify owner dashboard**
   - [ ] 7 KPI cards render (Streams, Revenue, Cut, etc.)
   - [ ] "Top Releases" table shows data (or empty if no releases)
   - [ ] No red error messages
   - [ ] No console errors (F12 → Console)

5. [ ] **Navigate to artist dashboard** (if test artist exists)
   - [ ] URL: `https://yourdomain.com/dashboard/artist/artist1`
   - [ ] KPIs render
   - [ ] Top releases table shows (if they have releases)

6. [ ] **Try to access another artist's dashboard**
   - [ ] URL: `https://yourdomain.com/dashboard/artist/artist2` (as artist1)
   - [ ] Should redirect or show 403
   - [ ] Does NOT show other artist's data

---

## ✅ Phase 3: Results Check

### All Tests Passed?

- [ ] Yes → Proceed to Phase 4 (Internal Announcement)
- [ ] No → **STOP – Document failure and fix before launch**

### If Any Test Failed

| Test # | Expected | Actual | Root Cause | Fix |
|--------|----------|--------|------------|-----|
| Example: #7 | 200 OK | 500 Server Error | Service crashed | Restart backend |
|  |  |  |  |  |
|  |  |  |  |  |

---

## 📢 Phase 4: Internal Announcement (5 mins)

### Slack/Email Announcement Template

```
🚀 **DMF-MUSIC-PLATFORM v2.0 is NOW LIVE IN PRODUCTION**

MODULES ONLINE:
✅ Pricing v1.0 – Rate cards & billing
✅ Distribution v1.1 – Release pipeline
✅ Royalties v1.2 – Artist earnings & payouts
✅ StreamGod v2.0 – Real-time dashboards

WHAT'S NEW IN v2.0:
📊 Owner Command Center (/dashboard/owner)
   • Total streams, revenue, DMF cut
   • Top releases by performance
   • QC health metrics

📈 Artist Performance Dashboard (/dashboard/artist/:id)
   • Personal streams & revenue (30-day)
   • Top releases
   • Time series trend (daily)

SECURITY:
🔐 Role-based access control (Owner/Admin/Artist)
🔐 JWT token authentication
🔐 Artist data isolation (can't see other artists)
🔐 CORS locked to approved domains

NEXT STEPS:
1. First 5 artists onboarded (see ONBOARDING_RUNBOOK_5_ARTISTS.md)
2. Feedback collected over next 2 weeks
3. Hotfixes for any blockers
4. Public launch (v2.0.1 or later)

ENDPOINTS:
POST /api/auth/login – Get JWT token
GET /api/pricing/plans – Public pricing
GET /api/dashboard/owner – Owner KPIs [Admin only]
GET /api/dashboard/artist/:id – Artist dashboard [Auth required]

STATUS: Stable & Production-Ready
SUPPORT: @DevOps for issues | @Product for features

Questions? #dmf-platform Slack channel
```

### Send Announcement To

- [ ] Engineering team
- [ ] Product team
- [ ] DevOps/Infrastructure team
- [ ] Stakeholders/Investors (if applicable)

---

## 🎯 Phase 5: Onboarding Script (First 5–10 Artists)

### Week 1: Guided Onboarding

For each of the first 5–10 artists/clients:

- [ ] **Scheduled call** (30 mins)
  - [ ] Walk through login
  - [ ] Show `/dashboard/artist/:id`
  - [ ] Explain how to create a release
  - [ ] Show earnings/royalties page
  - [ ] Answer questions

- [ ] **Provide docs**
  - [ ] Link to user guide (create if needed)
  - [ ] Contact for support (email/Slack)
  - [ ] FAQ (FAQ if needed)

- [ ] **Collect feedback**
  - [ ] "What was confusing?"
  - [ ] "What would help?"
  - [ ] "Any bugs?"
  - [ ] Add to Google Sheet or issue tracker

### Feedback Tracking Template

| Artist | Date | Feedback | Severity | Action |
|--------|------|----------|----------|--------|
| Artist 1 | 2025-11-20 | Upload button hard to find | 🟡 | Add tooltip |
| Artist 2 | 2025-11-20 | Can't see why release failed QC | 🔴 | Show error details |
|  |  |  |  |  |

---

## 🔧 Phase 6: Patch & Tag (As Needed)

### If Blockers Found

1. **Document issue** (add to Feedback Tracking above)
2. **Fix in dev branch**
3. **Test locally**
4. **Merge to main**
5. **Create hotfix tag**:
   ```bash
   git tag -a v2.0.1-streamgod-hotfix-1 \
     -m "v2.0.1 – Fixed artist QC error display"
   git push && git push --tags
   ```
6. **Deploy tag to production**
7. **Re-run smoke tests**

### Typical Hotfix Cadence

- Day 1–2: Critical fixes (🔴 blockers)
- Day 3–7: High-priority fixes (🟡 annoying)
- Week 2+: Polish (🟢 nice-to-have)

---

## 📊 Phase 7: Post-Launch Monitoring (Week 1)

### Daily Checklist

- [ ] **Error Rate**: Check logs for 5xx errors
  - [ ] Alert if > 1% of requests fail
  - [ ] Common errors: Database timeout? Auth token invalid? CORS issue?

- [ ] **Artist Feedback**: Review any support tickets/messages
  - [ ] Reply within 24h
  - [ ] Log issue if it's a bug

- [ ] **Database Size**: MongoDB storage trending OK?
  - [ ] Confirm backups running
  - [ ] Confirm retention policy active

- [ ] **Performance**: Sample `/dashboard/owner` response time
  - [ ] Expected: < 500ms
  - [ ] If > 1s, may need indexing

---

## 🎉 Final Checklist

| Item | Status |
|------|--------|
| All services healthy | ☐ |
| All smoke tests pass | ☐ |
| Security checklist green | ☐ |
| Internal announcement sent | ☐ |
| First 5 artists onboarded | ☐ |
| Feedback collection set up | ☐ |
| Monitoring/alerts active | ☐ |
| Post-launch docs ready | ☐ |

---

## 🚀 Launch Sign-Off

| Role | Name | Signature | Date | Time |
|------|------|-----------|------|------|
| **DevOps Lead** | __________ | __________ | __________ | __________ |
| **Product Lead** | __________ | __________ | __________ | __________ |
| **Engineering Lead** | __________ | __________ | __________ | __________ |

Once all 3 sign off, **v2.0 is officially live**.

---

## 📚 Related Docs

- **Security Checklist**: `SECURITY_CHECKLIST_v2.0.md`
- **Onboarding Runbook**: `ONBOARDING_RUNBOOK_5_ARTISTS.md`
- **API Reference**: `API.md`
- **Deployment Guide**: `DEPLOYMENT_AND_INTEGRATION_GUIDE.md`

---

**Launch Script Version:** v2.0
**Last Updated:** 2025-11-19
**Expected Completion:** ~1 hour
