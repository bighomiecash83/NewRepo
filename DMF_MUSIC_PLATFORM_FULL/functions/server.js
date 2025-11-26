const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), service: 'dmf-functions' });
});

// Pricing endpoint
app.get('/api/pricing/plans', (req, res) => {
  res.json([
    { id: 1, name: 'Indie', price: 29, features: ['Basic analytics', 'Up to 5 artists'] },
    { id: 2, name: 'Pro', price: 99, features: ['Advanced analytics', 'Up to 50 artists', 'Bot access'] },
    { id: 3, name: 'Enterprise', price: 299, features: ['All features', 'Unlimited artists', 'Custom bots'] }
  ]);
});

// Test Mongo endpoint (placeholder)
app.post('/api/test-mongo', (req, res) => {
  res.json({ ok: true, message: 'MongoDB test would run here', timestamp: new Date().toISOString() });
});

// Revenue endpoint
app.get('/api/revenue/summary', (req, res) => {
  res.json({
    total: 125430.50,
    pending: 23450.00,
    topArtist: 'Artist Name',
    topArtistRevenue: 15000
  });
});

// Artists endpoint
app.get('/api/artists', (req, res) => {
  res.json([
    { id: 1, name: 'Artist One', tracks: 12, streams: 500000, revenue: 5000 },
    { id: 2, name: 'Artist Two', tracks: 8, streams: 300000, revenue: 3000 }
  ]);
});

// Bots endpoint
app.get('/api/bots/status', (req, res) => {
  res.json({
    total: 10000,
    active: 9850,
    inactive: 150,
    recommendation: 'Launch bot fleet for maximum engagement'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✓ DMF Backend API running on http://localhost:${PORT}`);
  console.log(`✓ Listening on 0.0.0.0:${PORT}`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`Endpoints:\n`);
  console.log(`  GET  /api/health              - Health check`);
  console.log(`  GET  /api/pricing/plans       - Pricing plans`);
  console.log(`  GET  /api/revenue/summary     - Revenue data`);
  console.log(`  GET  /api/artists             - Artist list`);
  console.log(`  GET  /api/bots/status         - Bot status`);
  console.log(`  POST /api/test-mongo          - Test MongoDB`);
  console.log(`${'═'.repeat(60)}\n`);
});

process.on('SIGINT', () => {
  console.log('\n✓ Backend server stopped');
  process.exit(0);
});
