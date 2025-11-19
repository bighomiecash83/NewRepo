# Royalty Lock-In System - Visual Guide

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DMF ROYALTY LOCK-IN SYSTEM                         │
│                      (Firebase + Cloud Functions)                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─ FRONTEND LAYER ──────────────────────────────────────────────────────────┐
│                                                                            │
│  Google AI Studio Dashboard          Lovable Frontend                     │
│  ┌──────────────────────┐           ┌──────────────────┐                 │
│  │ View Royalty Profile │           │ Submit Release  │                 │
│  │ Update Enrollments   │           │ Check Gate      │                 │
│  │ Check Enrollment     │           │ Publish to DSPs │                 │
│  └──────────┬───────────┘           └────────┬─────────┘                 │
│             │                                │                            │
│             └────────────┬───────────────────┘                            │
│                          │                                                 │
│            RoyaltyApiClient.ts (TypeScript)                               │
│            • getRoyaltyProfile()                                          │
│            • saveRoyaltyProfile()                                         │
│            • canPublishRelease()                                          │
│                          │                                                 │
└──────────────┬───────────┴────────────────────────────────────────────────┘
               │
        HTTPS Requests (JSON)
               │
┌──────────────▼───────────────────────────────────────────────────────────┐
│                    FIREBASE CLOUD FUNCTIONS                               │
│                  (Node.js Runtime - Serverless)                           │
│                                                                            │
│  getRoyaltyProfile          saveRoyaltyProfile                            │
│  └─ GET /getRoyaltyProfile  └─ POST /saveRoyaltyProfile                  │
│                                                                            │
│  deleteRoyaltyProfile       canPublishRelease                             │
│  └─ DELETE /...             └─ GET /canPublishRelease                    │
│                                                                            │
│  getReleaseStatus                                                          │
│  └─ GET /getReleaseStatus                                                │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────┐             │
│  │ Business Logic:                                         │             │
│  │                                                          │             │
│  │  function hasCompletedStatus(profile, org, scope) {    │             │
│  │    return profile.enrollmentStatuses.some(...)         │             │
│  │  }                                                       │             │
│  │                                                          │             │
│  │  if (roles.includes('Songwriter'))                      │             │
│  │    → check BMI Writer Completed                         │             │
│  │                                                          │             │
│  │  if (roles.includes('FeaturedArtist'))                  │             │
│  │    → check SoundExchange FeaturedArtist Completed       │             │
│  │                                                          │             │
│  │  if (roles.includes('LabelOwner'))                      │             │
│  │    → check SoundExchange RightsOwner Completed          │             │
│  │                                                          │             │
│  └─────────────────────────────────────────────────────────┘             │
│                                                                            │
└──────────────┬──────────────────────────────────────────────────────────┘
               │
        Firestore API (SDK)
               │
┌──────────────▼──────────────────────────────────────────────────────────┐
│                     FIRESTORE DATABASE                                    │
│                  (Document-based, Real-time)                              │
│                                                                            │
│  ┌─ Collections ────────────────────────────────────────┐                │
│  │                                                       │                │
│  │  royaltyProfiles/                                    │                │
│  │  ├─ ARTIST_123                  document             │                │
│  │  │  ├─ legalFirstName: "DeAngelo"                   │                │
│  │  │  ├─ roles: ["Songwriter", "FeaturedArtist"]       │                │
│  │  │  ├─ proMemberships: {bmi: {hasAccount: true}}     │                │
│  │  │  ├─ soundExchange: {hasAccount: true}             │                │
│  │  │  ├─ consent: {royaltyLockInEnabled: true}         │                │
│  │  │  ├─ enrollmentStatuses: [...]                     │                │
│  │  │  └─ updatedAt: "2025-11-17T00:00:00Z"            │                │
│  │  │                                                    │                │
│  │  ├─ ARTIST_456                  document             │                │
│  │  │  └─ ...                                            │                │
│  │  │                                                    │                │
│  │  releases/                                           │                │
│  │  ├─ RELEASE_123                 document             │                │
│  │  │  ├─ title: "New Album 2025"                       │                │
│  │  │  ├─ contributors: [                                │                │
│  │  │  │   { artistId: "ARTIST_123",                    │                │
│  │  │  │     roles: ["Songwriter", "FeaturedArtist"] }  │                │
│  │  │  │ ]                                               │                │
│  │  │  └─ status: "Draft"                               │                │
│  │  │                                                    │                │
│  │  artists/                                            │                │
│  │  ├─ ARTIST_123                  document             │                │
│  │  │  ├─ stageName: "Big Homie Cash"                   │                │
│  │  │  └─ userId: "USER_123"                            │                │
│  │  │                                                    │                │
│  │  users/                                              │                │
│  │  ├─ USER_123                    document             │                │
│  │  │  ├─ email: "artist@example.com"                   │                │
│  │  │  └─ isDmfStaff: false                             │                │
│  │  │                                                    │                │
│  │  ├─ ADMIN_001                   document             │                │
│  │  │  ├─ email: "admin@dmf.com"                        │                │
│  │  │  └─ isDmfStaff: true                              │                │
│  │                                                       │                │
│  └─ Security Rules ───────────────────────────────────┐ │                │
│  │                                                    │ │                │
│  │  Artists CAN:                                     │ │                │
│  │  ✓ Read own royaltyProfile                        │ │                │
│  │  ✓ Write own royaltyProfile                       │ │                │
│  │  ✓ Read releases (check gate)                     │ │                │
│  │                                                    │ │                │
│  │  DMF Staff CAN:                                   │ │                │
│  │  ✓ Read ANY royaltyProfile                        │ │                │
│  │  ✓ Write ANY royaltyProfile                       │ │                │
│  │  ✓ Delete profiles                                │ │                │
│  │  ✓ Manage releases                                │ │                │
│  │                                                    │ │                │
│  │  Public CANNOT:                                   │ │                │
│  │  ✗ Read/write anything directly                   │ │                │
│  │  (Must go through frontend app & auth)            │ │                │
│  │                                                    │ │                │
│  └────────────────────────────────────────────────────┘ │                │
│                                                          │                │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Artist Enrollment Flow

```
                     ARTIST'S JOURNEY
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  START: Artist signs up / drops first release                │
│  │                                                            │
│  ▼                                                            │
│  ┌─ Royalty Lock-In Banner ─────────────────────┐           │
│  │  "We lock in your royalties. Start here →"   │           │
│  └────────────────────┬────────────────────────┘            │
│                       │                                       │
│  ▼                                                            │
│  ┌─ Royalty Profile Form ──────────────────────┐            │
│  │ ✓ Legal name + DOB                          │            │
│  │ ✓ Address + phone + email                   │            │
│  │ ✓ Tax ID type + last 4 digits               │            │
│  │ ✓ Payout method (direct deposit / PayPal)   │            │
│  │ ✓ Consent: "Enable Royalty Lock-In"         │            │
│  │                                              │            │
│  │ [Save Profile]                              │            │
│  └────────────────────┬────────────────────────┘            │
│        (POST /saveRoyaltyProfile)                            │
│                       │                                       │
│  ▼                                                            │
│  ┌─ Enrollment Status Checklist ───────────────┐            │
│  │                                              │            │
│  │  FOR SONGWRITERS:                           │            │
│  │  ☐ BMI Writer Account                       │            │
│  │    └─ [Verify] → checks BMI's system        │            │
│  │    ✓ Account #BMI123456 verified            │            │
│  │                                              │            │
│  │  FOR FEATURED ARTISTS:                      │            │
│  │  ☐ SoundExchange Featured Artist Account    │            │
│  │    └─ [Verify] → checks SE's system         │            │
│  │    ✓ Account #SEART123 verified             │            │
│  │                                              │            │
│  │  FOR LABEL OWNERS:                          │            │
│  │  ☐ SoundExchange Rights Owner Account       │            │
│  │    └─ [Verify] → checks SE's system         │            │
│  │    ✓ Account #SERO999 verified              │            │
│  │                                              │            │
│  │  MISSING: Add BMI Writer account!           │            │
│  │  [Open BMI.com] [Upload Screenshot]         │            │
│  │                                              │            │
│  └────────────────────┬────────────────────────┘            │
│                       │                                       │
│  ▼                                                            │
│  Artist completes BMI/SoundExchange enrollment              │
│  uploads proof → DMF staff verifies → status = "Completed"  │
│        (POST /saveRoyaltyProfile with new status)           │
│                       │                                       │
│  ▼                                                            │
│  ┌─ Ready to Publish ──────────────────────────┐            │
│  │  ✅ All enrollments complete!               │            │
│  │  Your music is royalty-protected.           │            │
│  │                                              │            │
│  │  [Submit Release to DSPs]                   │            │
│  └────────────────────┬────────────────────────┘            │
│        (GET /canPublishRelease → canPublish: true)          │
│                       │                                       │
│  ▼                                                            │
│  ✅ COMPLETE                                                │
│  Release goes to Spotify, Apple, etc.                       │
│  Royalties auto-collected via BMI + SoundExchange           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 🚫 Release Gate Logic (canPublishRelease)

```
Release Submission Flow:
┌──────────────────────────────────────────────────────────────┐
│  Artist clicks "Publish to DSPs"                             │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend calls: canPublishRelease(releaseId)                │
│  GET /canPublishRelease?releaseId=RELEASE_123               │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  Cloud Function checks each contributor:                     │
│                                                               │
│  for (contributor of release.contributors) {                │
│    profile = get(royaltyProfiles[contributorId])            │
│                                                               │
│    if (profile.roles.includes('Songwriter')) {              │
│      if (profile.enrollmentStatuses NOT contains            │
│          {org: 'BMI', scope: 'Writer', status: 'Completed'})│
│        → blockingIssue!                                      │
│    }                                                          │
│                                                               │
│    if (profile.roles.includes('FeaturedArtist')) {          │
│      if (profile.enrollmentStatuses NOT contains            │
│          {org: 'SoundExchange', scope: 'FeaturedArtist',   │
│           status: 'Completed'})                             │
│        → blockingIssue!                                      │
│    }                                                          │
│                                                               │
│    if (profile.roles.includes('LabelOwner')) {              │
│      if (profile.enrollmentStatuses NOT contains            │
│          {org: 'SoundExchange', scope: 'RightsOwner',      │
│           status: 'Completed'})                             │
│        → blockingIssue!                                      │
│    }                                                          │
│  }                                                            │
│                                                               │
│  return {                                                    │
│    canPublish: blockingIssues.length === 0,                │
│    blockingIssues: [...]                                    │
│  }                                                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────┴───────────────┐
        │                               │
   ✅ canPublish: true            ❌ canPublish: false
        │                               │
        ▼                               ▼
    "Ready to publish!         "We need to finish your
     Sending to DSPs..."        royalty protection setup."
                                 
                                 blockingIssues:
                                 • Artist A: Missing BMI Writer
                                 • Artist B: Missing SoundExchange
                                   Rights Owner
                                 
                                 [Help Me Enroll]
```

---

## 📦 Firestore Document Structure

```
royaltyProfiles/ARTIST_123
├─ artistId: "ARTIST_123"
├─ userId: "USER_456"
├─ legalFirstName: "DeAngelo"
├─ legalLastName: "Jackson"
├─ stageNames: ["Big Homie Cash", "D-Cash"]
├─ dateOfBirth: "1990-01-01T00:00:00.000Z"
├─ country: "US"
├─ addressLine1: "556 W Town St"
├─ addressLine2: null
├─ city: "Columbus"
├─ stateOrRegion: "OH"
├─ postalCode: "43215"
├─ phoneNumber: "+1-614-000-0000"
├─ email: "artist@example.com"
├─ roles: ["Songwriter", "FeaturedArtist", "LabelOwner"]
├─ isSongwriter: true
├─ isFeaturedArtist: true
├─ isLabelOwner: true
├─ isPublisher: false
├─ taxInfo:
│  ├─ taxIdType: "SSN"
│  ├─ taxIdLast4: "1234"
│  ├─ countryOfTaxResidence: "US"
│  └─ wFormType: "W-9"
├─ payoutInfo:
│  ├─ method: "DirectDeposit"
│  ├─ currency: "USD"
│  ├─ bankName: "Chase"
│  ├─ accountLast4: "9876"
│  ├─ routingLast4: "1111"
│  └─ paypalEmail: null
├─ proMemberships:
│  ├─ bmi:
│  │  ├─ hasAccount: true
│  │  ├─ accountNumber: "BMI123456"
│  │  ├─ writerNameOnFile: "DeAngelo Jackson"
│  │  ├─ publisherAccountNumber: "BMIPUB999"
│  │  └─ lastVerifiedAt: "2025-11-17T00:00:00.000Z"
│  └─ otherPro:
│     ├─ orgName: null
│     ├─ accountNumber: null
│     └─ lastVerifiedAt: null
├─ soundExchange:
│  ├─ hasAccount: true
│  ├─ artistMemberId: "SEART123"
│  ├─ rightsOwnerAccountId: "SERO999"
│  └─ lastVerifiedAt: "2025-11-17T00:00:00.000Z"
├─ consent:
│  ├─ royaltyLockInEnabled: true
│  ├─ allowAdminEnrollment: true
│  ├─ consentTimestamp: "2025-11-17T00:00:00.000Z"
│  └─ consentMethod: "InApp"
├─ enrollmentStatuses:
│  ├─ [0]:
│  │  ├─ org: "BMI"
│  │  ├─ scope: "Writer"
│  │  ├─ status: "Completed"
│  │  ├─ externalId: "BMI123456"
│  │  ├─ lastUpdatedAt: "2025-11-17T00:00:00.000Z"
│  │  ├─ lastUpdatedBy: "admin@dmf.com"
│  │  └─ notes: "Verified via BMI portal"
│  ├─ [1]:
│  │  ├─ org: "SoundExchange"
│  │  ├─ scope: "FeaturedArtist"
│  │  ├─ status: "Completed"
│  │  ├─ externalId: "SEART123"
│  │  ├─ lastUpdatedAt: "2025-11-17T00:00:00.000Z"
│  │  ├─ lastUpdatedBy: "admin@dmf.com"
│  │  └─ notes: ""
│  └─ [2]:
│     ├─ org: "SoundExchange"
│     ├─ scope: "RightsOwner"
│     ├─ status: "Completed"
│     ├─ externalId: "SERO999"
│     ├─ lastUpdatedAt: "2025-11-17T00:00:00.000Z"
│     ├─ lastUpdatedBy: "admin@dmf.com"
│     └─ notes: ""
├─ createdAt: "2025-11-17T00:00:00.000Z"
└─ updatedAt: "2025-11-17T00:00:00.000Z"
```

---

## 🎯 Role Matrix

```
┌─────────────────────────┬──────────────┬─────────────────────────────┐
│ User Role               │ Can Read     │ Can Write                   │
├─────────────────────────┼──────────────┼─────────────────────────────┤
│ Artist (own profile)    │ Own profile  │ Own profile (limited fields)│
│                         │              │ (no consent override)       │
├─────────────────────────┼──────────────┼─────────────────────────────┤
│ Artist (other profile)  │ ❌ No        │ ❌ No                       │
├─────────────────────────┼──────────────┼─────────────────────────────┤
│ DMF Staff               │ ✅ All       │ ✅ All (with audit logging) │
├─────────────────────────┼──────────────┼─────────────────────────────┤
│ Public / Unauthenticated│ ❌ No        │ ❌ No                       │
└─────────────────────────┴──────────────┴─────────────────────────────┘
```

---

## 📊 Enrollment Status Flow

```
                    NOT YET ENROLLED
                           │
                           ▼
                    ┌─ NotStarted ─┐
                    │              │
                    │  Artist gets │
                    │  onboarded   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌─ Pending ────┐
                    │              │
                    │  Artist      │
                    │  submits to  │
                    │  BMI/SoundEx │
                    └──────┬───────┘
                           │
                           ▼
                    ┌─ InProgress ─┐
                    │              │
                    │  External    │
                    │  org reviews  │
                    │  application  │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
       ✅ Completed  ❌ Rejected   ⚪ Pending
         (Final)     (Final)      (Still reviewing)
```

---

## 🔐 Security Rules Overview

```
┌──────────────────────────────────────────────────────────┐
│        FIRESTORE SECURITY RULES (firestore.rules)        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  HELPER FUNCTIONS:                                        │
│  ├─ isDmfStaff()                                         │
│  │  → checks if request.auth.uid has isDmfStaff = true  │
│  │                                                        │
│  └─ isArtistOwner(artistId)                             │
│     → checks if request.auth.uid owns the artist doc    │
│                                                           │
│  COLLECTION: royaltyProfiles                             │
│  ├─ ALLOW read:   isDmfStaff() || isArtistOwner()       │
│  ├─ ALLOW write:  isDmfStaff() || isArtistOwner()       │
│  ├─ ALLOW create: isDmfStaff()                          │
│  └─ ALLOW delete: isDmfStaff()                          │
│                                                           │
│  COLLECTION: releases                                    │
│  ├─ ALLOW read:   authenticated                          │
│  ├─ ALLOW write:  isDmfStaff()                          │
│  ├─ ALLOW create: isDmfStaff()                          │
│  └─ ALLOW delete: isDmfStaff()                          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 📱 Frontend Implementation Example

```typescript
import { RoyaltyApiClient } from './RoyaltyApiClient';

// Initialize client
const client = new RoyaltyApiClient(
  'https://us-central1-dmf-music-platform.cloudfunctions.net'
);

// ===== GET PROFILE =====
async function loadArtistProfile(artistId: string) {
  try {
    const profile = await client.getRoyaltyProfile(artistId);
    
    console.log('Profile loaded:', profile);
    console.log('BMI enrolled:', profile.proMemberships?.bmi?.hasAccount);
    console.log('SoundExchange enrolled:', profile.soundExchange?.hasAccount);
    console.log('Lock-in enabled:', profile.consent?.royaltyLockInEnabled);
  } catch (error) {
    console.error('Failed to load profile:', error);
    // Show error UI
  }
}

// ===== SAVE PROFILE =====
async function updateArtistProfile(artistId: string) {
  try {
    const updated = await client.saveRoyaltyProfile({
      artistId,
      email: 'newemail@example.com',
      phoneNumber: '+1-614-555-1234',
      roles: ['Songwriter', 'FeaturedArtist'],
      isSongwriter: true,
      isFeaturedArtist: true,
    });
    
    console.log('Profile updated:', updated);
  } catch (error) {
    console.error('Failed to save profile:', error);
  }
}

// ===== CHECK RELEASE GATE =====
async function checkReleaseReadiness(releaseId: string) {
  try {
    const { canPublish, blockingIssues } = await client.canPublishRelease(releaseId);
    
    if (canPublish) {
      console.log('✅ Release is ready to publish!');
      // Proceed to DSP distribution
    } else {
      console.log('❌ Cannot publish. Blocking issues:');
      blockingIssues.forEach(issue => {
        console.log(`  - ${issue.artistId}: ${issue.reason}`);
      });
      // Show UI with enrollment links
    }
  } catch (error) {
    console.error('Failed to check release:', error);
  }
}

// ===== IN REACT COMPONENT =====
import React, { useState, useEffect } from 'react';

export function ArtistDashboard({ artistId }: { artistId: string }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtistProfile(artistId).then(() => setLoading(false));
  }, [artistId]);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div>
      <h1>Royalty Protection Status</h1>
      
      <h2>BMI Writer</h2>
      <p>
        {profile.proMemberships?.bmi?.hasAccount ? (
          <span>✅ Enrolled (Account: {profile.proMemberships.bmi.accountNumber})</span>
        ) : (
          <span>❌ Not enrolled <a href="#">Enroll now</a></span>
        )}
      </p>

      <h2>SoundExchange Featured Artist</h2>
      <p>
        {profile.soundExchange?.hasAccount ? (
          <span>✅ Enrolled</span>
        ) : (
          <span>❌ Not enrolled <a href="#">Enroll now</a></span>
        )}
      </p>

      <button onClick={() => updateArtistProfile(artistId)}>
        Update Profile
      </button>
    </div>
  );
}
```

---

**End of Visual Guide**

All diagrams are ASCII art and fully reproducible. Print this document for reference!
