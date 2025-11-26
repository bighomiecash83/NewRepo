const express = require("express");
const cors = require("cors");
const pricingPublic = require("./pricingPublic");
const pricingAdmin = require("./pricingAdmin");
const adOrchestration = require("./adOrchestration");
const jwt = require("jsonwebtoken");

// New production routes
const artistsRouter = require('./routes/artists');
const releasesRouter = require('./routes/releases');
const botsRouter = require('./routes/bots');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dmf-default-secret-key";
const PORT = process.env.PORT || 5001;

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, time: Date.now(), environment: "standalone-api", port: PORT, service: "dmf-functions" });
});

// Production Routes — Artists, Releases, Bots
app.use("/artists", artistsRouter);
app.use("/releases", releasesRouter);
app.use("/bots", botsRouter);

// Public endpoint
app.use("/pricing/public", pricingPublic);

// Admin endpoint (JWT-protected)
app.use("/pricing/admin", (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send({ error: "Unauthorized" });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).send({ error: "Unauthorized", details: err.message });
  }
}, pricingAdmin);

// Ad Orchestration endpoint (JWT-protected)
app.use("/ad-orchestration", (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send({ error: "Unauthorized" });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).send({ error: "Unauthorized", details: err.message });
  }
}, adOrchestration);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🚀 DMF Music Platform API Server`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`💰 Pricing: http://localhost:${PORT}/pricing/public/plans`);
  console.log(`🔐 Admin: http://localhost:${PORT}/pricing/admin (JWT required)`);
  console.log(`📡 Ad Orchestration: http://localhost:${PORT}/ad-orchestration (JWT required)`);
  console.log(`${'═'.repeat(60)}\n`);
});
