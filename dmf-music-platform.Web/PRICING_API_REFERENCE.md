## 🎯 DMF Pricing API - Complete Reference

### ✅ Setup Complete

Your pricing system is now **fully admin-editable** with public/private separation:

- **Public endpoints** → Only show active plans (for website/apps)
- **Admin endpoints** (`/api/pricing/admin/*`) → Full CRUD + toggle IsActive/IsRecommended
- **MongoDB backed** → Plans persist and auto-seed on first run
- **Smart defaults** → 5 plans ship ready to go

---

## 🧪 Test URLs (Copy-Paste Ready)

### PUBLIC ENDPOINTS

**Get all active plans:**
```
GET http://localhost:5183/api/pricing
```

**Get single plan:**
```
GET http://localhost:5183/api/pricing/dmf-distribution-pro
```

**Get all categories (only with active plans):**
```
GET http://localhost:5183/api/pricing/categories
```

**Get plans by category:**
```
GET http://localhost:5183/api/pricing/category/Distribution
GET http://localhost:5183/api/pricing/category/Bundle
```

---

### ADMIN ENDPOINTS

**Get ALL plans (active + inactive):**
```
GET http://localhost:5183/api/pricing/admin
```

**Get single plan (even if inactive):**
```
GET http://localhost:5183/api/pricing/admin/dmf-marketing-campaign
```

**Create new plan:**
```
POST http://localhost:5183/api/pricing/admin
Content-Type: application/json

{
  "name": "My Custom Plan",
  "category": "Growth",
  "monthlyPriceUsd": 149,
  "setupFeeUsd": 0,
  "description": "Custom growth plan for growing artists",
  "features": ["Feature 1", "Feature 2"],
  "isActive": true,
  "isRecommended": false,
  "displayOrder": 50
}
```

**Update existing plan:**
```
PUT http://localhost:5183/api/pricing/admin/dmf-distribution-pro
Content-Type: application/json

{
  "name": "Distribution Pro (Updated)",
  "category": "Distribution",
  "monthlyPriceUsd": 49,
  "setupFeeUsd": 0,
  "description": "Updated description",
  "features": ["Feature 1", "Feature 2"],
  "isActive": true,
  "isRecommended": true,
  "displayOrder": 20
}
```

**Toggle active flag (quick switch):**
```
PATCH http://localhost:5183/api/pricing/admin/dmf-distribution-core/toggle-active
```

**Delete plan:**
```
DELETE http://localhost:5183/api/pricing/admin/dmf-legal-guard
```

---

## 📊 Default Plans (Auto-Seeded)

| ID | Name | Category | Monthly | Setup | Recommended | Order |
|---|---|---|---|---|---|---|
| dmf-distribution-core | Distribution Core | Distribution | $0 | $49 | ❌ | 10 |
| dmf-distribution-pro | Distribution Pro | Distribution | $39 | $0 | ✅ | 20 |
| dmf-marketing-campaign | Campaign Engine | Marketing | $99 | $199 | ❌ | 30 |
| dmf-legal-guard | Legal Guard | Legal | $59 | $0 | ❌ | 40 |
| dmf-all-access | All-Access Label OS | Bundle | $199 | $299 | ✅ | 5 |

---

## 🔑 Important Notes

1. **First Run:** Plans auto-seed from `DefaultPlans` list if collection is empty
2. **IsActive:** Public endpoints only show `isActive: true` plans
3. **IsRecommended:** Frontend can highlight with badge/star
4. **DisplayOrder:** Controls sort order in public responses (lower = first)
5. **Slugify:** IDs auto-generate from Name if not provided (e.g., "My Plan" → "dmf-my-plan")

---

## 🚀 Next Steps

Once you confirm endpoints work:

1. **Authenticate admin endpoints** → Add `[Authorize]` decorator
2. **Build 4K Pricing UI** → Dashboard to manage plans visually
3. **Wire frontend** → Have your app/website call `/api/pricing` on load

---

## 🐛 MongoDB Atlas Reminder

If you used the old `pricing_plans` collection, **drop it once** before testing:

1. Go to MongoDB Atlas → Collections
2. Find `dmf_music_platform.pricing_plans`
3. Click **Drop Collection**
4. Run app again → Auto-seeds with new schema

This ensures the new `IsActive`, `IsRecommended`, `DisplayOrder` fields are clean.
