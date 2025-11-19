# DMF FIVE FACES — SETUP & INTEGRATION GUIDE

**One Brain, Multiple Frontends** — Complete integration guide for all five DMF operators.

---

## 📚 Files Created

| File | Purpose |
|------|---------|
| `dmf_frontends.json` | Master configuration for all frontends |
| `dmf_api_client.ts` | Shared TypeScript API client (use everywhere) |
| `FRONTEND_ARCHITECTURE.md` | Full architecture docs |
| `dmf.http` | VS Code REST Client debugging requests |
| `gateway/` | Multi-backend router service |

---

## 🚀 Quick Start (Local Development)

### 1. Start the Gateway

```powershell
cd gateway
npm start
# Expected: "🚀 DMF Gateway running on http://localhost:5000"
```

### 2. Start the .NET Brain

```powershell
cd dmf-music-platform.Web
dotnet run
# Expected: "listening on http://localhost:5183" or similar
```

### 3. Configure Gateway Backend URLs

Edit `gateway/.env`:

```bash
PORT=5000
DOTNET_BRAIN_URL=http://localhost:5183
FIREBASE_BACKEND_URL=https://your-firebase-backend-url
LOVABLE_BACKEND_URL=https://your-lovable-backend-url
PAYMENTS_BACKEND_URL=http://localhost:5200
```

### 4. Test Gateway Health

```bash
curl http://localhost:5000/health
# Expected: { "status": "ok", "service": "dmf-gateway", "time": "..." }
```

---

## 🎨 Frontend 1: Google AI Studio — Main Dashboard

### Setup

1. In your Google AI Studio project, install dependencies:
   ```bash
   npm install
   ```

2. Add environment file `.env.local`:
   ```bash
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. Copy `dmf_api_client.ts` into your project:
   ```bash
   cp dmf_api_client.ts src/lib/dmf_api_client.ts
   ```

4. Use in your components:
   ```typescript
   import { dmfApi } from "./lib/dmf_api_client";

   // Get releases
   const releases = await dmfApi.getCatalogReleases();

   // Score a track
   const score = await dmfApi.scoreTrack({
     trackId: "abc123",
     title: "My Track"
   });
   ```

### Test in Browser

```
http://localhost:5173  (or your Vite dev port)
```

Navigate to any page that calls the API and verify requests appear in Network tab pointing to `http://localhost:5000`.

---

## ⚡ Frontend 2: Bolt — Auto-App Builder

### Setup

1. Create a new Bolt project with:
   ```
   Create a dashboard that lists all my music releases and scores them
   ```

2. Bolt generates code. In the generated code, add:
   ```typescript
   import { dmfApi } from "path/to/dmf_api_client";

   // Bolt's generated code can now call:
   const releases = await dmfApi.getCatalogReleases();
   ```

3. Set environment:
   ```bash
   VITE_API_BASE_URL=http://localhost:5000
   ```

### Test

Run the Bolt app locally and verify it connects to the gateway.

---

## 💻 Frontend 3: VS Code — Dev Cockpit

### Setup A: REST Client (Simple)

1. Install "REST Client" extension by Huachao Mao in VS Code
2. Open `dmf.http` file in VS Code
3. Click "Send Request" on any block

### Setup B: VS Code Extension (Advanced)

1. Create a VS Code extension:
   ```bash
   npm install -g yo generator-code
   yo code
   ```

2. In extension code, import the API client:
   ```typescript
   import { DMFApiClient } from "./dmf_api_client";
   const api = new DMFApiClient(
     process.env.DMF_API_BASE_URL || "http://localhost:5000"
   );
   ```

3. Register a command to test:
   ```typescript
   vscode.commands.registerCommand('dmf.health', async () => {
     const health = await api.health();
     vscode.window.showInformationMessage(`DMF Status: ${health.status}`);
   });
   ```

---

## 🤖 Frontend 4: Gemini — Google AI Operator

### Setup

1. Go to **Google AI Studio** (https://aistudio.google.com)
2. Create a new conversation
3. Paste this **System Prompt**:

```
You are a DMF-MUSIC-PLATFORM operator named "DMF Assistant".

Your job is to help manage music releases, scoring, payouts, and campaigns.

The API base URL is: http://localhost:5000 (or https://api.dmf-music-platform.com in production)

You have access to these endpoints:

**Catalog:**
- GET /catalog/releases → List all releases
- GET /catalog/tracks → List all tracks

**Brain (AI Scoring):**
- POST /brain/catalog/score → Score a single track
  Body: { "trackId": "...", "title": "...", "artist": "..." }
  
- POST /brain/catalog/recommendations → Get top recommendations
  Body: { "catalogSize": 50, "minReadiness": 0.7 }

**Distributor (Pricing):**
- POST /distributor/release/quote → Get release cost
  Body: { "releaseType": "single", "trackCount": 1 }
  
- POST /distributor/payout/quote → Calculate payouts
  Body: { "releaseType": "single", "trackCount": 1, "estimatedStreams": 10000, "payoutTier": "indie_basic" }

When a user asks you to:
- "Score my catalog" → Call /brain/catalog/score for each track
- "What releases do I have?" → Call /catalog/releases
- "How much will I make?" → Call /distributor/payout/quote
- "Get recommendations" → Call /brain/catalog/recommendations

Make the HTTP calls and report results back to the user with explanations.
```

4. Test with:
   > "List my releases"
   > "Score my top 5 tracks"
   > "What would a single release cost?"

### Example Workflow

**You:** "Generate a 30-day release plan for all tracks with readiness > 0.8"

**Gemini:**
1. Calls `GET /catalog/releases`
2. Calls `POST /brain/catalog/score` for each
3. Filters for readiness > 0.8
4. Calls `POST /distributor/release/quote` for estimated costs
5. Returns structured plan

---

## 🎯 Frontend 5: OpenAI — StreamGod / Ryia Boss Assistant

### Setup

1. Go to **OpenAI Platform** (https://platform.openai.com/assistants)
2. Create a new **Assistant**
3. Set **Instructions** to:

```
You are StreamGod, the intelligent AI operator for DMF-MUSIC-PLATFORM.

You help with:
- Intelligent release planning
- Campaign strategy generation
- Metadata optimization
- Release readiness analysis
- Autonomous decision support

API Base URL: http://localhost:5000 (or https://api.dmf-music-platform.com in production)

Available tools (functions you can call):

1. list_releases() → GET /catalog/releases
2. score_track(trackId, title, artist) → POST /brain/catalog/score
3. get_recommendations(catalogSize, minReadiness) → POST /brain/catalog/recommendations
4. get_release_quote(releaseType, trackCount) → POST /distributor/release/quote
5. get_payout_quote(releaseType, trackCount, streams, tier) → POST /distributor/payout/quote

When asked for strategy, analysis, or planning:
1. Gather data using available tools
2. Analyze the data
3. Provide thoughtful, data-backed recommendations
4. Suggest specific actions

Be proactive and suggest improvements based on data patterns you see.
```

4. Add **Tools**:
   - Function: `list_releases`
   - Function: `score_track`
   - Function: `get_recommendations`
   - Function: `get_release_quote`
   - Function: `get_payout_quote`

5. Map each function to make HTTP calls to the gateway

### Example Use Case

**You:** "Analyze my catalog and create a strategic 90-day release plan"

**StreamGod:**
1. Calls `list_releases()` to get full catalog
2. Calls `score_track()` for priority analysis
3. Calls `get_recommendations()` for strategy suggestions
4. Calls `get_release_quote()` and `get_payout_quote()` for financials
5. Returns:
   - Current catalog health score
   - Top 10 priority releases
   - 90-day release schedule
   - Estimated revenue per tier
   - Campaign recommendations

---

## 🔗 Integration Checklist

- [ ] Gateway running on `:5000`
- [ ] .NET Brain running on `:5183` (or configured in `gateway/.env`)
- [ ] Google AI Studio connected to `VITE_API_BASE_URL=http://localhost:5000`
- [ ] Bolt project created and calls API client
- [ ] VS Code REST Client testing requests working
- [ ] Gemini system prompt added and tested
- [ ] OpenAI Assistant created with tools configured
- [ ] All 5 frontends can call `/health` and get response

---

## 📊 Testing All Frontends at Once

### Terminal Setup (5 windows)

```powershell
# Terminal 1: Gateway
cd gateway
npm start

# Terminal 2: .NET Brain
cd dmf-music-platform.Web
dotnet run

# Terminal 3: Google AI Studio
cd path/to/google-ai-studio
npm run dev

# Terminal 4: Monitoring
curl -s http://localhost:5000/health | jq .
# Run in a loop to monitor gateway health

# Terminal 5: VS Code REST Client debugging
# Open dmf.http and send test requests
```

### Integration Test Script

Create `test_all_frontends.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

echo "Testing DMF Five Faces Integration..."
echo ""

# Test Gateway
echo "1. Gateway Health"
curl -s $BASE_URL/health | jq .
echo ""

# Test Catalog
echo "2. Catalog Endpoint"
curl -s $BASE_URL/catalog/releases | jq .
echo ""

# Test Brain
echo "3. Brain Scoring"
curl -s -X POST $BASE_URL/brain/catalog/score \
  -H "Content-Type: application/json" \
  -d '{"trackId":"test","title":"Test Track"}'
echo ""

# Test Distributor
echo "4. Distributor Quote"
curl -s -X POST $BASE_URL/distributor/release/quote \
  -H "Content-Type: application/json" \
  -d '{"releaseType":"single","trackCount":1}'
echo ""

echo "✅ All frontends accessible through gateway!"
```

Run it:
```bash
chmod +x test_all_frontends.sh
./test_all_frontends.sh
```

---

## 🌍 Production Deployment

### 1. Deploy Gateway

```bash
cd gateway

# Create .env for production
echo 'PORT=5000' > .env
echo 'DOTNET_BRAIN_URL=https://api.dmf-music-platform.com' >> .env
echo 'FIREBASE_BACKEND_URL=https://auth.dmf-music-platform.com' >> .env
echo 'LOVABLE_BACKEND_URL=https://core.dmf-music-platform.com' >> .env

# Deploy to Render
# (instructions in gateway/README.md)
```

### 2. Update Frontend Environment Variables

**Google AI Studio:**
```bash
VITE_API_BASE_URL=https://api.dmf-music-platform.com
```

**Gemini/OpenAI:**
```
API Base URL: https://api.dmf-music-platform.com
(Update in system prompt)
```

### 3. Verify Production

```bash
curl https://api.dmf-music-platform.com/health
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot reach gateway" | Ensure `npm start` running in `gateway/` |
| "502 Bad Gateway" | Check backend URLs in `gateway/.env` |
| "CORS errors" | Gateway handles CORS automatically |
| "Auth token invalid" | Ensure Firebase token is fresh |
| "Brain endpoint 404" | Ensure .NET Brain is running on configured port |

---

## 📖 Next Steps

1. **Deploy Gateway** to cloud (Render recommended)
2. **Deploy .NET Brain** to same cloud platform
3. **Connect all 5 frontends** using master config
4. **Set up CI/CD** for automatic deployments
5. **Monitor health** dashboard across all services

**You now have:**
- ✅ One unified gateway
- ✅ Five different frontends
- ✅ Shared API client
- ✅ Scalable architecture

**All powered by the DMF Brain and backends.**
