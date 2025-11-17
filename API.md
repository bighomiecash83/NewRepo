# DMF-MUSIC-PLATFORM API (Core Endpoints)

**Version:** 1.0.0  
**Status:** Pre-Launch Locked  
**Last Updated:** November 16, 2025

---

## Overview

This API powers the DMF Music Platform distributor workflow and payout engine. All endpoints are **production-ready** and locked in before launch. Post-launch development happens **inside the app** via Ryia Bot + App Builder.

---

## Base URL

```
http://localhost:5183/api
https://<your-domain>/api
```

---

## Authentication

Currently: **None (MVP stage)**  
Pre-Production: Add JWT bearer token validation

---

## Distributor API

### 1. POST /distributor/release/quote

Get pricing quote for a new release.

**Request:**
```json
{
  "releaseType": 0,
  "trackCount": 10,
  "payoutTierCode": "indie_basic"
}
```

**ReleaseType Enum:**
- `0` = Single
- `1` = EP
- `2` = Album
- `3` = Mixtape

**Response (200 OK):**
```json
{
  "releaseType": 0,
  "trackCount": 10,
  "price": 9.99,
  "currency": "USD",
  "artistSharePercent": 90.0,
  "dmfSharePercent": 10.0,
  "labelSharePercent": 0.0
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Invalid release type or track count"
}
```

---

### 2. POST /distributor/payout/quote

Calculate artist/DMF/label payout splits for projected revenue.

**Request:**
```json
{
  "tierCode": "growth_partner",
  "projectedRevenue": 10000.0
}
```

**Payout Tier Codes:**
- `indie_basic` — 90/10 Artist/DMF split
- `indie_plus` — 85/15 Artist/DMF split
- `growth_partner` — 70/30 Artist/DMF split (DMF invests)
- `label_white_label` — 50/50 DMF/Label split (labels pay; artists don't)

**Response (200 OK):**
```json
{
  "tierCode": "growth_partner",
  "projectedRevenue": 10000.0,
  "artistAmount": 7000.0,
  "dmfAmount": 3000.0,
  "labelAmount": null,
  "artistSharePercent": 70.0,
  "dmfSharePercent": 30.0,
  "labelSharePercent": null
}
```

**Example (Label White Label):**
```json
{
  "tierCode": "label_white_label",
  "projectedRevenue": 50000.0,
  "artistAmount": 0.0,
  "dmfAmount": 25000.0,
  "labelAmount": 25000.0,
  "artistSharePercent": 0.0,
  "dmfSharePercent": 50.0,
  "labelSharePercent": 50.0
}
```

---

### 3. POST /distributor/release/draft

Create an in-memory draft release (MVP; later persisted to MongoDB).

**Request:**
```json
{
  "type": 0,
  "artistName": "Your Name",
  "releaseTitle": "Track Title",
  "description": "Release description",
  "releaseDate": null,
  "tracks": [],
  "pricingTier": "indie_basic",
  "payoutProfile": {
    "tierCode": "indie_basic"
  }
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": 0,
  "artistName": "Your Name",
  "releaseTitle": "Track Title",
  "description": "Release description",
  "releaseDate": null,
  "tracks": [],
  "pricingTier": "indie_basic",
  "payoutProfile": {
    "tierCode": "indie_basic",
    "artistSharePercent": 90.0,
    "dmfSharePercent": 10.0,
    "labelSharePercent": 0.0,
    "notes": "Affordable for day-one artists with no backing."
  }
}
```

---

### 4. POST /distributor/migration/quote (Legacy)

Get pricing for migrating existing catalog to DMF.

**Request:**
```json
{
  "trackCount": 50
}
```

**Response (200 OK):**
```json
{
  "trackCount": 50,
  "price": 29.99,
  "currency": "USD"
}
```

---

## Configuration

### Payout Tiers (Read-Only in MVP)

Located in `wwwroot/config/dmf_pricing_config.json`:

```json
{
  "code": "indie_basic",
  "name": "Indie Basic",
  "description": "Affordable for day-one artists with no backing.",
  "artistSharePercent": 90.0,
  "dmfSharePercent": 10.0,
  "labelSharePercent": 0.0
}
```

All four tiers are locked in `dmf_pricing_config.json` before launch.

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "details": "TrackCount must be between 1 and 100"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "See server logs"
}
```

---

## Rate Limiting

**Not implemented in MVP.**  
Pre-production: Add middleware for 100 req/min per IP.

---

## Example Workflows

### Flow 1: Artist Gets Release Quote

1. User selects **Single** + **10 tracks** + **Indie Basic**
2. Frontend calls `POST /distributor/release/quote`
3. Backend returns: `price: 9.99, artistSharePercent: 90`
4. UI shows: "Pay $9.99 → You get 90% of revenue"

### Flow 2: Label Gets White Label Quote

1. Label rep selects **Album** + **20 tracks** + **Label White Label**
2. Frontend calls `POST /distributor/release/quote`
3. Backend returns: `price: 29.99, dmfSharePercent: 50, labelSharePercent: 50`
4. UI shows: "Pay $29.99 → DMF gets 50%, you get 50% of revenue"

### Flow 3: Artist Calculates Payout

1. Artist projects **$10,000 revenue** in **Growth Partner tier**
2. Frontend calls `POST /distributor/payout/quote`
3. Backend returns: `artistAmount: 7000, dmfAmount: 3000`
4. UI shows: "You'll earn $7,000; DMF gets $3,000 to invest in growth"

---

## Future Endpoints (Post-Launch)

These will be built **inside the app** using Ryia + App Builder:

- `POST /distributor/release/submit` — Submit for distribution
- `GET /distributor/releases/{id}` — Get release details
- `PATCH /distributor/releases/{id}` — Update release metadata
- `POST /distributor/releases/{id}/submit` — Send to DSPs
- `GET /distributor/analytics` — Revenue by tier/platform
- `POST /admin/payouts/calculate` — Batch payout calculation
- `GET /admin/payout-reports` — Monthly payout summaries

---

## Development Notes

### Adding a New Endpoint

1. Create domain model under `Domain/Distributor/` or `Domain/Distributor/`
2. Add service method in `Domain/Services/`
3. Register service in `Program.cs` with appropriate lifetime
4. Add controller action in `Web/Controllers/DistributorController.cs`
5. Test via Swagger or curl
6. Document in this file

### Modifying Payout Tiers

1. Edit `wwwroot/config/dmf_pricing_config.json`
2. Percentages must sum to 100 (or 0 if unused)
3. Run tests to verify no rounding errors
4. Restart app to reload config

### Adding Release Types

1. Add new value to `ReleaseType` enum in `Domain/Distributor/ReleaseModels.cs`
2. Add pricing entry to `dmf_pricing_config.json`
3. Update switch logic in `DistributorPricingService.GetReleasePrice()`
4. Test via `/distributor/release/quote`

---

## Ryia Integration Notes

After launch, **Ryia** will be able to:

- Read this API.md to understand endpoints
- Generate new endpoints when you request them in the `/ryia` console
- Call these endpoints to build internal tools
- Help artists use the Distributor Wizard

Example Ryia prompts:
- "Add an endpoint to list all payout tiers"
- "Create a dashboard to show payout projections"
- "Add a form to collect artist metadata before submission"

---

## Support

For API issues:
1. Check `QUICK_COMMANDS.md` for curl examples
2. Check server logs: `dotnet run` output
3. Ask Ryia in `/ryia` console for help

---

**Status:** 🔒 LOCKED FOR LAUNCH  
**Next:** Everything after this is built from inside the app.
