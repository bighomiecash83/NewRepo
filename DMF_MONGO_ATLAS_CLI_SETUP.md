# DMF MongoDB Atlas CLI Setup & Verification

> Use Atlas CLI to connect to your MongoDB cluster, verify it exists, and initialize collections.

---

## 🔐 Step 1: Authenticate with Atlas CLI

```powershell
atlas auth login
```

**What happens:**
- Browser opens and asks you to log in to MongoDB Cloud
- Log in with your Atlas account credentials
- Return to the terminal (it auto-closes)

**Verify it worked:**
```powershell
atlas projects list
```

You should see your projects listed.

---

## 📍 Step 2: Verify Your Cluster Exists

List all clusters in your organization:

```powershell
atlas clusters list
```

**You should see:**
```
NAME                     STATUS     PROVIDER     REGION
dmf-music-platform       IDLE       AWS          US_EAST_1
```

Get detailed info about your cluster:

```powershell
atlas clusters describe dmf-music-platform
```

This shows:
- ✅ Cluster status
- ✅ Connection strings
- ✅ Database users
- ✅ IP whitelist status

---

## 📊 Step 3: Access Your Database via Atlas Shell

Open a MongoDB shell connected to your cluster:

```powershell
atlas dbUsers list
# Shows all database users for authentication
```

Then connect:

```powershell
atlas shell
```

This opens an interactive MongoDB shell directly connected to your cluster.

**Inside the shell, run:**

```javascript
// Verify connection
db.runCommand({ ping: 1 })
// Expected: { ok: 1 }

// Switch to DMF database
use dmf_music_platform

// Verify database exists
db.getName()
// Expected: dmf_music_platform
```

---

## 🏗️ Step 4: Create Collections & Indexes

**Copy the entire block below and paste it into the MongoDB shell:**

```javascript
use dmf_music_platform

// Create collections
db.createCollection("artists")
db.createCollection("releases")
db.createCollection("services")
db.createCollection("plans")
db.createCollection("orders")
db.createCollection("payouts")
db.createCollection("bots")
db.createCollection("campaigns")
db.createCollection("events")

// Create indexes for performance
db.artists.createIndex({ dmfArtistId: 1 }, { unique: true })
db.artists.createIndex({ email: 1 })
db.artists.createIndex({ createdAt: 1 })

db.releases.createIndex({ dmfReleaseId: 1 }, { unique: true })
db.releases.createIndex({ primaryArtistId: 1 })
db.releases.createIndex({ status: 1 })
db.releases.createIndex({ releaseDate: 1 })
db.releases.createIndex({ readinessScore: 1 })

db.services.createIndex({ serviceType: 1 })
db.services.createIndex({ releaseId: 1 })

db.orders.createIndex({ artistId: 1 })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ createdAt: 1 })

db.payouts.createIndex({ artistId: 1 })
db.payouts.createIndex({ period: 1 })
db.payouts.createIndex({ status: 1 })

db.bots.createIndex({ botId: 1 }, { unique: true })
db.bots.createIndex({ owner: 1 })
db.bots.createIndex({ status: 1 })

db.campaigns.createIndex({ campaignId: 1 }, { unique: true })
db.campaigns.createIndex({ releaseId: 1 })
db.campaigns.createIndex({ status: 1 })

db.events.createIndex({ timestamp: 1 })
db.events.createIndex({ eventType: 1 })
db.events.createIndex({ entityId: 1 })
```

**Verify it worked:**

```javascript
// List all collections
db.getCollectionNames()

// Should output:
// [ "artists", "releases", "services", "plans", "orders", "payouts", "bots", "campaigns", "events" ]

// Check indexes on artists collection
db.artists.getIndexes()

// Should show your unique index on dmfArtistId
```

---

## ✅ Step 5: Test with Sample Data

Insert a test artist:

```javascript
db.artists.insertOne({
  dmfArtistId: "ART-0001",
  name: "Big Homie Cash",
  label: "DMF Records",
  email: "artist@dmf.local",
  roles: ["owner", "artist"],
  platformHandles: {
    spotify: "spotify:artist:test",
    appleMusic: "apple:artist:test"
  },
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Expected output:**
```javascript
{
  "acknowledged": true,
  "insertedId": ObjectId("...")
}
```

Insert a test release:

```javascript
db.releases.insertOne({
  dmfReleaseId: "REL-0001",
  title: "Play With Your Emotions",
  primaryArtistId: "ART-0001",
  featuringArtistIds: [],
  isrc: "US-DMF-24-00001",
  upc: "123456789012",
  status: "draft",
  releaseDate: new Date("2025-12-01"),
  dspStatus: {
    spotify: "pending",
    appleMusic: "pending",
    youtubeMusic: "pending"
  },
  readinessScore: 0,
  issues: ["missing_artwork", "needs_isrc"],
  metadata: {
    genre: "Hip-Hop",
    duration: 240,
    language: "en",
    explicit: true
  },
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Retrieve the artist:

```javascript
db.artists.findOne({ dmfArtistId: "ART-0001" })
```

Retrieve the release:

```javascript
db.releases.findOne({ dmfReleaseId: "REL-0001" })
```

---

## 🧪 Step 6: Verify from Your Code

Now that collections exist, your Node.js and .NET services can connect.

**From Node.js (Lovable):**
```typescript
import { db } from './mongo-init';

const artists = await db.collection('artists').find({}).toArray();
console.log(`Found ${artists.length} artists`);
```

**From .NET (Brain):**
```csharp
var artists = mongoService.GetCollection<dynamic>("artists");
var list = await artists.Find(Builders<dynamic>.Filter.Empty).ToListAsync();
Console.WriteLine($"Found {list.Count} artists");
```

Both will now see the same data!

---

## 📋 Quick Verification Checklist

- [ ] `atlas auth login` authenticated successfully
- [ ] `atlas clusters list` shows `dmf-music-platform`
- [ ] `atlas shell` opens MongoDB shell
- [ ] `db.getName()` returns `dmf_music_platform`
- [ ] All 9 collections created
- [ ] All indexes created
- [ ] Test artist inserted successfully
- [ ] Test release inserted successfully
- [ ] Query returns test data

---

## 🔍 Common Commands

```javascript
// See all collections
db.getCollectionNames()

// See collection stats
db.artists.stats()

// Count documents
db.artists.countDocuments()

// Find all
db.artists.find().pretty()

// Find by field
db.releases.find({ status: "draft" })

// Drop collection (if needed)
db.artists.drop()

// Drop database (if needed)
db.dropDatabase()

// See all indexes
db.artists.getIndexes()
```

---

## 🚨 Troubleshooting

### "Cannot authenticate"
- Make sure you're logged in: `atlas auth login`
- Check you used the correct MongoDB Atlas credentials

### "Cluster not found"
- Verify cluster name: `atlas clusters list`
- Make sure you're in the right project

### "Database/collection doesn't exist"
- After creating collections, they only show up after first write
- Run the initialization script above

### "Connection timeout"
- Check your IP whitelist in Atlas dashboard
- For local dev, add `0.0.0.0/0` (allow all IPs)

---

## 📁 Reference Files

These files are part of your DMF setup:

| File | Purpose |
|------|---------|
| `.env.dmf` | Your MongoDB credentials (NEVER commit) |
| `dmf_mongo_init.js` | Collection creation script |
| `dmf_mongo_model.json` | Data model blueprint |
| `mongo-init.ts` | Node.js connection module |
| `DmfMongoService.cs` | .NET MongoDB service |

---

## 🎯 Next Steps

After verifying collections exist:

1. ✅ Load your `.env.dmf` in your application
2. ✅ Start your Lovable backend (Node.js)
3. ✅ Start your .NET Brain
4. ✅ Test API endpoints hit MongoDB

Both services now share the same database! 🎉

---

## 💾 Your MongoDB Connection

```
User: bighomiecash8346
Host: dmf-music-platform.pfqrhc.mongodb.net
Database: dmf_music_platform
Connection: mongodb+srv://[user]:[password]@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?retryWrites=true&w=majority
```

**Everything is wired. Your brain is online. 🧠**
