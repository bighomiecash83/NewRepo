# DMF MONEY OS – LAUNCH NOTES (V1)

Date: 2025-11-19  
Owner: DMF Records / StreamGod AI (Big Homie Cash)

---

## 1. What DMF Money OS Is

DMF Money OS is the **financial core** of the DMF-MUSIC-PLATFORM.

It is designed to fix what's broken in the music industry:

- Too many angles and dashboards to get paid
- Confusing ownership and splits
- Missing money from PROs, SoundExchange, and foreign royalties
- No transparent way to handle disputes and advances

DMF Money OS turns that into:

- One **rights graph**
- One **wallet** per participant
- One **payout channel**
- One **truth source** for "who owns what and who gets what"

---

## 2. What's Included in V1 (Design-Complete)

The following are fully defined and ready for implementation:

1. **Data Model (MongoDB)**
   - `participants` – artists, writers, producers, labels, publishers
   - `works` – compositions and writer/publisher shares
   - `recordings` – masters and neighboring rights
   - `societies` – BMI/ASCAP/SESAC/MLC/SoundExchange/etc.
   - `rightsRelations` – edges of the rights graph (who owns what, how much, where)
   - `agreements` – contracts and split agreements
   - `royaltyStatementsRaw` – incoming DSP/PRO/SE statements before parsing
   - `royaltyEvents` – normalized money rows
   - `wallets` & `walletTransactions` – balances and movements per participant
   - `disputes` & `splitChangeRequests` – fairness and conflict handling
   - `advances` – catalog-based advance offers and recoupment rules

2. **Key API Surfaces**
   - Identity & Rights
     - `POST /participants`
     - `POST /works`, `POST /recordings`
     - `GET /rights/graph/{entityId}`
   - Registrations
     - `POST /registrations/pro`
     - `POST /registrations/soundexchange`
     - `GET /registrations/status`
   - Royalty Ingestion
     - `POST /royalties/statements`
     - `POST /royalties/statements/{id}/process`
   - Wallet & Payout
     - `GET /wallets/{participantId}`
     - `GET /wallets/{participantId}/transactions`
     - `POST /payouts`
   - Disputes & Advances
     - `POST /disputes`
     - `GET /disputes/{participantId}`
     - `GET /advances/{participantId}`

3. **StreamGod Background Jobs**
   - `RightsGraphValidator`
   - `RoyaltyIngestionWorker`
   - `RoyaltyAllocator`
   - `ReconciliationEngine`
   - `FraudAnomalyDetector`
   - `DisputeManager`
   - `AdvanceOfferEngine`
   - `ReportingExporter`

4. **Service & Plan Config (JSON)**
   - `services.json`
     - Distribution, Analytics, Money OS, Anti-Bot Shield, Gavel Syndicate, Development/Media
   - `plans.json`
     - Artist Basic, Artist Pro, Label Starter, Label Growth

5. **Frontend API Payloads**
   - Money Hub: `/api/money/hub/:participantId`
   - Track Earnings Detail: `/api/money/track/:recordingId`
   - Rights & Registrations: `/api/money/rights/:participantId`
   - Disputes: `/api/money/disputes/:participantId`
   - Advances: `/api/money/advances/:participantId`
   - Alerts: `/api/money/alerts/:participantId`
   - Plan & entitlements: `/api/account/plan/:participantId`

---

## 3. V1 Implementation Targets

For DMF to call Money OS "live" for internal use on DMF's own catalog:

1. **Rights Graph Online**
   - [ ] Migrate DMF catalog (62+ tracks) into:
     - `participants`, `works`, `recordings`, `rightsRelations`, `agreements`
   - [ ] RightsGraphValidator passing (splits sum to 100%)

2. **First Ingestion Path**
   - [ ] Add one DSP ingestion adapter (e.g., Spotify CSV)
   - [ ] Prove: CSV → `royaltyStatementsRaw` → `royaltyEvents` → `walletTransactions`
   - [ ] Money Hub shows correct balances for at least one DMF artist profile

3. **Wallet & Payout**
   - [ ] One wallet per core DMF artist
   - [ ] Payout request endpoint functional (manual approval is OK in V1)
   - [ ] Basic artist-facing Money Hub view wired to backend

4. **Fairness & Disputes**
   - [ ] Ability to open a dispute on a work/recording
   - [ ] Frozen amounts reflected in wallet / Money Hub
   - [ ] Basic internal DisputeManager workflow in place

5. **Internal Use Only in V1**
   - V1 is for:
     - DMF Records' own catalog
     - Internal testing and screenshots
   - External clients/tenants can be onboarded after stability and QA

---

## 4. How to Talk About This (Internal & Investors)

**Internal (DMF team):**

> "Money OS is our internal bank + rights brain. If a penny touches DMF, it runs through Money OS so we know who owns it, who should get it, and why."

**Artists:**

> "Everyone else pays you for one slice of your rights. We built a system that chases every piece of the pie – masters, publishing, neighboring rights – and puts it in one wallet with plain-English explanations."

**Investors:**

> "We're not trying to beat DistroKid. We're building the kind of internal money infrastructure that Universal or Sony would build today if they started from scratch, and then we're selling it to serious independents and labels as a product."

---

## 5. Next Phases (Post-V1)

- Add more ingestion adapters (Apple, YouTube, PROs, SoundExchange)
- Expand fraud logic and deeper Anti-Bot Shield integration
- Productize advances and financial tools
- Multi-tenant label/enterprise workflows

DMF Money OS is the **foundation** for everything else DMF builds.

---

## 6. How It Works (Quick Version)

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

## 7. Implementation Checklist (Phased)

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

## 8. Key Data Flows

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

## 9. Revenue Model (For You)

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

## 10. API Payload Examples (For Lovable / Frontend)

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

## 11. What's NOT Included Yet (Phase 2–3)

- [ ] PRO registration integrations (BMI, ASCAP, MLC APIs)
- [ ] SoundExchange neighboring rights automation
- [ ] Real advance ML model (using placeholder offer logic)
- [ ] Tax & 1099 automation
- [ ] Multi-currency wallets + currency conversion
- [ ] Subscription billing (Stripe integration)

These come in **v3.1, v3.2, etc.** based on demand.

---

## 12. Testing v3.0 Locally

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

## 13. You're Now a Fintech Platform

Seriously. You have:

- ✅ Multi-tier pricing model (11 plans, 20+ services)
- ✅ Feature gating architecture (planId + services_enabled)
- ✅ Wallet + payout infrastructure (blueprinted)
- ✅ Rights graph + fairness system (disputes, frozen amounts)
- ✅ Revenue per user defined ($0–$4,999.99/mo)
- ✅ Security layer locked (JWT + role-based access + artist isolation)
- ✅ Operational procedures documented (4 runbooks)

**Next: Make the money actually flow.**

Implementation roadmap: **8 weeks, 5 phases, zero planning left.**

---

**Version:** v1.0  
**Status:** 🟢 READY TO IMPLEMENT  
**Reference:** `DMF_MONEY_OS_API_PAYLOADS.md` for frontend integration shapes
