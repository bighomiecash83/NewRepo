#!/usr/bin/env node

/**
 * StreamGod Bot Activation Script
 * Creates sample bots in MongoDB for testing
 * Run: node activate-streamgod-bots.js
 */

const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || 
  "mongodb+srv://bighomiecash8346:bighomiecash8346@cluster0.wf8x1lb.mongodb.net/dmf_db";
const DB_NAME = "dmf_db";

// Sample bots (can be modified)
const SAMPLE_BOTS = [
  {
    _id: "bot_YT_SHORTS_SCALER_001",
    bot_key: "YT_SHORTS_SCALER_001",
    division: "Distribution",
    role: "content_distributor",
    platform: "youtube",
    status: "active",
    assigned_artist_ids: ["artist_freezzo", "artist_obmb"],
    next_run_after: new Date(Date.now() + 3600000), // 1 hour from now
    config: {
      target_views: 10000,
      daily_uploads: 2,
      quality: "1080p"
    },
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "bot_TIKTOK_VIRAL_001",
    bot_key: "TIKTOK_VIRAL_001",
    division: "Marketing",
    role: "engagement_booster",
    platform: "tiktok",
    status: "active",
    assigned_artist_ids: ["artist_freezzo"],
    next_run_after: new Date(Date.now() + 7200000), // 2 hours from now
    config: {
      hashtag_strategy: "trending",
      upload_frequency: "3x daily",
      engagement_target: "high"
    },
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "bot_SPOTIFY_PLAYLIST_001",
    bot_key: "SPOTIFY_PLAYLIST_001",
    division: "Growth",
    role: "playlist_curator",
    platform: "spotify",
    status: "active",
    assigned_artist_ids: ["artist_obmb"],
    next_run_after: new Date(Date.now() + 5400000), // 1.5 hours from now
    config: {
      playlist_pitches: 5,
      editorial_target: true,
      user_playlist_adds: 100
    },
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Sample campaigns
const SAMPLE_CAMPAIGNS = [
  {
    _id: "campaign_freezzo_bounce_001",
    artist_id: "artist_freezzo",
    track_id: "track_bounce_back",
    campaign_name: "BOUNCE BACK Launch Blitz",
    status: "active",
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    budget: 5000,
    assigned_bots: ["bot_YT_SHORTS_SCALER_001", "bot_TIKTOK_VIRAL_001"],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "campaign_obmb_release_001",
    artist_id: "artist_obmb",
    track_id: "track_release_001",
    campaign_name: "OBMB Release Campaign",
    status: "active",
    start_date: new Date(),
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    budget: 2000,
    assigned_bots: ["bot_SPOTIFY_PLAYLIST_001"],
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Bot runs (execution logs)
const SAMPLE_BOT_RUNS = [
  {
    _id: "run_bot_YT_SHORTS_SCALER_001_2025-11-23T00:00:00Z",
    bot_id: "bot_YT_SHORTS_SCALER_001",
    campaign_id: "campaign_freezzo_bounce_001",
    execution_timestamp: new Date(),
    status: "success",
    actions_taken: 2,
    views_generated: 5234,
    engagement_rate: 0.12,
    error_log: null,
    execution_time_ms: 1250
  }
];

async function activateStreamGodBots() {
  let client;
  try {
    console.log("🤖 StreamGod Bot Activation Script");
    console.log("=".repeat(50));
    
    // Connect to MongoDB
    console.log("\n📡 Connecting to MongoDB...");
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(DB_NAME);
    
    // Create or get collections
    const botsCollection = db.collection("ad_bots");
    const campaignsCollection = db.collection("ad_campaigns");
    const runsCollection = db.collection("ad_bot_runs");

    // Drop existing (for clean slate)
    console.log("\n🧹 Clearing existing sample data...");
    const botIds = SAMPLE_BOTS.map(b => b._id);
    await botsCollection.deleteMany({ _id: { $in: botIds } });
    console.log("✅ Cleared old bots");

    // Insert bots
    console.log("\n🤖 Inserting sample bots...");
    const botResult = await botsCollection.insertMany(SAMPLE_BOTS);
    console.log(`✅ Inserted ${botResult.insertedCount} bots:`);
    SAMPLE_BOTS.forEach(bot => {
      console.log(`   - ${bot.bot_key} (${bot.platform})`);
    });

    // Insert campaigns
    console.log("\n📋 Inserting sample campaigns...");
    const campaignResult = await campaignsCollection.insertMany(SAMPLE_CAMPAIGNS);
    console.log(`✅ Inserted ${campaignResult.insertedCount} campaigns:`);
    SAMPLE_CAMPAIGNS.forEach(campaign => {
      console.log(`   - ${campaign.campaign_name}`);
    });

    // Insert bot runs
    console.log("\n📊 Inserting sample bot runs (audit logs)...");
    const runsResult = await runsCollection.insertMany(SAMPLE_BOT_RUNS);
    console.log(`✅ Inserted ${runsResult.insertedCount} bot runs`);

    // Verify
    console.log("\n📊 Verification:");
    const botCount = await botsCollection.countDocuments();
    const campaignCount = await campaignsCollection.countDocuments();
    const runCount = await runsCollection.countDocuments();
    
    console.log(`   Bots: ${botCount}`);
    console.log(`   Campaigns: ${campaignCount}`);
    console.log(`   Bot Runs: ${runCount}`);

    // Show next scheduled runs
    console.log("\n⏰ Next Scheduled Runs:");
    const nextRuns = await botsCollection
      .find({})
      .sort({ next_run_after: 1 })
      .limit(5)
      .toArray();

    nextRuns.forEach(bot => {
      const timeUntilRun = new Date(bot.next_run_after) - Date.now();
      const minutesUntilRun = Math.round(timeUntilRun / 60000);
      console.log(`   ${bot.bot_key}: ${minutesUntilRun} minutes from now`);
    });

    console.log("\n" + "=".repeat(50));
    console.log("✅ StreamGod bots activated successfully!");
    console.log("\nNext steps:");
    console.log("1. Set up Cloud Scheduler to call: /api/ad-orchestration/run-due");
    console.log("2. Monitor bot runs in OwnerDashboard");
    console.log("3. Check ad_bot_runs collection for execution logs");

  } catch (error) {
    console.error("❌ Error activating bots:", error.message);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
}

// Run
activateStreamGodBots();
