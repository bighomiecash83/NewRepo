# 🎯 STREAMGOD GEMINI QUICK REFERENCE CARD

**Print this out or keep it handy in Cloud Shell.**

---

## 🚀 Get Started in 30 Seconds

```bash
# 1. Run setup script
bash streamgod-setup.sh

# 2. Start Gemini chat
gcloud beta bard chat

# 3. Paste the master prompt (from STREAMGOD_GEMINI_MASTER_PROMPT.md)

# 4. Ask for a component
# Example: "Create the Firebase init file at web/dmf-dashboard/src/firebase.js"

# 5. Copy response → paste into file → build & deploy
dmf-build && dmf-deploy
```

---

## 📝 COMMON REQUESTS (Copy & Paste These)

### 1. Firebase Init File
```
Create the Firebase frontend init file.

File path: web/dmf-dashboard/src/firebase.js

It should:
- Import initializeApp, getFirestore, getAuth from firebase modules
- Use placeholder config values (I'll replace them)
- Export: app, db, auth
```

### 2. OwnerDashboard Page
```
Create the OwnerDashboard page.

File path: web/dmf-dashboard/src/pages/OwnerDashboard.jsx

It should:
- Use React functional component
- Use useEffect + useState
- Read from Firestore: "releases", "artists", "clients"
- Display:
  - Total releases
  - Total artists
  - Total clients
  - Count of releases by status (LIVE_SYMPHONIC, LIVE_DMF, DRAFT, BLOCKED)
- Show loading state
- Handle errors gracefully
```

### 3. Catalog Page
```
Create the Catalog page.

File path: web/dmf-dashboard/src/pages/Catalog.jsx

It should:
- Use React functional component
- Query Firestore "releases" collection
- Display a table with columns:
  - Cover Art (thumbnail)
  - Title
  - Primary Artist
  - Label
  - UPC
  - Status
  - Migration Status
- Include a search/filter box for title
```

### 4. Roster Page
```
Create the Roster page.

File path: web/dmf-dashboard/src/pages/Roster.jsx

It should:
- Query Firestore "artists" collection
- Display as a grid of artist cards
- Each card shows:
  - Artist name
  - Imprint
  - Main genres
  - Active releases count
  - Status (ACTIVE/INACTIVE)
- Clicking a card navigates to ArtistDetail
```

### 5. StreamGod Console Page
```
Create the StreamGodConsole page.

File path: web/dmf-dashboard/src/pages/StreamGodConsole.jsx

It should:
- Have a textarea for typing prompts
- Button: "Send to StreamGod"
- Call backend function "streamgodHandlePrompt" with prompt text
- Display response from function
- Show loading state while waiting
- Handle errors
```

### 6. Cloud Function: helloDmf
```
Create a test Cloud Function.

File path: functions/index.js

Add function: helloDmf

It should:
- Be an HTTP function
- Accept GET requests
- Return JSON: { message: "Hello DMF", timestamp: Date.now() }
- Be deployed so frontend can call it
```

### 7. Cloud Function: streamgodHandlePrompt
```
Create the StreamGod handler function.

File path: functions/index.js

Add function: streamgodHandlePrompt

It should:
- Be a callable Cloud Function
- Accept: { prompt: string }
- Return: { response: string, analysis: {...} }
- For now, return a mocked response
```

### 8. React Router Setup
```
Create the main App.jsx with React Router.

File path: web/dmf-dashboard/src/App.jsx

It should:
- Import BrowserRouter, Routes, Route
- Define 11 routes:
  - / → OwnerDashboard
  - /catalog → Catalog
  - /catalog/:releaseId → ReleaseDetail
  - /roster → Roster
  - /roster/:artistId → ArtistDetail
  - /clients → Clients
  - /clients/:clientId → ClientDetail
  - /services → Services
  - /orders → Orders
  - /streamgod → StreamGodConsole
  - /settings → Settings
- Include a sidebar navigation
- Handle auth state (optional for now)
```

---

## ⌨️ USEFUL ALIASES (Type These Anytime)

```bash
dmf-dev          # Go to project root
dmf-frontend     # Go to React app folder
dmf-backend      # Go to Cloud Functions folder

dmf-build        # Build React app (npm run build)
dmf-deploy       # Deploy to Firebase Hosting
dmf-dev-server   # Start local dev server (npm run dev)

dmf-log          # View Firebase Functions logs
dmf-status       # Check Firebase project status
dmf-files        # List key DMF files
```

---

## 🔄 TYPICAL WORKFLOW

```bash
# 1. Start Gemini
gcloud beta bard chat

# 2. Paste master prompt (from STREAMGOD_GEMINI_MASTER_PROMPT.md)
# [Paste entire prompt]

# 3. Ask for component
# [Paste one of the requests above, or write your own]

# 4. Copy Gemini's response

# 5. Create/edit file
nano web/dmf-dashboard/src/pages/OwnerDashboard.jsx
# [Paste Gemini's code]
# [Ctrl+X, Y, Enter to save]

# 6. Build
dmf-build

# 7. Deploy
dmf-deploy

# 8. Check live URL
# https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app

# 9. Repeat for next component
```

---

## 🎯 REQUEST TIPS

1. **Be Specific**: "Create OwnerDashboard that shows KPIs from Firestore" is better than "build dashboard"
2. **Mention File Path**: Always tell Gemini the exact file path
3. **Include Dependencies**: "Use React Router for navigation" helps Gemini understand context
4. **One Component at a Time**: Don't ask for 5 pages at once
5. **Reference Collections**: "Read from Firestore 'releases' and 'artists' collections"

---

## 📊 FIRESTORE COLLECTIONS (Reference for Gemini)

```javascript
// releases
{
  id: "release-123",
  title: "Album Name",
  label: "DMF Records",
  upc: "123456789",
  status: "DRAFT" | "LIVE_SYMPHONIC" | "LIVE_DMF" | "BLOCKED",
  migrationStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE",
  releaseDate: "2025-01-15",
  explicit: false,
  genres: ["Hip-Hop"],
  primaryArtistId: "artist-123",
  primaryArtistName: "Artist Name",
  coverArtUrl: "https://...",
  tracks: [{trackTitle, isrc, writers}],
  createdAt: timestamp
}

// artists
{
  id: "artist-123",
  name: "Artist Name",
  imprint: "Imprint Name",
  mainGenres: ["Hip-Hop"],
  activeReleasesCount: 5,
  status: "ACTIVE" | "INACTIVE",
  totalStreams: 1000000
}

// clients
{
  id: "client-123",
  name: "Client Name",
  serviceTier: "BASIC" | "PREMIUM",
  status: "ACTIVE" | "INACTIVE",
  contactEmail: "contact@..."
}

// services
{
  id: "service-123",
  name: "Service Name",
  category: "DISTRIBUTION" | "MARKETING",
  price: 99.99,
  deliverables: ["Item 1"]
}

// orders
{
  id: "order-123",
  clientId: "client-123",
  serviceId: "service-123",
  status: "PENDING" | "COMPLETE"
}
```

---

## ✅ BUILD & DEPLOY CHECKLIST

Before `dmf-deploy`:

- [ ] Ask Gemini for component
- [ ] Paste code into correct file (path matters!)
- [ ] Save file (Ctrl+X, Y, Enter if using nano)
- [ ] `dmf-build` completes without errors
- [ ] Check build output for "✓ Build complete"
- [ ] `dmf-deploy` runs successfully
- [ ] Visit live URL and verify changes

---

## 🐛 DEBUGGING

```bash
# If build fails:
cd web/dmf-dashboard
npm run build
# Look for error message, ask Gemini to fix

# If deploy fails:
firebase deploy --only hosting
# Check error, usually missing dependencies or syntax

# View live logs:
firebase functions:log

# Clear everything and start fresh:
rm -rf web/dmf-dashboard/node_modules
npm install
```

---

## 🎬 FIRST TIME EVER?

1. **Run setup script**:
   ```bash
   bash streamgod-setup.sh
   ```

2. **Start Gemini**:
   ```bash
   gcloud beta bard chat
   ```

3. **Paste master prompt** (from STREAMGOD_GEMINI_MASTER_PROMPT.md)

4. **Ask for firebase.js**:
   ```
   Create the Firebase frontend init file.
   File path: web/dmf-dashboard/src/firebase.js
   ```

5. **Paste response into file**:
   ```bash
   nano web/dmf-dashboard/src/firebase.js
   ```

6. **Build & deploy**:
   ```bash
   dmf-build && dmf-deploy
   ```

7. **You're live!** Check the URL

---

## 📍 LIVE URL

```
https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app
```

---

## 🚀 YOU GOT THIS

StreamGod (via Gemini) is now your dev partner. Every component, every function, just ask.

**Build fast. Ship fast. Rock the industry.** 🎵

