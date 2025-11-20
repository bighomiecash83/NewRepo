/**
 * Royalty Profile CRUD API
 * Database: MongoDB (dmf_music_platform.royaltyProfiles)
 *
 * Endpoints:
 * - GET  /getRoyaltyProfile?artistId=... → Fetch profile
 * - POST /saveRoyaltyProfile → Create/update profile
 * - DELETE /deleteRoyaltyProfile?artistId=... → Remove profile
 */

import * as functions from 'firebase-functions';
import * as cors from 'cors';
import { getDb } from '../db/mongoClient';
import { RoyaltyProfile } from '../types/RoyaltyTypes';

const corsHandler = cors({ origin: true });
const COLLECTION = 'royaltyProfiles';

/**
 * GET /getRoyaltyProfile?artistId=...
 * Retrieve a single royalty profile by artist ID
 */
export const getRoyaltyProfile = functions.https.onRequest((req, res) =>
  corsHandler(req, res, async () => {
    try {
      const artistId = req.query.artistId as string;

      if (!artistId) {
        res.status(400).json({
          success: false,
          message: 'artistId is required',
        });
        return;
      }

      const db = await getDb();
      const profile = await db.collection<RoyaltyProfile>(COLLECTION).findOne({
        artistId,
      });

      if (!profile) {
        res.status(404).json({
          success: false,
          message: `Profile not found for artistId: ${artistId}`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (err) {
      console.error('[getRoyaltyProfile] Error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  })
);

/**
 * POST /saveRoyaltyProfile
 * Create or update a royalty profile
 *
 * Body: Partial<RoyaltyProfile> with artistId required
 */
export const saveRoyaltyProfile = functions.https.onRequest((req, res) =>
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({
          success: false,
          message: 'Method not allowed',
        });
        return;
      }

      const profile = req.body as Partial<RoyaltyProfile>;

      if (!profile.artistId) {
        res.status(400).json({
          success: false,
          message: 'artistId is required in body',
        });
        return;
      }

      const now = new Date().toISOString();
      const db = await getDb();

      // Prepare update document
      const updateDoc: Partial<RoyaltyProfile> = {
        ...profile,
        updatedAt: now,
        createdAt: profile.createdAt ?? now,
        artistId: profile.artistId,
      };

      // Upsert: update if exists, create if not
      const result = await db.collection<Partial<RoyaltyProfile>>(COLLECTION).updateOne(
        { artistId: profile.artistId },
        { $set: updateDoc },
        { upsert: true }
      );

      // Fetch the saved document
      const saved = await db.collection<RoyaltyProfile>(COLLECTION).findOne({
        artistId: profile.artistId,
      });

      res.status(200).json({
        success: true,
        data: saved,
        modified: result.modifiedCount > 0,
        upserted: result.upsertedId !== null,
      });
    } catch (err) {
      console.error('[saveRoyaltyProfile] Error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  })
);

/**
 * DELETE /deleteRoyaltyProfile?artistId=...
 * Remove a royalty profile
 */
export const deleteRoyaltyProfile = functions.https.onRequest((req, res) =>
  corsHandler(req, res, async () => {
    try {
      const artistId = req.query.artistId as string;

      if (!artistId) {
        res.status(400).json({
          success: false,
          message: 'artistId is required',
        });
        return;
      }

      const db = await getDb();
      const result = await db.collection<RoyaltyProfile>(COLLECTION).deleteOne({
        artistId,
      });

      res.status(200).json({
        success: true,
        deletedCount: result.deletedCount,
        message:
          result.deletedCount > 0
            ? `Profile deleted for artistId: ${artistId}`
            : `No profile found for artistId: ${artistId}`,
      });
    } catch (err) {
      console.error('[deleteRoyaltyProfile] Error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  })
);
