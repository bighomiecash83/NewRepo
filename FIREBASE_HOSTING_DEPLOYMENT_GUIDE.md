# 🚀 DMF Firebase Hosting Setup - Complete Deployment Guide

**Status**: Firebase Hosting live + ready  
**Main URL**: `dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app`  
**Goal**: Deploy complete DMF frontend to this URL  
**Timeline**: Build React app in parallel with backend (2-3 weeks)

---

## 🎯 What We're Deploying

### Two Firebase Hosting Sites (Clear Roles)

| Site | URL | Purpose | Status |
|------|-----|---------|--------|
| **mf-firebase-backend-main** | `dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app` | **PRODUCTION** - DMF Dashboard (dashboard, catalog, roster, clients, services, StreamGod, settings) | ⚙️ Will deploy React app here |
| **studio** | `studio--studio-5828448336-5a604.us-central1.hosted.app` | **SANDBOX** - Experiments, Firebase Studio auto-builds, dev playground | ✅ Keep as-is |

**Clear rule**: 
- `mf-firebase-backend-main` = Where the real DMF app lives
- `studio` = Lab for testing new ideas

---

## 📋 Prerequisites (Check These First)

Before we build the React app:

```bash
# 1. Check Firebase CLI is installed
firebase --version
# Should be v12.0.0 or higher

# 2. Check which Firebase projects you can access
firebase projects:list

# 3. Find your mf-firebase-backend-main project
# Should see something like:
# ✓ mf-firebase-backend-main (ID: mf-firebase-backend-main)
```

If you don't see `mf-firebase-backend-main`, run:

```bash
firebase use mf-firebase-backend-main
# or
firebase use --add
# Then select mf-firebase-backend-main from the list
```

---

## 🏗️ Project Structure (Where Everything Goes)

After this setup, your repo will look like:

```
dmf-music-platform/
├── firebase.json              ← Config for Hosting
├── firestore.rules            ← Security rules
├── .firebaserc                ← Project reference
│
├── functions/                 ← Cloud Functions (backend)
│   ├── src/
│   │   ├── index.ts
│   │   ├── db/mongoClient.ts
│   │   └── ...
│   └── package.json
│
├── web/                       ← Frontend React app (NEW)
│   ├── dmf-dashboard/
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── firebase.ts    ← Firebase client init
│   │   │   ├── pages/
│   │   │   │   ├── OwnerDashboard.tsx
│   │   │   │   ├── Catalog.tsx
│   │   │   │   ├── ReleaseDetail.tsx
│   │   │   │   ├── Roster.tsx
│   │   │   │   ├── ArtistDetail.tsx
│   │   │   │   ├── Clients.tsx
│   │   │   │   ├── ClientDetail.tsx
│   │   │   │   ├── Services.tsx
│   │   │   │   ├── Orders.tsx
│   │   │   │   ├── StreamGodConsole.tsx
│   │   │   │   └── Settings.tsx
│   │   │   ├── hooks/        ← Custom React hooks
│   │   │   │   ├── useReleases.ts
│   │   │   │   ├── useArtists.ts
│   │   │   │   ├── useClients.ts
│   │   │   │   └── ...
│   │   │   ├── components/   ← Reusable components
│   │   │   │   ├── shared/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   └── ...
│   │   │   │   └── ...
│   │   │   └── App.tsx        ← Router + layout
│   │   ├── dist/              ← Built output (Firebase reads this)
│   │   ├── index.html
│   │   ├── vite.config.ts     ← Vite config
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── public/                ← Static assets
│       ├── logo.png
│       └── ...
│
└── dmf-music-platform.sln     ← .NET solution (backend)
```

---

## 🚀 Step 1: Create React Vite App in web/ folder

### 1a. Create the web directory structure

```bash
cd c:\Users\bigho\source\repos\dmf-music-platform

# Create web folder if it doesn't exist
mkdir -p web

cd web
```

### 1b. Create Vite + React app

```bash
npm create vite@latest dmf-dashboard -- --template react --typescript
cd dmf-dashboard
npm install
```

This creates a production-ready React + Vite scaffold.

### 1c. Install Firebase SDK + Router

```bash
npm install firebase react-router-dom
npm install -D @types/react-router-dom
```

---

## 🔗 Step 2: Configure firebase.json for web deployment

Edit (or create) `firebase.json` in **root** of your project (`c:\Users\bigho\source\repos\dmf-music-platform\`):

```json
{
  "hosting": {
    "site": "mf-firebase-backend-main",
    "public": "web/dmf-dashboard/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "**/.*"
      ]
    }
  ]
}
```

**Key lines**:
- `"public": "web/dmf-dashboard/dist"` → Tells Firebase where to find the built React app
- `"rewrites": [{ "source": "**", "destination": "/index.html" }]` → Routes all URLs to index.html (so React Router works)

---

## 🔐 Step 3: Create Firebase client init (web/dmf-dashboard/src/firebase.ts)

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Get your config from Firebase Console
// Project Settings → Your apps → Web app → Firebase SDK snippet
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
```

---

## 🔑 Step 4: Create .env.local with Firebase credentials

Create `web/dmf-dashboard/.env.local`:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=mf-firebase-backend-main
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Get these from**:
1. Firebase Console
2. Project Settings
3. Your apps → Web app
4. Firebase SDK snippet (scroll down to see config)

---

## 📱 Step 5: Create App.tsx with routing

Create `web/dmf-dashboard/src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { User } from 'firebase/auth';

// Pages (you'll build these next)
import OwnerDashboard from './pages/OwnerDashboard';
import Catalog from './pages/Catalog';
import ReleaseDetail from './pages/ReleaseDetail';
import Roster from './pages/Roster';
import ArtistDetail from './pages/ArtistDetail';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Services from './pages/Services';
import Orders from './pages/Orders';
import StreamGodConsole from './pages/StreamGodConsole';
import Settings from './pages/Settings';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar Navigation */}
        <nav style={{ width: '250px', backgroundColor: '#f0f0f0', padding: '20px' }}>
          <h2>DMF</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><a href="/">Dashboard</a></li>
            <li><a href="/catalog">Catalog</a></li>
            <li><a href="/roster">Roster</a></li>
            <li><a href="/clients">Clients</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/orders">Orders</a></li>
            <li><a href="/streamgod">StreamGod</a></li>
            <li><a href="/settings">Settings</a></li>
            <li>
              <button onClick={() => auth.signOut()}>Logout</button>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<OwnerDashboard />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:releaseId" element={<ReleaseDetail />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/roster/:artistId" element={<ArtistDetail />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:clientId" element={<ClientDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/streamgod" element={<StreamGodConsole />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

---

## 📄 Step 6: Create page stubs

Create minimal pages in `web/dmf-dashboard/src/pages/`:

### OwnerDashboard.tsx (example)

```typescript
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function OwnerDashboard() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const releasesSnap = await getDocs(collection(db, 'releases'));
        setReleases(releasesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching releases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Owner Dashboard</h1>
      {loading ? <p>Loading...</p> : <p>Found {releases.length} releases</p>}
    </div>
  );
}
```

### Other pages (minimal stubs for now):

Create `Catalog.tsx`, `Roster.tsx`, `Clients.tsx`, `Services.tsx`, `Orders.tsx`, `StreamGodConsole.tsx`, `Settings.tsx`, `ReleaseDetail.tsx`, `ArtistDetail.tsx`, `ClientDetail.tsx`, `Login.tsx` - all with similar minimal structure.

---

## 🏗️ Step 7: Build and test locally

```bash
# From web/dmf-dashboard folder
npm run dev

# Should show:
# ✓ ready in 123 ms
# ➜ Local:   http://localhost:5173/
# ➜ press h to show help
```

Visit `http://localhost:5173/` and you should see your React app.

---

## 🚀 Step 8: Deploy to Firebase Hosting

From **root** of your project (`c:\Users\bigho\source\repos\dmf-music-platform\`):

```bash
# 1. Build the React app
cd web/dmf-dashboard
npm run build

# Should create web/dmf-dashboard/dist/ folder

# 2. Go back to root
cd ../..

# 3. Deploy to Firebase Hosting
firebase deploy --only hosting

# Should show:
# ✓ Deploy complete!
# Project Console: https://console.firebase.google.com/project/mf-firebase-backend-main/overview
# Hosting URL: https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app
```

---

## ✅ What Just Happened

After deploy, you can:

1. **Visit**: `https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app`
2. **Login** with Firebase Auth credentials (email/password)
3. **See** your React app running with:
   - Dashboard (showing releases count)
   - Navigation to other pages
   - Real data from Firestore (if collections exist)

---

## 🔄 Deployment Workflow (Repeat This Each Time)

After building pages:

```bash
# From web/dmf-dashboard
npm run build

# From root
firebase deploy --only hosting
```

**That's it.** Firebase automatically redeploys to `dmf-firebase-backend-main` URL.

---

## 📋 Firestore Collections Needed (For App to Work)

Before the app can show real data, you need these collections in Firestore:

```
releases/           ← All releases
├─ {releaseId}
│  ├─ title
│  ├─ type (Single, EP, Album)
│  ├─ primaryArtistId
│  ├─ status (DRAFT, LIVE_SYMPHONIC, LIVE_DMF, BLOCKED)
│  ├─ qcScore (0-100)
│  ├─ coverArtUrl
│  └─ tracks[] (subcollection or array)

artists/            ← All artists
├─ {artistId}
│  ├─ stageName
│  ├─ legalName
│  ├─ label
│  ├─ status (Active, On Hold, Development)
│  └─ totalStreams

clients/            ← B2B customers
├─ {clientId}
│  ├─ name
│  ├─ serviceTier
│  └─ status

services/           ← Service offerings
├─ {serviceId}
│  ├─ name
│  ├─ category
│  ├─ price
│  └─ deliverables[]

orders/             ← Service orders
├─ {orderId}
│  ├─ clientId OR artistId
│  ├─ serviceId
│  ├─ status (NEW, IN_PROGRESS, COMPLETE)
│  └─ dueDate

streamgod_tasks/    ← AI-generated tasks
├─ {taskId}
│  ├─ description
│  ├─ status
│  └─ relatedReleaseId
```

**Start with empty collections** (just create them in Firebase Console). The React app will know how to read them once they have data.

---

## 🎯 Deployment Strategy

### Option A: Deploy as you build (Recommended for MVP)

```
Week 1:
  Day 1-2: Build Dashboard + Catalog pages
  Day 3: Deploy (firebase deploy --only hosting)
  Day 4-5: Build Roster + Clients
  Day 6: Deploy again

Week 2:
  Day 7-8: Build Services + Orders
  Day 9: Deploy
  Day 10: Polish + final deploy
```

**Each deploy is 30 seconds.** No downtime.

### Option B: Build everything, then deploy once

```
Week 1-2: Build all pages locally
Week 3: Deploy everything at once
```

Less frequent deployments, but can't test live until the end.

**I recommend Option A** – deploy early, test live sooner.

---

## 🔒 Firestore Security Rules

Once your app is live, protect your data with these rules. In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Owner/Admin can do everything
    match /{document=**} {
      allow read, write: if request.auth.token.role in ['Owner', 'Admin'];
    }

    // Staff can read/write to releases, artists, etc.
    match /releases/{releaseId} {
      allow read: if request.auth.token.role in ['Owner', 'Admin', 'Staff'];
      allow write: if request.auth.token.role in ['Owner', 'Admin'];
    }

    match /artists/{artistId} {
      allow read: if request.auth.token.role in ['Owner', 'Admin', 'Staff'];
      allow write: if request.auth.token.role in ['Owner', 'Admin'];
    }

    // Artists can read their own data
    match /artists/{artistId} {
      allow read: if request.auth.uid == artistId;
    }

    // Clients can read/write orders
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.clientId;
      allow write: if request.auth.uid == resource.data.clientId;
    }
  }
}
```

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm create vite` fails | Check Node.js v18+: `node --version` |
| Firebase not found in `.env` | Check `.env.local` has all 6 vars, restart dev server |
| `firebase deploy` fails | Run `firebase use mf-firebase-backend-main` first |
| Page shows blank | Check browser console (F12), look for errors |
| Firestore returns empty | Check collections exist in Firebase Console, check security rules allow reads |
| "Cannot find module firebase" | Run `npm install firebase` in `web/dmf-dashboard` folder |

---

## 🎬 Success Looks Like (Week 2 Friday)

You visit: `https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app`

You see:
- ✅ Login screen (with Firebase Auth)
- ✅ Dashboard (with real releases count from Firestore)
- ✅ Catalog page (searchable, filterable)
- ✅ Roster page (artist list)
- ✅ Clients page (B2B customers)
- ✅ Services page (service offerings)
- ✅ Orders page (fulfillment tracking)
- ✅ StreamGod console (AI analysis)
- ✅ Settings page (branding, config)
- ✅ Real-time updates (edit data in one tab, see in another)

**All live on Firebase Hosting.**

---

## 📞 Next Steps (In Order)

1. **Today**: Run `npm create vite` in `web/` folder
2. **Today**: Set up firebase.json + .env.local
3. **Today**: Test locally (`npm run dev`)
4. **Tomorrow**: Start building pages (use templates from FRONTEND_COMPONENT_TEMPLATES.md)
5. **End of Week 1**: First deployment
6. **Week 2**: Build remaining pages + deploy
7. **Week 2 Friday**: Full DMF app live on Firebase Hosting

---

**Status**: Ready to Build 🚀  
**Hosting**: Live ✅  
**Next**: Create React app + build pages  
**Timeline**: 2 weeks to MVP

Let's ship this.
