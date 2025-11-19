# Frontend Integration Handoff - Royalty Lock-In

**Status**: 🟢 **BACKEND READY - FRONTEND TEAM START HERE**  
**Backend**: https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app  
**Date**: November 17, 2025

---

## 📋 Quick Start (Copy-Paste Ready)

### 1️⃣ Backend Config File

Create: `web/src/config/backend.ts`

```ts
/**
 * Backend Configuration
 * Single source of truth for all API endpoints
 */

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

---

### 2️⃣ API Client

Create: `web/src/api/royaltyApi.ts`

```ts
/**
 * Royalty API Client
 * Handles all communication with DMF backend royalty endpoints
 */

import { API_ENDPOINTS } from '../config/backend';

// Types
export interface RoyaltyProfile {
  artistId: string;
  legalFirstName: string;
  legalLastName: string;
  email: string;
  phone?: string;
  consent?: {
    royaltyLockInEnabled: boolean;
    agreedToTerms: boolean;
  };
  enrollmentStatuses?: Array<{
    org: 'BMI' | 'ASCAP' | 'SESAC' | 'SoundExchange';
    scope: string;
    status: 'Pending' | 'InProgress' | 'Completed' | 'Failed';
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublishCheckResult {
  canPublish: boolean;
  blockingIssues?: Array<{
    artistId: string;
    role: string;
    blockingIssues: string[];
  }>;
}

// API calls
export async function getRoyaltyProfile(
  artistId: string
): Promise<RoyaltyProfile> {
  const url = `${API_ENDPOINTS.royalty.getProfile}?artistId=${encodeURIComponent(
    artistId
  )}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null; // Not created yet
    }
    throw new Error(`Failed to fetch profile: ${res.statusText}`);
  }

  const data = await res.json();
  return data.data || data;
}

export async function saveRoyaltyProfile(
  profile: Partial<RoyaltyProfile>
): Promise<RoyaltyProfile> {
  if (!profile.artistId) {
    throw new Error('artistId is required');
  }

  const res = await fetch(API_ENDPOINTS.royalty.saveProfile, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });

  if (!res.ok) {
    throw new Error(`Failed to save profile: ${res.statusText}`);
  }

  const data = await res.json();
  return data.data || data;
}

export async function deleteRoyaltyProfile(artistId: string): Promise<void> {
  const url = `${API_ENDPOINTS.royalty.deleteProfile}?artistId=${encodeURIComponent(
    artistId
  )}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete profile: ${res.statusText}`);
  }
}

export async function checkCanPublishRelease(
  releaseId: string
): Promise<PublishCheckResult> {
  const url = `${API_ENDPOINTS.royalty.canPublish}?releaseId=${encodeURIComponent(
    releaseId
  )}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to check publish status: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}

export async function getReleaseStatus(releaseId: string): Promise<any> {
  const url = `${API_ENDPOINTS.royalty.getStatus}?releaseId=${encodeURIComponent(
    releaseId
  )}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to get release status: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}
```

---

### 3️⃣ Royalty Status Card Component

Create: `web/src/components/royalty/RoyaltyStatusCard.tsx`

```tsx
/**
 * Royalty Status Card
 * Shows artist's current royalty lock-in status on dashboard
 */

import React from 'react';
import { RoyaltyProfile } from '../../api/royaltyApi';

interface Props {
  profile: RoyaltyProfile | null;
  loading?: boolean;
}

export function RoyaltyStatusCard({ profile, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
        <div className="animate-pulse">Loading royalty status...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-lg border border-yellow-200 p-4 bg-yellow-50">
        <h3 className="font-semibold text-yellow-900 mb-2">
          ⚠️ Royalty Protection Not Set Up
        </h3>
        <p className="text-sm text-yellow-800 mb-3">
          Enable Royalty Lock-In to protect your music. We'll verify your BMI
          and SoundExchange accounts before any release goes live.
        </p>
        <a
          href="/royalty"
          className="inline-block text-sm font-semibold text-yellow-700 underline hover:no-underline"
        >
          Set up now →
        </a>
      </div>
    );
  }

  const lockInEnabled = profile.consent?.royaltyLockInEnabled ?? false;

  if (!lockInEnabled) {
    return (
      <div className="rounded-lg border border-yellow-200 p-4 bg-yellow-50">
        <h3 className="font-semibold text-yellow-900 mb-2">
          ⚠️ Royalty Lock-In Disabled
        </h3>
        <p className="text-sm text-yellow-800 mb-3">
          Your profile exists but protection is off. Turn it on to activate
          automated checks for your releases.
        </p>
        <a
          href="/royalty"
          className="inline-block text-sm font-semibold text-yellow-700 underline hover:no-underline"
        >
          Enable Lock-In →
        </a>
      </div>
    );
  }

  // Lock-In is enabled - check enrollment status
  const enrollments = profile.enrollmentStatuses || [];

  const bmiWriter = enrollments.find(
    (e) => e.org === 'BMI' && e.scope === 'Writer'
  );
  const seArtist = enrollments.find(
    (e) => e.org === 'SoundExchange' && e.scope === 'FeaturedArtist'
  );
  const seOwner = enrollments.find(
    (e) => e.org === 'SoundExchange' && e.scope === 'RightsOwner'
  );

  const bmiComplete = bmiWriter?.status === 'Completed';
  const seArtistComplete = seArtist?.status === 'Completed';
  const seOwnerComplete = seOwner?.status === 'Completed';

  const allComplete = bmiComplete && seArtistComplete && seOwnerComplete;

  if (allComplete) {
    return (
      <div className="rounded-lg border border-green-200 p-4 bg-green-50">
        <h3 className="font-semibold text-green-900 mb-2">
          ✅ Royalty Protection Active
        </h3>
        <p className="text-sm text-green-800">
          Your accounts are verified. Your releases are protected by automated
          royalty checks.
        </p>
      </div>
    );
  }

  // Partial enrollment
  const incomplete = [];
  if (!bmiComplete) incomplete.push('BMI Writer');
  if (!seArtistComplete) incomplete.push('SoundExchange Featured Artist');
  if (!seOwnerComplete) incomplete.push('SoundExchange Rights Owner');

  return (
    <div className="rounded-lg border border-blue-200 p-4 bg-blue-50">
      <h3 className="font-semibold text-blue-900 mb-2">
        🔄 Royalty Setup In Progress
      </h3>
      <p className="text-sm text-blue-800 mb-3">
        Almost there. Finish these steps:
      </p>
      <ul className="text-sm text-blue-800 space-y-1 mb-3 ml-4">
        {incomplete.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <a
        href="/royalty"
        className="inline-block text-sm font-semibold text-blue-700 underline hover:no-underline"
      >
        Continue setup →
      </a>
    </div>
  );
}
```

---

### 4️⃣ Royalty Profile Page

Create: `web/src/pages/RoyaltyCenterPage.tsx`

```tsx
/**
 * Royalty Center Page
 * Main UI for managing royalty lock-in settings
 */

import React, { useEffect, useState } from 'react';
import {
  getRoyaltyProfile,
  saveRoyaltyProfile,
  RoyaltyProfile,
} from '../api/royaltyApi';
import { RoyaltyStatusCard } from '../components/royalty/RoyaltyStatusCard';

interface Props {
  artistId: string;
}

export function RoyaltyCenterPage({ artistId }: Props) {
  const [profile, setProfile] = useState<RoyaltyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [artistId]);

  async function loadProfile() {
    setLoading(true);
    setError(null);

    try {
      const data = await getRoyaltyProfile(artistId);
      setProfile(data);
    } catch (err) {
      // 404 is OK - means profile doesn't exist yet
      if ((err as any).message?.includes('404')) {
        setProfile(null);
      } else {
        setError(`Could not load profile: ${(err as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(updates: Partial<RoyaltyProfile>) {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const saved = await saveRoyaltyProfile({
        ...profile,
        ...updates,
        artistId,
      });
      setProfile(saved);
      setSuccess('Profile saved successfully!');
    } catch (err) {
      setError(`Could not save: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleLockIn() {
    const newState = !profile?.consent?.royaltyLockInEnabled;
    await handleSave({
      consent: {
        ...(profile?.consent || {}),
        royaltyLockInEnabled: newState,
      },
    });
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">Loading royalty center...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Royalty Lock-In Center</h1>
        <p className="text-gray-600">
          Manage your royalty protection and organization connections
        </p>
      </div>

      {/* Status Card */}
      <RoyaltyStatusCard profile={profile} loading={false} />

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 p-4 bg-red-50 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-lg border border-green-200 p-4 bg-green-50 text-green-800 text-sm">
          {success}
        </div>
      )}

      {/* Profile Section */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Legal First Name
            </label>
            <input
              type="text"
              defaultValue={profile?.legalFirstName || ''}
              onChange={(e) =>
                setProfile((p) =>
                  p
                    ? { ...p, legalFirstName: e.target.value }
                    : { artistId, legalFirstName: e.target.value } as RoyaltyProfile
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Legal Last Name
            </label>
            <input
              type="text"
              defaultValue={profile?.legalLastName || ''}
              onChange={(e) =>
                setProfile((p) =>
                  p
                    ? { ...p, legalLastName: e.target.value }
                    : { artistId, legalLastName: e.target.value } as RoyaltyProfile
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              defaultValue={profile?.email || ''}
              onChange={(e) =>
                setProfile((p) =>
                  p
                    ? { ...p, email: e.target.value }
                    : { artistId, email: e.target.value } as RoyaltyProfile
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={saving}
            />
          </div>

          <button
            onClick={() => handleSave(profile || ({} as Partial<RoyaltyProfile>))}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Lock-In Toggle */}
      <div className="rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Royalty Lock-In</h2>
            <p className="text-sm text-gray-600 mt-1">
              Enable automatic royalty protection for all your releases
            </p>
          </div>
          <button
            onClick={handleToggleLockIn}
            disabled={saving}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              profile?.consent?.royaltyLockInEnabled
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } disabled:opacity-50`}
          >
            {profile?.consent?.royaltyLockInEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Enrollment Status */}
      {profile?.enrollmentStatuses && profile.enrollmentStatuses.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Enrollment Status</h2>
          <div className="space-y-3">
            {profile.enrollmentStatuses.map((enrollment, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <div className="font-medium text-sm">
                    {enrollment.org} - {enrollment.scope}
                  </div>
                  <div className="text-xs text-gray-600">{enrollment.status}</div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    enrollment.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : enrollment.status === 'Failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {enrollment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 5️⃣ Wire Release Publish Button

Add to your release publish flow:

```tsx
/**
 * Example: Release Publish Handler
 * Add this to wherever you handle "Publish Release" action
 */

import { checkCanPublishRelease, PublishCheckResult } from '../api/royaltyApi';

interface PublishState {
  publishing: boolean;
  error: string | null;
  blockedIssues: any[] | null;
}

// In your Release component:
async function handlePublishRelease(releaseId: string) {
  setPublishState({ publishing: true, error: null, blockedIssues: null });

  try {
    // Check royalty status first
    const checkResult: PublishCheckResult =
      await checkCanPublishRelease(releaseId);

    if (!checkResult.canPublish) {
      // Blocked by royalty issues
      setPublishState({
        publishing: false,
        error:
          'This release cannot be published yet. Complete royalty setup first.',
        blockedIssues: checkResult.blockingIssues,
      });
      return;
    }

    // Royalty check passed - proceed with normal publish flow
    await publishReleaseToDestribution(releaseId);

    setPublishState({
      publishing: false,
      error: null,
      blockedIssues: null,
    });

    // Show success
    alert('Release published successfully!');
  } catch (err) {
    setPublishState({
      publishing: false,
      error: `Could not publish: ${(err as Error).message}`,
      blockedIssues: null,
    });
  }
}

// In your JSX:
return (
  <div>
    {publishState.error && (
      <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
        {publishState.error}
        {publishState.blockedIssues && (
          <ul className="mt-2 ml-4">
            {publishState.blockedIssues.map((issue, i) => (
              <li key={i}>
                • {issue.artistId}: {issue.blockingIssues.join(', ')}
              </li>
            ))}
          </ul>
        )}
      </div>
    )}

    <button
      onClick={() => handlePublishRelease(releaseId)}
      disabled={publishState.publishing}
      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
    >
      {publishState.publishing ? 'Publishing...' : 'Publish Release'}
    </button>
  </div>
);
```

---

## ✅ Frontend Integration Checklist

**Team**: Use this to track implementation progress.

### Phase 1: Setup (Essential)

- [ ] Create `web/src/config/backend.ts` with `DMF_BACKEND_BASE`
- [ ] Create `web/src/api/royaltyApi.ts` with all 5 API functions
- [ ] Test each API function with curl or Postman
  - [ ] GET /getRoyaltyProfile?artistId=test
  - [ ] POST /saveRoyaltyProfile
  - [ ] DELETE /deleteRoyaltyProfile?artistId=test
  - [ ] GET /canPublishRelease?releaseId=test
  - [ ] GET /getReleaseStatus?releaseId=test

### Phase 2: Components (Features)

- [ ] Create `RoyaltyStatusCard.tsx` component
- [ ] Create `RoyaltyCenterPage.tsx` page
- [ ] Add route to app router: `/royalty` → `RoyaltyCenterPage`
- [ ] Add `RoyaltyStatusCard` to main dashboard

### Phase 3: Integration (Enforcement)

- [ ] Wire release publish button to `checkCanPublishRelease()`
- [ ] Block publishing if `canPublish === false`
- [ ] Show blocking issues to user
- [ ] Test end-to-end: Create profile → Try to publish → Verify block/allow

### Phase 4: Polish (Production)

- [ ] Error handling on all API calls
- [ ] Loading states
- [ ] Success/error notifications
- [ ] Form validation
- [ ] Accessibility review
- [ ] Mobile responsive testing

---

## 🧪 Testing Checklist

### Test 1: Happy Path (Everything enabled)

```
1. Create royalty profile for artist
2. Enable Lock-In
3. Set all enrollments to "Completed"
4. Try to publish release
5. ✅ Release should publish successfully
```

### Test 2: Missing Enrollments

```
1. Create royalty profile
2. Enable Lock-In
3. Leave enrollments empty
4. Try to publish release
5. ✅ Should see error: "BMI Writer enrollment missing"
```

### Test 3: Disabled Lock-In

```
1. Create royalty profile
2. Leave Lock-In disabled
3. Try to publish release
4. ✅ Should publish (no block if not enrolled)
```

### Test 4: Profile Not Created

```
1. Artist never created royalty profile
2. Dashboard shows: "Set up royalty protection"
3. Try to publish release
4. ✅ Should either skip check or block (depends on policy)
```

---

## 🔗 Backend API Reference

### GET /getRoyaltyProfile

```
URL: https://dmf-firebase-backend-main-...your-app.../getRoyaltyProfile?artistId=ARTIST_ID

Response (200):
{
  "artistId": "artist-123",
  "legalFirstName": "John",
  "legalLastName": "Doe",
  "email": "john@example.com",
  "consent": {
    "royaltyLockInEnabled": true
  },
  "enrollmentStatuses": [
    {
      "org": "BMI",
      "scope": "Writer",
      "status": "Completed"
    },
    {
      "org": "SoundExchange",
      "scope": "FeaturedArtist",
      "status": "InProgress"
    }
  ],
  "createdAt": "2025-11-17T...",
  "updatedAt": "2025-11-17T..."
}

Response (404): Profile not found
```

### POST /saveRoyaltyProfile

```
URL: https://dmf-firebase-backend-main-...your-app.../saveRoyaltyProfile

Body:
{
  "artistId": "artist-123",
  "legalFirstName": "John",
  "legalLastName": "Doe",
  "email": "john@example.com",
  "consent": {
    "royaltyLockInEnabled": true,
    "agreedToTerms": true
  },
  "enrollmentStatuses": [...]
}

Response (200):
Same as GET
```

### DELETE /deleteRoyaltyProfile

```
URL: https://dmf-firebase-backend-main-...your-app.../deleteRoyaltyProfile?artistId=ARTIST_ID

Response (200):
{
  "deletedCount": 1,
  "message": "Profile deleted..."
}
```

### GET /canPublishRelease

```
URL: https://dmf-firebase-backend-main-...your-app.../canPublishRelease?releaseId=RELEASE_ID

Response (200):
{
  "canPublish": true,
  "blockedArtists": [],
  "timestamp": "2025-11-17T..."
}

OR (if blocked):

{
  "canPublish": false,
  "blockedArtists": [
    {
      "artistId": "artist-123",
      "role": "Songwriter",
      "blockingIssues": [
        "Missing enrollment: BMI Writer"
      ]
    }
  ],
  "timestamp": "2025-11-17T..."
}
```

### GET /getReleaseStatus

```
URL: https://dmf-firebase-backend-main-...your-app.../getReleaseStatus?releaseId=RELEASE_ID

Response (200):
{
  "release": {
    "releaseId": "release-123",
    "title": "My Song",
    "status": "Draft",
    "contributors": [
      {
        "artistId": "artist-123",
        "role": "Songwriter"
      }
    ]
  },
  "publishing": {
    "canPublish": true,
    "blockedArtists": [],
    "status": "Ready for distribution"
  }
}
```

---

## 🚀 Done When...

**Frontend team is done when all of these are true:**

1. ✅ Backend URL set in `web/src/config/backend.ts`
2. ✅ All 5 API functions in `royaltyApi.ts` tested individually
3. ✅ `/royalty` page shows profile + can save + toggle lock-in
4. ✅ Dashboard shows `RoyaltyStatusCard`
5. ✅ Release publish button calls `checkCanPublishRelease()`
6. ✅ Blocking releases shows error + issues to user
7. ✅ All tests in "Testing Checklist" above pass
8. ✅ Accessible, mobile responsive, error handling complete

**Then**: 🎉 Royalty Lock-In is **LIVE** and **PROTECTING ARTISTS**

---

## 📞 If Stuck

| Issue | Check |
|-------|-------|
| "Can't reach backend" | Verify URL is exactly: `https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app` |
| "CORS error" | Backend has CORS enabled - check browser Network tab |
| "404 on endpoint" | Endpoint name must be exact (e.g., `getRoyaltyProfile` not `get-royalty-profile`) |
| "No profile returned" | Artist must exist in MongoDB first - create test data |
| "Publish not blocked" | Release must have contributors in MongoDB for gate to work |

---

**Status**: 🟢 **READY FOR FRONTEND IMPLEMENTATION**

**Backend**: Live and responding  
**API Spec**: Complete above  
**Code Templates**: Copy-paste ready  
**Timeline**: 1-2 days for team to complete

**👉 Next Step**: Frontend team starts with Task 1 above
