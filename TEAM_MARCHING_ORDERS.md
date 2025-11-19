# ⚔️ Team Marching Orders - Phase 1 Lock-In

**Status**: 🟢 READY TO EXECUTE  
**Date**: 2025-11-17  
**Release Target**: Week of 2025-11-24

---

## 🎯 Mission

**Lock the database schema so zero guessing happens. Build the gate check that auto-blocks unprepared releases. Wire frontend to API.**

Everyone knows exactly what to build. No "what structure should releases use?" questions. No "where does this artistId go?" debates.

**By end of this sprint**: Frontend submits release → Backend checks gate → "Sorry, Artist X missing BMI enrollment" → Artist sees what's missing.

---

## 👨‍💻 Backend Team Marching Orders

### ✅ Task 1: Create MongoDB Collections + Indexes

**Owner**: Backend Lead + DBA  
**Time**: 30 minutes  
**Acceptance**: `db.releases.find()` returns documents matching schema

**Do this**:

1. Open MongoDB CLI or Studio (Atlas dashboard)
2. Navigate to database: `dmf_music_platform`
3. Run every command from `MONGODB_SCHEMA_LOCKED.md` section "MongoDB Setup Commands"
   - Create all 5 collections with validation
   - Create all indexes (don't skip indexes!)
   - Verify with `db.getCollectionNames()`

4. Verify indexes exist:
   ```javascript
   db.artists.getIndexes()
   db.royaltyProfiles.getIndexes()
   db.releases.getIndexes()
   db.enrollmentTasks.getIndexes()
   db.releases_gate_logs.getIndexes()
   ```

**Done when**: All 5 collections exist, all indexes created, no validation errors

---

### ✅ Task 2: Load Test Data

**Owner**: Backend Lead  
**Time**: 15 minutes  
**Acceptance**: `db.artists.find().count()` > 0

**Do this**:

1. Use `MONGODB_TEST_DATA.md` examples
2. For each collection, copy the example documents
3. Run in mongosh:
   ```javascript
   // artists
   db.artists.insertOne({ ... })
   db.artists.insertOne({ ... })
   
   // royaltyProfiles
   db.royaltyProfiles.insertOne({ ... })
   
   // releases
   db.releases.insertOne({ ... })
   
   // etc for other collections
   ```

4. Verify data loaded:
   ```javascript
   db.artists.countDocuments()          // Should be 3+
   db.royaltyProfiles.countDocuments() // Should be 3+
   db.releases.countDocuments()        // Should be 3+
   ```

**Done when**: Test data docs exist, queries return results

---

### ✅ Task 3: Update Backend to Match Schema

**Owner**: Backend Dev (Firebase or Lovable)  
**Time**: 2-3 hours  
**Acceptance**: All 5 endpoints return correct response shapes

**For Firebase Cloud Functions**:

1. Update `functions/src/royalty/royaltyApi.ts`:
   - `getRoyaltyProfile()` → reads `royaltyProfiles` collection
   - `saveRoyaltyProfile()` → writes to `royaltyProfiles`, returns updated doc
   - `deleteRoyaltyProfile()` → deletes from `royaltyProfiles`

2. Update `functions/src/royalty/royaltyLogic.ts`:
   - `canPublishRelease()` → reads `releases` collection
   - Loop `release.contributors[]` (NOT old `release.artists[]`)
   - Cross-check `royaltyProfiles.enrollmentStatuses` for each contributor
   - Write log to `releases_gate_logs` (not old collection)

3. Ensure types match `MONGODB_SCHEMA_LOCKED.md` exactly
   - `artistId` field names
   - `contributors` array structure
   - `enrollmentStatuses` array structure
   - Timestamp format (ISO 8601)

**For Lovable Backend**:

1. Use `LOVABLE_BACKEND_COMPLETE.md` as guide
2. Ensure all 5 endpoints match schema
3. Same type updates as Firebase above

**Done when**: 
- GET `/getRoyaltyProfile?artistId=artist-001` returns full profile
- POST `/saveRoyaltyProfile` saves to correct collection
- GET `/canPublishRelease?releaseId=release-001` correctly evaluates gate
- POST logs result to `releases_gate_logs`

---

### ✅ Task 4: Test Endpoints with Test Data

**Owner**: Backend Dev  
**Time**: 1 hour  
**Acceptance**: All 5 endpoints return expected shapes

**Do this**:

1. Start backend locally (Firebase emulator or Lovable dev server)

2. Test GET `/getRoyaltyProfile`:
   ```bash
   curl "http://localhost:3000/getRoyaltyProfile?artistId=artist-001"
   
   # Should return:
   # {
   #   "status": "success",
   #   "data": {
   #     "artistId": "artist-001",
   #     "enrollmentStatuses": [ ... ],
   #     "consent": { ... }
   #   }
   # }
   ```

3. Test POST `/saveRoyaltyProfile`:
   ```bash
   curl -X POST "http://localhost:3000/saveRoyaltyProfile" \
     -H "Content-Type: application/json" \
     -d '{
       "artistId": "artist-test",
       "legalFirstName": "Test",
       "legalLastName": "User",
       "email": "test@example.com",
       "consent": { "royaltyLockInEnabled": true, "agreedToTerms": true }
     }'
   ```

4. Test GET `/canPublishRelease`:
   ```bash
   # With release-001 (should pass)
   curl "http://localhost:3000/canPublishRelease?releaseId=release-001"
   
   # Should return: { "canPublish": true, "blockingIssues": [] }
   
   # With release-002 (should fail)
   curl "http://localhost:3000/canPublishRelease?releaseId=release-002"
   
   # Should return: { "canPublish": false, "blockingIssues": [...] }
   ```

5. Check MongoDB that logs were created:
   ```javascript
   db.releases_gate_logs.find().pretty()
   ```

**Done when**: All 5 endpoints respond with correct shapes + data

---

### ✅ Task 5: Deploy Backend

**Owner**: DevOps / Backend Lead  
**Time**: 30 minutes  
**Acceptance**: Production backend responds to health check

**For Firebase**:
```bash
cd functions
npm install
firebase deploy --only functions
```

**For Lovable**:
```bash
git add .
git commit -m "Phase 1: Lock-in schema and gate logic"
git push origin main
# Lovable auto-deploys
```

**Verify**:
```bash
curl https://your-backend/health
# Should return: { "status": "ok", ... }
```

**Done when**: Backend is live, endpoints respond from production URL

---

## 👨‍💼 Frontend Team Marching Orders

### ✅ Task 1: Read Documentation

**Owner**: Frontend Lead  
**Time**: 1 hour  
**Acceptance**: Team understands schema

**Read these in order**:

1. `MONGODB_SCHEMA_LOCKED.md` (data shapes)
2. `FRONTEND_HANDOFF.md` (API client + components)
3. `FRONTEND_INTEGRATION_TESTING.md` (what to test)

**Key takeaways**:
- Releases have `contributors[]` array (not `artists[]`)
- Each contributor has `artistId`, `roles[]`, `splitShare`
- Gate check must pass ALL contributors before publish
- `enrollmentStatuses` shows BMI/SoundExchange status per artist

**Done when**: Team agrees on data shapes, no questions left

---

### ✅ Task 2: Create Config + API Client

**Owner**: Frontend Dev  
**Time**: 30 minutes  
**Acceptance**: `getRoyaltyProfile()` works against production backend

**Do this**:

1. Create `src/config/backend.ts`:
   ```typescript
   export const DMF_BACKEND_BASE = 
     process.env.REACT_APP_BACKEND_URL ||
     "https://your-production-backend.url";
   ```

2. Create `src/api/royaltyApi.ts` (copy from `FRONTEND_HANDOFF.md`):
   - `getRoyaltyProfile(artistId)`
   - `saveRoyaltyProfile(profile)`
   - `deleteRoyaltyProfile(artistId)`
   - `canPublishRelease(releaseId)`
   - `getReleaseStatus(releaseId)`

3. Test locally:
   ```typescript
   const profile = await royaltyApi.getRoyaltyProfile("artist-001");
   console.log(profile);
   ```

**Done when**: API client returns data from backend

---

### ✅ Task 3: Create Components

**Owner**: Frontend Dev  
**Time**: 3-4 hours  
**Acceptance**: Components render without errors

**Create these**:

1. **RoyaltyStatusCard** (from `FRONTEND_HANDOFF.md`):
   - Shows lock-in status (enabled/disabled)
   - Lists BMI, SoundExchange statuses
   - Green if complete, yellow if in-progress, red if blocked

2. **RoyaltyCenterPage** (from `FRONTEND_HANDOFF.md`):
   - Form to edit royalty profile
   - Consent checkbox
   - Save/Delete buttons
   - Error handling

3. **ReleasePublishButton** (new):
   - Check gate before showing "Publish" option
   - If blocked, show tooltip: "Artist X missing BMI enrollment"
   - If clear, allow click → confirmation → submit
   - On submit: Send release to distribution queue

**Done when**: Components render, no console errors, data displays

---

### ✅ Task 4: Wire Everything Together

**Owner**: Frontend Dev  
**Time**: 2 hours  
**Acceptance**: Full flow works (view → edit → save → check gate)

**Do this**:

1. **On artist page**:
   - Load royalty profile: `getRoyaltyProfile(artistId)`
   - Display with `RoyaltyStatusCard`
   - Show `RoyaltyCenterPage` form
   - On save, call `saveRoyaltyProfile()`

2. **On release page**:
   - Load release: `getReleaseStatus(releaseId)`
   - Before publish button shows, call `canPublishRelease(releaseId)`
   - If `canPublish === false`:
     - Disable button
     - Show tooltip listing blocking artists
     - Show link "View enrollment status"
   - If `canPublish === true`:
     - Enable button
     - On click, show confirmation dialog
     - On confirm, submit to distribution API (Phase 2)

3. **Error handling**:
   - If API call fails, show user-friendly error
   - If backend is down, show "Backend unavailable"
   - Log errors for debugging

**Done when**: End-to-end flow works without backend dev involvement

---

### ✅ Task 5: Test Against Real Backend

**Owner**: QA / Frontend Dev  
**Time**: 2 hours  
**Acceptance**: All 27 test scenarios pass

**Run tests from `FRONTEND_INTEGRATION_TESTING.md`**:

1. **Unit tests** (API responses):
   - `getRoyaltyProfile()` with artist-001 → full data
   - `getRoyaltyProfile()` with artist-002 → partial data
   - `canPublishRelease()` with release-001 → `canPublish: true`
   - `canPublishRelease()` with release-002 → `canPublish: false`

2. **Component tests** (rendering):
   - RoyaltyStatusCard displays correctly
   - RoyaltyCenterPage form pre-populates
   - Validation errors show on blank fields
   - Publish button disabled when blocked

3. **E2E tests** (full flows):
   - Create new artist profile → see it in UI
   - Edit profile → verify save worked
   - Try to publish blocked release → get error with artist name
   - Artist completes enrollment → try publish again → succeeds

**Done when**: All 27 tests pass (see test checklist in `FRONTEND_INTEGRATION_TESTING.md`)

---

### ✅ Task 6: Deploy Frontend

**Owner**: DevOps / Frontend Lead  
**Time**: 15 minutes  
**Acceptance**: Production frontend loads, API calls work

**Do this**:

```bash
npm run build
npm run deploy  # or your deployment process
```

**Verify**:
- Site loads
- Royalty Center page shows
- Can fetch artist profile
- Can save changes
- Can check release gate

**Done when**: Frontend is live, users can access it

---

## 🧪 QA Team Marching Orders

### ✅ Task 1: Prepare Test Environment

**Owner**: QA Lead  
**Time**: 30 minutes  
**Acceptance**: Test backend + test data ready

**Do this**:

1. Confirm test data loaded in MongoDB (coordinate with Backend Team Task 2)
2. Confirm backend is running (health check should pass)
3. Get production backend URL from DevOps
4. Document in test plan:
   - Backend URL
   - Test artist IDs (artist-001, artist-002, etc.)
   - Test release IDs (release-001, release-002, etc.)

**Done when**: Test environment documented, backend responsive

---

### ✅ Task 2: Run Full Test Suite

**Owner**: QA Engineer  
**Time**: 2 hours  
**Acceptance**: Test report with 27/27 passing

**Do this**:

1. Follow `FRONTEND_INTEGRATION_TESTING.md` exactly
2. Test Suite 1: getRoyaltyProfile (4 scenarios)
3. Test Suite 2: saveRoyaltyProfile (3 scenarios)
4. Test Suite 3: deleteRoyaltyProfile (2 scenarios)
5. Test Suite 4: canPublishRelease (4 scenarios)
6. Test Suite 5: getReleaseStatus (2 scenarios)
7. Test Suite 6: Components (5 scenarios)
8. Test Suite 7: E2E (2 workflows)
9. Test Suite 8: Error handling (5 scenarios)

Fill in the results table in `FRONTEND_INTEGRATION_TESTING.md`

**Done when**: Results table 27/27 pass, no blockers

---

### ✅ Task 3: Sign-Off Report

**Owner**: QA Lead  
**Time**: 30 minutes  
**Acceptance**: Signed test report delivered to PM

**Create report**:

```
TEST REPORT - Phase 1 Lock-In
Date: 2025-11-17
Tester: [Name]
Backend: [URL]
Frontend: [URL]

Results:
- API Tests: 27/27 PASS ✅
- Performance: All endpoints <500ms ✅
- Error Handling: All scenarios work ✅
- E2E Flows: Both workflows complete ✅

Blockers: NONE ✅
Recommendations: [Any optimizations]

Sign-off: [Name], [Date]
```

**Done when**: Report signed off by QA Lead

---

## 👷 DevOps Marching Orders

### ✅ Task 1: Prepare Environment Variables

**Owner**: DevOps Lead  
**Time**: 15 minutes  
**Acceptance**: `.env` files configured for Dev + Staging + Prod

**Create**:

**.env.development**:
```env
MONGODB_URI=mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**.env.staging**:
```env
MONGODB_URI=mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform
NODE_ENV=staging
PORT=3000
FRONTEND_URL=https://staging-frontend.dmf.dev
```

**.env.production**:
```env
MONGODB_URI=mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform
NODE_ENV=production
PORT=443
FRONTEND_URL=https://dmf.app
```

**Done when**: All 3 `.env` files created, secrets in vault (not in git)

---

### ✅ Task 2: Deploy Backend

**Owner**: DevOps Engineer  
**Time**: 1 hour  
**Acceptance**: Production backend responds

**Do this**:

**For Firebase**:
```bash
cd functions
npm ci
firebase deploy --only functions --project=dmf-production
```

**For Lovable**:
- Trigger deployment in Lovable dashboard
- Or: `git push origin main` (auto-deploys)

**Verify**:
```bash
curl https://your-backend/health
# Should return 200 OK
```

**Done when**: Backend deployed, health check passes

---

### ✅ Task 3: Deploy Frontend

**Owner**: DevOps Engineer  
**Time**: 30 minutes  
**Acceptance**: Frontend loads, API calls work

**Do this**:

```bash
npm run build
npm run deploy  # Your deployment process
```

Set environment variable:
```
REACT_APP_BACKEND_URL=https://your-backend.url
```

**Verify**:
```bash
curl https://your-frontend.url
# Should load HTML (200 OK)
```

**Done when**: Frontend deployed, API calls work to backend

---

### ✅ Task 4: Monitoring Setup

**Owner**: DevOps Lead  
**Time**: 30 minutes  
**Acceptance**: Alerts configured

**Set up monitoring**:

1. **Backend health**:
   - Alert if `/health` fails
   - Alert if response time > 1s
   - Alert on 5xx errors

2. **Database**:
   - Alert if connection pool saturated
   - Alert on slow queries (>1s)
   - Alert on failed backups

3. **Frontend**:
   - Alert on failed deployments
   - Alert on CDN errors
   - Alert on 4xx spikes

**Done when**: Alerts configured, team gets Slack/email notifications

---

## 📅 Sprint Timeline

| Day | Backend | Frontend | QA | DevOps |
|-----|---------|----------|-----|--------|
| **Mon** | Collections + indexes (1-2h) | Read docs (1h) | Prep env (30m) | Prepare secrets (30m) |
| | Load test data (30m) | Config + API client (30m) | | Staging config (30m) |
| **Tue** | Update code for schema (3h) | Components (3-4h) | | |
| | Test endpoints (1h) | Wire together (2h) | Run tests (2h) | Monitor setup (30m) |
| **Wed** | Fix issues (1h) | Deploy frontend (30m) | Sign-off (30m) | Deploy backend (1h) |
| | Deploy backend (30m) | Smoke test (30m) | | Deploy frontend (30m) |
| **Thu** | Monitoring (30m) | Performance tuning | UAT | Verify all systems |
| **Fri** | Buffer / optimization | Buffer / polish | Buffer / edge cases | Buffer / cleanup |

**Total**: ~40 backend hours, ~25 frontend hours, ~5 QA hours, ~5 DevOps hours

---

## 🎯 Definition of Done

### Backend ✅
- [ ] 5 collections created with indexes
- [ ] Test data loaded
- [ ] All code updated to match schema
- [ ] 5 endpoints tested with curl
- [ ] Deployed to production
- [ ] Health check passes
- [ ] Logs being written to `releases_gate_logs`

### Frontend ✅
- [ ] API client created
- [ ] RoyaltyStatusCard component works
- [ ] RoyaltyCenterPage component works
- [ ] ReleasePublishButton gates correctly
- [ ] E2E flow works (view → edit → save → check gate)
- [ ] All 27 tests pass
- [ ] Deployed to production
- [ ] No console errors

### QA ✅
- [ ] All 27 test scenarios executed
- [ ] All 27 tests pass
- [ ] Test report signed off
- [ ] Blockers list empty

### DevOps ✅
- [ ] Secrets in vault (not in git)
- [ ] Backend deployed + healthy
- [ ] Frontend deployed + working
- [ ] Monitoring alerts configured
- [ ] Backups verified

---

## 🚨 Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Schema mismatch | API returns wrong shape | Frontend reads `MONGODB_SCHEMA_LOCKED.md` |
| Missing indexes | Slow queries | DevOps runs all index commands |
| Test data not loaded | Tests fail | QA confirms counts before testing |
| Endpoint delay | Integration fails | Backend tests locally first |
| Frontend deploy fails | Users can't access | DevOps has rollback plan |

---

## 📞 Daily Standup Questions

**Backend**: "Do you have all 5 endpoints talking to MongoDB?"  
**Frontend**: "Are you reading the schema from the locked doc?"  
**QA**: "Can you run the test suite?"  
**DevOps**: "Is the backend responding to health checks?"

If answer is "no" to any, blocker. Unblock immediately.

---

## 🎉 Success Criteria

**By end of sprint**:

✅ User creates release with 2 featured artists  
✅ System auto-checks: "Artist 1 has BMI, Artist 2 missing SoundExchange"  
✅ User sees error: "Complete SoundExchange enrollment before publishing"  
✅ User clicks link → goes to Royalty Center  
✅ User completes enrollment  
✅ User returns to release → "You're ready to publish!" ✅  
✅ User clicks Publish → release goes to distribution  
✅ DMF team logs gate check in audit trail  

**That's production-ready.**

---

**Status**: 🟢 READY TO EXECUTE  
**Questions?** See `MONGODB_SCHEMA_LOCKED.md` for data shapes. See `FRONTEND_HANDOFF.md` for API details.  
**Let's ship it.** 🚀
