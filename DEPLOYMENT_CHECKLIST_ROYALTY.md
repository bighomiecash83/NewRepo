# Royalty Lock-In Deployment Checklist

**Project**: DMF Music Platform - Royalty Lock-In System  
**Platform**: Firebase (Firestore + Cloud Functions)  
**Last Updated**: November 17, 2025

---

## Phase 1: Prerequisites ✅

- [ ] Firebase project created at https://console.firebase.google.com
- [ ] Firebase project has billing enabled
- [ ] Firebase project ID noted: `________________`
- [ ] Google Cloud Console access granted
- [ ] Node.js 20+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Git repository initialized for this project
- [ ] Team members have Firebase project access

---

## Phase 2: Project Setup

### 2.1 Configure Firebase Locally

- [ ] Navigate to project root: `cd dmf-music-platform`
- [ ] Create `.firebaserc` file with project ID
  ```json
  {
    "projects": {
      "default": "YOUR_PROJECT_ID"
    }
  }
  ```
- [ ] Login to Firebase CLI: `firebase login`
- [ ] Verify project: `firebase projects:list`
- [ ] Set active project: `firebase use default`

### 2.2 Install Dependencies

- [ ] Run `cd functions && npm install && cd ..`
- [ ] Verify no errors in installation
- [ ] Check Node modules installed: `ls functions/node_modules | wc -l`

### 2.3 Verify Project Structure

- [ ] Check `firebase.json` exists
- [ ] Check `firestore.rules` exists
- [ ] Check `firestore.indexes.json` exists
- [ ] Check `functions/src/index.ts` exists
- [ ] Check `functions/src/royalty/royaltyApi.ts` exists
- [ ] Check `functions/src/royalty/royaltyLogic.ts` exists
- [ ] Check `functions/src/types/RoyaltyTypes.ts` exists
- [ ] Check `functions/package.json` exists
- [ ] Check `functions/tsconfig.json` exists

---

## Phase 3: Local Testing (Emulator)

### 3.1 Start Emulator Suite

- [ ] Run: `firebase emulators:start --only firestore,functions`
- [ ] Verify output shows:
  ```
  ✔  Firestore Emulator started at http://localhost:8080
  ✔  Functions emulator started at http://localhost:5001
  ✔  Firestore UI available at http://localhost:4000
  ```
- [ ] Keep terminal running (don't Ctrl+C)

### 3.2 Test in New Terminal

- [ ] Open new terminal/PowerShell
- [ ] Create test artist profile:
  ```bash
  curl -X POST "http://localhost:5001/dmf-music-platform/us-central1/saveRoyaltyProfile" \
    -H "Content-Type: application/json" \
    -d '{
      "artistId": "TEST_ARTIST_001",
      "legalFirstName": "Test",
      "legalLastName": "Artist",
      "roles": ["Songwriter"],
      "isSongwriter": true,
      "consent": {
        "royaltyLockInEnabled": true,
        "allowAdminEnrollment": true,
        "consentTimestamp": "2025-11-17T00:00:00.000Z",
        "consentMethod": "InApp"
      },
      "enrollmentStatuses": []
    }'
  ```
- [ ] Verify response includes `"success": true`

- [ ] Test GET profile:
  ```bash
  curl "http://localhost:5001/dmf-music-platform/us-central1/getRoyaltyProfile?artistId=TEST_ARTIST_001"
  ```
- [ ] Verify response includes profile data

- [ ] Check Firestore Emulator UI: `http://localhost:4000`
  - [ ] Can see `royaltyProfiles` collection
  - [ ] Can see `TEST_ARTIST_001` document
  - [ ] Document shows all fields from POST

- [ ] Test release gate (create release first in Firestore UI):
  ```bash
  # Add to Firestore Emulator UI:
  # Collection: releases
  # Document ID: TEST_RELEASE_001
  # Content: {
  #   "contributors": [{"artistId": "TEST_ARTIST_001", "roles": ["Songwriter"]}]
  # }
  
  curl "http://localhost:5001/dmf-music-platform/us-central1/canPublishRelease?releaseId=TEST_RELEASE_001"
  ```
- [ ] Verify response shows blocking issues or canPublish: false

### 3.3 TypeScript Compilation

- [ ] Run: `cd functions && npm run build && cd ..`
- [ ] Verify `functions/lib/` directory created
- [ ] Verify no compilation errors
- [ ] Check `functions/lib/index.js` exists
- [ ] Check `functions/lib/royalty/royaltyApi.js` exists
- [ ] Check `functions/lib/royalty/royaltyLogic.js` exists

---

## Phase 4: Firestore Setup (Production)

### 4.1 Deploy Firestore Rules

- [ ] Run: `firebase deploy --only firestore:rules --dry-run`
  - [ ] Review proposed changes (should show rules file)
  - [ ] Verify no errors in output
- [ ] Run (actual): `firebase deploy --only firestore:rules`
- [ ] Verify output: `✔  Deployed firestore.rules`

### 4.2 Deploy Firestore Indexes

- [ ] Run: `firebase deploy --only firestore:indexes`
- [ ] Verify output: `✔  Deployed firestore.indexes`
- [ ] Note: Indexes may take 5-10 minutes to build in background
- [ ] Check progress in Firebase Console > Firestore > Indexes

### 4.3 Verify Firestore in Console

- [ ] Go to: https://console.firebase.google.com/project/YOUR_PROJECT/firestore
- [ ] Verify `royaltyProfiles` collection exists (empty)
- [ ] Verify `releases` collection exists (empty)
- [ ] Verify `artists` collection exists (empty)
- [ ] Verify `users` collection exists (empty)

---

## Phase 5: Cloud Functions Deployment

### 5.1 Deploy Functions

- [ ] Run: `firebase deploy --only functions --dry-run`
  - [ ] Review proposed functions (should list 5 functions)
  - [ ] Verify no errors
- [ ] Run (actual): `firebase deploy --only functions`
  - This will take 2-5 minutes
- [ ] Verify output lists all functions deployed:
  ```
  ✔  canPublishRelease
  ✔  deleteRoyaltyProfile
  ✔  getReleaseStatus
  ✔  getRoyaltyProfile
  ✔  saveRoyaltyProfile
  ```

### 5.2 Note Function URLs

- [ ] Copy Function URLs from deployment output
- [ ] Example format:
  ```
  https://us-central1-YOUR_PROJECT.cloudfunctions.net/getRoyaltyProfile
  https://us-central1-YOUR_PROJECT.cloudfunctions.net/saveRoyaltyProfile
  https://us-central1-YOUR_PROJECT.cloudfunctions.net/canPublishRelease
  ```
- [ ] Store in `.env` file or config:
  ```
  VITE_ROYALTY_API_BASE=https://us-central1-YOUR_PROJECT.cloudfunctions.net
  ```

### 5.3 Verify Functions in Console

- [ ] Go to: https://console.firebase.google.com/project/YOUR_PROJECT/functions
- [ ] Verify all 5 functions listed and "OK" status
- [ ] Click each function to view:
  - [ ] Memory usage
  - [ ] Timeout (60 seconds)
  - [ ] Last execution time
  - [ ] Error rate (should be 0%)

---

## Phase 6: Production Data Setup

### 6.1 Create Sample Artist

In Firestore Console, create collection `artists` with document `ARTIST_DEMO_001`:

```json
{
  "artistId": "ARTIST_DEMO_001",
  "stageName": "Demo Artist",
  "userId": "USER_DEMO_001",
  "createdAt": "2025-11-17T00:00:00.000Z"
}
```

- [ ] Document created and saved

### 6.2 Create Sample Royalty Profile

In Firestore Console, create collection `royaltyProfiles` with document `ARTIST_DEMO_001`:

```json
{
  "artistId": "ARTIST_DEMO_001",
  "userId": "USER_DEMO_001",
  "legalFirstName": "Demo",
  "legalLastName": "Artist",
  "stageNames": ["Demo Artist"],
  "dateOfBirth": "1990-01-01T00:00:00.000Z",
  "country": "US",
  "addressLine1": "123 Main St",
  "city": "Columbus",
  "stateOrRegion": "OH",
  "postalCode": "43215",
  "phoneNumber": "+1-614-000-0000",
  "email": "demo@example.com",
  "roles": ["Songwriter", "FeaturedArtist"],
  "isSongwriter": true,
  "isFeaturedArtist": true,
  "isLabelOwner": false,
  "isPublisher": false,
  "consent": {
    "royaltyLockInEnabled": true,
    "allowAdminEnrollment": true,
    "consentTimestamp": "2025-11-17T00:00:00.000Z",
    "consentMethod": "InApp"
  },
  "enrollmentStatuses": [
    {
      "org": "BMI",
      "scope": "Writer",
      "status": "Completed",
      "externalId": "BMI_DEMO_001",
      "lastUpdatedAt": "2025-11-17T00:00:00.000Z",
      "notes": "Demo enrollment"
    },
    {
      "org": "SoundExchange",
      "scope": "FeaturedArtist",
      "status": "Completed",
      "externalId": "SE_DEMO_001",
      "lastUpdatedAt": "2025-11-17T00:00:00.000Z",
      "notes": "Demo enrollment"
    }
  ],
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

- [ ] Document created and saved

### 6.3 Create Sample Release

In Firestore Console, create collection `releases` with document `RELEASE_DEMO_001`:

```json
{
  "releaseId": "RELEASE_DEMO_001",
  "title": "Demo Release",
  "contributors": [
    {
      "artistId": "ARTIST_DEMO_001",
      "roles": ["Songwriter", "FeaturedArtist"]
    }
  ],
  "status": "Draft",
  "releaseDate": "2025-12-01T00:00:00.000Z",
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

- [ ] Document created and saved

---

## Phase 7: Production API Testing

### 7.1 Test GET Profile

```bash
curl "https://us-central1-YOUR_PROJECT.cloudfunctions.net/getRoyaltyProfile?artistId=ARTIST_DEMO_001"
```

- [ ] Response status: 200 OK
- [ ] Response includes `"success": true`
- [ ] Response includes profile data with correct artist details

### 7.2 Test POST/Save Profile

```bash
curl -X POST "https://us-central1-YOUR_PROJECT.cloudfunctions.net/saveRoyaltyProfile" \
  -H "Content-Type: application/json" \
  -d '{
    "artistId": "ARTIST_DEMO_001",
    "email": "newemail@example.com"
  }'
```

- [ ] Response status: 200 OK
- [ ] Response includes `"success": true`
- [ ] Response includes updated profile with new email
- [ ] Verify in Firestore Console that email was updated

### 7.3 Test Release Gate

```bash
curl "https://us-central1-YOUR_PROJECT.cloudfunctions.net/canPublishRelease?releaseId=RELEASE_DEMO_001"
```

- [ ] Response status: 200 OK
- [ ] Response includes `"canPublish": true`
- [ ] Response includes `"blockingIssues": []`

### 7.4 Test Release Gate (Blocked)

In Firestore Console, create new release `RELEASE_BLOCKED_001`:

```json
{
  "releaseId": "RELEASE_BLOCKED_001",
  "title": "Blocked Release",
  "contributors": [
    {
      "artistId": "ARTIST_DEMO_001",
      "roles": ["Songwriter"]
    }
  ],
  "status": "Draft",
  "releaseDate": "2025-12-01T00:00:00.000Z"
}
```

Update ARTIST_DEMO_001's enrollmentStatuses to remove BMI Writer entry, then:

```bash
curl "https://us-central1-YOUR_PROJECT.cloudfunctions.net/canPublishRelease?releaseId=RELEASE_BLOCKED_001"
```

- [ ] Response status: 200 OK
- [ ] Response includes `"canPublish": false`
- [ ] Response includes blockingIssues with reason about missing BMI Writer
- [ ] Undo the changes to ARTIST_DEMO_001

### 7.5 Test CORS Headers

```bash
curl -i "https://us-central1-YOUR_PROJECT.cloudfunctions.net/getRoyaltyProfile?artistId=ARTIST_DEMO_001"
```

Check response headers:
- [ ] `Access-Control-Allow-Origin: *` present
- [ ] `Access-Control-Allow-Methods: GET, POST, OPTIONS` present

---

## Phase 8: Monitoring & Logging

### 8.1 Set Up Cloud Function Logging

- [ ] Go to: https://console.firebase.google.com/project/YOUR_PROJECT/functions/logs
- [ ] Verify logs from recent API calls are visible
- [ ] Check for any errors (should be none from successful tests)

### 8.2 View Function Performance

- [ ] Go to: https://console.firebase.google.com/project/YOUR_PROJECT/functions
- [ ] Click each function to view metrics:
  - [ ] Average execution time (should be <500ms)
  - [ ] Memory usage (should be <100MB)
  - [ ] Error rate (should be 0% after tests)

### 8.3 Set Up Cloud Monitoring Alerts (Optional)

- [ ] Go to: https://console.cloud.google.com/monitoring/alerting
- [ ] Create alert for Functions error rate > 5%
- [ ] Create alert for Functions timeout rate > 1%

---

## Phase 9: Frontend Integration

### 9.1 Update Frontend Configuration

- [ ] Add Firebase project ID to frontend `.env`:
  ```
  VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
  VITE_ROYALTY_API_BASE=https://us-central1-YOUR_PROJECT.cloudfunctions.net
  ```

### 9.2 Add RoyaltyApiClient to Frontend

- [ ] Copy `RoyaltyApiClient.ts` to frontend `src/api/` folder
- [ ] Update import path in components
- [ ] Initialize client with correct base URL

### 9.3 Test Frontend Integration

- [ ] Run frontend dev server: `npm run dev`
- [ ] Navigate to royalty profile page
- [ ] Test GET profile load:
  - [ ] Profile data displays correctly
  - [ ] No console errors
  - [ ] API call shows in Network tab
- [ ] Test POST profile update:
  - [ ] Form submission works
  - [ ] Data updates in Firestore (verify in console)
  - [ ] UI shows updated values
  - [ ] No console errors
- [ ] Test release gate:
  - [ ] Gate returns correct canPublish status
  - [ ] Blocking issues display to user
  - [ ] User can click enrollment links

---

## Phase 10: Security Verification

### 10.1 Test Firestore Rules

- [ ] Unauthenticated user tries to read profile:
  - [ ] Gets permission denied error ✅
- [ ] Artist user reads own profile:
  - [ ] Succeeds ✅
- [ ] Artist user reads another artist's profile:
  - [ ] Gets permission denied error ✅
- [ ] DMF staff user reads any profile:
  - [ ] Succeeds ✅
- [ ] DMF staff user updates any profile:
  - [ ] Succeeds ✅

### 10.2 Test API Input Validation

- [ ] Call API without required parameters:
  ```bash
  curl "https://us-central1-YOUR_PROJECT.cloudfunctions.net/getRoyaltyProfile"
  ```
  - [ ] Returns 400 error with helpful message

- [ ] Call API with malformed JSON:
  ```bash
  curl -X POST "https://us-central1-YOUR_PROJECT.cloudfunctions.net/saveRoyaltyProfile" \
    -H "Content-Type: application/json" \
    -d '{invalid json}'
  ```
  - [ ] Returns 500 error

### 10.3 Test Sensitive Data Handling

- [ ] Verify Firestore Console doesn't show full SSN:
  - [ ] Only last 4 digits visible (taxIdLast4)
- [ ] Verify API response doesn't expose full account numbers:
  - [ ] Only last 4 digits in responses
- [ ] Document where full sensitive data should be stored:
  - [ ] Google Secret Manager (recommended)
  - [ ] Or vault service (Hashicorp, AWS Secrets Manager)

---

## Phase 11: Documentation & Handoff

### 11.1 Verify Documentation

- [ ] `FIREBASE_ROYALTY_SETUP.md` is complete and accurate
- [ ] `ROYALTY_QUICK_REF.md` covers all common tasks
- [ ] `ROYALTY_VISUAL_GUIDE.md` has all diagrams
- [ ] `ROYALTY_SYSTEM_COMPLETE.md` has architecture overview
- [ ] `RoyaltyApiClient.ts` has inline JSDoc comments

### 11.2 Create Deployment Runbook

- [ ] Document step-by-step deploy process for team
- [ ] Include rollback procedures
- [ ] Include troubleshooting tips
- [ ] Include support contacts

### 11.3 Team Training

- [ ] Schedule training session for frontend team
- [ ] Demonstrate RoyaltyApiClient usage
- [ ] Walk through sample API calls
- [ ] Show error handling patterns
- [ ] Q&A

---

## Phase 12: Post-Launch Monitoring (First Week)

### 12.1 Daily Checks

- [ ] Check Firebase Console daily for errors
- [ ] Monitor API response times (should be <500ms)
- [ ] Monitor error rate (should be 0%)
- [ ] Check Firestore usage:
  - [ ] Read operations
  - [ ] Write operations
  - [ ] Cost estimate

### 12.2 User Feedback

- [ ] Collect feedback from first artists using feature
- [ ] Note any UI/UX issues
- [ ] Track any support tickets
- [ ] Plan improvements for Phase 2

### 12.3 Performance Tuning

- [ ] If APIs slow: Check Firestore indexes
- [ ] If costs high: Review query patterns
- [ ] If errors: Check Cloud Function logs

---

## Phase 13: Production Hardening

### 13.1 Enable Backups

- [ ] Enable Firestore automated backups:
  - [ ] Go to: Firestore > Backups
  - [ ] Set daily automated backup retention to 7 days

### 13.2 Enable Encryption

- [ ] Firestore encryption at rest is enabled by default ✅
- [ ] Enable CMEK (Customer-Managed Encryption Keys) if required

### 13.3 Set Budget Alerts

- [ ] Go to: Google Cloud Console > Billing
- [ ] Set budget alert for Firebase services:
  - [ ] Monthly budget: `$XXX`
  - [ ] Alert at 50%, 75%, 100%
- [ ] Configure email notifications

### 13.4 Add Rate Limiting (Optional)

- [ ] Consider adding Cloud Armor for DDoS protection
- [ ] Or implement rate limiting in Cloud Functions

---

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| `firebase: command not found` | Install: `npm install -g firebase-tools` |
| `Permission denied` errors | Check Firestore rules and auth token |
| Functions slow (>1 second) | Check Firestore indexes, increase memory |
| CORS errors from frontend | Verify `Access-Control-Allow-Origin` headers in function response |
| "Function not found" | Verify deployment: `firebase deploy --only functions` |
| TypeScript errors on build | Run `cd functions && npm install && npm run build` |

---

## Sign-Off

- [ ] All tests passed
- [ ] All documentation complete
- [ ] Team trained and ready
- [ ] Production monitoring set up
- [ ] Go-live approved

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Approved By**: _______________

---

**Next Phase**: Plan Phase 2 enhancements (email notifications, admin dashboard, webhooks)
