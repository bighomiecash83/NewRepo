# ?? Du'ryia StreamGod Brain - Quick Start

## **In 3 Steps**

### **Step 1: Configure MongoDB** (30 seconds)

Edit `appsettings.json`:

```json
{
  "MongoDB": {
    "ConnectionString": "mongodb+srv://bighomiecash8346:<YOUR_PASSWORD>@dmf-music-platform.pfqrhc.mongodb.net/?appName=DMF-MUSIC-platform"
  }
}
```

Replace `<YOUR_PASSWORD>` with your MongoDB password.

---

### **Step 2: Run Backend** (F5 in Visual Studio)

```bash
# Or via command line:
cd DMF-MUSIC-PLATFORM
dotnet run
```

**Expected output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
```

Test it:
```bash
curl https://localhost:5001/api/catalog/health-check
# Should return: {"status":"healthy","mongodb":"connected"}
```

---

### **Step 3: Add Frontend Components to Lovable**

In your Lovable project, create these 2 files:

#### **File 1: `src/services/catalogService.ts`**

```typescript
const API_BASE = process.env.REACT_APP_API_URL || 'https://dmf-music-platform.lovable.app/api';

export interface CatalogHealthResponse {
  summary: {
    totalReleases: number;
    totalTracks: number;
    releasesReadyForDistribution: number;
    tracksReadyForDistribution: number;
    avgReleaseReadiness: number;
    avgTrackReadiness: number;
    analyzedAt: string;
  };
  releases: any[];
  tracks: any[];
  isCatalogHealthy: boolean;
}

async function getAuthToken() {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

export const catalogService = {
  async getCatalogHealth(): Promise<CatalogHealthResponse> {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}/catalog/health`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async getRecommendations() {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}/catalog/recommendations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/catalog/health-check`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch {
      return false;
    }
  }
};
```

#### **File 2: `src/components/CatalogDashboard.tsx`**

```typescript
import React, { useEffect, useState } from 'react';
import { catalogService } from '../services/catalogService';

export function CatalogDashboard() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    catalogService.getCatalogHealth()
      .then(setHealth)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!health) return null;

  const { summary, releases, tracks } = health;

  return (
    <div className="p-6 bg-gradient-to-b from-gray-900 to-black text-white space-y-6">
      <h1 className="text-4xl font-bold text-yellow-400">?? StreamGod Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card label="Total Releases" value={summary.totalReleases} />
        <Card label="Total Tracks" value={summary.totalTracks} />
        <Card label="Releases Ready" value={summary.releasesReadyForDistribution} />
        <Card label="Tracks Ready" value={summary.tracksReadyForDistribution} />
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-2 gap-6">
        <Gauge label="Release Readiness" score={summary.avgReleaseReadiness} />
        <Gauge label="Track Readiness" score={summary.avgTrackReadiness} />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-2 gap-6">
        <ItemList title="Releases" items={releases.slice(0, 5)} />
        <ItemList title="Tracks" items={tracks.slice(0, 5)} />
      </div>

      <button
        onClick={() => location.reload()}
        className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded"
      >
        ?? Refresh
      </button>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-gray-800 p-4 rounded border border-gray-700">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-3xl font-bold text-yellow-400 mt-1">{value}</p>
    </div>
  );
}

function Gauge({ label, score }) {
  const color = score >= 80 ? 'text-green-400' : score >= 70 ? 'text-yellow-400' : 'text-red-400';
  const bar = score >= 80 ? 'bg-green-600' : score >= 70 ? 'bg-yellow-600' : 'bg-red-600';

  return (
    <div className="bg-gray-800 p-6 rounded border border-gray-700">
      <p className="font-semibold mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{score}%</p>
      <div className="mt-3 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${bar}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ItemList({ title, items }) {
  return (
    <div className="bg-gray-800 p-4 rounded border border-gray-700">
      <h3 className="font-bold text-yellow-400 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="bg-gray-700 p-2 rounded text-sm">
            <p className="font-semibold">{item.title}</p>
            <p className="text-gray-400">{item.score}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### **File 3: `.env.local`**

```
REACT_APP_API_URL=https://your-backend-url/api
```

---

## **Deploy Backend**

### Option A: Azure App Service
```bash
az webapp up --name dmf-music-api --runtime "dotnet:10.0"
```

### Option B: Docker
```bash
docker build -t dmf-api .
docker run -p 5001:8080 -e MongoDB__ConnectionString="..." dmf-api
```

### Option C: Self-hosted
```bash
dotnet publish -c Release
# Copy bin/Release/net10.0/publish/* to your server
```

---

## **Deploy Frontend**

### Lovable
1. Add the 3 files above
2. Push to git
3. Lovable auto-deploys to `https://dmf-music-platform.lovable.app`

---

## **Test Everything**

```bash
# 1. Backend running?
curl https://your-api/api/catalog/health-check

# 2. Has data?
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-api/api/catalog/health

# 3. Frontend loads?
Open https://dmf-music-platform.lovable.app
```

---

## **Troubleshooting**

| Issue | Solution |
|-------|----------|
| **CORS error** | Add frontend URL to CORS policy in Program.cs |
| **401 Unauthorized** | Check auth token is being sent |
| **MongoDB connection fails** | Verify connection string and network access |
| **Port 5001 already in use** | `dotnet run --urls https://localhost:5002` |
| **Frontend shows "Loading..."** | Check API_BASE URL in catalogService.ts |

---

## **You're Done!** ??

Your StreamGod Brain is now:

? Analyzing your catalog in real-time
? Scoring releases and tracks (0-100)
? Providing actionable recommendations
? Tracking readiness trends
? Guiding your label to distribution

**The Du'ryia Engine is live.** ??
