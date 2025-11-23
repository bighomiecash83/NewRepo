# Du'ryia Brain (StreamGod) — Complete Code Reference

**File**: `src/streamgod/brain.js` (321 lines)  
**Config**: `streamgod_brain.config.json` (494 lines)

---

## 📋 Quick Overview

Du'ryia is the **decision-making engine** that powers DMF Music Platform. It:

1. **Loads configuration** from `streamgod_brain.config.json`
2. **Resolves permissions** by combining: role + plan + overrides
3. **Enforces routes** based on access control policies
4. **Routes AI tasks** to the best model (OpenAI, Gemini, etc.)
5. **Manages modes** (dev/staging/prod with different settings)

---

## 🎯 Core Concepts

### 1. Permission Layers

Every user has permissions from **3 sources**:

```javascript
// Layer 1: ROLE (what type of user)
// OWNER    → ["*"]                          (full access)
// ADMIN    → ["artists:*", "divisions:*", ...] (ops access)
// ARTIST   → ["artists:read:self", ...]    (own data only)
// MANAGER  → ["artists:assigned", ...]     (assigned artists)
// ANALYST  → ["analytics:read", ...]       (read-only analytics)

// Layer 2: PLAN (subscription tier)
// Basic    → ["analytics:read:basic"]
// Pro      → ["analytics:read:pro", "bot_control:basic", ...]
// Enterprise → ["*"]

// Layer 3: OVERRIDES (custom permissions)
user.permissions_override = ["special:permission"]

// FINAL = combine all 3, remove duplicates
resolveUserPermissions({
  role: "ARTIST",
  plan_key: "pro",
  permissions_override: ["releases:read:other"]
})
// Returns: ["artists:read:self", "releases:read:self", ..., "analytics:read:pro", "bot_control:basic", "releases:read:other"]
```

### 2. Permission Matching

Supports **exact matches** and **wildcards**:

```javascript
hasPermission(["artists:*", "analytics:read"], "artists:write")
// ✅ TRUE (wildcard "artists:*" matches "artists:write")

hasPermission(["artists:read"], "artists:write")
// ❌ FALSE (no wildcard, exact match required)

hasPermission(["*"], "anything")
// ✅ TRUE (OWNER always allowed)
```

### 3. Route Policies

Control **what routes** a user can access:

```javascript
// From streamgod_brain.config.json
"access_control": {
  "route_policies": {
    "/api/admin/**": {
      "internal_only": true,  // Only OWNER/ADMIN
      "required_permission": "admin:read"
    },
    "/api/artists": {
      "required_permission": "artists:read"  // Must have this perm
    }
  }
}

// Usage in Express middleware:
app.use((req, res, next) => {
  const allowed = isRouteAllowed(req.path, req.user);
  if (!allowed) return res.status(403).json({ error: "Forbidden" });
  next();
});
```

### 4. Model Routing

Select the best AI model for a task:

```javascript
// From brain config
"ai_models": {
  "default_provider": "openai",
  "routing": {
    "tasks": {
      "generate_campaign_copy": {
        "preferred_models": ["gpt-4o"],
        "fallback_models": ["gpt-4-turbo", "gpt-3.5-turbo"]
      },
      "analyze_sentiment": {
        "preferred_models": ["gpt-4o"],
        "fallback_models": ["gpt-3.5-turbo"]
      }
    }
  }
}

// Usage:
const route = selectModelForTask("generate_campaign_copy");
// Returns: {
//   provider: "openai",
//   model: "gpt-4o",
//   details: { ... },
//   task: { type: "generate_campaign_copy", ... }
// }
```

---

## 🔑 Main Functions (with examples)

### `resolveUserPermissions(user)`

Combines all 3 permission layers into final permission set.

```javascript
// Example 1: OWNER (always ["*"])
resolveUserPermissions({ role: "OWNER" })
// → ["*"]

// Example 2: ARTIST on Pro plan
resolveUserPermissions({
  id: "artist_123",
  role: "ARTIST",
  plan_key: "pro",
  permissions_override: ["special:feature"]
})
// → [
//     "artists:read:self", "catalog:read:self", "catalog:write:self",
//     "analytics:read:self", "releases:read:self", "releases:write:self",
//     "analytics:read:pro", "bot_control:basic", ...,
//     "special:feature"
//   ]

// Example 3: MANAGER on Basic plan
resolveUserPermissions({
  id: "manager_456",
  role: "MANAGER",
  plan_key: "basic"
})
// → [
//     "artists:read", "artists:read:assigned", "catalog:read:assigned",
//     "catalog:write:assigned", "analytics:read:assigned",
//     "releases:read:assigned", "releases:write:assigned",
//     "analytics:read:basic"
//   ]
```

### `hasPermission(perms, required)`

Checks if permission exists (wildcard-aware).

```javascript
// Exact match
hasPermission(["artists:read", "artists:write"], "artists:write")
// ✅ TRUE

// Wildcard match
hasPermission(["artists:*"], "artists:read")
// ✅ TRUE

// OWNER always passes
hasPermission(["*"], "anything:at:all")
// ✅ TRUE

// No permission = denied
hasPermission(["artists:read"], "divisions:write")
// ❌ FALSE
```

### `isRouteAllowed(pathname, user)`

Enforces route-level access control.

```javascript
// Assume config says: "/api/admin/**" requires OWNER/ADMIN role
isRouteAllowed("/api/admin/users", { role: "ARTIST" })
// ❌ FALSE (not OWNER or ADMIN)

isRouteAllowed("/api/admin/users", { role: "ADMIN" })
// ✅ TRUE (ADMIN is allowed)

// Assume config says: "/api/artists" requires "artists:read" permission
isRouteAllowed("/api/artists", { role: "ARTIST", plan_key: "basic" })
// ✅ TRUE (ARTIST has "artists:read:self" which matches)

// No policy = allow by default
isRouteAllowed("/api/public/pricing", { role: "GUEST" })
// ✅ TRUE (no policy configured, so allowed)
```

### `selectModelForTask(taskType)`

Picks the best AI model from the provider.

```javascript
// Config has: preferred=["gpt-4o"], fallback=["gpt-3.5-turbo"]
selectModelForTask("generate_campaign_copy")
// ✅ Returns: { provider: "openai", model: "gpt-4o", ... }

// If gpt-4o not available, falls back to gpt-3.5-turbo
selectModelForTask("analyze_sentiment")
// ✅ Returns: { provider: "openai", model: "gpt-3.5-turbo", ... }

// If task not configured
selectModelForTask("unknown_task")
// ❌ Throws: "No routing task defined for: unknown_task"
```

### `streamgodRouter(taskType, input, options)`

High-level wrapper for model routing + payload preparation.

```javascript
const job = streamgodRouter(
  "generate_campaign_copy",
  {
    artist_name: "Freezzo",
    track_title: "BOUNCE BACK",
    vibe: "hype, energetic"
  },
  { temperature: 0.8 }
);

// Returns:
// {
//   provider: "openai",
//   model: "gpt-4o",
//   details: { cost_per_1k: 0.015, ... },
//   task: { type: "generate_campaign_copy", description: "..." },
//   payload: {
//     model: "gpt-4o",
//     input: { artist_name: "Freezzo", ... },
//     task: "generate_campaign_copy",
//     temperature: 0.8
//   }
// }
```

---

## 🔄 Real-World Flow: Artist Accessing Admin Pricing

```
1. Artist (Freezzo) logs in
   → User object: { id: "artist_freezzo", role: "ARTIST", plan_key: "pro" }

2. Frontend calls: GET /api/pricing/admin/plans
   → Middleware calls: isRouteAllowed("/api/pricing/admin/plans", user)

3. Brain resolves route policy:
   → Policy says: required_permission: "admin:read"

4. Brain resolves user permissions:
   → Role: "ARTIST" → ["artists:read:self", "catalog:read:self", ...]
   → Plan: "pro" → ["analytics:read:pro", "bot_control:basic", ...]
   → Combined: [...]

5. Brain checks hasPermission(userPerms, "admin:read")
   → ❌ Artist doesn't have "admin:read"

6. isRouteAllowed returns FALSE

7. Express middleware blocks request:
   → 403 Forbidden

8. If user was OWNER or ADMIN:
   → hasPermission would return TRUE
   → 200 OK, returns all plans
```

---

## 🛠️ How to Use Du'ryia in Your Code

### In Express Middleware:

```javascript
const { isRouteAllowed, resolveUserPermissions } = require("./src/streamgod/brain");

app.use((req, res, next) => {
  // Get user from JWT/session
  const user = req.user; // { role: "ARTIST", plan_key: "pro", ... }

  // Check route access
  if (!isRouteAllowed(req.path, user)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Attach resolved permissions to request
  req.permissions = resolveUserPermissions(user);
  next();
});
```

### In Controllers:

```javascript
const { hasPermission } = require("./src/streamgod/brain");

app.get("/api/artists", (req, res) => {
  if (!hasPermission(req.permissions, "artists:read")) {
    return res.status(403).json({ error: "You don't have artist read access" });
  }

  // Return artists (filtered based on user role)
  const artists = getArtists(req.user);
  res.json(artists);
});
```

### For AI Task Routing:

```javascript
const { streamgodRouter } = require("./src/streamgod/brain");

app.post("/api/generate-campaign", async (req, res) => {
  const { artist_name, track_title, vibe } = req.body;

  // Let Du'ryia pick the best model
  const job = streamgodRouter("generate_campaign_copy", {
    artist_name,
    track_title,
    vibe
  });

  // Call OpenAI with selected model
  const response = await openai.chat.completions.create({
    model: job.model,
    messages: [{ role: "user", content: job.payload.input }]
  });

  res.json({ copy: response.choices[0].message.content });
});
```

---

## 📊 Configuration File Structure

```json
{
  "metadata": { ... },
  "access_control": {
    "roles": {
      "OWNER": { permissions: [] },
      "ADMIN": { permissions: [...] },
      "ARTIST": { permissions: [...] }
    },
    "plans": {
      "basic": { permissions: [...] },
      "pro": { permissions: [...] },
      "enterprise": { permissions: [...] }
    },
    "route_policies": {
      "/api/admin/**": { internal_only: true },
      "/api/artists": { required_permission: "artists:read" }
    }
  },
  "ai_models": {
    "default_provider": "openai",
    "routing": {
      "tasks": {
        "generate_campaign_copy": { preferred_models: [...] }
      }
    }
  },
  "modes": {
    "development": { ... },
    "staging": { ... },
    "production": { ... }
  }
}
```

---

## ✅ Summary

| Function | Purpose | Returns |
|----------|---------|---------|
| `resolveUserPermissions(user)` | Merge all permission layers | `string[]` |
| `hasPermission(perms, required)` | Check if permission exists | `boolean` |
| `isRouteAllowed(path, user)` | Check route access | `boolean` |
| `getRoutePolicy(path)` | Get route config | `object \| null` |
| `selectModelForTask(task)` | Pick best AI model | `{ provider, model, ... }` |
| `streamgodRouter(task, input, opts)` | Prepare model job | `{ payload, ... }` |
| `getModeConfig(mode)` | Get mode settings | `object` |
| `getCurrentMode()` | Get current NODE_ENV mode | `"dev" \| "staging" \| "prod"` |

---

**Du'ryia is ready to enforce permissions across your entire platform!** 🧠✨
