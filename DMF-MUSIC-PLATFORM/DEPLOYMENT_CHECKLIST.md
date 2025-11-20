# ?? Deployment Checklist - StreamGod Brain

Use this checklist to deploy the complete system to production.

---

## Pre-Deployment (Before You Start)

### Backend Requirements
- [ ] .NET 10.0 SDK installed
- [ ] Visual Studio 2022 or VS Code
- [ ] MongoDB Atlas account created
- [ ] MongoDB connection string obtained

### Frontend Requirements
- [ ] Lovable account set up
- [ ] Project repo connected to GitHub
- [ ] Node.js / npm installed (if testing locally)
- [ ] Google OAuth credentials configured

### Infrastructure
- [ ] Hosting platform selected (Azure, AWS, DigitalOcean, etc.)
- [ ] Domain name secured (if needed)
- [ ] SSL certificate ready (most platforms auto-generate)
- [ ] IP whitelist configured in MongoDB Atlas

---

## Phase 1: Backend Deployment (45 minutes)

### 1.1 Verify Build ?

- [ ] Open Visual Studio
- [ ] Load solution: `dmf-music-platform.sln`
- [ ] Build ? Clean Solution
- [ ] Build ? Build Solution
- [ ] Verify: **0 errors** (warnings in existing code OK)
- [ ] Check Output: `Build succeeded with X warning(s)`

### 1.2 Configure MongoDB

- [ ] Open `appsettings.json`
- [ ] Add MongoDB section:
```json
{
  "MongoDB": {
    "ConnectionString": "mongodb+srv://bighomiecash8346:YOUR_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/?appName=DMF-MUSIC-platform"
  }
}
```
- [ ] Replace `YOUR_PASSWORD` with actual MongoDB password
- [ ] Save file

### 1.3 Configure Google OAuth

- [ ] Open `appsettings.json`
- [ ] Verify Google OAuth section:
```json
{
  "Authentication": {
    "Google": {
      "ClientId": "YOUR_CLIENT_ID",
      "ClientSecret": "YOUR_CLIENT_SECRET"
    }
  }
}
```
- [ ] Obtain values from Google Cloud Console
- [ ] Add ClientId and ClientSecret
- [ ] Save file

### 1.4 Test Locally

- [ ] Press F5 to start debugging
- [ ] Wait for: "Now listening on: https://localhost:5001"
- [ ] Open browser: https://localhost:5001/api/catalog/health-check
- [ ] Expected response:
```json
{"status": "healthy", "mongodb": "connected"}
```
- [ ] Close debugger (Shift+F5)

### 1.5 Publish for Production

- [ ] Right-click project ? Publish
- [ ] Select target (Azure App Service / other)
- [ ] Configure app settings for production:
  - [ ] Connection string to production MongoDB
  - [ ] Google OAuth credentials (production app)
  - [ ] CORS allowed origins
- [ ] Publish
- [ ] Wait for deployment to complete
- [ ] Verify: Backend URL is live

### 1.6 Verify Production Backend

- [ ] Open browser: `https://your-backend-url/api/catalog/health-check`
- [ ] Expected: `{"status": "healthy", "mongodb": "connected"}`
- [ ] Note the backend URL for frontend configuration

---

## Phase 2: Frontend Deployment (30 minutes)

### 2.1 Add Files to Lovable

#### File 1: `src/services/catalogService.ts`
- [ ] Create file in Lovable
- [ ] Copy content from QUICK_START.md (catalogService section)
- [ ] Save file

#### File 2: `src/components/CatalogHealthDashboard.tsx`
- [ ] Create file in Lovable
- [ ] Copy content from QUICK_START.md (CatalogHealthDashboard section)
- [ ] Save file

#### File 3: Create `.env.local`
- [ ] Create file in project root
- [ ] Add:
```
REACT_APP_API_URL=https://your-backend-url/api
```
- [ ] Replace `your-backend-url` with actual URL from Phase 1.6
- [ ] Save file

### 2.2 Configure Environment Variables

- [ ] In Lovable dashboard ? Settings ? Environment Variables
- [ ] Add:
  - [ ] `REACT_APP_API_URL` = your backend URL
- [ ] Save

### 2.3 Test Locally (Optional)

- [ ] `npm install`
- [ ] `npm start`
- [ ] Open http://localhost:3000
- [ ] Verify dashboard loads (may show "Loading...")
- [ ] Check browser console for errors
- [ ] Try logging in via Google
- [ ] Close local server

### 2.4 Push to Git

- [ ] Stage files: `git add .`
- [ ] Commit: `git commit -m "feat: Add StreamGod dashboard"`
- [ ] Push: `git push origin main` (or master)

### 2.5 Verify Lovable Deployment

- [ ] Wait 2-5 minutes for auto-deployment
- [ ] Visit: https://dmf-music-platform.lovable.app
- [ ] Dashboard should load
- [ ] Check for any console errors (F12)

---

## Phase 3: Integration Testing (20 minutes)

### 3.1 Test Public Endpoint (No Auth)

```bash
curl https://your-backend-url/api/catalog/health-check
```

- [ ] Returns: `{"status": "healthy", "mongodb": "connected"}`
- [ ] Status code: 200

### 3.2 Test With Sample Data

- [ ] Use MongoDB CLI or Atlas UI to add test data:
  - [ ] 1 test release
  - [ ] 3 test tracks
- [ ] Sample release:
```json
{
  "_id": ObjectId(),
  "id": "test-rel-001",
  "title": "Test Album",
  "upc": "123456789012",
  "primaryArtistId": "artist-1",
  "releaseDate": ISODate("2025-02-01"),
  "genre": "Hip-Hop",
  "coverArtRef": "gs://bucket/cover.jpg",
  "status": "DRAFT"
}
```
- [ ] Sample tracks linked to release
- [ ] Verify data inserted correctly

### 3.3 Test Backend Analysis

- [ ] Log in to Lovable app
- [ ] Click "Refresh Analysis"
- [ ] Dashboard should show:
  - [ ] Summary: 1 release, 3 tracks
  - [ ] Readiness scores (0-100%)
  - [ ] Any issues detected
- [ ] Check browser console for errors

### 3.4 Test Recommendations

- [ ] Dashboard should show recommendations
- [ ] Should list items needing work
- [ ] Should show estimated fix times

### 3.5 Test Error Handling

- [ ] Stop MongoDB and test error display
- [ ] Should show: "Error: Failed to fetch"
- [ ] Should have "Retry" button
- [ ] Restart MongoDB
- [ ] Click retry ? Should work again

---

## Phase 4: Production Validation (20 minutes)

### 4.1 Load Testing (Optional but Recommended)

```bash
# Test with 10 concurrent requests
ab -n 100 -c 10 https://your-backend-url/api/catalog/health-check
```

- [ ] All requests succeed
- [ ] Response time < 1000ms
- [ ] No errors in logs

### 4.2 Security Audit

- [ ] Test without auth token:
```bash
curl https://your-backend-url/api/catalog/health
# Should return: 401 Unauthorized
```

- [ ] Test with invalid token:
```bash
curl -H "Authorization: Bearer invalid" \
  https://your-backend-url/api/catalog/health
# Should return: 401 Unauthorized
```

- [ ] Test with valid token:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend-url/api/catalog/health
# Should return: 200 OK + data
```

### 4.3 CORS Testing

- [ ] Open frontend dashboard
- [ ] Network tab (F12)
- [ ] Click refresh
- [ ] Look for CORS errors
- [ ] Should see: Status 200 for API calls
- [ ] No "blocked by CORS" messages

### 4.4 Uptime Monitoring Setup

- [ ] Configure health-check monitoring:
  - [ ] UptimeRobot, StatusPage, or similar
  - [ ] Monitor: `https://your-backend-url/api/catalog/health-check`
  - [ ] Interval: Every 5 minutes
  - [ ] Alert if down for >5 minutes

### 4.5 Logging Configuration

- [ ] Verify logs are being written
- [ ] Set up log aggregation (Azure App Insights, etc.)
- [ ] Configure alerts for errors

---

## Phase 5: Data Migration (If Applicable)

### 5.1 Prepare Data

- [ ] Export existing release data from current system
- [ ] Export existing track data
- [ ] Map fields to MongoDB schema

### 5.2 Transform Data

- [ ] Write migration script or use data pipeline
- [ ] Ensure all required fields are populated
- [ ] Validate record counts

### 5.3 Import Data

- [ ] Run import script
- [ ] Verify record counts match
- [ ] Spot-check 10 random records
- [ ] Run analysis and verify scores make sense

### 5.4 Validate Scoring

- [ ] For complete release: Should score 80-100%
- [ ] For incomplete release: Should score 0-70%
- [ ] Verify issues detected correctly

---

## Phase 6: Team Training (15 minutes)

### 6.1 Documentation

- [ ] Share EXECUTIVE_SUMMARY.md with team
- [ ] Share QUICK_START.md with team
- [ ] Walk through example: "What does 75% ready mean?"

### 6.2 Live Demo

- [ ] Open dashboard in team meeting
- [ ] Show:
  - [ ] Overall health summary
  - [ ] How to read scores
  - [ ] How to find worst items
  - [ ] How to interpret recommendations
- [ ] Let team ask questions

### 6.3 Access Setup

- [ ] Add team members to Google OAuth
- [ ] Verify they can log in
- [ ] Verify they can see data

---

## Post-Deployment (Ongoing)

### Daily (First Week)
- [ ] Check backend health: `curl health-check`
- [ ] Verify dashboard loads
- [ ] Check logs for errors
- [ ] Monitor response times

### Weekly (Ongoing)
- [ ] Review error logs
- [ ] Check uptime percentage
- [ ] Verify data is flowing correctly
- [ ] Ask team for feedback

### Monthly (Ongoing)
- [ ] Analyze scoring accuracy
- [ ] Adjust scoring logic if needed
- [ ] Update team on system improvements
- [ ] Plan feature enhancements

---

## Rollback Plan (If Needed)

### If Backend Fails
1. Check MongoDB connection
2. Verify Google OAuth credentials
3. Review error logs
4. Rollback to previous version: `git revert`
5. Redeploy

### If Frontend Fails
1. Check API_BASE URL in .env
2. Verify CORS policy
3. Clear browser cache
4. Rollback Lovable repo
5. Redeploy

### If Data Corrupted
1. Stop accepting API requests
2. Restore MongoDB backup
3. Verify data integrity
4. Resume service

---

## Success Criteria ?

You're done when:

- [ ] Backend responds with 200 to health-check
- [ ] Frontend dashboard loads without errors
- [ ] Dashboard shows real data from MongoDB
- [ ] Scoring is accurate (0-100% range)
- [ ] Issues are detected correctly
- [ ] Recommendations show top 10 items
- [ ] All endpoints return proper HTTP status codes
- [ ] No 401/403 errors for authenticated users
- [ ] No CORS errors in console
- [ ] Response times < 500ms
- [ ] Team can log in and use dashboard
- [ ] Uptime monitoring is configured
- [ ] Logs are being collected

---

## Final Verification Checklist

### 1. Backend
- [ ] Compiles without errors
- [ ] Runs successfully
- [ ] MongoDB connection works
- [ ] Google OAuth configured
- [ ] All 5 endpoints functional
- [ ] Returns proper JSON responses
- [ ] Handles errors gracefully

### 2. Frontend
- [ ] Files added to Lovable
- [ ] Environment variables configured
- [ ] Dashboard loads
- [ ] Can log in via Google
- [ ] Displays real data
- [ ] No console errors
- [ ] Mobile responsive

### 3. Integration
- [ ] Frontend ? Backend communication works
- [ ] Auth tokens properly validated
- [ ] CORS properly configured
- [ ] Error handling works end-to-end
- [ ] All flows tested

### 4. Monitoring
- [ ] Health-check endpoint monitored
- [ ] Errors alerted on
- [ ] Logs being collected
- [ ] Performance metrics tracked

### 5. Documentation
- [ ] Team has access to guides
- [ ] Troubleshooting guide available
- [ ] Contact info for support

---

## ?? You're Live!

When all checkboxes are checked, your StreamGod Brain is officially in production.

**Time to celebrate!** ????

---

**Deployment Date:** ____________
**Completed By:** ____________
**Approvals:**
- [ ] Backend Lead: ____________
- [ ] Frontend Lead: ____________
- [ ] Product Manager: ____________

---

**Need Help?** Refer to:
- QUICK_START.md - Deployment steps
- ARCHITECTURE_DIAGRAM.md - System overview
- STREAMGOD_COMPLETE.md - API documentation
