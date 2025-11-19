# Royalty Lock-In Quick Reference

## Project Structure

```
dmf-music-platform/
├── firebase.json                    # Firebase config
├── firestore.rules                  # Security rules
├── firestore.indexes.json           # Firestore indexes
├── functions/
│   ├── src/
│   │   ├── index.ts                # Main entry point
│   │   ├── types/
│   │   │   └── RoyaltyTypes.ts     # TypeScript interfaces
│   │   └── royalty/
│   │       ├── royaltyApi.ts       # CRUD endpoints
│   │       └── royaltyLogic.ts     # Business logic
│   ├── package.json
│   └── tsconfig.json
├── RoyaltyApiClient.ts              # Frontend client library
└── FIREBASE_ROYALTY_SETUP.md        # Full setup guide
```

---

## Cloud Functions Endpoints

| Function | Method | URL | Purpose |
|----------|--------|-----|---------|
| `getRoyaltyProfile` | GET | `/getRoyaltyProfile?artistId=ARTIST_123` | Fetch artist profile |
| `saveRoyaltyProfile` | POST | `/saveRoyaltyProfile` | Create/update profile |
| `deleteRoyaltyProfile` | DELETE | `/deleteRoyaltyProfile?artistId=ARTIST_123` | Delete profile |
| `canPublishRelease` | GET | `/canPublishRelease?releaseId=RELEASE_123` | Check if release can go live |
| `getReleaseStatus` | GET | `/getReleaseStatus?releaseId=RELEASE_123` | Get release details |

---

## Firestore Collections

### `royaltyProfiles/{artistId}`

Artist's royalty enrollment status. Fields:
- `artistId`, `userId`
- `legalFirstName`, `legalLastName`, `stageNames`
- `roles` (Songwriter, FeaturedArtist, LabelOwner, etc.)
- `enrollmentStatuses` (BMI, SoundExchange status)
- `consent` (lock-in enabled flag)
- `createdAt`, `updatedAt`

### `releases/{releaseId}`

Music release metadata. Fields:
- `releaseId`, `title`
- `contributors` (array of {artistId, roles})
- `status` (Draft, Scheduled, Published, Rejected)
- `releaseDate`
- `createdAt`, `updatedAt`

### `artists/{artistId}`

Artist master record. Fields:
- `artistId`, `stageName`, `userId`
- `createdAt`

### `users/{userId}`

App user record. Fields:
- `userId`, `email`, `isDmfStaff`
- `createdAt`

---

## Enrollment Status Types

### Org: `'BMI'`
- **Scope:** `'Writer'` → For songwriters
- **Scope:** `'Publisher'` → For publishers

### Org: `'SoundExchange'`
- **Scope:** `'FeaturedArtist'` → For featured artists
- **Scope:** `'RightsOwner'` → For label owners

### Status Codes
- `'NotNeeded'` – Role doesn't require this enrollment
- `'NotStarted'` – Not yet begun
- `'Pending'` – Awaiting external org approval
- `'InProgress'` – In the middle of enrollment
- `'Completed'` – Finished and verified ✅
- `'Rejected'` – Application was rejected

---

## Release Gate Rules

Before a release can go to DSPs, **all contributors must have**:

| Role | Required Enrollment | Status |
|------|--------------------|----|
| Songwriter | BMI Writer | Completed |
| Composer | BMI Writer | Completed |
| FeaturedArtist | SoundExchange FeaturedArtist | Completed |
| LabelOwner | SoundExchange RightsOwner | Completed |
| Producer | (optional) | - |

If a contributor is **missing** an enrollment, `canPublishRelease` returns:
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

---

## Frontend Usage Example

```typescript
import { RoyaltyApiClient } from './RoyaltyApiClient';

const client = new RoyaltyApiClient(
  'https://us-central1-dmf-music-platform.cloudfunctions.net'
);

// Get artist's profile
const profile = await client.getRoyaltyProfile('ARTIST_123');
console.log('BMI account:', profile.proMemberships?.bmi?.hasAccount);
console.log('SoundExchange:', profile.soundExchange?.hasAccount);

// Update profile (e.g., user fills out form)
await client.saveRoyaltyProfile({
  artistId: 'ARTIST_123',
  email: 'newemail@example.com',
  phoneNumber: '+1-614-000-1111'
});

// Check release before publishing
const { canPublish, blockingIssues } = await client.canPublishRelease('RELEASE_123');

if (!canPublish) {
  // Show artist why they can't publish
  blockingIssues.forEach(issue => {
    console.log(`⚠️  ${issue.artistId}: ${issue.reason}`);
  });
} else {
  console.log('✅ Release is ready to go live!');
}
```

---

## Deployment Commands

```bash
# Install dependencies
cd functions && npm install && cd ..

# Build TypeScript
cd functions && npm run build && cd ..

# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore
firebase deploy --only firestore:rules,firestore:indexes

# View logs
firebase functions:log

# Local testing
firebase emulators:start --only firestore,functions
```

---

## Security Model

- **Artists** can read/write only their own profile
- **DMF Staff** can read/write any profile
- **Public** cannot access profiles directly (only through app)

Controlled by `firestore.rules` with role checks.

---

## Testing Checklist

- [ ] Get royalty profile for existing artist
- [ ] Get royalty profile for non-existent artist (should 404)
- [ ] Save new royalty profile
- [ ] Update existing profile (merge behavior)
- [ ] Delete royalty profile
- [ ] Check release with all enrollments completed → `canPublish: true`
- [ ] Check release with missing BMI → `canPublish: false`
- [ ] Check release with missing SoundExchange → `canPublish: false`
- [ ] Check release with non-existent release ID → error
- [ ] CORS headers present on all responses
- [ ] Error messages are helpful (include what's missing)

---

## Common Issues

**"Permission denied" on profile fetch?**
→ Check Firestore rules. User must be authenticated.

**Release gate always returns `false`?**
→ Check that release has contributors with valid artistIds.
→ Check that artist profiles exist in Firestore.
→ Check that enrollment statuses are "Completed".

**Functions timing out?**
→ Check Firestore network latency.
→ Add indexes for complex queries.
→ Increase Cloud Function timeout (default 60s, max 540s).

**TypeScript compilation errors?**
→ Run `npm install` in `functions/`
→ Run `npm run build` to check for errors
→ Check `tsconfig.json` settings

---

## Next: Email Notifications

Once profiles are updated, trigger emails:
```bash
// Add new function: onRoyaltyProfileUpdate
export const onRoyaltyProfileUpdate = functions.firestore
  .document('royaltyProfiles/{artistId}')
  .onWrite(async (change, context) => {
    // Send email if enrollmentStatuses changed
    // Send email if consent flags changed
  });
```

---

## Links

- Firebase Console: https://console.firebase.google.com
- Cloud Functions Pricing: https://firebase.google.com/pricing
- Firestore Pricing: https://firebase.google.com/pricing
- TypeScript Guide: https://www.typescriptlang.org/docs/
