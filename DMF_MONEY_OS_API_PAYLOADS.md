# DMF MONEY OS – API PAYLOAD EXAMPLES

Date: 2025-11-19  
Purpose: Frontend integration reference — exact response shapes for Money Hub UI

---

## Money Hub – `/api/money/hub/:participantId`

**Purpose:** Power the main "Money Hub" dashboard.

```json
{
  "participantId": "PART-000001",
  "currency": "USD",
  "wallet": {
    "walletId": "WAL-000001",
    "balance": 2387.42,
    "nextPayoutDate": "2025-12-15",
    "defaultPayoutMethod": {
      "type": "bank_transfer",
      "label": "Chase ••••1234"
    }
  },
  "summary": {
    "period": "last_30_days",
    "totalIncome": 842.17,
    "totalPayouts": 500.0
  },
  "incomeBySource": [
    { "source": "spotify", "label": "Spotify", "amount": 320.55 },
    { "source": "apple_music", "label": "Apple Music", "amount": 210.25 },
    { "source": "youtube", "label": "YouTube / Content ID", "amount": 111.37 },
    { "source": "tiktok", "label": "TikTok / IG / Shorts", "amount": 54.00 },
    { "source": "pro", "label": "PRO (BMI/ASCAP/etc.)", "amount": 89.00 },
    { "source": "soundexchange", "label": "SoundExchange", "amount": 57.00 }
  ],
  "timeline": {
    "granularity": "month",
    "points": [
      { "period": "2025-07", "totalIncome": 600.12, "netPaid": 450.00, "inRecoupment": 50.0 },
      { "period": "2025-08", "totalIncome": 780.34, "netPaid": 500.00, "inRecoupment": 80.0 },
      { "period": "2025-09", "totalIncome": 910.45, "netPaid": 620.00, "inRecoupment": 90.0 }
    ]
  },
  "topTracks": [
    {
      "recordingId": "REC-000001",
      "title": "Block Talk",
      "primaryArtist": "Big Homie Cash",
      "lastPeriodIncome": 312.11,
      "lifetimeIncome": 3210.45,
      "status": "ok"
    },
    {
      "recordingId": "REC-000010",
      "title": "Cold Summers",
      "primaryArtist": "Freezzo",
      "lastPeriodIncome": 154.22,
      "lifetimeIncome": 1102.33,
      "status": "missing_publishing"
    }
  ],
  "flags": {
    "hasActiveDisputes": true,
    "hasMissingRegistrations": true,
    "hasAdvanceOffers": true
  }
}
```

**Status codes:**
- `"ok"` – earning normally, all data present
- `"missing_publishing"` – publishing share not yet registered
- `"disputed"` – open dispute on this track

---

## Track Earnings Detail – `/api/money/track/:recordingId?participantId=...`

**Purpose:** Power the modal/page when user clicks a track.

```json
{
  "recordingId": "REC-000001",
  "title": "Block Talk",
  "version": "Original",
  "primaryArtist": "Big Homie Cash",
  "yourRoles": ["artist", "writer"],
  "yourOwnership": {
    "masterSharePercent": 50,
    "publishingSharePercent": 50
  },
  "lifetimeIncome": {
    "currency": "USD",
    "total": 3210.45,
    "byRightType": [
      { "rightType": "master", "amount": 2600.32 },
      { "rightType": "publishing", "amount": 610.13 }
    ],
    "bySource": [
      { "source": "spotify", "amount": 1500.10 },
      { "source": "apple_music", "amount": 820.35 },
      { "source": "youtube", "amount": 360.00 },
      { "source": "pro", "amount": 350.00 },
      { "source": "soundexchange", "amount": 180.00 }
    ]
  },
  "lastPeriodIncome": {
    "periodStart": "2025-10-01",
    "periodEnd": "2025-10-31",
    "total": 312.11,
    "bySource": [
      { "source": "spotify", "amount": 160.20 },
      { "source": "apple_music", "amount": 82.50 },
      { "source": "youtube", "amount": 30.41 },
      { "source": "pro", "amount": 21.00 },
      { "source": "soundexchange", "amount": 18.00 }
    ]
  },
  "participants": [
    {
      "participantId": "PART-000001",
      "name": "Big Homie Cash",
      "roles": ["artist", "writer"],
      "masterSharePercent": 50,
      "publishingSharePercent": 50
    },
    {
      "participantId": "PART-000100",
      "name": "DMF Records",
      "roles": ["label"],
      "masterSharePercent": 50,
      "publishingSharePercent": 0
    }
  ],
  "status": {
    "splitStatus": "confirmed",
    "registrationStatus": {
      "pro": "registered",
      "soundexchange": "registered",
      "mlc": "pending"
    }
  }
}
```

---

## Rights & Registrations – `/api/money/rights/:participantId`

**Purpose:** Drives Registrations & Rights page.

```json
{
  "participantId": "PART-000001",
  "proProfile": {
    "selectedPro": "BMI",
    "status": "registered",
    "writerNumber": "BMI123456"
  },
  "soundExchangeProfile": {
    "status": "registered",
    "performerId": "SX999999"
  },
  "publishingAdmin": {
    "status": "active",
    "adminEntity": "DMF Publishing Admin"
  },
  "coverage": {
    "territories": ["WORLD"],
    "notes": "Worldwide admin via DMF."
  },
  "worksSummary": [
    {
      "workId": "WORK-000001",
      "title": "Block Talk",
      "role": "writer",
      "yourSharePercent": 50,
      "splitStatus": "confirmed",
      "registrationStatus": {
        "pro": "registered",
        "mlc": "pending"
      }
    },
    {
      "workId": "WORK-000010",
      "title": "Cold Summers",
      "role": "writer",
      "yourSharePercent": 33.33,
      "splitStatus": "disputed",
      "registrationStatus": {
        "pro": "pending",
        "mlc": "not_registered"
      }
    }
  ]
}
```

---

## Disputes – `/api/money/disputes/:participantId`

**Purpose:** Display all open and resolved disputes.

```json
{
  "participantId": "PART-000001",
  "openDisputes": [
    {
      "disputeId": "DIS-000001",
      "entityType": "work",
      "entityId": "WORK-000010",
      "title": "Cold Summers",
      "reason": "Writer split should be 50/25/25 not 33/33/33",
      "status": "in_review",
      "frozenAmount": 120.50,
      "openedAt": "2025-10-01T12:00:00Z",
      "lastUpdateAt": "2025-10-05T09:30:00Z"
    }
  ],
  "resolvedDisputes": [
    {
      "disputeId": "DIS-0000002",
      "entityType": "recording",
      "entityId": "REC-000005",
      "title": "Late Night Run",
      "status": "resolved",
      "resolvedAt": "2025-08-10T15:00:00Z"
    }
  ]
}
```

---

## Advances – `/api/money/advances/:participantId`

**Purpose:** Show advance offers, active advances, and recoupment status.

```json
{
  "participantId": "PART-000001",
  "offers": [
    {
      "advanceId": "ADV-OFFER-001",
      "amount": 2500,
      "currency": "USD",
      "status": "offered",
      "validUntil": "2025-12-31",
      "recoupmentRules": {
        "recoupPercentOfNetRoyalties": 40,
        "fromBuckets": ["master", "publishing"],
        "estimatedPayoffMonths": 12
      }
    }
  ],
  "active": [
    {
      "advanceId": "ADV-000001",
      "amount": 2000,
      "currency": "USD",
      "status": "active",
      "recoupedAmount": 310.75,
      "remainingToRecoup": 1689.25,
      "recoupmentRules": {
        "recoupPercentOfNetRoyalties": 30,
        "fromBuckets": ["master"]
      },
      "startedAt": "2025-07-01",
      "estimatedPayoffDate": "2026-05-15"
    }
  ],
  "history": []
}
```

---

## Alerts – `/api/money/alerts/:participantId`

**Purpose:** Warn users about missing money, fraud risk, and data integrity issues.

```json
{
  "participantId": "PART-000001",
  "alerts": [
    {
      "alertId": "ALERT-000001",
      "type": "missing_money",
      "severity": "high",
      "title": "Publishing income missing for 'Cold Summers' in Germany",
      "message": "We detected streams in Germany but no corresponding PRO income. DMF is preparing a claim.",
      "entityType": "work",
      "entityId": "WORK-000010",
      "createdAt": "2025-11-10T10:00:00Z",
      "status": "open"
    },
    {
      "alertId": "ALERT-000002",
      "type": "fraud_risk",
      "severity": "medium",
      "title": "Suspicious spike on 'Block Talk' in Country X",
      "message": "Unusual stream pattern detected. We are flagging this traffic and may exclude it from payouts if confirmed.",
      "entityType": "recording",
      "entityId": "REC-000001",
      "createdAt": "2025-11-11T14:30:00Z",
      "status": "investigating"
    }
  ]
}
```

**Alert types:**
- `"missing_money"` – Expected income not received from DSP/PRO
- `"fraud_risk"` – Suspicious activity detected
- `"data_integrity"` – Mismatch between participants and splits
- `"registration_gap"` – Work registered at PRO but not at MLC, etc.

---

## Current Plan – `/api/account/plan/:participantId`

**Purpose:** Show current plan and available upgrades.

```json
{
  "participantId": "PART-000001",
  "currentPlan": {
    "id": "artist_pro",
    "label": "Artist Pro",
    "monthlyPrice": 49,
    "currency": "USD",
    "services": {
      "distribution": "dist_pro",
      "analytics": "analytics_pro",
      "money_os": "money_full",
      "fraud_shield": "shield_monitor",
      "legal": "legal_templates"
    }
  },
  "availableUpgrades": [
    {
      "id": "label_starter",
      "label": "Label Starter",
      "monthlyPrice": 149,
      "customerType": "label"
    }
  ]
}
```

---

## Integration Checklist

- [ ] All routes return appropriate HTTP status (200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error)
- [ ] All amounts are numeric (never strings)
- [ ] All dates are ISO 8601 format
- [ ] Frontend handles missing fields gracefully (e.g., if no disputes, `openDisputes: []`)
- [ ] JwtAuthenticationService validates token before any endpoint is called
- [ ] participantId in request matches JWT claims (prevent artist from seeing another artist's data)
- [ ] Lovable/Google AI components can parse and display all payloads
- [ ] Load testing includes these endpoints at realistic RPS (requests per second)

---

## Notes

1. **Money Hub is the MVP**: Get `/api/money/hub/:participantId` and the Money Hub React component working first. Everything else flows from there.

2. **Frozen amounts**: When a dispute is open, that money is frozen. Don't show it in the available balance until resolved.

3. **Status enums**: Use these exact string values so frontend doesn't break:
   - Dispute status: `"offered"`, `"in_review"`, `"resolved"`, `"rejected"`
   - Registration status: `"not_registered"`, `"pending"`, `"registered"`
   - Alert status: `"open"`, `"investigating"`, `"resolved"`

4. **Scale**: These payloads are designed to handle:
   - 500+ tracks per artist
   - 100+ participants per track (rare, but supported)
   - 5+ years of history (lifetime income)

---

End of API Payload Reference.
