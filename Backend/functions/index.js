const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const pricingPublic = require('./pricingPublic');
const pricingAdmin = require('./pricingAdmin');
const adOrchestration = require('./adOrchestration');
const jwt = require('jsonwebtoken');

// New production routes
const artistsRouter = require('./routes/artists');
const releasesRouter = require('./routes/releases');
const botsRouter = require('./routes/bots');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true, time: Date.now() }));

// Public API
app.use('/pricing/public', pricingPublic);

// Production Routes — Artists, Releases, Bots (can be public or JWT-protected)
app.use('/artists', artistsRouter);
app.use('/releases', releasesRouter);
app.use('/bots', botsRouter);

// Admin API — JWT protected
app.use('/pricing/admin', (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized - no token' });
  const cfg = functions.config();
  const secret = (cfg && cfg.jwt && cfg.jwt.secret) || process.env.JWT_SECRET;
  try {
    jwt.verify(token, secret);
    return next();
  } catch (err) {
    console.error('JWT verify failed', err && err.message);
    return res.status(401).json({ error: 'Unauthorized - invalid token' });
  }
}, pricingAdmin);

// StreamGod Bot Orchestration API — JWT protected
app.use('/ad-orchestration', (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized - no token' });
  const cfg = functions.config();
  const secret = (cfg && cfg.jwt && cfg.jwt.secret) || process.env.JWT_SECRET;
  try {
    jwt.verify(token, secret);
    return next();
  } catch (err) {
    console.error('JWT verify failed', err && err.message);
    return res.status(401).json({ error: 'Unauthorized - invalid token' });
  }
}, adOrchestration);

exports.api = functions.https.onRequest(app);
