# 🧹 Clean Lovable Repo for v1 Launch

**Status:** Prod v1 Stack is LOCKED IN
- ✅ Code & Hosting: Lovable.dev  
- ✅ Core API: .NET Backend
- ✅ Databases: MongoDB (catalog/royalties) + Supabase (users/logs)  
- ✅ Frontends: Main DMF Dashboard (only)  
- 🚫 Parked: Azure, Firebase DBs, side experiments

---

## Backend Cleanup (Controllers + Services)

### ✅ KEEP

- **`Controllers/HealthController.cs`** - /health endpoint (already monitors Mongo + env)
- **`Controllers/PricingController.cs`** - /api/pricing endpoint (active for artist plans)
- **`Services/`** - All StreamGod, Distribution, Royalty services (core business)
- **`Data/Models/DomainModels.cs`** - All Mongo/Supabase models
- **`Data/Repositories/IMongoRepository.cs`** - All MongoDB repo interfaces
- **`Data/Repositories/ISupabaseRepository.cs`** - All Supabase repo interfaces
- **`Program.cs`** - API key middleware + MongoDB setup

### 🚫 DELETE (if present)

- `Controllers/WeatherForecast*.cs` - ❌ Not present (good)
- `Controllers/Sample*.cs` - ❌ Not present (good)
- `Controllers/Todo*.cs` - ❌ Not present (good)
- `Models/WeatherForecast*.cs` - ❌ Not present (good)
- Any in-memory seeders for demo data - ✅ Check `Data/Seed/` folder if exists
- Demo middleware or fake auth - ✅ Check Program.cs (currently clean)

**Status:** ✅ Backend is CLEAN

---

## Frontend Cleanup (Next.js Pages)

### ✅ KEEP (Core DMF Features)

```
web/src/pages/
├── login/              ✅ Authentication (Supabase-backed)
├── dashboard/          ✅ Main DMF Dashboard (4K view for label/artists)
├── artists/            ✅ Roster management
├── releases/           ✅ Release builder + management
├── revenue/            ✅ Royalty statements + earnings (TO CREATE)
└── api/                ✅ API routes (if any)
```

### 🚫 DELETE (Demo / Non-Core)

```
web/src/pages/
├── bots/               🚫 Delete - Experiment only
├── contracts/          🚫 Delete - Not in v1 scope
├── StreamGodPlayground 🚫 Delete - Developer tool only
└── [any others]        🚫 Delete
```

### 📋 Components to Keep

- ✅ `ReleaseDescriptionGenerator.tsx` - Core (AI release descriptions)
- ✅ `artist-manager.tsx` - Core (roster UI)
- ✅ `release-builder.tsx` - Core (upload + edit releases)
- ✅ `layout/` - Navigation, headers, footers
- ✅ `charts/` - Revenue/analytics charts (for dashboard)
- 🚫 `bot-playground.tsx` - Delete
- 🚫 `StreamGodPlayground.jsx` - Delete

### 🆕 CREATE (Required for Launch)

**Pages to add:**

1. **`web/src/pages/royalties/ArtistEarnings.tsx`**
   - Displays artist's earnings statement
   - Uses `royaltyApi.getMyStatement()`
   - Shows period, gross/net earnings, payout date

2. **`web/src/pages/distribution/DistributionStatus.tsx`**
   - Shows release distribution status per DSP
   - Uses `releaseApi.getDistributionStatus(releaseId)`
   - Shows: Spotify ✅, Apple ✅, YouTube ❌, etc.

3. **`web/src/pages/settings/AccountSettings.tsx`**
   - Artist profile + password
   - Payment method (if applicable)
   - API key management for integrations

4. **`web/src/pages/system/SystemStatus.tsx`** (Admin Only)
   - Shows all backend services status
   - Uses `/system/status` endpoint
   - Displays: Core API ✅ / StreamGod ✅ / Royalties ✅ / Mongo ✅ / Supabase ✅

---

## Configuration & Environment

### 🔒 Lock these ENV vars in Lovable:

```bash
# Core API
ASPNETCORE_ENVIRONMENT=Production
CORE_API_BASE_URL=https://api.dmf-music-platform.com  # TBD: pick real domain

# MongoDB - REAL cluster
MONGO_CONNECTION_STRING=mongodb+srv://bighomiecash8346:***@dmf-music-platform.pfqrhc.mongodb.net/
MONGO_DATABASE_NAME=DMF_MUSIC_PLATFORM

# Supabase
SUPABASE_URL=https://<your-supabase>.supabase.co
SUPABASE_DB_CONNECTION_STRING=postgresql://user:pass@host:port/dbname
SUPABASE_SERVICE_ROLE_KEY=***
SUPABASE_ANON_KEY=***

# Frontend
VITE_API_BASE_URL=${CORE_API_BASE_URL}
```

### Rule:
- ✅ All frontends use `VITE_API_BASE_URL`
- ❌ NO frontend talks directly to Mongo or Supabase
- ✅ All data goes through Core API (`dmf_api_client.ts`)

---

## Cleanup Checklist

### Backend
- [ ] Verify no Sample*/Weather*/Todo* controllers exist
- [ ] Verify Program.cs has API key middleware + MongoDB setup
- [ ] Verify HealthController returns Mongo + env status
- [ ] Verify all repositories have interfaces (Mongo + Supabase)

### Frontend
- [ ] DELETE: `web/src/pages/bots/` ← entire folder
- [ ] DELETE: `web/src/pages/contracts/` ← entire folder
- [ ] DELETE: `web/src/pages/StreamGodPlayground.jsx`
- [ ] DELETE: `web/src/components/bot-playground.tsx`
- [ ] DELETE: any other demo pages
- [ ] CREATE: `web/src/pages/royalties/ArtistEarnings.tsx`
- [ ] CREATE: `web/src/pages/distribution/DistributionStatus.tsx`
- [ ] CREATE: `web/src/pages/settings/AccountSettings.tsx`
- [ ] CREATE: `web/src/pages/system/SystemStatus.tsx` (admin)
- [ ] UPDATE: `web/src/pages/dashboard/Dashboard.jsx` to link to all sections

### Configuration
- [ ] Set `ASPNETCORE_ENVIRONMENT=Production` in Lovable env
- [ ] Set `CORE_API_BASE_URL` to final domain (pick one now)
- [ ] Verify `VITE_API_BASE_URL` is set (should match `CORE_API_BASE_URL`)
- [ ] Verify MongoDB credentials are in Lovable secrets
- [ ] Verify Supabase keys are in Lovable secrets

### Next: Create /health + /system/status endpoints

Once backend is clean, add:

```csharp
[HttpGet("/system/status")]
public async Task<IActionResult> GetSystemStatus()
{
    var status = new
    {
        coreApi = "ok",
        streamGod = await CheckStreamGod(),
        distribution = await CheckDistribution(),
        royalties = await CheckRoyalties(),
        mongo = await CheckMongo(),
        supabase = await CheckSupabase()
    };
    
    return Ok(status);
}
```

Then add System Status card to main dashboard showing all 6 components.

---

## Timeline

1. **Now:** Complete cleanup (delete demo files, create new pages)
2. **Next:** Create /system/status endpoint
3. **Then:** Run full E2E test (login → artist → release → royalty → view)
4. **Then:** Pick real domain + HTTPS
5. **Finally:** Soft launch to internal team (you + Freezzo + 1-2 artists)

