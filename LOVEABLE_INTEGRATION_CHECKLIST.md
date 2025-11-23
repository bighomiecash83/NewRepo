# Loveable → DMF Music Platform Integration Checklist

**Purpose**: Export React/Next app from Loveable and integrate with Firebase Functions backend.

---

## ✅ Step 1: Export from Loveable

1. Open your Loveable project
2. Click **Export to GitHub**
3. Choose **Next.js** or **React** template
4. Export generates a new GitHub repo (or zip file)
5. Clone/download to local machine

---

## ✅ Step 2: Folder Structure Setup

```bash
# From your main dmf-music-platform repo
mkdir -p apps/web

# Copy Loveable export into apps/web
cp -r ~/Downloads/loveable-export/* apps/web/
# or
git clone <loveable-github-repo> apps/web
```

Your structure should now be:
```
dmf-music-platform/
├─ apps/web/
│  ├─ package.json
│  ├─ next.config.js (or tsconfig.json for React)
│  ├─ app/ (or src/pages)
│  ├─ public/
│  └─ ...
├─ functions/
│  ├─ src/
│  └─ ...
└─ firebase.json
```

---

## ✅ Step 3: Fix Loveable Preview Injection Issues

Loveable sometimes injects preview API keys into exported code. **Find and replace these:**

### 🔴 Problem 1: Hardcoded Loveable Preview Key

**File**: `apps/web/src/lib/api.ts` (or wherever API calls are)

**Find**:
```javascript
const API_URL = process.env.REACT_APP_LOVEABLE_PREVIEW || "https://loveable-preview.io";
const API_KEY = "pk_live_xxxxx"; // hardcoded from Loveable
```

**Replace with**:
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
// NO hardcoded keys! All server-side only.
```

---

### 🔴 Problem 2: Client-side Model Calls

**File**: Any component using `openai` or `@google-cloud/generative-ai`

**Find**:
```javascript
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_KEY });
export async function chat(messages) {
  return client.chat.completions.create({ ... });
}
```

**Replace with**:
```javascript
// Use server-side proxy instead!
export async function chat(messages: any[]) {
  const res = await fetch("/api/googleai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o", messages })
  });
  return res.json();
}
```

---

### 🔴 Problem 3: Environment Variables Leaking Keys

**File**: `apps/web/.env.local` (or any .env)

**Find**:
```
REACT_APP_OPENAI_KEY=sk_test_xxxxx
LOVEABLE_API_KEY=pk_live_xxxxx
```

**Replace with**:
```
# FRONTEND ONLY (safe to expose)
NEXT_PUBLIC_API_URL=http://localhost:5000

# DO NOT add any API keys here!
# All keys stay in Firebase Functions secrets
```

---

### 🔴 Problem 4: Hardcoded Endpoints

**File**: Search for any hardcoded API URLs

**Find**:
```javascript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  headers: { "Authorization": "Bearer sk_test_xxxx" }
});
```

**Replace with**:
```javascript
const response = await fetch("/api/googleai", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ /* your payload */ })
});
```

---

## ✅ Step 4: Ensure `package.json` Dependencies

**File**: `apps/web/package.json`

Add/ensure these exist:

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "swr": "^2.2.0",
    "tailwindcss": "^3.3.0"
  }
}
```

Remove any of these (if present):
- `openai` (use backend proxy instead)
- `@google-cloud/generative-ai` (use backend proxy)
- Any hardcoded API key libraries

---

## ✅ Step 5: Create/Update API Client Layer

**File**: `apps/web/src/lib/api.ts` (create if missing)

```typescript
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Google AI Proxy
export async function aiChat(model: string, messages: any[]) {
  const { data } = await apiClient.post('/api/googleai', {
    model,
    messages
  });
  return data;
}

// Artist Profile
export async function getArtist(artistId: string) {
  const { data } = await apiClient.get(`/api/artist/${artistId}`);
  return data;
}

// Subscribe
export async function subscribe(userId: string, planId: string) {
  const { data } = await apiClient.post('/api/subscribe', {
    userId,
    planId
  });
  return data;
}

// Health check
export async function healthCheck() {
  const { data } = await apiClient.get('/api/health');
  return data;
}
```

---

## ✅ Step 6: Fix Next.js Config (if using Next)

**File**: `apps/web/next.config.js`

Add API rewrites for local dev:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5001/dmf-music-platform/us-central1/api/:path*'
        }
      ]
    }
  }
}

module.exports = nextConfig
```

---

## ✅ Step 7: Update Environment Files

**File**: `apps/web/.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:5000

# Production
# NEXT_PUBLIC_API_URL=https://dmf-music-platform.web.app
```

**File**: `apps/web/.env.production`

```
NEXT_PUBLIC_API_URL=https://dmf-music-platform.web.app
```

---

## ✅ Step 8: Remove Sensitive Files from Git

**File**: `apps/web/.gitignore`

Ensure these are included:

```
.env.local
.env.*.local
*.key
*.pem
node_modules/
.next/
dist/
```

---

## ✅ Step 9: Test Locally

```bash
# Terminal 1: Start Functions emulator
cd functions
npm run serve

# Terminal 2: Start Next.js dev
cd apps/web
npm run dev
# Opens http://localhost:3000

# Terminal 3: Verify backend
curl http://localhost:5001/dmf-music-platform/us-central1/api/health
# Should return: {"ok":true}
```

---

## ✅ Step 10: Deployment Checklist

Before deploying to production:

- [ ] All API keys removed from frontend code
- [ ] `.env.local` is in `.gitignore`
- [ ] No hardcoded OpenAI/Google API keys anywhere in `apps/web/`
- [ ] All AI calls route through `/api/googleai` endpoint
- [ ] `firebase.json` has correct rewrites (see template below)
- [ ] Functions have all secrets set via `firebase functions:secrets:set`
- [ ] Build succeeds: `npm -w apps/web run build`
- [ ] Functions build succeeds: `npm -w functions run build`

---

## 📋 Complete String Replacements (copy-paste ready)

### Replacement 1: API Client

**OLD:**
```javascript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_KEY });
export const chatWithModel = async (prompt) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }]
  });
  return response;
};
```

**NEW:**
```javascript
export const chatWithModel = async (prompt: string) => {
  const res = await fetch("/api/googleai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};
```

### Replacement 2: Environment Variables

**OLD** (`.env.local`):
```
REACT_APP_OPENAI_KEY=sk_test_xxxxx
LOVEABLE_API_KEY=pk_live_xxxxx
API_BASE=https://api.openai.com
```

**NEW** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Replacement 3: Hardcoded URLs

**OLD:**
```javascript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_KEY}`
  },
  body: JSON.stringify(payload)
});
```

**NEW:**
```javascript
const response = await fetch("/api/googleai", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ model: "gpt-4o", messages })
});
```

---

## 🎯 Final Check

After applying all fixes, run:

```bash
# Search for any remaining API keys
grep -r "sk_" apps/web/src --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "pk_" apps/web/src --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "OPENAI_KEY\|GEMINI_KEY\|LOVEABLE" apps/web --include="*.ts" --include="*.tsx" --include="*.js"

# Should return: (no results)
```

If you find any matches, those are the lines to fix.

---

## ✅ Summary

| Step | Status | Note |
|------|--------|------|
| Export from Loveable | ✅ | Place in `apps/web/` |
| Remove hardcoded keys | ✅ | Search & replace guide above |
| Fix API calls | ✅ | Route through `/api/googleai` |
| Update environment files | ✅ | Only `NEXT_PUBLIC_API_URL` |
| Test locally | ✅ | `npm run dev` + Functions emulator |
| Deploy | ✅ | `firebase deploy --only hosting,functions` |

You're now **production-ready** to export from Loveable and deploy! 🚀
