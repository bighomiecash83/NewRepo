/**
 * DMF Music Platform - Firebase Cloud Functions Entry Point
 * Database: MongoDB Atlas (dmf_music_platform.pfqrhc.mongodb.net)
 *
 * Exported Functions:
 * - royalty/royaltyApi: getRoyaltyProfile, saveRoyaltyProfile, deleteRoyaltyProfile
 * - royalty/royaltyLogic: canPublishRelease, getReleaseStatus
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export all Cloud Functions
export * from './royalty/royaltyApi';
export * from './royalty/royaltyLogic';

console.log('[DMF] Cloud Functions initialized');
console.log('[DMF] Endpoints:');
console.log('  - getRoyaltyProfile (GET)');
console.log('  - saveRoyaltyProfile (POST)');
console.log('  - deleteRoyaltyProfile (DELETE)');
console.log('  - canPublishRelease (GET)');
console.log('  - getReleaseStatus (GET)');
