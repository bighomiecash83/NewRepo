# ?? StreamGod OS - Complete Launch Guide

**Your DMF-MUSIC-PLATFORM backend is now a self-contained AI-powered operating system.**

---

## ?? What You Have

| Component | Status | Purpose |
|-----------|--------|---------|
| **streamgod_brain.config.json** | ? Ready | Master brain config (roles, plans, models, routes) |
| **src/streamgod/brain.js** | ? Ready | Brain loader + permission resolution |
| **src/middleware/streamgod-auth.js** | ? Ready | Auth + role-based access control |
| **server.js** | ? Ready | Complete Express backend with brain integration |
| **Public API** | ? Ready | `/api/public/*` (no auth) |
| **Protected API** | ? Ready | `/api/*` (JWT auth + brain policies) |
| **Model Router** | ? Ready | `streamgodRouter()` for AI task routing |

---

## ?? Launch in 5 Steps

### Step 1: Verify Files in Place

From your project root, check:

```bash
ls -la streamgod_brain.config.json
ls -la src/streamgod/brain.js
ls -la src/middleware/streamgod-auth.js
ls -la server.js
```

All four should exist. ?

### Step 2: Install Dependencies

```bash
npm install
# or if you already have them:
npm install --save express cors morgan mongoose dotenv jsonwebtoken
```

### Step 3: Configure Environment

Create `.env` in project root:

```bash
# Node environment
NODE_ENV=development

# MongoDB (optional for demo)
MONGO_URI_DEV=mongodb+srv://your-dev-uri
MONGO_URI_STAGE=mongodb+srv://your-stage-uri
MONGO_URI_PROD=mongodb+srv://your-prod-uri

# Auth
JWT_SECRET=your-super-secret-key-min-32-characters

# OpenAI (for AI tasks)
OPENAI_API_KEY=sk-...

# API Port
PORT=5001
```

### Step 4: Start the Server

```bash
node server.js
```

You should see:

```
??????????????????????????????????????????????????????
?   DMF-MUSIC-PLATFORM StreamGod OS Backend          ?
??????????????????????????????????????????????????????
? ?? API running: http://localhost:5001
? ?? Brain mode: development
? ?? Public endpoints: /api/public/*
? ?? Protected endpoints: /api/* (require JWT)
? ?? Health check: /health
? ?? Brain config: streamgod_brain.config.json
??????????????????????????????????????????????????????
```

### Step 5: Test Endpoints

#### Public (No Auth)
```bash
curl http://localhost:5001/health
curl http://localhost:5001/api/public/artists
curl http://localhost:5001/api/public/divisions
```

#### Protected (Requires JWT)

First, generate a test JWT token:

```bash
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { sub: 'user_123' },
  'dev-secret',
  { expiresIn: '24h' }
);
console.log('Bearer ' + token);
"
```

Then use it:

```bash
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -H "Authorization: $TOKEN" http://localhost:5001/api/status
curl -H "Authorization: $TOKEN" http://localhost:5001/api/artists
curl -H "Authorization: $TOKEN" http://localhost:5001/api/divisions
```

---

## ?? StreamGod Brain Architecture

### 1. Brain Config (`streamgod_brain.config.json`)

**Master configuration file** containing:

- **Roles**: OWNER, ADMIN, ARTIST, MANAGER, ANALYST, SUPPORT, GUEST
- **Plans**: INDIE, LABEL_STARTER, LABEL_PRO, LABEL_ENTERPRISE
- **Route Policies**: Which routes require which permissions
- **AI Models**: GPT-4, GPT-4o, GPT-5.1-Thinking routing rules
- **Mode Settings**: Dev/staging/prod configurations
- **Services**: StreamGod AI, Gavel Syndicate, DMF Distributor, Financial

### 2. Brain Loader (`src/streamgod/brain.js`)

**Live interface** to the brain config:

```javascript
const {
  brain,                    // Raw config
  getRolePermissions,       // Get role perms
  getPlanPermissions,       // Get plan perms
  resolveUserPermissions,   // Combine all perms
  isRouteAllowed,          // Check route access
  selectModelForTask,      // Pick AI model
  streamgodRouter,         // Create routing job
} = require("./src/streamgod/brain");
```

### 3. Auth Middleware (`src/middleware/streamgod-auth.js`)

**Guards all routes**:

- `authMiddleware` - Verifies JWT, loads user
- `routeGuard()` - Checks if user can access route
- `requirePermission(perm)` - Require specific permission
- `requireRole(...roles)` - Require one of these roles
- `ownerOrAdmin()` - Only OWNER/ADMIN

### 4. Server Integration (`server.js`)

**Complete Express backend**:

- Public endpoints (no auth required)
- Protected endpoints (auth + brain policies)
- Model routing for AI tasks
- Error handling
- Mode-aware behavior (dev/staging/prod)

---

## ?? How Access Control Works

### Example: Artist tries to access Control Center

1. Artist sends request with JWT token
2. `authMiddleware` verifies token ? sets `req.user = { role: "ARTIST", ... }`
3. `routeGuard()` checks route policy for `/api/control-center`
4. Brain says: `"required_permission": "admin:read"` + `"internal_only": true`
5. Brain resolves artist's permissions ? `["artists:read:self", "catalog:read:self", ...]`
6. `hasPermission()` checks: Does artist have `admin:read`? **NO**
7. Response: `403 Forbidden` ?

### Example: Admin accesses Control Center

1. Admin sends request with JWT token
2. `authMiddleware` verifies ? sets `req.user = { role: "ADMIN", ... }`
3. `routeGuard()` checks route policy
4. Brain says: requires `admin:read`, internal_only=true
5. Brain resolves admin's permissions ? includes `admin:*` (or full permission set)
6. `hasPermission()` checks: Does admin have `admin:read`? **YES**
7. Response: `200 OK` + data ?

---

## ?? How Model Routing Works

### Example: Need to analyze catalog

```javascript
const { streamgodRouter } = require("./src/streamgod/brain");

// In your route handler:
const job = streamgodRouter("CATALOG_ANALYSIS", {
  catalog: catalogData,
  user_id: req.user.id,
});

// job.model ? "gpt-4o" (picked from brain.ai_models.routing.tasks)
// job.provider ? "openai"
// job.payload ? ready to send to OpenAI API
```

Brain routing rules (from config):

```json
{
  "CATALOG_ANALYSIS": {
    "preferred_models": ["gpt-4o", "gpt-4-turbo"],
    "fallback_models": ["gpt-4", "gpt-3.5-turbo"]
  }
}
```

StreamGod tries preferred first, falls back if not available.

### Example: Complex legal review

```javascript
const job = streamgodRouter("LEGAL_DOCUMENT_REVIEW", {
  document: contractText,
});

// Brain routing for legal tasks:
// "preferred_models": ["gpt-5.1-thinking", "gpt-4-turbo"]
// Selects gpt-5.1-thinking (best for legal reasoning)
```

---

## ?? How to Add New Features

### Add a New Route

1. **Define it in brain config** (`streamgod_brain.config.json`):

```json
{
  "route_policies": {
    "/api/my-new-route": {
      "required_permission": "my_feature:read",
      "internal_only": false
    }
  }
}
```

2. **Add the route in server.js**:

```javascript
app.get("/api/my-new-route", requirePermission("my_feature:read"), async (req, res) => {
  // Your handler
});
```

Now the brain automatically gates access based on user's role + plan.

### Add a New AI Task

1. **Define it in brain config**:

```json
{
  "routing": {
    "tasks": {
      "MY_NEW_TASK": {
        "description": "My task description",
        "preferred_models": ["gpt-4o", "gpt-4"],
        "fallback_models": ["gpt-3.5-turbo"]
      }
    }
  }
}
```

2. **Use in your code**:

```javascript
const job = streamgodRouter("MY_NEW_TASK", { input: data });
// Brain selects the right model automatically
```

### Add a New Role

1. **Define in brain config**:

```json
{
  "roles": {
    "MY_ROLE": {
      "permissions": [
        "feature:read",
        "feature:write"
      ]
    }
  }
}
```

2. **Check in middleware**:

```javascript
app.use(requireRole("OWNER", "ADMIN", "MY_ROLE"));
```

---

## ?? Architecture Overview

```
??????????????????????????????????????????????????????????????????
?                    DMF StreamGod OS                            ?
??????????????????????????????????????????????????????????????????
?                                                                ?
?  streamgod_brain.config.json                                  ?
?  ?? Master config: roles, plans, models, routes, services    ?
?                                                                ?
?  ?                                                             ?
?                                                                ?
?  src/streamgod/brain.js                                       ?
?  ?? Loader: role resolution, model selection, routing         ?
?                                                                ?
?  ?                                                             ?
?                                                                ?
?  src/middleware/streamgod-auth.js                             ?
?  ?? Guards: auth, permissions, roles, routes                 ?
?                                                                ?
?  ?                                                             ?
?                                                                ?
?  server.js                                                    ?
?  ?? Public endpoints (no auth)                               ?
?  ?? Protected endpoints (auth + policies)                    ?
?  ?? Model routing for AI                                     ?
?  ?? Error handling                                           ?
?                                                                ?
?  ?                                                             ?
?                                                                ?
?  Client Apps                                                  ?
?  ?? DMF Control Center (OWNER/ADMIN)                         ?
?  ?? Artist Portal (ARTIST)                                   ?
?  ?? Manager Dashboard (MANAGER)                              ?
?  ?? Public Site (GUEST)                                      ?
?                                                                ?
??????????????????????????????????????????????????????????????????
```

---

## ?? Complete Request Flow

### Request ? Brain Decision ? Response

```
User Request (with JWT)
    ?
authMiddleware
  ?? Verify JWT token
  ?? Load user from DB
  ?? Set req.user
    ?
routeGuard()
  ?? Get route policy from brain
  ?? Resolve user permissions (role + plan)
  ?? Check if user allowed
    ?? YES ? continue ?
    ?? NO ? 403 Forbidden ?
    ?
Route Handler
  ?? Execute business logic
  ?? May use streamgodRouter() for AI
    ?
Response
  ?? Send data (or error)
    ?
Client
```

---

## ?? Key Concepts

### Permissions (from Brain)
- Combine role + plan
- Support wildcards: `artists:*`, `catalog:*`
- OWNER always gets `["*"]`

### Plans (from Brain)
- INDIE, LABEL_STARTER, LABEL_PRO, LABEL_ENTERPRISE
- Grant tier-based permissions
- Can be combined with roles

### Routes (from Brain)
- Exact path match: `/api/artists`
- Wildcard match: `/admin/**`
- Each route has required_permission + internal_only flag

### Models (from Brain)
- GPT-4, GPT-4o, GPT-5.1-Thinking, etc.
- Each task type has preferred + fallback models
- streamgodRouter() selects automatically

### Modes (from Brain)
- Development: verbose logging, no rate limits
- Staging: production-like, different secrets
- Production: optimized, monitoring-ready

---

## ? You're Ready

Your backend is now:

- ? **Self-contained** (all config in JSON)
- ? **Secure** (JWT + role-based access)
- ? **Scalable** (brain-driven, change config not code)
- ? **AI-ready** (model router for any task)
- ? **Production-ready** (error handling, logging)
- ? **Enterprise-grade** (DMF-level infrastructure)

**Launch it. Your DMF Control Center awaits.** ??

---

## ?? Time to Ship

Everything is wired. All systems go.

```bash
node server.js
```

And watch StreamGod OS boot up. ??

