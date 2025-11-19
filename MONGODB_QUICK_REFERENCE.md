# DMF MongoDB Integration - Quick Reference Card

> Keep this handy. It's your cheat sheet for everything MongoDB in DMF.

---

## 🚀 Quick Start (Copy & Paste)

### 1. Create `.env.dmf`
```powershell
cd c:\Users\bigho\source\repos\dmf-music-platform
./dmf_mongo_setup.ps1 -Action create
# Enter password when prompted
```

### 2. Load Environment
```powershell
./dmf_mongo_setup.ps1 -Action load
# Sets up MONGO_URL and all DMF variables
```

### 3. Install Dependencies
```bash
# Lovable
cd lovable-backend
npm install mongodb

# Brain
cd dmf-music-platform.Web
dotnet add package MongoDB.Driver
```

### 4. Start Services
```bash
# Terminal 1: Lovable
cd lovable-backend && npm run dev

# Terminal 2: Brain
cd dmf-music-platform.Web && dotnet run

# Terminal 3: Gateway
cd gateway && npm start
```

### 5. Test Connection
```http
GET http://localhost:5000/catalog/releases
x-dmf-api-key: your-secret-api-key-CHANGE-ME

# Expected: { "success": true, "count": 0, "data": [] }
```

---

## 📚 Documentation Quick Links

| Need | Read | Time |
|------|------|------|
| Overview | `MONGODB_ATLAS_COMPLETE.md` | 10 min |
| Step-by-step | `MONGODB_SETUP_VERIFICATION.md` | 20 min |
| Architecture | `MONGODB_VISUAL_GUIDE.md` | 5 min |
| Deep dive | `MONGODB_ATLAS_INTEGRATION.md` | 30 min |
| Navigation | `MONGODB_DOCUMENTATION_INDEX.md` | 5 min |
| Index | This file | 2 min |

---

## 🔧 Configuration Reference

### `.env.dmf` Template
```bash
DMF_DB_USER=bighomiecash8346
DMF_DB_PASSWORD=YOUR_PASSWORD_HERE
DMF_DB_NAME=dmf_music_platform
DMF_DB_HOST=dmf-music-platform.pfqrhc.mongodb.net

MONGO_URL="mongodb+srv://${DMF_DB_USER}:${DMF_DB_PASSWORD}@${DMF_DB_HOST}/${DMF_DB_NAME}?retryWrites=true&w=majority"

LOVABLE_BACKEND_URL=http://localhost:4000
DOTNET_BRAIN_URL=http://localhost:5183
DMF_GATEWAY_PORT=5000
DMF_API_KEY=your-secret-key
NODE_ENV=development
```

### Node.js Connection
```typescript
import { MongoClient, Db } from "mongodb";

const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DMF_DB_NAME || "dmf_music_platform";

const client = new MongoClient(mongoUrl);
await client.connect();
const db = client.db(dbName);
```

### .NET Connection
```csharp
using MongoDB.Driver;

var mongoConnection = builder.Configuration["DMF:MongoConnection"];
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var client = new MongoClient(mongoConnection);
    client.GetDatabase(dbName).RunCommandAsync(
        new BsonDocument("ping", 1)
    ).GetAwaiter().GetResult();
    return client;
});
```

---

## 🧪 Quick Tests

### Test Lovable Connected
```bash
cd lovable-backend
npm run dev
# Look for: ✅ MongoDB Atlas connected
```

### Test Brain Connected
```bash
cd dmf-music-platform.Web
dotnet run
# Look for: ✅ MongoDB connected
```

### Test Gateway Running
```bash
cd gateway
npm start
# Look for: 🚀 DMF Gateway running on :5000
```

### Test Full Stack
```http
GET http://localhost:5000/catalog/releases
x-dmf-api-key: your-secret-api-key

# Should return: { "success": true, "data": [] }
```

---

## 📊 MongoDB Collections Schema

```javascript
// releases
{
  title, artistId, releaseDate, type, status,
  tracks: [], createdAt, updatedAt
}

// tracks
{
  title, releaseId, artistId, duration,
  status, score, createdAt
}

// artists
{
  name, email, tier, apiKey, createdAt
}

// orders
{
  artistId, releaseId, platforms, status,
  totalCost, currency, createdAt, completedAt
}

// payouts
{
  tier, releaseType, payoutPerRelease,
  payoutPerTrack, currency, description
}

// royalties
{
  artistId, releaseId, period, amount,
  currency, status, paidDate
}
```

---

## 🔐 Security Essentials

**DO:**
- ✅ Store passwords in `.env.dmf` (local only)
- ✅ Use platform secrets in production
- ✅ Keep `.env.dmf` in `.gitignore`
- ✅ Rotate credentials regularly

**DON'T:**
- ❌ Hardcode passwords in code
- ❌ Commit `.env.dmf` to git
- ❌ Share credentials in Slack/Email
- ❌ Use same password for multiple systems

---

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Cannot find module 'mongodb'" | `npm install mongodb` |
| "MONGO_URL is undefined" | Run `./dmf_mongo_setup.ps1 -Action load` |
| "Connection timeout" | Check password, check IP whitelist in Atlas |
| "Database doesn't exist" | Normal! Created on first write |
| "Cannot connect to MongoDB" | Verify MONGO_URL is correct, try `./dmf_mongo_setup.ps1 -Action verify` |

---

## 📋 Checklist

- [ ] Created `.env.dmf` with password
- [ ] Ran `./dmf_mongo_setup.ps1 -Action load`
- [ ] Installed `mongodb` in Lovable
- [ ] Installed `MongoDB.Driver` in Brain
- [ ] Copied code from `mongo-connection.ts`
- [ ] Copied code from `lovable-mongo-example.ts`
- [ ] Updated `Program.cs` in Brain
- [ ] Started Lovable backend
- [ ] Started Brain
- [ ] Started Gateway
- [ ] Tested GET `/catalog/releases`
- [ ] Tested POST new release
- [ ] Verified data persists

---

## 🎯 One-Liners

```bash
# Load env
./dmf_mongo_setup.ps1 -Action load

# Check env variables
Get-ChildItem env: | Where-Object Name -like 'DMF*'

# Test MongoDB
./dmf_mongo_setup.ps1 -Action verify

# Check if MongoDB installed
npm list mongodb

# Check if Brain connects
dotnet run --project dmf-music-platform.Web 2>&1 | grep -i mongo

# Find .env.dmf file
Get-ChildItem -Path c:\Users\bigho\source\repos\dmf-music-platform\.env.dmf
```

---

## 🔄 Data Flow

```
Frontend (Google AI)
    ↓
Gateway (:5000)
    ↓
Backend (Lovable :4000 or Brain :5183)
    ↓
MongoDB Atlas (dmf-music-platform)
    ↓
Data persists forever ✅
```

---

## 📱 Important Files

| File | Why | Action |
|------|-----|--------|
| `.env.dmf` | Credentials | Create & protect |
| `.env.dmf.example` | Template | Commit to git |
| `mongo-connection.ts` | Node module | Copy to Lovable |
| `lovable-mongo-example.ts` | Example routes | Reference |
| `DOTNET_MONGODB_SETUP.md` | .NET code | Reference |
| `appsettings.Development.json` | Brain config | Update with MongoDB |
| `dmf_mongo_setup.ps1` | Helper script | Run for automation |
| `.gitignore` | Protection | Prevents commits |

---

## 🎓 Learning Path

```
1. Read MONGODB_ATLAS_COMPLETE.md (overview)
2. Run ./dmf_mongo_setup.ps1 -Action create
3. Follow MONGODB_SETUP_VERIFICATION.md
4. Read MONGODB_VISUAL_GUIDE.md (architecture)
5. Reference MONGODB_ATLAS_INTEGRATION.md (details)
6. Use this card (quick lookup)
```

---

## ✨ Success Indicators

When you see these, you're good:

- ✅ Lovable logs: "✅ MongoDB Atlas connected"
- ✅ Brain logs: "✅ MongoDB connected"
- ✅ Gateway logs: "🚀 DMF Gateway running"
- ✅ REST Client returns: `{ "success": true, "data": [] }`
- ✅ Test data persists after restart

---

## 🆘 Help Commands

```powershell
# Create setup
./dmf_mongo_setup.ps1 -Action create

# Load environment
./dmf_mongo_setup.ps1 -Action load

# Test connection
./dmf_mongo_setup.ps1 -Action verify

# Show help
./dmf_mongo_setup.ps1 -Action help

# List DMF environment variables
Get-ChildItem env: | Where-Object Name -like 'DMF*' | Format-Table
```

---

## 🚀 Next 10 Minutes

```
0:00 - 1:00  Run ./dmf_mongo_setup.ps1 -Action create (enter password)
1:00 - 2:00  Verify .env.dmf file exists
2:00 - 3:00  Run ./dmf_mongo_setup.ps1 -Action load
3:00 - 5:00  Read first section of MONGODB_SETUP_VERIFICATION.md
5:00 - 7:00  Install npm packages (Lovable + Brain)
7:00 - 8:00  Start services (3 terminals)
8:00 - 9:00  Run test in REST Client
9:00 - 10:00 If working: 🎉 Success! Read full docs
             If issues: Check MONGODB_ATLAS_INTEGRATION.md → Troubleshooting
```

---

## 🎯 Bottom Line

```
MongoDB Atlas = Your database in the cloud
.env.dmf = Where your credentials live (never commit)
MONGO_URL = Connection string used by all services
Lovable + Brain = Both read from same MongoDB
Gateway = Routes to both, doesn't touch DB
Result = One truth, all services synced
```

---

**Keep this card bookmarked. You'll reference it often.**

🚀 **Ready? Start:** `./dmf_mongo_setup.ps1 -Action create`
