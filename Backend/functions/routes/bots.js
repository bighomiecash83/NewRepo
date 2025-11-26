// Backend/functions/routes/bots.js
const { Router } = require('express');
const { getMongoClient } = require('../services/mongoClient');

const router = Router();

// GET /bots/status - Get bot fleet status
router.get('/status', async (_req, res) => {
  try {
    const client = await getMongoClient();
    const db = client.db('dmf-music-platform');
    const botStatus = await db.collection('bots').findOne({ _id: 'fleet-status' });

    const status = botStatus || {
      _id: 'fleet-status',
      online: 0,
      totalLaunched: 0,
      lastUpdate: new Date(),
    };

    return res.json({
      status: status.online ? `${status.online} online` : 'idle',
      online: status.online || 0,
      totalLaunched: status.totalLaunched || 0,
      lastUpdate: status.lastUpdate,
    });
  } catch (error) {
    console.error('Bot status error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to get bot status',
    });
  }
});

// POST /bots/start - Start bot fleet
router.post('/start', async (req, res) => {
  try {
    const { count } = req.body;
    const botCount = count || 100;

    const client = await getMongoClient();
    const db = client.db('dmf-music-platform');

    // Update bot status in Mongo
    await db.collection('bots').updateOne(
      { _id: 'fleet-status' },
      {
        $set: {
          online: botCount,
          lastUpdate: new Date(),
        },
        $inc: {
          totalLaunched: botCount,
        },
      },
      { upsert: true }
    );

    // Log bot startup event
    await db.collection('bot-events').insertOne({
      type: 'START',
      count: botCount,
      timestamp: new Date(),
    });

    console.log(`Started ${botCount} bots`);

    return res.json({
      ok: true,
      online: botCount,
      message: `Started ${botCount} StreamGod bots`,
    });
  } catch (error) {
    console.error('Bot start error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to start bots',
    });
  }
});

// POST /bots/stop - Stop bot fleet
router.post('/stop', async (_req, res) => {
  try {
    const client = await getMongoClient();
    const db = client.db('dmf-music-platform');

    // Get current status
    const current = await db.collection('bots').findOne({ _id: 'fleet-status' });
    const stoppedCount = current?.online || 0;

    // Update bot status
    await db.collection('bots').updateOne(
      { _id: 'fleet-status' },
      {
        $set: {
          online: 0,
          lastUpdate: new Date(),
        },
      },
      { upsert: true }
    );

    // Log bot stop event
    await db.collection('bot-events').insertOne({
      type: 'STOP',
      count: stoppedCount,
      timestamp: new Date(),
    });

    console.log(`Stopped ${stoppedCount} bots`);

    return res.json({
      ok: true,
      online: 0,
      message: `Stopped ${stoppedCount} StreamGod bots`,
    });
  } catch (error) {
    console.error('Bot stop error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to stop bots',
    });
  }
});

// GET /bots/metrics - Get bot metrics and performance
router.get('/metrics', async (_req, res) => {
  try {
    const client = await getMongoClient();
    const db = client.db('dmf-music-platform');

    const recentEvents = await db.collection('bot-events')
      .find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    const status = await db.collection('bots').findOne({ _id: 'fleet-status' });

    return res.json({
      currentOnline: status?.online || 0,
      totalLaunched: status?.totalLaunched || 0,
      recentEvents: recentEvents.map((e) => ({
        type: e.type,
        count: e.count,
        timestamp: e.timestamp,
      })),
    });
  } catch (error) {
    console.error('Bot metrics error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to get bot metrics',
    });
  }
});

module.exports = router;
