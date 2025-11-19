# MongoDB Architecture - DMF Music Platform

**Database**: `dmf_music_platform`  
**Cluster**: `dmf-music-platform.pfqrhc.mongodb.net`  
**URI**: `mongodb+srv://bighomiecash8346:YOUR_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform`  
**Status**: ✅ **PRIMARY DATABASE** - Single source of truth for all DMF data  
**Date**: November 17, 2025

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│          Google AI Studio / Lovable Frontend         │
└────────────┬────────────────────────────┬────────────┘
             │                            │
             ▼                            ▼
    ┌─────────────────┐         ┌──────────────────┐
    │ Firebase        │         │  Lovable         │
    │ Cloud Functions │         │  Backend         │
    │ (Optional)      │         │  (Primary)       │
    └────────┬────────┘         └────────┬─────────┘
             │                          │
             └──────────────┬───────────┘
                            ▼
                   ┌─────────────────┐
                   │  MongoDB Atlas  │
                   │  dmf_music_     │
                   │  platform db    │
                   └─────────────────┘
```

### Connection Pattern

**All backends** (Firebase Functions, Lovable, future services) use the same MongoDB connection:

```
mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform
```

**Result**: Single database, single source of truth, eventual consistency across backends.

---

## 📊 Collections Structure

### 1. **royaltyProfiles** - Artist Royalty Lock-In Data

**Purpose**: Manage artist enrollment with royalty organizations (BMI, SoundExchange, etc.)

**Schema**:

```ts
{
  _id: ObjectId,
  artistId: string,              // Unique artist identifier
  legalFirstName: string,
  legalLastName: string,
  email: string,
  phone?: string,
  
  consent: {
    royaltyLockInEnabled: boolean,    // Master enrollment flag
    agreedToTerms: boolean,
    agreedAtUtc: ISO8601,
  },
  
  enrollmentStatuses: [
    {
      org: 'BMI' | 'ASCAP' | 'SESAC' | 'SoundExchange',
      scope: 'Writer' | 'Publisher' | 'FeaturedArtist' | 'RightsOwner',
      status: 'Pending' | 'InProgress' | 'Completed' | 'Failed',
      enrollmentId?: string,
      enrolledAtUtc?: ISO8601,
      completedAtUtc?: ISO8601,
      errorMessage?: string,
    }
  ],
  
  payoutInfo: {
    preferredMethod: 'ACH' | 'Wire' | 'Check',
    bankName?: string,
    accountHolder?: string,
    routingNumber?: string,      // Encrypted
    accountNumber?: string,       // Encrypted
  },
  
  taxInfo: {
    ssn?: string,                 // Encrypted
    ein?: string,                 // Encrypted
    w9Filed: boolean,
    w9FiledAtUtc?: ISO8601,
  },
  
  createdAt: ISO8601,
  updatedAt: ISO8601,
}
```

**Indexes**:

- `artistId` (unique)
- `consent.royaltyLockInEnabled`
- `updatedAt` (descending)
- `enrollmentStatuses.status`

**Access Pattern**: Fetch by artistId, filter by consent status

---

### 2. **releases** - Music Release Metadata

**Purpose**: Track releases and their contributors for gate validation

**Schema**:

```ts
{
  _id: ObjectId,
  releaseId: string,            // Unique release identifier
  title: string,
  artists: [string],             // Primary artist(s)
  
  contributors: [
    {
      artistId: string,
      role: 'Songwriter' | 'FeaturedArtist' | 'LabelOwner' | 'Distributor',
      creditPercentage?: number,
    }
  ],
  
  status: 'Draft' | 'Submitted' | 'Approved' | 'Published' | 'Blocked',
  
  // Publishing gate status
  publishing: {
    canPublish: boolean,
    lastGateCheckAt: ISO8601,
    blockingArtists?: [string],   // Artist IDs blocking publication
    gateErrors?: [string],
  },
  
  // DSP distribution status
  distribution: {
    status: 'Pending' | 'InProgress' | 'Distributed' | 'Failed',
    platforms: [
      {
        name: 'Spotify' | 'Apple' | 'YouTube' | etc,
        status: 'Pending' | 'Live' | 'Failed',
        url?: string,
        publishedAt?: ISO8601,
      }
    ],
  },
  
  createdAt: ISO8601,
  updatedAt: ISO8601,
  publishedAt?: ISO8601,
}
```

**Indexes**:

- `releaseId` (unique)
- `status`
- `createdAt` (descending)
- `artists`
- `contributors.artistId`

**Access Pattern**: Fetch by releaseId, filter by status, find by contributor

---

### 3. **artists** - Artist Master Data

**Purpose**: Central artist profile, metadata, catalog info

**Schema**:

```ts
{
  _id: ObjectId,
  artistId: string,              // Unique identifier
  stage_name: string,
  legal_name?: string,
  bio?: string,
  
  contact: {
    email: string,
    phone?: string,
    website?: string,
    social?: {
      spotify?: string,
      instagram?: string,
      twitter?: string,
      youtube?: string,
    }
  },
  
  profile: {
    image_url?: string,
    genre: [string],
    country: string,
    verified: boolean,
  },
  
  catalog: {
    total_releases: number,
    total_songs: number,
    total_streams?: number,
  },
  
  subscriptions: {
    tier: 'Free' | 'Studio' | 'Label' | 'Enterprise',
    active: boolean,
    billingCycle?: 'monthly' | 'yearly',
  },
  
  createdAt: ISO8601,
  updatedAt: ISO8601,
}
```

**Indexes**:

- `artistId` (unique)
- `stage_name`
- `email` (unique)
- `subscriptions.tier`
- `subscriptions.active`

**Access Pattern**: Fetch by artistId, search by name, filter by tier

---

### 4. **enrollmentTasks** - BMI/SoundExchange Automation

**Purpose**: Track async enrollment processes (webhooks, polling)

**Schema**:

```ts
{
  _id: ObjectId,
  taskId: string,                // Unique task identifier
  artistId: string,
  
  enrollmentType: 'BMI_Writer' | 'ASCAP_Writer' | 'SoundExchange_Featured' | etc,
  org: 'BMI' | 'ASCAP' | 'SESAC' | 'SoundExchange',
  
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Abandoned',
  
  // External IDs from org APIs
  externalIds: {
    bmiFrn?: string,
    soundexchangeId?: string,
    ascapId?: string,
    sesacId?: string,
  },
  
  // Retry/polling info
  attempts: number,
  lastAttemptAt: ISO8601,
  nextRetryAt?: ISO8601,
  
  // Error tracking
  error?: {
    code: string,
    message: string,
    details?: any,
  },
  
  createdAt: ISO8601,
  completedAt?: ISO8601,
  updatedAt: ISO8601,
}
```

**Indexes**:

- `taskId` (unique)
- `artistId`
- `status`
- `org`
- `nextRetryAt` (for polling)
- `createdAt` (descending)

**Access Pattern**: Fetch pending/processing tasks, update on completion

---

### 5. **releases_gate_logs** - Audit Trail for Publishing Gates

**Purpose**: Track all release gate validation checks for debugging

**Schema**:

```ts
{
  _id: ObjectId,
  releaseId: string,
  checkId: string,               // Unique check identifier
  
  timestamp: ISO8601,
  
  check: {
    passed: boolean,
    artists_checked: number,
    artists_blocked: number,
  },
  
  results: [
    {
      artistId: string,
      role: string,
      status: 'Pass' | 'Fail',
      issues: [string],
    }
  ],
  
  requestedBy?: string,          // User/system that triggered check
}
```

**Indexes**:

- `releaseId`
- `timestamp` (descending)
- `check.passed`

**Access Pattern**: Query by releaseId, time-based queries

---

### 6. **payouts** - Payment Distribution Tracking

**Purpose**: Track payments to artists (phase 2+)

**Schema**:

```ts
{
  _id: ObjectId,
  payoutId: string,
  artistId: string,
  
  period: {
    startDate: ISO8601,
    endDate: ISO8601,
  },
  
  amount: {
    currency: 'USD',
    gross: number,               // Before fees
    fees: number,
    net: number,                 // After fees
  },
  
  sources: [
    {
      platform: 'Spotify' | 'Apple' | 'YouTube' | etc,
      amount: number,
      streams?: number,
    }
  ],
  
  status: 'Pending' | 'Processing' | 'Paid' | 'Failed',
  
  // Payment method
  paymentMethod: 'ACH' | 'Wire' | 'Check',
  transactionId?: string,
  processedAt?: ISO8601,
  
  createdAt: ISO8601,
  updatedAt: ISO8601,
}
```

**Indexes**:

- `payoutId` (unique)
- `artistId`
- `status`
- `period.endDate` (descending)

**Access Pattern**: Fetch by artistId, filter by period

---

### 7. **campaigns** - Marketing & Promotion

**Purpose**: Track marketing campaigns (phase 2+)

**Schema**:

```ts
{
  _id: ObjectId,
  campaignId: string,
  artistId: string,
  
  title: string,
  description?: string,
  
  type: 'Playlist_Pitch' | 'Influencer' | 'Paid_Ads' | 'PR',
  
  releases: [
    {
      releaseId: string,
      title: string,
    }
  ],
  
  status: 'Draft' | 'Active' | 'Completed' | 'Archived',
  
  metrics: {
    reach?: number,
    clicks?: number,
    conversions?: number,
    cost?: number,
    roi?: number,
  },
  
  startDate: ISO8601,
  endDate?: ISO8601,
  
  createdAt: ISO8601,
  updatedAt: ISO8601,
}
```

**Indexes**:

- `campaignId` (unique)
- `artistId`
- `status`
- `startDate` (descending)

---

### 8. **streamgod_brain_data** - AI/ML Scoring Data

**Purpose**: Store StreamGod recommendations, predictions, scores

**Schema**:

```ts
{
  _id: ObjectId,
  releaseId: string,
  artistId: string,
  
  predictions: {
    estimated_streams: number,
    viral_probability: number,    // 0-100
    audience_growth_potential: number,
    best_launch_date?: ISO8601,
    recommended_playlists: [string],
  },
  
  analysis: {
    genre_trend_score: number,
    production_quality_score: number,
    market_saturation: number,    // 0-100
    competition_level: string,    // Low/Medium/High
  },
  
  recommendations: [
    {
      type: 'Genre' | 'Features' | 'Timing' | 'Marketing',
      suggestion: string,
      confidence: number,         // 0-100
    }
  ],
  
  metadata: {
    model_version: string,
    trained_date: ISO8601,
    data_version: string,
  },
  
  createdAt: ISO8601,
  updatedAt: ISO8601,
}
```

**Indexes**:

- `releaseId` (unique)
- `artistId`
- `predictions.viral_probability` (descending)

---

## 🔐 Security & Access Control

### Firebase Security Rules (Future Integration)

```plaintext
rules_version = '2';
service cloud.firestore {
  // Note: This pattern can be extended to MongoDB with application-level RBAC
  
  match /databases/{document=**} {
    // Artists can read/write own profile
    allow read, write: if request.auth.uid == resource.data.artistId;
    
    // Admin/Staff can read anything
    allow read: if isDmfStaff();
    
    // Public read for published releases
    allow read: if resource.data.status == 'Published';
  }
  
  function isDmfStaff() {
    return request.auth.token.email.endsWith('@dmf.io');
  }
}
```

### MongoDB Best Practices (Implementation-Level)

1. **Encryption at Rest**: MongoDB Atlas automatic encryption
2. **Encryption in Transit**: TLS 1.2+ for all connections
3. **Authentication**: User/password (bighomiecash8346)
4. **Authorization**: Application-level role-based checks
5. **PII Protection**: Sensitive fields (SSN, routing numbers) encrypted in app layer

---

## 📈 Scaling & Performance

### Connection Pooling

Firebase Cloud Functions automatically pools connections via `mongoClient.ts`:

```ts
const mongoClient = new MongoClient(uri, {
  maxPoolSize: 10,    // Max connections per function instance
  minPoolSize: 2,     // Min warmup connections
});
```

### Query Performance

**Key Indexes Created**:

| Collection | Fields | Purpose |
|-----------|--------|---------|
| royaltyProfiles | artistId | Fast artist lookup |
| royaltyProfiles | consent.royaltyLockInEnabled | Filter enrolled artists |
| royaltyProfiles | updatedAt DESC | Recent changes first |
| releases | releaseId | Fast release lookup |
| releases | status, createdAt DESC | Filter & sort by status |
| releases | contributors.artistId | Find releases by contributor |
| artists | artistId, email | Master data lookups |
| enrollmentTasks | status, nextRetryAt | Polling queries |

**Expected Performance**:

- Single document fetch: **<10ms**
- Indexed query: **<50ms**
- Aggregation pipeline: **<200ms**

---

## 🔄 Connection Setup for Each Backend

### Firebase Cloud Functions

```ts
// functions/src/db/mongoClient.ts
import { MongoClient } from 'mongodb';
import * as functions from 'firebase-functions';

const uri = functions.config().dmf?.mongodb_uri;
const client = new MongoClient(uri);

export async function getDb() {
  await client.connect();
  return client.db('dmf_music_platform');
}
```

**Setup**:

```bash
firebase functions:config:set \
  dmf.mongodb_uri="mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform"

firebase deploy --only functions
```

### Lovable Backend

```ts
// In Lovable's Node/Express backend
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
export const db = client.db('dmf_music_platform');
```

**Environment Variable**:

```bash
MONGODB_URI=mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform
```

### Other Services

Any backend (Next.js, Python, Go, etc.) can connect:

```
mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform
```

---

## 📋 Collection Initialization Checklist

Before going live, populate these collections:

- [ ] **royaltyProfiles**: Load test artists (10-50)
- [ ] **artists**: Load master artist data
- [ ] **releases**: Load test releases
- [ ] **enrollmentTasks**: Create sample enrollment tasks

---

## 🚀 Deployment & Monitoring

### Connect & Test

```bash
# Using MongoDB CLI
mongosh "mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform"

# List collections
show collections

# Check indexes
db.royaltyProfiles.getIndexes()
```

### Monitor Performance

**MongoDB Atlas Dashboard**:

1. Go to https://cloud.mongodb.com
2. Project: **dmf-music-platform**
3. Cluster: **Shared tier** (free 512MB)
4. Performance insights available in Atlas UI

---

## 📊 Data Migration Strategy

### Phase 1: Royalty Lock-In (Current)

**Collections**: royaltyProfiles, releases, enrollmentTasks  
**Size**: ~100MB  
**Update frequency**: Daily

### Phase 2: Operations (Q1 2026)

**Add**: payouts, campaigns, audit_logs  
**Size Growth**: +50MB

### Phase 3: Distribution (Q2 2026)

**Add**: dsp_submissions, streaming_data, payment_history  
**Size Growth**: +200MB

### Phase 4: Intelligence (Q3 2026)

**Add**: streamgod_brain_data, ml_models, analytics  
**Size Growth**: +500MB

---

## 🆘 Troubleshooting

### Connection Failures

**Error**: `MongoNetworkError: connect ENOTFOUND`

**Solution**: 
- Verify IP whitelisting in MongoDB Atlas
- Check password has no special characters (or URL-encode them)
- Test with: `mongosh "mongodb+srv://user:pass@..."`

### Timeout on Queries

**Error**: `MongooseError: Cannot connect after 30000ms`

**Solution**:
- Increase timeout: `serverSelectionTimeoutMS: 60000`
- Check Firebase function memory: min 512MB recommended
- Review index coverage for your queries

### Data Inconsistency

**Issue**: Data in Firebase and Lovable backends don't match

**Solution**:
- Both should use **same MongoDB URI**
- Verify both reading from same collection
- Check timestamps for recent updates
- Review audit logs in releases_gate_logs

---

## 📚 Related Documentation

- `FRONTEND_INTEGRATION_GUIDE.md` - How frontend calls Firebase/Lovable backends
- `LOVABLE_BACKEND_SETUP.md` - Lovable-specific MongoDB setup (creating next)
- `DEPLOYMENT_READY.md` - Overall system readiness
- `FIREBASE_ROYALTY_SETUP.md` - Firebase Cloud Functions deployment

---

**Database Status**: ✅ Ready for production  
**Cluster**: `dmf-music-platform.pfqrhc.mongodb.net`  
**Database**: `dmf_music_platform`  
**Collections**: 8 (5 immediate, 3 reserved)  
**Last Updated**: November 17, 2025
