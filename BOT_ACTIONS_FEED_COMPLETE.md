# Bot Actions Feed – Complete Integration & Usage Guide

**Status:** ✅ COMPLETE & PUSHED  
**Commit:** b44d78d  
**Date:** November 19, 2025

---

## What You Now Have

### 1️⃣ Backend: AdOrchestrationController.cs

Three production-ready endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ad-orchestration/summary` | GET | System status (active bots/campaigns/creatives) |
| `/api/ad-orchestration/run-due` | POST | Trigger orchestration, optionally limit bots |
| `/api/ad-orchestration/runs` | GET | Fetch recent bot runs with actions, optional artist filter |

**File:** `dmf-music-platform/dmf-music-platform/Controllers/AdOrchestrationController.cs`

---

### 2️⃣ Frontend: Extended Service

**File:** `dmf-music-platform.Web/src/services/adOrchestrationService.ts`

**New Types:**

```typescript
export type AdBotActionType =
  | "RecommendScale"
  | "RecommendPause"
  | "RecommendDuplicateToNewAudience"
  | "RecommendNewCreative"
  | "RecommendBudgetCut";

export interface AdBotAction {
  type: AdBotActionType;
  campaignId?: string | null;
  creativeId?: string | null;
  reason: string;
  suggestedBudgetIncreasePercent?: number | null;
  suggestedBudgetCutPercent?: number | null;
}

export interface AdBotRun {
  id: string;
  botId: string;
  playbookId?: string | null;
  artistIds: string[];
  platform: string | number;
  startedAt: string;
  finishedAt: string;
  actions: AdBotAction[];
  status: string;
  errors: string[];
}
```

**New Function:**

```typescript
export async function getRecentBotRuns(params?: {
  artistId?: string;
  limit?: number;
}): Promise<AdBotRun[]> {
  // Fetches recent runs, optionally filtered by artist
  // Calls: GET /api/ad-orchestration/runs?artistId=...&limit=50
}
```

---

### 3️⃣ Frontend: BotActionsFeed Component

**File:** `dmf-music-platform.Web/src/components/BotActionsFeed.tsx`

A production-ready React component that displays real-time bot decisions.

**Props:**

```typescript
interface BotActionsFeedProps {
  artistId?: string; // optional – filter by artist
  limit?: number;    // default 50, max 200
}
```

**Features:**

✅ Loads bot runs on mount  
✅ Shows bot ID, playbook, artists, timestamp  
✅ Displays each action with:
  - Type badge (color-coded: green=scale, red=pause, etc.)
  - Campaign & creative IDs
  - AI reasoning (why the bot made this call)
  - Suggested budget changes (increase/cut %)
✅ Manual refresh button  
✅ Loading & error states  
✅ Scrollable (max-height 420px)  
✅ Optional per-artist filtering  

---

## How to Use

### Option A: In StreamGod Dashboard (Global View)

```tsx
// src/pages/StreamGodDashboard.tsx
import React from "react";
import { StreamGodAdSummary } from "../components/StreamGodAdSummary";
import { StreamGodAdControlPanel } from "../components/StreamGodAdControlPanel";
import { BotActionsFeed } from "../components/BotActionsFeed";

export const StreamGodDashboard: React.FC = () => {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Other StreamGod panels */}
          <h2 className="text-2xl font-bold">Dashboard Intelligence</h2>
          
          {/* Bot Actions Feed (shows all artists) */}
          <BotActionsFeed limit={50} />
        </div>

        {/* Right sidebar (1/3 width) */}
        <div className="space-y-6">
          <StreamGodAdSummary />
          <StreamGodAdControlPanel />
        </div>
      </div>
    </main>
  );
};
```

**Result:**
- Owner sees all bot decisions across all artists
- Can watch bots scale, pause, cut budgets in real-time
- Bots are "visible" and controllable from one dashboard

---

### Option B: Per-Artist Page (Artist-Specific View)

```tsx
// src/pages/ArtistDetailPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { BotActionsFeed } from "../components/BotActionsFeed";

export const ArtistDetailPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="space-y-6">
        {/* Artist header, stats, kpis, etc. */}
        <h1 className="text-3xl font-bold">Artist: {artistId}</h1>

        {/* Show bot decisions specific to this artist */}
        <BotActionsFeed artistId={artistId} limit={30} />
      </div>
    </div>
  );
};
```

**Result:**
- Artist/manager sees which bots ran for their content
- Understands why campaigns were scaled, paused, or modified
- Full transparency into AI recommendations

---

### Option C: Modular Integration

Use the component anywhere you need bot visibility:

```tsx
// In earnings section
<div className="grid gap-6">
  <EarningsChart />
  <BotActionsFeed artistId={artistId} limit={15} />
</div>

// In campaign detail page
<div className="space-y-6">
  <CampaignMetrics campaignId={campaignId} />
  <BotActionsFeed artistId={artistId} limit={20} />
</div>

// In debug console
<div className="font-mono text-xs">
  <BotActionsFeed limit={100} />
</div>
```

---

## API Reference

### GET /api/ad-orchestration/summary

Returns system-wide statistics.

**Request:**
```
GET /api/ad-orchestration/summary
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "activeBots": 10000,
  "activeCampaigns": 2847,
  "activeCreatives": 15623,
  "lastBotRunAt": "2025-11-19T14:22:00Z"
}
```

---

### POST /api/ad-orchestration/run-due

Trigger the orchestrator to run due bots.

**Request:**
```
POST /api/ad-orchestration/run-due?maxBots=50
Authorization: Bearer {token}
```

**Query Parameters:**
- `maxBots` (int, optional): Max bots to run this cycle (default 50, max 500)

**Response (200):**
```json
{
  "botsRun": 42,
  "actionsCount": 156,
  "errorsCount": 0,
  "botIds": [
    "bot_audience_001",
    "bot_creative_002",
    "bot_budget_003",
    ...
  ]
}
```

---

### GET /api/ad-orchestration/runs

Fetch recent bot runs and their actions.

**Request:**
```
GET /api/ad-orchestration/runs?artistId=artist_freezzo&limit=50
Authorization: Bearer {token}
```

**Query Parameters:**
- `artistId` (string, optional): Filter by artist ID
- `limit` (int, optional): Max results to return (default 50, max 200)

**Response (200):**
```json
[
  {
    "id": "run_bot_audience_001_2025-11-19T14:22:00Z",
    "botId": "bot_audience_001",
    "playbookId": "playbook_audience_intel_v2",
    "artistIds": ["artist_freezzo", "artist_lyrical"],
    "platform": 2,
    "startedAt": "2025-11-19T14:22:00Z",
    "finishedAt": "2025-11-19T14:22:15Z",
    "actions": [
      {
        "type": "RecommendScale",
        "campaignId": "camp_freezzo_shorts_001",
        "creativeId": "creative_freezzo_hook_a",
        "reason": "CTR trending +23%, budget efficiency optimal. Recommend 40% scale.",
        "suggestedBudgetIncreasePercent": 40,
        "suggestedBudgetCutPercent": null
      },
      {
        "type": "RecommendPause",
        "campaignId": "camp_freezzo_display_002",
        "creativeId": "creative_freezzo_old_creative",
        "reason": "Impression fatigue detected. Views dropped 67% last 2 days. Recommend pause.",
        "suggestedBudgetIncreasePercent": null,
        "suggestedBudgetCutPercent": null
      }
    ],
    "status": "Completed",
    "errors": []
  },
  {
    "id": "run_bot_creative_002_2025-11-19T14:20:00Z",
    "botId": "bot_creative_002",
    "playbookId": "playbook_creative_lab_v1",
    "artistIds": ["artist_freezzo"],
    "platform": 5,
    "startedAt": "2025-11-19T14:20:00Z",
    "finishedAt": "2025-11-19T14:20:22Z",
    "actions": [
      {
        "type": "RecommendNewCreative",
        "campaignId": "camp_freezzo_shorts_001",
        "creativeId": null,
        "reason": "3 variants tested, hook_b showing +18% higher CTR. Recommend launching as primary.",
        "suggestedBudgetIncreasePercent": null,
        "suggestedBudgetCutPercent": null
      }
    ],
    "status": "Completed",
    "errors": []
  }
]
```

---

## Component Styling Reference

The component uses **Tailwind CSS** with a dark theme matching StreamGod:

```
Main container:
  bg-gradient-to-br from-[#020617] to-[#020617]/90
  border-gray-800
  rounded-2xl

Action badges:
  RecommendScale      → bg-emerald-900/60  (green)
  RecommendPause      → bg-red-900/60      (red)
  RecommendBudgetCut  → bg-orange-900/60   (orange)
  RecommendDuplicate  → bg-blue-900/60     (blue)
  RecommendNewCreative→ bg-purple-900/60   (purple)

Status badges:
  Completed → bg-emerald-900/60   (green)
  Failed    → bg-red-900/60        (red)

Refresh button:
  bg-gray-900 hover:bg-gray-800
  Disabled during loading
```

---

## Error Handling

Both the component and service have built-in error handling:

**Component Level:**
```typescript
// Displays user-friendly error message
const [error, setError] = useState<string | null>(null);
// Shows: "Unable to load bot actions right now."
```

**Service Level:**
```typescript
try {
  const data = await getRecentBotRuns({ artistId, limit });
  setRuns(data || []);
} catch (err) {
  console.error(err);
  setError("Unable to load bot actions right now.");
}
```

If the API returns an error, the component gracefully displays a message and allows manual retry via the "Refresh" button.

---

## Performance Considerations

1. **Pagination:** Default limit is 50, max 200 per request
2. **Auto-refresh:** NOT included (manual refresh only to save bandwidth)
3. **Scrollable:** Max-height 420px with overflow-y-auto (large data sets stay performant)
4. **Filtering:** Pass `artistId` to reduce data transferred
5. **Caching:** Consider adding React Query or SWR for client-side caching of runs

---

## Future Enhancements

### 1. Auto-Refresh
Add a 30-second auto-refresh timer:

```typescript
useEffect(() => {
  const interval = setInterval(() => loadRuns(true), 30000);
  return () => clearInterval(interval);
}, []);
```

### 2. Action History Export
Add "Export" button to download bot decisions as CSV:

```typescript
const exportAsCSV = () => {
  const csv = runs.map(r => 
    `${r.botId},${r.startedAt},${r.actions.length},${r.status}`
  ).join("\n");
  // Download logic
};
```

### 3. Bot Performance Heatmap
Visual chart showing which bots/divisions are most active:

```typescript
// Group runs by division, show action counts
const divisionStats = groupBy(runs, r => getBotDivision(r.botId));
```

### 4. Dispute/Override System
Allow artist to mark actions as "reviewed" or "override":

```typescript
const overrideAction = async (runId: string, actionIdx: number) => {
  await api.post(`/ad-orchestration/runs/${runId}/actions/${actionIdx}/override`);
};
```

### 5. Real-Time WebSocket
Replace polling with WebSocket for live updates:

```typescript
const socket = new WebSocket("wss://api.yourdomain.com/bot-stream");
socket.onmessage = (event) => {
  const newRun = JSON.parse(event.data);
  setRuns(prev => [newRun, ...prev].slice(0, 50));
};
```

---

## Testing Checklist

```
✓ BotActionsFeed component imports without errors
✓ Can mount with no props (uses defaults)
✓ Can mount with artistId (filters data)
✓ Can mount with custom limit (respects 1-200 range)
✓ Fetches runs on component mount
✓ Displays bot runs in correct order (newest first)
✓ Shows bot ID, playbook, artists, timestamp
✓ Displays action badges with correct colors
✓ Shows campaign/creative IDs when present
✓ Shows reason text (AI explanation)
✓ Shows budget increase/cut percentages
✓ Shows status badge (green=success, red=failed)
✓ Shows error messages if present
✓ "Refresh" button re-fetches without reloading
✓ Disabled state during loading
✓ Shows "Loading bot runs…" message
✓ Shows "No bot runs yet" when empty
✓ Scrollable container doesn't break layout
✓ Dark theme matches StreamGod design
✓ Mobile responsive
✓ Error message displays on API failure
✓ Can retry loading after error
```

---

## Git Commits

| File | Commit | Status |
|------|--------|--------|
| AdOrchestrationController.cs | b44d78d | ✅ Pushed |
| adOrchestrationService.ts | b44d78d | ✅ Pushed |
| BotActionsFeed.tsx | b44d78d | ✅ Pushed |

**All pushed to `origin/master`** ✅

---

## What Happens Now

1. **Owner uses StreamGod dashboard** → Sees real-time bot decisions
2. **Bot runs trigger** → Actions logged to MongoDB (`ad_bot_runs` collection)
3. **BotActionsFeed loads** → Fetches recent runs via `/api/ad-orchestration/runs`
4. **Artist sees why** → Full transparency into bot reasoning
5. **Decisions scale** → Bots work 24/7, owner watches from UI

**You can now watch 10,000 bots think in real-time.**

---

## Support

- **Backend issues?** Check `AdOrchestrationController.cs` for error handling
- **Frontend errors?** Check `BotActionsFeed.tsx` error state + console logs
- **API issues?** Ensure `/api/ad-orchestration/*` endpoints are registered in `Program.cs`
- **Styling issues?** Verify Tailwind CSS is configured and classes are compiled

All code is ready for production. Integrate and ship.
