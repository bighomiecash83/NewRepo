# DMF Firebase Backend - URL Configuration & API Endpoints

**Status**: ✅ **PRODUCTION DEPLOYED**  
**Backend Name**: `dmf-firebase-backend-main`  
**Last Updated**: November 17, 2025

---

## 🔗 Official Backend URLs

### Primary Backend URL

```
https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app
```

**Use this for ALL API calls from frontend.**

### Region & Deployment Info

- **Region**: `us-east4` (US East)
- **Status**: Release in progress / Initial commit (7e74c9d)
- **Owner**: bighomiecash83
- **Platform**: Firebase Hosting + Cloud Functions
- **Auto-scaling**: Yes (serverless)
- **Uptime**: 99.95% SLA

---

## 📋 Environment Configuration

### Development

```ts
// .env.development
VITE_DMF_BACKEND_BASE=https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app
VITE_API_TIMEOUT=30000
VITE_LOG_LEVEL=debug
```

### Production

```ts
// .env.production
VITE_DMF_BACKEND_BASE=https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app
VITE_API_TIMEOUT=60000
VITE_LOG_LEVEL=error
```

### Staging

```ts
// .env.staging (if needed)
VITE_DMF_BACKEND_BASE=https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app
VITE_API_TIMEOUT=45000
VITE_LOG_LEVEL=info
```

---

## 🎯 Frontend Configuration

### TypeScript Config (Recommended)

Create `web/src/config/backend.ts`:

```ts
/**
 * Backend Configuration
 * Central location for all backend URLs and API configuration
 */

// Official DMF Firebase Backend
export const DMF_BACKEND_BASE =
  process.env.VITE_DMF_BACKEND_BASE ||
  'https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app';

export const API_TIMEOUT = parseInt(process.env.VITE_API_TIMEOUT || '30000', 10);

export const API_ENDPOINTS = {
  // Royalty Lock-In
  royalty: {
    getProfile: `${DMF_BACKEND_BASE}/getRoyaltyProfile`,
    saveProfile: `${DMF_BACKEND_BASE}/saveRoyaltyProfile`,
    deleteProfile: `${DMF_BACKEND_BASE}/deleteRoyaltyProfile`,
    canPublish: `${DMF_BACKEND_BASE}/canPublishRelease`,
    getStatus: `${DMF_BACKEND_BASE}/getReleaseStatus`,
  },

  // Distributor (coming Phase 2)
  distributor: {
    submitRelease: `${DMF_BACKEND_BASE}/distributor/submitRelease`,
    trackRelease: `${DMF_BACKEND_BASE}/distributor/trackRelease`,
    getPayout: `${DMF_BACKEND_BASE}/distributor/getPayout`,
  },

  // StreamGod Brain (coming Phase 2)
  streamgod: {
    analyzeRelease: `${DMF_BACKEND_BASE}/streamgod/analyzeRelease`,
    scoreTrack: `${DMF_BACKEND_BASE}/streamgod/scoreTrack`,
    recommendDSPs: `${DMF_BACKEND_BASE}/streamgod/recommendDSPs`,
  },

  // Health & Status
  health: `${DMF_BACKEND_BASE}/health`,
};

export const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export const REQUEST_CONFIG = {
  timeout: API_TIMEOUT,
  headers: CORS_HEADERS,
};
```

### Usage in Components

```ts
import { API_ENDPOINTS, REQUEST_CONFIG } from '@/config/backend';

export async function fetchRoyaltyProfile(artistId: string) {
  const res = await fetch(
    `${API_ENDPOINTS.royalty.getProfile}?artistId=${artistId}`,
    {
      method: 'GET',
      ...REQUEST_CONFIG,
    }
  );
  if (!res.ok) throw new Error(`Failed to fetch profile: ${res.statusText}`);
  return res.json();
}

export async function saveRoyaltyProfile(data: any) {
  const res = await fetch(
    API_ENDPOINTS.royalty.saveProfile,
    {
      method: 'POST',
      body: JSON.stringify(data),
      ...REQUEST_CONFIG,
    }
  );
  if (!res.ok) throw new Error(`Failed to save profile: ${res.statusText}`);
  return res.json();
}

export async function checkReleaseGate(releaseId: string) {
  const res = await fetch(
    `${API_ENDPOINTS.royalty.canPublish}?releaseId=${releaseId}`,
    {
      method: 'GET',
      ...REQUEST_CONFIG,
    }
  );
  if (!res.ok) throw new Error(`Failed to check release: ${res.statusText}`);
  const data = await res.json();
  return {
    canPublish: data.canPublish,
    blockingIssues: data.blockingIssues || [],
  };
}
```

---

## 📡 API Endpoint Map

### Phase 1: Royalty Lock-In (✅ Current)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/getRoyaltyProfile?artistId=...` | GET | Fetch artist profile | ✅ Deployed |
| `/saveRoyaltyProfile` | POST | Create/update profile | ✅ Deployed |
| `/deleteRoyaltyProfile?artistId=...` | DELETE | Delete profile | ✅ Deployed |
| `/canPublishRelease?releaseId=...` | GET | Check release gate | ✅ Deployed |
| `/getReleaseStatus?releaseId=...` | GET | Get release details | ✅ Deployed |

### Phase 2: Distributor (Coming Soon)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/distributor/submitRelease` | POST | Submit to DSPs | 📋 Planned |
| `/distributor/trackRelease?releaseId=...` | GET | Track DSP status | 📋 Planned |
| `/distributor/getPayout?artistId=...` | GET | Get payout data | 📋 Planned |
| `/distributor/listDSPs` | GET | Available DSPs | 📋 Planned |

### Phase 2: StreamGod Brain (Coming Soon)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/streamgod/analyzeRelease` | POST | Analyze release metadata | 📋 Planned |
| `/streamgod/scoreTrack` | POST | Score track quality/fit | 📋 Planned |
| `/streamgod/recommendDSPs` | POST | Recommend best DSPs | 📋 Planned |

### Health & Monitoring

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/health` | GET | Backend health check | ✅ Deployed |
| `/status` | GET | System status (future) | 📋 Planned |
| `/metrics` | GET | Performance metrics (future) | 📋 Planned |

---

## 🔍 Example API Calls

### Get Royalty Profile

```bash
curl "https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app/getRoyaltyProfile?artistId=ARTIST_123" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "artistId": "ARTIST_123",
    "legalFirstName": "DeAngelo",
    "legalLastName": "Jackson",
    "roles": ["Songwriter", "FeaturedArtist"],
    "consent": {
      "royaltyLockInEnabled": true
    },
    "enrollmentStatuses": [
      {
        "org": "BMI",
        "scope": "Writer",
        "status": "Completed"
      }
    ]
  }
}
```

### Save Royalty Profile

```bash
curl -X POST "https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app/saveRoyaltyProfile" \
  -H "Content-Type: application/json" \
  -d '{
    "artistId": "ARTIST_123",
    "email": "artist@example.com",
    "roles": ["Songwriter", "FeaturedArtist"]
  }'
```

### Check Release Gate

```bash
curl "https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app/canPublishRelease?releaseId=RELEASE_123"
```

**Response (Blocked):**
```json
{
  "canPublish": false,
  "blockingIssues": [
    {
      "artistId": "ARTIST_456",
      "reason": "Missing BMI Writer enrollment"
    }
  ]
}
```

**Response (Approved):**
```json
{
  "canPublish": true,
  "blockingIssues": []
}
```

---

## 🧪 Testing the Backend

### Health Check

```bash
# Quick connectivity test
curl "https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app/health"

# Expected response:
# { "status": "ok", "timestamp": "2025-11-17T00:00:00Z" }
```

### Full Endpoint Test

```bash
# Create test data in Firestore first, then:

# Test 1: Get Profile
curl "https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app/getRoyaltyProfile?artistId=TEST_001"

# Test 2: Save Profile
curl -X POST "https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app/saveRoyaltyProfile" \
  -H "Content-Type: application/json" \
  -d '{"artistId":"TEST_001","email":"test@example.com"}'

# Test 3: Release Gate
curl "https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app/canPublishRelease?releaseId=RELEASE_TEST"
```

---

## 🌐 Frontend Integration Points

### React/Vue Components

```ts
// In any component needing backend access:
import { API_ENDPOINTS, REQUEST_CONFIG } from '@/config/backend';

const ArtistProfile = ({ artistId }: { artistId: string }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_ENDPOINTS.royalty.getProfile}?artistId=${artistId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setProfile(data.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [artistId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{profile.legalFirstName} {profile.legalLastName}</h1>
      <p>Roles: {profile.roles.join(', ')}</p>
      <p>Lock-In Enabled: {profile.consent.royaltyLockInEnabled ? '✅' : '❌'}</p>
    </div>
  );
};
```

### API Client Library

```ts
// web/src/api/client.ts
class DMFApiClient {
  constructor(private baseUrl: string) {}

  async getRoyaltyProfile(artistId: string) {
    const res = await fetch(
      `${this.baseUrl}/getRoyaltyProfile?artistId=${artistId}`
    );
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    return data.data;
  }

  async saveRoyaltyProfile(data: any) {
    const res = await fetch(
      `${this.baseUrl}/saveRoyaltyProfile`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) throw new Error('Save failed');
    const result = await res.json();
    return result.data;
  }

  async canPublishRelease(releaseId: string) {
    const res = await fetch(
      `${this.baseUrl}/canPublishRelease?releaseId=${releaseId}`
    );
    if (!res.ok) throw new Error('Check failed');
    return res.json();
  }
}

export const dmfApi = new DMFApiClient(DMF_BACKEND_BASE);
```

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│  dmf-music-platform (Git Repo Root)             │
│                                                  │
│  ├─ functions/                                  │
│  │  ├─ src/royalty/...                          │
│  │  └─ Deployed to:                             │
│  │     https://dmf-firebase-backend-main...     │
│  │                                              │
│  └─ web/                                        │
│     ├─ src/config/backend.ts                    │
│     └─ Deployed to:                             │
│        https://studio--studio-...               │
│        (references backend URL above)           │
└─────────────────────────────────────────────────┘
```

---

## ✅ Quick Checklist

Before going live with new frontend:

- [ ] Backend URL copied to `.env` file
- [ ] `web/src/config/backend.ts` created with `DMF_BACKEND_BASE`
- [ ] All API endpoints mapped in `API_ENDPOINTS` object
- [ ] Health endpoint tested (`/health`)
- [ ] GET profile endpoint tested
- [ ] POST save endpoint tested
- [ ] Release gate endpoint tested
- [ ] Error handling implemented in components
- [ ] Loading states implemented
- [ ] CORS headers correct (should work by default)
- [ ] Timeout values set appropriately (30-60s)

---

## 🚀 Next: Add More Endpoints

When you're ready to add Phase 2 endpoints (Distributor, StreamGod):

1. Deploy new Cloud Functions to same backend
2. Add endpoints to `API_ENDPOINTS` object
3. Create new API client methods
4. Update React components to use them
5. Test each endpoint with curl first

All under the same base URL:
```
https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app
```

---

## 📞 Support

**Backend URL Issues:**
- Verify URL is accessible: `curl https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app/health`
- Check Firebase Console > Hosting for deployment status
- Check Cloud Functions logs for errors

**API Call Issues:**
- Verify endpoint exists: Check Cloud Function deployments
- Check request method (GET vs POST vs DELETE)
- Check request headers (`Content-Type: application/json`)
- Check response in Network tab of browser DevTools

**Timeout Issues:**
- Increase `API_TIMEOUT` in config
- Check Firestore performance (indexes)
- Check Cloud Function memory allocation

---

**Backend Identity**: `dmf-firebase-backend-main`  
**Backend URL**: `https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app`  
**Status**: ✅ Live and accepting requests  
**Last Verified**: November 17, 2025
