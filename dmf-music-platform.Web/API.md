# DMF Music Platform – Backend Endpoints

Base URL when running locally (example): `https://localhost:7077`

## Catalog / Brain
- `GET /api/catalog/health/sample` → Sample readiness payload.
- `POST /api/catalog/health` → Submit artists/releases/tracks JSON for computed readiness.

## Pricing & Config
- `GET /api/config/pricing` → Full artist-facing pricing (distribution tiers, migration, growth partnership).
- `GET /api/config/pricing/industry` → Industry / label products placeholder.
- JSON source files: `Config/dmf_pricing_config.json` & `Config/ryia_config.json` copied to build output.

## Distributor Quotes
- `POST /api/distributor/release/quote` body: `{ "trackCount": 10 }` → Returns release quote + growth split.
- `POST /api/distributor/migration/quote` body: `{ "trackCount": 42 }` → Returns catalog migration quote.

## Ryia (Du'ryia Intelligence Core)
- `GET /api/ryia/profile` → Static profile from `ryia_config.json`.
- `POST /api/ryia/message` body: `{ "mode": "plan" | "code" | "impact", "request": "text", "currentCode": "optional" }` → Returns stubbed response.

## UI Routes Added
- `/pricing` → Razor component consuming `GET /api/config/pricing`.
- `/ryia` → Interactive console for Ryia message endpoint.

## Dependency Injection Summary
Registered singletons: `DmfPricingConfig`, `RyiaConfig`.
Scoped services: `DistributorPricingService`, `RyiaService`, `StreamGodBrain`.
HttpClient registered for Razor components.

## Build Notes
`dmf-music-platform.Web.csproj` disables implicit content items and explicitly copies config JSON.

## Next Extensions (Suggested)
- Persist Ryia interactions (add EF or repository layer).
- Extend readiness scoring with top issues prioritization.
- Authentication layer before exposing pricing modification endpoints.
