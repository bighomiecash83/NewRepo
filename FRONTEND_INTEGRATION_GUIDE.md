# Frontend Integration Guide - DMF Firebase Backend

**For**: Google AI Studio / Lovable / React Frontend  
**Backend**: `dmf-firebase-backend-main`  
**Date**: November 17, 2025

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Copy Backend Config File

Copy this to your frontend project:

```ts
// web/src/config/backend.ts

export const DMF_BACKEND_BASE =
  'https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app';

export const API_ENDPOINTS = {
  royalty: {
    getProfile: `${DMF_BACKEND_BASE}/getRoyaltyProfile`,
    saveProfile: `${DMF_BACKEND_BASE}/saveRoyaltyProfile`,
    deleteProfile: `${DMF_BACKEND_BASE}/deleteRoyaltyProfile`,
    canPublish: `${DMF_BACKEND_BASE}/canPublishRelease`,
    getStatus: `${DMF_BACKEND_BASE}/getReleaseStatus`,
  },
};
```

### Step 2: Create API Client

```ts
// web/src/api/dmf-royalty.ts

import { API_ENDPOINTS } from '@/config/backend';

export class RoyaltyApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new RoyaltyApiError(
      res.status,
      `API Error: ${res.statusText}`,
      { body: text }
    );
  }
  return res.json();
}

export async function getRoyaltyProfile(artistId: string) {
  const res = await fetch(
    `${API_ENDPOINTS.royalty.getProfile}?artistId=${artistId}`
  );
  return handleResponse(res);
}

export async function saveRoyaltyProfile(data: any) {
  const res = await fetch(API_ENDPOINTS.royalty.saveProfile, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function canPublishRelease(releaseId: string) {
  const res = await fetch(
    `${API_ENDPOINTS.royalty.canPublish}?releaseId=${releaseId}`
  );
  return handleResponse(res);
}

export async function getReleaseStatus(releaseId: string) {
  const res = await fetch(
    `${API_ENDPOINTS.royalty.getStatus}?releaseId=${releaseId}`
  );
  return handleResponse(res);
}
```

### Step 3: Use in Component

```tsx
// web/src/components/RoyaltyProfile.tsx

import { useState, useEffect } from 'react';
import { getRoyaltyProfile, saveRoyaltyProfile, RoyaltyApiError } from '@/api/dmf-royalty';

export function RoyaltyProfile({ artistId }: { artistId: string }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRoyaltyProfile(artistId)
      .then(data => {
        setProfile(data.data || data);
        setLoading(false);
      })
      .catch((err: RoyaltyApiError) => {
        setError(err.message);
        setLoading(false);
      });
  }, [artistId]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div className="profile-card">
      <h2>{profile.legalFirstName} {profile.legalLastName}</h2>
      
      <section>
        <h3>Royalty Protection Status</h3>
        <p>
          Lock-In Enabled:{' '}
          <span className={profile.consent?.royaltyLockInEnabled ? 'success' : 'warning'}>
            {profile.consent?.royaltyLockInEnabled ? '✅ Yes' : '❌ No'}
          </span>
        </p>
      </section>

      <section>
        <h3>Enrollment Status</h3>
        {profile.enrollmentStatuses && profile.enrollmentStatuses.length > 0 ? (
          <ul>
            {profile.enrollmentStatuses.map((status: any, i: number) => (
              <li key={i}>
                {status.org} - {status.scope}:{' '}
                <span className={status.status === 'Completed' ? 'success' : 'warning'}>
                  {status.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No enrollments yet</p>
        )}
      </section>

      <section>
        <h3>Actions</h3>
        <button onClick={() => console.log('Edit profile')}>
          Edit Profile
        </button>
        <button onClick={() => console.log('Manage enrollments')}>
          Manage Enrollments
        </button>
      </section>
    </div>
  );
}
```

---

## 🔌 Common Integration Patterns

### Pattern 1: Load Data on Component Mount

```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  apiCall()
    .then(data => setData(data))
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
}, [dependency]);

if (loading) return <Loader />;
if (error) return <Error message={error} />;
return <Content data={data} />;
```

### Pattern 2: Form Submission

```tsx
const [formData, setFormData] = useState({...});
const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  setSaveError(null);

  try {
    const result = await saveRoyaltyProfile(formData);
    console.log('Saved:', result.data);
    // Show success message
  } catch (err) {
    setSaveError(err.message);
  } finally {
    setSaving(false);
  }
};

return (
  <form onSubmit={handleSubmit}>
    <input 
      value={formData.email}
      onChange={e => setFormData({...formData, email: e.target.value})}
    />
    <button disabled={saving} type="submit">
      {saving ? 'Saving...' : 'Save'}
    </button>
    {saveError && <p className="error">{saveError}</p>}
  </form>
);
```

### Pattern 3: Release Gate Check

```tsx
const [releaseReady, setReleaseReady] = useState(false);
const [blockingIssues, setBlockingIssues] = useState([]);
const [checking, setChecking] = useState(false);

const checkRelease = async (releaseId: string) => {
  setChecking(true);
  try {
    const result = await canPublishRelease(releaseId);
    setReleaseReady(result.canPublish);
    setBlockingIssues(result.blockingIssues || []);
  } catch (err) {
    console.error('Failed to check release:', err);
  } finally {
    setChecking(false);
  }
};

return (
  <div>
    <button onClick={() => checkRelease(releaseId)} disabled={checking}>
      {checking ? 'Checking...' : 'Check Release'}
    </button>

    {releaseReady ? (
      <div className="success">
        ✅ Your release is ready to publish!
      </div>
    ) : (
      <div className="warning">
        <p>⚠️ Cannot publish yet. Please complete:</p>
        <ul>
          {blockingIssues.map((issue, i) => (
            <li key={i}>
              <strong>{issue.artistId}</strong>: {issue.reason}
              <a href="#">→ Fix now</a>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
```

---

## 🛠️ Error Handling Best Practices

### Comprehensive Error Handler

```ts
// web/src/api/error-handler.ts

export function handleApiError(error: any): string {
  if (error instanceof TypeError) {
    if (error.message.includes('fetch')) {
      return 'Network error - please check your connection';
    }
    return 'Connection error - please try again';
  }

  if (error.statusCode === 404) {
    return 'Not found - please check the artist ID';
  }

  if (error.statusCode === 400) {
    return 'Invalid data - please check your input';
  }

  if (error.statusCode === 500) {
    return 'Server error - please try again later';
  }

  if (error.statusCode === 503) {
    return 'Service temporarily unavailable';
  }

  return error.message || 'An unexpected error occurred';
}

export function logApiError(error: any, context: string) {
  console.error(`[${context}]`, {
    message: error.message,
    status: error.statusCode,
    details: error.details,
    timestamp: new Date().toISOString(),
  });

  // Send to error tracking service (Sentry, LogRocket, etc.)
  if (window.errorTracker) {
    window.errorTracker.captureException(error);
  }
}
```

### Usage in Components

```tsx
import { handleApiError, logApiError } from '@/api/error-handler';

try {
  const data = await getRoyaltyProfile(artistId);
  // ...
} catch (err) {
  logApiError(err, 'getRoyaltyProfile');
  setError(handleApiError(err));
}
```

---

## 🔒 Request/Response Handling

### Add Request Interceptor (Optional)

```ts
// web/src/api/interceptor.ts

export async function fetchWithInterceptor(url: string, options?: RequestInit) {
  // Add auth token if available
  const token = localStorage.getItem('authToken');
  const headers = {
    ...options?.headers,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  // Log request (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${options?.method || 'GET'} ${url}`);
  }

  const res = await fetch(url, { ...options, headers });

  // Log response (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${res.status} ${res.statusText}`);
  }

  return res;
}
```

### Use in API Calls

```ts
export async function getRoyaltyProfile(artistId: string) {
  const res = await fetchWithInterceptor(
    `${API_ENDPOINTS.royalty.getProfile}?artistId=${artistId}`
  );
  return handleResponse(res);
}
```

---

## 📱 Mobile & Responsive Considerations

### Network Timeout Handling

```ts
// web/src/api/timeout.ts

export function fetchWithTimeout(url: string, options?: RequestInit) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Request timeout')),
        options?.timeout || 30000
      )
    ),
  ]);
}
```

### Retry Logic

```ts
// web/src/api/retry.ts

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3
) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;

      // Don't retry on 4xx errors
      if (res.status >= 400 && res.status < 500) {
        throw new Error(`${res.status} ${res.statusText}`);
      }

      lastError = new Error(`${res.status} ${res.statusText}`);
    } catch (err) {
      lastError = err;

      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
  }

  throw lastError;
}
```

---

## 🧪 Testing Integration

### Mock API for Development

```ts
// web/src/api/mock.ts

const MOCK_PROFILE = {
  success: true,
  data: {
    artistId: 'MOCK_001',
    legalFirstName: 'Mock',
    legalLastName: 'Artist',
    consent: { royaltyLockInEnabled: true },
    enrollmentStatuses: [
      { org: 'BMI', scope: 'Writer', status: 'Completed' },
    ],
  },
};

export function useMockApi() {
  return {
    getRoyaltyProfile: async (id: string) => MOCK_PROFILE,
    saveRoyaltyProfile: async (data: any) => MOCK_PROFILE,
    canPublishRelease: async (id: string) => ({
      canPublish: true,
      blockingIssues: [],
    }),
  };
}
```

### Use in Development

```tsx
const api = process.env.NODE_ENV === 'development' 
  ? useMockApi() 
  : realApiClient;

// Now use api.getRoyaltyProfile() etc
```

---

## 📊 Performance Monitoring

### Track API Performance

```ts
// web/src/api/performance.ts

export class PerformanceTracker {
  static track(apiName: string, startTime: number, statusCode: number) {
    const duration = Date.now() - startTime;
    console.log(`[PERF] ${apiName}: ${duration}ms (${statusCode})`);

    // Send to analytics service
    if (window.analytics) {
      window.analytics.track('api_call', {
        api: apiName,
        duration,
        status: statusCode,
      });
    }
  }
}

// Usage:
export async function getRoyaltyProfile(artistId: string) {
  const start = Date.now();
  try {
    const res = await fetch(`${API_ENDPOINTS.royalty.getProfile}?artistId=${artistId}`);
    PerformanceTracker.track('getRoyaltyProfile', start, res.status);
    return handleResponse(res);
  } catch (err) {
    PerformanceTracker.track('getRoyaltyProfile', start, 0);
    throw err;
  }
}
```

---

## ✅ Integration Checklist

Before deploying frontend:

- [ ] Backend URL in `.env` file
- [ ] `backend.ts` config created
- [ ] API client functions created
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Tested GET endpoint with mock data
- [ ] Tested POST endpoint with form
- [ ] Tested release gate with sample data
- [ ] Error messages user-friendly
- [ ] Network timeouts handled
- [ ] Performance tracking added
- [ ] Mobile/responsive tested
- [ ] Code reviewed by team

---

## 🚀 Deployment

### Before Going Live

```bash
# 1. Test all endpoints
npm run test:api

# 2. Build production
npm run build

# 3. Deploy to Firebase Hosting
firebase deploy --only hosting

# 4. Verify URLs are correct
curl https://studio--studio-...us-central1.hosted.app
curl https://dmf-firebase-backend-main--...us-east4.hosted.app/health
```

### Environment Variables

```bash
# .env.production
VITE_DMF_BACKEND_BASE=https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app
VITE_API_TIMEOUT=60000
VITE_LOG_LEVEL=error
```

---

## 📞 Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Backend has CORS enabled by default - check browser DevTools Network tab |
| 404 on endpoint | Verify endpoint name and method (GET vs POST) |
| Timeout | Increase `VITE_API_TIMEOUT`, check Firestore performance |
| Empty response | Check if profile exists in Firestore, verify artistId |
| Auth errors | Add auth token to request headers if needed |

---

**Frontend Ready**: ✅  
**Backend URL**: https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app  
**Integration Path**: Copy config → Create API client → Use in components  
**Last Updated**: November 17, 2025
