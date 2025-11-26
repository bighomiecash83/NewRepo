const { PubSub } = require('@google-cloud/pubsub');
const { Firestore } = require('@google-cloud/firestore');
const { MongoClient } = require('mongodb');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Initialize clients
const pubsub = new PubSub({
  projectId: process.env.FIREBASE_PROJECT_ID
});
const firestore = new Firestore({
  projectId: process.env.FIREBASE_PROJECT_ID
});

let mongoClient;
let mongoDb;

const app = express();
const PORT = process.env.PORT || 8080;

/**
 * Connect to MongoDB
 */
async function connectMongo() {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');
    await mongoClient.connect();
    mongoDb = mongoClient.db('dmf_analytics');
    console.log('✅ Connected to MongoDB');
  }
  return mongoDb;
}

/**
 * Graceful shutdown
 */
async function shutdown(signal) {
  console.log(`\n📤 Received ${signal}, shutting down gracefully...`);
  
  if (mongoClient) {
    await mongoClient.close();
    console.log('✅ MongoDB connection closed');
  }
  
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Process release distribution job from Pub/Sub
 * This is called by the release-subscription listener
 */
async function processReleaseJob(message) {
  const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
  const { releaseId, title, artistId, releaseDate, type } = data;
  
  console.log(`📦 Processing release job: ${releaseId} (${title})`);
  
  try {
    // Get release metadata from Firestore
    const releaseRef = firestore.collection('releases').doc(releaseId);
    const releaseDoc = await releaseRef.get();
    
    if (!releaseDoc.exists) {
      console.error(`❌ Release ${releaseId} not found in Firestore`);
      message.nack(); // NACK to retry
      return;
    }
    
    const release = releaseDoc.data();
    
    // Get artist metadata
    const artistRef = firestore.collection('artists').doc(artistId);
    const artistDoc = await artistRef.get();
    
    if (!artistDoc.exists) {
      console.error(`❌ Artist ${artistId} not found`);
      message.nack();
      return;
    }
    
    const artist = artistDoc.data();
    
    // Simulate distribution to platforms
    // In production, this would call actual DSP APIs (Spotify, Apple Music, etc.)
    const distributions = await distributeToPlayers({
      releaseId,
      title,
      artist: artist.name,
      releaseDate
    });
    
    // Update release status to "published"
    await releaseRef.update({
      status: 'published',
      publishedAt: new Date(),
      distributions: distributions,
      distributionCount: distributions.length
    });
    
    // Store distribution event in MongoDB for analytics
    const db = await connectMongo();
    const events = db.collection('distribution_events');
    
    await events.insertOne({
      _id: uuidv4(),
      releaseId,
      title,
      artistId,
      artistName: artist.name,
      platforms: distributions.map(d => d.platform),
      distributionCount: distributions.length,
      timestamp: new Date(),
      status: 'completed'
    });
    
    console.log(`✅ Release ${releaseId} distributed to ${distributions.length} platforms`);
    
    // ACK the message to remove from subscription
    message.ack();
    
  } catch (error) {
    console.error(`❌ Error processing release job ${releaseId}:`, error);
    message.nack(); // NACK to retry after timeout
  }
}

/**
 * Process bot command from Pub/Sub
 * Examples: start, stop, update
 */
async function processBotCommand(message) {
  const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
  const { botId, command, params } = data;
  
  console.log(`🤖 Processing bot command: ${command} for bot ${botId}`);
  
  try {
    const db = await connectMongo();
    const botsCollection = db.collection('bot_state');
    
    switch (command) {
      case 'start':
        await botsCollection.updateOne(
          { _id: botId },
          {
            $set: {
              status: 'running',
              startedAt: new Date(),
              commandedBy: params.userId,
              commandedAt: new Date()
            }
          },
          { upsert: true }
        );
        console.log(`✅ Bot ${botId} started`);
        break;
        
      case 'stop':
        await botsCollection.updateOne(
          { _id: botId },
          {
            $set: {
              status: 'stopped',
              stoppedAt: new Date(),
              commandedBy: params.userId,
              commandedAt: new Date()
            }
          }
        );
        console.log(`✅ Bot ${botId} stopped`);
        break;
        
      case 'restart':
        await botsCollection.updateOne(
          { _id: botId },
          {
            $set: {
              status: 'running',
              restartedAt: new Date(),
              commandedBy: params.userId,
              commandedAt: new Date()
            }
          }
        );
        console.log(`✅ Bot ${botId} restarted`);
        break;
        
      default:
        console.warn(`⚠️ Unknown bot command: ${command}`);
        message.nack();
        return;
    }
    
    // Record command in audit log
    const auditLog = db.collection('bot_audit_log');
    await auditLog.insertOne({
      _id: uuidv4(),
      botId,
      command,
      params,
      timestamp: new Date(),
      status: 'executed'
    });
    
    message.ack();
    
  } catch (error) {
    console.error(`❌ Error processing bot command for ${botId}:`, error);
    message.nack();
  }
}

/**
 * Simulate distribution to music platforms
 * In production, integrate with actual DSP APIs
 */
async function distributeToPlayers({ releaseId, title, artist, releaseDate }) {
  const platforms = [
    { name: 'spotify', isrcRequired: true },
    { name: 'apple-music', isrcRequired: true },
    { name: 'youtube-music', isrcRequired: false },
    { name: 'amazon-music', isrcRequired: true },
    { name: 'tidal', isrcRequired: true }
  ];
  
  // Simulate API calls with random delay
  const distributions = await Promise.all(
    platforms.map(async (platform) => {
      // Simulate network delay (50-500ms per platform)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 450 + 50));
      
      return {
        platform: platform.name,
        distributedAt: new Date(),
        status: 'success',
        externalId: `ext_${uuidv4().substring(0, 8)}`
      };
    })
  );
  
  return distributions;
}

/**
 * Start listening to Pub/Sub subscriptions
 */
async function startSubscriptionListeners() {
  // Listen to releases-queue for distribution jobs
  const releasesSubscription = pubsub.subscription('releases-sub');
  
  releasesSubscription.on('message', processReleaseJob);
  releasesSubscription.on('error', (error) => {
    console.error('❌ Releases subscription error:', error);
  });
  
  console.log('👂 Listening on releases-sub for distribution jobs...');
  
  // Listen to bots-commands for bot control commands
  const botsSubscription = pubsub.subscription('bots-sub');
  
  botsSubscription.on('message', processBotCommand);
  botsSubscription.on('error', (error) => {
    console.error('❌ Bots subscription error:', error);
  });
  
  console.log('👂 Listening on bots-sub for bot commands...');
}

/**
 * Main entry point
 */
async function main() {
  try {
    // Connect to MongoDB
    await connectMongo();
    
    // Start Pub/Sub listeners
    await startSubscriptionListeners();
    
    // Start health check server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Streamgod Worker started on port ${PORT}`);
      console.log(`📊 Firebase Project: ${process.env.FIREBASE_PROJECT_ID}`);
      console.log(`🗄️  MongoDB: ${process.env.MONGO_URI ? 'configured' : 'using default localhost:27017'}`);
      console.log(`\n✅ Worker is ready to process Pub/Sub messages\n`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
}

// Start the worker
main();
