/**
 * index.ts
 * Main entry point for DMF Royalty Cloud Functions
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export all Cloud Functions
export { getRoyaltyProfile, saveRoyaltyProfile, deleteRoyaltyProfile } from './royalty/royaltyApi';
export { canPublishRelease, getReleaseStatus } from './royalty/royaltyLogic';
