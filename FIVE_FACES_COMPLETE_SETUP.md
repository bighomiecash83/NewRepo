# DMF FIVE FACES — COMPLETE SETUP GUIDE

**All environment templates, system prompts, and configuration in one place.**

---

## 📋 Quick Reference

| Frontend | Type | Env File | Config |
|----------|------|----------|--------|
| **Google AI Studio** | Web App | `.env.google-ai-studio.example` | `VITE_API_BASE_URL` |
| **Bolt** | Web App | `.env.bolt.example` | `VITE_API_BASE_URL` |
| **VS Code** | Extension | `.env.vscode-extension.example` | `DMF_API_BASE_URL` |
| **Gemini** | AI Agent | `GEMINI_SYSTEM_PROMPT.md` | System prompt + tools |
| **OpenAI** | AI Agent | `OPENAI_ASSISTANT_SETUP.md` | Assistant + functions |

---

## 🚀 5-Minute Setup (Local Development)

### Terminal 1: Start Gateway
```powershell
cd gateway
npm start
# Expected: "🚀 DMF Gateway running on http://localhost:5000"
```

### Terminal 2: Start .NET Brain
```powershell
cd dmf-music-platform.Web
dotnet run
# Expected: listening on http://localhost:5183
```

### Terminal 3: Test Connectivity
```powershell
curl http://localhost:5000/health
# Expected: { "status": "ok", "service": "dmf-gateway", "time": "..." }
```

---

## 1️⃣ GOOGLE AI STUDIO Setup

### A. Copy Environment File

```powershell
copy .env.google-ai-studio.example .env.local
```

### B. Edit `.env.local`

```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=AIzaSyBDNdO2bNfxj_ej0qieN943ouqDqxWlfJY
# ... other Firebase config
```

### C. Import API Client

Copy `dmf_api_client.ts` into your project:
```bash
cp dmf_api_client.ts src/lib/dmf_api_client.ts
```

### D. Use in Components

```typescript
import { dmfApi } from "./lib/dmf_api_client";

// Get catalog
const releases = await dmfApi.getCatalogReleases();

// Score a track
const score = await dmfApi.scoreTrack({
  trackId: "abc123",
  title: "My Track",
  artist: "Artist Name"
});

// Get payout estimate
const payout = await dmfApi.getPayoutQuote({
  releaseType: "single",
  trackCount: 1,
  estimatedStreams: 10000,
  payoutTier: "indie_basic"
});
```

### E. Start Dev Server

```powershell
npm run dev
# Open http://localhost:5173
```

### F. Verify Connection

Open browser console and test:
```javascript
const client = window.__dmfApi; // or however you expose it
client.health().then(console.log);
```

---

## 2️⃣ BOLT Setup

### A. Create New Bolt Project

Go to **Bolt.new** (or your Bolt instance)

Create a project with prompt:
```
Create a dashboard that lists all my music releases from the DMF API
and shows a score for each track's release readiness.
```

### B. Copy Environment File

In Bolt project root:
```bash
VITE_API_BASE_URL=http://localhost:5000
```

### C. Update Generated Code

Bolt generates React. Import the API client:

```typescript
import { dmfApi } from "./lib/dmf_api_client";

export function ReleasesList() {
  const [releases, setReleases] = useState([]);

  useEffect(() => {
    dmfApi.getCatalogReleases().then(setReleases);
  }, []);

  return (
    <div>
      {releases.map(release => (
        <div key={release.id}>
          <h3>{release.title}</h3>
          <p>Type: {release.type}</p>
        </div>
      ))}
    </div>
  );
}
```

### D. Test Bolt App

```powershell
npm run dev
# Bolt should fetch releases from localhost:5000
```

---

## 3️⃣ VS CODE Extension Setup

### Option A: REST Client (Quick)

1. Install "REST Client" extension in VS Code
2. Open file `dmf.http` (included in repo)
3. Click **Send Request** on any block
4. View response in output panel

Example requests in `dmf.http`:
```http
### Health check
GET http://localhost:5000/health

### List releases
GET http://localhost:5000/catalog/releases

### Score a track
POST http://localhost:5000/brain/catalog/score
Content-Type: application/json

{
  "trackId": "abc123",
  "title": "My Track",
  "artist": "Artist Name"
}
```

### Option B: Custom VS Code Extension

1. Create extension:
```powershell
yo code  # generate boilerplate
```

2. Install dependencies:
```bash
npm install
```

3. In `src/extension.ts`, add:

```typescript
import { DMFApiClient } from "./dmf_api_client";

const api = new DMFApiClient(
  process.env.DMF_API_BASE_URL || "http://localhost:5000"
);

export async function activate(context: vscode.ExtensionContext) {
  // Register command to check DMF health
  let disposable = vscode.commands.registerCommand('dmf.health', async () => {
    const health = await api.health();
    vscode.window.showInformationMessage(
      `DMF Status: ${health.status} (${health.time})`
    );
  });

  context.subscriptions.push(disposable);

  // Show StreamGod panel
  const panel = vscode.window.createWebviewPanel(
    'streamgod',
    'StreamGod',
    vscode.ViewColumn.Two,
    { enableScripts: true }
  );

  // Load releases and display
  const releases = await api.getCatalogReleases();
  panel.webview.html = getWebviewContent(releases);
}

function getWebviewContent(releases: any[]) {
  return `
    <html>
      <body>
        <h2>StreamGod Control Panel</h2>
        <ul>
          ${releases.map(r => `<li>${r.title}</li>`).join('')}
        </ul>
      </body>
    </html>
  `;
}
```

4. Set environment:
```bash
DMF_API_BASE_URL=http://localhost:5000
```

5. Run extension:
```powershell
F5  # Opens VS Code Extension Dev Host
```

---

## 4️⃣ GEMINI Setup

### A. Open Google AI Studio

Go to: **https://aistudio.google.com**

### B. Create New Chat

Click **New Chat**

### C. Copy System Prompt

Open file: `GEMINI_SYSTEM_PROMPT.md`

Copy **entire contents** and paste into Google AI Studio as your system prompt.

### D. Test with Example Queries

```
> "List my releases"
> "Score my top 5 tracks"
> "What would a single release cost?"
> "Generate a 30-day release plan"
> "Show me payouts at 100k streams"
```

### E. Monitor Network Requests

Open browser DevTools (F12) and watch Network tab as Gemini makes calls to `http://localhost:5000`.

### F. For Production

In `GEMINI_SYSTEM_PROMPT.md`, replace:
```
- **Base URL (Local):** http://localhost:5000
- **Base URL (Production):** https://api.dmf-music-platform.com
```

Update system prompt to use production URL.

---

## 5️⃣ OPENAI (ChatGPT/Assistants) Setup

### A. Go to OpenAI Platform

Visit: **https://platform.openai.com/assistants**

### B. Create New Assistant

Click **Create**

### C. Fill in Details

| Field | Value |
|-------|-------|
| Name | StreamGod / Ryia Boss |
| Description | DMF intelligent operator |
| Instructions | See below |

### D. Copy Instructions

Open file: `OPENAI_ASSISTANT_SETUP.md`

Copy the **Instructions** section (the large code block starting with "You are StreamGod...")

Paste into Assistant **Instructions** field.

### E. Add Tools (Functions)

In the **Tools** section:

1. Click **Add Tool** → **Function**
2. For each function listed in `OPENAI_ASSISTANT_SETUP.md`:
   - Copy the JSON definition
   - Paste into function schema
   - Set implementation: `GET /endpoint` or `POST /endpoint`

Functions to add:
- `list_releases`
- `list_tracks`
- `score_track`
- `get_recommendations`
- `analyze_catalog`
- `generate_insights`
- `get_release_quote`
- `get_payout_quote`
- `create_release`
- `check_health`

### F. Save Assistant

Click **Save**

### G. Test in Chat

At bottom, type:
```
> "What's in my catalog?"
> "Create a 30-day release plan"
> "Show me payout comparisons"
```

Watch as OpenAI calls your functions.

### H. For Production

Update the base URL in Instructions from:
```
Base URL: http://localhost:5000 (dev) or https://api.dmf-music-platform.com (prod)
```

To just production:
```
Base URL: https://api.dmf-music-platform.com
```

---

## 🔗 Environment Variables Summary

### Google AI Studio & Bolt (Vite)
```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=AIzaSyBDNdO2bNfxj_ej0qieN943ouqDqxWlfJY
VITE_FIREBASE_AUTH_DOMAIN=studio-3072539584-8871a.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=studio-3072539584-8871a
VITE_FIREBASE_STORAGE_BUCKET=studio-3072539584-8871a.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=328060654829
VITE_FIREBASE_APP_ID=1:328060654829:web:50e0e95b4bea1fd80ee8e4
VITE_FIREBASE_MEASUREMENT_ID=G-0T64VY6Y81
```

### VS Code Extension
```bash
DMF_API_BASE_URL=http://localhost:5000
DMF_EXTENSION_VERSION=1.0.0
DMF_SHOW_STREAMGOD_PANEL=true
DMF_AUTO_HEALTH_CHECK=true
```

### Gateway (`.env`)
```bash
PORT=5000
DOTNET_BRAIN_URL=http://localhost:5183
FIREBASE_BACKEND_URL=https://your-firebase-backend
LOVABLE_BACKEND_URL=https://your-lovable-backend
PAYMENTS_BACKEND_URL=http://localhost:5200
```

---

## 📊 Verification Checklist

### Local Development
- [ ] Gateway running on `:5000`
- [ ] .NET Brain running on `:5183`
- [ ] `curl http://localhost:5000/health` returns OK
- [ ] `curl http://localhost:5000/catalog/releases` returns JSON

### Google AI Studio
- [ ] `.env.local` configured with `VITE_API_BASE_URL`
- [ ] `dmf_api_client.ts` imported
- [ ] Test page can fetch releases and display them
- [ ] Network tab shows requests to `:5000`

### Bolt
- [ ] Project created with prompt
- [ ] `VITE_API_BASE_URL` environment variable set
- [ ] Generated code updated to use API client
- [ ] Dashboard displays releases from API

### VS Code
- [ ] REST Client extension installed
- [ ] `dmf.http` file opens
- [ ] "Send Request" works on health check
- [ ] Responses appear in output panel

### Gemini
- [ ] System prompt pasted into new chat
- [ ] Can ask "List my releases"
- [ ] Network tab shows requests to `:5000`
- [ ] Responses cite data from API

### OpenAI
- [ ] Assistant created in platform
- [ ] Instructions pasted
- [ ] All 10 functions added
- [ ] Test query works: "Check my catalog health"

---

## 🚢 Production Deployment

### 1. Deploy Gateway

```bash
cd gateway
# Create .env for production
echo "PORT=5000" > .env
echo "DOTNET_BRAIN_URL=https://api.dmf-music-platform.com" >> .env
echo "FIREBASE_BACKEND_URL=https://auth.dmf-music-platform.com" >> .env
echo "LOVABLE_BACKEND_URL=https://core.dmf-music-platform.com" >> .env
echo "PAYMENTS_BACKEND_URL=https://payments.dmf-music-platform.com" >> .env

# Deploy to Render / Railway / Fly.io
# (See gateway/README.md for steps)
```

### 2. Update All Frontends

**Google AI Studio:**
```bash
VITE_API_BASE_URL=https://api.dmf-music-platform.com
```

**Bolt:**
```bash
VITE_API_BASE_URL=https://api.dmf-music-platform.com
```

**VS Code Extension:**
```bash
DMF_API_BASE_URL=https://api.dmf-music-platform.com
```

**Gemini:**
Open chat, update system prompt:
```
Base URL: https://api.dmf-music-platform.com
```

**OpenAI:**
Update assistant instructions:
```
Base URL: https://api.dmf-music-platform.com
```

### 3. Verify Production

```bash
curl https://api.dmf-music-platform.com/health
```

---

## 💡 Common Workflows

### Artist: "Score my whole catalog"
1. Go to Google AI Studio
2. Dashboard auto-loads releases
3. Click "Score All" button
4. App calls `dmfApi.scoreTrack()` for each
5. Results displayed with recommendations

### Owner: "Generate 30-day release plan"
1. Go to Gemini chat
2. Ask: "Create a 30-day release plan for my best 5 tracks"
3. Gemini calls API functions:
   - `GET /catalog/releases`
   - `POST /brain/catalog/score` for each
   - `POST /distributor/release/quote`
4. Returns structured plan

### Developer: "Debug API response"
1. Open VS Code
2. Open `dmf.http`
3. Click "Send Request" on desired endpoint
4. View response in output panel
5. Modify request and re-send

### Developer: "Build a new tool"
1. Go to Bolt.new
2. Describe tool: "Create a royalty calculator"
3. Bolt generates UI
4. Add `dmfApi.getPayoutQuote()` calls
5. Deploy as standalone app

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot reach gateway" | Ensure `npm start` in `gateway/` directory |
| "CORS errors" | Gateway has CORS enabled, check browser console |
| "API returns 502" | Check backend URLs in `gateway/.env` |
| "Gemini not calling API" | Verify system prompt has correct base URL |
| "OpenAI functions failing" | Verify function implementations match endpoint paths |
| "Auth token invalid" | Get fresh Firebase token, set in API headers |

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `.env.google-ai-studio.example` | AI Studio template |
| `.env.bolt.example` | Bolt template |
| `.env.vscode-extension.example` | VS Code extension template |
| `GEMINI_SYSTEM_PROMPT.md` | Gemini setup + prompt |
| `OPENAI_ASSISTANT_SETUP.md` | OpenAI setup + instructions |
| `dmf_frontends.json` | Master frontend config |
| `dmf_api_client.ts` | Shared TypeScript client |
| `dmf.http` | VS Code REST client requests |
| `gateway/` | Multi-backend router |
| `gateway/.env.example` | Gateway config template |
| `FRONTEND_ARCHITECTURE.md` | Architecture docs |
| `FIVE_FACES_SETUP.md` | Integration guide |

---

## ✅ You Now Have

✅ One unified gateway router  
✅ Five different frontends  
✅ Shared API client for web apps  
✅ System prompts for AI agents  
✅ Full integration guide  
✅ Local + production setup  
✅ VS Code debugging tools  

**All five faces talking to one intelligent brain.**
