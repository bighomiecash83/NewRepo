/**
 * royaltyLogic.ts
 * Core business logic: can a release go live?
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  EnrollmentOrg,
  EnrollmentScope,
  RoyaltyProfile,
  CanPublishResponse,
} from '../types/RoyaltyTypes';

const db = admin.firestore();

/**
 * Helper: Does a royalty profile have a specific enrollment completed?
 */
function hasCompletedStatus(
  profile: RoyaltyProfile | undefined,
  org: EnrollmentOrg,
  scope: EnrollmentScope
): boolean {
  if (!profile) return false;

  return (profile.enrollmentStatuses || []).some(
    (s) => s.org === org && s.scope === scope && s.status === 'Completed'
  );
}

/**
 * GET /canPublishRelease?releaseId=RELEASE_123
 *
 * Check if a release can be published to DSPs
 * Returns: { canPublish: boolean, blockingIssues: [...] }
 *
 * Rules:
 * - If contributor is Songwriter → needs BMI Writer completed
 * - If contributor is FeaturedArtist → needs SoundExchange FeaturedArtist completed
 * - If contributor is LabelOwner → needs SoundExchange RightsOwner completed
 */
export const canPublishRelease = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const releaseId = req.query.releaseId as string;

    if (!releaseId) {
      res.status(400).json({
        canPublish: false,
        blockingIssues: [{ artistId: '', reason: 'Missing releaseId parameter' }],
      } as CanPublishResponse);
      return;
    }

    // Fetch the release document
    const releaseSnap = await db.collection('releases').doc(releaseId).get();

    if (!releaseSnap.exists) {
      res.status(404).json({
        canPublish: false,
        blockingIssues: [{ artistId: '', reason: `Release ${releaseId} not found` }],
      } as CanPublishResponse);
      return;
    }

    const release = releaseSnap.data() as any;
    const contributors = release.contributors || [];

    const blockingIssues: Array<{ artistId: string; reason: string }> = [];

    // Check each contributor
    for (const contributor of contributors) {
      const artistId = contributor.artistId as string;
      const roles = contributor.roles || [];

      if (!artistId) continue;

      // Fetch royalty profile
      const profileSnap = await db.collection('royaltyProfiles').doc(artistId).get();
      const profile = profileSnap.data() as RoyaltyProfile | undefined;

      // If no profile or royalty lock-in disabled, skip checks
      if (!profile || !profile.consent?.royaltyLockInEnabled) {
        continue;
      }

      // --- Check each role ---

      if (roles.includes('Songwriter') || roles.includes('Composer')) {
        if (!hasCompletedStatus(profile, 'BMI', 'Writer')) {
          blockingIssues.push({
            artistId,
            reason: 'Missing BMI Writer enrollment - Royalty Lock-In requires this for songwriters',
          });
        }
      }

      if (roles.includes('FeaturedArtist')) {
        if (!hasCompletedStatus(profile, 'SoundExchange', 'FeaturedArtist')) {
          blockingIssues.push({
            artistId,
            reason: 'Missing SoundExchange Featured Artist enrollment - Royalty Lock-In requires this',
          });
        }
      }

      if (roles.includes('LabelOwner')) {
        if (!hasCompletedStatus(profile, 'SoundExchange', 'RightsOwner')) {
          blockingIssues.push({
            artistId,
            reason: 'Missing SoundExchange Rights Owner enrollment - Royalty Lock-In requires this for label owners',
          });
        }
      }

      if (roles.includes('Producer')) {
        // Note: Producers typically don't need BMI/SoundExchange directly,
        // but if they do, add checks here
      }
    }

    // Return response
    res.status(200).json({
      canPublish: blockingIssues.length === 0,
      blockingIssues,
    } as CanPublishResponse);
  } catch (err) {
    console.error('canPublishRelease error', err);
    res.status(500).json({
      canPublish: false,
      blockingIssues: [
        {
          artistId: '',
          reason: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error'),
        },
      ],
    } as CanPublishResponse);
  }
});

/**
 * GET /getReleaseStatus?releaseId=RELEASE_123
 * Get full release details including publication status
 */
export const getReleaseStatus = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const releaseId = req.query.releaseId as string;

    if (!releaseId) {
      res.status(400).json({ error: 'Missing releaseId' });
      return;
    }

    const releaseSnap = await db.collection('releases').doc(releaseId).get();

    if (!releaseSnap.exists) {
      res.status(404).json({ error: 'Release not found' });
      return;
    }

    const release = releaseSnap.data();
    const canPublish = await (
      await db
        .collection('releases')
        .doc(releaseId)
        .collection('__meta__')
        .doc('canPublish')
        .get()
    ).data();

    res.json({
      release,
      canPublish: canPublish?.result ?? false,
      blockingIssues: canPublish?.blockingIssues ?? [],
    });
  } catch (err) {
    console.error('getReleaseStatus error', err);
    res.status(500).json({ error: 'Server error' });
  }
});
