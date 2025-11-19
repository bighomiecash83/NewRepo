/**
 * Release Gate Logic
 * Database: MongoDB (dmf_music_platform)
 *
 * Business logic for determining if a release can be published to DSPs
 * Based on artist enrollment status with royalty organizations
 *
 * Endpoints:
 * - GET /canPublishRelease?releaseId=... → Check if release can publish
 * - GET /getReleaseStatus?releaseId=... → Get release metadata
 */

import * as functions from 'firebase-functions';
import * as cors from 'cors';
import { getDb } from '../db/mongoClient';
import { RoyaltyProfile, Release, EnrollmentStatus } from '../types/RoyaltyTypes';

const corsHandler = cors({ origin: true });

/**
 * Business Rules for Release Publishing
 *
 * Songwriter Role:
 *   - Required enrollment: BMI / ASCAP / SESAC (Writer)
 *   - Status must be: Completed
 *
 * FeaturedArtist Role:
 *   - Required enrollment: SoundExchange (FeaturedArtist)
 *   - Status must be: Completed
 *
 * LabelOwner / Distributor Role:
 *   - Required enrollment: SoundExchange (RightsOwner)
 *   - Status must be: Completed
 */

interface ReleaseGateCheckResult {
  canPublish: boolean;
  blockedArtists: Array<{
    artistId: string;
    role: string;
    blockingIssues: string[];
  }>;
  timestamp: string;
}

/**
 * Check if all required enrollments are completed for an artist
 */
async function validateArtistEnrollment(
  artistId: string,
  role: string,
  db: any
): Promise<string[]> {
  const issues: string[] = [];

  const profile = await db.collection<RoyaltyProfile>('royaltyProfiles').findOne({
    artistId,
  });

  if (!profile) {
    issues.push(`No royalty profile found for artist ${artistId}`);
    return issues;
  }

  // Check if royalty lock-in is enabled
  if (!profile.consent?.royaltyLockInEnabled) {
    issues.push('Royalty lock-in not enabled by artist');
  }

  if (!profile.enrollmentStatuses || profile.enrollmentStatuses.length === 0) {
    issues.push('No enrollment statuses found');
    return issues;
  }

  // Define required enrollments per role
  const requiredEnrollments: Record<string, Array<{ org: string; scope: string }>> = {
    Songwriter: [
      { org: 'BMI', scope: 'Writer' },
      { org: 'ASCAP', scope: 'Writer' },
      { org: 'SESAC', scope: 'Writer' },
    ],
    FeaturedArtist: [{ org: 'SoundExchange', scope: 'FeaturedArtist' }],
    LabelOwner: [{ org: 'SoundExchange', scope: 'RightsOwner' }],
    Distributor: [{ org: 'SoundExchange', scope: 'RightsOwner' }],
  };

  const required = requiredEnrollments[role] || [];

  for (const req of required) {
    const enrollment = profile.enrollmentStatuses.find(
      e => e.org === req.org && e.scope === req.scope
    );

    if (!enrollment) {
      issues.push(`Missing enrollment: ${req.org} ${req.scope}`);
      continue;
    }

    if (enrollment.status !== 'Completed') {
      issues.push(`${req.org} ${req.scope} enrollment not completed (status: ${enrollment.status})`);
    }
  }

  return issues;
}

/**
 * GET /canPublishRelease?releaseId=...
 * Check if a release can be published to DSPs
 *
 * Query Parameters:
 *   - releaseId: Release ID to check
 */
export const canPublishRelease = functions.https.onRequest((req, res) =>
  corsHandler(req, res, async () => {
    try {
      const releaseId = req.query.releaseId as string;

      if (!releaseId) {
        res.status(400).json({
          success: false,
          message: 'releaseId is required',
        });
        return;
      }

      const db = await getDb();

      // Fetch release metadata
      const release = await db.collection<Release>('releases').findOne({
        releaseId,
      });

      if (!release) {
        res.status(404).json({
          success: false,
          message: `Release not found: ${releaseId}`,
        });
        return;
      }

      // Check each contributor's enrollment
      const blockedArtists: ReleaseGateCheckResult['blockedArtists'] = [];

      if (release.contributors && release.contributors.length > 0) {
        for (const contributor of release.contributors) {
          const issues = await validateArtistEnrollment(
            contributor.artistId,
            contributor.role,
            db
          );

          if (issues.length > 0) {
            blockedArtists.push({
              artistId: contributor.artistId,
              role: contributor.role,
              blockingIssues: issues,
            });
          }
        }
      }

      const canPublish = blockedArtists.length === 0;

      res.status(200).json({
        success: true,
        canPublish,
        blockedArtists,
        timestamp: new Date().toISOString(),
      } as ReleaseGateCheckResult);
    } catch (err) {
      console.error('[canPublishRelease] Error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  })
);

/**
 * GET /getReleaseStatus?releaseId=...
 * Get release metadata and publishing status
 *
 * Query Parameters:
 *   - releaseId: Release ID
 */
export const getReleaseStatus = functions.https.onRequest((req, res) =>
  corsHandler(req, res, async () => {
    try {
      const releaseId = req.query.releaseId as string;

      if (!releaseId) {
        res.status(400).json({
          success: false,
          message: 'releaseId is required',
        });
        return;
      }

      const db = await getDb();

      // Fetch release
      const release = await db.collection<Release>('releases').findOne({
        releaseId,
      });

      if (!release) {
        res.status(404).json({
          success: false,
          message: `Release not found: ${releaseId}`,
        });
        return;
      }

      // Check publishing eligibility
      const blockedArtists: ReleaseGateCheckResult['blockedArtists'] = [];

      if (release.contributors && release.contributors.length > 0) {
        for (const contributor of release.contributors) {
          const issues = await validateArtistEnrollment(
            contributor.artistId,
            contributor.role,
            db
          );

          if (issues.length > 0) {
            blockedArtists.push({
              artistId: contributor.artistId,
              role: contributor.role,
              blockingIssues: issues,
            });
          }
        }
      }

      const canPublish = blockedArtists.length === 0;

      res.status(200).json({
        success: true,
        release: {
          releaseId: release.releaseId,
          title: release.title,
          artists: release.artists,
          contributors: release.contributors,
          status: release.status,
          createdAt: release.createdAt,
          updatedAt: release.updatedAt,
        },
        publishing: {
          canPublish,
          blockedArtists,
          status: canPublish ? 'Ready for distribution' : 'Blocked by enrollments',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[getReleaseStatus] Error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  })
);
