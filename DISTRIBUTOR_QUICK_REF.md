# ⚡ QUICK REF: Distributor + Payout Engine

## Files Added

| File | Purpose | Lines |
|------|---------|-------|
| `Domain/Distributor/DistributorModels.cs` | Release, track, payout models | 71 |
| `Domain/Distributor/Services/PayoutService.cs` | Calculate payouts | 52 |
| `Domain/Services/DistributorPricingService.cs` | Updated with ReleaseType support | 66 |
| `Controllers/DistributorController.cs` | 3 new API endpoints | 72 |
| `Domain/Config/DmfPricingConfig.cs` | Updated with PayoutTiers | 85 |
| `wwwroot/config/dmf_pricing_config.json` | Locked pricing + tiers | 50 |
| `API.md` | Complete endpoint documentation | 280+ |
| `DISTRIBUTOR_PAYOUT_ENGINE_COMPLETE.md` | Full delivery details | 300+ |

## API Endpoints (Ready to Use)

```
POST /api/distributor/release/quote
├─ Input: releaseType (0-3), trackCount, payoutTierCode
└─ Output: price, currency, artistSharePercent, dmfSharePercent, labelSharePercent

POST /api/distributor/payout/quote
├─ Input: tierCode, projectedRevenue
└─ Output: artistAmount, dmfAmount, labelAmount, shares %

POST /api/distributor/release/draft
├─ Input: Full draft object
└─ Output: Draft with payout profile filled

POST /api/distributor/migration/quote
├─ Input: trackCount
└─ Output: price, currency
```

## Payout Tiers (Locked)

| Tier | Artist % | DMF % | Label % | Purpose |
|------|----------|-------|---------|---------|
| indie_basic | 90 | 10 | 0 | Day-one artists |
| indie_plus | 85 | 15 | 0 | Growing artists |
| growth_partner | 70 | 30 | 0 | DMF invests |
| label_white_label | 0 | 50 | 50 | Industry labels |

## Prices (Locked)

| Type | Price |
|------|-------|
| Single | $9.99 |
| EP | $19.99 |
| Album | $29.99 |
| Mixtape | $39.99 |

## DI Registration (in Program.cs)

```csharp
builder.Services.AddScoped<DistributorPricingService>();
builder.Services.AddScoped<PayoutService>();
```

## Key Classes

```csharp
// Models
public enum ReleaseType { Single, EP, Album, Mixtape }
public class ReleaseDraft { Type, ArtistName, ReleaseTitle, Tracks, PricingTier, PayoutProfile }
public class TrackDraft { TrackNumber, Title, AudioPath, Isrc, Duration }
public class PayoutProfile { TierCode, ArtistSharePercent, DmfSharePercent, LabelSharePercent }

// Services
public class PayoutService {
    PayoutProfile GetPayoutProfile(string tierCode)
    PayoutQuoteResult Quote(PayoutQuoteRequest request)
}

public class DistributorPricingService {
    decimal GetReleasePrice(ReleaseType type, int trackCount)
}
```

## Test Examples

### cURL (PowerShell)
```powershell
$body = @{ releaseType = 2; trackCount = 10; payoutTierCode = "indie_basic" } | ConvertTo-Json
curl -X POST "http://localhost:5183/api/distributor/release/quote" `
  -H "Content-Type: application/json" -d $body
```

### C# (in component)
```csharp
var payload = new { releaseType = 2, trackCount = 10, payoutTierCode = "indie_basic" };
var res = await Http.PostAsJsonAsync("api/distributor/release/quote", payload);
var quote = await res.Content.ReadFromJsonAsync<QuoteResponse>();
```

## Configuration (dmf_pricing_config.json)

- Single: $9.99
- EP: $19.99
- Album: $29.99
- Mixtape: $39.99
- All 4 payout tiers with descriptions
- All percentages locked
- Currency: USD

## Build Status

✅ **0 errors, 0 warnings**

Compile and run:
```bash
cd dmf-music-platform.Web
dotnet build -c Debug
dotnet run
```

## What's Next?

- ✅ Everything after launch: Ryia + App Builder
- ✅ UI wizard: Built inside app (not scaffolded)
- ✅ MongoDB: Persistence added from builder
- ✅ Advanced features: All from /ryia console

---

**Status:** 🔒 **LOCKED FOR LAUNCH**
