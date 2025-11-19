#!/usr/bin/env node

/**
 * DMF Roster Advanced Seed Script
 * Reads dmf_roster.json and seeds MongoDB with roster data
 * Supports dev/stage/prod environments with environment-specific URIs
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const NODE_ENV = process.env.NODE_ENV || 'dev';
const DRY_RUN = process.env.DRY_RUN === '1' || false;
const ROSTER_FILE = process.env.ROSTER_FILE || path.join(process.cwd(), 'dmf_roster.json');

// Resolve MongoDB URI
let MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  const envKey = `MONGO_URI_${NODE_ENV.toUpperCase()}`;
  MONGO_URI = process.env[envKey];
}

if (!MONGO_URI) {
  console.error(`[ERROR] No MongoDB URI found. Set MONGO_URI or MONGO_URI_${NODE_ENV.toUpperCase()}`);
  process.exit(1);
}

const DB_NAME = 'dmf_music_platform';

// ============================================================================
// Logging Utilities
// ============================================================================

function log(level, message) {
  const timestamp = new Date().toISOString();
  const prefix = `[DMF][${timestamp}]`;
  console.log(`${prefix} [${level}] ${message}`);
}

function logError(message) {
  log('ERROR', message);
}

function logWarn(message) {
  log('WARN', message);
}

function logInfo(message) {
  log('INFO', message);
}

function logSuccess(message) {
  log('SUCCESS', message);
}

// ============================================================================
// MongoDB Schema Definitions
// ============================================================================

const ArtistSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  real_name: String,
  role: [String],
  label: String,
  imprint: String,
  status: { type: String, default: 'active' },
  verified: { type: Boolean, default: false },
  bio: String,
  profile_image: String,
  social_links: mongoose.Schema.Types.Mixed,
  catalog_status: String,
  releases: [String],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const DivisionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: String,
  category: String,
  status: { type: String, default: 'active' },
  description: String,
  services: [String],
  api_endpoints: [String],
  integrated: { type: Boolean, default: true },
  visible_in_app: { type: Boolean, default: true },
  staff_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const EngineSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: String,
  category: String,
  status: { type: String, default: 'active' },
  description: String,
  services: [String],
  api_endpoints: [String],
  integrated: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// ============================================================================
// Core Seeding Logic
// ============================================================================

async function seedRoster() {
  let conn;

  try {
    // Step 1: Load roster file
    logInfo(`Loading roster from ${ROSTER_FILE}`);
    if (!fs.existsSync(ROSTER_FILE)) {
      logError(`Roster file not found: ${ROSTER_FILE}`);
      process.exit(1);
    }

    const rosterContent = fs.readFileSync(ROSTER_FILE, 'utf8');
    const roster = JSON.parse(rosterContent);
    logSuccess(`Roster loaded successfully`);

    // Step 2: Connect to MongoDB
    logInfo(`Connecting to MongoDB (${NODE_ENV})...`);
    if (DRY_RUN) {
      logWarn(`DRY_RUN mode enabled. Connection check only.`);
    }

    conn = await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
      retryWrites: true,
      w: 'majority'
    });

    logSuccess(`Connected to MongoDB: ${DB_NAME}`);

    // Step 3: Ping check
    logInfo('Performing health check...');
    await conn.connection.collection('admin').admin().ping();
    logSuccess('MongoDB health check passed');

    if (DRY_RUN) {
      logWarn('Dry run complete. No data written.');
      await conn.disconnect();
      process.exit(0);
    }

    // Step 4: Seed artists
    if (roster.primary_artists && roster.primary_artists.length > 0) {
      logInfo(`Seeding ${roster.primary_artists.length} artists...`);
      const artistModel = mongoose.model('Artist', ArtistSchema, 'artists');
      
      for (const artist of roster.primary_artists) {
        await artistModel.updateOne(
          { id: artist.id },
          artist,
          { upsert: true }
        );
      }
      logSuccess(`Seeded ${roster.primary_artists.length} artists`);
    }

    // Step 5: Seed divisions
    if (roster.internal_divisions && roster.internal_divisions.length > 0) {
      logInfo(`Seeding ${roster.internal_divisions.length} divisions...`);
      const divisionModel = mongoose.model('Division', DivisionSchema, 'divisions');
      
      for (const division of roster.internal_divisions) {
        await divisionModel.updateOne(
          { id: division.id },
          division,
          { upsert: true }
        );
      }
      logSuccess(`Seeded ${roster.internal_divisions.length} divisions`);
    }

    // Step 6: Seed engines (from internal_divisions that are tech/engines)
    if (roster.internal_divisions) {
      const engines = roster.internal_divisions.filter(d => 
        d.type === 'technology' || d.name.includes('Engine') || d.category === 'Generative AI'
      );
      
      if (engines.length > 0) {
        logInfo(`Seeding ${engines.length} engines...`);
        const engineModel = mongoose.model('Engine', EngineSchema, 'engines');
        
        for (const engine of engines) {
          await engineModel.updateOne(
            { id: engine.id },
            engine,
            { upsert: true }
          );
        }
        logSuccess(`Seeded ${engines.length} engines`);
      }
    }

    // Step 7: Summary
    logSuccess('================================');
    logSuccess('DMF ROSTER SEED COMPLETE');
    logSuccess('================================');
    logInfo(`Environment: ${NODE_ENV}`);
    logInfo(`Database: ${DB_NAME}`);
    logInfo(`Timestamp: ${new Date().toISOString()}`);
    logSuccess('All roster data synchronized');

    await conn.disconnect();
    process.exit(0);

  } catch (error) {
    logError(`Seeding failed: ${error.message}`);
    if (conn) {
      await conn.disconnect();
    }
    process.exit(1);
  }
}

// ============================================================================
// Execute Seeding
// ============================================================================

logInfo(`[DMF-MUSIC-PLATFORM] Roster Seeding Started`);
logInfo(`Environment: ${NODE_ENV}`);
logInfo(`Dry Run: ${DRY_RUN ? 'YES' : 'NO'}`);
logInfo(`Roster File: ${ROSTER_FILE}`);
logInfo('================================');

seedRoster();
