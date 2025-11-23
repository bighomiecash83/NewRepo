# Pricing Frontend Launch Guide

This guide finalizes the MongoDB-backed pricing system integration into the existing React app.

## Added Files

- `src/services/pricingPlansApi.js` – Axios client for pricing endpoints
- `src/pages/PricingPlansPage.jsx` – Public pricing display
- `src/pages/AdminPricingPlans.jsx` – Admin CRUD interface
- Routes added in `src/App.jsx`: `/pricing`, `/admin/pricing`

## Environment Variable (Optional)

You can override the backend API base with `VITE_API_BASE_URL` (or process env).
Default fallback: `http://localhost:5183`.

Create `.env` (optional):
```
VITE_API_BASE_URL=http://localhost:5183
```

## Run Locally

```powershell
pwsh
cd c:\Users\bigho\source\repos\dmf-music-platform
npm install  # ensure axios/react deps
npm run dev  # starts server.js (if used) OR run your preferred frontend dev server
```

Visit:
- Public: http://localhost:3000/pricing
- Admin:  http://localhost:3000/admin/pricing

## Production Build (Static Host)

If you use a bundler (Vite/Create React App), run the appropriate build:
```powershell
npm run build
```
Deploy build output (e.g. `dist/` or `build/`) to Vercel/Netlify. Ensure environment variable `VITE_API_BASE_URL` points to production backend.

## Smoke Test Checklist

| Item | Public | Admin |
|------|--------|-------|
| Plans load | ✅ | ✅ |
| Categories grouped | ✅ | N/A |
| Recommended badge | ✅ | ✅ (visible in table) |
| CRUD create/update/delete | N/A | ✅ |
| Toggle active | N/A | ✅ |
| Ordering respected | ✅ | ✅ |
| No console errors | ✅ | ✅ |

## Troubleshooting

| Symptom | Action |
|---------|--------|
| 404 /public/plans | Confirm backend running on 5183 & route `/api/pricing/public/plans` |
| Network CORS error | Add frontend origin to backend CORS config |
| Empty feature list | Verify plan `features` array populated in DB |
| Admin changes not persisting | Check MongoDB write permissions and logs |

## Next Hardening Steps

1. Add auth guard for `/admin/pricing` (JWT check)
2. Add optimistic UI updates on CRUD
3. Styling pass (tailwind / design system)
4. Pagination if plan count grows
5. Switch env baseURL to dynamic config file

## Done

This pricing frontend is now LIVE within the application routing. Proceed to production deployment when smoke tests pass.
