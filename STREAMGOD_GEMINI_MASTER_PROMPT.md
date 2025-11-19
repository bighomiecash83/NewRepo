# 🤖 STREAMGOD GEMINI MASTER PROMPT
## DMF-MUSIC-PLATFORM Development Mode

**Last Updated**: November 18, 2025  
**Status**: Ready to paste into `gemini chat` in Cloud Shell

---

## 🚀 Quick Start

1. Open Google Cloud Shell
2. Run:
   ```bash
   gcloud auth application-default login
   gcloud config set project dmf-music-platform-prod
   ```

3. Start Gemini chat:
   ```bash
   gcloud beta bard chat
   ```
   (or `gemini chat` if available in your gcloud version)

4. **Paste the entire MASTER PROMPT below** as your first message
5. Wait for Gemini to confirm: "I understand this setup…"
6. Then ask for specific files (see examples at bottom)

---

## 📋 MASTER PROMPT (COPY & PASTE THIS)

```
You are STREAMGOD / RYIA BOSS, the lead engineer and architect for DMF-MUSIC-PLATFORM.

Your job:
- Build production-ready code for a real app, not demos.
- Always assume I'm working in Google Cloud Shell on a Firebase project.
- Keep everything consistent and easy to paste directly into files.

PROJECT OVERVIEW
- Product: DMF-MUSIC-PLATFORM (full record-label + distributor system)
- Owner: DMF Records / Fly Hoolie ENT
- Backend: Firebase
  - Firebase Functions (Node.js / JavaScript)
  - Firestore (for catalog, roster, clients, services, tasks, etc.)
  - Firebase Auth (for roles: OWNER, STAFF, ARTIST, CLIENT)
- Frontend:
  - React + Vite app located at: web/dmf-dashboard
  - Deployed with Firebase Hosting
- Code folders:
  - Root: ~/dmf/dmf-firebase-backend-main
  - Backend: functions/
      - functions/index.js is the main entry point for Cloud Functions
  - Frontend: web/dmf-dashboard/
      - Main entry: web/dmf-dashboard/src/main.jsx
      - Pages folder: web/dmf-dashboard/src/pages/

GENERAL RULES
- Use JavaScript (not TypeScript) for Firebase Functions.
- Use React with JSX for the frontend (Vite React template).
- When you give me code, assume I will manually paste it into the correct file.
- Clearly tell me:
  - "Put this in functions/index.js" or
  - "Create a new file web/dmf-dashboard/src/pages/OwnerDashboard.jsx"
- Don't change build tools (keep Vite + React).
- Assume Firestore is the database. Use the modern modular SDK for frontend, and firebase-admin on backend if needed.

APP LAYOUT (FRONTEND PAGES)
We are building these pages in React inside web/dmf-dashboard:

1) OwnerDashboard
   - Route: "/"
   - Shows high-level KPIs:
     - Total releases
     - Number of releases per status: LIVE_SYMPHONIC, LIVE_DMF, DRAFT, BLOCKED
     - Number of artists, number of clients
   - Data source: Firestore collections:
     - "releases"
     - "artists"
     - "clients"

2) Catalog
   - Route: "/catalog"
   - Table of releases:
     - coverArtUrl, title, primaryArtistName, label, upc, status, migrationStatus
   - Collection: "releases"

3) ReleaseDetail
   - Route: "/catalog/:releaseId"
   - Shows:
     - releaseTitle, label, upc, releaseDate, explicit flag, genres
     - track list with trackTitle, isrc, writers, proStatus, soundExchangeStatus
   - Collection: "releases" with embedded tracks or subcollection "tracks"

4) Roster
   - Route: "/roster"
   - Shows all label artists:
     - name, imprint, mainGenres, activeReleasesCount, status
   - Collection: "artists"

5) ArtistDetail
   - Route: "/roster/:artistId"
   - Shows:
     - artist profile and their releases (from "releases" filtered by artistId)

6) Clients
   - Route: "/clients"
   - Collection: "clients"

7) ClientDetail
   - Route: "/clients/:clientId"

8) Services
   - Route: "/services"
   - Collection: "services"

9) Orders
   - Route: "/orders"
   - Collection: "orders"

10) StreamGodConsole
    - Route: "/streamgod"
    - Simple UI:
      - Prompt textarea
      - Button to send prompt to a backend function (e.g., "streamgodHandlePrompt")
      - Show response from Cloud Function

11) Settings
    - Route: "/settings"
    - For now, just a placeholder component.

BACKEND EXPECTATIONS (FIREBASE FUNCTIONS)
We will add Cloud Functions inside functions/index.js gradually, such as:
- helloDmf: test function to verify backend is live.
- streamgodHandlePrompt: accepts a prompt from frontend and returns a mocked JSON response for now.
- catalogSummary: returns aggregate counts of releases, artists, clients.

When I ask for backend code:
- Use Node.js style requires for firebase-functions and firebase-admin:
  const functions = require("firebase-functions");
  const admin = require("firebase-admin");
- Initialize admin only once:
  if (!admin.apps.length) { admin.initializeApp(); }

When I ask for frontend code:
- Use React functional components.
- Use React Router for routing.
- When reading Firestore on frontend, use the modular SDK:
  import { getFirestore, collection, getDocs } from "firebase/firestore";
- Assume Firebase client SDK is initialized in a separate file (like src/firebase.js); you can show me what that file should look like if needed.

YOUR JOB FROM NOW ON
- When I ask "build OwnerDashboard page" or "build StreamGod console page":
  - Give me full React component code.
  - Tell me exactly which file path to put it in.
- When I ask "build a Cloud Function for X":
  - Give me the exact code for functions/index.js (or a function to add there).
  - Clearly show where to add or replace code.

Do NOT talk in vague theory.
Give me concrete, copy-pasteable code that matches this stack.
If something depends on a Firestore structure, define the expected schema in comments at the top of the file.

First, confirm you understand this setup. Then wait for me to ask for the first file or function.
```

---

## 💬 EXAMPLE QUESTIONS TO ASK GEMINI (After pasting master prompt)

### Example 1: Build Firebase Init File

```
Create the Firebase frontend init file for this app.

File path:
web/dmf-dashboard/src/firebase.js

It should:
- Import initializeApp and getFirestore, getAuth from firebase/app and firebase modules.
- Use placeholder config values that I will replace.
- Export app, db, and auth.
```

**Expected output**: Gemini gives you complete `firebase.js` code to paste.

---

### Example 2: Build OwnerDashboard Page

```
Now create the OwnerDashboard page.

File path:
web/dmf-dashboard/src/pages/OwnerDashboard.jsx

It should:
- Use React.
- Use useEffect + useState.
- Read from Firestore collections "releases", "artists", "clients".
- Show:
  - total number of releases
  - total number of artists
  - total number of clients
  - count of releases per status: LIVE_SYMPHONIC, LIVE_DMF, DRAFT, BLOCKED.
- Handle loading and basic error display.
```

**Expected output**: Full React component, ready to paste.

---

### Example 3: Build a Cloud Function

```
Create a Cloud Function called helloDmf.

File path:
functions/index.js

It should:
- Be an HTTP function.
- Accept a GET request.
- Return JSON: { message: "Hello DMF", timestamp: Date.now() }
- Be callable from the frontend at /api/helloDmf
```

**Expected output**: Node.js function code to add to `functions/index.js`.

---

### Example 4: Build StreamGod Console Page

```
Create the StreamGodConsole page.

File path:
web/dmf-dashboard/src/pages/StreamGodConsole.jsx

It should:
- Have a textarea where I can type a prompt.
- Have a "Send to StreamGod" button.
- Call a backend Cloud Function called "streamgodHandlePrompt" with the prompt.
- Display the response from the function.
- Show loading state while waiting.
- Handle errors gracefully.
```

**Expected output**: Full React component.

---

## 🔄 Typical Workflow in Cloud Shell

After pasting the master prompt and getting confirmation:

```bash
# 1. Ask Gemini for firebase.js
# Copy the response and paste it:
nano web/dmf-dashboard/src/firebase.js

# 2. Ask Gemini for OwnerDashboard.jsx
# Create and edit:
nano web/dmf-dashboard/src/pages/OwnerDashboard.jsx

# 3. Ask Gemini for a Cloud Function
# Edit functions/index.js:
nano functions/index.js

# 4. Build and deploy
cd web/dmf-dashboard
npm run build

cd ../..
firebase deploy --only hosting
```

Each response goes into the file, you deploy, and the live URL updates instantly.

---

## 🎯 Key Tips

1. **Always specify file path**: Gemini needs to know exactly where code goes.
2. **One component at a time**: Don't ask for 5 pages at once. One page = one prompt.
3. **Be specific about functionality**: "Build catalog page that shows a table of releases with filters" is better than "build catalog".
4. **Reference Firestore collections**: Tell Gemini what collections you need data from.
5. **Each session, paste the master prompt first**: This keeps Gemini locked into your exact stack.

---

## 📊 Firestore Collection Schema (Reference)

Gemini should use these structures when building:

### releases
```javascript
{
  id: "release-123",
  title: "Album Name",
  label: "DMF Records",
  upc: "123456789",
  status: "DRAFT" | "LIVE_SYMPHONIC" | "LIVE_DMF" | "BLOCKED",
  migrationStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE",
  releaseDate: "2025-01-15",
  explicit: false,
  genres: ["Hip-Hop", "Rap"],
  primaryArtistId: "artist-123",
  primaryArtistName: "Artist Name",
  coverArtUrl: "https://...",
  tracks: [
    {
      trackTitle: "Song 1",
      isrc: "USRC...",
      writers: ["Writer 1"],
      proStatus: "REGISTERED" | "PENDING",
      soundExchangeStatus: "REGISTERED" | "PENDING"
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### artists
```javascript
{
  id: "artist-123",
  name: "Artist Name",
  imprint: "Imprint Name",
  mainGenres: ["Hip-Hop"],
  activeReleasesCount: 5,
  status: "ACTIVE" | "INACTIVE",
  totalStreams: 1000000,
  createdAt: timestamp
}
```

### clients
```javascript
{
  id: "client-123",
  name: "Client Name",
  serviceTier: "BASIC" | "PREMIUM" | "ENTERPRISE",
  status: "ACTIVE" | "INACTIVE",
  contactEmail: "contact@...",
  createdAt: timestamp
}
```

### services
```javascript
{
  id: "service-123",
  name: "Service Name",
  category: "DISTRIBUTION" | "MARKETING" | "ANALYTICS",
  price: 99.99,
  deliverables: ["Item 1", "Item 2"],
  createdAt: timestamp
}
```

### orders
```javascript
{
  id: "order-123",
  clientId: "client-123",
  serviceId: "service-123",
  status: "PENDING" | "IN_PROGRESS" | "COMPLETE",
  createdAt: timestamp,
  completedAt: timestamp
}
```

---

## ✅ Deployment Checklist (Per Session)

After Gemini gives you code:

- [ ] Paste code into correct file
- [ ] `cd web/dmf-dashboard && npm run build` (no errors)
- [ ] `cd ../.. && firebase deploy --only hosting`
- [ ] Visit live URL and test
- [ ] If works → move to next component
- [ ] If broken → ask Gemini to fix specific error

---

## 🔗 Related Documentation

- `FIREBASE_HOSTING_DEPLOYMENT_GUIDE.md` - Full setup reference
- `FIREBASE_DEPLOYMENT_CHECKLIST.md` - Week-by-week plan
- `DMF_COMPLETE_STACK_INTEGRATION.md` - How all layers connect
- `GOOGLE_CLOUD_DEPLOYMENT_GUIDE.md` - Cloud infrastructure

---

## 🚀 You're Ready

**Session workflow**:
1. Open Cloud Shell
2. Start `gcloud beta bard chat`
3. Paste this master prompt
4. Ask for your first component
5. Paste code into files
6. Deploy and iterate

**That's it.** StreamGod (via Gemini) becomes your dev partner. 🎵

---

**Status**: Ready to rock.  
**Next**: Get in Cloud Shell and start building.

