# ?? DMF Pricing System – .NET Integration Guide

**Your pricing system is LIVE in your .NET backend. Here's exactly how to use it.**

---

## ? What's Already Wired

### Backend (.NET/C#)
- ? **Program.cs** - Loads pricing config at startup
- ? **ConfigController.cs** - 9 REST endpoints serving pricing
- ? **DmfPricingConfig.cs** - Models for deserialization
- ? **config/dmf_pricing_config.json** - Master pricing config

### API Endpoints (Live Right Now)
```
GET  /api/config/pricing              ? Full pricing (1hr cache)
GET  /api/config/pricing/distribution ? Just releases
GET  /api/config/pricing/migration    ? Just catalog transfer
GET  /api/config/pricing/boosts       ? Ads + playlist packages
GET  /api/config/partnership          ? 90/10 split
GET  /api/config/promos               ? Discounts (30min cache)
GET  /api/config/label                ? Company info (24hr cache)
GET  /api/config/compliance           ? Legal/terms (24hr cache)
GET  /api/config/industry             ? Enterprise (admin only)
POST /api/config/reload               ? Hot reload prices (admin only)
```

All endpoints are **public** (no auth required) except enterprise + reload.

---

## ?? Test It Right Now

### In Visual Studio

1. **Start the app:**
   - F5 to debug, or
   - `dotnet run` in terminal

2. **Test the endpoint:**
   - Browser: `https://localhost:7001/api/config/pricing`
   - Or curl:
   ```bash
   curl -k https://localhost:7001/api/config/pricing | jq .
   ```

3. **Should see JSON:**
   ```json
   {
     "version": "1.0.0",
     "currency": "USD",
     "distribution": {
       "single": { "price": 9.99 },
       "ep": { "price": 19.99 },
       ...
     }
   }
   ```

---

## ?? Use in Your C# Code

### Example 1: Inject into a Controller

```csharp
[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly DmfPricingConfig _pricing;

    public OrderController(DmfPricingConfig pricing)
    {
        _pricing = pricing;
    }

    [HttpPost("calculate")]
    public IActionResult CalculateOrder([FromBody] OrderRequest request)
    {
        // Get the price for the selected release type
        var releasePrice = request.ReleaseType switch
        {
            "single" => _pricing.Distribution?.Single?.Price ?? 0m,
            "ep" => _pricing.Distribution?.Ep?.Price ?? 0m,
            "album" => _pricing.Distribution?.Album?.Price ?? 0m,
            "mixtape" => _pricing.Distribution?.Mixtape?.Price ?? 0m,
            _ => 0m
        };

        // Apply promotional discount if applicable
        var discount = 0m;
        if (_pricing.PromotionalOffers?.NewArtistDiscount?.Enabled == true)
        {
            discount = releasePrice * 
                (_pricing.PromotionalOffers.NewArtistDiscount.DiscountPercent / 100m);
        }

        var total = releasePrice - discount;

        return Ok(new
        {
            release_price = releasePrice,
            discount = discount,
            total = total,
            partnership = new
            {
                artist_share = _pricing.GrowthPartnership?.ArtistSharePercent,
                dmf_share = _pricing.GrowthPartnership?.DmfSharePercent
            }
        });
    }
}

public class OrderRequest
{
    public string ReleaseType { get; set; } // "single", "ep", "album", "mixtape"
}
```

---

### Example 2: Check Growth Partnership Terms

```csharp
public class PartnershipService
{
    private readonly DmfPricingConfig _pricing;

    public PartnershipService(DmfPricingConfig pricing)
    {
        _pricing = pricing;
    }

    public bool IsTermsAcceptable()
    {
        var terms = _pricing.GrowthPartnership?.Terms;
        if (terms == null) return false;

        return terms.NoOwnership == true &&
               terms.No360Deal == true &&
               terms.NoForcedServices == true &&
               terms.CancelAnytime == true;
    }

    public string GetPartnershipExplanation()
    {
        return _pricing.GrowthPartnership?.Explanation 
            ?? "Partnership terms unavailable";
    }
}
```

---

### Example 3: Apply Bulk Discounts

```csharp
public class PricingService
{
    private readonly DmfPricingConfig _pricing;

    public PricingService(DmfPricingConfig pricing)
    {
        _pricing = pricing;
    }

    public decimal ApplyBulkDiscount(int numReleases, decimal basePrice)
    {
        if (!_pricing.PromotionalOffers?.BulkDiscount?.Enabled == true)
        {
            return basePrice;
        }

        var tiers = _pricing.PromotionalOffers.BulkDiscount.Tiers;
        if (tiers == null || tiers.Count == 0)
        {
            return basePrice;
        }

        // Find the applicable tier (highest tier that applies)
        var applicableTier = tiers
            .OrderByDescending(t => t.Releases)
            .FirstOrDefault(t => numReleases >= t.Releases);

        if (applicableTier == null)
        {
            return basePrice;
        }

        var discountPercent = applicableTier.DiscountPercent;
        return basePrice * (1m - (discountPercent / 100m));
    }
}
```

---

## ?? Use in Your React/Frontend

Your frontend can fetch directly from the API:

```javascript
// hooks/useDmfPricing.js
import { useEffect, useState } from 'react';

export function useDmfPricing() {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/config/pricing');
        const data = await res.json();
        setPricing(data);
      } catch (err) {
        console.error('Failed to load pricing:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { pricing, loading };
}
```

Use in a component:

```javascript
import { useDmfPricing } from './hooks/useDmfPricing';

export function PricingCards() {
  const { pricing, loading } = useDmfPricing();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="pricing-grid">
      <TierCard tier={pricing.distribution.single} />
      <TierCard tier={pricing.distribution.ep} />
      <TierCard tier={pricing.distribution.album} />
      <TierCard tier={pricing.distribution.mixtape} />
    </div>
  );
}
```

---

## ?? Pricing Structure

### Distribution ($9.99–$39.99)
```
Single    $9.99   (1 track)
EP        $19.99  (3-6 tracks)
Album     $29.99  (7-12 tracks)
Mixtape   $39.99  (13+ tracks)
```

### Catalog Migration ($9.99–$39.99)
```
Single        $9.99   (1 track)
EP            $14.99  (2-6 tracks)
Album         $19.99  (7-12 tracks)
Full Catalog  $39.99  (up to 50 tracks)
```

### Boost Packages
```
Ads:
  Starter  $25  (1-3k views)
  Growth   $50  (5-15k views)
  Scale    $100 (20-50k views)

Playlist:
  Starter  $19.99  (3-5 playlists)
  Growth   $34.99  (5-10 playlists)
  Scale    $49.99  (10-15 playlists)
```

### Growth Partnership
```
Artists keep: 90%
DMF takes:    10% (for streams we help generate)
No ownership, no 360 deal, cancelable anytime
```

---

## ?? Update Prices (No Code Changes Needed)

Edit **`config/dmf_pricing_config.json`**:

```json
{
  "distribution": {
    "single": {
      "price": 9.99  ? Change this number
    }
  }
}
```

Then either:
1. **Restart the app** (auto-reload on startup)
2. **Call POST /api/config/reload** (admin only, hot reload)

The change is instantly available on all endpoints.

---

## ?? Integration Roadmap

### Phase 1: Display Pricing (Done ?)
- [x] Load pricing config
- [x] Expose REST endpoints
- [x] Display pricing cards in UI

### Phase 2: Calculate Orders (Next)
- [ ] Add cart system
- [ ] Calculate totals with discounts
- [ ] Show order summary

### Phase 3: Checkout (Soon)
- [ ] Integrate Stripe payments
- [ ] Create orders in database
- [ ] Send confirmation emails

### Phase 4: Analytics (Future)
- [ ] Track which tiers are popular
- [ ] Monitor conversion rates
- [ ] A/B test pricing

---

## ?? Key Features

### Caching Strategy
- **Pricing**: 1 hour (rarely changes)
- **Promos**: 30 minutes (more fluid)
- **Label/Compliance**: 24 hours (very stable)
- **Enterprise**: 1 hour (admin-only, need freshness)

### Public Endpoints
All pricing is public, no auth required. Anyone can see:
- Distribution tiers
- Migration pricing
- Boost packages
- Growth partnership terms
- Promotional offers
- Label & compliance info

### Admin-Only Endpoints
Enterprise products hidden behind `[Authorize(Roles = "Admin,Owner")]`:
- Anti-Bot Suite
- Analytics Dashboard
- Gavel Enterprise
- StreamGod API
- Catalog Transfer

---

## ?? Next Steps

1. ? **Verify endpoints work:** Hit `/api/config/pricing`
2. ? **Display in UI:** Fetch and render pricing cards
3. ?? **Add to cart:** Wire "Choose Plan" buttons
4. ?? **Integrate Stripe:** Payment processing
5. ?? **Create orders:** Save to database
6. ?? **Analytics:** Track conversions

---

## ?? Status

```
? PRICING SYSTEM - LIVE IN YOUR .NET APP

Backend:
? Program.cs (config loading)
? ConfigController.cs (9 endpoints)
? DmfPricingConfig.cs (models)
? Caching headers (performance)
? Admin-protected enterprise endpoints

Config:
? dmf_pricing_config.json (master)
? 7 sections (30+ tiers)
? Promotional offers
? Growth partnership
? Industry products

Integration:
? JSON deserialization
? Singleton registration
? API exposure
? CORS enabled
? Error handling

STATUS: ?? READY FOR PRODUCTION
```

---

**Your pricing engine is complete and running. Everything is wired.** ??

Start by testing `/api/config/pricing` in your browser, then wire it into your React frontend.

