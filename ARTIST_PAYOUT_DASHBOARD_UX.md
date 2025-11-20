# Artist Payout Dashboard – UX Layout & Component Map
DMF-MUSIC-PLATFORM v2.0 Money Hub

---

## Overview

This document defines the **artist-facing Money Hub** – where artists see, understand, and manage their earnings from all sources. Built for:

- Google AI Studio / Lovable frontend generation
- Component-based architecture (React)
- Accessible, mobile-first design
- Real-time wallet integration

---

## Section 1: Balance & Next Payout (Hero Card)

**Route:** `/dashboard/money` (primary)

**Layout:** Full-width hero card at top

**Components:**

```
┌─────────────────────────────────────┐
│  💰 DMF MONEY HUB                   │
├─────────────────────────────────────┤
│                                     │
│  Current Balance                    │
│  $X,XXX.XX USD                      │
│                                     │
│  Next Payout                        │
│  March 15, 2026                     │
│                                     │
│  Payout Method                      │
│  Bank •••1234  [Change]             │
│                                     │
│              [Withdraw Funds]       │
│                                     │
└─────────────────────────────────────┘
```

**Fields:**

- `currentBalance`: Decimal (USD)
- `nextPayoutDate`: ISO DateTime
- `payoutMethodType`: "bank" | "paypal" | "crypto"
- `payoutMethodLast4`: String

**Buttons:**

- **Withdraw Funds** → Opens `WithdrawalModal` (requires KYC verification, amount, payout method)
- **Change Payout Method** → Routes to `/settings/payout-methods`

**Data Source:**

```
GET /api/wallets/{participantId}
{
  "walletId": "WAL-000001",
  "participantId": "PART-000001",
  "balance": 1234.56,
  "currency": "USD",
  "nextScheduledPayout": "2026-03-15T00:00:00Z",
  "payoutMethod": {
    "type": "bank",
    "last4": "1234",
    "verified": true
  }
}
```

---

## Section 2: Sources of Income (Period Toggle)

**Route:** Same page (`/dashboard/money`), below hero

**Toggle:** [Last 30 Days] [Last 90 Days] [Last Year] [Custom Range]

**Layout:** Horizontal bar chart or donut chart

**Components:**

```
Sources of Income – Last 30 Days

┌─────────────────────────────────────┐
│                                     │
│  📊 [Spotify] [Apple] [YouTube]     │
│     [TikTok]  [PRO]  [SoundEx]      │
│                                     │
│  Spotify:          $450.25    (35%) │
│  Apple Music:      $320.10    (25%) │
│  YouTube:         $280.50     (22%) │
│  TikTok/Shorts:   $100.00     (8%)  │
│  PRO (BMI/ASCAP):  $85.75     (7%)  │
│  SoundExchange:    $35.40     (3%)  │
│                                     │
│  Total Income:   $1,272.00          │
│                                     │
│  💡 Click a source to drill down     │
│                                     │
└─────────────────────────────────────┘
```

**Fields (per source):**

```json
{
  "source": "spotify",
  "displayName": "Spotify",
  "icon": "url/spotify.svg",
  "amount": 450.25,
  "percentage": 35.4,
  "currency": "USD"
}
```

**Interactive:**

- Hover → highlight segment
- Click → routes to `/dashboard/money/sources/{source}` (detail page with:
  - All recordings earning from this source
  - Historical trend (last 12 months)
  - Per-territory breakdown if DSP provides it)

**Data Source:**

```
GET /api/wallets/{participantId}/income-summary?period=30d
{
  "sources": [
    { "source": "spotify", "amount": 450.25, ... },
    { "source": "apple_music", "amount": 320.10, ... },
    ...
  ],
  "totalIncome": 1272.00,
  "currency": "USD"
}
```

---

## Section 3: Timeline (Earnings Trend)

**Route:** Same page, right side or below sources

**Layout:** Line chart (last 12 months by default)

**Components:**

```
Income Trend – Last 12 Months

┌────────────────────────────────────┐
│                                    │
│   $1200 ┤     ╭─╮                 │
│   $1000 ┤   ╭─╯ ╰─╮               │
│    $800 ┤  ╱       ╰╮             │
│    $600 ┼╱          ╰─╮           │
│    $400 ┤             ╰╮          │
│    $200 ┤               ╰─╮       │
│        └────────────────────────── │
│         J  F  M  A  M  J  J  A  S │
│                                    │
│   ● Net Paid      — In Recoupment  │
│   🧊 Disputed     🚫 Frozen        │
│                                    │
└────────────────────────────────────┘
```

**Legend:**

- **Green line** = Net paid to artist (after splits/admin fees)
- **Yellow area** = In recoupment (if advances active)
- **Red dots** = Months with disputed amounts or frozen funds
- **X-axis labels** = Month/Year

**Interactive:**

- Hover month → tooltip shows:
  - Gross amount
  - Splits taken
  - Net amount
  - Any disputes/frozen

**Data Source:**

```
GET /api/wallets/{participantId}/monthly-earnings?months=12
[
  {
    "month": "2025-02",
    "gross": 1400.00,
    "netPaid": 1200.00,
    "inRecoupment": 150.00,
    "disputed": 50.00,
    "currency": "USD"
  },
  ...
]
```

---

## Section 4: Track Breakdown (Table)

**Route:** Same page, bottom section OR `/dashboard/money/tracks`

**Layout:** Searchable, sortable table with filters

**Columns:**

| Track | Primary DSPs | Last Period | Lifetime | Status |
| --- | --- | --- | --- | --- |
| "Block Talk" | Spotify, Apple, YouTube | $450.25 | $8,230.50 | ✅ Good |
| "Another One" | Spotify, TikTok | $120.10 | $2,100.00 | ⚠️ Missing Pub |
| "Freestyle Mix" | Apple, SoundEx | $85.75 | $1,450.00 | 🧊 Disputed |

**Filters:**

- Status: [All] [Good] [Warning] [Disputed]
- DSP: [Select one or more]
- Period: [This Month] [Last 30 Days] [Last 90 Days]

**Row Click → Track Detail Page**

---

## Section 5: Track Earnings Detail (Drill-Down)

**Route:** `/dashboard/money/tracks/{trackId}`

**Hero Section:**

```
┌─────────────────────────────────────┐
│  Track: "Block Talk"                │
│  Release Date: Jan 1, 2025          │
│  ISRC: US-DMF-24-00001              │
└─────────────────────────────────────┘
```

**Income Breakdown (Last Period + All-Time tabs):**

```
Last Period Income
┌──────────────────────────────────────┐
│  Source          Income    Share %   │
├──────────────────────────────────────┤
│  Spotify        $320.10     70%      │
│  Apple Music     $80.05     17%      │
│  YouTube         $45.25     10%      │
│  PRO             $15.60      3%      │
│                                      │
│  Total Gross:   $461.00      100%    │
│  Your Share:    $230.50       50%    │
│                                      │
│  All-Time Gross: $8,230.50           │
│  Your Lifetime:  $4,115.25           │
│                                      │
└──────────────────────────────────────┘
```

**Ownership Card:**

```
Your Rights in "Block Talk"

Master Recording (Sound):
  You: 50% [View agreement]
  Label LLC: 50%

Publishing (Composition):
  You (Writer): 50% [View agreement]
  Co-Writer X: 50%
  Publisher Admin: DMF Pub Admin (100%)
    [Status: Registered with BMI]

Neighboring Rights:
  SoundExchange Status: Registered
  You (Featured): Eligible for performer royalties
```

**Monthly Trend (Table):**

```
Month     Streams   Gross    Your Net   Status
─────────────────────────────────────────────
Feb 2025  45,230   $189.63   $94.81    ✅
Jan 2025  52,100   $218.64   $109.32   ✅
Dec 2024  38,920   $163.50   $81.75    ✅
```

**Actions:**

- [Request Split Change] → Opens dispute modal
- [View Agreement] → PDFs or linked docs
- [Register with PRO] → If not done

**Data Source:**

```
GET /api/royalties/track/{trackId}?participantId=...
{
  "trackId": "TRACK-000001",
  "title": "Block Talk",
  "isrc": "US-DMF-24-00001",
  "releaseDate": "2025-01-01T00:00:00Z",
  "ownership": {
    "master": [
      { "participantId": "PART-000001", "share": 50 },
      { "participantId": "PART-000100", "share": 50 }
    ],
    "publishing": [
      { "participantId": "PART-000001", "role": "writer", "share": 50 },
      { "participantId": "PART-000002", "role": "writer", "share": 50 },
      { "participantId": "PART-000010", "role": "publisher", "share": 100 }
    ]
  },
  "incomeLastPeriod": {
    "sources": [
      { "source": "spotify", "gross": 320.10, "yourShare": 160.05 },
      ...
    ],
    "totalGross": 461.00,
    "yourNet": 230.50
  },
  "incomeAllTime": {
    "gross": 8230.50,
    "yourNet": 4115.25
  },
  "monthlyTrend": [...]
}
```

---

## Section 6: Registrations & Rights (Settings)

**Route:** `/dashboard/registrations` OR `/settings/registrations`

**Top: Status Summary Cards**

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  PRO Registration│  │  SoundExchange    │  │  Publishing Admin│
│  ✅ Registered    │  │  🟡 Pending       │  │  ⚠️ Not Set      │
│  BMI / ASCAP     │  │  Checking Status  │  │  No publisher   │
│  [View / Edit]   │  │  [View / Edit]    │  │  [Set Up]        │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐
│  Territories     │
│  🌍 Worldwide    │
│  [View Details]  │
└──────────────────┘
```

**Each Status Card – Click to expand:**

- Shows registration ID, date submitted, current status
- If pending: progress bar + "Check now" button
- If action needed: clear next-step instructions
- Link to documentation / help

**Below: Works & Splits Management Table**

```
Works & Publishing Splits

┌─────────────────────────────────────────────┐
│ Composition    Role     Your %  Status      │
├─────────────────────────────────────────────┤
│ Block Talk     Writer    50%   ✅ Confirmed│
│ Another One    Writer    40%   ⚠️ Disputed │
│ Freestyle      Producer  25%   ⚠️ Pending  │
└─────────────────────────────────────────────┘
```

**Row Click:**

Opens detail modal showing:

```
"Block Talk" – Full Rights Graph

Writer Splits (Publishing):
  You (Big Homie Cash):    50%
  Co-Writer X:             50%
  → Agreement: agr-000001.pdf
  → Status: Registered with BMI

Master Recording Splits:
  You:                     50%
  Label / Distributor:     50%
  → Agreement: agr-000002.pdf

Territories:
  WORLD

[Request Split Change / File Dispute] [View Agreements] [Edit]
```

**Data Source:**

```
GET /api/participants/{participantId}/works
[
  {
    "workId": "WORK-000001",
    "title": "Block Talk",
    "role": "writer",
    "sharePercent": 50,
    "status": "confirmed",
    "disputedAmount": null,
    "registrations": {
      "bmi": "submitted",
      "ascap": "pending"
    }
  },
  ...
]
```

---

## Section 7: Disputes & Fairness

**Route:** `/dashboard/disputes` OR `/dashboard/money/disputes`

**Layout:** Two tabs: [Open Disputes] [Resolved History]

**Open Disputes List:**

```
┌──────────────────────────────────────────────────┐
│  🧊 Split Dispute – "Another One"               │
│                                                   │
│  Issue: You say 40/60 split, co-writer says 50/50│
│  Frozen Amount: $230.50                          │
│  Initiated: Feb 1, 2025                          │
│  Last Update: Feb 8, 2025                        │
│                                                   │
│  Status: Awaiting DMF Review                     │
│  [View Details] [Add Comment] [View History]     │
│                                                   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  🔴 Missing Publishing – "Freestyle Mix"        │
│                                                   │
│  Issue: No PRO registration found for this track │
│  Frozen Amount: $85.75                           │
│  Status: Action Needed                           │
│                                                   │
│  [Register with PRO] [Dismiss]                   │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Click → Detail Page:**

```
Dispute Detail – "Another One"

Issue:
  You claim: 40% writer share
  Co-Writer X claims: 50% writer share

Your Case:
  "I wrote the chorus and bridge. Agreement was 40/60."
  [View supporting docs]

Co-Writer's Case:
  [Waiting for co-writer response]

Frozen Funds:
  $230.50 (frozen since Feb 1)
  → Will be released when resolved

Timeline:
  Feb 1  - Dispute opened
  Feb 5  - DMF sent to co-writer for response
  Feb 8  - Co-writer response received [View]

DMF Review Status: In Progress
  "Our team is evaluating agreements. ETA: Feb 15"

[Add More Evidence] [Propose Settlement] [Escalate]
```

**Data Source:**

```
GET /api/disputes?participantId=...&status=open
[
  {
    "disputeId": "DIS-000001",
    "entityType": "work",
    "entityId": "WORK-000001",
    "title": "Another One",
    "yourClaim": "40% writer",
    "opposingClaim": "50% writer",
    "frozenAmount": 230.50,
    "status": "under_review",
    "createdAt": "2025-02-01T00:00:00Z",
    "lastUpdate": "2025-02-08T00:00:00Z",
    "dmfEstimate": "2025-02-15T00:00:00Z"
  },
  ...
]
```

---

## Section 8: Advances & Offers

**Route:** `/dashboard/advances` OR `/dashboard/money/advances`

**Top: Available Advance Card**

```
┌─────────────────────────────────────────────┐
│  💵 Advance Offer                           │
│                                             │
│  Based on your last 12 months, you qualify │
│  for an ADVANCE of up to:                  │
│                                             │
│  $5,000 USD                                 │
│                                             │
│  Terms:                                     │
│  - Recoup 40% of your net royalties        │
│  - From: Master + Publishing income        │
│  - Est. payoff: 18 months                  │
│  - Fee: 2% (one-time)                      │
│                                             │
│  [See Full Terms] [Accept Advance]          │
│                                             │
└─────────────────────────────────────────────┘
```

**Active Advances Table:**

```
Active Advances

┌──────────────────────────────────────────────────┐
│ Amount  Approved  Recouped  Remaining  Est. Done │
├──────────────────────────────────────────────────┤
│ $2,000  Jan 2025  $450      $1,550     Oct 2025 │
│ $1,500  Feb 2024  $1,200    $300       May 2025 │
└──────────────────────────────────────────────────┘
```

**Row Click → Detail:**

```
Advance ADV-000001 – $2,000

Status: Active (Recouping)

Amount Received: $2,000.00
Date Received: Jan 15, 2025
Fee: 2% ($40.00)
Net Received: $1,960.00

Recoupment Progress:
  Recouped: $450.00 (22%)
  Remaining: $1,550.00
  Monthly Avg: ~$150.00
  Est. Payoff: October 2025

Terms:
  40% of net royalties from Master + Publishing
  Monthly recoupment check
  Interest: None (fixed advance)

Recent Recoupments:
  Feb 2025  $175.00  (Master royalties)
  Jan 2025  $275.00  (Master + Publishing)

[View Agreement] [Download Statement]
```

**Data Source:**

```
GET /api/advances?participantId=...
{
  "availableAdvance": {
    "amount": 5000.00,
    "currency": "USD",
    "terms": {
      "recoupPercentOfNetRoyalties": 40,
      "fromBuckets": ["master", "publishing"],
      "feePercent": 2.0,
      "estimatedPayoffMonths": 18
    }
  },
  "activeAdvances": [
    {
      "advanceId": "ADV-000001",
      "amount": 2000.00,
      "approvedDate": "2025-01-15T00:00:00Z",
      "status": "active",
      "recoupedAmount": 450.00,
      "remainingAmount": 1550.00,
      "estimatedPayoffDate": "2025-10-15T00:00:00Z"
    },
    ...
  ]
}
```

---

## Section 9: Alerts & Missing Money (Feed)

**Route:** `/dashboard/alerts` OR banner on `/dashboard/money`

**Layout:** Feed-style list (newest first) with severity indicators

```
📋 Alerts & Monitoring

🔴 [MISSING INCOME]
"Block Talk" shows 10K streams on Spotify DE in Jan,
but no royalty income reported yet. DMF is verifying
with Spotify. Usually resolves within 30 days.
[View Streams] [Open Support Ticket]

🟠 [LOW PAYMENT]
Your last SoundExchange statement seems 15% lower
than expected based on reported streams. We're
investigating with SoundExchange.
[Compare Data] [Request Explanation]

🟡 [DISPUTE FREEZE]
$230 is frozen due to the split dispute on "Another
One" (see Disputes section). Expected resolution by
Feb 15.
[View Dispute] [Check Status]

🟢 [GOOD NEWS]
Your "Block Talk" hit 1M streams in Feb!
Earnings should reflect next statement.
[View Track]

🔵 [ACTION NEEDED]
Your PRO registration for "Freestyle Mix" is pending
BMI response. You can still earn, but may receive
payments slower. Normally takes 2–4 weeks.
[Track Registration] [Contact BMI]
```

**Each Alert Card:**

- Icon + severity color
- Headline
- Plain English explanation
- Estimated timeline if applicable
- Action buttons (View, Track, Support, etc.)

**Data Source:**

```
GET /api/alerts?participantId=...&includeResolved=false
[
  {
    "alertId": "ALR-000001",
    "severity": "critical|warning|info|success",
    "type": "missing_income|low_payment|dispute|good_news|action_needed",
    "title": "Missing Income – Block Talk",
    "description": "10K streams on Spotify DE...",
    "relatedEntity": { "type": "track", "id": "TRACK-000001" },
    "estimatedResolution": "2025-02-28T00:00:00Z",
    "actions": [
      { "label": "View Details", "route": "/dashboard/..." },
      { "label": "Support", "route": "/support/..." }
    ],
    "createdAt": "2025-02-10T00:00:00Z"
  },
  ...
]
```

---

## Component Tree (React / Lovable)

```
/dashboard/money                          (Main page)
  ├── HeroCard                            (Balance + payout)
  ├── SourcesOfIncomeChart                (DSP breakdown)
  ├── EarningsTrendChart                  (Monthly trend)
  ├── TrackBreakdownTable                 (All tracks)
  ├── AlertsPreview                       (Top 3 alerts)
  └── NavTabs
      ├── /dashboard/money/tracks/{trackId}
      │   ├── TrackHero
      │   ├── IncomeBreakdown
      │   ├── OwnershipCard
      │   └── MonthlyTrendTable
      ├── /dashboard/registrations
      │   ├── StatusCards
      │   └── WorksSplitsTable
      ├── /dashboard/disputes
      │   ├── OpenDisputesList
      │   └── ResolvedHistory
      ├── /dashboard/advances
      │   ├── AvailableAdvanceCard
      │   ├── ActiveAdvancesTable
      │   └── HistoryList
      └── /dashboard/alerts
          └── AlertsFeed

Modal Components:
  ├── WithdrawalModal               (Amount, method, confirm)
  ├── DisputeDetailModal            (Full dispute timeline)
  ├── TrackDetailModal              (Ownership + income)
  └── AdvanceDetailModal            (Terms + recoupment)
```

---

## API Integration Checklist

- [ ] `GET /api/wallets/{participantId}` – Balance & payout method
- [ ] `GET /api/wallets/{participantId}/income-summary` – Sources breakdown
- [ ] `GET /api/wallets/{participantId}/monthly-earnings` – Trend data
- [ ] `GET /api/royalties/track/{trackId}` – Track ownership & earnings
- [ ] `GET /api/participants/{participantId}/works` – Works & registrations
- [ ] `GET /api/disputes?participantId=...` – Disputes list
- [ ] `GET /api/advances?participantId=...` – Advance offers & active
- [ ] `GET /api/alerts?participantId=...` – Alerts feed
- [ ] `POST /api/payouts` – Initiate withdrawal
- [ ] `POST /api/disputes` – Open new dispute
- [ ] `POST /api/advances` – Accept advance offer

---

## Design Notes

**Colors (DMF Brand):**

- Primary: `#1DB954` (Spotify-inspired green)
- Accent: `#FF6B35` (Orange/warm)
- Danger: `#E63946` (Red for disputes/frozen)
- Warning: `#F4A261` (Amber)
- Success: `#2A9D8F` (Teal)
- Neutral: `#F1FAEE` (Off-white), `#264653` (Dark)

**Typography:**

- Hero numbers: **Mono Bold** (ledger-like)
- Labels: **Sans Serif Regular**
- Actions: **Sans Serif Medium**

**Responsive:**

- Desktop: Full tables, side-by-side charts
- Tablet: Stacked sections, simplified tables
- Mobile: Cards, vertical feed, simplified charts

**Accessibility:**

- All charts include text descriptions / tables
- High contrast for financial data
- Keyboard nav for all interactive elements
- ARIA labels for status indicators

---

## Next Steps for Frontend Team

1. **Prototype** HeroCard + SourcesOfIncomeChart in Lovable / AI Studio
2. **Connect** to `/api/wallets/{participantId}` endpoint
3. **Build** TrackDetail drill-down
4. **Add** Disputes detail modal
5. **Implement** AlertsFeed
6. **Test** with sample data from Money OS database

This Money Hub is the **single source of truth** for artist earnings. When an artist logs in, they see all their money, from all sources, in one place.
