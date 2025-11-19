# 🔒 MongoDB Schema - LOCKED & PRODUCTION READY

**Status**: ✅ FINAL  
**Updated**: 2025-11-17  
**Team**: Database locked for Phase 1

---

## 📍 Collections (4 Required + 1 Optional)

### 1️⃣ `artists` Collection

**Purpose**: Brand-facing artist identity  
**Primary Key**: `artistId`  
**Index**: `artistId` (unique)

```json
{
  "_id": "ARTIST_BHC",
  "artistId": "ARTIST_BHC",
  "userId": "USER_123",
  "stageName": "Big Homie Cash",
  "legalName": "DeAngelo Jackson",
  "primaryEmail": "bighomiecash8346@gmail.com",
  "primaryPhone": "+1-614-000-0000",
  "status": "Active",
  "roles": ["Artist", "Songwriter", "Label"],
  "labelName": "DMF Records Fly Hoolie ENT",
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

**Schema Definition**:
```typescript
interface Artist {
  _id: string;
  artistId: string;
  userId: string;
  stageName: string;
  legalName?: string;
  primaryEmail: string;
  primaryPhone?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  roles: string[];
  labelName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.artists.createIndex({ artistId: 1 }, { unique: true })
db.artists.createIndex({ userId: 1 }, { unique: true })
db.artists.createIndex({ primaryEmail: 1 }, { unique: true })
db.artists.createIndex({ status: 1 })
db.artists.createIndex({ createdAt: -1 })
```

**Relationships**:
- ← `royaltyProfiles.artistId` must exist in `artists`
- ← `releases.primaryArtistId` must exist in `artists`
- ← `releases.contributors[].artistId` must exist in `artists`
- ← `enrollmentTasks.artistId` must exist in `artists`

---

### 2️⃣ `royaltyProfiles` Collection

**Purpose**: Royalty enrollment and lock-in status  
**Primary Key**: `artistId`  
**Index**: `artistId` (unique)

```json
{
  "_id": "ARTIST_BHC",
  "artistId": "ARTIST_BHC",
  "legalFirstName": "DeAngelo",
  "legalLastName": "Jackson",
  "email": "bighomiecash8346@gmail.com",
  "phone": "+1-614-000-0000",
  "consent": {
    "royaltyLockInEnabled": true,
    "agreedToTerms": true,
    "agreedAtUtc": "2025-11-01T00:00:00.000Z"
  },
  "enrollmentStatuses": [
    {
      "org": "BMI",
      "scope": "Writer",
      "status": "Completed",
      "enrollmentId": "bmi-writer-001",
      "enrolledAtUtc": "2025-11-02T00:00:00.000Z",
      "completedAtUtc": "2025-11-05T00:00:00.000Z"
    },
    {
      "org": "SoundExchange",
      "scope": "FeaturedArtist",
      "status": "Completed",
      "enrollmentId": "se-artist-001",
      "enrolledAtUtc": "2025-11-02T00:00:00.000Z",
      "completedAtUtc": "2025-11-06T00:00:00.000Z"
    },
    {
      "org": "SoundExchange",
      "scope": "RightsOwner",
      "status": "Completed",
      "enrollmentId": "se-owner-001",
      "enrolledAtUtc": "2025-11-02T00:00:00.000Z",
      "completedAtUtc": "2025-11-07T00:00:00.000Z"
    }
  ],
  "payoutInfo": {
    "preferredMethod": "ACH",
    "bankName": "Chase Bank",
    "accountHolder": "DeAngelo Jackson",
    "routingNumber": "[encrypted]",
    "accountNumber": "[encrypted]"
  },
  "taxInfo": {
    "w9Filed": true,
    "w9FiledAtUtc": "2025-11-01T00:00:00.000Z"
  },
  "createdAt": "2025-11-01T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

**Schema Definition**:
```typescript
interface RoyaltyProfile {
  _id: string;
  artistId: string;
  legalFirstName: string;
  legalLastName: string;
  email: string;
  phone?: string;
  consent: {
    royaltyLockInEnabled: boolean;
    agreedToTerms: boolean;
    agreedAtUtc?: Date;
  };
  enrollmentStatuses: {
    org: 'BMI' | 'SoundExchange' | 'ASCAP' | 'SESAC';
    scope?: string;
    status: 'Completed' | 'InProgress' | 'Pending' | 'Failed';
    enrollmentId?: string;
    enrolledAtUtc?: Date;
    completedAtUtc?: Date;
    errorMessage?: string;
  }[];
  payoutInfo?: {
    preferredMethod: 'ACH' | 'Check' | 'Wire';
    bankName: string;
    accountHolder: string;
    routingNumber: string;
    accountNumber: string;
  };
  taxInfo?: {
    w9Filed: boolean;
    w9FiledAtUtc?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.royaltyProfiles.createIndex({ artistId: 1 }, { unique: true })
db.royaltyProfiles.createIndex({ "consent.royaltyLockInEnabled": 1 })
db.royaltyProfiles.createIndex({ "enrollmentStatuses.status": 1 })
db.royaltyProfiles.createIndex({ updatedAt: -1 })
```

**Relationships**:
- → `artists.artistId` (foreign key)
- ← `releases` reads this for gate checks

---

### 3️⃣ `releases` Collection

**Purpose**: Release metadata + distribution tracking + royalty gate info  
**Primary Key**: `releaseId`  
**Index**: `releaseId` (unique)

```json
{
  "_id": "REL_0001",
  "releaseId": "REL_0001",
  "type": "Single",
  "title": "Play With Your Emotions",
  "upc": "123456789012",
  "primaryArtistId": "ARTIST_BHC",
  "labelName": "DMF Records Fly Hoolie ENT",
  "genre": "Hip-Hop/Rap",
  "subGenre": "Street",
  "releaseDate": "2025-11-30T00:00:00.000Z",
  "tracks": [
    {
      "trackId": "TRK_0001",
      "title": "Play With Your Emotions",
      "isrc": "USDMF2500001",
      "audioUrl": "gs://dmf-audio/REL_0001/TRK_0001/master.wav",
      "durationMs": 187000
    }
  ],
  "contributors": [
    {
      "artistId": "ARTIST_BHC",
      "roles": ["FeaturedArtist", "Songwriter"],
      "splitShare": 0.5
    },
    {
      "artistId": "ARTIST_FREEZZO",
      "roles": ["FeaturedArtist"],
      "splitShare": 0.5
    },
    {
      "artistId": "ARTIST_DMF_LABEL",
      "roles": ["LabelOwner"],
      "splitShare": 1.0
    }
  ],
  "dspStatus": {
    "overall": "Draft",
    "perDsp": {
      "Spotify": {
        "status": "NotSent",
        "liveUrl": null
      },
      "AppleMusic": {
        "status": "NotSent",
        "liveUrl": null
      },
      "YouTubeMusic": {
        "status": "NotSent",
        "liveUrl": null
      }
    }
  },
  "royaltyCheck": {
    "lastCheckedAt": null,
    "canPublish": null,
    "blockingIssues": []
  },
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

**Schema Definition**:
```typescript
interface ReleaseContributor {
  artistId: string;
  roles: string[];
  splitShare?: number;
}

interface ReleaseTrack {
  trackId: string;
  title: string;
  isrc?: string;
  audioUrl?: string;
  durationMs?: number;
}

interface DspStatusEntry {
  status: 'NotSent' | 'Queued' | 'Delivering' | 'Live' | 'Rejected';
  liveUrl?: string | null;
}

interface Release {
  _id: string;
  releaseId: string;
  type: 'Single' | 'EP' | 'Album';
  title: string;
  upc?: string;
  primaryArtistId: string;
  labelName?: string;
  genre?: string;
  subGenre?: string;
  releaseDate?: Date;
  tracks?: ReleaseTrack[];
  contributors: ReleaseContributor[];
  dspStatus?: {
    overall: 'Draft' | 'PendingReview' | 'ReadyToDeliver' | 'Delivering' | 'Live' | 'Rejected';
    perDsp?: Record<string, DspStatusEntry>;
  };
  royaltyCheck?: {
    lastCheckedAt?: Date | null;
    canPublish?: boolean | null;
    blockingIssues?: { artistId: string; reason: string }[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.releases.createIndex({ releaseId: 1 }, { unique: true })
db.releases.createIndex({ primaryArtistId: 1 })
db.releases.createIndex({ "contributors.artistId": 1 })
db.releases.createIndex({ "dspStatus.overall": 1 })
db.releases.createIndex({ releaseDate: -1 })
db.releases.createIndex({ createdAt: -1 })
db.releases.createIndex({ "royaltyCheck.canPublish": 1 })
```

**Relationships**:
- → `artists.artistId` (primaryArtistId)
- → `artists.artistId` (contributors[].artistId)
- → `royaltyProfiles` (cross-check during gate)
- ← `releases_gate_logs` (logs reference this)

---

### 4️⃣ `enrollmentTasks` Collection (Optional - CRM Board)

**Purpose**: Operations tickets for managing enrollments  
**Primary Key**: `taskId`  
**Index**: `taskId` (unique)

```json
{
  "_id": "TASK_0001",
  "taskId": "TASK_0001",
  "artistId": "ARTIST_BHC",
  "org": "BMI",
  "scope": "Writer",
  "status": "Open",
  "assignedToUserId": "ADMIN_001",
  "notes": "Create BMI writer account, verify email, log account number.",
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

**Schema Definition**:
```typescript
interface EnrollmentTask {
  _id: string;
  taskId: string;
  artistId: string;
  org: 'BMI' | 'SoundExchange' | 'ASCAP' | 'SESAC';
  scope: 'Writer' | 'Publisher' | 'FeaturedArtist' | 'RightsOwner';
  status: 'Open' | 'InProgress' | 'Completed' | 'Cancelled';
  assignedToUserId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```javascript
db.enrollmentTasks.createIndex({ taskId: 1 }, { unique: true })
db.enrollmentTasks.createIndex({ artistId: 1 })
db.enrollmentTasks.createIndex({ status: 1 })
db.enrollmentTasks.createIndex({ assignedToUserId: 1 })
db.enrollmentTasks.createIndex({ createdAt: -1 })
```

**Relationships**:
- → `artists.artistId`
- ← Used by DMF ops team (later: automated by StreamGod)

---

### 5️⃣ `releases_gate_logs` Collection (Audit Trail)

**Purpose**: Track every royalty gate check for debugging + compliance  
**Primary Key**: `checkId`  
**Index**: `checkId` (unique)

```json
{
  "_id": "LOG_20251117_001",
  "releaseId": "REL_0001",
  "checkId": "check-1234567890",
  "timestamp": "2025-11-17T14:30:00.000Z",
  "check": {
    "passed": true,
    "artists_checked": 3,
    "artists_blocked": 0
  },
  "results": [
    {
      "artistId": "ARTIST_BHC",
      "roles": ["FeaturedArtist", "Songwriter"],
      "status": "Pass",
      "issues": []
    },
    {
      "artistId": "ARTIST_FREEZZO",
      "roles": ["FeaturedArtist"],
      "status": "Pass",
      "issues": []
    }
  ],
  "requestedBy": "api",
  "requestedAt": "2025-11-17T14:30:00.000Z"
}
```

**Schema Definition**:
```typescript
interface GateCheckResult {
  artistId: string;
  roles: string[];
  status: 'Pass' | 'Fail';
  issues: string[];
}

interface ReleaseGateLog {
  _id: string;
  releaseId: string;
  checkId: string;
  timestamp: Date;
  check: {
    passed: boolean;
    artists_checked: number;
    artists_blocked: number;
  };
  results: GateCheckResult[];
  requestedBy: string;
  requestedAt: Date;
}
```

**Indexes**:
```javascript
db.releases_gate_logs.createIndex({ checkId: 1 }, { unique: true })
db.releases_gate_logs.createIndex({ releaseId: 1 })
db.releases_gate_logs.createIndex({ timestamp: -1 })
db.releases_gate_logs.createIndex({ "check.passed": 1 })
```

**Relationships**:
- → `releases.releaseId`
- Immutable log (no updates, only inserts)

---

## 🔗 Data Relationships (Entity Diagram)

```
┌─────────────────────┐
│     artists         │
├─────────────────────┤
│ _id: artistId       │
│ userId (unique)     │
│ stageName           │
│ status              │
│ roles[]             │
└──────────┬──────────┘
           │
      ┌────┴─────────────────────────┐
      │                              │
      ▼                              ▼
┌──────────────────────┐    ┌──────────────────────┐
│  royaltyProfiles     │    │     releases         │
├──────────────────────┤    ├──────────────────────┤
│ _id: artistId        │    │ _id: releaseId       │
│ enrollmentStatuses[] │    │ primaryArtistId ─────┼──→ artists
│ consent              │    │ contributors[] ──────┼──→ artists (multiple)
│ payoutInfo           │    │ royaltyCheck ────┐   │
│                      │◄───┼─ (reads during)  │   │
└──────────────────────┘    │ trackingRef  ────┤   │
                            │                  │   │
                            └──────────────────┼───┘
                                             │
                                             ▼
                                    ┌──────────────────────┐
                                    │ releases_gate_logs   │
                                    ├──────────────────────┤
                                    │ _id: checkId         │
                                    │ releaseId ──────────→ releases
                                    │ results[] (audit)    │
                                    └──────────────────────┘
```

---

## 🔐 Foreign Key Constraints (Enforce in App)

| Field | Must Reference | Collection |
|-------|-----------------|-----------|
| `royaltyProfiles.artistId` | `artists.artistId` | artists |
| `releases.primaryArtistId` | `artists.artistId` | artists |
| `releases.contributors[].artistId` | `artists.artistId` | artists |
| `enrollmentTasks.artistId` | `artists.artistId` | artists |
| `releases_gate_logs.releaseId` | `releases.releaseId` | releases |

---

## 📝 MongoDB Setup Commands

### Create Collections with Validation

```javascript
db.createCollection("artists", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["artistId", "userId", "stageName", "primaryEmail", "status"],
      properties: {
        _id: { bsonType: "string" },
        artistId: { bsonType: "string" },
        userId: { bsonType: "string" },
        stageName: { bsonType: "string" },
        legalName: { bsonType: "string" },
        primaryEmail: { bsonType: "string" },
        primaryPhone: { bsonType: "string" },
        status: { enum: ["Active", "Inactive", "Pending"] },
        roles: { bsonType: "array", items: { bsonType: "string" } },
        labelName: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("royaltyProfiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["artistId", "email", "consent"],
      properties: {
        _id: { bsonType: "string" },
        artistId: { bsonType: "string" },
        legalFirstName: { bsonType: "string" },
        legalLastName: { bsonType: "string" },
        email: { bsonType: "string" },
        phone: { bsonType: "string" },
        consent: {
          bsonType: "object",
          properties: {
            royaltyLockInEnabled: { bsonType: "bool" },
            agreedToTerms: { bsonType: "bool" },
            agreedAtUtc: { bsonType: "date" }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("releases", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["releaseId", "title", "primaryArtistId", "contributors"],
      properties: {
        _id: { bsonType: "string" },
        releaseId: { bsonType: "string" },
        type: { enum: ["Single", "EP", "Album"] },
        title: { bsonType: "string" },
        upc: { bsonType: "string" },
        primaryArtistId: { bsonType: "string" },
        labelName: { bsonType: "string" },
        genre: { bsonType: "string" },
        subGenre: { bsonType: "string" },
        releaseDate: { bsonType: "date" },
        contributors: { bsonType: "array" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("enrollmentTasks");
db.createCollection("releases_gate_logs");
```

### Create All Indexes

```javascript
// artists
db.artists.createIndex({ artistId: 1 }, { unique: true });
db.artists.createIndex({ userId: 1 }, { unique: true });
db.artists.createIndex({ primaryEmail: 1 }, { unique: true });
db.artists.createIndex({ status: 1 });
db.artists.createIndex({ createdAt: -1 });

// royaltyProfiles
db.royaltyProfiles.createIndex({ artistId: 1 }, { unique: true });
db.royaltyProfiles.createIndex({ "consent.royaltyLockInEnabled": 1 });
db.royaltyProfiles.createIndex({ "enrollmentStatuses.status": 1 });
db.royaltyProfiles.createIndex({ updatedAt: -1 });

// releases
db.releases.createIndex({ releaseId: 1 }, { unique: true });
db.releases.createIndex({ primaryArtistId: 1 });
db.releases.createIndex({ "contributors.artistId": 1 });
db.releases.createIndex({ "dspStatus.overall": 1 });
db.releases.createIndex({ releaseDate: -1 });
db.releases.createIndex({ createdAt: -1 });
db.releases.createIndex({ "royaltyCheck.canPublish": 1 });

// enrollmentTasks
db.enrollmentTasks.createIndex({ taskId: 1 }, { unique: true });
db.enrollmentTasks.createIndex({ artistId: 1 });
db.enrollmentTasks.createIndex({ status: 1 });
db.enrollmentTasks.createIndex({ assignedToUserId: 1 });
db.enrollmentTasks.createIndex({ createdAt: -1 });

// releases_gate_logs
db.releases_gate_logs.createIndex({ checkId: 1 }, { unique: true });
db.releases_gate_logs.createIndex({ releaseId: 1 });
db.releases_gate_logs.createIndex({ timestamp: -1 });
db.releases_gate_logs.createIndex({ "check.passed": 1 });
```

---

## ✅ Verification Checklist

- [ ] All 5 collections created
- [ ] All indexes created
- [ ] Schema validation enabled (artists, royaltyProfiles, releases)
- [ ] Test data inserted from MONGODB_TEST_DATA.md
- [ ] `canPublishRelease()` function reads `releases.contributors[]` correctly
- [ ] `canPublishRelease()` cross-checks `royaltyProfiles` enrollments
- [ ] `releases_gate_logs` grows with each gate check
- [ ] No orphaned foreign keys (all artistIds must exist)
- [ ] Timestamps properly formatted (ISO 8601)

---

## 🎯 Query Examples (For Backend Dev)

### Get artist with royalty profile

```javascript
db.artists.findOne({ artistId: "ARTIST_BHC" });
db.royaltyProfiles.findOne({ artistId: "ARTIST_BHC" });
```

### Check release gate (Pseudo-code for `canPublishRelease`)

```javascript
// 1. Get the release
const release = db.releases.findOne({ releaseId: "REL_0001" });

// 2. Loop contributors
for (const contributor of release.contributors) {
  const profile = db.royaltyProfiles.findOne({ artistId: contributor.artistId });
  
  // 3. Check if royalty lock-in enabled
  if (!profile?.consent.royaltyLockInEnabled) {
    continue; // Skip if not enrolled
  }
  
  // 4. Check enrollment statuses
  const requiredEnrollments = ["BMI", "SoundExchange"];
  const hasRequired = requiredEnrollments.every(org => 
    profile.enrollmentStatuses.some(e => e.org === org && e.status === "Completed")
  );
  
  if (!hasRequired) {
    blockingArtists.push(contributor.artistId);
  }
}

// 5. Return result
canPublish = blockingArtists.length === 0;
```

### Log the gate check

```javascript
db.releases_gate_logs.insertOne({
  releaseId: "REL_0001",
  checkId: "check-" + Date.now(),
  timestamp: new Date(),
  check: {
    passed: canPublish,
    artists_checked: release.contributors.length,
    artists_blocked: blockingArtists.length
  },
  results: blockingArtists.map(artistId => ({
    artistId,
    status: "Fail",
    issues: ["Missing required enrollments"]
  })),
  requestedBy: "api",
  requestedAt: new Date()
});
```

---

## 📦 Backend Implementation Map

| Feature | Reads | Writes | Endpoint |
|---------|-------|--------|----------|
| Get royalty profile | `royaltyProfiles` | — | GET /getRoyaltyProfile |
| Save royalty profile | `royaltyProfiles` | `royaltyProfiles` | POST /saveRoyaltyProfile |
| Delete royalty profile | `royaltyProfiles` | `royaltyProfiles` | DELETE /deleteRoyaltyProfile |
| Check publish gate | `releases`, `royaltyProfiles` | `releases_gate_logs` | GET /canPublishRelease |
| Get release status | `releases` | — | GET /getReleaseStatus |

---

## 🚀 Frontend Implementation Map

| Feature | Reads | Writes | API Call |
|---------|-------|--------|----------|
| Display lock-in status | `royaltyProfiles` | — | getRoyaltyProfile() |
| Edit enrollment info | `royaltyProfiles` | `royaltyProfiles` | saveRoyaltyProfile() |
| Create release | `artists`, `releases` | `releases` | (new endpoint) |
| Check before publish | `releases` | — | canPublishRelease() |
| Show gate errors | `releases_gate_logs` | — | (via canPublishRelease) |

---

## 🔒 FINAL STATUS

✅ **Schema LOCKED**  
✅ **Relationships DEFINED**  
✅ **Indexes SPECIFIED**  
✅ **Validation READY**  
✅ **Query patterns DOCUMENTED**

**No more schema changes. Build from here.**
