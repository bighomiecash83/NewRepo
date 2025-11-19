# Firebase Royalty Lock-In Setup Guide

## Overview

This document covers setting up the **Royalty Lock-In** system using:
- **Firestore** for data storage (royalty profiles, releases)
- **Cloud Functions** for backend logic (HTTPS endpoints)
- **Cloud Security Rules** for role-based access control

---

## 1️⃣ Prerequisites

- Firebase project created (https://console.firebase.google.com/)
- Firebase CLI installed: `npm install -g firebase-tools`
- Node.js 20+ installed
- Google Cloud Project with billing enabled

---

## 2️⃣ Initial Setup

### Clone & Install Dependencies

```bash
cd dmf-music-platform
npm install -g firebase-tools
cd functions
npm install
cd ..
```

### Create `.firebaserc` (Firebase project config)

```json
{
  "projects": {
    "default": "YOUR_FIREBASE_PROJECT_ID"
  }
}
```

Replace `YOUR_FIREBASE_PROJECT_ID` with your actual Firebase project ID.

### Set Environment (Development vs Production)

```bash
# Set to your Firebase project
firebase use default

# Or set to specific project
firebase use --add YOUR_PROJECT_ID
```

---

## 3️⃣ Deploy Firestore Rules & Indexes

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

Once indexes are deployed, Firestore will take 5-10 minutes to build them.

---

## 4️⃣ Build & Deploy Cloud Functions

### Build TypeScript

```bash
cd functions
npm run build
cd ..
```

### Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:getRoyaltyProfile
```

**Deployment Output Example:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/YOUR_PROJECT/overview

Function URL (example):
- getRoyaltyProfile: https://us-central1-YOUR_PROJECT.cloudfunctions.net/getRoyaltyProfile
- saveRoyaltyProfile: https://us-central1-YOUR_PROJECT.cloudfunctions.net/saveRoyaltyProfile
- canPublishRelease: https://us-central1-YOUR_PROJECT.cloudfunctions.net/canPublishRelease
```

---

## 5️⃣ Testing Functions Locally

### Start the Emulator

```bash
firebase emulators:start --only firestore,functions
```

Firestore Emulator UI: http://localhost:4000
Functions run on: http://localhost:5001

### Test a Function Locally

```bash
# Terminal 1: Run emulator
firebase emulators:start --only firestore,functions

# Terminal 2: Test an endpoint
curl "http://localhost:5001/YOUR_PROJECT/us-central1/getRoyaltyProfile?artistId=ARTIST_123"
```

---

## 6️⃣ Firestore Collection Initialization

Create initial documents in Firestore:

### Create an Artist Document

**Path:** `artists/ARTIST_123`

```json
{
  "artistId": "ARTIST_123",
  "stageName": "Big Homie Cash",
  "userId": "USER_456",
  "createdAt": "2025-11-17T00:00:00.000Z"
}
```

### Create a Royalty Profile Document

**Path:** `royaltyProfiles/ARTIST_123`

```json
{
  "artistId": "ARTIST_123",
  "userId": "USER_456",
  "legalFirstName": "DeAngelo",
  "legalLastName": "Jackson",
  "stageNames": ["Big Homie Cash"],
  "dateOfBirth": "1990-01-01T00:00:00.000Z",
  "country": "US",
  "addressLine1": "556 W Town St",
  "city": "Columbus",
  "stateOrRegion": "OH",
  "postalCode": "43215",
  "phoneNumber": "+1-614-000-0000",
  "email": "artist@example.com",
  "roles": ["Songwriter", "FeaturedArtist", "LabelOwner"],
  "isSongwriter": true,
  "isFeaturedArtist": true,
  "isLabelOwner": true,
  "isPublisher": false,
  "taxInfo": {
    "taxIdType": "SSN",
    "taxIdLast4": "1234",
    "countryOfTaxResidence": "US"
  },
  "payoutInfo": {
    "method": "DirectDeposit",
    "currency": "USD",
    "bankName": "Chase",
    "accountLast4": "9876"
  },
  "proMemberships": {
    "bmi": {
      "hasAccount": true,
      "accountNumber": "BMI123456",
      "writerNameOnFile": "DeAngelo Jackson",
      "lastVerifiedAt": "2025-11-17T00:00:00.000Z"
    }
  },
  "soundExchange": {
    "hasAccount": true,
    "artistMemberId": "SEART123",
    "rightsOwnerAccountId": "SERO999",
    "lastVerifiedAt": "2025-11-17T00:00:00.000Z"
  },
  "consent": {
    "royaltyLockInEnabled": true,
    "allowAdminEnrollment": true,
    "consentTimestamp": "2025-11-17T00:00:00.000Z",
    "consentMethod": "InApp"
  },
  "enrollmentStatuses": [
    {
      "org": "BMI",
      "scope": "Writer",
      "status": "Completed",
      "externalId": "BMI123456",
      "lastUpdatedAt": "2025-11-17T00:00:00.000Z",
      "notes": "Verified via BMI portal"
    },
    {
      "org": "SoundExchange",
      "scope": "FeaturedArtist",
      "status": "Completed",
      "externalId": "SEART123",
      "lastUpdatedAt": "2025-11-17T00:00:00.000Z"
    },
    {
      "org": "SoundExchange",
      "scope": "RightsOwner",
      "status": "Completed",
      "externalId": "SERO999",
      "lastUpdatedAt": "2025-11-17T00:00:00.000Z"
    }
  ],
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

### Create a Release Document

**Path:** `releases/RELEASE_123`

```json
{
  "releaseId": "RELEASE_123",
  "title": "New Album 2025",
  "contributors": [
    {
      "artistId": "ARTIST_123",
      "roles": ["Songwriter", "FeaturedArtist"]
    }
  ],
  "status": "Draft",
  "releaseDate": "2025-12-01T00:00:00.000Z",
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

---

## 7️⃣ Testing the APIs

### Test GET Royalty Profile

```bash
curl "https://us-central1-YOUR_PROJECT.cloudfunctions.net/getRoyaltyProfile?artistId=ARTIST_123"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "artistId": "ARTIST_123",
    "legalFirstName": "DeAngelo",
    ...
  }
}
```

### Test POST Save Profile

```bash
curl -X POST "https://us-central1-YOUR_PROJECT.cloudfunctions.net/saveRoyaltyProfile" \
  -H "Content-Type: application/json" \
  -d '{
    "artistId": "ARTIST_123",
    "legalFirstName": "DeAngelo",
    "legalLastName": "Jackson",
    "email": "newemail@example.com"
  }'
```

### Test Release Gate Check

```bash
curl "https://us-central1-YOUR_PROJECT.cloudfunctions.net/canPublishRelease?releaseId=RELEASE_123"
```

**Expected Response (Success):**
```json
{
  "canPublish": true,
  "blockingIssues": []
}
```

**Expected Response (Blocked):**
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

## 8️⃣ Frontend Integration

In your **Google AI Studio** or **Lovable** frontend:

```typescript
import { RoyaltyApiClient } from './RoyaltyApiClient';

const royaltyClient = new RoyaltyApiClient(
  'https://us-central1-YOUR_PROJECT.cloudfunctions.net'
);

// Fetch an artist's royalty profile
const profile = await royaltyClient.getRoyaltyProfile('ARTIST_123');

// Check if a release can go live
const { canPublish, blockingIssues } = await royaltyClient.canPublishRelease('RELEASE_123');

if (!canPublish) {
  console.log('Cannot publish. Issues:', blockingIssues);
  // Show UI message to artist
}
```

---

## 9️⃣ Monitoring & Logging

### View Function Logs

```bash
firebase functions:log
```

### View Logs in Cloud Console

https://console.firebase.google.com/project/YOUR_PROJECT/functions/logs

---

## 🔟 Production Checklist

- [ ] Firebase project created with billing enabled
- [ ] `.firebaserc` configured with project ID
- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed
- [ ] Cloud Functions built and deployed
- [ ] Test documents created in Firestore (artist, profile, release)
- [ ] All API endpoints tested and working
- [ ] Frontend integrated with RoyaltyApiClient
- [ ] Error handling in place (network, timeouts, auth)
- [ ] Monitoring/logging set up
- [ ] Security rules reviewed (check RBAC requirements)
- [ ] Backup strategy defined (Firestore has auto-backups)

---

## Troubleshooting

### Functions not deploying?

```bash
# Check TypeScript compilation
cd functions
npm run build
cd ..

# Check Firebase login
firebase login
firebase projects:list
```

### Firestore rules not updating?

```bash
# Validate syntax
firebase deploy --only firestore:rules --dry-run

# Deploy
firebase deploy --only firestore:rules
```

### "Permission denied" errors?

Check Firestore security rules. Make sure:
1. User is authenticated (`request.auth.uid != null`)
2. User has correct role (DMF staff or owner)
3. Accessing correct collection path

---

## Next Steps

1. **API Documentation**: Create OpenAPI/Swagger docs for frontend teams
2. **Admin Dashboard**: Build DMF staff portal for managing profiles
3. **Email Notifications**: Add Cloud Functions email triggers when enrollment status changes
4. **Audit Logging**: Add detailed audit logs to separate collection
5. **Encryption**: Implement vault/tokenization for sensitive fields (tax ID, bank info)
