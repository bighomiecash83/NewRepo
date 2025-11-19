# 📋 DMF Frontend - Quick Reference Card

**Print this. Keep it next to your keyboard.**

---

## 🎯 What We're Building

**Not a distributor panel.** The most complete music platform UI:

- Owner dashboard (KPIs, alerts, health)
- Catalog (releases, QC, migration)
- Roster (artists, contracts)
- Clients (B2B customers)
- Services (marketplace)
- StreamGod AI (console + tasks)
- Legal (cases, takedowns)
- Settings (branding, integrations)

---

## 📖 Documentation (Read in Order)

| Day | Doc | Time | Purpose |
|-----|-----|------|---------|
| 1 AM | FRONTEND_ARCHITECTURE_FINAL.md | 30 min | Overview of entire app |
| 1 AM | FRONTEND_FIREBASE_INTEGRATION.md | 45 min | How Firebase connects |
| 1 PM | FRONTEND_KICKOFF_PLAN.md | 20 min | Sprint breakdown |
| Before coding | FRONTEND_COMPONENT_TEMPLATES.md | 30 min | Copy-paste patterns |

**Total**: 2 hours before code

---

## 🏗️ Project Structure

```
dmf-app/
├── app/
│   ├── owner/dashboard/page.tsx
│   ├── catalog/page.tsx
│   ├── catalog/[releaseId]/page.tsx
│   ├── roster/page.tsx
│   ├── roster/[artistId]/page.tsx
│   ├── clients/page.tsx
│   ├── services/page.tsx
│   ├── orders/page.tsx
│   ├── streamgod/page.tsx
│   ├── legal/page.tsx
│   └── settings/page.tsx
│
├── lib/
│   ├── firebase.ts          ← Firebase init
│   ├── hooks/
│   │   ├── useReleases.ts
│   │   ├── useArtists.ts
│   │   ├── useClients.ts
│   │   └── useServices.ts
│   └── types/
│       ├── release.ts
│       ├── artist.ts
│       ├── client.ts
│       ├── service.ts
│       ├── task.ts
│       ├── legal.ts
│       └── bot.ts
│
├── components/
│   ├── dashboard/ (KPICard, widgets)
│   ├── catalog/ (ReleaseTable, detail)
│   ├── roster/ (ArtistCard, profile)
│   ├── services/ (ServiceCard, grid)
│   ├── streamgod/ (console, tasks)
│   ├── legal/ (case table, detail)
│   └── shared/ (Button, Card, Modal, etc.)
│
└── .env.local              ← Firebase creds
```

---

## 🔥 Firebase Collections

```
releases/
├── title, type, primaryArtistId, label, upc
├── genre, explicit, releaseDate, coverArtUrl
├── status (DRAFT, LIVE_SYMPHONIC, LIVE_DMF, BLOCKED)
├── qcScore, migrationStatus
├── dmf { status, liveOn[] }
└── symphonic { status, liveOn[] }

artists/
├── stageName, legalName, photo, bio
├── label, contractType, revenueSplit
├── status (Active, On Hold, Development)
└── totalStreams

clients/
├── name, logo, contactPerson, email
├── serviceTier (Bronze, Silver, Gold)
├── assignedManager, status
└── nextInvoiceDate

services/
├── name, category, description
├── price, turnaroundDays
├── deliverables[], requirements[]
└── addOns[]

orders/
├── clientId OR artistId
├── serviceId, status (NEW, IN_PROGRESS, COMPLETE)
├── orderDate, dueDate, assignedTo
└── progress (0-100)

streamgod_tasks/
├── description, status (NEW, IN_PROGRESS, COMPLETE)
├── priority (High, Medium, Low)
├── relatedReleaseId, relatedArtistId
└── checklist[]

legal_cases/
├── caseId, type (Takedown, Copyright, Contract)
├── title, description, status
├── assignedTo, dueDate
├── relatedReleaseId, relatedArtistId
└── documents[] (subcollection)
```

---

## 🪝 Custom Hooks (One-Line Reference)

```typescript
// Releases
const { releases, loading, error } = useReleases(filters);
const release = await getReleaseById(releaseId);
const releaseId = await createRelease(formData);
await updateRelease(releaseId, { status: 'LIVE_DMF' });

// Artists
const { artists, loading } = useArtists();
const artist = await getArtistById(artistId);

// Clients
const { clients, loading } = useClients();
const client = await getClientById(clientId);

// Services
const { services, loading } = useServices();
const service = await getServiceById(serviceId);

// Orders
const { orders, loading } = useOrders(filters);

// Legal Cases
const { cases, loading } = useLegalCases(filters);

// StreamGod Tasks
const { tasks, loading } = useStreamGodTasks(filters);
```

---

## 🧩 Component Patterns (Copy These)

### Pattern 1: Page with Table

```typescript
'use client';

import { useReleases } from '@/lib/hooks/useReleases';
import ReleaseTable from '@/components/catalog/ReleaseTable';

export default function CatalogPage() {
  const { releases, loading } = useReleases();

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Catalog</h1>
      <ReleaseTable releases={releases} />
    </div>
  );
}
```

### Pattern 2: Page with Detail View

```typescript
'use client';

import { useParams } from 'next/navigation';
import { getReleaseById } from '@/lib/hooks/useReleases';
import { useEffect, useState } from 'react';

export default function ReleaseDetailPage() {
  const { releaseId } = useParams();
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getReleaseById(releaseId as string);
      setRelease(data);
      setLoading(false);
    })();
  }, [releaseId]);

  if (loading) return <LoadingSpinner />;
  if (!release) return <div>Not found</div>;

  return (
    <div>
      <ReleaseDetailHeader release={release} />
      <TrackListTable tracks={release.tracks} />
    </div>
  );
}
```

### Pattern 3: Form

```typescript
const [formData, setFormData] = useState({ title: '', label: '' });
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await createRelease(formData);
    // Success
  } catch (error) {
    // Error
  } finally {
    setLoading(false);
  }
};

return (
  <form onSubmit={handleSubmit}>
    <input name="title" value={formData.title} onChange={handleChange} />
    <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
  </form>
);
```

---

## ☁️ Cloud Functions (Call These)

```typescript
import {
  callStreamGodAnalyze,
  callStreamGodGenerateTasks,
  callGenerateQCReport,
  callPrepareDMFDelivery,
  callTriggerMigration,
} from '@/lib/firebase';

// Example: StreamGod
const result = await callStreamGodAnalyze({ prompt: 'Find releases missing metadata' });

// Example: QC Report
const qcScore = await callGenerateQCReport({ releaseId: 'abc123' });

// Example: Migration
await callTriggerMigration({ releaseId: 'abc123', action: 'prepareDMF' });
```

---

## 🎨 Tailwind Quick Classes

```css
/* Layout */
flex, grid, gap-4, w-full, h-64

/* Spacing */
px-4, py-2, mb-6, mt-3

/* Colors */
bg-blue-600, text-gray-900, border-gray-300

/* States */
hover:bg-blue-700, disabled:opacity-50, focus:ring-2

/* Typography */
font-bold, text-sm, text-center

/* Utilities */
rounded-lg, shadow-lg, transition-colors, cursor-pointer
```

---

## 🔐 Role-Based Access

```typescript
// Check user role
if (user.role !== 'Owner' && user.role !== 'Admin') {
  return <div>Access denied</div>;
}

// Render based on role
{user.role === 'Staff' && <button>Assign task</button>}
{user.role === 'Artist' && <button>Create release</button>}
```

---

## 🐛 Debugging Checklist

| Issue | Solution |
|-------|----------|
| Data not showing | Check `useReleases()` is working, console.log(releases) |
| Form not submitting | Check `e.preventDefault()`, check `createRelease()` returns correctly |
| Firestore null | Check `.env.local` has correct Firebase project ID |
| Styles not showing | Check Tailwind config includes app folder path |
| Image not loading | Use `next/image` not `<img>`, or check URL is correct |
| Page slow | Add pagination, use `useCallback`, check Network tab |

---

## ⏱️ 2-Week Sprint

```
Week 1:
  Mon: Setup, types, Firebase init
  Tue: Shared components, layout
  Wed-Thu: Custom hooks, Dashboard page
  Fri: Catalog pages

Week 2:
  Mon: Roster, Clients pages
  Tue: Services, Orders pages
  Wed: Legal, Settings pages
  Thu: Auth, polish
  Fri: Testing, deploy

Result: MVP live, all pages working, data real-time
```

---

## 📞 Blockers?

1. **Page structure unclear** → Check FRONTEND_ARCHITECTURE_FINAL.md
2. **How to connect Firebase** → Check FRONTEND_FIREBASE_INTEGRATION.md
3. **Component pattern** → Check FRONTEND_COMPONENT_TEMPLATES.md
4. **Sprint tasks** → Check FRONTEND_KICKOFF_PLAN.md
5. **Still stuck** → Ask owner in chat with screenshot + code

---

## ✅ Definition of Done

Each page is done when:
- [ ] Page loads without errors
- [ ] Real data from Firestore displays
- [ ] Forms can create/edit data
- [ ] Loading states show
- [ ] Error states handled
- [ ] Mobile responsive
- [ ] No console warnings
- [ ] Navigation works
- [ ] Tests pass (if added)

---

## 🚀 Deployment

```bash
# Test
npm run dev
# Check localhost:3000

# Build
npm run build
# Fix any errors

# Deploy
firebase deploy
# Check Firebase Hosting URL
```

---

## 🎯 Success Metrics (Week 2 Friday)

- ✅ Dashboard live with real data
- ✅ All 7 page sections have pages
- ✅ Can browse releases, artists, clients
- ✅ Can create new items (forms work)
- ✅ Real-time updates working
- ✅ Responsive on mobile
- ✅ Deployed to Firebase Hosting
- ✅ Team can demo to stakeholders

---

## 📚 Keep These Open

1. **FRONTEND_ARCHITECTURE_FINAL.md** – Reference while building
2. **FRONTEND_COMPONENT_TEMPLATES.md** – Copy components from here
3. **FRONTEND_FIREBASE_INTEGRATION.md** – Check collection mappings
4. **This card** – Daily reference

---

## 💡 Pro Tips

1. **Use `next/dynamic`** for large components → faster page load
2. **Use `useCallback`** in components with many props → prevent re-renders
3. **Test with real data early** → catches Firestore schema issues
4. **Deploy to staging first** → test in prod-like environment
5. **Add error boundaries** → handle crashes gracefully
6. **Use TypeScript strict mode** → catch bugs early
7. **Add console.logs sparingly** → use DevTools instead

---

## 🎉 You Got This

This is a complete, production-grade music platform. Not a template, not a tutorial—an actual business system.

Build it right. Deploy with confidence. Ship it.

**Questions?** Check the docs. Blocked? Ask owner. Ship MVP by Week 2 Friday. 🚀
