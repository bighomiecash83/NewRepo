# 🔥 DMF Frontend - Firebase Integration Guide

**Purpose**: Exact API contracts between Next.js pages and Firebase  
**Framework**: Firebase SDK v9+ (modular)  
**Database**: Firestore  
**Functions**: Cloud Functions (httpsCallable)

---

## 📋 Quick Integration Checklist

Before building any page:

- [ ] Install Firebase SDK: `npm install firebase`
- [ ] Initialize Firebase in `lib/firebase.ts`
- [ ] Create TypeScript types in `lib/types/`
- [ ] Create custom hooks in `lib/hooks/` for each collection
- [ ] Each page imports hooks, not raw Firestore calls
- [ ] All sensitive data (API keys, secrets) in `.env.local`

---

## 🔥 Firebase Initialization (lib/firebase.ts)

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, 'us-central1');
export const storage = getStorage(app);

// Emulator setup (dev only)
if (process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

---

## 📦 TypeScript Types

### Release Types (lib/types/release.ts)

```typescript
export type ReleaseStatus = 'DRAFT' | 'LIVE_SYMPHONIC' | 'LIVE_DMF' | 'BLOCKED' | 'ARCHIVED';
export type MigrationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'LIVE_DMF' | 'TAKEDOWN_READY' | 'SYMPHONIC_CLOSED';

export interface Track {
  id: string;
  title: string;
  duration: number;
  isrc: string;
  writers: Array<{
    name: string;
    role: string;
    splitShare: number;
  }>;
  proStatus: {
    bmi: boolean;
    ascap: boolean;
    sesac: boolean;
    unregistered: boolean;
  };
}

export interface Contributor {
  artistId: string;
  roles: string[];
  splitShare: number;
}

export interface Release {
  id: string;
  title: string;
  type: 'Single' | 'EP' | 'Album';
  primaryArtistId: string;
  label: string;
  upc: string;
  genre: string;
  subGenre: string;
  explicit: boolean;
  releaseDate: Date;
  coverArtUrl: string;
  status: ReleaseStatus;
  qcScore: number; // 0-100
  migrationStatus: MigrationStatus;
  symphonic: {
    status: string;
    liveOn: string[];
    lastUpdate: Date;
  };
  dmf: {
    status: string;
    queuedAt?: Date;
    liveAt?: Date;
    liveOn: string[];
  };
  royaltyCheckRequired: boolean;
  contributors: Contributor[];
  createdAt: Date;
  updatedAt: Date;
  tracks?: Track[];
}

export interface ReleaseFormData {
  title: string;
  type: 'Single' | 'EP' | 'Album';
  primaryArtistId: string;
  label: string;
  upc: string;
  genre: string;
  subGenre: string;
  explicit: boolean;
  releaseDate: string; // ISO format
  coverArtUrl?: string;
}
```

### Artist Types (lib/types/artist.ts)

```typescript
export interface ArtistSocials {
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  spotify?: string;
}

export interface Artist {
  id: string;
  stageName: string;
  legalName: string;
  photo: string;
  bio: string;
  socials: ArtistSocials;
  label: 'DMF Records' | 'Fly Hoolie ENT' | 'OBMB' | string;
  contractType: 'Exclusive' | 'Non-Exclusive' | 'Independent';
  contractStart: Date;
  contractEnd: Date;
  revenueSplit: number; // 0.0-1.0
  status: 'Active' | 'On Hold' | 'Development' | 'Inactive';
  totalStreams: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtistFormData {
  stageName: string;
  legalName: string;
  bio: string;
  socials: ArtistSocials;
  label: string;
  contractType: 'Exclusive' | 'Non-Exclusive' | 'Independent';
  contractStart: string;
  contractEnd: string;
  revenueSplit: number;
}
```

### Client Types (lib/types/client.ts)

```typescript
export type ServiceTier = 'Bronze' | 'Silver' | 'Gold' | 'Custom';

export interface Client {
  id: string;
  name: string;
  logo: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  serviceTier: ServiceTier;
  assignedManager: string;
  nextInvoiceDate: Date;
  status: 'Active' | 'Pending' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  serviceTier: ServiceTier;
  assignedManager: string;
}
```

### Service & Order Types (lib/types/service.ts)

```typescript
export type ServiceCategory = 'Distribution' | 'Marketing' | 'Legal' | 'Production' | 'Consulting';
export type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'WAITING_ON_CLIENT' | 'COMPLETE' | 'ON_HOLD';

export interface ServiceAddOn {
  name: string;
  price: number;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  turnaroundDays: number;
  deliverables: string[];
  requirements: string[];
  addOns: ServiceAddOn[];
  internalChecklist: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  clientId?: string; // Or artistId
  artistId?: string;
  serviceId: string;
  status: OrderStatus;
  orderDate: Date;
  dueDate: Date;
  assignedTo: string;
  progress: number; // 0-100
  notes: string;
  files: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderFormData {
  clientId?: string;
  artistId?: string;
  serviceId: string;
  dueDate: string;
  assignedTo: string;
}
```

### Other Types (similar pattern...)

```typescript
// lib/types/legal.ts
export type CaseType = 'Takedown' | 'Copyright' | 'Contract' | 'Dispute';
export type CaseStatus = 'NEW' | 'IN_PROGRESS' | 'PENDING_RESPONSE' | 'RESOLVED' | 'CLOSED';

export interface LegalCase {
  id: string;
  caseId: string;
  type: CaseType;
  title: string;
  description: string;
  status: CaseStatus;
  createdDate: Date;
  assignedTo: string;
  dueDate: Date;
  relatedReleaseId?: string;
  relatedArtistId?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// lib/types/task.ts
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';

export interface StreamGodTask {
  id: string;
  description: string;
  generatedFrom: string; // analysis ID
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  dueDate: Date;
  relatedReleaseId?: string;
  relatedArtistId?: string;
  checklist: Array<{ item: string; done: boolean }>;
  createdAt: Date;
  updatedAt: Date;
}

// lib/types/bot.ts
export interface BotDivision {
  name: 'legal' | 'marketing' | 'analytics' | 'catalog' | 'antiPiracy';
  botCount: number;
  activeBotCount: number;
  healthStatus: 'Healthy' | 'Warning' | 'Critical';
  lastActivity: Date;
  stats: Record<string, number>; // tasksCompleted, campaignsRun, etc.
}
```

---

## 🪝 Custom Hooks (lib/hooks/)

### useReleases (lib/hooks/useReleases.ts)

```typescript
import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Release } from '../types/release';

export function useReleases(filters?: {
  label?: string;
  artistId?: string;
  status?: string;
}) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters?.label) {
        constraints.push(where('label', '==', filters.label));
      }
      if (filters?.artistId) {
        constraints.push(where('primaryArtistId', '==', filters.artistId));
      }
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, 'releases'), ...constraints);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          releaseDate: doc.data().releaseDate?.toDate(),
        })) as Release[];

        setReleases(data);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [filters]);

  return { releases, loading, error };
}

export async function getReleaseById(releaseId: string): Promise<Release | null> {
  try {
    const docRef = doc(db, 'releases', releaseId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
      releaseDate: docSnap.data().releaseDate?.toDate(),
    } as Release;
  } catch (err) {
    console.error('Error fetching release:', err);
    return null;
  }
}

export async function createRelease(data: ReleaseFormData): Promise<string> {
  try {
    const docRef = doc(collection(db, 'releases'));
    await setDoc(docRef, {
      ...data,
      status: 'DRAFT',
      qcScore: 0,
      migrationStatus: 'NOT_STARTED',
      dmf: { status: 'NOT_SENT', liveOn: [] },
      symphonic: { status: 'LIVE', liveOn: [], lastUpdate: new Date() },
      royaltyCheckRequired: true,
      contributors: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (err) {
    throw new Error(`Failed to create release: ${err}`);
  }
}

export async function updateRelease(
  releaseId: string,
  updates: Partial<Release>
): Promise<void> {
  try {
    const docRef = doc(db, 'releases', releaseId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (err) {
    throw new Error(`Failed to update release: ${err}`);
  }
}
```

### useArtists (lib/hooks/useArtists.ts)

```typescript
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Artist } from '../types/artist';

export function useArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'artists'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        contractStart: doc.data().contractStart?.toDate(),
        contractEnd: doc.data().contractEnd?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Artist[];

      setArtists(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { artists, loading };
}

export async function getArtistById(artistId: string): Promise<Artist | null> {
  try {
    const docRef = doc(db, 'artists', artistId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
      contractStart: docSnap.data().contractStart?.toDate(),
      contractEnd: docSnap.data().contractEnd?.toDate(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Artist;
  } catch (err) {
    console.error('Error fetching artist:', err);
    return null;
  }
}
```

### Similar hooks for:
- `useClients` (lib/hooks/useClients.ts)
- `useServices` (lib/hooks/useServices.ts)
- `useOrders` (lib/hooks/useOrders.ts)
- `useLegalCases` (lib/hooks/useLegalCases.ts)
- `useStreamGodTasks` (lib/hooks/useStreamGodTasks.ts)

---

## ☁️ Cloud Functions Integration

### Callable Functions (via httpsCallable)

**lib/firebase.ts** (add to init file):

```typescript
import { httpsCallable } from 'firebase/functions';

// Export factory functions
export const callStreamGodAnalyze = httpsCallable(functions, 'streamgod-analyze');
export const callStreamGodGenerateTasks = httpsCallable(functions, 'streamgod-generateTasks');
export const callStreamGodRecommendations = httpsCallable(functions, 'streamgod-recommendations');
export const callGenerateQCReport = httpsCallable(functions, 'generateQCReport');
export const callPrepareDMFDelivery = httpsCallable(functions, 'prepareDMFDelivery');
export const callTriggerMigration = httpsCallable(functions, 'triggerMigration');
```

### Example: StreamGod Console Usage

```typescript
// pages/streamgod/page.tsx
'use client';

import { useState } from 'react';
import { callStreamGodAnalyze } from '@/lib/firebase';

export default function StreamGodPage() {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await callStreamGodAnalyze({ prompt });
      setResults(result.data);
    } catch (error) {
      console.error('StreamGod error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What do you want StreamGod to analyze?"
        />
        <button disabled={loading}>{loading ? 'Analyzing...' : 'Ask StreamGod'}</button>
      </form>

      {results && <AnalysisCard results={results} />}
    </div>
  );
}
```

---

## 📋 Page-by-Page Integration Checklist

### /owner/dashboard

**Collections Read**:
- `releases` (all, count, status filter)
- `artists` (all, count)
- `clients` (all, count)
- `services` (active orders only)
- `activity_log` (recent only, last 10)

**Cloud Functions**:
- None (purely read-only)

**Custom Hooks**:
- `useReleases()` (no filters)
- `useArtists()`
- `useClients()`
- `useServices()`
- `useActivityLog()` (custom hook needed)

**Data Dependencies**:
- Releases count grouped by status
- Artists count by status
- Clients count by status
- Services by active orders
- Activity log ordered by date DESC

---

### /catalog

**Collections Read**:
- `releases` (all, with filters)

**Custom Hooks**:
- `useReleases(filters)` ← pass label, artistId, status

**Filters to Implement**:
- By label
- By artist (autocomplete from `artists`)
- By status
- By QC score (client-side range)
- By migration status
- Search by title/UPC (client-side)

**Bulk Actions**:
- "Prepare for DMF" → calls `prepareDMFDelivery()` function
- "Flag for QC" → updates `releases.status` → `BLOCKED`
- "Archive" → updates `releases.status` → `ARCHIVED`

---

### /catalog/:releaseId

**Collections Read**:
- `releases/{releaseId}` (single doc)
- `releases/{releaseId}/tracks` (subcollection)
- `artists` (lookup for linked artistIds)

**Collections Write**:
- `releases/{releaseId}` (update title, genre, metadata)
- `releases/{releaseId}/tracks` (add/edit/delete)

**Cloud Functions Call**:
- `generateQCReport()` → run QC check
- `prepareDMFDelivery()` → prepare for DSP delivery
- `triggerMigration()` → start Symphonic takedown

**Custom Hook**:
- `getReleaseById(releaseId)` → single fetch + subscribe to changes
- `useReleases()` → for linking artists

---

### /distribution/migration

**Collections Read**:
- `releases` (filter by `migrationStatus` and `status`)

**Collections Write**:
- `releases/{releaseId}.migrationStatus` (update status)

**Custom Hooks**:
- `useReleases(filters: { status, migrationStatus })`

**Drag-and-Drop Logic**:
- Drag card from column A → column B
- On drop, call `updateRelease(releaseId, { migrationStatus: newStatus })`

**StreamGod Suggestions**:
- Call `callStreamGodRecommendations()` → get top X releases for migration

---

### /roster

**Collections Read**:
- `artists` (all)

**Collections Write**:
- None (index page is read-only)

**Custom Hooks**:
- `useArtists()`

**Filters**:
- By label, status, contract type
- Search by name

---

### /roster/:artistId

**Collections Read**:
- `artists/{artistId}` (single)
- `releases` (filter where `primaryArtistId` = artistId)
- `contracts/{artistId}` (if exists)
- `services_ordered` (filter by artistId)

**Collections Write**:
- `artists/{artistId}` (update profile)
- `releases` (create new)

**Custom Hooks**:
- `getArtistById(artistId)`
- `useReleases(filters: { artistId })`
- `useServices()` (for "Add Service Package")

**Key Actions**:
- "Create Release" → redirect to `/catalog/new?artistId=...`
- "Add Service" → modal opens → calls `createOrder(...)`

---

### /clients

**Collections Read**:
- `clients` (all)

**Custom Hooks**:
- `useClients()`

**Filters**:
- By tier, manager, status

---

### /clients/:clientId

**Collections Read**:
- `clients/{clientId}` (single)
- `services_ordered` (filter by clientId)
- `invoices` (filter by clientId)

**Collections Write**:
- `clients/{clientId}` (update)
- `invoices` (create new)
- `services_ordered` (create new)

**Custom Hooks**:
- `getClientById(clientId)`
- `useOrders(filters: { clientId })`
- `useInvoices(filters: { clientId })` (custom hook needed)

---

### /services

**Collections Read**:
- `services` (all)

**Custom Hooks**:
- `useServices()`

**Filters**:
- By category
- By price range
- By turnaround time

---

### /services/:serviceId

**Collections Read**:
- `services/{serviceId}` (single)

**Custom Hooks**:
- `getServiceById(serviceId)`

**Action**:
- "Book Service" → opens order form → calls `createOrder(...)` → redirects to `/orders/:orderId`

---

### /orders

**Collections Read**:
- `orders` (all)

**Custom Hooks**:
- `useOrders()`

**Filters**:
- By status, client, service, assigned person

---

### /streamgod

**Collections Read**:
- None (pure AI interaction)

**Cloud Functions**:
- `callStreamGodAnalyze()` (main function)
- `callStreamGodGenerateTasks()` (create tasks from analysis)

**State**:
- `prompt` (string)
- `results` (object)
- `loading` (boolean)

**Key Action**:
- Submit prompt → call function → display results
- "Create Tasks from This" → call `callStreamGodGenerateTasks()` → redirect to `/streamgod/tasks`

---

### /streamgod/tasks

**Collections Read**:
- `streamgod_tasks` (all, with filters)

**Collections Write**:
- `streamgod_tasks/{taskId}` (update status, assign, notes)

**Custom Hooks**:
- `useStreamGodTasks(filters)`

**Filters**:
- By status, priority, assigned person

---

### /legal

**Collections Read**:
- `legal_cases` (open only, count by type)
- `contracts` (expiring in next 30 days)

**Custom Hooks**:
- `useLegalCases(filters: { status: 'NEW' | 'IN_PROGRESS' | ... })`
- `useContracts(filters: { expiringIn30Days: true })`

---

### /legal/cases

**Collections Read**:
- `legal_cases` (all)

**Custom Hooks**:
- `useLegalCases()`

**Filters**:
- By status, type, assigned person

---

### /legal/cases/:caseId

**Collections Read**:
- `legal_cases/{caseId}` (single)
- `legal_cases/{caseId}/documents` (subcollection)

**Collections Write**:
- `legal_cases/{caseId}` (update status, notes)
- `legal_cases/{caseId}/documents` (add new doc)

**Custom Hooks**:
- `getLegalCaseById(caseId)`
- `useLegalCaseDocuments(caseId)` (custom hook)

---

### /settings

**Collections Read**:
- `config/settings` (single doc)

**Collections Write**:
- `config/settings` (update any field)

**Admin-Only**:
- This entire page should check `user.role === 'Admin' || 'Owner'`

**Custom Hook**:
- `useSettings()` (reads + watches `config/settings`)

---

## 🔒 Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Owner/Admin can do everything
    match /{document=**} {
      allow read, write: if request.auth.token.role in ['Owner', 'Admin'];
    }

    // Staff can read most collections, write to specific docs
    match /releases/{releaseId} {
      allow read: if request.auth.token.role in ['Owner', 'Admin', 'Staff'];
      allow write: if request.auth.token.role in ['Owner', 'Admin'];
    }

    match /artists/{artistId} {
      allow read: if request.auth.token.role in ['Owner', 'Admin', 'Staff'];
      allow write: if request.auth.token.role in ['Owner', 'Admin'];
    }

    // Artists/Clients can read their own data
    match /artists/{artistId} {
      allow read: if request.auth.uid == artistId;
    }

    match /clients/{clientId} {
      allow read: if request.auth.uid == clientId;
    }

    // Orders: creator can read own, Staff can read all
    match /orders/{orderId} {
      allow read: if request.auth.token.role in ['Owner', 'Admin', 'Staff'];
      allow read: if request.auth.uid == resource.data.clientId || request.auth.uid == resource.data.artistId;
    }

    // Legal: Owner/Admin/Staff only
    match /legal_cases/{caseId} {
      allow read, write: if request.auth.token.role in ['Owner', 'Admin', 'Staff'];
    }

    // Settings: Owner/Admin only
    match /config/settings {
      allow read, write: if request.auth.token.role in ['Owner', 'Admin'];
    }
  }
}
```

---

## ✅ Implementation Steps

1. **Setup Firebase** → `lib/firebase.ts`
2. **Create Types** → `lib/types/*.ts`
3. **Create Hooks** → `lib/hooks/*.ts`
4. **Build Components** → `components/**/*.tsx`
5. **Build Pages** → `app/**/page.tsx`
6. **Test Firestore Queries** → Check console for correct data
7. **Deploy** → `firebase deploy`

---

**Status**: Integration Guide Complete  
**Ready to Code**: ✅ Yes
