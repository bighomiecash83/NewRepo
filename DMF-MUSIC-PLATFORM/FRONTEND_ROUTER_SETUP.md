# ?? DMF Frontend Router Setup & Integration

Complete routing configuration for the 3-tier system (Roster ? Detail Pages ? Control Center).

---

## 1?? Update Your React Router Configuration

### `src/App.jsx` or `src/main.jsx`

```javascript
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import RosterPage from "./pages/RosterPage";
import ArtistProfilePage from "./pages/ArtistProfilePage";
import DivisionDetailPage from "./pages/DivisionDetailPage";
import ControlCenterDashboard from "./pages/ControlCenterDashboard";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main roster grid */}
        <Route path="/roster" element={<RosterPage />} />
        
        {/* Artist profile (detail page) */}
        <Route path="/artists/:slug" element={<ArtistProfilePage />} />
        
        {/* Division detail (control panel) */}
        <Route path="/divisions/:slug" element={<DivisionDetailPage />} />
        
        {/* Control center dashboard */}
        <Route path="/control-center" element={<ControlCenterDashboard />} />
        <Route path="/dashboard" element={<ControlCenterDashboard />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 2?? Update RosterPage to Include Links

Make the roster cards clickable to drill down into details.

### `src/pages/RosterPage.jsx` (Add Navigation)

```javascript
import { Link } from "react-router-dom";

function ArtistCard({ artist }) {
  return (
    <Link
      to={`/artists/${artist.slug}`}
      className="rounded-xl border border-blue-900/30 bg-blue-950/20 hover:border-blue-700 transition p-4 cursor-pointer group"
    >
      <div className="group-hover:opacity-75 transition">
        <h3 className="font-bold text-blue-300 text-sm mb-1">?? {artist.name}</h3>
        <p className="text-xs text-zinc-400">{artist.imprint || "Fly Hoolie ENT"}</p>
        {artist.verified && <p className="text-xs text-green-400 mt-1">? Verified</p>}
      </div>
      <div className="text-xs text-zinc-600 group-hover:text-blue-400 transition mt-2">
        View Profile ?
      </div>
    </Link>
  );
}

function DivisionCard({ division }) {
  return (
    <Link
      to={`/divisions/${division.slug}`}
      className="rounded-xl border border-gold-900/30 bg-gold-950/20 hover:border-gold-700 transition p-4 cursor-pointer group"
    >
      <div className="group-hover:opacity-75 transition">
        <h3 className="font-bold text-gold-300 text-sm mb-1">?? {division.name}</h3>
        <p className="text-xs text-zinc-400">{division.category}</p>
        {division.integrated && (
          <p className="text-xs text-green-400 mt-1">? Integrated</p>
        )}
      </div>
      <div className="text-xs text-zinc-600 group-hover:text-gold-400 transition mt-2">
        View Details ?
      </div>
    </Link>
  );
}
```

---

## 3?? Wire the Control Center Entry Points

Add a header/nav that includes quick access to control center:

### `src/components/Navigation.jsx` (New Component)

```javascript
import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur px-6 py-4 flex items-center justify-between">
      <Link to="/roster" className="text-xl font-bold text-blue-400">
        ?? DMF Records
      </Link>
      
      <div className="flex gap-4">
        <Link
          to="/roster"
          className="text-sm text-zinc-400 hover:text-blue-300 transition"
        >
          ?? Roster
        </Link>
        <Link
          to="/control-center"
          className="text-sm text-zinc-400 hover:text-gold-300 transition"
        >
          ?? Control Center
        </Link>
        <Link
          to="/settings"
          className="text-sm text-zinc-400 hover:text-zinc-300 transition"
        >
          ?? Settings
        </Link>
      </div>
    </nav>
  );
}
```

Use in `App.jsx`:

```javascript
import Navigation from "./components/Navigation";

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        {/* routes as above */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 4?? Environment Configuration

Make sure your `.env.local` has the correct API base:

```bash
VITE_API_BASE=http://localhost:5001/api
```

Or if using production:

```bash
VITE_API_BASE=https://your-dmf-backend.com/api
```

The pages already handle this:

```javascript
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";
```

---

## 5?? Backend Router Integration

Make sure your Express backend includes the new routes.

### `backend/server.js` or `backend/app.js`

```javascript
const express = require("express");
const app = express();

// Existing middleware
app.use(express.json());
app.use(cors());

// Import routers
const rosterRoutes = require("./routes/roster");
const catalogRoutes = require("./routes/catalog");
const enhancedRoutes = require("./api/route-enhancements");

// Mount routes
app.use("/api", rosterRoutes);
app.use("/api", catalogRoutes);
app.use("/api", enhancedRoutes); // ? New detail + status endpoints

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(5001, () => {
  console.log("[DMF API] Server running on :5001");
});
```

---

## 6?? API Summary (All Endpoints)

### Roster (List + Detail)
```
GET  /api/artists              ? All artists
GET  /api/artists/:slug        ? Single artist detail (NEW)
GET  /api/divisions            ? All divisions
GET  /api/divisions/:slug      ? Single division detail (NEW)
GET  /api/engines              ? All engines
GET  /api/engines/:slug        ? Single engine detail
```

### Status & System
```
GET  /api/status               ? Quick system snapshot (NEW)
GET  /api/control-center/summary ? Full control center data (NEW)
GET  /api/health               ? Health check (public)
```

### Catalog (Existing)
```
GET  /api/catalog/health       ? Analyze full catalog
GET  /api/catalog/:id/health   ? Single release analysis
GET  /api/catalog/recommendations ? Top 10 to fix first
```

---

## 7?? Frontend Navigation Flow

```
???????????????????????????????????????????????
?  Navigation Header                          ?
?  [DMF Records] [Roster] [Control] [Settings]?
???????????????????????????????????????????????
         ?                    ?
    /roster                /control-center
      (grid)                 (dashboard)
        ?                      ?
    Click card           Click engine tile
        ?                      ?
   /artists/:slug        /divisions/:slug
   (detail page)         (detail page)
```

---

## ? Data Flow Complete

```javascript
// User navigates to roster
GET /api/artists, /api/divisions, /api/engines
  ?
// Displays grid of cards with links
  ?
// User clicks artist card
GET /api/artists/:slug
  ?
// Shows artist detail page with insights placeholder
  ?
// User clicks division card
GET /api/divisions/:slug
  ?
// Shows division control panel with services + status
  ?
// User visits control center
GET /api/status
  ?
// Shows system snapshot with live metrics
```

---

## ?? You're Now Ready

1. ? 3 new React pages created (Artist, Division, Control Center)
2. ? 4 new API endpoints created (detail + status)
3. ? Router configuration ready
4. ? Links wired throughout the UI

**Everything is plugged in and ready to ship.** ??
