# 📚 DMF Database Quick Reference

**For**: Backend developers, ops tools, analytics  
**Keep it**: Next to your code  
**Update it**: Never (schema is locked)

---

## 🎯 Collections at a Glance

```
artists           - Who this person is
  ↓ (1:1 relationship)
royaltyProfiles   - Enrollment status
  
releases          - Release metadata + DSP status
  ↓ (contributors reference artists)
releases_gate_logs - Audit trail (immutable)

enrollmentTasks   - Ops tickets (optional)
```

---

## 📍 `artists` Collection

**Purpose**: Brand-facing artist identity  
**Primary Key**: `artistId` (unique)  
**Unique Fields**: `artistId`, `userId`, `primaryEmail`

### Core Fields

```javascript
{
  _id: "ARTIST_BHC",
  artistId: "ARTIST_BHC",
  userId: "USER_123",                    // Links to auth system
  stageName: "Big Homie Cash",
  legalName: "DeAngelo Jackson",
  primaryEmail: "email@example.com",
  primaryPhone: "+1-614-000-0000",
  status: "Active",                      // Active | Inactive | Pending
  roles: ["Artist", "Songwriter", "Label"],
  labelName: "DMF Records Fly Hoolie ENT",
  createdAt: ISODate("2025-11-17T..."),
  updatedAt: ISODate("2025-11-17T...")
}
```

### Common Queries

```javascript
// Get artist by ID
db.artists.findOne({ artistId: "ARTIST_BHC" })

// Find by user ID (auth link)
db.artists.findOne({ userId: "USER_123" })

// Search by stage name
db.artists.find({ $text: { $search: "big homie" } })

// All active artists
db.artists.find({ status: "Active" })

// Count active artists
db.artists.countDocuments({ status: "Active" })
```

### Indexes

```
artistId (unique)
userId
stageName (text)
status
createdAt (-1)
```

---

## 📍 `royaltyProfiles` Collection

**Purpose**: Enrollment status & lock-in info  
**Primary Key**: `artistId` (unique, 1:1 with artists)  
**Related To**: artists (artistId must exist in artists)

### Core Fields

```javascript
{
  _id: "ARTIST_BHC",
  artistId: "ARTIST_BHC",                // FK to artists.artistId
  
  // Personal info
  legalFirstName: "DeAngelo",
  legalLastName: "Jackson",
  email: "bighomiecash8346@gmail.com",
  phone: "+1-614-000-0000",
  
  // Royalty lock-in consent
  consent: {
    royaltyLockInEnabled: true,
    agreedToTerms: true,
    agreedAtUtc: ISODate("2025-11-01T...")
  },
  
  // PRO membership enrollment
  proMemberships: {
    bmi: {
      hasAccount: true,
      accountNumber: "12345678",
      enrolledAtUtc: ISODate("2025-11-02T..."),
      completedAtUtc: ISODate("2025-11-05T...")
    },
    ascap: {
      hasAccount: false,
      enrolledAtUtc: null,
      reason: "Artist chose BMI + SE only"
    },
    sesac: {
      hasAccount: false
    }
  },
  
  // SoundExchange enrollment
  soundExchange: {
    hasAccount: true,
    accountNumber: "SE12345",
    roles: ["FeaturedArtist", "RightsOwner"],
    enrolledAtUtc: ISODate("2025-11-02T..."),
    completedAtUtc: ISODate("2025-11-07T...")
  },
  
  // Payout info
  payoutInfo: {
    preferredMethod: "ACH",
    bankName: "Chase Bank",
    accountHolder: "DeAngelo Jackson",
    routingNumber: "[encrypted]",
    accountNumber: "[encrypted]"
  },
  
  // Tax info
  taxInfo: {
    w9Filed: true,
    w9FiledAtUtc: ISODate("2025-11-01T...")
  },
  
  createdAt: ISODate("2025-11-01T..."),
  updatedAt: ISODate("2025-11-17T...")
}
```

### Common Queries

```javascript
// Get royalty profile for artist
db.royaltyProfiles.findOne({ artistId: "ARTIST_BHC" })

// Find all artists with lock-in ENABLED
db.royaltyProfiles.find({ "consent.royaltyLockInEnabled": true })

// Find artists with BMI account
db.royaltyProfiles.find({ "proMemberships.bmi.hasAccount": true })

// Find artists with SoundExchange account
db.royaltyProfiles.find({ "soundExchange.hasAccount": true })

// Find artists with BOTH BMI and SoundExchange
db.royaltyProfiles.find({
  "proMemberships.bmi.hasAccount": true,
  "soundExchange.hasAccount": true
})

// Find artists MISSING SoundExchange (even if lock-in enabled)
db.royaltyProfiles.find({
  "consent.royaltyLockInEnabled": true,
  "soundExchange.hasAccount": false
})

// Count artists with lock-in
db.royaltyProfiles.countDocuments({ "consent.royaltyLockInEnabled": true })
```

### Indexes

```
artistId (unique)
consent.royaltyLockInEnabled
proMemberships.bmi.hasAccount
soundExchange.hasAccount
(proMemberships.bmi.hasAccount + soundExchange.hasAccount) [compound]
updatedAt (-1)
```

---

## 📍 `releases` Collection

**Purpose**: Release metadata, DSP status, royalty gate info  
**Primary Key**: `releaseId` (unique)  
**Related To**: artists, royaltyProfiles

### Core Fields

```javascript
{
  _id: "REL_0001",
  releaseId: "REL_0001",
  
  // Basic info
  type: "Single",                        // Single | EP | Album
  title: "Play With Your Emotions",
  upc: "123456789012",
  
  // Artists
  primaryArtistId: "ARTIST_BHC",         // FK to artists
  labelName: "DMF Records Fly Hoolie ENT",
  
  // Metadata
  genre: "Hip-Hop/Rap",
  subGenre: "Street",
  releaseDate: ISODate("2025-11-30T..."),
  
  // Tracks
  tracks: [
    {
      trackId: "TRK_0001",
      title: "Play With Your Emotions",
      isrc: "USDMF2500001",
      audioUrl: "gs://dmf-audio/REL_0001/TRK_0001/master.wav",
      durationMs: 187000
    }
  ],
  
  // Contributors (this is the royalty split)
  contributors: [
    {
      artistId: "ARTIST_BHC",             // FK to artists
      roles: ["FeaturedArtist", "Songwriter"],
      splitShare: 0.5
    },
    {
      artistId: "ARTIST_FREEZZO",         // FK to artists
      roles: ["FeaturedArtist"],
      splitShare: 0.5
    },
    {
      artistId: "ARTIST_DMF_LABEL",       // Label owner
      roles: ["LabelOwner"],
      splitShare: 1.0
    }
  ],
  
  // DSP distribution status
  dspStatus: {
    overall: "Draft",                     // Draft | PendingReview | ReadyToDeliver | Delivering | Live | Rejected
    perDsp: {
      "Spotify": {
        status: "NotSent",                // NotSent | Queued | Delivering | Live | Rejected
        liveUrl: null,
        sentAt: null,
        liveAt: null
      },
      "AppleMusic": {
        status: "NotSent",
        liveUrl: null
      },
      "YouTubeMusic": {
        status: "NotSent",
        liveUrl: null
      }
    }
  },
  
  // Royalty gate check result
  royaltyCheck: {
    lastCheckedAt: null,
    canPublish: null,                     // true | false | null
    blockingIssues: []
  },
  
  createdAt: ISODate("2025-11-17T..."),
  updatedAt: ISODate("2025-11-17T...")
}
```

### Common Queries

```javascript
// Get release by ID
db.releases.findOne({ releaseId: "REL_0001" })

// All releases by primary artist
db.releases.find({ primaryArtistId: "ARTIST_BHC" })

// All releases artist contributed to
db.releases.find({ "contributors.artistId": "ARTIST_BHC" })

// All draft releases
db.releases.find({ "dspStatus.overall": "Draft" })

// All live releases
db.releases.find({ "dspStatus.overall": "Live" })

// Recent releases first
db.releases.find({}).sort({ releaseDate: -1 })

// Search by title
db.releases.find({ $text: { $search: "emotions" } })

// Count releases by status
db.releases.aggregate([
  { $group: { _id: "$dspStatus.overall", count: { $sum: 1 } } }
])

// Find releases with specific contributor
db.releases.find({ "contributors.artistId": "ARTIST_BHC" })
  .project({ releaseId: 1, title: 1, contributors: 1 })
```

### Indexes

```
releaseId (unique)
primaryArtistId
contributors.artistId
dspStatus.overall
releaseDate (-1)
createdAt (-1)
title (text)
```

---

## 📍 `enrollmentTasks` Collection

**Purpose**: Operations CRM board for enrollment follow-up  
**Primary Key**: `taskId` (unique)  
**Related To**: artists

### Core Fields

```javascript
{
  _id: "TASK_0001",
  taskId: "TASK_0001",
  artistId: "ARTIST_BHC",                // FK to artists
  
  // What org/scope
  org: "BMI",                            // BMI | SoundExchange | ASCAP | SESAC
  scope: "Writer",                       // Writer | Publisher | FeaturedArtist | RightsOwner
  
  // Ops workflow
  status: "Open",                        // Open | InProgress | Completed | Cancelled
  assignedToUserId: "ADMIN_001",         // DMF ops team member
  
  // Notes for ops
  notes: "Create BMI writer account, verify email, log account number.",
  dueDate: ISODate("2025-11-24T..."),
  
  createdAt: ISODate("2025-11-17T..."),
  updatedAt: ISODate("2025-11-17T...")
}
```

### Common Queries

```javascript
// Get task by ID
db.enrollmentTasks.findOne({ taskId: "TASK_0001" })

// All open tasks for artist
db.enrollmentTasks.find({ artistId: "ARTIST_BHC", status: "Open" })

// All open tasks assigned to me
db.enrollmentTasks.find({ 
  assignedToUserId: "ADMIN_001",
  status: "Open"
})

// All open BMI Writer tasks
db.enrollmentTasks.find({
  org: "BMI",
  scope: "Writer",
  status: "Open"
})

// Tasks by status
db.enrollmentTasks.find({ status: "InProgress" })

// Count overdue tasks
db.enrollmentTasks.countDocuments({
  dueDate: { $lt: new Date() },
  status: { $ne: "Completed" }
})
```

### Indexes

```
taskId (unique)
artistId
status
(org + scope) [compound]
createdAt (-1)
```

---

## 📍 `releases_gate_logs` Collection

**Purpose**: Immutable audit trail of every royalty gate check  
**Primary Key**: `checkId` (unique)  
**Related To**: releases (immutable - never update or delete)

### Core Fields

```javascript
{
  _id: ObjectId("..."),
  releaseId: "REL_0001",                 // FK to releases
  checkId: "check-1234567890",
  
  timestamp: ISODate("2025-11-17T14:30:00Z"),
  
  // What the check found
  check: {
    passed: true,
    artists_checked: 3,
    artists_blocked: 0
  },
  
  // Per-artist results
  results: [
    {
      artistId: "ARTIST_BHC",
      roles: ["FeaturedArtist", "Songwriter"],
      status: "Pass",
      issues: []
    },
    {
      artistId: "ARTIST_FREEZZO",
      roles: ["FeaturedArtist"],
      status: "Pass",
      issues: []
    },
    {
      artistId: "ARTIST_DMF_LABEL",
      roles: ["LabelOwner"],
      status: "Pass",
      issues: []
    }
  ],
  
  // Metadata
  requestedBy: "api",
  requestedAt: ISODate("2025-11-17T14:30:00Z")
}
```

### Common Queries

```javascript
// Get all gate checks for a release
db.releases_gate_logs.find({ releaseId: "REL_0001" })
  .sort({ timestamp: -1 })

// Get most recent check for release
db.releases_gate_logs.findOne({ releaseId: "REL_0001" })
  .sort({ timestamp: -1 })

// Count how many times release was blocked
db.releases_gate_logs.countDocuments({
  releaseId: "REL_0001",
  "check.passed": false
})

// Find all failed checks in last 24 hours
db.releases_gate_logs.find({
  "check.passed": false,
  timestamp: { $gte: new Date(Date.now() - 24*60*60*1000) }
})

// Which artists get blocked most often
db.releases_gate_logs.aggregate([
  { $unwind: "$results" },
  { $match: { "results.status": "Fail" } },
  { $group: { _id: "$results.artistId", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

### Indexes

```
releaseId
checkId (unique)
timestamp (-1)
check.passed
```

### Important Rules

- ✅ **INSERT ONLY** - Never update or delete
- ✅ **Immutable** - This is audit trail
- ✅ **Queryable** - Fast queries on releaseId, timestamp, passed status
- ✅ **Never lock** - Always append new checks, don't re-run same check

---

## 🔗 Foreign Key Relationships (Enforce in App)

| Field | Must Exist In | Collection |
|-------|---------------|-----------|
| `royaltyProfiles.artistId` | `artists.artistId` | artists |
| `releases.primaryArtistId` | `artists.artistId` | artists |
| `releases.contributors[].artistId` | `artists.artistId` | artists |
| `enrollmentTasks.artistId` | `artists.artistId` | artists |
| `releases_gate_logs.releaseId` | `releases.releaseId` | releases |

---

## 🧠 Key Patterns

### Pattern 1: Check if Artist Ready to Publish

```javascript
// Get artist's royalty profile
const profile = db.royaltyProfiles.findOne({ artistId });

// Check lock-in
if (!profile.consent.royaltyLockInEnabled) {
  return "Artist has lock-in DISABLED";
}

// Check both BMI and SoundExchange
const hasAllRequired =
  profile.proMemberships.bmi.hasAccount &&
  profile.soundExchange.hasAccount;

if (!hasAllRequired) {
  return "Missing required enrollments";
}

return "Ready to publish";
```

### Pattern 2: Gate Check for Release

```javascript
const release = db.releases.findOne({ releaseId });
const blockingIssues = [];

for (const contributor of release.contributors) {
  const profile = db.royaltyProfiles.findOne({
    artistId: contributor.artistId
  });

  if (!profile?.consent.royaltyLockInEnabled) continue;

  if (!profile.proMemberships.bmi.hasAccount) {
    blockingIssues.push(`${contributor.artistId}: Missing BMI`);
  }
  if (!profile.soundExchange.hasAccount) {
    blockingIssues.push(`${contributor.artistId}: Missing SoundExchange`);
  }
}

// Log the check
db.releases_gate_logs.insertOne({
  releaseId,
  checkId: `check-${Date.now()}`,
  timestamp: new Date(),
  check: {
    passed: blockingIssues.length === 0,
    artists_checked: release.contributors.length,
    artists_blocked: blockingIssues.length
  },
  requestedBy: "api"
});

return { canPublish: blockingIssues.length === 0, blockingIssues };
```

### Pattern 3: Find Artists Missing Enrollment

```javascript
// Artists with lock-in ENABLED but missing SoundExchange
db.royaltyProfiles.find({
  "consent.royaltyLockInEnabled": true,
  "soundExchange.hasAccount": false
})
```

---

## ⚡ Performance Notes

**Indexes are fast**:
- `artistId` lookup: <1ms
- `contributors.artistId` query: <5ms
- `dspStatus.overall` filter: <10ms

**Don't do this** (slow, no index):
- `db.releases.find({ "tracks[0].title": "..." })` (nested array)
- `db.artists.find({ "roles" in "Artist" })` (should be exact match)
- `db.releases_gate_logs.find({ "results[0].status": "Fail" })` (nested array)

**Do this instead**:
- `db.releases.find({ "contributors.artistId": "..." })` (uses index)
- `db.artists.find({ roles: "Artist" })` (exact match, uses index)
- `db.releases.find({ "dspStatus.overall": "Live" })` (uses index)

---

## 🚀 Backend Integration

Your backend should:

1. ✅ Read from these collections (never create your own)
2. ✅ Write to `royaltyProfiles` when user saves profile
3. ✅ Write to `releases` when user creates release
4. ✅ Write to `releases_gate_logs` when gate check runs (never update or delete)
5. ✅ Read from `enrollmentTasks` if implementing ops dashboard

---

## 📞 Common "I Need To" Scenarios

**"I need to get an artist's lock-in status"**
→ `db.royaltyProfiles.findOne({ artistId })`  
→ Read `consent.royaltyLockInEnabled`

**"I need to check if artist has BMI"**
→ `db.royaltyProfiles.findOne({ artistId })`  
→ Read `proMemberships.bmi.hasAccount`

**"I need to find all releases by artist X"**
→ `db.releases.find({ primaryArtistId: "..." })`

**"I need to find all artists who contributed to release Y"**
→ `db.releases.findOne({ releaseId: "..." })`  
→ Read `contributors[].artistId`

**"I need to know why release X can't be published"**
→ `db.releases_gate_logs.findOne({ releaseId }, { sort: { timestamp: -1 } })`  
→ Read `blockingIssues`

**"I need to audit all checks for a release"**
→ `db.releases_gate_logs.find({ releaseId }).sort({ timestamp: -1 })`

**"I need to find all open enrollment tasks"**
→ `db.enrollmentTasks.find({ status: "Open" })`

---

## 🔒 Final Checklist for Backend Dev

- [ ] Read this entire doc (30 min)
- [ ] Understand the 5 collections
- [ ] Know the foreign key relationships
- [ ] Know how to query each one
- [ ] Know the indexes (don't write queries that bypass them)
- [ ] Understand gate check pattern (Pattern 2 above)
- [ ] Never write to releases_gate_logs with updates/deletes (append only)
- [ ] All artist IDs must exist in `artists` before writing elsewhere

---

**Print this. Keep it next to your code. Reference it constantly.**

**Schema is locked. These queries are final. Go build.**
