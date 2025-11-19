# DMF MongoDB Atlas Integration - Verification & Setup Guide

> This is your **checklist** for wiring MongoDB Atlas into every piece of DMF.

---

## 🎯 What You're Doing

You have a **MongoDB Atlas cluster** ready to go:
- **Connection string:** `mongodb+srv://bighomiecash8346:<password>@dmf-music-platform.pfqrhc.mongodb.net/`
- **Cluster name:** `dmf-music-platform`
- **Database name:** `dmf_music_platform`
- **Region:** US-EAST-1

Instead of hardcoding that URL everywhere, you're going to:
1. ✅ Store credentials in **environment variables** (`.env.dmf`)
2. ✅ Share the same `MONGO_URL` across **all services** (Lovable, .NET, etc.)
3. ✅ Keep passwords **out of git** (use `.gitignore`)
4. ✅ Make it **easy to swap** between local/staging/production

---

## 📝 Step 1: Create `.env.dmf` (Root Directory)

**Copy this to `c:\Users\bigho\source\repos\dmf-music-platform\.env.dmf`:**

```bash
# ===== MONGODB ATLAS CREDENTIALS =====
# ⚠️  NEVER commit this file. It's in .gitignore for a reason.

DMF_DB_USER=bighomiecash8346
DMF_DB_PASSWORD=YOUR_REAL_DB_PASSWORD_HERE  # ← Replace with actual password
DMF_DB_NAME=dmf_music_platform
DMF_DB_HOST=dmf-music-platform.pfqrhc.mongodb.net

# ===== CONSTRUCTED MONGO URL =====
# All services read this single URL
MONGO_URL="mongodb+srv://${DMF_DB_USER}:${DMF_DB_PASSWORD}@${DMF_DB_HOST}/${DMF_DB_NAME}?retryWrites=true&w=majority"

# ===== SERVICE ENDPOINTS =====
LOVABLE_BACKEND_URL=http://localhost:4000
DOTNET_BRAIN_URL=http://localhost:5183
FIREBASE_BACKEND_URL=https://your-firebase-functions-url
PAYMENTS_BACKEND_URL=http://localhost:5200

# ===== GATEWAY =====
DMF_GATEWAY_PORT=5000
DMF_API_KEY=your-secret-api-key-CHANGE-IN-PRODUCTION

# ===== ENVIRONMENT =====
NODE_ENV=development
ENVIRONMENT=local
```

**Save and close. NEVER commit this file.**

---

## 🚀 Step 2: Wire Lovable Backend (Node.js)

### 2a. Install MongoDB Driver

Navigate to your Lovable backend directory and run:

```bash
npm install mongodb
```

### 2b. Create MongoDB Connection Module

Create a file at `lovable-backend/src/services/mongodb.ts`:

```typescript
import { MongoClient, Db } from "mongodb";

let cachedDb: Db | null = null;

const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DMF_DB_NAME || "dmf_music_platform";

if (!mongoUrl) {
  throw new Error(
    "❌ Missing MONGO_URL environment variable. " +
    "Make sure .env.dmf is loaded."
  );
}

export async function connectMongo(): Promise<Db> {
  if (cachedDb) {
    console.log("✓ Using cached MongoDB connection");
    return cachedDb;
  }

  console.log(`🔗 Connecting to MongoDB Atlas (${dbName})...`);

  try {
    const client = new MongoClient(mongoUrl, {
      maxPoolSize: 10,
      minPoolSize: 5,
    });

    await client.connect();
    cachedDb = client.db(dbName);

    // Verify connection
    await cachedDb.admin().ping();
    console.log("✅ MongoDB Atlas connected");

    return cachedDb;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

export const db = await connectMongo();
```

### 2c. Use in Your Routes

Example in your catalog endpoints:

```typescript
import { db } from "./services/mongodb";

app.get("/catalog/releases", async (req, res) => {
  try {
    const releases = await db
      .collection("releases")
      .find({ status: "published" })
      .sort({ releaseDate: -1 })
      .toArray();

    res.json({ success: true, count: releases.length, data: releases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/catalog/releases", async (req, res) => {
  try {
    const release = {
      ...req.body,
      status: "draft",
      createdAt: new Date(),
    };
    
    const result = await db.collection("releases").insertOne(release);
    
    res.status(201).json({ 
      success: true, 
      id: result.insertedId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2d. Create `.env` for Lovable

Create `lovable-backend/.env`:

```bash
MONGO_URL="mongodb+srv://bighomiecash8346:YOUR_REAL_DB_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?retryWrites=true&w=majority"
DMF_DB_NAME=dmf_music_platform
PORT=4000
NODE_ENV=development
```

---

## 🧠 Step 3: Wire .NET Brain (C# / Blazor)

### 3a. Install MongoDB NuGet Package

```bash
cd dmf-music-platform.Web
dotnet add package MongoDB.Driver
```

### 3b. Update `appsettings.Development.json`

Open `appsettings.Development.json` and add the DMF section:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "DMF": {
    "Environment": "local",
    "ApiName": "StreamGod Brain",
    "MongoConnection": "mongodb+srv://bighomiecash8346:YOUR_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?retryWrites=true&w=majority",
    "DbName": "dmf_music_platform",
    "Port": 5183
  }
}
```

### 3c. Wire MongoDB in `Program.cs`

Add this to the top of your `Program.cs` (before `var app = builder.Build();`):

```csharp
using MongoDB.Driver;

var mongoConnection = builder.Configuration["DMF:MongoConnection"];
var dbName = builder.Configuration["DMF:DbName"] ?? "dmf_music_platform";

if (string.IsNullOrEmpty(mongoConnection))
{
    throw new InvalidOperationException("Missing DMF:MongoConnection in appsettings");
}

Console.WriteLine($"🔗 Configuring MongoDB: {dbName}");

// Register MongoDB client
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = MongoClientSettings.FromConnectionString(mongoConnection);
    settings.ConnectTimeout = TimeSpan.FromSeconds(10);
    settings.SocketTimeout = TimeSpan.FromSeconds(30);

    var client = new MongoClient(settings);
    
    // Verify connection on startup
    try
    {
        client.GetDatabase(dbName).RunCommandAsync(
            new MongoDB.Bson.BsonDocument("ping", 1)
        ).GetAwaiter().GetResult();
        
        Console.WriteLine("✅ MongoDB connected");
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"❌ MongoDB connection failed: {ex.Message}");
        throw;
    }

    return client;
});

// Register database instance
builder.Services.AddSingleton(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(dbName);
});
```

### 3d. Use in Your Controllers

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
        try
        {
            var collection = _db.GetCollection<dynamic>("releases");
            var releases = await collection
                .Find(r => r["status"] == "published")
                .SortByDescending(r => r["releaseDate"])
                .ToListAsync();

            return Ok(new
            {
                success = true,
                count = releases.Count,
                data = releases
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("releases")]
    public async Task<IActionResult> CreateRelease([FromBody] dynamic release)
    {
        try
        {
            var collection = _db.GetCollection<dynamic>("releases");
            await collection.InsertOneAsync(release);

            return Created("", new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
```

---

## 🔀 Step 4: Gateway Configuration

Your gateway **doesn't need MONGO_URL** — it just routes to Lovable and .NET, which handle their own MongoDB connections.

Update `gateway/.env`:

```bash
# Backend URLs (these services use MONGO_URL internally)
LOVABLE_BACKEND_URL=http://localhost:4000
DOTNET_BRAIN_URL=http://localhost:5183
FIREBASE_BACKEND_URL=https://your-firebase-functions-url
PAYMENTS_BACKEND_URL=http://localhost:5200

# Gateway itself
PORT=5000
DMF_API_KEY=your-secret-api-key-CHANGE-IN-PRODUCTION
NODE_ENV=development
```

No changes needed to `gateway/src/index.js` — it already routes properly.

---

## ✅ Step 5: Verification Test

### 5a. Ensure `.env.dmf` is Created

```bash
cd c:\Users\bigho\source\repos\dmf-music-platform
# Verify .env.dmf exists with real password
cat .env.dmf
```

### 5b. Start Lovable Backend

```bash
cd lovable-backend
npm run dev
```

**Expected output:**
```
🔗 Connecting to MongoDB Atlas (dmf_music_platform)...
✅ MongoDB Atlas connected
Server running on http://localhost:4000
```

### 5c. Start .NET Brain

```bash
cd dmf-music-platform.Web
dotnet run
```

**Expected output:**
```
🔗 Configuring MongoDB: dmf_music_platform
✅ MongoDB connected
...
info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
      Request starting HTTP/1.1 GET http://localhost:5183/swagger/index.html
```

### 5d. Start Gateway

```bash
cd gateway
npm start
```

**Expected output:**
```
🚀 DMF Gateway running on :5000
📊 Backend routes configured
```

### 5e. Test via REST Client

Open `dmf.http` and run:

```http
### Test MongoDB Connection (via Gateway → Lovable → Atlas)
GET http://localhost:5000/catalog/releases
x-dmf-api-key: your-secret-api-key-CHANGE-ME

### Expected Response (initially empty):
{
  "success": true,
  "count": 0,
  "data": []
}
```

**If you see `[]`, CONGRATULATIONS!** Your entire DMF stack is now connected to MongoDB Atlas.

### 5f. Create a Test Release

```http
POST http://localhost:5000/catalog/releases
Content-Type: application/json
x-dmf-api-key: your-secret-api-key-CHANGE-ME

{
  "title": "Test Release",
  "artistId": "test-artist-001",
  "releaseDate": "2025-11-17T00:00:00.000Z",
  "type": "single",
  "status": "published",
  "tracks": []
}
```

### 5g. Verify It Persisted

Run the GET again:

```http
GET http://localhost:5000/catalog/releases
x-dmf-api-key: your-secret-api-key-CHANGE-ME
```

You should now see your test release in the array.

---

## 🔐 Security Checklist

- [ ] `.env.dmf` is in `.gitignore` ✅ (we updated it)
- [ ] Real password is in `.env.dmf` (not in code)
- [ ] `.env` files are **never committed** to git
- [ ] `.env.dmf.example` shows the template (without real password)
- [ ] Production environment uses **platform secrets** (not `.env.dmf`)
- [ ] `DMF_API_KEY` is set in production

---

## 🌍 Production Deployment

When deploying to **Render**, **Railway**, or **AWS**:

1. **Don't upload `.env.dmf`** — use platform environment variables instead
2. Set these vars in your deployment dashboard:
   ```
   MONGO_URL=mongodb+srv://bighomiecash8346:REAL_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?retryWrites=true&w=majority
   DMF_DB_NAME=dmf_music_platform
   DMF_API_KEY=production-secret-key
   ```
3. Redeploy — your services will read from platform env vars, not `.env.dmf`

---

## 📊 Current Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  Frontends (5 Faces)                        │
│  Google AI │ Bolt │ VS Code │ Gemini │ OpenAI Ryia         │
└─────────────────────────┬──────────────────────────────────┘
                          │ All requests to
                          ▼
                   ┌──────────────┐
                   │ DMF Gateway  │
                   │ :5000        │
                   └──────┬───────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
       ┌────▼──┐      ┌───▼─────┐  ┌──▼───┐
       │Lovable│      │.NET     │  │Fire- │
       │:4000  │      │Brain    │  │base  │
       │(Node) │      │:5183    │  │Auth  │
       └────┬──┘      └────┬────┘  └──────┘
            │              │
            └──────┬───────┘
                   │ Both read MONGO_URL
                   ▼
        ┌─────────────────────────────┐
        │  MongoDB Atlas              │
        │  dmf-music-platform cluster │
        │  (One Brain, Shared Data)   │
        └─────────────────────────────┘
```

---

## 🎯 Summary

✅ **Environment variables** — credentials in `.env.dmf`, not hardcoded  
✅ **Lovable connected** — Node.js MongoDB driver, reads `MONGO_URL`  
✅ **Brain connected** — .NET MongoDB driver, reads from `appsettings`  
✅ **Gateway routing** — just passes requests to backends  
✅ **One database** — all services query the same Atlas cluster  
✅ **Secure** — passwords never in git, uses `.gitignore`  
✅ **Portable** — same config for local/staging/production, just swap env vars  

**Your DMF music platform now has ONE persistent brain — MongoDB Atlas.**

All five faces (Google AI, Bolt, VS Code, Gemini, OpenAI) connect to the gateway.  
The gateway routes to Lovable and .NET.  
Lovable and .NET both read/write the same database.

🚀 **One brain. Five faces. One database.**
