/**
 * royaltyApi.ts
 * HTTPS Cloud Functions for Royalty Profile CRUD operations
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { RoyaltyProfile, RoyaltyProfileResponse } from '../types/RoyaltyTypes';

const db = admin.firestore();
const ROYALTY_COLLECTION = 'royaltyProfiles';

/**
 * GET /getRoyaltyProfile?artistId=ARTIST_123
 * Retrieve a royalty profile for a specific artist
 */
export const getRoyaltyProfile = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const artistId = req.query.artistId as string;

    if (!artistId) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: artistId',
      } as RoyaltyProfileResponse);
      return;
    }

    const docRef = db.collection(ROYALTY_COLLECTION).doc(artistId);
    const snap = await docRef.get();

    if (!snap.exists) {
      res.status(404).json({
        success: false,
        error: `No royalty profile found for artistId: ${artistId}`,
      } as RoyaltyProfileResponse);
      return;
    }

    const data = snap.data() as RoyaltyProfile;

    res.status(200).json({
      success: true,
      data,
    } as RoyaltyProfileResponse);
  } catch (err) {
    console.error('getRoyaltyProfile error', err);
    res.status(500).json({
      success: false,
      error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error'),
    } as RoyaltyProfileResponse);
  }
});

/**
 * POST /saveRoyaltyProfile
 * Create or update a royalty profile
 * Body: Partial<RoyaltyProfile>
 */
export const saveRoyaltyProfile = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        error: 'Method not allowed. Use POST.',
      } as RoyaltyProfileResponse);
      return;
    }

    const profile = req.body as Partial<RoyaltyProfile>;

    if (!profile.artistId) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: artistId',
      } as RoyaltyProfileResponse);
      return;
    }

    const now = new Date().toISOString();
    const docRef = db.collection(ROYALTY_COLLECTION).doc(profile.artistId);

    // Check if existing
    const existingSnap = await docRef.get();
    const existing = existingSnap.data() as RoyaltyProfile | undefined;

    // Merge old + new, preserving audit fields
    const data: RoyaltyProfile = {
      artistId: profile.artistId,
      userId: profile.userId ?? existing?.userId,
      legalFirstName: profile.legalFirstName ?? existing?.legalFirstName ?? '',
      legalLastName: profile.legalLastName ?? existing?.legalLastName ?? '',
      stageNames: profile.stageNames ?? existing?.stageNames ?? [],
      dateOfBirth: profile.dateOfBirth ?? existing?.dateOfBirth ?? '',
      country: profile.country ?? existing?.country ?? '',
      addressLine1: profile.addressLine1 ?? existing?.addressLine1 ?? '',
      addressLine2: profile.addressLine2 ?? existing?.addressLine2,
      city: profile.city ?? existing?.city ?? '',
      stateOrRegion: profile.stateOrRegion ?? existing?.stateOrRegion,
      postalCode: profile.postalCode ?? existing?.postalCode ?? '',
      phoneNumber: profile.phoneNumber ?? existing?.phoneNumber ?? '',
      email: profile.email ?? existing?.email ?? '',
      roles: profile.roles ?? existing?.roles ?? [],
      isSongwriter: profile.isSongwriter ?? existing?.isSongwriter ?? false,
      isFeaturedArtist: profile.isFeaturedArtist ?? existing?.isFeaturedArtist ?? false,
      isLabelOwner: profile.isLabelOwner ?? existing?.isLabelOwner ?? false,
      isPublisher: profile.isPublisher ?? existing?.isPublisher ?? false,
      taxInfo: {
        ...existing?.taxInfo,
        ...profile.taxInfo,
      },
      payoutInfo: {
        ...existing?.payoutInfo,
        ...profile.payoutInfo,
      },
      proMemberships: {
        ...existing?.proMemberships,
        ...profile.proMemberships,
      },
      soundExchange: {
        ...existing?.soundExchange,
        ...profile.soundExchange,
      },
      consent: {
        royaltyLockInEnabled:
          profile.consent?.royaltyLockInEnabled ?? existing?.consent?.royaltyLockInEnabled ?? true,
        allowAdminEnrollment:
          profile.consent?.allowAdminEnrollment ?? existing?.consent?.allowAdminEnrollment ?? false,
        consentTimestamp: existing?.consent?.consentTimestamp ?? now,
        consentMethod: profile.consent?.consentMethod ?? existing?.consent?.consentMethod ?? 'InApp',
      },
      enrollmentStatuses: profile.enrollmentStatuses ?? existing?.enrollmentStatuses ?? [],
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await docRef.set(data, { merge: false });

    res.status(200).json({
      success: true,
      data,
    } as RoyaltyProfileResponse);
  } catch (err) {
    console.error('saveRoyaltyProfile error', err);
    res.status(500).json({
      success: false,
      error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error'),
    } as RoyaltyProfileResponse);
  }
});

/**
 * POST /deleteRoyaltyProfile?artistId=ARTIST_123
 * Delete a royalty profile (DMF staff only)
 */
export const deleteRoyaltyProfile = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const artistId = req.query.artistId as string;

    if (!artistId) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: artistId',
      } as RoyaltyProfileResponse);
      return;
    }

    const docRef = db.collection(ROYALTY_COLLECTION).doc(artistId);
    await docRef.delete();

    res.status(200).json({
      success: true,
      error: `Deleted royalty profile for artistId: ${artistId}`,
    } as RoyaltyProfileResponse);
  } catch (err) {
    console.error('deleteRoyaltyProfile error', err);
    res.status(500).json({
      success: false,
      error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error'),
    } as RoyaltyProfileResponse);
  }
});
