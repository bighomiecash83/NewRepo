/**
 * MongoDB Connection Manager
 * Singleton pattern for connection pooling
 * Single source of truth for all DMF data
 *
 * Database: dmf_music_platform
 * Cluster: dmf-music-platform.pfqrhc.mongodb.net
 *
 * Usage:
 *   const db = await getDb();
 *   const profiles = await db.collection('royaltyProfiles').find(...).toArray();
 */

import { MongoClient, Db } from 'mongodb';
import * as functions from 'firebase-functions';

// Get MongoDB URI from Firebase config
// Set via: firebase functions:config:set dmf.mongodb_uri="mongodb+srv://..."
const getMongoDdUri = (): string => {
  const uri = functions.config().dmf?.mongodb_uri;
  if (!uri) {
    throw new Error(
      'Missing Firebase functions config: dmf.mongodb_uri\n' +
      'Set it via:\n' +
      'firebase functions:config:set dmf.mongodb_uri="mongodb+srv://bighomiecash8346:YOUR_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform"'
    );
  }
  return uri;
};

// Singleton MongoDB client instance
let mongoClient: MongoClient | null = null;

/**
 * Get MongoDB database instance
 * Maintains connection pool across all function invocations
 *
 * @returns MongoDB Db instance for dmf_music_platform database
 * @throws Error if MongoDB URI is not configured
 */
export async function getDb(): Promise<Db> {
  // Reuse existing connection if available
  if (mongoClient) {
    return mongoClient.db('dmf_music_platform');
  }

  // Create new connection
  const uri = getMongoDdUri();
  mongoClient = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
  });

  try {
    await mongoClient.connect();
    console.log('[MongoDB] Connected to dmf_music_platform cluster');
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err);
    mongoClient = null;
    throw err;
  }

  return mongoClient.db('dmf_music_platform');
}

/**
 * Gracefully close MongoDB connection
 * Call this during Firebase function cleanup if needed
 */
export async function closeDb(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    console.log('[MongoDB] Connection closed');
  }
}

/**
 * Health check for MongoDB connectivity
 * Used by /health endpoints
 */
export async function mongoHealthCheck(): Promise<{
  status: 'ok' | 'error';
  message: string;
  timestamp: string;
}> {
  try {
    const db = await getDb();
    await db.admin().ping();
    return {
      status: 'ok',
      message: 'MongoDB connected',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: 'error',
      message: `MongoDB error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    };
  }
}
