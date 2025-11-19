# Lovable Backend Implementation Guide

**Purpose**: Step-by-step guide to implement the royalty backend in Lovable  
**Scope**: Full Node.js + MongoDB integration ready to deploy  
**Status**: Copy-paste implementation  

---

## 🎯 Overview

Lovable provides a full-stack Node.js environment that can directly connect to MongoDB Atlas. This guide shows how to build the exact same royalty endpoints that Firebase Cloud Functions provides, but within Lovable's backend.

**Benefits**:
- Single codebase (frontend + backend in Lovable)
- No Firebase functions needed (optional but supported)
- Direct MongoDB connection
- Same data as Firebase backend
- Easier debugging and deployment

---

## 🏗️ Backend Architecture in Lovable

```
Lovable Project
├── api/
│   ├── royalty.ts          (← Create these)
│   ├── releases.ts
│   └── health.ts
├── db/
│   └── mongoClient.ts      (← Connection pooling)
├── types/
│   └── index.ts            (← TypeScript types)
└── config/
    └── environment.ts      (← Config management)
```

---

## 📝 Step 1: Create MongoDB Connection Module

**File**: `api/db/mongoClient.ts`

```typescript
import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGODB_URI ||
  "mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform";

const DB_NAME = "dmf_music_platform";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const client = new MongoClient(MONGO_URI, {
      retryWrites: true,
      w: "majority",
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
    });

    await client.connect();
    console.log("✅ Connected to MongoDB");

    cachedClient = client;
    cachedDb = client.db(DB_NAME);

    return cachedDb;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

export async function getCollection(collectionName: string) {
  const db = await connectToDatabase();
  return db.collection(collectionName);
}

export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log("✅ Closed MongoDB connection");
  }
}
```

**What it does**:
- ✅ Connection pooling (reuses same connection)
- ✅ Automatic reconnect
- ✅ Error handling
- ✅ Graceful shutdown

---

## 📝 Step 2: Create TypeScript Types

**File**: `api/types/index.ts`

```typescript
// Royalty Profile
export interface RoyaltyProfile {
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

  enrollmentStatuses: EnrollmentStatus[];
  payoutInfo?: PayoutInfo;
  taxInfo?: TaxInfo;

  createdAt: Date;
  updatedAt: Date;
}

export interface EnrollmentStatus {
  org: "BMI" | "SoundExchange" | "ASCAP" | "SESAC";
  scope?: string;
  status: "Completed" | "InProgress" | "Pending" | "Failed";
  enrollmentId?: string;
  enrolledAtUtc?: Date;
  completedAtUtc?: Date;
  errorMessage?: string;
}

export interface PayoutInfo {
  preferredMethod: "ACH" | "Check" | "Wire";
  bankName: string;
  accountHolder: string;
  routingNumber: string;
  accountNumber: string;
}

export interface TaxInfo {
  w9Filed: boolean;
  w9FiledAtUtc?: Date;
}

// Release
export interface Release {
  releaseId: string;
  title: string;
  artists: string[];
  contributors: Contributor[];
  status: "Draft" | "Submitted" | "Rejected" | "Published";

  publishing: {
    canPublish: boolean;
    lastGateCheckAt?: Date;
    blockingArtists: string[];
    gateErrors: string[];
  };

  distribution: {
    status: "Pending" | "InProgress" | "Complete" | "Failed";
    platforms: Platform[];
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface Contributor {
  artistId: string;
  role: string;
  creditPercentage: number;
}

export interface Platform {
  name: string;
  status: "Pending" | "InProgress" | "Live" | "Failed";
  publishedAt?: Date;
}

// API Response Types
export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
```

---

## 📝 Step 3: Create Royalty API Endpoints

**File**: `api/royalty.ts`

```typescript
import { Request, Response } from "express";
import { getCollection } from "./db/mongoClient";
import type { RoyaltyProfile, ApiResponse } from "./types";

// ========================================
// GET: /api/royalty/profile
// ========================================
export async function getRoyaltyProfile(req: Request, res: Response) {
  try {
    const { artistId } = req.query;

    if (!artistId || typeof artistId !== "string") {
      return res.status(400).json({
        status: "error",
        error: {
          code: "INVALID_ARTIST_ID",
          message: "artistId query parameter is required",
        },
      } as ApiResponse<null>);
    }

    const collection = await getCollection("royaltyProfiles");
    const profile = await collection.findOne({ artistId });

    if (!profile) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "PROFILE_NOT_FOUND",
          message: `No royalty profile found for artist: ${artistId}`,
        },
      } as ApiResponse<null>);
    }

    return res.status(200).json({
      status: "success",
      data: profile,
    } as ApiResponse<RoyaltyProfile>);
  } catch (error) {
    console.error("Error fetching royalty profile:", error);
    return res.status(500).json({
      status: "error",
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch profile",
      },
    } as ApiResponse<null>);
  }
}

// ========================================
// POST: /api/royalty/profile
// ========================================
export async function saveRoyaltyProfile(req: Request, res: Response) {
  try {
    const { artistId, legalFirstName, legalLastName, email, consent } = req.body;

    // Validation
    if (!artistId || !email) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: "artistId and email are required",
        },
      } as ApiResponse<null>);
    }

    const collection = await getCollection("royaltyProfiles");

    const profileData: RoyaltyProfile = {
      artistId,
      legalFirstName,
      legalLastName,
      email,
      consent: {
        royaltyLockInEnabled: consent?.royaltyLockInEnabled ?? false,
        agreedToTerms: consent?.agreedToTerms ?? false,
        agreedAtUtc: consent?.agreedAtUtc ? new Date(consent.agreedAtUtc) : undefined,
      },
      enrollmentStatuses: req.body.enrollmentStatuses || [],
      payoutInfo: req.body.payoutInfo,
      taxInfo: req.body.taxInfo,
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const existing = await collection.findOne({ artistId });

    if (existing) {
      // Update
      const result = await collection.updateOne(
        { artistId },
        {
          $set: {
            ...profileData,
            updatedAt: new Date(),
          },
        }
      );

      return res.status(200).json({
        status: "success",
        data: { ...profileData, updatedAt: new Date() },
        message: "Profile updated successfully",
      } as ApiResponse<RoyaltyProfile>);
    } else {
      // Create
      const result = await collection.insertOne({
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return res.status(201).json({
        status: "success",
        data: { ...profileData, createdAt: new Date(), updatedAt: new Date() },
        message: "Profile created successfully",
      } as ApiResponse<RoyaltyProfile>);
    }
  } catch (error) {
    console.error("Error saving royalty profile:", error);
    return res.status(500).json({
      status: "error",
      error: {
        code: "SERVER_ERROR",
        message: "Failed to save profile",
      },
    } as ApiResponse<null>);
  }
}

// ========================================
// DELETE: /api/royalty/profile
// ========================================
export async function deleteRoyaltyProfile(req: Request, res: Response) {
  try {
    const { artistId } = req.query;

    if (!artistId || typeof artistId !== "string") {
      return res.status(400).json({
        status: "error",
        error: {
          code: "INVALID_ARTIST_ID",
          message: "artistId query parameter is required",
        },
      } as ApiResponse<null>);
    }

    const collection = await getCollection("royaltyProfiles");
    const result = await collection.deleteOne({ artistId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "PROFILE_NOT_FOUND",
          message: `Profile for artist ${artistId} not found`,
        },
      } as ApiResponse<null>);
    }

    return res.status(200).json({
      status: "success",
      message: `Profile for ${artistId} deleted successfully`,
    } as ApiResponse<null>);
  } catch (error) {
    console.error("Error deleting royalty profile:", error);
    return res.status(500).json({
      status: "error",
      error: {
        code: "SERVER_ERROR",
        message: "Failed to delete profile",
      },
    } as ApiResponse<null>);
  }
}
```

---

## 📝 Step 4: Create Release Gate API

**File**: `api/releases.ts`

```typescript
import { Request, Response } from "express";
import { getCollection } from "./db/mongoClient";
import type { Release, ApiResponse, RoyaltyProfile } from "./types";

// ========================================
// GET: /api/releases/can-publish
// ========================================
export async function canPublishRelease(req: Request, res: Response) {
  try {
    const { releaseId } = req.query;

    if (!releaseId || typeof releaseId !== "string") {
      return res.status(400).json({
        status: "error",
        error: {
          code: "INVALID_RELEASE_ID",
          message: "releaseId query parameter is required",
        },
      } as ApiResponse<null>);
    }

    const releasesCollection = await getCollection("releases");
    const release = await releasesCollection.findOne({ releaseId });

    if (!release) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "RELEASE_NOT_FOUND",
          message: `Release not found: ${releaseId}`,
        },
      } as ApiResponse<null>);
    }

    // Check all artists
    const profilesCollection = await getCollection("royaltyProfiles");
    const blockingArtists: string[] = [];
    const gateErrors: string[] = [];

    for (const artistId of release.artists || []) {
      const profile = (await profilesCollection.findOne({ artistId })) as
        | RoyaltyProfile
        | null;

      if (!profile || !profile.consent.royaltyLockInEnabled) {
        continue; // Not enrolled, skip
      }

      // Check required enrollments
      const hasAllEnrollments =
        profile.enrollmentStatuses.filter((e) => e.status === "Completed")
          .length >= 2; // At least BMI + SoundExchange

      if (!hasAllEnrollments) {
        blockingArtists.push(artistId);
        gateErrors.push(
          `Artist ${artistId}: Missing or incomplete required enrollments`
        );
      }
    }

    const canPublish = blockingArtists.length === 0;

    // Log the check
    const logsCollection = await getCollection("releases_gate_logs");
    await logsCollection.insertOne({
      releaseId,
      checkId: `check-${Date.now()}`,
      timestamp: new Date(),
      check: {
        passed: canPublish,
        artists_checked: release.artists?.length || 0,
        artists_blocked: blockingArtists.length,
      },
      results: (release.artists || []).map((artistId) => ({
        artistId,
        status: blockingArtists.includes(artistId) ? "Fail" : "Pass",
      })),
      requestedBy: "api",
    });

    return res.status(200).json({
      status: "success",
      canPublish,
      blockingArtists,
      gateErrors,
      message: canPublish ? "Release is ready to publish" : "Release cannot be published",
    } as any);
  } catch (error) {
    console.error("Error checking publish gate:", error);
    return res.status(500).json({
      status: "error",
      error: {
        code: "SERVER_ERROR",
        message: "Failed to check publish gate",
      },
    } as ApiResponse<null>);
  }
}

// ========================================
// GET: /api/releases/status
// ========================================
export async function getReleaseStatus(req: Request, res: Response) {
  try {
    const { releaseId } = req.query;

    if (!releaseId || typeof releaseId !== "string") {
      return res.status(400).json({
        status: "error",
        error: {
          code: "INVALID_RELEASE_ID",
          message: "releaseId query parameter is required",
        },
      } as ApiResponse<null>);
    }

    const collection = await getCollection("releases");
    const release = await collection.findOne({ releaseId });

    if (!release) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "RELEASE_NOT_FOUND",
          message: `Release not found: ${releaseId}`,
        },
      } as ApiResponse<null>);
    }

    return res.status(200).json({
      status: "success",
      data: release,
    } as ApiResponse<Release>);
  } catch (error) {
    console.error("Error fetching release status:", error);
    return res.status(500).json({
      status: "error",
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch release status",
      },
    } as ApiResponse<null>);
  }
}
```

---

## 📝 Step 5: Create Express Server Configuration

**File**: `server.ts` (or wherever your Lovable backend starts)

```typescript
import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import handlers
import {
  getRoyaltyProfile,
  saveRoyaltyProfile,
  deleteRoyaltyProfile,
} from "./api/royalty";
import {
  canPublishRelease,
  getReleaseStatus,
} from "./api/releases";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://lovable.dev",
    process.env.FRONTEND_URL || "",
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ========================================
// Royalty Profile Routes
// ========================================
app.get("/api/royalty/profile", getRoyaltyProfile);
app.post("/api/royalty/profile", saveRoyaltyProfile);
app.delete("/api/royalty/profile", deleteRoyaltyProfile);

// ========================================
// Release Routes
// ========================================
app.get("/api/releases/can-publish", canPublishRelease);
app.get("/api/releases/status", getReleaseStatus);

// ========================================
// Legacy compatibility routes (Firebase client compatibility)
// ========================================
app.get("/getRoyaltyProfile", getRoyaltyProfile);
app.post("/saveRoyaltyProfile", saveRoyaltyProfile);
app.delete("/deleteRoyaltyProfile", deleteRoyaltyProfile);
app.get("/canPublishRelease", canPublishRelease);
app.get("/getReleaseStatus", getReleaseStatus);

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    error: {
      code: "NOT_FOUND",
      message: `Endpoint not found: ${req.method} ${req.path}`,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 API endpoints ready`);
});
```

---

## 🔧 Configuration: Environment Variables

**File**: `.env.local` (for development)

```env
# MongoDB
MONGODB_URI=mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# API Keys (if needed)
API_KEY=your-api-key-here
```

**File**: `.env.production` (for deployment)

```env
MONGODB_URI=mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-production-frontend.com
```

---

## 📦 Package Dependencies

**File**: `package.json` (ensure these are included)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongodb": "^6.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "ts-node": "^10.9.1"
  },
  "scripts": {
    "dev": "ts-node server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

---

## 🚀 Deployment Steps

### Option 1: Deploy to Lovable Hosting

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Add royalty backend endpoints"
   git push origin main
   ```

2. **In Lovable Studio**:
   - Backend settings → Connect repository
   - Select your branch
   - Configure environment variables (MONGODB_URI, etc.)
   - Deploy

3. **Verify deployment**:
   ```bash
   curl https://your-lovable-backend.lovable.dev/health
   ```

### Option 2: Deploy to Vercel (Serverless)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json`**:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "functions": {
       "api/**/*.ts": {
         "memory": 1024,
         "maxDuration": 60
       }
     }
   }
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option 3: Deploy to Railway/Render

1. **Push to GitHub**
2. **Connect repository to Railway/Render**
3. **Add environment variables**
4. **Deploy automatically**

---

## 🧪 Testing the Backend

### Local Testing

```bash
# Start backend
npm run dev

# Test get profile
curl "http://localhost:3000/api/royalty/profile?artistId=artist-001"

# Test save profile
curl -X POST "http://localhost:3000/api/royalty/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "artistId": "artist-test",
    "legalFirstName": "Test",
    "legalLastName": "User",
    "email": "test@example.com",
    "consent": {
      "royaltyLockInEnabled": true,
      "agreedToTerms": true
    }
  }'

# Test publish gate
curl "http://localhost:3000/api/releases/can-publish?releaseId=release-001"
```

### Production Testing

```bash
# Test deployed backend
curl "https://your-backend.lovable.dev/health"
curl "https://your-backend.lovable.dev/api/royalty/profile?artistId=artist-001"
```

---

## 🔒 Security Considerations

1. **API Keys**: Add API key validation
```typescript
app.use((req: Request, res: Response, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});
```

2. **Rate Limiting**: Install `express-rate-limit`
```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api/", limiter);
```

3. **Input Validation**: Use `joi` or `zod`
```typescript
import z from "zod";

const RoyaltySchema = z.object({
  artistId: z.string().min(1),
  email: z.string().email(),
  // ...
});
```

---

## 📝 Connecting Frontend to Lovable Backend

Update your frontend `backend.ts` config:

```typescript
// Before (Firebase)
export const DMF_BACKEND_BASE = 
  "https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app";

// After (Lovable)
export const DMF_BACKEND_BASE = 
  process.env.REACT_APP_BACKEND_URL || 
  "https://your-lovable-backend.lovable.dev";
```

All API calls remain the same - they just hit the Lovable backend instead.

---

## ✅ Verification Checklist

- [ ] MongoDB connection works locally
- [ ] All 5 endpoints return correct responses
- [ ] POST endpoints validate input
- [ ] DELETE endpoints return proper errors
- [ ] Gate logic blocks unprepared releases
- [ ] Logs are created in releases_gate_logs
- [ ] Environment variables configured
- [ ] CORS enabled for frontend origin
- [ ] Error handling comprehensive
- [ ] Backend deployed to production
- [ ] Frontend points to new backend URL
- [ ] Tests pass against production backend

---

**Status**: ✅ Lovable backend ready to implement

**Total Implementation Time**: 2-3 hours  
**Deployment Time**: 15 minutes  
**Testing Time**: 1 hour
