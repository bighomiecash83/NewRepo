# DMF Pricing Frontend (Vite)

Vite-based React frontend for the DMF pricing system.

## Scripts

- `npm run dev` – start dev server (http://localhost:5173)
- `npm run build` – production build (`dist/`)
- `npm run preview` – preview production build locally

## Environment

Set backend base URL:
```
VITE_API_BASE_URL=http://localhost:5183
JWT_DEV_KEY=supersecret_long_key_replace_me
```

## Structure
```
web/
  index.html
  vite.config.js
  .env.example
  src/
    main.jsx
    App.jsx
    services/pricingPlansApi.js
    pages/PricingPlansPage.jsx
    pages/AdminPricingPlans.jsx
```

## Quick Start
```powershell
cd web
cp .env.example .env
npm install
npm run dev
```
Visit:
- Public: http://localhost:5173/pricing
- Admin:  http://localhost:5173/admin/pricing

## Smoke Test
1. Create plan (appears immediately)
2. Toggle active (row style changes)
3. Delete plan (row removed)
4. Refresh (data persists) 
5. Network responses 200 for pricing endpoints
6. (If JWT enabled) Admin endpoints return 401 before token, 200 after applying token.

## Admin Auth (Optional)

Generate a dev token:
```powershell
cd web\scripts
npm install jsonwebtoken
node jwt-gen.js
```
Copy printed token into Admin Pricing token field and click "Apply Token".

`pricingPlansApi.js` will attach `Authorization: Bearer <token>` automatically.

## Security Notes
- Do not use `JWT_DEV_KEY` in production.
- Move secrets to a vault or environment manager.
- Enable HTTPS + secure cookie for production sessions.

## Next Steps
- Add auth guard for admin routes
- Styling pass (Tailwind / design system)
- Pagination & search
- Optimistic updates + toasts
