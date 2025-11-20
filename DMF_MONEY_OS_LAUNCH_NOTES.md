# DMF MONEY OS – LAUNCH NOTES v3.0

**Date:** November 19, 2025  
**Status:** 🟢 LIVE IN CONFIG / READY FOR PHASED IMPLEMENTATION

---

## What Just Happened

You now have:

1. **`DMF_MONEY_OS_BLUEPRINT.md`** – Complete financial system architecture
2. **`services.json`** – 20+ service definitions (distribution, analytics, Money OS, fraud, legal, dev)
3. **`plans.json`** – 11 pre-built plans (artists, labels, publishers, developers)
4. **This doc** – How to wire it all together

Together, these are your **Money OS v3.0 launch config**.

---

## How It Works (Quick Version)

### For Artists

Artist signs up → assigned a `planId` (e.g., `artist_pro`) → frontend reads `plans.json` → shows them exactly what features they have.

Example flow:
```
Artist uploads release
  ↓
Platform checks: "What plan are they on?"
  ↓
plans.json says: artist_pro includes dist_pro + analytics_pro + money_full + ...
  ↓
Frontend enables:
  - Pre-order button (dist_pro feature)
  - Advanced analytics tab (analytics_pro)
  - Split management (money_full)
  - Fraud alerts (shield_monitor)
  ↓
Artist gets invoiced: $59.97/month
```

### For Labels

Label onboards 50 artists → assigned `label_growth` plan → Money OS Label service activated → batch payouts every 2 weeks.

```
Label uploads 100 releases (batch)
  ↓
All artists' earnings automatically allocated to their wallets
  ↓
DMF runs RoyaltyAllocator & RoyaltyReconciliation jobs
  ↓
Label dashboard shows: "Total owed: $12,450 to 47 artists"
  ↓
One-click batch payout to bank accounts
  ↓
Artists see deposits + statements in their Money Hubs
```

### For DMF (You)

1. **Revenue model** is crystal clear: artists/labels pay monthly for features they use
2. **Feature gating** is defined: "If they're on artist_basic, no pre-orders, no fraud monitor"
3. **Upsells** are baked in: "Want advances? Upgrade to artist_pro or higher"
4. **Scaling path** is built: free → basic → pro → premium for artists; starter → growth → enterprise for labels

---

## Implementation Checklist (Phased)

### Phase 1: Config Infrastructure (This Week)

- [ ] **Backend**
  - [ ] Load `services.json` on startup → store in memory or DB
  - [ ] Load `plans.json` on startup → store in memory or DB
  - [ ] Expose endpoints:
    - [ ] `GET /config/services`
    - [ ] `GET /config/plans`
    - [ ] `GET /config/plans/{planId}`

- [ ] **Frontend**
  - [ ] Route: `/account/plan` – shows current plan + upgrade options (reads from `plans.json`)
  - [ ] Store `planId` in user session / JWT

- [ ] **Database**
  - [ ] Add `planId` field to `participants` collection
  - [ ] Add `services_enabled` array to each user (derived from `planId`)

### Phase 2: Feature Gating (Weeks 2–3)

- [ ] **Backend**
  - [ ] In DashboardController: check `planId` before allowing access to `/dashboard/owner`
  - [ ] In ReleaseController: check `planId` before allowing pre-orders (dist_pro+)
  - [ ] In AnalyticsController: check `planId` before showing advanced views (analytics_pro+)
  - [ ] In WalletController: check `planId` before showing Money OS Full features

- [ ] **Frontend**
  - [ ] Conditional rendering: Show/hide tabs & buttons based on `services_enabled`
  - [ ] Example: `{services.includes('money_full') && <SplitManager />}`
  - [ ] Upgrade prompt: "Upgrade to Artist Pro to unlock splits & advances"

### Phase 3: Money OS Ingestion (Weeks 3–4)

- [ ] **Royalty Ingestion**
  - [ ] Spotify adapter: raw CSV → `royaltyStatementsRaw` → `royaltyEvents`
  - [ ] Apple Music adapter (if available)
  - [ ] Test end-to-end: earnings appear in artist wallet within 24h

- [ ] **Wallet & Payouts**
  - [ ] One test payout to yourself (verify bank deposit works)
  - [ ] Label batch payout test (pay 5 test artists at once)

- [ ] **Money Hub UI**
  - [ ] `/dashboard/money` – shows balance, sources, timeline
  - [ ] `/dashboard/rights` – shows works, splits, registrations
  - [ ] `/dashboard/disputes` – shows open disputes (if any)
  - [ ] `/dashboard/advances` – shows offer + active advances

### Phase 4: Fairness & Integrity (Weeks 5–6)

- [ ] **Disputes**
  - [ ] Create test dispute on a work
  - [ ] Verify amount is frozen in wallet
  - [ ] Resolve dispute → amount unfrozen

- [ ] **Rights Graph Validator**
  - [ ] Ensure all splits sum to 100%
  - [ ] Flag conflicts automatically

- [ ] **Missing Money Alerts**
  - [ ] Spotify says "1000 streams" but only 1 DSP reported → alert

### Phase 5: Intelligence & Advances (Weeks 7–8)

- [ ] **Advance Offers**
  - [ ] Run AdvanceOfferEngine: "Artist earned $5K last 6 months → offer $2K advance"
  - [ ] Test: artist accepts → funds appear in wallet, recoupment starts

- [ ] **Fraud Alerts**
  - [ ] FraudAnomalyDetector flags suspicious streams
  - [ ] Artists with `shield_monitor+` see alerts in `/dashboard/alerts`

- [ ] **Reporting**
  - [ ] Monthly artist statement (PDF)
  - [ ] Label reconciliation report
  - [ ] DMF internal finance dashboard

---

## Key Data Flows

### Royalty Ingestion → Payout (Happy Path)

```
1. Spotify CSV arrives
2. RoyaltyIngestionWorker parses → royaltyStatementsRaw
3. RoyaltyNormalizer converts to standard format → royaltyEvents
4. RoyaltyAllocator uses rightsRelations + agreements
   → Splits each event by master owner, publishing owner, etc.
5. For each participant: create walletTransaction
6. Wallet balance updates
7. On payout date: batch all pending → bank ACH
8. Update payout status → "paid"
9. Artist sees in Money Hub: "✓ Payout $1,234.56 on Nov 30"
```

### Dispute Resolution

```
1. Artist A says: "I own 60%, Artist B owns 40% (not 50/50)"
2. Creates dispute on work → amount frozen
3. DMF admin reviews contract evidence
4. Updates rightsRelations: splits now 60/40
5. RightsGraphValidator confirms sums to 100%
6. Frozen amount unfrozen
7. Future payouts use new splits
8. Both artists notified
```

---

## Revenue Model (For You)

```
Artist signs up → Free tier
  ↓
Artist uploads release → Still free (basic distro)
  ↓
Artist wants pre-orders → Upgrade to artist_pro ($59.97/mo)
  ↓
Artist wants advances → artist_premium ($259.97/mo)
  ↓
Artist forms label → label_starter ($149.99/mo) or growth ($999.99/mo)
```

**Monthly Recurring Revenue (MRR) example:**
- 100 artists on artist_basic = $0 (free tier)
- 20 artists on artist_pro = $1,199.40/mo
- 5 artists on artist_premium = $1,299.85/mo
- 2 labels on label_growth = $1,999.98/mo
- **Total: ~$4,500/mo from 127 users**

At scale (1000 artists, 50 labels):
- **Est. MRR: $45K–$80K/month** (depending on upgrade %)

---

## API Payload Examples (For Lovable / Frontend)

### GET /config/plans/{planId}

**Request:**
```
GET /config/plans/artist_pro
```

**Response:**
```json
{
  "planId": "artist_pro",
  "name": "Artist – Pro",
  "monthlyPrice": 59.97,
  "includedServices": [
    "dist_pro",
    "analytics_pro",
    "money_full",
    "shield_monitor",
    "legal_templates",
    "support_email"
  ],
  "features": [
    "Upload unlimited releases...",
    "Pre-orders (30–180 days)...",
    ...
  ]
}
```

### GET /wallets/{participantId}

**Response:**
```json
{
  "walletId": "WAL-000001",
  "participantId": "PART-000001",
  "balance": 1234.56,
  "currency": "USD",
  "lastUpdatedAt": "2025-11-19T14:32:10Z",
  "nextPayoutDate": "2025-12-05T00:00:00Z",
  "nextPayoutMethod": "bank",
  "nextPayoutBankAccountId": "bank_••••1234"
}
```

### GET /wallets/{participantId}/transactions

**Response:**
```json
[
  {
    "type": "royalty_credit",
    "amount": 0.0021,
    "currency": "USD",
    "description": "Spotify stream – Block Talk – REC-000001",
    "sourceEventId": "REV-000001",
    "createdAt": "2025-11-18T10:22:05Z"
  },
  {
    "type": "payout",
    "amount": -1234.56,
    "currency": "USD",
    "description": "Payout to Bank •••1234",
    "status": "completed",
    "createdAt": "2025-11-15T09:00:00Z"
  }
]
```

### GET /royalties/events?participantId=PART-000001

**Response:**
```json
[
  {
    "eventId": "REV-000001",
    "source": "spotify",
    "territory": "US",
    "grossAmount": 0.0042,
    "allocatedSplits": [
      {
        "participantId": "PART-000001",
        "rightType": "master",
        "sharePercent": 50,
        "amount": 0.0021
      },
      {
        "participantId": "PART-000100",
        "rightType": "master",
        "sharePercent": 50,
        "amount": 0.0021
      }
    ],
    "status": "posted_to_wallet",
    "statementDate": "2025-11-01T00:00:00Z"
  }
]
```

---

## What's NOT Included Yet (Phase 2–3)

- [ ] PRO registration integrations (BMI, ASCAP, MLC APIs)
- [ ] SoundExchange neighboring rights automation
- [ ] Real advance ML model (using placeholder offer logic)
- [ ] Tax & 1099 automation
- [ ] Multi-currency wallets + currency conversion
- [ ] Subscription billing (Stripe integration)

These come in **v3.1, v3.2, etc.** based on demand.

---

## Testing v3.0 Locally

### Setup

```bash
# 1. Load services.json & plans.json into MongoDB
mongosh dmf_music_platform
db.services.insertMany(require('services.json').services)
db.plans.insertMany(require('plans.json').plans)

# 2. Update a test artist with planId
db.participants.updateOne(
  { username: "bigho" },
  { $set: { planId: "artist_pro" } }
)

# 3. Start backend
dotnet run

# 4. Test endpoints
curl http://localhost:5000/config/plans/artist_pro
curl http://localhost:5000/wallets/PART-000001
```

### Frontend Test Flow

```
1. Log in as artist_pro user
2. Navigate to /account/plan → see "Artist Pro" with features listed
3. Navigate to /dashboard/money → see wallet balance
4. Try to create pre-order → button enabled (dist_pro included)
5. Try to access split manager → button enabled (money_full included)
6. Try to access fraud alerts → button enabled (shield_monitor included)
7. Try to access /admin route → 403 Forbidden (not admin role)
```

---

## Next Steps (Your Call)

1. **Immediate:** Drop `services.json` & `plans.json` into your backend config loader
2. **This week:** Wire up `/config/plans`, `/config/services` endpoints
3. **Next week:** Add `planId` field to users, implement feature gating
4. **Week 3:** First royalty ingestion end-to-end test
5. **Week 4:** Beta launch to 5 real artists (from your onboarding runbook)

---

## You're Now a Fintech Platform

Seriously. You have:

- ✅ Multi-tier pricing model
- ✅ Feature gating architecture
- ✅ Wallet + payout infrastructure (blueprinted)
- ✅ Rights graph + fairness system
- ✅ Revenue per user defined

**Next: Make the money actually flow.**

---

**Version:** v3.0  
**Status:** 🟢 READY TO IMPLEMENT  
**Questions?** Reference `DMF_MONEY_OS_BLUEPRINT.md` for deep dives.
