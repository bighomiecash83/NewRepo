# 🎵 DMF v2.0 – First 5 Artists Onboarding Runbook

**Purpose:** Complete end-to-end test with 5 real artists before public launch.

**Expected Duration:** ~2 hours per artist (can batch steps)

---

## Pre-Requisites

- [ ] Production backend running (`dmf-music-platform.Web`)
- [ ] Frontend running (`dmf-music-platform` React app)
- [ ] MongoDB seeded with pricing plans
- [ ] Admin account created with password
- [ ] Test artist accounts ready OR emails to invite

---

## 🎬 Step 1: Create Artist Accounts (5 Artists)

For each of the 5 artists, complete:

### Artist #1: [Name/Handle] _________________

- [ ] **Create User Account**
  - [ ] Method: Admin dashboard OR direct MongoDB insert
  - [ ] Username: `artist1_handle` (lowercase, no spaces)
  - [ ] Email: `artist1@example.com`
  - [ ] Role: `Artist`
  - [ ] Password: `TempPass123!` (they change on first login)
  - [ ] Is Active: `true`

- [ ] **Create Artist Profile**
  - [ ] Navigate to: `/admin/artists` or direct DB
  - [ ] Artist Name: Artist's real/stage name
  - [ ] Bio: 2-3 sentence description
  - [ ] Image URL: Profile pic (or placeholder)
  - [ ] Genre: Primary genre
  - [ ] Location: City/Region

- [ ] **Assign Pricing Plan**
  - [ ] Available plans: Starter / Pro / Enterprise (from `/api/pricing/plans`)
  - [ ] For test: Assign `Starter` plan
  - [ ] Confirm they can see pricing details at `/dashboard/artist/:artistId`

- [ ] **Confirm Login Works**
  - [ ] Login with: `artist1_handle` + `TempPass123!`
  - [ ] Should land on: `/dashboard/artist/:artistId`
  - [ ] Verify they see their artist ID in the UI
  - [ ] Change password to something permanent

---

### Artist #2–#5: Repeat

- [ ] Artist #2: _________________ (Username: `artist2_handle`)
- [ ] Artist #3: _________________ (Username: `artist3_handle`)
- [ ] Artist #4: _________________ (Username: `artist4_handle`)
- [ ] Artist #5: _________________ (Username: `artist5_handle`)

---

## 🎸 Step 2: Create Release via Release Wizard (1 per Artist)

For **each of the 5 artists**, complete:

### Artist #1 Release

- [ ] **Log in as Artist #1**
  - [ ] Navigate to: `/releases`
  - [ ] Click: "Create New Release" or "Upload"

- [ ] **Fill Release Metadata**
  - [ ] Release Title: `Test Release #1 - [Artist Name]`
  - [ ] Release Date: Today's date
  - [ ] Genre: Primary genre
  - [ ] Label: `DMF` (or auto-filled)
  - [ ] Type: `Album` or `Single` (doesn't matter for test)

- [ ] **Add Tracks (1–3 tracks)**
  - [ ] Track 1:
    - [ ] Title: `Track One`
    - [ ] ISRC: `US[RANDOM6DIGITS]` (or leave blank if not required)
    - [ ] Duration: `3:45` (or any valid duration)
    - [ ] Explicit: No
  - [ ] Track 2 (optional):
    - [ ] Title: `Track Two`
    - [ ] Duration: `4:12`
  - [ ] Track 3 (optional):
    - [ ] Title: `Track Three`
    - [ ] Duration: `3:30`

- [ ] **Upload Audio (if required)**
  - [ ] If system requires audio files, upload dummy/test files
  - [ ] Note: Can be silence or placeholder; we're testing workflow

- [ ] **Run QC Check**
  - [ ] Click: "Check Quality" or "Validate"
  - [ ] Review results:
    - [ ] ✅ If pass: See "QC Score: X/100" or similar
    - [ ] ⚠️ If fail: See specific issues (e.g., missing ISRC, invalid duration)
  - [ ] **Document any failures** – these are real UX issues to fix

- [ ] **Mark as Ready**
  - [ ] Click: "Mark Ready" or "Submit for Distribution"
  - [ ] Status should change to `ready_for_delivery` or similar
  - [ ] Confirm in `/releases` list shows status

- [ ] **Verify in Admin**
  - [ ] Log in as Admin
  - [ ] Navigate to: `/admin/releases`
  - [ ] Find artist1's release in the table
  - [ ] Confirm metadata matches what was entered

---

### Artist #2–#5 Releases: Repeat

- [ ] Artist #2 Release: `Test Release #2 - [Name]`
- [ ] Artist #3 Release: `Test Release #3 - [Name]`
- [ ] Artist #4 Release: `Test Release #4 - [Name]`
- [ ] Artist #5 Release: `Test Release #5 - [Name]`

---

## 📊 Step 3: Simulate Streams & Royalties (For All 5)

### Insert Test Stream Data

For **all 5 artists** and their **5 releases**, insert sample royalty import records:

- [ ] **Access MongoDB directly OR via admin API**
  - Option A: Mongo compass / Atlas UI
  - Option B: `/api/admin/royalties/import` endpoint (if exists)

- [ ] **Insert sample `royalty_imports`**
  - For each of the 5 releases, insert:
    ```json
    {
      "releaseId": "release_ID_from_step_2",
      "artistId": "artist1_handle",
      "trackTitle": "Track One",
      "platform": "spotify",
      "streams": 1000,
      "revenue": 45.50,
      "usageDate": "2025-11-18",
      "currency": "USD"
    }
    ```
  - Repeat for each track/artist combo (total ~15 entries if 5 artists × 3 tracks)
  - Vary streams: Artist 1 gets 5000, Artist 2 gets 2000, etc. (to test sorting)

- [ ] **Confirm imports visible in DB**
  - Query: `db.royalty_imports.find({}).count()`
  - Should show >= 15 records

- [ ] **Run Royalty Generation**
  - [ ] Via admin panel: `/admin/royalties/generate` (if exists)
  - OR manually trigger via MongoDB:
    ```javascript
    db.royalty_statements.insertOne({
      "artistId": "artist1_handle",
      "period": "2025-11",
      "streams": 1000,
      "revenue": 45.50,
      "dmfCut": 9.10,
      "netToArtist": 36.40,
      "status": "approved"
    })
    ```
  - Do this for all 5 artists

---

## 💰 Step 4: Check Earnings Dashboards

### Artist View

For **each of the 5 artists**:

- [ ] **Log in as Artist**
- [ ] **Navigate to: `/earnings` (or `/dashboard/artist/:artistId`)**
  - [ ] See "Streams (30d)" = populated with number from Step 3
  - [ ] See "Revenue (30d)" = calculated from streams × rate
  - [ ] See "Top Releases" = releases from Step 2, sorted by streams
  - [ ] See time series graph (daily streams over 7 days)

- [ ] **Click Statement** (if available)
  - [ ] `/earnings/:statementId`
  - [ ] See breakdown: Streams, Revenue, DMF Cut, Net to Artist
  - [ ] Verify math is correct (e.g., DMF cut = 20% of revenue)

- [ ] **Sign-Off**
  - [ ] Artist confirms they see realistic data
  - [ ] No missing fields or errors in rendering
  - [ ] Note any confusing UI elements

### Admin View

- [ ] **Log in as Admin**
- [ ] **Navigate to: `/admin/royalties`**
  - [ ] See table with all 5 artists
  - [ ] Each row shows: Artist, Streams, Revenue, Net
  - [ ] Can click each to see details
  - [ ] Sorting works (by streams, revenue, etc.)

- [ ] **Navigate to: `/dashboard/owner`**
  - [ ] See "Total Streams (30d)" = sum of all 5 artists
  - [ ] See "Gross Revenue (30d)" = sum of all
  - [ ] See "DMF Cut (30d)" = 20% of revenue
  - [ ] See "Net to Artists (30d)" = revenue - cut
  - [ ] See "Active Artists" = 5
  - [ ] See "Total Releases" = 5
  - [ ] See "Top 5 Releases" = list all 5 (sorted by streams)

---

## 🎯 Step 5: Verify All Dashboards

### Owner Dashboard Checklist

- [ ] **KPI Cards Present & Populated**
  - [ ] Total Streams: > 0
  - [ ] Gross Revenue: > 0
  - [ ] DMF Cut: 20% of revenue
  - [ ] Net to Artists: 80% of revenue
  - [ ] Active Artists: 5
  - [ ] Total Releases: 5
  - [ ] QC Issues: Count of releases with issues (likely 0)

- [ ] **Top Releases Table**
  - [ ] Shows all 5 releases
  - [ ] Sorted by streams (highest first)
  - [ ] Each row shows: Title, Artist, Streams, Revenue, QC Score

- [ ] **Performance & Load**
  - [ ] Page loads in < 2 seconds
  - [ ] No console errors (DevTools)
  - [ ] Tables are scrollable if data is large

### Artist Dashboards (Per Artist)

For each artist, verify:

- [ ] **URL Works**: `/dashboard/artist/artist1_handle`
- [ ] **KPI Cards**:
  - [ ] Streams (30d): Matches earnings page
  - [ ] Revenue (30d): Matches earnings page
- [ ] **Top Releases Table**: Lists their releases
- [ ] **Time Series**: Shows 7-day breakdown
- [ ] **No Other Artists' Data**: Can only see their own

### Access Control

- [ ] **Artist #1 tries to access `/dashboard/artist/artist2_handle`**
  - [ ] Should get **403 Forbidden** or redirect to their own dashboard
  - [ ] ✅ Security working

- [ ] **Unauthenticated user tries `/dashboard/owner`**
  - [ ] Should get **401 Unauthorized**
  - [ ] ✅ Auth working

---

## 📝 Step 6: Document Findings

### Issues Found

| Issue | Severity | Component | Notes | Action |
|-------|----------|-----------|-------|--------|
| Example: KPI card shows wrong cut % | 🔴 BLOCKER | Owner Dashboard | Math off by 1% | Fix in service |
| Example: Artist name truncated in table | 🟡 ANNOYING | Top Releases | UI UX issue | Widen column or use tooltip |
| Example: No loading state during data fetch | 🟢 NICE-TO-HAVE | Dashboards | Feels instant anyway | Polish item |
|  |  |  |  |  |
|  |  |  |  |  |

### Checklist Sign-Off

- [ ] All 5 artists onboarded successfully
- [ ] All 5 releases created and passing QC
- [ ] Stream data inserted and reflected in earnings
- [ ] All dashboards rendering correctly
- [ ] Access control enforced (artist can't see other artists)
- [ ] Admin can see all data
- [ ] No 🔴 blockers remain
- [ ] Any 🟡 or 🟢 issues noted for future

---

## 🚀 Next Steps

Once all steps complete with no blockers:

1. **Internal Announcement**: Notify your team v2.0 is ready
2. **Close the Loop**: Move to Launch Day Script (separate doc)
3. **First 5 Public Artists**: Invite first paying customers (same process)

---

**Runbook Version:** v2.0
**Last Updated:** 2025-11-19
**Expected Completion:** ~2 hours
**Team Lead Sign-Off:** _________________ (Date: _________)
