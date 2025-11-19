# DMF FRONTEND ARCHITECTURE

**One Brain, Multiple Faces** – All frontends share the same DMF Gateway and backends.

---

## Architecture Overview

```
           (Artists / Clients / You)
 ┌────────────────────────────────────────────────────┐
 │ Google AI │ Bolt  │ VS Code │ Gemini │ OpenAI     │
 │ Studio    │ App   │ Ext     │ Agent  │ Assistant   │
 └──────────────┬──────────────────────────────────────┘
                │  HTTPS (JSON / REST)
        🔐 DMF GATEWAY  (api.dmf-music-platform.com)
                │
   ┌────────────┼──────────────┬──────────────┐
   │            │              │              │
 Firebase      Lovable        .NET Brain    Payments
 Auth/Msg      Core API       StreamGod AI   Stripe
```

---

## 1. Google AI Studio — **Main 4K Label Dashboard**

**Role:** Primary web UI for artists and label operations  
**Audience:** Artists, Managers, Label Ops  
**Framework:** React/Vite (or similar)

### Features

- Release management
- Catalog scoring
- Payout tracking
- Analytics & insights
- Campaign planning

### API Integration

```typescript
import { dmfApi } from "./dmf_api_client";

// List all releases
const releases = await dmfApi.getCatalogReleases();

// Score a track
const score = await dmfApi.scoreTrack({
  trackId: "abc123",
  metadata: { title: "Track", artist: "Artist" }
});

// Get payout estimate
const payout = await dmfApi.getPayoutQuote({
  releaseType: "single",
  trackCount: 1,
  payoutTier: "indie_basic"
});
```

### Environment

```bash
VITE_API_BASE_URL=http://localhost:5000  # local
VITE_API_BASE_URL=https://api.dmf-music-platform.com  # prod
```

---

## 2. Bolt — **Auto-App Builder for DMF Tools**

**Role:** Rapid prototyping and tool generation  
**Audience:** Power users, Developers  
**Framework:** React/Vite (auto-generated)

### Use Cases

- Create "DMF Royalty Inspector"
- Build "Campaign Planner"
- Auto-generate "Metadata Fixer"
- Prototype custom dashboards

### API Integration

Same `dmfApi` client, just in generated code:

```typescript
// Auto-generated tool from Bolt
const recommendations = await dmfApi.getRecommendations({
  catalogSize: 50,
  minReadiness: 0.7
});
```

### Environment

```bash
VITE_API_BASE_URL=http://localhost:5000
```

---

## 3. VS Code — **Dev & Owner Cockpit**

**Role:** Developer control center and owner operations  
**Audience:** Developers, Owners, Technical staff

### Layer A: REST Client (Simple)

Use the REST Client extension with `dmf.http`:

```http
### Variables
@dmfApiBase = http://localhost:5000

### Health check
GET @dmfApiBase/health

### Get catalog
GET @dmfApiBase/catalog/releases

### Score track
POST @dmfApiBase/brain/catalog/score
Content-Type: application/json

{
  "trackId": "abc123",
  "metadata": { "title": "Track" }
}
```

### Layer B: VS Code Extension (Advanced)

Build a custom extension that shows a "StreamGod Panel":

```typescript
import { DMFApiClient } from "./dmf_api_client";

const apiClient = new DMFApiClient(
  process.env.DMF_API_BASE_URL || "http://localhost:5000"
);

// Show catalog in Side Bar
const releases = await apiClient.getCatalogReleases();
```

### Environment

```bash
DMF_API_BASE_URL=http://localhost:5000
```

---

## 4. Gemini — **Google-side AI Operator**

**Role:** Natural language AI operations  
**Audience:** AI-assisted operations  
**AI Provider:** Google Gemini

### System Prompt

```
You are a DMF operator for the DMF-MUSIC-PLATFORM.

Your job is to help manage music releases, scoring, payouts, and campaigns.

You have access to these API endpoints:
- GET /catalog/releases — List all releases
- POST /brain/catalog/score — Score individual tracks
- POST /brain/catalog/recommendations — Get top recommendations
- POST /distributor/release/quote — Get release pricing
- POST /distributor/payout/quote — Calculate payouts
- POST /payments/checkout — Process subscription

Base URL: https://api.dmf-music-platform.com

When a user asks you to do something, make the appropriate API call and report back.
```

### Example Conversation

> **You:** "Score my whole catalog and show the top 10 priority tracks"

**Gemini:**
1. Calls `GET /catalog/releases`
2. Calls `POST /brain/catalog/score` for each track (or batch)
3. Returns ranked list with explanations

### Implementation

Define Gemini "tools" that wrap API calls:

```yaml
tools:
  - name: list_releases
    description: "Get all catalog releases"
    function: GET /catalog/releases

  - name: score_track
    description: "Score a track for release readiness"
    function: POST /brain/catalog/score
    parameters:
      trackId: string
      metadata: object

  - name: get_recommendations
    description: "Get top recommended tracks"
    function: POST /brain/catalog/recommendations
    parameters:
      limit: integer
      minScore: number
```

---

## 5. OpenAI (ChatGPT / Assistants) — **StreamGod / Ryia Boss AI**

**Role:** Strategic decision making and automation  
**Audience:** High-level strategy, autonomous operations  
**AI Provider:** OpenAI GPT-4 / Assistants API

### Custom GPT / Assistant Setup

Create a custom GPT with:

```
Name: StreamGod / Ryia Boss
Description: DMF-MUSIC-PLATFORM AI operator for strategic decisions

Instructions:
You are StreamGod, an intelligent operator for DMF-MUSIC-PLATFORM.
You help with:
- Intelligent release planning
- Campaign strategy generation
- Metadata optimization
- Release readiness analysis

Available endpoints: [list same as Gemini above]

When users ask for strategy, analysis, or automation, use the API to gather data
and provide thoughtful, data-backed recommendations.
```

### Tools Definition (OpenAI Format)

```json
{
  "type": "function",
  "function": {
    "name": "list_releases",
    "description": "Get all releases in catalog",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  }
},
{
  "type": "function",
  "function": {
    "name": "score_catalog",
    "description": "Score entire catalog for release readiness",
    "parameters": {
      "type": "object",
      "properties": {
        "scoreType": {
          "type": "string",
          "enum": ["readiness", "commercial", "technical"]
        }
      }
    }
  }
}
```

### Example Use Case

> **You:** "Generate a 30-day release plan for all tracks with readiness > 0.8. Include campaign suggestions and expected payouts."

**StreamGod:**
1. Calls `GET /catalog/releases`
2. Calls `POST /brain/catalog/score` for analysis
3. Calls `POST /brain/catalog/recommendations` for planning
4. Calls `POST /distributor/release/quote` for each planned release
5. Returns comprehensive 30-day plan with campaign templates

---

## Shared Configuration

All frontends reference **`dmf_frontends.json`**:

```json
{
  "gatewayBaseUrl": "https://api.dmf-music-platform.com",
  "environments": {
    "local": { "gatewayBaseUrl": "http://localhost:5000" },
    "prod": { "gatewayBaseUrl": "https://api.dmf-music-platform.com" }
  },
  "routes": {
    "catalog": "/catalog",
    "brain": "/brain",
    "distributor": "/distributor",
    "payments": "/payments"
  }
}
```

---

## Shared API Client

All TypeScript-based frontends use **`dmf_api_client.ts`**:

```typescript
// Usage pattern (same across all frontends)
import { dmfApi, createDMFApiClient } from "./dmf_api_client";

// Single instance (global)
const releases = await dmfApi.getCatalogReleases();

// Or create per-environment
const client = createDMFApiClient("prod");
const score = await client.scoreTrack(trackData);
```

---

## Authentication Flow

All frontends use **Firebase Authentication**:

1. User logs in (e.g., in Google AI Studio)
2. Firebase returns ID token
3. Frontend passes token to DMF Gateway: `Authorization: Bearer <id_token>`
4. Gateway verifies and routes to backends
5. Token is refreshed automatically by Firebase SDK

For AI operators (Gemini/OpenAI):
- Use API key for service-to-service auth
- Or exchange user token for a temporary API key

---

## Environment Variables

| Frontend | Variable | Example |
|----------|----------|---------|
| Google AI Studio | `VITE_API_BASE_URL` | `http://localhost:5000` |
| Bolt | `VITE_API_BASE_URL` | `http://localhost:5000` |
| VS Code Extension | `DMF_API_BASE_URL` | `http://localhost:5000` |
| Gemini | System prompt | `https://api.dmf-music-platform.com` |
| OpenAI | Instructions | `https://api.dmf-music-platform.com` |

---

## Deployment

### Local Development

```bash
# Terminal 1: Start gateway
cd gateway
npm start  # runs on :5000

# Terminal 2: Start .NET Brain
cd dmf-music-platform.Web
dotnet run  # runs on :5100

# Terminal 3: Start Google AI Studio frontend
cd path/to/google-ai-frontend
npm run dev  # reads VITE_API_BASE_URL=http://localhost:5000
```

### Production

```bash
# Deploy gateway to Render / Railway / Fly
# Set env: DMF_API_BASE_URL=https://api.dmf-music-platform.com

# Deploy .NET to same platform or Render

# Update Google AI Studio env:
VITE_API_BASE_URL=https://api.dmf-music-platform.com

# Update Gemini/OpenAI system prompt base URL
```

---

## Next Steps

1. **Deploy Gateway** → Render / Railway (see `gateway/README.md`)
2. **Deploy .NET Brain** → Render / Railway
3. **Wire Google AI Studio** → Set `VITE_API_BASE_URL`
4. **Connect Gemini** → Add system prompt + tools
5. **Connect OpenAI** → Create Assistant with tools
6. **Set up Bolt** → Create first auto-generated tool
7. **VS Code extension** → Build or use REST client

All five faces are now **one cohesive system**.
