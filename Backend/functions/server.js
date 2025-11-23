const express = require("express");
const cors = require("cors");
const pricingPublic = require("./pricingPublic");
const pricingAdmin = require("./pricingAdmin");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Public endpoint
app.use("/api/pricing/public", pricingPublic);

// Admin endpoint (JWT-protected)
app.use("/api/pricing/admin", (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send({ error: "Unauthorized" });
  try {
    jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    next();
  } catch (err) {
    res.status(401).send({ error: "Unauthorized", details: err.message });
  }
}, pricingAdmin);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ DMF Backend running on http://localhost:${PORT}`);
  console.log(`  Public API: http://localhost:${PORT}/api/pricing/public/plans`);
  console.log(`  Admin API: http://localhost:${PORT}/api/pricing/admin/plans`);
});
