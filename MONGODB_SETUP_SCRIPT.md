# 🔧 MongoDB Setup - Execute This Script

**Status**: Ready to run  
**Database**: `dmf_music_platform`  
**Time**: 2 minutes  
**Run from**: mongosh CLI

---

## 📋 Before You Run

1. Connect to MongoDB Atlas:
```bash
mongosh "mongodb+srv://dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform" \
  --username bighomiecash8346
```

2. Enter password when prompted

3. Confirm you're in the right database:
```javascript
db.getName()
// Should output: dmf_music_platform
```

---

## ⚡ Execute This Complete Block

Copy and paste this entire script into mongosh:

```javascript
// ============================================
// DMF MUSIC PLATFORM - DATABASE INITIALIZATION
// ============================================

use dmf_music_platform;

print("🔨 Creating collections and indexes...");
print("");

// ============================================
// 1) ARTISTS COLLECTION
// ============================================
print("📝 Creating: artists");

db.createCollection("artists");

db.artists.createIndex({ artistId: 1 }, { unique: true });
db.artists.createIndex({ userId: 1 });
db.artists.createIndex({ stageName: "text" });
db.artists.createIndex({ status: 1 });
db.artists.createIndex({ createdAt: -1 });

print("✅ artists indexes created");
print("");


// ============================================
// 2) ROYALTY PROFILES COLLECTION
// ============================================
print("📝 Creating: royaltyProfiles");

db.createCollection("royaltyProfiles");

// 1:1 relationship with artists
db.royaltyProfiles.createIndex({ artistId: 1 }, { unique: true });

// Lock-in status lookups
db.royaltyProfiles.createIndex({ "consent.royaltyLockInEnabled": 1 });

// Enrollment status queries
db.royaltyProfiles.createIndex({ "proMemberships.bmi.hasAccount": 1 });
db.royaltyProfiles.createIndex({ "soundExchange.hasAccount": 1 });

// Combined query: "Who's missing both BMI AND SE?"
db.royaltyProfiles.createIndex(
  {
    "proMemberships.bmi.hasAccount": 1,
    "soundExchange.hasAccount": 1
  }
);

db.royaltyProfiles.createIndex({ updatedAt: -1 });

print("✅ royaltyProfiles indexes created");
print("");


// ============================================
// 3) RELEASES COLLECTION
// ============================================
print("📝 Creating: releases");

db.createCollection("releases");

db.releases.createIndex({ releaseId: 1 }, { unique: true });
db.releases.createIndex({ primaryArtistId: 1 });
db.releases.createIndex({ "contributors.artistId": 1 });
db.releases.createIndex({ "dspStatus.overall": 1 });
db.releases.createIndex({ releaseDate: -1 });
db.releases.createIndex({ createdAt: -1 });

// Text search on title
db.releases.createIndex({ title: "text" });

print("✅ releases indexes created");
print("");


// ============================================
// 4) ENROLLMENT TASKS COLLECTION (Optional but Recommended)
// ============================================
print("📝 Creating: enrollmentTasks");

db.createCollection("enrollmentTasks");

db.enrollmentTasks.createIndex({ taskId: 1 }, { unique: true });
db.enrollmentTasks.createIndex({ artistId: 1 });
db.enrollmentTasks.createIndex({ status: 1 });
db.enrollmentTasks.createIndex({ org: 1, scope: 1 });
db.enrollmentTasks.createIndex({ createdAt: -1 });

print("✅ enrollmentTasks indexes created");
print("");


// ============================================
// 5) RELEASES GATE LOGS COLLECTION (Audit Trail)
// ============================================
print("📝 Creating: releases_gate_logs");

db.createCollection("releases_gate_logs");

db.releases_gate_logs.createIndex({ releaseId: 1 });
db.releases_gate_logs.createIndex({ checkId: 1 }, { unique: true });
db.releases_gate_logs.createIndex({ timestamp: -1 });
db.releases_gate_logs.createIndex({ "check.passed": 1 });

print("✅ releases_gate_logs indexes created");
print("");


// ============================================
// VERIFICATION
// ============================================
print("🔍 VERIFICATION REPORT:");
print("");

print("Collections created:");
printjson(db.getCollectionNames());

print("");
print("Index summary:");
print("  artists: " + db.artists.getIndexes().length + " indexes");
print("  royaltyProfiles: " + db.royaltyProfiles.getIndexes().length + " indexes");
print("  releases: " + db.releases.getIndexes().length + " indexes");
print("  enrollmentTasks: " + db.enrollmentTasks.getIndexes().length + " indexes");
print("  releases_gate_logs: " + db.releases_gate_logs.getIndexes().length + " indexes");

print("");
print("✅ DATABASE INITIALIZATION COMPLETE");
print("");
print("Next steps:");
print("  1. Load test data: See MONGODB_TEST_DATA.md");
print("  2. Point backend to dmf_music_platform");
print("  3. Verify API endpoints can connect");
```

---

## ✅ What You Should See

After running the script, you should see:

```
🔨 Creating collections and indexes...

📝 Creating: artists
✅ artists indexes created

📝 Creating: royaltyProfiles
✅ royaltyProfiles indexes created

📝 Creating: releases
✅ releases indexes created

📝 Creating: enrollmentTasks
✅ enrollmentTasks indexes created

📝 Creating: releases_gate_logs
✅ releases_gate_logs indexes created

🔍 VERIFICATION REPORT:

Collections created:
[
  "artists",
  "royaltyProfiles",
  "releases",
  "enrollmentTasks",
  "releases_gate_logs"
]

Index summary:
  artists: 5 indexes
  royaltyProfiles: 6 indexes
  releases: 7 indexes
  enrollmentTasks: 5 indexes
  releases_gate_logs: 4 indexes

✅ DATABASE INITIALIZATION COMPLETE
```

---

## 🧪 Quick Verification Commands

After the script completes, run these one-by-one to verify:

```javascript
// Verify collections exist
db.getCollectionNames()

// Verify artists has the right indexes
db.artists.getIndexes()

// Verify royaltyProfiles has the compound index
db.royaltyProfiles.getIndexes()

// Count documents (should be 0 until you load test data)
db.artists.countDocuments()
db.royaltyProfiles.countDocuments()
db.releases.countDocuments()
```

---

## 📍 What Each Collection Does

| Collection | Purpose | Key Index |
|-----------|---------|-----------|
| `artists` | Brand-facing artist identity | `artistId` (unique) |
| `royaltyProfiles` | Enrollment status (1:1 with artists) | `artistId` (unique) |
| `releases` | Release metadata + distribution status | `releaseId` (unique) |
| `enrollmentTasks` | Ops tickets for enrollment follow-up | `taskId` (unique) |
| `releases_gate_logs` | Immutable audit trail of gate checks | `checkId` (unique) |

---

## 🔗 Collection Relationships

```
artists (5 indexes)
  │
  ├─→ royaltyProfiles (6 indexes)
  │     └─ 1:1 relationship on artistId
  │
  ├─→ releases (7 indexes)
  │     ├─ primaryArtistId → artists
  │     └─ contributors[].artistId → artists
  │
  └─→ enrollmentTasks (5 indexes)
        └─ artistId → artists

releases
  │
  └─→ releases_gate_logs (4 indexes)
        └─ releaseId → releases (immutable log)
```

---

## ⚡ Why These Specific Indexes?

**artists**:
- `artistId` (unique) → Primary lookup, prevent duplicates
- `userId` → Link to auth system
- `stageName` (text) → Search by artist name
- `status` → Filter active/inactive artists

**royaltyProfiles**:
- `artistId` (unique) → 1:1 with artists
- `consent.royaltyLockInEnabled` → Quick "who has lock-in enabled?"
- `proMemberships.bmi.hasAccount` → "Who's enrolled in BMI?"
- `soundExchange.hasAccount` → "Who's enrolled in SE?"
- Compound `(bmi.hasAccount, soundExchange.hasAccount)` → "Who's missing both?"

**releases**:
- `releaseId` (unique) → Primary lookup
- `primaryArtistId` → "All releases by artist X"
- `contributors.artistId` → "All releases artist X contributed to"
- `dspStatus.overall` → "Show me all live releases"
- `releaseDate` → Timeline views, sorting

**enrollmentTasks**:
- `taskId` (unique) → Primary lookup
- `artistId` → "All tasks for artist X"
- `status` → "Show open tasks"
- `org, scope` → "All BMI Writer tasks"

**releases_gate_logs**:
- `releaseId` → "Show all gate checks for this release"
- `checkId` (unique) → Prevent duplicate logs
- `timestamp` → Timeline, recent first
- `check.passed` → "Show all passed vs failed checks"

---

## 🚀 Next: Load Test Data

Once the schema is created, load test data:

```bash
# In mongosh (same session or new connection)
# See MONGODB_TEST_DATA.md for example documents

db.artists.insertOne({
  "_id": "ARTIST_BHC",
  "artistId": "ARTIST_BHC",
  "userId": "USER_123",
  ...
})
```

Or copy-paste examples from `MONGODB_TEST_DATA.md`.

---

## 🔒 Database Schema is Now LOCKED

After running this script:

✅ Collections created  
✅ Indexes in place  
✅ Ready for backend integration  
✅ Ready for test data loading  
✅ Ready for API endpoint testing

**Your backend team can now build against this exact schema.**

---

## 📝 Troubleshooting

**"Permission denied"**
- Make sure your MongoDB user has `readWrite` role on `dmf_music_platform`
- Check Atlas → Database Access → User Privileges

**"Collection already exists"**
- Run `db.artists.drop()` to delete, then run script again
- Or just skip the create and re-run the index creation

**"Index already exists"**
- MongoDB will silently skip duplicate index creation
- Safe to run script multiple times

**"Connection timeout"**
- Check internet connection
- Check MongoDB URI is correct
- Check IP whitelist in Atlas

---

## ✅ Ready to Ship

After this runs:

1. ✅ Schema locked (5 collections)
2. ✅ Indexes optimized (27 total)
3. ✅ Backend can connect
4. ✅ Ready for test data
5. ✅ Ready for API endpoint testing

**No more schema changes. Build from here.**

---

**Time to run**: 2 minutes  
**Status**: One-time operation  
**Difficulty**: Copy-paste  

🚀 Go.
