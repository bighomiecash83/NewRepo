# MongoDB Atlas Integration Guide for DMF

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontends (5 Faces)                      │
│  Google AI Studio │ Bolt │ VS Code │ Gemini │ OpenAI Ryia   │
└──────────────────────────────┬──────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
            ┌───────▼────────┐    ┌────────▼──────┐
            │  DMF Gateway   │    │   Firebase    │
            │  (No Mongo)    │    │   (Auth)      │
            │  http://       │    │               │
            │  :5000         │    └───────────────┘
            └────────┬───────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼──┐  ┌────▼────┐  ┌──▼─────┐
    │Lovable│  │.NET     │  │Payments│
    │Backend│  │Brain    │  │Service │
    │Node   │  │:5183    │  │        │
    │:4000  │  │         │  │        │
    └────┬──┘  └────┬────┘  └────────┘
         │          │
         └──────┬───┘
                │
        ┌───────▼──────────────┐
        │ MongoDB Atlas        │
        │ dmf-music-platform   │
        │ pfqrhc cluster       │
        │                      │
        │ One Database         │
        │ Many Services       │
        └──────────────────────┘
```

---

## 📋 Quick Setup Checklist

- [ ] Copy `.env.dmf.example` → `.env.dmf` (add real password)
- [ ] Add `.env.dmf` to `.gitignore` (NEVER commit passwords)
- [ ] Update **Lovable backend** to read `MONGO_URL` env var
- [ ] Install `mongodb` package in Lovable: `npm install mongodb`
- [ ] Update **.NET Brain** `appsettings.Development.json` with Mongo config
- [ ] Install **MongoDB.Driver** NuGet: `dotnet add package MongoDB.Driver`
- [ ] Update **Gateway** `.env` to include backend URLs
- [ ] Start services in order: Lovable → .NET Brain → Gateway
- [ ] Run verification test (see below)

---

## 🔐 Environment Variables Strategy

**Root file: `.env.dmf`** (DO NOT commit)

```bash
# Credentials (no hardcoding!)
DMF_DB_USER=bighomiecash8346
DMF_DB_PASSWORD=YOUR_REAL_PASSWORD_HERE
DMF_DB_NAME=dmf_music_platform
DMF_DB_HOST=dmf-music-platform.pfqrhc.mongodb.net

# Constructed connection string (used by all services)
MONGO_URL="mongodb+srv://${DMF_DB_USER}:${DMF_DB_PASSWORD}@${DMF_DB_HOST}/${DMF_DB_NAME}?retryWrites=true&w=majority"

# Service endpoints
LOVABLE_BACKEND_URL=http://localhost:4000
DOTNET_BRAIN_URL=http://localhost:5183
```

**Why this pattern?**
- Single source of truth for database credentials
- All services read the same `MONGO_URL`
- Easy to swap environment: local → staging → production
- Password never hard-coded anywhere

---

## 🚀 Implementation by Service

### 1️⃣ **Lovable Backend (Node.js/Express)**

**Install MongoDB driver:**
```bash
cd lovable-backend
npm install mongodb
```

**Create `src/mongodb.ts` or `src/mongo-connection.ts`:**
```typescript
import { MongoClient, Db } from "mongodb";

let cachedDb: Db | null = null;
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DMF_DB_NAME || "dmf_music_platform";

if (!mongoUrl) {
  throw new Error("Missing MONGO_URL env var");
}

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(mongoUrl);
  await client.connect();
  cachedDb = client.db(dbName);
  
  await cachedDb.admin().ping();
  console.log("✅ MongoDB connected");
  
  return cachedDb;
}
```

**Use in routes:**
```typescript
import { getDb } from "./mongo-connection";

router.get("/catalog/releases", async (req, res) => {
  const db = await getDb();
  const releases = await db
    .collection("releases")
    .find({ status: "published" })
    .toArray();
  
  res.json({ success: true, data: releases });
});
```

**Lovable `.env`:**
```bash
MONGO_URL=mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?retryWrites=true&w=majority
DMF_DB_NAME=dmf_music_platform
PORT=4000
```

---

### 2️⃣ **.NET StreamGod Brain (C#)**

**Install MongoDB NuGet package:**
```bash
cd dmf-music-platform.Web
dotnet add package MongoDB.Driver
```

**Update `Program.cs` (top-level statements):**
```csharp
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// MongoDB configuration from appsettings
var mongoConnection = builder.Configuration["DMF:MongoConnection"];
var dbName = builder.Configuration["DMF:DbName"] ?? "dmf_music_platform";

if (string.IsNullOrEmpty(mongoConnection))
{
    throw new InvalidOperationException("Missing DMF:MongoConnection");
}

// Register MongoDB services
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var client = new MongoClient(mongoConnection);
    
    // Verify connection
    client.GetDatabase(dbName)
        .RunCommandAsync(new BsonDocument("ping", 1))
        .GetAwaiter()
        .GetResult();
    
    return client;
});

builder.Services.AddSingleton(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(dbName);
});

// ... rest of configuration
```

**Use in Controllers:**
```csharp
[ApiController]
[Route("api/[controller]")]
public class CatalogController : ControllerBase
{
    private readonly IMongoDatabase _db;

    public CatalogController(IMongoDatabase db)
    {
        _db = db;
    }

    [HttpGet("releases")]
    public async Task<IActionResult> GetReleases()
    {
        var releases = await _db
            .GetCollection<Release>("releases")
            .Find(r => r.Status == "published")
            .ToListAsync();

        return Ok(new { success = true, data = releases });
    }
}
```

**`appsettings.Development.json`:**
```json
{
  "DMF": {
    "MongoConnection": "mongodb+srv://bighomiecash8346:PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?retryWrites=true&w=majority",
    "DbName": "dmf_music_platform"
  }
}
```

**Override at runtime with env var (production):**
```bash
export DMF__MongoConnection="mongodb+srv://bighomiecash8346:PASSWORD@..."
dotnet run
```

---

### 3️⃣ **Gateway (Node.js)**

**Update `gateway/.env`:**
```bash
# Don't need MONGO_URL here - gateway doesn't touch Mongo
# Just needs backend URLs

LOVABLE_BACKEND_URL=http://localhost:4000
DOTNET_BRAIN_URL=http://localhost:5183
FIREBASE_BACKEND_URL=https://your-firebase-url
PAYMENTS_BACKEND_URL=http://localhost:5200

PORT=5000
DMF_API_KEY=your-secret-key
NODE_ENV=development
```

Gateway routes requests to Lovable and .NET, which handle their own MongoDB connections.

---

## 📊 MongoDB Atlas Collections Schema

**These collections will be created automatically on first write, but here's what DMF uses:**

### `releases`
```javascript
{
  "_id": ObjectId,
  "title": "Album Name",
  "artistId": "artist-123",
  "releaseDate": ISODate("2025-11-17"),
  "type": "album", // single, ep, mixtape
  "status": "published", // draft, pending, published, archived
  "tracks": ["track-1", "track-2"],
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### `tracks`
```javascript
{
  "_id": ObjectId,
  "title": "Song Title",
  "releaseId": "release-123",
  "artistId": "artist-123",
  "duration": 240, // seconds
  "status": "published",
  "score": 8.5, // StreamGod score (0-10)
  "createdAt": ISODate
}
```

### `artists`
```javascript
{
  "_id": ObjectId,
  "name": "Artist Name",
  "email": "artist@example.com",
  "apiKey": "key-123",
  "tier": "premium", // free, standard, premium
  "createdAt": ISODate
}
```

### `payouts`
```javascript
{
  "_id": ObjectId,
  "tier": "premium",
  "releaseType": "album",
  "payoutPerRelease": 50,
  "payoutPerTrack": 5,
  "currency": "USD",
  "description": "Premium album payout tier"
}
```

### `orders`
```javascript
{
  "_id": ObjectId,
  "artistId": "artist-123",
  "releaseId": "release-123",
  "platforms": ["spotify", "apple"], 
  "status": "completed",
  "totalCost": 99.99,
  "currency": "USD",
  "createdAt": ISODate,
  "completedAt": ISODate
}
```

### `royalties`
```javascript
{
  "_id": ObjectId,
  "artistId": "artist-123",
  "releaseId": "release-123",
  "period": "2025-11",
  "amount": 150.00,
  "currency": "USD",
  "status": "pending", // pending, paid
  "paidDate": ISODate
}
```

---

## ✅ Verification Test

Once everything is configured, run this test:

### 1. Set Environment Variables
```bash
# Powershell / Windows
$env:MONGO_URL = "mongodb+srv://bighomiecash8346:YOUR_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?retryWrites=true&w=majority"
$env:DMF_DB_NAME = "dmf_music_platform"
```

### 2. Start Lovable Backend
```bash
cd lovable-backend
npm run dev
# Should show: ✅ MongoDB connected
```

### 3. Start .NET Brain
```bash
cd dmf-music-platform.Web
dotnet run
# Should show: ✅ MongoDB connected
```

### 4. Start Gateway
```bash
cd gateway
npm start
# Should show: Gateway running on :5000
```

### 5. Test from `dmf.http`
```http
### Test Gateway → Lovable → MongoDB
GET http://localhost:5000/catalog/releases
x-dmf-api-key: your-secret-dmf-key-CHANGE-ME

### Should return:
{
  "success": true,
  "count": 0,
  "data": []
}
```

If you get an empty array `[]`, that's **PERFECT** — it means:
- ✅ Gateway routed to Lovable
- ✅ Lovable connected to MongoDB Atlas
- ✅ Collections exist (or will be created on first write)
- ✅ Your entire DMF stack is sitting on that Atlas cluster

### 6. Create a Test Release (Verify Write)
```http
POST http://localhost:5000/catalog/releases
Content-Type: application/json
x-dmf-api-key: your-secret-dmf-key-CHANGE-ME

{
  "title": "Test Album",
  "artistId": "test-artist-123",
  "releaseDate": "2025-11-17",
  "type": "album",
  "status": "published",
  "tracks": []
}
```

Should return a 201 with the MongoDB ObjectId.

### 7. Verify It's Persisted
```http
GET http://localhost:5000/catalog/releases
x-dmf-api-key: your-secret-dmf-key-CHANGE-ME
```

Now the array should contain your test release.

---

## 🚨 Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot find module 'mongodb'` | Missing npm package | `npm install mongodb` |
| `MONGO_URL env var is missing` | Environment not set | Load from `.env.dmf` |
| `connect ECONNREFUSED 127.0.0.1:27017` | Trying to connect to local MongoDB | Check you're using Atlas URL, not localhost |
| `E11000 duplicate key error` | Unique index violation | Collection has duplicate data |
| `401 unauthorized` | Invalid MongoDB credentials | Check DMF_DB_PASSWORD |
| `Cannot find database dmf_music_platform` | Wrong database name | Verify DMF_DB_NAME matches Atlas |

---

## 🔒 Production Deployment Checklist

- [ ] **Never commit `.env.dmf`** — use deployment platform's secret management
- [ ] **Rotate credentials** after any breach suspicion
- [ ] **Enable IP whitelist** in MongoDB Atlas (restrict to your server IPs)
- [ ] **Enable encryption at rest** in Atlas (default in M2+ clusters)
- [ ] **Set DMF_API_KEY** in production gateway
- [ ] **Use HTTPS** for all frontend → gateway connections
- [ ] **Monitor Atlas** for slow queries (`Query Profiler` tab)
- [ ] **Set up automated backups** (Atlas default: 7 days)
- [ ] **Test failover** — Atlas multi-region failover
- [ ] **Document admin procedures** — password rotation, snapshot restore, etc.

---

## 📚 Reference

- **MongoDB Driver (Node.js):** https://www.mongodb.com/docs/drivers/node/
- **MongoDB Driver (.NET):** https://www.mongodb.com/docs/drivers/csharp/
- **Atlas Connection Strings:** https://www.mongodb.com/docs/atlas/driver-connection/
- **DMF Database Config:** See `dmf_database.config.json` in this repo

---

## 🎯 Summary

Your **entire DMF stack** now has a **single source of truth**: MongoDB Atlas at `dmf-music-platform.pfqrhc.mongodb.net`.

```
Lovable Backend (Node) ──┐
                         ├──→ MongoDB Atlas (one cluster, one database)
.NET Brain (C#) ─────────┘

No more syncing between Postgres, MySQL, SQLite.
One database. Many services. All synchronized.
```

Every API call that reads/writes catalog data now hits the **same cluster**. That's your one brain.

The five faces (Google AI, Bolt, VS Code, Gemini, OpenAI) all call the gateway, which routes to these backends, which all query the **same Mongo collections**.

🚀 **You're connected. You're persistent. You're real.**
