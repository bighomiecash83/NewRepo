# MongoDB Collections - Example Documents

**Purpose**: Reference data for backend + frontend integration  
**Database**: `dmf_music_platform`  
**Status**: Copy these into MongoDB to test

---

## 🧪 Test Data Setup

Use these commands to create test data in your MongoDB:

```bash
mongosh "mongodb+srv://bighomiecash8346:YOUR_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform"
```

---

## 1️⃣ royaltyProfiles Collection

### Example 1: Artist with Full Setup (Ready to Publish)

```javascript
db.royaltyProfiles.insertOne({
  artistId: "artist-001",
  legalFirstName: "John",
  legalLastName: "Doe",
  email: "john@example.com",
  phone: "+1-555-0100",

  consent: {
    royaltyLockInEnabled: true,
    agreedToTerms: true,
    agreedAtUtc: new Date("2025-11-01"),
  },

  enrollmentStatuses: [
    {
      org: "BMI",
      scope: "Writer",
      status: "Completed",
      enrollmentId: "bmi-writer-001",
      enrolledAtUtc: new Date("2025-11-02"),
      completedAtUtc: new Date("2025-11-05"),
    },
    {
      org: "SoundExchange",
      scope: "FeaturedArtist",
      status: "Completed",
      enrollmentId: "se-artist-001",
      enrolledAtUtc: new Date("2025-11-02"),
      completedAtUtc: new Date("2025-11-06"),
    },
    {
      org: "SoundExchange",
      scope: "RightsOwner",
      status: "Completed",
      enrollmentId: "se-owner-001",
      enrolledAtUtc: new Date("2025-11-02"),
      completedAtUtc: new Date("2025-11-07"),
    },
  ],

  payoutInfo: {
    preferredMethod: "ACH",
    bankName: "Chase Bank",
    accountHolder: "John Doe",
    routingNumber: "[encrypted]",
    accountNumber: "[encrypted]",
  },

  taxInfo: {
    w9Filed: true,
    w9FiledAtUtc: new Date("2025-11-01"),
  },

  createdAt: new Date("2025-11-01"),
  updatedAt: new Date("2025-11-17"),
});
```

### Example 2: Artist with Partial Setup (In Progress)

```javascript
db.royaltyProfiles.insertOne({
  artistId: "artist-002",
  legalFirstName: "Jane",
  legalLastName: "Smith",
  email: "jane@example.com",

  consent: {
    royaltyLockInEnabled: true,
    agreedToTerms: true,
    agreedAtUtc: new Date("2025-11-10"),
  },

  enrollmentStatuses: [
    {
      org: "BMI",
      scope: "Writer",
      status: "Completed",
      enrollmentId: "bmi-writer-002",
      enrolledAtUtc: new Date("2025-11-10"),
      completedAtUtc: new Date("2025-11-12"),
    },
    {
      org: "SoundExchange",
      scope: "FeaturedArtist",
      status: "InProgress",
      enrollmentId: "se-artist-002",
      enrolledAtUtc: new Date("2025-11-10"),
    },
    {
      org: "SoundExchange",
      scope: "RightsOwner",
      status: "Pending",
      enrollmentId: "se-owner-002",
      enrolledAtUtc: new Date("2025-11-10"),
    },
  ],

  createdAt: new Date("2025-11-10"),
  updatedAt: new Date("2025-11-17"),
});
```

### Example 3: Artist with Lock-In Disabled

```javascript
db.royaltyProfiles.insertOne({
  artistId: "artist-003",
  legalFirstName: "Bob",
  legalLastName: "Johnson",
  email: "bob@example.com",

  consent: {
    royaltyLockInEnabled: false,
    agreedToTerms: false,
  },

  enrollmentStatuses: [],

  createdAt: new Date("2025-11-17"),
  updatedAt: new Date("2025-11-17"),
});
```

---

## 2️⃣ releases Collection

### Example 1: Release Ready to Publish (All artists complete)

```javascript
db.releases.insertOne({
  releaseId: "release-001",
  title: "Amazing Song",

  artists: ["artist-001"],

  contributors: [
    {
      artistId: "artist-001",
      role: "Songwriter",
      creditPercentage: 100,
    },
  ],

  status: "Draft",

  publishing: {
    canPublish: true,
    lastGateCheckAt: new Date("2025-11-17"),
    blockingArtists: [],
    gateErrors: [],
  },

  distribution: {
    status: "Pending",
    platforms: [
      {
        name: "Spotify",
        status: "Pending",
      },
      {
        name: "Apple Music",
        status: "Pending",
      },
      {
        name: "YouTube",
        status: "Pending",
      },
    ],
  },

  createdAt: new Date("2025-11-15"),
  updatedAt: new Date("2025-11-17"),
});
```

### Example 2: Release Blocked (Artist not enrolled)

```javascript
db.releases.insertOne({
  releaseId: "release-002",
  title: "New Track",

  artists: ["artist-002"],

  contributors: [
    {
      artistId: "artist-002",
      role: "Songwriter",
      creditPercentage: 100,
    },
  ],

  status: "Draft",

  publishing: {
    canPublish: false,
    lastGateCheckAt: new Date("2025-11-17"),
    blockingArtists: ["artist-002"],
    gateErrors: [
      "Artist artist-002: Missing enrollment: SoundExchange RightsOwner",
    ],
  },

  distribution: {
    status: "Pending",
    platforms: [],
  },

  createdAt: new Date("2025-11-15"),
  updatedAt: new Date("2025-11-17"),
});
```

### Example 3: Release with Multiple Contributors

```javascript
db.releases.insertOne({
  releaseId: "release-003",
  title: "Collaboration",

  artists: ["artist-001", "artist-002"],

  contributors: [
    {
      artistId: "artist-001",
      role: "FeaturedArtist",
      creditPercentage: 50,
    },
    {
      artistId: "artist-002",
      role: "FeaturedArtist",
      creditPercentage: 50,
    },
  ],

  status: "Draft",

  publishing: {
    canPublish: false,
    lastGateCheckAt: new Date("2025-11-17"),
    blockingArtists: ["artist-002"],
    gateErrors: [
      "Artist artist-002: Missing enrollment: SoundExchange RightsOwner",
    ],
  },

  distribution: {
    status: "Pending",
    platforms: [],
  },

  createdAt: new Date("2025-11-16"),
  updatedAt: new Date("2025-11-17"),
});
```

---

## 3️⃣ artists Collection

### Example 1: Complete Artist Profile

```javascript
db.artists.insertOne({
  artistId: "artist-001",
  stage_name: "John Doe Music",
  legal_name: "John Doe",
  bio: "Electronic music producer from LA",

  contact: {
    email: "john@example.com",
    phone: "+1-555-0100",
    website: "https://johndoemusic.com",
    social: {
      spotify: "https://open.spotify.com/artist/artist-001",
      instagram: "https://instagram.com/johndoemusic",
      twitter: "https://twitter.com/johndoemusic",
      youtube: "https://youtube.com/@johndoemusic",
    },
  },

  profile: {
    image_url: "https://cdn.example.com/artist-001.jpg",
    genre: ["Electronic", "House", "Techno"],
    country: "US",
    verified: true,
  },

  catalog: {
    total_releases: 12,
    total_songs: 48,
    total_streams: 1250000,
  },

  subscriptions: {
    tier: "Label",
    active: true,
    billingCycle: "monthly",
  },

  createdAt: new Date("2025-01-15"),
  updatedAt: new Date("2025-11-17"),
});
```

### Example 2: Artist with Free Tier

```javascript
db.artists.insertOne({
  artistId: "artist-002",
  stage_name: "Jane Smith",
  legal_name: "Jane Smith",

  contact: {
    email: "jane@example.com",
  },

  profile: {
    genre: ["Hip-Hop", "Rap"],
    country: "US",
    verified: false,
  },

  catalog: {
    total_releases: 3,
    total_songs: 15,
    total_streams: 50000,
  },

  subscriptions: {
    tier: "Free",
    active: true,
  },

  createdAt: new Date("2025-09-01"),
  updatedAt: new Date("2025-11-17"),
});
```

---

## 4️⃣ enrollmentTasks Collection

### Example 1: Completed Enrollment Task

```javascript
db.enrollmentTasks.insertOne({
  taskId: "task-bmi-writer-001",
  artistId: "artist-001",

  enrollmentType: "BMI_Writer",
  org: "BMI",

  status: "Completed",

  externalIds: {
    bmiFrn: "12345678",
  },

  attempts: 1,
  lastAttemptAt: new Date("2025-11-05"),

  createdAt: new Date("2025-11-02"),
  completedAt: new Date("2025-11-05"),
  updatedAt: new Date("2025-11-05"),
});
```

### Example 2: In-Progress Enrollment Task

```javascript
db.enrollmentTasks.insertOne({
  taskId: "task-se-artist-002",
  artistId: "artist-002",

  enrollmentType: "SoundExchange_Featured",
  org: "SoundExchange",

  status: "Processing",

  externalIds: {},

  attempts: 2,
  lastAttemptAt: new Date("2025-11-14"),
  nextRetryAt: new Date("2025-11-18"),

  createdAt: new Date("2025-11-10"),
  updatedAt: new Date("2025-11-14"),
});
```

### Example 3: Failed Enrollment Task

```javascript
db.enrollmentTasks.insertOne({
  taskId: "task-ascap-writer-001",
  artistId: "artist-003",

  enrollmentType: "ASCAP_Writer",
  org: "ASCAP",

  status: "Failed",

  externalIds: {},

  attempts: 5,
  lastAttemptAt: new Date("2025-11-12"),

  error: {
    code: "INVALID_EMAIL",
    message: "Email address not recognized by ASCAP",
    details: {
      email: "old-email@example.com",
      suggestion: "Update email and retry",
    },
  },

  createdAt: new Date("2025-11-08"),
  updatedAt: new Date("2025-11-12"),
});
```

---

## 5️⃣ releases_gate_logs Collection

### Example 1: Successful Gate Check

```javascript
db.releases_gate_logs.insertOne({
  releaseId: "release-001",
  checkId: "check-001-2025-11-17",

  timestamp: new Date("2025-11-17T14:30:00Z"),

  check: {
    passed: true,
    artists_checked: 1,
    artists_blocked: 0,
  },

  results: [
    {
      artistId: "artist-001",
      role: "Songwriter",
      status: "Pass",
      issues: [],
    },
  ],

  requestedBy: "frontend-app",
});
```

### Example 2: Failed Gate Check

```javascript
db.releases_gate_logs.insertOne({
  releaseId: "release-002",
  checkId: "check-002-2025-11-17",

  timestamp: new Date("2025-11-17T14:35:00Z"),

  check: {
    passed: false,
    artists_checked: 1,
    artists_blocked: 1,
  },

  results: [
    {
      artistId: "artist-002",
      role: "Songwriter",
      status: "Fail",
      issues: [
        "Missing enrollment: SoundExchange RightsOwner",
        "Enrollment status for SoundExchange FeaturedArtist is InProgress, not Completed",
      ],
    },
  ],

  requestedBy: "frontend-app",
});
```

---

## 🧪 Quick MongoDB Commands

### Insert All Test Data at Once

```javascript
// Copy the entire examples above and run in mongosh

// Or run individually:
db.royaltyProfiles.insertOne({...})
db.royaltyProfiles.insertOne({...})
db.releases.insertOne({...})
// etc
```

### Verify Data Was Inserted

```javascript
// Check how many documents in each collection
db.royaltyProfiles.countDocuments()
db.releases.countDocuments()
db.artists.countDocuments()
db.enrollmentTasks.countDocuments()
db.releases_gate_logs.countDocuments()

// List all royalty profiles
db.royaltyProfiles.find().pretty()

// Find specific artist
db.royaltyProfiles.findOne({ artistId: "artist-001" })
```

### Test API Against Real Data

```bash
# Test with artist-001 (should succeed)
curl "https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app/getRoyaltyProfile?artistId=artist-001"

# Test release gate with release-001 (should be canPublish: true)
curl "https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app/canPublishRelease?releaseId=release-001"

# Test release gate with release-002 (should be canPublish: false)
curl "https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app/canPublishRelease?releaseId=release-002"
```

---

## 📊 Data Relationships

```
Artist (artists collection)
  └─ Has royalty profile (royaltyProfiles)
  └─ Has releases (releases)
      └─ Each release has contributors (artistId references)
      └─ Each release has gate logs (releases_gate_logs)

Enrollment (enrollmentTasks)
  └─ Linked to artist via artistId
  └─ Status updates affect what's in royaltyProfiles
```

---

## ✅ Frontend Testing Workflow

1. **Load test data** into MongoDB
2. **Create frontend config** with backend URL
3. **Call getRoyaltyProfile** with `artist-001` → Should return full profile
4. **Call getRoyaltyProfile** with `artist-002` → Should return partial profile
5. **Call canPublishRelease** with `release-001` → Should return `canPublish: true`
6. **Call canPublishRelease** with `release-002` → Should return `canPublish: false`
7. **Try to save updated profile** → Should store in MongoDB and return updated doc
8. **Check releases_gate_logs** → Should see new entries after each gate check

---

## 🔄 Data Flow Example

**User Action**: Try to publish `release-002`

**Flow**:
1. Frontend calls `checkCanPublishRelease("release-002")`
2. Backend queries `releases` collection
3. Backend finds contributors: `[{ artistId: "artist-002", role: "Songwriter" }]`
4. Backend queries `royaltyProfiles` for `artist-002`
5. Backend checks enrollments → Missing `SoundExchange RightsOwner`
6. Backend creates entry in `releases_gate_logs`
7. Backend returns `{ canPublish: false, blockingIssues: [...] }`
8. Frontend shows error to user: "Complete SoundExchange enrollment first"

---

**Status**: ✅ Ready to load and test

**Database**: `dmf_music_platform`  
**Collections**: 5 (with example docs)  
**Test Artists**: artist-001, artist-002, artist-003  
**Test Releases**: release-001, release-002, release-003
