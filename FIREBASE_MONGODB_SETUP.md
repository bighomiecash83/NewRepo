# Firebase Cloud Functions - MongoDB Setup

**Backend**: `dmf-firebase-backend-main`  
**Database**: MongoDB Atlas  
**Database Name**: `dmf_music_platform`  
**Cluster**: `dmf-music-platform.pfqrhc.mongodb.net`  
**Status**: ✅ Ready to deploy with MongoDB  
**Date**: November 17, 2025

---

## 🎯 Quick Setup (10 Minutes)

### Step 1: Install MongoDB Driver

In `dmf-music-platform/functions/`:

```bash
cd functions
npm install mongodb
```

This updates `package.json` with MongoDB 6.3.0 dependency.

### Step 2: Set Firebase Config Secret

From your machine or Cloud Shell, run:

```bash
firebase functions:config:set \
  dmf.mongodb_uri="mongodb+srv://bighomiecash8346:YOUR_ACTUAL_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform"
```

**This stores the URI as a Firebase secret** (not in code).

### Step 3: Build & Deploy

```bash
cd functions

# Build TypeScript
npm run build

# Deploy to Firebase
npm run deploy
```

**Result**: All 5 endpoints deployed, using MongoDB:
- ✅ getRoyaltyProfile
- ✅ saveRoyaltyProfile
- ✅ deleteRoyaltyProfile
- ✅ canPublishRelease
- ✅ getReleaseStatus

### Step 4: Test Connection

```bash
# Test the /health endpoint (you can add this)
curl https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app/getRoyaltyProfile?artistId=test-artist-123

# Should return 404 (artist doesn't exist yet) but no MongoDB error
```

**Done!** Firebase is now connected to MongoDB.

---

## 🏗️ What Changed in Functions

### File: `functions/package.json` (Updated)

**Added dependencies**:
```json
{
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.8.0",
    "mongodb": "^6.3.0",
    "cors": "^2.8.5"
  }
}
```

**Key scripts**:
```json
{
  "scripts": {
    "build": "tsc",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  }
}
```

### File: `functions/src/db/mongoClient.ts` (New)

Singleton connection manager:

```ts
import { MongoClient, Db } from 'mongodb';
import * as functions from 'firebase-functions';

const uri = functions.config().dmf?.mongodb_uri;
let mongoClient: MongoClient | null = null;

export async function getDb(): Promise<Db> {
  if (!mongoClient) {
    mongoClient = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    await mongoClient.connect();
  }
  return mongoClient.db('dmf_music_platform');
}
```

**Usage in endpoints**:
```ts
const db = await getDb();
const profile = await db.collection('royaltyProfiles').findOne({ artistId });
```

### File: `functions/src/royalty/royaltyApi.ts` (Updated)

Now uses MongoDB instead of Firestore:

```ts
export const getRoyaltyProfile = functions.https.onRequest(async (req, res) => {
  const db = await getDb();
  const profile = await db.collection('royaltyProfiles').findOne({
    artistId: req.query.artistId
  });
  res.json({ success: true, data: profile });
});

export const saveRoyaltyProfile = functions.https.onRequest(async (req, res) => {
  const db = await getDb();
  await db.collection('royaltyProfiles').updateOne(
    { artistId: req.body.artistId },
    { $set: req.body },
    { upsert: true }
  );
  res.json({ success: true });
});
```

### File: `functions/src/royalty/royaltyLogic.ts` (Updated)

Release gate validation now queries MongoDB:

```ts
export const canPublishRelease = functions.https.onRequest(async (req, res) => {
  const db = await getDb();
  const release = await db.collection('releases').findOne({
    releaseId: req.query.releaseId
  });
  
  // Check contributors' enrollment status in royaltyProfiles collection
  const blockedArtists = [];
  for (const contributor of release.contributors) {
    const profile = await db.collection('royaltyProfiles').findOne({
      artistId: contributor.artistId
    });
    
    // Validate enrollment based on role
    if (!hasRequiredEnrollment(profile, contributor.role)) {
      blockedArtists.push(contributor.artistId);
    }
  }
  
  res.json({
    success: true,
    canPublish: blockedArtists.length === 0,
    blockedArtists
  });
});
```

---

## 📊 Database Connection Flow

### How It Works

```
Firebase Cloud Function
    │
    ├─ Triggered by HTTP request
    ├─ Calls getDb() from mongoClient.ts
    │
    ├─ mongoClient creates connection (first time only)
    │  └─ Uses FIREBASE_CONFIG: dmf.mongodb_uri
    │
    ├─ Returns MongoDB database instance
    │  └─ Connected to: dmf_music_platform
    │
    └─ Executes MongoDB query
       └─ Returns result to client
```

### Connection Pooling Benefits

**Firebase Cloud Functions** reuse the same MongoDB connection across invocations:

```
Request 1 → [New connection] → Query → Response
Request 2 → [Reuse connection] → Query → Response  ← Much faster
Request 3 → [Reuse connection] → Query → Response  ← Much faster
```

Without pooling, every request creates a new connection (slow + expensive).

---

## 🔐 Security - Storing the URI

### ❌ DON'T DO THIS (Wrong)

```ts
// ❌ NEVER hardcode the password
const uri = "mongodb+srv://bighomiecash8346:myPassword123@dmf-music-platform...";
```

### ✅ DO THIS (Right)

```ts
// ✅ Use Firebase functions config
const uri = functions.config().dmf?.mongodb_uri;

// URI is stored securely, retrieved at runtime
// Never committed to code
```

### How to Set It

```bash
# Set the secret
firebase functions:config:set \
  dmf.mongodb_uri="mongodb+srv://bighomiecash8346:YOUR_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform"

# View all config (doesn't show password)
firebase functions:config:get

# Deploy (Firebase injects the secret at runtime)
firebase deploy --only functions
```

---

## 🧪 Testing Firebase + MongoDB

### Test 1: Local Emulator

```bash
cd functions

# Start emulator
npm run serve

# In another terminal, test endpoint
curl http://localhost:5001/dmf-music-platform/us-east4/getRoyaltyProfile?artistId=test-123

# Should work but MongoDB will fail (emulator doesn't mock MongoDB)
# That's OK - proves function code works
```

### Test 2: Create Test Data in MongoDB

```bash
# Connect to MongoDB
mongosh "mongodb+srv://bighomiecash8346:YOUR_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform"

# Create test artist
db.royaltyProfiles.insertOne({
  artistId: "test-artist-123",
  legalFirstName: "Test",
  legalLastName: "Artist",
  email: "test@example.com",
  consent: {
    royaltyLockInEnabled: true
  },
  enrollmentStatuses: [
    {
      org: "BMI",
      scope: "Writer",
      status: "Completed"
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
})

# Exit mongosh
exit
```

### Test 3: Test Live Endpoint

```bash
# Call production endpoint
curl "https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app/getRoyaltyProfile?artistId=test-artist-123"

# Should return:
# {
#   "success": true,
#   "data": { artistId, legalFirstName, ... }
# }
```

---

## 🚀 Deployment Checklist

Before deploying to production:

### Prerequisites
- [ ] MongoDB Atlas account set up
- [ ] Cluster created: `dmf-music-platform`
- [ ] Database created: `dmf_music_platform`
- [ ] User created: `bighomiecash8346`
- [ ] Password stored securely
- [ ] IP whitelisting configured (allow Google Cloud IPs)

### Firebase Setup
- [ ] `functions/package.json` has mongodb dependency
- [ ] `functions/src/db/mongoClient.ts` created
- [ ] `functions/src/royalty/royaltyApi.ts` updated
- [ ] `functions/src/royalty/royaltyLogic.ts` updated
- [ ] `functions/src/index.ts` updated
- [ ] `functions/tsconfig.json` configured
- [ ] All TypeScript compiles: `npm run build`

### Firebase Configuration
- [ ] MongoDB URI set: `firebase functions:config:set dmf.mongodb_uri="..."`
- [ ] Config is readable by functions: `firebase functions:config:get`

### Deployment
- [ ] Run `firebase deploy --only functions`
- [ ] Wait for deployment to complete
- [ ] Check Firebase Console → Cloud Functions
- [ ] All 5 functions shown as deployed

### Testing (After Deployment)
- [ ] Create test data in MongoDB
- [ ] Call each endpoint with curl
- [ ] Verify responses
- [ ] Check logs: `firebase functions:log`
- [ ] Test error cases (missing artistId, etc)

### Post-Deployment
- [ ] Monitor function performance
- [ ] Set up logging/alerting
- [ ] Document endpoint URLs
- [ ] Update frontend integration guide
- [ ] Verify CORS headers present

---

## 📈 Performance Optimization

### Current: Firebase + MongoDB

**Expected Performance**:
- Get profile: **50-150ms** (MongoDB query + network)
- Save profile: **100-200ms** (MongoDB write + index)
- Release gate check: **200-500ms** (multiple MongoDB queries)

**Bottlenecks**:
1. Network latency: us-east4 region optimal
2. MongoDB query time: Indexes help
3. Connection pool exhaustion: Fixed with maxPoolSize: 10

### Future Optimization

If performance needs improvement:

1. **Add caching layer**:
   ```ts
   const cache = new Map<string, RoyaltyProfile>();
   
   export async function getRoyaltyProfile(artistId) {
     if (cache.has(artistId)) {
       return cache.get(artistId);
     }
     const profile = await db.collection(...).findOne(...);
     cache.set(artistId, profile);
     return profile;
   }
   ```

2. **Batch queries**:
   ```ts
   // Instead of loop with individual queries
   const profiles = await db.collection('royaltyProfiles')
     .find({ artistId: { $in: artistIds } })
     .toArray();
   ```

3. **Pagination for large result sets**:
   ```ts
   const profiles = await db.collection('releases')
     .find()
     .limit(50)
     .skip(offset)
     .toArray();
   ```

---

## 🛠️ Troubleshooting

### Issue: "Cannot find module 'mongodb'"

**Solution**: 
```bash
cd functions
npm install mongodb
npm run build
```

### Issue: "Missing functions config: dmf.mongodb_uri"

**Solution**:
```bash
# Set the config
firebase functions:config:set \
  dmf.mongodb_uri="mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform"

# Redeploy
firebase deploy --only functions
```

### Issue: MongoDB Connection Timeout

**Cause**: IP not whitelisted or wrong password

**Solution**:
1. Go to MongoDB Atlas Dashboard
2. Click "Network Access"
3. Add Google Cloud IP ranges (or 0.0.0.0/0 for testing only)
4. Verify username/password in URI

### Issue: Slow Queries

**Cause**: Missing indexes

**Solution**:
```bash
mongosh "mongodb+srv://bighomiecash8346:PASSWORD@..."

# Create index for royaltyProfiles
db.royaltyProfiles.createIndex({ artistId: 1 })
db.royaltyProfiles.createIndex({ "consent.royaltyLockInEnabled": 1 })
db.royaltyProfiles.createIndex({ updatedAt: -1 })

# Create index for releases
db.releases.createIndex({ releaseId: 1 })
db.releases.createIndex({ status: 1, createdAt: -1 })
```

---

## 📚 Related Documentation

- `MONGODB_ARCHITECTURE.md` - Full database schema
- `LOVABLE_BACKEND_SETUP.md` - Lovable backend (primary)
- `BACKEND_URL_CONFIG.md` - API endpoints configuration
- `FRONTEND_INTEGRATION_GUIDE.md` - How frontend calls backend

---

## 🔄 Next Steps After Deployment

### Immediate (Today)
1. Test all 5 endpoints with curl
2. Load test data into MongoDB
3. Verify CORS headers working
4. Update frontend integration guide with working URLs

### Short Term (This Week)
1. Load real artist data from existing system
2. Integrate with Lovable backend
3. Test frontend integration
4. Set up monitoring/alerts

### Medium Term (Next Month)
1. Add Phase 2 endpoints (webhooks, notifications)
2. Set up automated backups
3. Performance testing with real data
4. Security audit

---

## ✅ Deployment Success Criteria

- [ ] `firebase deploy --only functions` succeeds without errors
- [ ] Firebase Console shows 5 functions deployed
- [ ] MongoDB URI accessible from Cloud Functions
- [ ] GET endpoint returns data or 404 (not connection error)
- [ ] POST endpoint creates/updates documents in MongoDB
- [ ] DELETE endpoint removes documents from MongoDB
- [ ] CORS headers present on responses
- [ ] Function logs available in Firebase Console
- [ ] Frontend can successfully call endpoints

---

**Status**: ✅ Ready to deploy  
**Database**: MongoDB Atlas (dmf_music_platform)  
**Endpoints**: 5 (royalty CRUD + release gate)  
**Last Updated**: November 17, 2025

---

## 🎬 Deploy Now!

```bash
cd dmf-music-platform/functions

# Install dependencies
npm install

# Build
npm run build

# Set MongoDB URI
firebase functions:config:set \
  dmf.mongodb_uri="mongodb+srv://bighomiecash8346:YOUR_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform"

# Deploy
npm run deploy

# Check logs
firebase functions:log
```

**Deployment Complete!** ✅
