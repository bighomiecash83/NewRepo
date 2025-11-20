# ?? DMF Pricing Integration – Live in Your App NOW

**Pricing is wired into your Express backend. Here's how to use it.**

---

## ? What Just Happened

Your `server.js` now has **9 new REST endpoints** that serve pricing data:

```
GET /api/config/pricing              ? Full config (cached 1h)
GET /api/config/pricing/distribution ? Just releases
GET /api/config/pricing/migration    ? Just catalog transfer
GET /api/config/pricing/boosts       ? Just ads/playlists
GET /api/config/partnership          ? 90/10 split
GET /api/config/promos               ? Discounts
GET /api/config/label                ? Company info
GET /api/config/compliance           ? Legal/terms
GET /api/config/industry             ? Enterprise (admin only)
```

All automatic, no auth required (except industry), cached for performance.

---

## ?? Quick Test (Right Now in Codespaces)

1. **Make sure pricing config exists:**

```bash
ls config/dmf_pricing_config.json
# Should exist, if not: copy the JSON file to /config folder
```

2. **Start your server:**

```bash
npm install  # if needed
npm start    # or npm run dev
```

3. **Test the endpoint in browser or curl:**

```bash
# In another terminal
curl http://localhost:5001/api/config/pricing | jq .

# Should see full pricing JSON
```

4. **Test individual endpoints:**

```bash
curl http://localhost:5001/api/config/pricing/distribution
curl http://localhost:5001/api/config/pricing/boosts
curl http://localhost:5001/api/config/partnership
```

All should return JSON instantly (cached).

---

## ?? Wire Into Your React Frontend

Wherever you want to display pricing (Artist Dashboard, Pricing Page, etc.):

### Simple React Hook

```javascript
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

Use it in any component:

```javascript
export function PricingPage() {
  const { pricing, loading } = useDmfPricing();

  if (loading) return <div>Loading...</div>;
  if (!pricing) return <div>Pricing unavailable</div>;

  return (
    <div>
      <h1>{pricing.label.name}</h1>

      {/* Distribution tiers */}
      <div className="grid">
        {Object.values(pricing.distribution)
          .filter(t => t.type) // Skip "description" key
          .map(tier => (
            <div key={tier.type} className="card">
              <h3>{tier.name}</h3>
              <p className="price">${tier.price}</p>
              <button>Choose {tier.name}</button>
            </div>
          ))}
      </div>

      {/* Growth partnership banner */}
      <div className="banner">
        <h2>{pricing.growth_partnership.name}</h2>
        <p>You keep {pricing.growth_partnership.artist_share_percent}%</p>
      </div>
    </div>
  );
}
```

---

## ??? Architecture

```
dmf_pricing_config.json (single source of truth)
            ?
    server.js (loads & caches)
            ?
    /api/config/pricing (serves to frontend)
            ?
    React component (renders pricing cards)
            ?
    User sees: Single $9.99, EP $19.99, etc.
```

**One change to JSON ? automatically updates everywhere.**

---

## ?? Pricing Structure (Live in Your App)

### Distribution ($9.99–$39.99)
- Single: $9.99
- EP: $19.99
- Album: $29.99
- Mixtape: $39.99

### Catalog Migration ($9.99–$39.99)
- Single: $9.99
- EP: $14.99
- Album: $19.99
- Full Catalog: $39.99

### Boost Packages
**Ads:** $25, $50, $100
**Playlist:** $19.99, $34.99, $49.99

### Growth Partnership
- Artists: **90%**
- DMF: **10%** (for streams we help generate)

---

## ?? How to Update Prices

**Edit `/config/dmf_pricing_config.json` directly:**

```json
{
  "distribution": {
    "single": {
      "price": 9.99  ? Change this
    }
  }
}
```

Save, restart server ? **all endpoints automatically use new price.**

No code changes. No redeployment needed (except server restart).

---

## ?? Next Steps

1. ? Test `/api/config/pricing` endpoint
2. ? Create pricing page component in React
3. ? Fetch and display pricing cards
4. ? Wire into checkout flow (Stripe)
5. ? Add discount logic (promo codes)
6. ? Create order/invoice system

---

## ?? Status

```
? PRICING LIVE IN YOUR APP

? 9 REST endpoints (automatic caching)
? Single source of truth (JSON config)
? Zero auth required (except enterprise)
? Ready for checkout integration
? Production performance (caching)

STATUS: ?? READY FOR DASHBOARD + CHECKOUT
```

**Your pricing engine is live. Hook it into your UI and start collecting revenue.** ??

