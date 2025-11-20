# StreamGod – Ad Bot Dashboard Integration Guide

**Status:** Frontend components created and committed (commit 53e51aa)  
**Backend:** C# models + MongoDB context completed (commit cada196)  
**Infrastructure:** Schema + Marching Orders locked (commit 4e8601a)

---

## Overview

This guide shows how to integrate the Ad Bot orchestration layer into the StreamGod dashboard UI. Three frontend components are now available:

1. **adOrchestrationService.ts** – Axios API client for bot endpoints
2. **StreamGodAdSummary.tsx** – Status tile showing active bots/campaigns/creatives
3. **StreamGodAdControlPanel.tsx** – Control panel to trigger bot runs manually

---

## File Locations

```
dmf-music-platform.Web/
├── src/
│   ├── services/
│   │   └── adOrchestrationService.ts        [NEW]
│   └── components/
│       ├── StreamGodAdSummary.tsx           [NEW]
│       └── StreamGodAdControlPanel.tsx      [NEW]
```

---

## API Client: adOrchestrationService.ts

**Import in any component:**

```typescript
import {
  getAdSystemSummary,
  runDueBots,
  getBotRunHistory,
  AdSystemSummary,
  AdOrchestrationResult,
} from "../services/adOrchestrationService";
```

**Three exported functions:**

### 1. getAdSystemSummary()

Fetches high-level bot ecosystem status.

```typescript
// Call (no parameters)
const summary = await getAdSystemSummary();

// Returns
interface AdSystemSummary {
  activeBots: number;
  activeCampaigns: number;
  activeCreatives: number;
  lastBotRunAt: string | null; // ISO 8601 timestamp
}
```

**Used by:** StreamGodAdSummary component on dashboard load.

---

### 2. runDueBots(maxBots: number)

Triggers the bot orchestrator to analyze and act on due campaigns.

```typescript
// Call
const result = await runDueBots(50); // Run max 50 bots

// Returns
interface AdOrchestrationResult {
  botsRun: number;
  actionsCount: number;
  errorsCount: number;
  botIds: string[];
}
```

**Parameters:**
- `maxBots` (1-500): Maximum number of bots to activate this run
- Default in control panel: 50

**Used by:** StreamGodAdControlPanel component "Run Bots" button.

---

### 3. getBotRunHistory(limit: number)

Fetches recent bot run records (for future Bot Actions Feed component).

```typescript
// Call
const history = await getBotRunHistory(20); // Last 20 runs

// Returns (example)
[
  {
    _id: "ObjectId...",
    bot_id: "bot_audience_001",
    actions: ["recommend_scale", "flag_creative_fatigue"],
    timestamp: "2025-04-15T14:22:00Z",
    success: true,
    error: null,
  },
  // ... more records
]
```

**Used by:** Future Bot Actions Feed component (not yet built).

---

## Component 1: StreamGodAdSummary.tsx

**Purpose:** Display high-level bot ecosystem health on the dashboard.

**Import:**

```typescript
import { StreamGodAdSummary } from "../components/StreamGodAdSummary";
```

**Usage:**

```tsx
<StreamGodAdSummary />
```

**Props:** None  
**State:** Manages API calls, loading, and error handling internally

**Display (Dark Theme, Tailwind):**

```
┌─ StreamGod – Ad System ──────────────────────┐
│                                               │
│  Active Bots        Active Campaigns         │
│      342                    127         Active Creatives
│                                               589
│  Last Bot Run: 2025-04-15 14:22:00 UTC       │
└───────────────────────────────────────────────┘
```

**Colors:**
- Active Bots: Green (#22c55e)
- Active Campaigns: Blue (#3b82f6)
- Active Creatives: Yellow (#eab308)
- Background: Dark gradient (from-[#020617] to-[#020617]/90)

---

## Component 2: StreamGodAdControlPanel.tsx

**Purpose:** Manually trigger bot orchestration from the dashboard.

**Import:**

```typescript
import { StreamGodAdControlPanel } from "../components/StreamGodAdControlPanel";
```

**Usage:**

```tsx
<StreamGodAdControlPanel />
```

**Props:** None  
**State:** Manages input, loading, results, and errors internally

**Features:**

1. **Max Bots Input**
   - Range: 1–500
   - Default: 50
   - Allows owner to control how many bots run this cycle

2. **Run Bots Button**
   - Green (#22c55e), disabled while running
   - Shows "Running…" during execution
   - Shows "Run Bots" when idle

3. **Results Display**
   - Bots Run: Number of bots that executed
   - Actions Produced: Total recommendations made
   - Errors: Count of failed bot runs (red if > 0, green if 0)
   - Bots Involved: List of first 8 bot IDs + overflow count

4. **Error Handling**
   - Displays error message if API call fails
   - Allows user to retry

---

## Dashboard Integration Steps

### Step 1: Identify the Main StreamGod Dashboard Page

Locate the file that renders the main StreamGod dashboard:

```typescript
// Example: pages/StreamGodDashboard.tsx or similar
```

### Step 2: Import Both Components

```typescript
import { StreamGodAdSummary } from "../components/StreamGodAdSummary";
import { StreamGodAdControlPanel } from "../components/StreamGodAdControlPanel";
```

### Step 3: Add to Layout

Recommended layout (right sidebar):

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Main content columns (2/3 width) */}
  <div className="lg:col-span-2">
    {/* Existing dashboard widgets */}
  </div>

  {/* Ad Bot sidebar (1/3 width) */}
  <div className="flex flex-col gap-4">
    <StreamGodAdSummary />
    <StreamGodAdControlPanel />
  </div>
</div>
```

**Layout Tips:**
- Stack both components vertically on smaller screens (mobile-first)
- Place on right sidebar on desktop (natural scrolling area)
- Use consistent gap spacing (gap-4 = 1rem between components)

### Step 4: Verify Backend Endpoints Exist

The frontend calls these endpoints. Ensure backend controller is wired:

```
GET  /api/ad-orchestration/summary
POST /api/ad-orchestration/run-due?maxBots={n}
GET  /api/ad-orchestration/runs?limit={n}
```

See `AD_BOT_PROGRAM_CS_INTEGRATION.md` for backend setup.

---

## Next Steps: Bot Actions Feed Component

**Goal:** Show recent bot decisions per campaign/artist (natural follow-up).

**Will use:** `getBotRunHistory()` function  
**Data to display:**
- Bot ID and division
- Action type (recommend_scale, recommend_pause, flag_creative_fatigue, etc.)
- Timestamp
- Campaign/creative details (link to editor)
- Success/error status

**Design reference:** Similar to existing activity feeds in StreamGod dashboards

---

## Token Interceptor (Auto JWT)

Both components automatically attach JWT token to requests:

```typescript
// In adOrchestrationService.ts
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**No manual auth required** – assumes JWT is in `localStorage.token`.

---

## Environment Configuration

**API Base URL:** `https://localhost:5001/api` (hardcoded in service)

To change for different environments:

```typescript
// In adOrchestrationService.ts, line ~6
const baseURL = process.env.REACT_APP_API_URL || "https://localhost:5001/api";
```

Then set in `.env`:

```
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## Styling Reference

Both components use **Tailwind + dark theme**:

- **Dark background:** `bg-gradient-to-br from-[#020617] to-[#020617]/90`
- **Borders:** `border border-gray-800`
- **Text:** `text-gray-300` (labels), `text-white` (values)
- **Accents:** Green (#22c55e), Blue (#3b82f6), Yellow (#eab308)
- **Rounded:** `rounded-lg`, `rounded-xl`, `rounded-2xl`

Matches existing StreamGod visual language.

---

## Testing Checklist

- [ ] Components import and compile without errors
- [ ] StreamGodAdSummary fetches and displays bot counts
- [ ] StreamGodAdControlPanel input accepts 1-500
- [ ] "Run Bots" button triggers runDueBots() and displays results
- [ ] Error messages appear if API calls fail
- [ ] Loading states show ("Loading system status…", "Running…")
- [ ] Token is automatically added to all API requests
- [ ] Styling matches dark theme (no light-mode colors bleeding in)
- [ ] Mobile responsive (stacks vertically on small screens)

---

## Git Commits

| File | Commit | Status |
|------|--------|--------|
| adOrchestrationService.ts | 53e51aa | ✅ Committed |
| StreamGodAdSummary.tsx | 53e51aa | ✅ Committed |
| StreamGodAdControlPanel.tsx | 53e51aa | ✅ Committed |
| This integration doc | [pending] | ⏳ |

---

## Related Documentation

- **Backend Setup:** `AD_BOT_PROGRAM_CS_INTEGRATION.md`
- **Schema & Collections:** `AD_BOTS_SCHEMA.md`
- **Bot Divisions & Duties:** `BOTS_MARCHING_ORDERS.md`
- **Financial System:** `DMF_MONEY_OS_COMPREHENSIVE_LAUNCH.md`

---

## Questions?

Refer to:
1. `adOrchestrationService.ts` for API contract details
2. Component files for UI/UX implementation
3. Backend controller docs for endpoint specifications
