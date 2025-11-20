# DMF MONEY OS – SYSTEM BLUEPRINT
DMF Records / StreamGod AI

## 0. Mission

DMF Money OS is the financial spine of the DMF-MUSIC-PLATFORM.

**Goal:**  
Turn the completely broken, multi-angle payout system in the music industry into:

- One **rights graph**
- One **money OS**
- One **artist-facing wallet**
- One **truth source** for who owns what, who gets what, and why

DMF's model: **We fix what's broken.**

---

## 1. High-Level Architecture

Four stacked layers:

1. **Identity & Rights Graph**
   - Who are the people? (artists, writers, producers, labels, publishers)
   - What are the assets? (works/compositions, recordings/masters)
   - Who owns what % where? (splits, territories, deals, agreements)

2. **Ingestion & Normalization**
   - Ingest raw royalty statements from:
     - DSPs (Spotify, Apple, YouTube, TikTok, etc.)
     - PROs (BMI, ASCAP, SESAC, etc.)
     - SoundExchange / neighboring-rights societies
     - Publishers / MLC / mechanical societies
   - Normalize all inputs into one internal format.

3. **Wallet, Payout & Fairness**
   - DMF Wallet per participant
   - Payout engine supporting bank / PayPal / etc.
   - Dispute management, frozen amounts, audit trails

4. **StreamGod Intelligence**
   - Reconciliation: expected vs actual
   - Missing-money detection
   - Fraud / anomaly flags (Anti-Bot Shield integration)
   - Advance offers & financial products
   - Reporting & dashboards

---

## 2. Data Model (MongoDB Collections)

### 2.1 `participants`

**Purpose:**  
All DMF actors in one place: artists, writers, producers, labels, publishers, admins.

**Example fields:**

```json
{
  "_id": ObjectId("..."),
  "dmfParticipantId": "PART-000001",
  "type": ["artist", "writer", "producer"],
  "legalName": "DeAngelo A. Jackson",
  "stageName": "Big Homie Cash",
  "email": "bighomiecash8346@gmail.com",
  "country": "US",
  "taxInfo": {
    "tinType": "SSN",
    "last4": "1234"
  },
  "externalIds": {
    "bmiWriterId": "BMI123456",
    "ascapIpi": "IPI123456789",
    "soundExchangePerformerId": "SX999999",
    "spotifyArtistId": "spotify:artist:...",
    "appleArtistId": "..."
  },
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```

---

### 2.2 `works` (compositions)

**Purpose:**
Song as an idea – writers, publishers, PRO/MLC status.

```json
{
  "_id": ObjectId("..."),
  "dmfWorkId": "WORK-000001",
  "title": "Block Talk",
  "iswc": "T-123.456.789-Z",
  "participants": [
    { "participantId": "PART-000001", "role": "writer", "sharePercent": 50 },
    { "participantId": "PART-000002", "role": "writer", "sharePercent": 50 }
  ],
  "publisherShares": [
    { "participantId": "PART-000010", "role": "publisher", "sharePercent": 100 }
  ],
  "territoryRules": [
    { "territory": "WORLD", "adminParticipantId": "PART-000010" }
  ],
  "registrationStatus": {
    "bmi": "submitted",
    "ascap": "not_applicable",
    "mlc": "pending",
    "otherSocieties": []
  },
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```

---

### 2.3 `recordings` (masters)

**Purpose:**
Sound recording layer tied to works.

```json
{
  "_id": ObjectId("..."),
  "dmfRecordingId": "REC-000001",
  "workId": "WORK-000001",
  "isrc": "US-DMF-24-00001",
  "upc": "123456789012",
  "title": "Block Talk",
  "version": "Original",
  "primaryArtistId": "PART-000001",
  "featuredParticipants": [
    { "participantId": "PART-000003", "role": "featured_artist" }
  ],
  "masterOwners": [
    { "participantId": "PART-000001", "sharePercent": 50 },
    { "participantId": "PART-000100", "sharePercent": 50 }
  ],
  "neighboringRights": {
    "soundRecordingOwnerId": "PART-000100",
    "performers": [
      { "participantId": "PART-000001", "role": "featured" }
    ],
    "registrationStatus": {
      "soundExchange": "submitted"
    }
  },
  "release": {
    "releaseId": "REL-000001",
    "releaseDate": ISODate("2025-01-01T00:00:00Z"),
    "territories": ["WORLD"]
  },
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```

---

### 2.4 `societies`

**Purpose:**
BMI / ASCAP / SESAC / MLC / SoundExchange / foreign CMOs.

```json
{
  "_id": ObjectId("..."),
  "code": "BMI",
  "name": "Broadcast Music, Inc.",
  "type": "PRO",
  "country": "US",
  "apiConfig": {
    "hasApi": false,
    "ingestionMethod": "csv_upload"
  }
}
```

---

### 2.5 `rightsRelations`

**Purpose:**
Edges of the rights graph: who owns what, when, and where.

```json
{
  "_id": ObjectId("..."),
  "entityType": "work",
  "entityId": "WORK-000001",
  "rightType": "publishing",
  "participantId": "PART-000001",
  "role": "writer",
  "sharePercent": 50,
  "territory": "WORLD",
  "effectiveFrom": ISODate("2024-01-01T00:00:00Z"),
  "effectiveTo": null,
  "sourceAgreementId": "AGR-000001",
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```

---

### 2.6 `agreements`

**Purpose:**
Contracts, deals, split agreements.

```json
{
  "_id": ObjectId("..."),
  "agreementId": "AGR-000001",
  "type": "master_split",
  "parties": [
    { "participantId": "PART-000001", "role": "artist" },
    { "participantId": "PART-000100", "role": "label" }
  ],
  "appliesTo": {
    "scope": "recording",
    "recordingIds": ["REC-000001"]
  },
  "terms": {
    "artistSharePercent": 50,
    "labelSharePercent": 50,
    "recoupable": true,
    "recoupmentBucket": "master"
  },
  "documents": [
    { "fileId": "file://agreements/AGR-000001.pdf", "version": 1 }
  ],
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```

---

### 2.7 `royaltyStatementsRaw`

**Purpose:**
Registry of incoming statements (files / API payloads) before parsing.

```json
{
  "_id": ObjectId("..."),
  "source": "spotify",
  "periodStart": ISODate("2025-01-01T00:00:00Z"),
  "periodEnd": ISODate("2025-01-31T23:59:59Z"),
  "fileLocation": "s3://dmf-royalties/raw/spotify/2025-01.csv",
  "status": "pending",
  "ingestedAt": null,
  "errors": []
}
```

---

### 2.8 `royaltyEvents`

**Purpose:**
Normalized royalty line items – the money rows.

```json
{
  "_id": ObjectId("..."),
  "normalizedId": "REV-000001",
  "source": "spotify",
  "statementId": ObjectId("..."),
  "dmfRecordingId": "REC-000001",
  "dmfWorkId": "WORK-000001",
  "territory": "US",
  "usageType": "stream",
  "units": 1,
  "grossAmount": 0.0042,
  "currency": "USD",
  "statementDate": ISODate("2025-01-31T00:00:00Z"),
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
  "status": "allocated",
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```

---

### 2.9 `wallets` and `walletTransactions`

```json
{
  "_id": ObjectId("..."),
  "walletId": "WAL-000001",
  "participantId": "PART-000001",
  "currency": "USD",
  "balance": 1234.56,
  "lastUpdatedAt": ISODate()
}
```

```json
{
  "_id": ObjectId("..."),
  "walletId": "WAL-000001",
  "type": "royalty_credit",
  "amount": 0.0021,
  "currency": "USD",
  "sourceEventId": "REV-000001",
  "description": "Spotify stream – REC-000001 – Jan 2025",
  "createdAt": ISODate()
}
```

---

### 2.10 `disputes` and `splitChangeRequests`

```json
{
  "_id": ObjectId("..."),
  "disputeId": "DIS-000001",
  "entityType": "work",
  "entityId": "WORK-000001",
  "initiatorId": "PART-000002",
  "reason": "Writer split should be 60/40 not 50/50",
  "status": "open",
  "frozenAmount": 120.50,
  "notes": [],
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```

---

### 2.11 `advances`

```json
{
  "_id": ObjectId("..."),
  "advanceId": "ADV-000001",
  "participantId": "PART-000001",
  "amount": 2000,
  "currency": "USD",
  "approvedBy": "PART-ADMIN-001",
  "status": "active",
  "recoupmentRules": {
    "recoupPercentOfNetRoyalties": 40,
    "fromBuckets": ["master", "publishing"]
  },
  "recoupedAmount": 250.50,
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```

---

## 3. Core API Endpoints

### Identity & Rights

* `POST /api/participants` – create artist/writer/producer/label/publisher
* `GET /api/participants/{id}`
* `POST /api/works` – register a composition
* `POST /api/recordings` – register a master
* `POST /api/rights/relations` – add/update rights edge
* `GET /api/rights/graph/{entityId}` – full rights graph for work/recording

### Registrations

* `POST /api/registrations/pro` – start/track PRO registration (BMI/ASCAP/etc.)
* `POST /api/registrations/soundexchange` – register recordings/performers
* `GET /api/registrations/status?participantId=...`

### Royalty Ingestion

* `POST /api/royalties/statements` – upload/link raw statement
* `POST /api/royalties/statements/{id}/process` – parse + normalize → `royaltyEvents`
* `GET /api/royalties/events?participantId=...`

### Wallet & Payout

* `GET /api/wallets/{participantId}`
* `GET /api/wallets/{participantId}/transactions`
* `POST /api/payouts` – request payout
* `GET /api/payouts/{id}`

### Disputes & Fairness

* `POST /api/disputes`
* `PATCH /api/disputes/{id}`
* `POST /api/splits/change-requests`

### Advances

* `GET /api/advances/offers?participantId=...`
* `POST /api/advances`
* `GET /api/advances/{id}`

---

## 4. StreamGod Background Jobs

1. **RightsGraphValidator**

   * Ensures splits sum to 100%.
   * Flags conflicts and opens disputes automatically.

2. **RoyaltyIngestionWorker**

   * Watches `royaltyStatementsRaw`.
   * Parses files into normalized `royaltyEvents`.

3. **RoyaltyAllocator**

   * Uses `rightsRelations` + `agreements` to break each `royaltyEvent` into parties.
   * Writes `walletTransactions` for each participant.

4. **ReconciliationEngine**

   * Compares expected income vs actual (usage vs reported royalties).
   * Creates "missing money" alerts.

5. **FraudAnomalyDetector**

   * Detects suspicious usage patterns (territory / device / platform).
   * Integrates with DMF Anti-Bot & Authenticity Shield.

6. **DisputeManager**

   * Freezes portions of funds when disputes are open.
   * Tracks resolution state and unfreezes when resolved.

7. **AdvanceOfferEngine**

   * Projects future royalties.
   * Creates advance offers with safe caps and recoupment rules.

8. **ReportingExporter**

   * Generates:
     * Artist-facing statements
     * DMF internal finance reports
     * Investor summaries

---

## 5. Build Phases

**Phase 1 – Rights Graph Core**

* Implement `participants`, `works`, `recordings`, `rightsRelations`, `agreements`.
* Admin UI for DMF team to encode real catalog.

**Phase 2 – Ingestion & Normalization**

* Implement `royaltyStatementsRaw`, `royaltyEvents`.
* Build first adapters: Spotify, Apple, YouTube.

**Phase 3 – Wallet & One-Channel Payout**

* `wallets`, `walletTransactions`, `payouts`.
* `RoyaltyAllocator` service.

**Phase 4 – Fairness & Disputes**

* `disputes`, `splitChangeRequests`.
* Freeze logic + DisputeManager job.

**Phase 5 – Advances & Intelligence**

* `advances`, AdvanceOfferEngine, ReconciliationEngine, FraudAnomalyDetector.
* ReportingExporter + dashboards.

DMF Money OS is now the **financial brain & heart** of DMF-MUSIC-PLATFORM.
