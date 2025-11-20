# Action Executor – StreamGod Auto-Execution Framework

**Status:** ✅ COMPLETE & LIVE  
**Commit:** 492f71c  
**Date:** November 19, 2025

---

## What You Now Have

StreamGod can now **think → talk → act** under your rules.

### The Three Layers

| Layer | What It Does | Endpoint |
|-------|-------------|----------|
| **Think** | Orchestrator runs bots, analyzes performance | `POST /api/ad-orchestration/run-due` |
| **Talk** | Bot Actions Feed shows decisions with reasoning | `GET /api/ad-orchestration/runs` |
| **Act** | Action Executor applies changes to campaigns | `POST /api/ad-actions/apply` |

---

## How It Works

### 1. Enable Auto-Execution on a Campaign

Set these flags when creating/updating an `AdCampaign`:

```csharp
var campaign = new AdCampaign
{
    Id = "camp_freezzo_shorts_001",
    ArtistId = "artist_freezzo",
    // ... other fields ...
    AllowAutoBudgetAdjustments = true,  // ← Allow scale/cut
    AllowAutoPause = true,               // ← Allow pause
    CurrentDailyBudgetUsd = 0m,         // 0 = use BudgetDailyCapUsd
};
```

**Campaigns without these flags** won't be touched by the executor.

---

### 2. Owner's Execution Flow

```
Step 1: Run bots
────────────────
POST /api/ad-orchestration/run-due?maxBots=200
→ Bots analyze all campaigns, produce recommendations

Step 2: Review decisions
────────────────────────
GET /api/ad-orchestration/runs?limit=50
→ See what bots decided + why (feed already does this)

Step 3: Dry-run the changes
──────────────────────────
POST /api/ad-actions/apply?hoursBack=24&dryRun=true
→ Shows what WOULD happen, doesn't change anything
→ Response:
{
  "actionsProcessed": 156,
  "campaignsUpdated": 0,
  "pausesApplied": 0,
  "budgetIncreases": 0,
  "budgetCuts": 0,
  "dryRun": true,
  "windowStartUtc": "2025-11-18T14:00:00Z",
  "windowEndUtc": "2025-11-19T14:00:00Z"
}

Step 4: If results look good → Execute for real
──────────────────────────────────────────────
POST /api/ad-actions/apply?hoursBack=24&dryRun=false
→ Applies all changes to campaigns
→ Response:
{
  "actionsProcessed": 156,
  "campaignsUpdated": 24,
  "pausesApplied": 3,
  "budgetIncreases": 14,
  "budgetCuts": 10,
  "dryRun": false,
  "windowStartUtc": "2025-11-18T14:00:00Z",
  "windowEndUtc": "2025-11-19T14:00:00Z"
}
```

---

## What Gets Applied

The executor only touches campaigns where:

✅ `AllowAutoBudgetAdjustments = true` → Handles **Scale & Cut** actions  
✅ `AllowAutoPause = true` → Handles **Pause** actions  

**Example:** A campaign has auto-adjust enabled but NOT auto-pause:
- Bots recommend pause → **Ignored** (flag not set)
- Bots recommend scale → **Applied** (flag is set)

---

## Safety Features

1. **Dry-Run Mode (Default)**
   - Always runs with `dryRun=true` first
   - Shows what would happen without making changes
   - Logs everything for audit trail

2. **Budget Clamping**
   ```csharp
   if (currentBudget < 5m) currentBudget = 5m;          // Min $5/day
   if (currentBudget > campaign.BudgetTotalUsd)         // Max total budget
       currentBudget = campaign.BudgetTotalUsd;
   ```

3. **Per-Campaign Opt-In**
   - Campaign flags control what happens
   - Not a global "let bots go wild" switch

4. **Time Window**
   - Only processes actions from last `hoursBack` hours (default 24)
   - Can be adjusted: `?hoursBack=6` for last 6 hours

5. **Action Type Filtering**
   - Only applies: `RecommendScale`, `RecommendBudgetCut`, `RecommendPause`
   - Ignores: `RecommendDuplicateToNewAudience`, `RecommendNewCreative`

---

## API Reference

### POST /api/ad-actions/apply

Apply recent bot recommendations to campaigns.

**Request:**
```
POST /api/ad-actions/apply?hoursBack=24&dryRun=true
Authorization: Bearer {token}
```

**Query Parameters:**
- `hoursBack` (int, optional): Look back this many hours for bot runs (default 24)
- `dryRun` (bool, optional): If true, shows what would happen (default true)

**Response (200):**
```json
{
  "actionsProcessed": 156,
  "campaignsUpdated": 24,
  "pausesApplied": 3,
  "budgetIncreases": 14,
  "budgetCuts": 10,
  "dryRun": true,
  "windowStartUtc": "2025-11-18T14:00:00Z",
  "windowEndUtc": "2025-11-19T14:00:00Z"
}
```

**Fields:**
- `actionsProcessed`: Total bot actions examined
- `campaignsUpdated`: How many campaigns were changed
- `pausesApplied`: Count of campaigns paused
- `budgetIncreases`: Count of scale actions applied
- `budgetCuts`: Count of cut actions applied
- `dryRun`: Whether this was a preview or real execution
- `windowStartUtc`: Start of time window examined
- `windowEndUtc`: End of time window examined

---

## Frontend Integration

### Quick Button: "Apply Recommendations"

Add to your StreamGod control panel:

```tsx
import { applyAdActions } from "../services/adOrchestrationService";

const [applying, setApplying] = useState(false);
const [dryRunResult, setDryRunResult] = useState(null);

const handleDryRun = async () => {
  setApplying(true);
  const result = await applyAdActions({ 
    hoursBack: 24, 
    dryRun: true 
  });
  setDryRunResult(result);
  setApplying(false);
};

const handleExecute = async () => {
  setApplying(true);
  const result = await applyAdActions({ 
    hoursBack: 24, 
    dryRun: false 
  });
  // Show success toast, update UI
  setApplying(false);
};

return (
  <div className="space-y-3">
    <button 
      onClick={handleDryRun} 
      disabled={applying}
      className="px-4 py-2 bg-yellow-600 rounded"
    >
      Dry Run
    </button>
    
    {dryRunResult && (
      <div className="text-sm space-y-1">
        <p>Would update {dryRunResult.campaignsUpdated} campaigns</p>
        <p>+{dryRunResult.budgetIncreases} scales, -{dryRunResult.budgetCuts} cuts</p>
        <p>Pauses: {dryRunResult.pausesApplied}</p>
        
        <button 
          onClick={handleExecute}
          className="px-4 py-2 bg-green-600 rounded"
        >
          Execute Changes
        </button>
      </div>
    )}
  </div>
);
```

---

## Logging & Audit Trail

Every action is logged:

```
[INFO] AdActionExecutor: campaign camp_freezzo_shorts_001 updated. 
       Budget $50.00 -> $70.00, status=Active

[INFO] AdActionExecutor (dry-run): campaign camp_freezzo_display_002 
       from $30.00 -> $24.00, status=Paused
```

All runs (dry or live) are timestamped in your logs. Full audit trail.

---

## Example Scenario

**Campaign:** `camp_freezzo_shorts_001`  
**Settings:** `AllowAutoBudgetAdjustments=true`, `AllowAutoPause=true`

**Bot Actions (from recent runs):**
1. Audience Intel bot: "CTR trending +23%, CPV optimal → RecommendScale 40%"
2. Analytics bot: "Watch time stable, budget efficient → RecommendScale 25%"
3. Creative Lab bot: "Impression fatigue detected → RecommendPause"

**Dry Run:**
```
POST /api/ad-actions/apply?dryRun=true
→ 3 actions found for this campaign
→ If executed: Campaign would scale 40%, then 25%, then pause
```

**Owner Decision:** "The bots are right. Pause is good call."

**Execute:**
```
POST /api/ad-actions/apply?dryRun=false
→ Campaign status: Active → Paused ✓
→ Final budget: $50 → $87.50 (after 40% + 25%)
→ But wait, if it's paused, budget doesn't matter anymore
→ → Executor pauses it, scales don't get applied
```

> Note: In a real system, you might add a flag to scale THEN pause, or pause THEN roll back. The logic here is: process all actions for a campaign, end state is what gets stored.

---

## Next Optional Enhancements

1. **Max Increase Guard** – Add `MaxDailyIncreasePercent` to AdCampaign
   ```csharp
   public int MaxDailyIncreasePercent { get; set; } = 50; // Can't scale more than 50% per day
   ```

2. **Action Confirmation** – Require explicit approval before executing
   ```csharp
   public class PendingAction
   {
       public string CampaignId { get; set; }
       public AdBotAction Action { get; set; }
       public bool Approved { get; set; } = false;
       public DateTime CreatedAt { get; set; }
   }
   ```

3. **Rollback System** – Save pre/post state, allow undo
   ```csharp
   public class ActionAuditLog
   {
       public string CampaignId { get; set; }
       public decimal BudgetBefore { get; set; }
       public decimal BudgetAfter { get; set; }
       public DateTime AppliedAt { get; set; }
       public bool CanRollback { get; set; }
   }
   ```

4. **Escalation Rules** – If scale > 30%, notify owner
   ```csharp
   if (percentChange > 30 && !owner.AutoApproveHighChanges)
       await SendPushNotification(owner, $"Bot wants to scale {campaign} by {percentChange}%");
   ```

---

## Summary

You now have **full autonomous execution**:

✅ Bots think (orchestrator)  
✅ Bots explain (actions feed)  
✅ Bots execute (action executor)  
✅ You control the rules (per-campaign flags)  
✅ You preview first (dry-run mode)  
✅ You approve (explicit execute call)  

StreamGod is no longer a recommendation engine. It's a **self-optimizing ad system**.

Set rules. Bots execute. Money scales. Campaigns improve. Artists win.

Locked in. Ready to scale.
