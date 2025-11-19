# 💻 DMF Frontend - Component Templates & Patterns

**Purpose**: Copy-paste component templates for rapid development  
**Framework**: React 18+ with TypeScript  
**Styling**: Tailwind CSS (assumed)

---

## 📐 Component Architecture Pattern

Every component follows this structure:

```typescript
// 1. Imports
import { useEffect, useState } from 'react';
import Link from 'next/link';

// 2. Type definitions (or import from lib/types/)
interface Props {
  releaseId: string;
  onUpdate?: (updated: Release) => void;
}

// 3. Component
export default function ComponentName({ releaseId, onUpdate }: Props) {
  // 3a. State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3b. Effects
  useEffect(() => {
    // Fetch or subscribe to data
  }, [releaseId]);

  // 3c. Handlers
  const handleAction = async () => {
    // Do something
  };

  // 3d. Render
  if (loading) return <LoadingSpinner />;
  if (!data) return <EmptyState />;

  return (
    <div>
      {/* Content */}
    </div>
  );
}
```

---

## 🎨 Shared Components (Building Blocks)

### Button.tsx

```typescript
// components/shared/Button.tsx
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
}: Props) {
  const baseStyles = 'font-semibold rounded-lg transition-colors';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
}
```

### Card.tsx

```typescript
// components/shared/Card.tsx
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${className}`}
    >
      {children}
    </div>
  );
}
```

### Badge.tsx

```typescript
// components/shared/Badge.tsx
interface Props {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export default function Badge({ text, variant = 'default' }: Props) {
  const styles = {
    default: 'bg-gray-200 text-gray-800',
    success: 'bg-green-200 text-green-800',
    warning: 'bg-yellow-200 text-yellow-800',
    danger: 'bg-red-200 text-red-800',
    info: 'bg-blue-200 text-blue-800',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${styles[variant]}`}>
      {text}
    </span>
  );
}
```

### Table.tsx

```typescript
// components/shared/Table.tsx
import { ReactNode } from 'react';

interface Props {
  columns: string[];
  children: ReactNode;
}

export default function Table({ columns, children }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-left text-sm font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
```

### Modal.tsx

```typescript
// components/shared/Modal.tsx
import { ReactNode } from 'react';

interface Props {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}

export default function Modal({ isOpen, title, children, onClose, footer }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && <div className="px-6 py-4 border-t bg-gray-50">{footer}</div>}
      </div>
    </div>
  );
}
```

### LoadingSpinner.tsx

```typescript
// components/shared/LoadingSpinner.tsx
export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

---

## 📊 Dashboard Components

### KPICard.tsx

```typescript
// components/dashboard/KPICard.tsx
import Card from '@/components/shared/Card';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'flat';
}

export default function KPICard({ title, value, subtitle, icon, trend }: Props) {
  return (
    <Card>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        {trend && (
          <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↑' : '↓'} {Math.random() * 10}%
          </span>
        )}
      </div>
    </Card>
  );
}
```

### MigrationKanban.tsx

```typescript
// components/catalog/MigrationKanban.tsx
'use client';

import { useState } from 'react';
import { useReleases } from '@/lib/hooks/useReleases';
import { updateRelease } from '@/lib/hooks/useReleases';
import Card from '@/components/shared/Card';

const STATUSES = [
  'NOT_STARTED',
  'READY_FOR_DMF_UPLOAD',
  'LIVE_DMF',
  'SAFE_TO_TAKEDOWN',
  'SYMPHONIC_CLOSED',
];

export default function MigrationKanban() {
  const { releases, loading } = useReleases();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDrop = async (releaseId: string, newStatus: string) => {
    await updateRelease(releaseId, { migrationStatus: newStatus });
    setDraggedId(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-5 gap-4">
      {STATUSES.map((status) => (
        <div key={status} className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-4">{status}</h3>

          <div
            className="space-y-3 min-h-64"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedId) handleDrop(draggedId, status);
            }}
          >
            {releases
              .filter((r) => r.migrationStatus === status)
              .map((release) => (
                <Card
                  key={release.id}
                  className="cursor-move"
                  draggable
                  onDragStart={() => setDraggedId(release.id)}
                >
                  <img
                    src={release.coverArtUrl}
                    alt={release.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <p className="font-semibold text-sm">{release.title}</p>
                  <p className="text-xs text-gray-500">{release.primaryArtistId}</p>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 📋 Catalog Components

### ReleaseTable.tsx

```typescript
// components/catalog/ReleaseTable.tsx
'use client';

import { Release } from '@/lib/types/release';
import Link from 'next/link';
import Badge from '@/components/shared/Badge';
import Table from '@/components/shared/Table';

interface Props {
  releases: Release[];
}

export default function ReleaseTable({ releases }: Props) {
  const statusColors = {
    DRAFT: 'default',
    LIVE_SYMPHONIC: 'info',
    LIVE_DMF: 'success',
    BLOCKED: 'danger',
    ARCHIVED: 'warning',
  } as const;

  return (
    <Table columns={['Cover', 'Title', 'Artist', 'UPC', 'Status', 'QC', 'Migration']}>
      {releases.map((release) => (
        <tr key={release.id} className="border-b hover:bg-gray-50">
          <td className="px-4 py-3">
            <img
              src={release.coverArtUrl}
              alt={release.title}
              className="h-10 w-10 rounded object-cover"
            />
          </td>
          <td className="px-4 py-3">
            <Link href={`/catalog/${release.id}`} className="text-blue-600 hover:underline font-semibold">
              {release.title}
            </Link>
          </td>
          <td className="px-4 py-3 text-sm">{release.primaryArtistId}</td>
          <td className="px-4 py-3 text-sm font-mono">{release.upc}</td>
          <td className="px-4 py-3">
            <Badge text={release.status} variant={statusColors[release.status]} />
          </td>
          <td className="px-4 py-3">
            <div className="w-16 bg-gray-200 rounded h-2">
              <div
                className="bg-green-600 h-2 rounded"
                style={{ width: `${release.qcScore}%` }}
              ></div>
            </div>
          </td>
          <td className="px-4 py-3 text-sm">{release.migrationStatus}</td>
        </tr>
      ))}
    </Table>
  );
}
```

### ReleaseDetailHeader.tsx

```typescript
// components/catalog/ReleaseDetailHeader.tsx
import { Release } from '@/lib/types/release';
import Badge from '@/components/shared/Badge';

interface Props {
  release: Release;
}

export default function ReleaseDetailHeader({ release }: Props) {
  return (
    <div className="flex gap-6">
      {/* Cover */}
      <div className="flex-shrink-0">
        <img
          src={release.coverArtUrl}
          alt={release.title}
          className="w-64 h-64 rounded-lg object-cover shadow-lg"
        />
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex gap-2 mb-4">
          <Badge text={release.status} />
          <Badge text={release.migrationStatus} variant="info" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">{release.title}</h1>

        <div className="grid grid-cols-2 gap-4 text-gray-600 mb-6">
          <div>
            <p className="text-sm font-medium">Type</p>
            <p className="text-lg">{release.type}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Label</p>
            <p className="text-lg">{release.label}</p>
          </div>
          <div>
            <p className="text-sm font-medium">UPC</p>
            <p className="text-lg font-mono">{release.upc}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Release Date</p>
            <p className="text-lg">{release.releaseDate?.toLocaleDateString()}</p>
          </div>
        </div>

        {/* QC Score */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-2">QC Score</p>
          <div className="flex items-center gap-4">
            <div className="w-64 bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  release.qcScore >= 80
                    ? 'bg-green-600'
                    : release.qcScore >= 50
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${release.qcScore}%` }}
              ></div>
            </div>
            <span className="text-2xl font-bold">{release.qcScore}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### TrackListTable.tsx

```typescript
// components/catalog/TrackListTable.tsx
import { Track } from '@/lib/types/release';
import Table from '@/components/shared/Table';

interface Props {
  tracks: Track[];
  onEdit?: (track: Track) => void;
}

export default function TrackListTable({ tracks, onEdit }: Props) {
  return (
    <Table columns={['#', 'Title', 'Duration', 'ISRC', 'Writers', 'PRO Status']}>
      {tracks.map((track, index) => (
        <tr
          key={track.id}
          className="border-b hover:bg-gray-50 cursor-pointer"
          onClick={() => onEdit?.(track)}
        >
          <td className="px-4 py-3 text-sm font-medium">{index + 1}</td>
          <td className="px-4 py-3 font-semibold">{track.title}</td>
          <td className="px-4 py-3 text-sm">
            {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
          </td>
          <td className="px-4 py-3 text-sm font-mono">{track.isrc}</td>
          <td className="px-4 py-3 text-sm">
            {track.writers.map((w) => `${w.name} (${w.splitShare * 100}%)`).join(', ')}
          </td>
          <td className="px-4 py-3 text-sm">
            {track.proStatus.bmi && 'BMI '}
            {track.proStatus.ascap && 'ASCAP '}
            {!track.proStatus.bmi && !track.proStatus.ascap && 'Unregistered'}
          </td>
        </tr>
      ))}
    </Table>
  );
}
```

---

## 👤 Roster Components

### ArtistCard.tsx

```typescript
// components/roster/ArtistCard.tsx
import { Artist } from '@/lib/types/artist';
import Link from 'next/link';
import Card from '@/components/shared/Card';

interface Props {
  artist: Artist;
}

export default function ArtistCard({ artist }: Props) {
  return (
    <Link href={`/roster/${artist.id}`}>
      <Card className="h-full hover:shadow-xl">
        <img src={artist.photo} alt={artist.stageName} className="w-full h-48 object-cover rounded mb-4" />
        <h3 className="font-bold text-lg">{artist.stageName}</h3>
        <p className="text-gray-600 text-sm">{artist.label}</p>
        <div className="mt-4 pt-4 border-t space-y-1 text-sm">
          <p>
            <span className="font-medium">Status:</span> {artist.status}
          </p>
          <p>
            <span className="font-medium">Streams:</span> {artist.totalStreams.toLocaleString()}
          </p>
        </div>
      </Card>
    </Link>
  );
}
```

### ArtistProfileHeader.tsx

```typescript
// components/roster/ArtistProfileHeader.tsx
import { Artist } from '@/lib/types/artist';

interface Props {
  artist: Artist;
}

export default function ArtistProfileHeader({ artist }: Props) {
  return (
    <div className="flex gap-8">
      {/* Photo */}
      <img src={artist.photo} alt={artist.stageName} className="w-48 h-48 rounded-lg object-cover shadow-lg" />

      {/* Info */}
      <div className="flex-1">
        <h1 className="text-4xl font-bold mb-2">{artist.stageName}</h1>
        <p className="text-gray-600 text-lg mb-4">{artist.legalName}</p>

        {/* Bio */}
        {artist.bio && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-gray-600 mb-2">Bio</h3>
            <p className="text-gray-700">{artist.bio}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs font-medium text-gray-600">Status</p>
            <p className="text-lg font-bold">{artist.status}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600">Label</p>
            <p className="text-lg font-bold">{artist.label}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600">Total Streams</p>
            <p className="text-lg font-bold">{(artist.totalStreams / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        {/* Socials */}
        {Object.entries(artist.socials).some(([_, v]) => v) && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Follow</p>
            <div className="flex gap-2">
              {artist.socials.instagram && (
                <a href={artist.socials.instagram} className="text-blue-600 hover:underline">
                  Instagram
                </a>
              )}
              {artist.socials.tiktok && (
                <a href={artist.socials.tiktok} className="text-blue-600 hover:underline">
                  TikTok
                </a>
              )}
              {artist.socials.twitter && (
                <a href={artist.socials.twitter} className="text-blue-600 hover:underline">
                  Twitter
                </a>
              )}
              {artist.socials.spotify && (
                <a href={artist.socials.spotify} className="text-blue-600 hover:underline">
                  Spotify
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## ⚙️ Forms Pattern

### ReleaseForm.tsx (Example)

```typescript
// components/forms/ReleaseForm.tsx
'use client';

import { useState } from 'react';
import { ReleaseFormData, createRelease } from '@/lib/hooks/useReleases';
import Button from '@/components/shared/Button';

interface Props {
  onSuccess?: (releaseId: string) => void;
}

export default function ReleaseForm({ onSuccess }: Props) {
  const [formData, setFormData] = useState<ReleaseFormData>({
    title: '',
    type: 'Single',
    primaryArtistId: '',
    label: '',
    upc: '',
    genre: '',
    subGenre: '',
    explicit: false,
    releaseDate: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const releaseId = await createRelease(formData);
      onSuccess?.(releaseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create release');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-4 bg-red-100 text-red-800 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Single">Single</option>
            <option value="EP">EP</option>
            <option value="Album">Album</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Release Date</label>
          <input
            type="date"
            name="releaseDate"
            value={formData.releaseDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
          <input
            type="text"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Genre</label>
          <input
            type="text"
            name="subGenre"
            value={formData.subGenre}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="explicit"
            checked={formData.explicit}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Explicit Content</span>
        </label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Release'}
        </Button>
      </div>
    </form>
  );
}
```

---

## ✅ Component Checklist

Before deploying a component:

- [ ] TypeScript types defined
- [ ] Props interface documented
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Empty states handled
- [ ] Responsive layout tested
- [ ] Accessibility (alt text, labels, etc.)
- [ ] Tailwind classes used consistently
- [ ] No console warnings
- [ ] Mobile-friendly

---

**Status**: Component Templates Complete  
**Ready to Copy**: ✅ Yes
