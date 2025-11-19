# 🚀 DMF MongoDB - 10 Minute Quick Start

> Everything you need in 10 minutes. Seriously.

---

## ⏱️ Minute 0-2: Create Your Credentials

```powershell
cd c:\Users\bigho\source\repos\dmf-music-platform
./dmf_mongo_setup.ps1 -Action create
```

**What it does:**
- Prompts for your MongoDB password
- Creates `.env.dmf` (auto-protected by .gitignore)
- Shows you where it saved

**What you do:**
- Type your password
- Press Enter
- Done ✅

---

## ⏱️ Minute 2-4: Load Environment

```powershell
./dmf_mongo_setup.ps1 -Action load
```

**What it does:**
- Loads all MongoDB variables into your session
- Sets `MONGO_URL`, `DMF_DB_USER`, `DMF_DB_NAME`, etc.

**Verify it worked:**
```powershell
Get-ChildItem env: | Where-Object Name -like 'DMF*'
# Should show all your variables
```

---

## ⏱️ Minute 4-6: Install Dependencies

**Terminal 1 - Lovable (Node.js):**
```bash
cd lovable-backend
npm install mongodb
```

**Terminal 2 - Brain (.NET):**
```bash
cd dmf-music-platform.Web
dotnet add package MongoDB.Driver
```

✅ Both packages installed

---

## ⏱️ Minute 6-8: Copy Example Code

### Lovable (Node.js)

Copy code from `dmf-music-platform.Web/Services/mongo-connection.ts` into your Lovable project.

Copy code from `dmf-music-platform.Web/Services/lovable-mongo-example.ts` into your Lovable routes.

### Brain (.NET)

Open `DOTNET_MONGODB_SETUP.md` and copy the `Program.cs` section into your Brain's `Program.cs`.

---

## ⏱️ Minute 8-9: Start Services

**Terminal 1:**
```bash
cd lovable-backend
npm run dev
# Wait for: ✅ MongoDB Atlas connected
```

**Terminal 2:**
```bash
cd dmf-music-platform.Web
dotnet run
# Wait for: ✅ MongoDB connected
```

**Terminal 3:**
```bash
cd gateway
npm start
# Wait for: 🚀 Gateway running on :5000
```

---

## ⏱️ Minute 9-10: Test

Open VS Code REST Client (or use Postman) and hit:

```http
GET http://localhost:5000/catalog/releases
x-dmf-api-key: your-secret-api-key-CHANGE-ME
```

**Expected Response:**
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

✅ **You're connected to MongoDB Atlas!**

---

## 🎯 What Just Happened

```
Your Machine              DMF Gateway           MongoDB Atlas
─────────────            ─────────────         ──────────────
PowerShell ──────┐
                 │
Lovable  ────────┼──→ :5000 ─────────┐
                 │                   │
Brain    ────────┼──────────┐        │
                 │          │        │
                 └──────────┼────────→ Cluster
                            │         (Cloud)
                       Routes to
                    Lovable (:4000)
                    Brain (:5183)
                    Both use MONGO_URL
                    Both access same DB

Result: Three services, one database, all synced ✅
```

---

## 📚 Next: Read This

After you verify everything works:

**Read:** `MONGODB_SETUP_VERIFICATION.md` (20 minutes)

This explains:
- Exactly how the connections work
- How to verify each step
- How to troubleshoot if something breaks
- How to deploy to production

---

## 🔒 Security Check

✅ `.env.dmf` created (has your password)  
✅ `.env.dmf` in `.gitignore` (never commits)  
✅ `.env.dmf.example` shows template (safe to commit)  
✅ Gateway requires `x-dmf-api-key` header  
✅ All good! 🔐

---

## ❓ If Something Breaks

### "Cannot find module 'mongodb'"
```bash
npm install mongodb
```

### "MONGO_URL is undefined"
```powershell
./dmf_mongo_setup.ps1 -Action load
```

### "Connection refused"
Check:
1. Is `.env.dmf` created with real password? ✓
2. Are services running on correct ports? ✓
3. Is MONGO_URL in your environment? ✓

Try: `./dmf_mongo_setup.ps1 -Action verify`

### Still stuck?
Read: `MONGODB_ATLAS_INTEGRATION.md` → Troubleshooting section

---

## 🚀 You're Done When

✅ All 3 services start without errors  
✅ GET `/catalog/releases` returns `{ "success": true, "data": [] }`  
✅ You understand it: Frontend → Gateway → Backend → MongoDB  

That's it! 🎉

---

## 📖 Optional: Understand It Better

Want to know how it works?

Read: `MONGODB_VISUAL_GUIDE.md` (5 minutes)

This has diagrams showing:
- How requests flow through the system
- How data gets persisted
- How all services sync

---

## 🎯 The Mental Model

```
Think of it like this:

BEFORE:
└─ Five frontends → Five separate databases → Chaos

AFTER:
└─ Five frontends → One gateway → One MongoDB → Order!

The gateway is your concierge.
MongoDB is your filing cabinet.
All services read/write the same files.
```

---

## ✨ Bonus: Create Test Data

Once verified, try:

```http
### Create a release
POST http://localhost:5000/catalog/releases
Content-Type: application/json
x-dmf-api-key: your-secret-api-key-CHANGE-ME

{
  "title": "My First Album",
  "artistId": "artist-123",
  "releaseDate": "2025-11-17T00:00:00Z",
  "type": "album",
  "status": "published",
  "tracks": []
}
```

Then:

```http
### Verify it persisted
GET http://localhost:5000/catalog/releases
x-dmf-api-key: your-secret-api-key-CHANGE-ME
```

You should see your release in the array! ✅

---

## 📋 Quick Command Reference

```powershell
# Create .env.dmf
./dmf_mongo_setup.ps1 -Action create

# Load variables
./dmf_mongo_setup.ps1 -Action load

# Test connection
./dmf_mongo_setup.ps1 -Action verify

# Check variables
Get-ChildItem env: | Where-Object Name -like 'DMF*'
```

---

## 🏁 Done!

You now have:
✅ MongoDB connected  
✅ Three services synced  
✅ One persistent database  
✅ Production-ready architecture  

**Next step:**
- Read `MONGODB_SETUP_VERIFICATION.md` for details
- Or start building on top of this foundation!

---

## 🎓 Your Architecture

```
┌─────────────────────────────────────┐
│    Google AI, Bolt, VS Code, etc.   │
└──────────────┬──────────────────────┘
               │
         ┌─────▼──────┐
         │  Gateway   │
         │  :5000     │
         └─────┬──────┘
               │
      ┌────────┴────────┐
      │                 │
   ┌──▼──┐         ┌───▼──┐
   │Node │         │ .NET │
   │:4000│         │:5183 │
   └──┬──┘         └───┬──┘
      │                │
      └────────┬───────┘
               │
        ┌──────▼──────────┐
        │ MongoDB Atlas   │
        │ (One Truth)     │
        └─────────────────┘
```

All 5 frontends → 1 gateway → 2 services → 1 database = Perfect!

---

## ✅ Final Checklist

- [ ] Ran `./dmf_mongo_setup.ps1 -Action create`
- [ ] Ran `./dmf_mongo_setup.ps1 -Action load`
- [ ] Installed MongoDB packages
- [ ] Started Lovable (`npm run dev`)
- [ ] Started Brain (`dotnet run`)
- [ ] Started Gateway (`npm start`)
- [ ] Tested GET `/catalog/releases`
- [ ] Saw empty array (success!)

**All done? 🎉 Congratulations!**

Your DMF platform is now connected to MongoDB Atlas.

**Next:** Read `MONGODB_SETUP_VERIFICATION.md` for full understanding.

---

**Time spent: ~10 minutes**  
**Value delivered: Production-ready database architecture**  
**Brain status: 🧠 ONLINE**

🚀 Let's go!
