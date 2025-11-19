# DMF Gateway

**Single front door for all DMF backends.**

The gateway routes incoming requests to the right service:
- **Auth** → Firebase
- **Catalog** → Lovable
- **Brain** → .NET StreamGod
- **Payments** → Payment processor

---

## Quick Start

### 1. Install dependencies

```powershell
cd gateway
npm install
```

### 2. Configure backends

Copy `.env.example` to `.env` and update with your backend URLs:

```powershell
copy .env.example .env
```

Edit `.env`:
```
FIREBASE_BACKEND_URL=your-firebase-url
LOVABLE_BACKEND_URL=your-lovable-url
DOTNET_BRAIN_URL=http://localhost:5100
PAYMENTS_BACKEND_URL=http://localhost:5200
```

### 3. Start the gateway

**Development:**
```powershell
npm run dev
```

**Production:**
```powershell
npm start
```

The gateway will be available at `http://localhost:5000`

---

## Available Routes

| Path | Backend | Purpose |
|------|---------|---------|
| `/auth/*` | Firebase | Authentication |
| `/catalog/*` | Lovable | Music catalog |
| `/brain/*` | .NET | StreamGod AI |
| `/payments/*` | Payment service | Transactions |
| `/health` | Gateway | Health check |

---

## Example Requests

```bash
# Health check
curl http://localhost:5000/health

# Firebase auth
curl -X POST http://localhost:5000/auth/login

# Catalog from Lovable
curl http://localhost:5000/catalog/releases

# Brain endpoint (.NET)
curl -X POST http://localhost:5000/brain/catalog/score

# Payments
curl -X POST http://localhost:5000/payments/checkout
```

---

## Environment Variables

See `.env.example` for all available options. Key variables:

- `PORT` - Gateway listen port (default: 5000)
- `FIREBASE_BACKEND_URL` - Firebase endpoint
- `LOVABLE_BACKEND_URL` - Lovable API endpoint
- `DOTNET_BRAIN_URL` - .NET backend URL
- `PAYMENTS_BACKEND_URL` - Payments service URL
- `NODE_ENV` - Environment (development/production)

---

## Frontend Integration

In your AI Studio / React frontend, use:

```typescript
const API_BASE_URL = "http://localhost:5000"; // or deployed URL

// All requests go through the gateway
await fetch(`${API_BASE_URL}/auth/login`, { method: "POST" });
await fetch(`${API_BASE_URL}/catalog/releases`, { method: "GET" });
await fetch(`${API_BASE_URL}/brain/score`, { method: "POST" });
```

---

## Deployment

Deploy the gateway alongside your other services. Set environment variables for each deployment target:

- **Local dev**: Point to localhost services
- **Cloud staging**: Point to staging backend URLs
- **Production**: Point to production backend URLs

Example for Render/Railway:

```
PORT=5000
DOTNET_BRAIN_URL=https://your-dmf-api.onrender.com
FIREBASE_BACKEND_URL=https://your-firebase-functions.web.app
LOVABLE_BACKEND_URL=https://your-lovable-api.com
PAYMENTS_BACKEND_URL=https://your-payments-api.com
```
