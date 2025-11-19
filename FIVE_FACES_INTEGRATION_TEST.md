# DMF FIVE FACES — INTEGRATION TEST

**Step-by-step verification that all five frontends are wired and talking to the same gateway.**

---

## 📋 Prerequisites

Before running these tests, you should have:

- [ ] Gateway running (`npm start` in `gateway/` directory)
- [ ] .NET Brain running (Visual Studio or `dotnet run`)
- [ ] All dependencies installed
- [ ] Environment files configured (`.env` files in place)

---

## 🚀 PART 1: Gateway Health (5 minutes)

### 1.1 Terminal Test

```powershell
# Test health endpoint (no auth required)
curl http://localhost:5000/health

# Expected response:
# {
#   "status": "ok",
#   "service": "dmf-gateway",
#   "version": "1.0.0",
#   "environment": "development",
#   "time": "2025-11-17T...",
#   "uptime": 123.45
# }
```

### 1.2 Catalog Endpoint Test

```powershell
# Test catalog endpoint
curl http://localhost:5000/catalog/releases

# Expected: Array of releases (even if empty [])
# If this fails, check:
# - Is gateway running on :5000?
# - Is LOVABLE_BACKEND_URL set correctly in gateway/.env?
```

### 1.3 Brain Endpoint Test

```powershell
# Test brain scoring endpoint
curl -X POST http://localhost:5000/brain/catalog/score `
  -H "Content-Type: application/json" `
  -d '{
    "trackId": "test-123",
    "title": "Test Track",
    "artist": "Test Artist"
  }'

# Expected: { "score": X, "readiness": "...", ... }
# If fails, check:
# - Is .NET Brain running on :5183?
# - Is DOTNET_BRAIN_URL set in gateway/.env?
```

✅ **PASS**: All three endpoints respond  
❌ **FAIL**: Check gateway logs and backend URLs

---

## 💻 PART 2: VS Code (REST Client)

### 2.1 Install Extension

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search: "REST Client"
4. Install by Huachao Mao

### 2.2 Open Test File

1. Open `dmf.http` from repo root
2. Set variables at top:

```http
@dmfApiBase = http://localhost:5000
```

### 2.3 Run Requests

Click **Send Request** on:

#### Health Check
```http
### Health check
GET {{dmfApiBase}}/health
```
✅ **PASS**: Status OK + uptime shown  
❌ **FAIL**: Gateway not running

#### List Catalog
```http
### List all releases
GET {{dmfApiBase}}/catalog/releases
```
✅ **PASS**: Returns JSON array  
❌ **FAIL**: Check Lovable backend URL

#### Score Track
```http
### Score a single track
POST {{dmfApiBase}}/brain/catalog/score
Content-Type: application/json

{
  "trackId": "test-123",
  "title": "Test Track",
  "artist": "Test Artist"
}
```
✅ **PASS**: Returns score object  
❌ **FAIL**: Check .NET Brain URL

**VS Code Status:** ✅ Connected when all 3 pass

---

## 🎨 PART 3: Google AI Studio (React Dashboard)

### 3.1 Create Test Component

Create `src/components/DMFTest.tsx`:

```typescript
import { useEffect, useState } from "react";
import { dmfApi } from "../lib/dmf_api_client";

export function DMFTest() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function testCatalog() {
    setLoading(true);
    setError(null);
    try {
      const data = await dmfApi.getCatalogReleases();
      setReleases(data);
      console.log("✅ Catalog loaded:", data);
    } catch (err: any) {
      setError(err.message);
      console.error("❌ Catalog failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function testScore() {
    setLoading(true);
    setError(null);
    try {
      const score = await dmfApi.scoreTrack({
        trackId: "test-123",
        title: "Test Track",
        artist: "Test Artist"
      });
      console.log("✅ Score received:", score);
      alert(`Score: ${score.score}, Readiness: ${score.readiness}`);
    } catch (err: any) {
      setError(err.message);
      console.error("❌ Score failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2>DMF Gateway Test Panel</h2>
      
      <div style={{ marginBottom: "10px" }}>
        <button onClick={testCatalog} disabled={loading}>
          {loading ? "Loading..." : "Test: Get Catalog"}
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={testScore} disabled={loading}>
          {loading ? "Scoring..." : "Test: Score Track"}
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          ❌ Error: {error}
        </div>
      )}

      {releases.length > 0 && (
        <div>
          <h3>Catalog ({releases.length} releases):</h3>
          <ul>
            {releases.map((r: any) => (
              <li key={r.id}>{r.title}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        <p>API Base: {import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}</p>
      </div>
    </div>
  );
}
```

### 3.2 Add to Page

In your dashboard page:

```typescript
import { DMFTest } from "../components/DMFTest";

export default function Dashboard() {
  return (
    <div>
      <h1>DMF Dashboard</h1>
      <DMFTest />
    </div>
  );
}
```

### 3.3 Test in Browser

1. Start dev server: `npm run dev`
2. Navigate to dashboard page with DMFTest component
3. Click "Test: Get Catalog"
4. Check browser console (F12)

✅ **PASS**: Releases displayed, no errors  
❌ **FAIL**: Check console for errors, verify `VITE_API_BASE_URL` env var

**Google AI Status:** ✅ Connected when catalog loads

---

## ⚡ PART 4: Bolt (Auto-Generated App)

### 4.1 Create Bolt Project

Go to **Bolt.new** and create a project with prompt:

```
Create a simple React dashboard that:
1. Calls an API at http://localhost:5000/catalog/releases
2. Displays each release as a card with title and type
3. Shows a "Refresh" button to reload
4. Displays loading state while fetching
```

### 4.2 Verify Generated Code

Bolt should generate something like:

```typescript
useEffect(() => {
  fetch("http://localhost:5000/catalog/releases")
    .then(r => r.json())
    .then(releases => setReleases(releases));
}, []);
```

### 4.3 Test

1. Run the Bolt project locally
2. Should see releases display
3. Check Network tab (F12) → should see request to `:5000`

✅ **PASS**: Releases show from API  
❌ **FAIL**: Check Bolt's base URL config

**Bolt Status:** ✅ Connected when it renders real data

---

## 🤖 PART 5: Gemini (Google AI Operator)

### 5.1 Open Gemini

Go to: **https://aistudio.google.com**

### 5.2 Create New Chat

Click **New Chat**

### 5.3 Add System Prompt

Copy from `GEMINI_SYSTEM_PROMPT.md` and paste into Gemini's system prompt field.

**Key part of prompt:**
```
Base URL (Local): http://localhost:5000
Base URL (Production): https://api.dmf-music-platform.com

You have access to these endpoints:
- GET /catalog/releases
- POST /brain/catalog/score
- POST /distributor/payout/quote
```

### 5.4 Test Query 1: List Catalog

In Gemini chat:
```
List my catalog releases
```

**Expected Gemini response:**
- Calls `GET /catalog/releases`
- Returns list of releases
- Explains what it found

**Check DevTools (F12) → Network tab:**
- Should see request to `localhost:5000/catalog/releases`

✅ **PASS**: Gemini calls API and explains results  
❌ **FAIL**: Check system prompt, verify base URL

### 5.5 Test Query 2: Score + Recommendations

```
What are my top 5 priority tracks for release?
```

**Expected:**
- Calls `/catalog/releases`
- Calls `/brain/catalog/score` or `/brain/catalog/recommendations`
- Returns prioritized list with explanations

✅ **PASS**: Multiple API calls, strategic response  
❌ **FAIL**: System prompt may not be configured correctly

**Gemini Status:** ✅ Connected when it's calling the API

---

## 🧠 PART 6: OpenAI (Ryia Boss / StreamGod Assistant)

### 6.1 Create Assistant

Go to: **https://platform.openai.com/assistants**

Click **Create**

### 6.2 Configure Assistant

| Field | Value |
|-------|-------|
| Name | StreamGod / Ryia Boss |
| Description | DMF-MUSIC-PLATFORM AI Operator |
| Instructions | [Paste from OPENAI_ASSISTANT_SETUP.md] |

### 6.3 Add Function Tools

Add 10 functions from `OPENAI_ASSISTANT_SETUP.md`:

1. `list_releases` → `GET /catalog/releases`
2. `list_tracks` → `GET /catalog/tracks`
3. `score_track` → `POST /brain/catalog/score`
4. `get_recommendations` → `POST /brain/catalog/recommendations`
5. `analyze_catalog` → `POST /brain/catalog/analyze`
6. `generate_insights` → `POST /brain/catalog/insights`
7. `get_release_quote` → `POST /distributor/release/quote`
8. `get_payout_quote` → `POST /distributor/payout/quote`
9. `create_release` → `POST /distributor/release`
10. `check_health` → `GET /health`

### 6.4 Test Query 1: Health Check

```
Check if the DMF API is healthy
```

**Expected:**
- Calls `check_health()` function
- Returns health status
- Confirms connectivity

✅ **PASS**: Function called, response received  
❌ **FAIL**: Check function definitions

### 6.5 Test Query 2: Strategic Analysis

```
Analyze my catalog and create a 30-day release strategy
```

**Expected:**
- Calls `list_releases()`
- Calls `get_recommendations()`
- Calls `get_payout_quote()` for financial projections
- Returns comprehensive strategy

✅ **PASS**: Multiple functions, strategic response  
❌ **FAIL**: Check function implementations

### 6.6 Test Query 3: Revenue Projection

```
If I release a single and get 100k streams, how much would I make on the indie_plus tier?
```

**Expected:**
- Calls `get_payout_quote()` with parameters
- Shows artist payout, DMF share, per-stream rate
- Suggests next steps

✅ **PASS**: Accurate calculation, clear explanation  
❌ **FAIL**: Check distributor backend

**OpenAI Status:** ✅ Connected when functions execute

---

## 📊 FINAL VERIFICATION CHECKLIST

Run through this to confirm all five faces are operational:

### Gateway
- [ ] `/health` responds in < 1 second
- [ ] `/catalog/releases` returns array
- [ ] `/brain/catalog/score` accepts POST, returns score

### VS Code
- [ ] REST Client extension installed
- [ ] All 3 requests in `dmf.http` return 200
- [ ] Can modify requests and re-send

### Google AI Studio
- [ ] `dmf_api_client.ts` imported correctly
- [ ] `getCatalogReleases()` returns data
- [ ] Test component displays releases

### Bolt
- [ ] Generated app loads without errors
- [ ] Displays real releases from API
- [ ] Network tab shows `:5000` requests

### Gemini
- [ ] System prompt pasted and active
- [ ] Can ask catalog questions
- [ ] Calls are visible in DevTools Network

### OpenAI
- [ ] Assistant created and saved
- [ ] 10 functions added
- [ ] Functions execute when called

---

## 🎯 Success Criteria

| Face | Success | Test |
|------|---------|------|
| **Gateway** | All endpoints 200 | `curl :5000/health` |
| **VS Code** | All requests work | Click "Send Request" |
| **Google AI** | Catalog displays | Click "Test: Get Catalog" |
| **Bolt** | Real data shown | App renders releases |
| **Gemini** | Calls API | Ask "List my releases" |
| **OpenAI** | Functions execute | Ask "Check health" |

**PASS:** All 6 items ✅ = **Five Faces System Live**

---

## 🔧 Troubleshooting

### "Cannot reach gateway"
```powershell
# Check if gateway is running
curl http://localhost:5000/health

# If fails, start gateway
cd gateway
npm start
```

### "API returns 502 Bad Gateway"
```powershell
# Check backend URLs in gateway/.env
# Example:
DOTNET_BRAIN_URL=http://localhost:5183
LOVABLE_BACKEND_URL=https://your-lovable-api.com

# Verify each backend is running
curl http://localhost:5183/health  # .NET Brain
```

### "Gemini/OpenAI not calling API"
- Verify system prompt has correct base URL
- Check browser DevTools → Network tab
- Ensure functions are properly defined
- Try simpler query first: "What is 2+2?" (should work)

### "CORS errors in browser"
- Gateway has CORS enabled by default
- If still failing, check browser console for specific error
- Add header `Origin: http://localhost:5000` to test

### "Auth errors"
- Local dev: leave `DMF_API_KEY` empty in `.env`
- Production: set to strong random key
- For AI operators, send header: `x-dmf-api-key: YOUR_KEY`

---

## 📈 Next Steps (After All Tests Pass)

1. **Deploy Gateway** to Render/Railway (see `gateway/README.md`)
2. **Update all frontends** to use production URL
3. **Set DMF_API_KEY** in production environment
4. **Monitor health** dashboard for all five faces
5. **Build custom features** using the stable gateway

---

**Once all six tests pass, DMF's Five Faces are officially live and synced.** 🚀
