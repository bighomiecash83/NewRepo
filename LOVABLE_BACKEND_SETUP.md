# Lovable Backend - MongoDB Integration Setup

**Frontend**: `https://lovable.dev/@dmfmusicplatform`  
**Database**: MongoDB Atlas (dmf_music_platform)  
**Status**: ✅ Ready for Lovable integration  
**Date**: November 17, 2025

---

## 🎯 Quick Start - Lock Mongo Into Lovable (5 Minutes)

### Step 1: Get Your MongoDB URI

```text
mongodb+srv://bighomiecash8346:YOUR_ACTUAL_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform
```

**Components**:
- **Username**: `bighomiecash8346`
- **Password**: Your MongoDB Atlas password (saved securely)
- **Cluster**: `dmf-music-platform.pfqrhc.mongodb.net`
- **Database**: `dmf_music_platform`

### Step 2: Add to Lovable Environment

In Lovable project settings:

**Environment Variables**:

```bash
MONGODB_URI=mongodb+srv://bighomiecash8346:YOUR_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform
DMF_BACKEND_BASE=https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app
NODE_ENV=production
```

### Step 3: Install MongoDB Package

In your Lovable backend (if Node.js):

```bash
npm install mongodb
```

### Step 4: Create MongoDB Client

Create `src/lib/db.ts` in Lovable:

```ts
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Missing MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;

async function connectToDatabase(): Promise<Db> {
  if (cachedClient) {
    return cachedClient.db('dmf_music_platform');
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
  });

  await client.connect();
  cachedClient = client;

  return client.db('dmf_music_platform');
}

export async function getDb(): Promise<Db> {
  return connectToDatabase();
}

export async function closeDatabase(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
  }
}
```

### Step 5: Use in API Routes

Example Lovable API route:

```ts
// src/routes/api/royalty.ts
import { Router } from 'express';
import { getDb } from '../../lib/db';

const router = Router();

router.get('/profile/:artistId', async (req, res) => {
  try {
    const db = await getDb();
    const profile = await db
      .collection('royaltyProfiles')
      .findOne({ artistId: req.params.artistId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

**Done!** Lovable is now connected to MongoDB.

---

## 🏗️ Lovable Backend Architecture

### Why Lovable is Primary Backend

| Aspect | Firebase Functions | Lovable | 
|--------|-------------------|--------|
| **Deployment** | Google Cloud | Lovable Platform |
| **Scaling** | Auto (FaaS) | Auto (Lovable) |
| **Database** | MongoDB Atlas | MongoDB Atlas |
| **API Framework** | Firebase SDK | Express/Next.js |
| **Development** | TypeScript + Firebase | Full-stack Node.js |
| **Frontend Integration** | REST endpoints | Full BFF pattern |
| **Role** | **Utility/Optional** | **Primary backend** |

**Key Advantage**: Lovable handles both frontend AND backend, single source of code truth.

---

## 📦 Lovable Project Structure

Recommended structure for Lovable backend:

```
lovable-dmf-backend/
├── src/
│   ├── lib/
│   │   ├── db.ts                 # MongoDB connection
│   │   ├── auth.ts               # Authentication
│   │   └── env.ts                # Environment config
│   │
│   ├── models/
│   │   ├── RoyaltyProfile.ts     # Schema/types
│   │   ├── Release.ts
│   │   ├── Artist.ts
│   │   └── EnrollmentTask.ts
│   │
│   ├── routes/
│   │   ├── api/
│   │   │   ├── royalty.ts        # GET/POST/DELETE profiles
│   │   │   ├── releases.ts       # Release gate logic
│   │   │   ├── artists.ts        # Artist master data
│   │   │   └── enrollments.ts    # BMI/SoundExchange
│   │   │
│   │   └── health.ts             # /health endpoint
│   │
│   ├── middleware/
│   │   ├── cors.ts               # CORS configuration
│   │   ├── auth.ts               # Authorization checks
│   │   └── logging.ts            # Request logging
│   │
│   └── app.ts                    # Express app setup
│
├── .env.example
├── .env.production
├── package.json
└── README.md
```

---

## 🔌 API Endpoints in Lovable

Lovable should expose the same 5 endpoints as Firebase (plus more as needed):

### Royalty Profile Endpoints

```
GET    /api/royalty/profile/:artistId
POST   /api/royalty/profile
DELETE /api/royalty/profile/:artistId
```

**Example GET**:

```ts
router.get('/profile/:artistId', async (req, res) => {
  const db = await getDb();
  const profile = await db.collection('royaltyProfiles').findOne({
    artistId: req.params.artistId
  });
  
  if (!profile) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  
  res.json({ success: true, data: profile });
});
```

**Example POST**:

```ts
router.post('/profile', async (req, res) => {
  const db = await getDb();
  const { artistId, ...profileData } = req.body;
  
  if (!artistId) {
    return res.status(400).json({ success: false, message: 'artistId required' });
  }
  
  const result = await db.collection('royaltyProfiles').updateOne(
    { artistId },
    { 
      $set: { 
        ...profileData, 
        updatedAt: new Date().toISOString() 
      } 
    },
    { upsert: true }
  );
  
  const saved = await db.collection('royaltyProfiles').findOne({ artistId });
  res.json({ success: true, data: saved });
});
```

### Release Gate Endpoints

```
GET    /api/releases/can-publish/:releaseId
GET    /api/releases/status/:releaseId
```

**Example**:

```ts
router.get('/can-publish/:releaseId', async (req, res) => {
  const db = await getDb();
  const release = await db.collection('releases').findOne({
    releaseId: req.params.releaseId
  });
  
  if (!release) {
    return res.status(404).json({ success: false });
  }
  
  // Check each contributor's enrollment
  const blockedArtists = [];
  for (const contributor of release.contributors) {
    const profile = await db.collection('royaltyProfiles').findOne({
      artistId: contributor.artistId
    });
    
    if (!profile?.consent?.royaltyLockInEnabled) {
      blockedArtists.push({
        artistId: contributor.artistId,
        issue: 'Royalty lock-in not enabled'
      });
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

## 🔒 Authentication & Authorization

### Basic Auth Middleware

```ts
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const token = authHeader.slice(7);
  
  // Verify token (Firebase, Auth0, etc)
  if (!verifyToken(token)) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
  
  next();
}

// Use in routes:
router.get('/profile/:artistId', requireAuth, async (req, res) => {
  // Protected endpoint
});
```

### Role-Based Access Control

```ts
export function requireRole(role: 'artist' | 'dmf_staff' | 'admin') {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    
    if (userRole !== role && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    next();
  };
}

// Use:
router.delete('/profile/:artistId', requireRole('admin'), deleteProfile);
```

---

## 🌐 CORS & Frontend Integration

### CORS Configuration

```ts
// src/middleware/cors.ts
import cors from 'cors';

export const corsMiddleware = cors({
  origin: [
    'https://studio--studio-5828448336-5a604.us-central1.hosted.app',
    'http://localhost:3000',  // dev
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Frontend Calling Lovable

```ts
// In your frontend
const LOVABLE_API = 'https://your-lovable-backend-url';

async function getRoyaltyProfile(artistId: string) {
  const res = await fetch(`${LOVABLE_API}/api/royalty/profile/${artistId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  return res.json();
}
```

---

## 🧪 Testing Lovable Endpoints

### Local Development

```bash
# Start Lovable dev server
npm run dev

# Test endpoints
curl http://localhost:3000/api/royalty/profile/test-artist-123
```

### Production Testing

```bash
# Get your Lovable backend URL from Lovable dashboard
LOVABLE_URL="https://your-lovable-app.lovable.app"

# Test royalty profile endpoint
curl -X GET "$LOVABLE_URL/api/royalty/profile/artist-123" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test create profile
curl -X POST "$LOVABLE_URL/api/royalty/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "artistId": "artist-123",
    "legalFirstName": "John",
    "legalLastName": "Doe",
    "email": "john@example.com"
  }'

# Test release gate
curl -X GET "$LOVABLE_URL/api/releases/can-publish/release-456" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Lovable vs Firebase Endpoints

Both backends expose similar APIs but Lovable is **primary**:

| Endpoint | Firebase | Lovable | Route |
|----------|----------|---------|-------|
| Get Profile | ✅ | ✅ | `/getRoyaltyProfile` or `/api/royalty/profile/:id` |
| Save Profile | ✅ | ✅ | `/saveRoyaltyProfile` or `/api/royalty/profile` |
| Delete Profile | ✅ | ✅ | `/deleteRoyaltyProfile` or `/api/royalty/profile/:id` |
| Can Publish | ✅ | ✅ | `/canPublishRelease` or `/api/releases/can-publish/:id` |
| Release Status | ✅ | ✅ | `/getReleaseStatus` or `/api/releases/status/:id` |

**Recommendation**: 
- Frontend calls **Lovable** by default
- Firebase available as **fallback/utility**
- Both read/write to **same MongoDB**

---

## 🚀 Deployment to Production

### Deploy Lovable

1. **In Lovable Dashboard**:
   - Set environment variables (MONGODB_URI, etc)
   - Deploy button → Production

2. **Verify Connection**:
   ```bash
   curl https://your-lovable-app.lovable.app/health
   ```

3. **Test Endpoints**:
   ```bash
   curl https://your-lovable-app.lovable.app/api/royalty/profile/test-123
   ```

### Post-Deployment

- [ ] MongoDB connection working
- [ ] All 5+ endpoints responding
- [ ] CORS headers present
- [ ] Auth tokens validated
- [ ] Logging enabled
- [ ] Error tracking set up (Sentry, LogRocket)
- [ ] Monitoring alerts configured

---

## 📈 Scaling & Monitoring

### Lovable Scaling

Lovable automatically scales:
- Horizontal: Across multiple instances
- Vertical: Increased memory/CPU as needed

**MongoDB Connection**: 
- Use connection pooling (default in Node.js driver)
- Firebase has maxPoolSize: 10
- Lovable should use similar: 10-20

### Monitoring

**In Lovable Dashboard**:
- View logs
- Monitor response times
- Check error rates
- View CPU/memory usage

**MongoDB Atlas Dashboard**:
- Query performance
- Index usage
- Connection metrics
- Storage growth

---

## 🔄 Keeping Firebase & Lovable in Sync

Both backends **share MongoDB**, so they're always in sync:

```
┌─────────┐          ┌─────────┐
│ Firebase│          │ Lovable │
│ Functions          │ Backend │
└────┬────┘          └────┬────┘
     │                    │
     │   Read/Write       │
     └────────────┬───────┘
                  │
            ┌─────▼─────┐
            │ MongoDB   │
            │ (Single   │
            │  source)  │
            └───────────┘
```

**Key Point**: Don't sync data between backends. Just use the same MongoDB URI.

---

## 🛠️ Troubleshooting Lovable + MongoDB

### Issue: Connection Timeout

**Symptoms**: Requests timeout when accessing MongoDB

**Solutions**:
1. Check IP whitelisting in MongoDB Atlas (add Lovable IP)
2. Verify password matches (check special characters)
3. Test locally with `mongosh` CLI
4. Increase timeout: `serverSelectionTimeoutMS: 60000`

### Issue: Authorization Error

**Symptoms**: 403 Forbidden on protected endpoints

**Solutions**:
1. Verify auth token is passed in headers
2. Check token is valid and not expired
3. Verify user role in token matches endpoint requirement
4. Check CORS headers allow your frontend origin

### Issue: Data Mismatch Between Firebase & Lovable

**Symptoms**: Same artistId returns different data

**Solutions**:
1. Verify both backends use same MONGODB_URI
2. Check database name is `dmf_music_platform`
3. Review write timestamps (which backend wrote last?)
4. Check if collections exist in MongoDB

---

## 📚 Next Steps

After Lovable + MongoDB is live:

1. **Phase 2**: Add email notifications, webhooks, admin dashboard
2. **Phase 3**: Add DSP integration endpoints for distributor
3. **Phase 4**: Add StreamGod Brain AI scoring endpoints

---

## 📋 Checklist - Lovable Production Ready

- [ ] MongoDB URI set in Lovable environment
- [ ] All 5 royalty endpoints implemented
- [ ] MongoDB client configured with pooling
- [ ] CORS middleware configured
- [ ] Authentication middleware working
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Tested locally with mock data
- [ ] Deployed to Lovable production
- [ ] All endpoints responding
- [ ] Frontend successfully calling Lovable
- [ ] Monitoring/alerts configured
- [ ] Backup strategy in place

---

**Status**: ✅ Ready for Lovable integration  
**Database**: `dmf_music_platform` on MongoDB Atlas  
**Primary Backend**: Lovable  
**Fallback Backend**: Firebase Cloud Functions  
**Last Updated**: November 17, 2025
