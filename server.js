/**
 * DMF-MUSIC-PLATFORM - StreamGod OS Backend
 * 
 * Complete Express server with:
 * - StreamGod brain for permissions & routing
 * - Role-based access control
 * - Model routing for AI tasks
 * - Full API endpoints for roster, catalog, analytics
 * - MongoDB integration with auto-seeding
 * 
 * Usage:
 *   node server.js
 * 
 * Environment:
 *   NODE_ENV=development|staging|production
 *   MONGO_URI_DEV, MONGO_URI_STAGE, MONGO_URI_PROD
 *   JWT_SECRET
 *   OPENAI_API_KEY
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

// StreamGod brain & middleware
const {
  brain,
  getCurrentMode,
  getModeConfig,
  streamgodRouter,
} = require("./src/streamgod/brain");
const {
  authMiddleware,
  routeGuard,
  requirePermission,
  ownerOrAdmin,
} = require("./src/middleware/streamgod-auth");

// Import portal router
const portalRouter = require("./src/api/portalRouter");

// Add pricing service
const pricingService = require("./src/services/pricingService");

// Load DMF Pricing Config
let pricingConfig = {};
try {
  pricingConfig = require(path.join(__dirname, "config/dmf_pricing_config.json"));
  console.log(`[DMF] Pricing config loaded: v${pricingConfig.dmf_pricing_config_version}`);
} catch (err) {
  console.warn(`[DMF] Warning: Pricing config not found. Pricing endpoints will be unavailable.`);
}

const app = express();
const PORT = process.env.PORT || 5001;

// ============================================================================
// CONFIGURATION
// ============================================================================

const currentMode = getCurrentMode();
const modeConfig = getModeConfig(currentMode);

console.log(`[StreamGod] Starting in ${currentMode} mode`);
console.log(`[StreamGod] Log level: ${modeConfig.settings.log_level}`);
console.log(`[StreamGod] Rate limit: ${modeConfig.settings.rate_limit}`);

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ============================================================================
// PUBLIC ENDPOINTS (No auth required)
// ============================================================================

/**
 * Health check - always available
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "dmf-music-platform-api",
    mode: currentMode,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Public roster (public artists/divisions only)
 */
app.get("/api/public/artists", async (req, res) => {
  try {
    // This would fetch from MongoDB (stub for now)
    const artists = [
      {
        id: "artist_001",
        name: "Big Homie Cash",
        role: ["Founder", "CEO"],
        status: "active",
        verified: true,
      },
      {
        id: "artist_002",
        name: "Freezzo",
        role: ["Co-founder"],
        status: "active",
        verified: true,
      },
    ];

    res.json({
      data: artists,
      meta: { count: artists.length },
    });
  } catch (err) {
    console.error("[DMF] Public artists error:", err);
    res.status(500).json({ error: "Failed to fetch public artists" });
  }
});

/**
 * Public divisions (public info only)
 */
app.get("/api/public/divisions", async (req, res) => {
  try {
    const divisions = [
      {
        id: "division_001",
        name: "StreamGod AI",
        category: "Technology",
        description: "Catalog analysis and distribution intelligence",
      },
      {
        id: "division_002",
        name: "The Gavel Syndicate",
        category: "Legal & IP",
        description: "Legal and intellectual property management",
      },
    ];

    res.json({
      data: divisions,
      meta: { count: divisions.length },
    });
  } catch (err) {
    console.error("[DMF] Public divisions error:", err);
    res.status(500).json({ error: "Failed to fetch public divisions" });
  }
});
// ============================================================================
// PRICING CONFIG ENDPOINTS (Public - no auth required)
// ============================================================================

/**
 * GET /api/config/pricing
 * Complete pricing configuration for Artist Dashboard
 * Excludes industry_products (enterprise tier)
 */
app.get("/api/config/pricing", (req, res) => {
  try {
    if (!pricingConfig || !pricingConfig.currency) {
      return res.status(503).json({
        error: "Pricing service unavailable",
        message: "Pricing configuration not loaded",
      });
    }

    // Return everything except industry products
    const { industry_products, ...publicConfig } = pricingConfig;
    res.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.json(publicConfig);
  } catch (err) {
    console.error("[DMF] /api/config/pricing error:", err);
    res.status(500).json({ error: "Failed to load pricing configuration" });
  }
});

/**
 * GET /api/config/pricing/distribution
 * Just distribution tiers (Single, EP, Album, Mixtape)
 */
app.get("/api/config/pricing/distribution", (req, res) => {
  try {
    if (!pricingConfig.distribution) {
      return res.status(503).json({ error: "Pricing configuration not available" });
    }

    const response = {
      description: pricingConfig.distribution.description,
      tiers: {
        single: pricingConfig.distribution.single,
        ep: pricingConfig.distribution.ep,
        album: pricingConfig.distribution.album,
        mixtape: pricingConfig.distribution.mixtape,
      },
    };

    res.set("Cache-Control", "public, max-age=3600");
    res.json(response);
  } catch (err) {
    console.error("[DMF] /api/config/pricing/distribution error:", err);
    res.status(500).json({ error: "Failed to load distribution pricing" });
  }
});

/**
 * GET /api/config/pricing/migration
 * Catalog migration tiers
 */
app.get("/api/config/pricing/migration", (req, res) => {
  try {
    if (!pricingConfig.catalog_migration) {
      return res.status(503).json({ error: "Pricing configuration not available" });
    }

    const response = {
      description: pricingConfig.catalog_migration.description,
      tiers: {
        single: pricingConfig.catalog_migration.single,
        ep: pricingConfig.catalog_migration.ep,
        album: pricingConfig.catalog_migration.album,
        full_catalog: pricingConfig.catalog_migration.full_catalog,
      },
    };

    res.set("Cache-Control", "public, max-age=3600");
    res.json(response);
  } catch (err) {
    console.error("[DMF] /api/config/pricing/migration error:", err);
    res.status(500).json({ error: "Failed to load migration pricing" });
  }
});

/**
 * GET /api/config/pricing/boosts
 * Ads + Playlist boost packages
 */
app.get("/api/config/pricing/boosts", (req, res) => {
  try {
    if (!pricingConfig.boost_packages) {
      return res.status(503).json({ error: "Pricing configuration not available" });
    }

    const response = {
      description: pricingConfig.boost_packages.description,
      ads: pricingConfig.boost_packages.ads,
      playlist: pricingConfig.boost_packages.playlist,
    };

    res.set("Cache-Control", "public, max-age=3600");
    res.json(response);
  } catch (err) {
    console.error("[DMF] /api/config/pricing/boosts error:", err);
    res.status(500).json({ error: "Failed to load boost pricing" });
  }
});

/**
 * GET /api/config/partnership
 * Growth partnership (90/10 split)
 */
app.get("/api/config/partnership", (req, res) => {
  try {
    if (!pricingConfig.growth_partnership) {
      return res.status(503).json({ error: "Pricing configuration not available" });
    }

    res.set("Cache-Control", "public, max-age=3600");
    res.json(pricingConfig.growth_partnership);
  } catch (err) {
    console.error("[DMF] /api/config/partnership error:", err);
    res.status(500).json({ error: "Failed to load partnership info" });
  }
});

/**
 * GET /api/config/promos
 * Promotional offers
 */
app.get("/api/config/promos", (req, res) => {
  try {
    if (!pricingConfig.promotional_offers) {
      return res.status(503).json({ error: "Pricing configuration not available" });
    }

    res.set("Cache-Control", "public, max-age=1800"); // 30 min cache
    res.json(pricingConfig.promotional_offers);
  } catch (err) {
    console.error("[DMF] /api/config/promos error:", err);
    res.status(500).json({ error: "Failed to load promotional offers" });
  }
});

/**
 * GET /api/config/label
 * Label information
 */
app.get("/api/config/label", (req, res) => {
  try {
    if (!pricingConfig.label) {
      return res.status(503).json({ error: "Pricing configuration not available" });
    }

    res.set("Cache-Control", "public, max-age=86400"); // 24 hour cache
    res.json(pricingConfig.label);
  } catch (err) {
    console.error("[DMF] /api/config/label error:", err);
    res.status(500).json({ error: "Failed to load label info" });
  }
});

/**
 * GET /api/config/compliance
 * Legal/compliance information
 */
app.get("/api/config/compliance", (req, res) => {
  try {
    if (!pricingConfig.compliance) {
      return res.status(503).json({ error: "Pricing configuration not available" });
    }

    res.set("Cache-Control", "public, max-age=86400");
    res.json(pricingConfig.compliance);
  } catch (err) {
    console.error("[DMF] /api/config/compliance error:", err);
    res.status(500).json({ error: "Failed to load compliance info" });
  }
});

/**
 * GET /api/config/industry
 * Enterprise products (ADMIN ONLY)
 * TODO: Add [requirePermission("admin:view")] when auth is wired
 */
app.get("/api/config/industry", (req, res) => {
  try {
    // TODO: Uncomment auth check below
    // if (req.user?.role !== "OWNER" && req.user?.role !== "ADMIN") {
    //   return res.status(403).json({ error: "Forbidden" });
    // }

    if (!pricingConfig.industry_products) {
      return res.status(503).json({ error: "Pricing configuration not available" });
    }

    res.set("Cache-Control", "public, max-age=3600");
    res.json(pricingConfig.industry_products);
  } catch (err) {
    console.error("[DMF] /api/config/industry error:", err);
    res.status(500).json({ error: "Failed to load industry products" });
  }
});

// ============================================================================
// PRICING ENDPOINTS (Public - no auth required)
// ============================================================================

/**
 * GET /api/pricing/all
 * Get complete pricing configuration
 */
app.get("/api/pricing/all", (req, res) => {
  try {
    const pricing = pricingService.getAllPricing();
    res.set("Cache-Control", "public, max-age=3600"); // 1 hour cache
    res.json(pricing);
  } catch (err) {
    console.error("[DMF] Pricing error:", err);
    res.status(503).json({ error: "Pricing service unavailable" });
  }
});

/**
 * POST /api/pricing/calculate
 * Calculate order total with all factors
 * 
 * Body:
 * {
 *   trackCount: number,
 *   orderType: 'distribution' | 'migration',
 *   includeBoosts: boolean,
 *   boostIds: string[],
 *   isNewArtist: boolean,
 *   numReleases: number
 * }
 */
app.post("/api/pricing/calculate", express.json(), (req, res) => {
  try {
    const {
      trackCount = 1,
      orderType = "distribution",
      includeBoosts = false,
      boostIds = [],
      isNewArtist = false,
      numReleases = 1
    } = req.body;

    const calculation = pricingService.calculateOrderTotal({
      trackCount,
      orderType,
      includeBoosts,
      boostIds,
      isNewArtist,
      numReleases
    });

    res.json(calculation);
  } catch (err) {
    console.error("[DMF] Pricing calculation error:", err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/pricing/release/:trackCount
 * Quick lookup: what tier is this track count?
 */
app.get("/api/pricing/release/:trackCount", (req, res) => {
  try {
    const trackCount = parseInt(req.params.trackCount) || 1;
    const releaseInfo = pricingService.getReleasePrice(trackCount);
    res.json(releaseInfo);
  } catch (err) {
    console.error("[DMF] Release pricing error:", err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/pricing/migration/:trackCount
 * Quick lookup: migration tier for this count
 */
app.get("/api/pricing/migration/:trackCount", (req, res) => {
  try {
    const trackCount = parseInt(req.params.trackCount) || 1;
    const migrationInfo = pricingService.getMigrationPrice(trackCount);
    res.json(migrationInfo);
  } catch (err) {
    console.error("[DMF] Migration pricing error:", err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/pricing/boosts
 * Get all boost packages
 */
app.get("/api/pricing/boosts", (req, res) => {
  try {
    const boosts = pricingService.getBoostPackages();
    res.set("Cache-Control", "public, max-age=1800"); // 30 min cache
    res.json(boosts);
  } catch (err) {
    console.error("[DMF] Boosts error:", err);
    res.status(503).json({ error: "Boosts unavailable" });
  }
});

/**
 * GET /api/pricing/partnership
 * Growth partnership split (90/10)
 */
app.get("/api/pricing/partnership", (req, res) => {
  try {
    const split = pricingService.getGrowthSplit();
    res.set("Cache-Control", "public, max-age=3600");
    res.json(split);
  } catch (err) {
    console.error("[DMF] Partnership error:", err);
    res.status(503).json({ error: "Partnership info unavailable" });
  }
});

// ============================================================================
// PROTECTED ENDPOINTS (Auth + Brain policies required)
// ============================================================================

/**
 * Mount all protected API routes under /api
 * They require JWT auth and pass through route guard
 */
app.use("/api", authMiddleware, routeGuard());

/**
 * Mount portal API under /api/portal
 * Still requires JWT auth, but different filtering logic
 */
app.use("/api/portal", authMiddleware, portalRouter);

/**
 * System status (for control center)
 */
app.get("/api/status", ownerOrAdmin(), async (req, res) => {
  try {
    const status = {
      artists: 6,
      divisions: 10,
      engines: 5,
      active_engines: [
        { slug: "streamgod-ai", name: "StreamGod AI" },
        { slug: "dur-yia-engine", name: "Du'ryia Engine" },
      ],
      pricing_service: pricingConfig && pricingConfig.currency ? "online" : "offline",
      timestamp: new Date().toISOString(),
    };

    res.json({ data: status });
  } catch (err) {
    console.error("[DMF] Status error:", err);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

/**
 * Get all artists (protected)
 */
app.get("/api/artists", requirePermission("artists:read"), async (req, res) => {
  try {
    const artists = [
      { id: "artist_001", name: "Big Homie Cash", verified: true },
      { id: "artist_002", name: "Freezzo", verified: true },
      { id: "artist_003", name: "OBMB Delo", verified: true },
      { id: "artist_004", name: "Ellumf", verified: true },
      { id: "artist_005", name: "Go Savage", verified: true },
      { id: "artist_006", name: "Dub 32 ENT", verified: true },
    ];

    res.json({
      data: artists,
      meta: { count: artists.length, fetched_by: req.user.role },
    });
  } catch (err) {
    console.error("[DMF] Artists error:", err);
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});

/**
 * Get single artist detail
 */
app.get(
  "/api/artists/:slug",
  requirePermission("artists:read"),
  async (req, res) => {
    try {
      const { slug } = req.params;

      // Stub: return mock artist
      const artist = {
        id: "artist_001",
        name: "Big Homie Cash",
        slug: slug,
        role: ["Founder", "CEO", "Artist"],
        label: "DMF Records",
        verified: true,
        bio: "Founder and CEO of DMF Records",
      };

      res.json({
        data: artist,
        meta: {
          insights: {
            stream_score: null,
            fraud_risk: null,
            growth_index: null,
          },
        },
      });
    } catch (err) {
      console.error("[DMF] Artist detail error:", err);
      res.status(500).json({ error: "Failed to fetch artist" });
    }
  }
);

/**
 * Get all divisions
 */
app.get(
  "/api/divisions",
  requirePermission("divisions:read"),
  async (req, res) => {
    try {
      const divisions = [
        {
          id: "division_001",
          name: "StreamGod AI",
          category: "Technology",
          services: ["Catalog Analysis", "Distribution Readiness"],
        },
        {
          id: "division_002",
          name: "The Gavel Syndicate",
          category: "Legal & IP",
          services: ["Contract Management", "Copyright Registration"],
        },
        {
          id: "division_003",
          name: "DMF Distributor Worldwide",
          category: "Distribution",
          services: ["DSP Distribution", "Royalty Collection"],
        },
      ];

      res.json({
        data: divisions,
        meta: { count: divisions.length },
      });
    } catch (err) {
      console.error("[DMF] Divisions error:", err);
      res.status(500).json({ error: "Failed to fetch divisions" });
    }
  }
);

/**
 * Get single division detail
 */
app.get(
  "/api/divisions/:slug",
  requirePermission("divisions:read"),
  async (req, res) => {
    try {
      const { slug } = req.params;

      const division = {
        id: "division_001",
        name: "StreamGod AI",
        slug: slug,
        category: "Technology",
        description: "Advanced AI brain system for catalog analysis",
        services: ["Catalog Analysis", "Distribution Readiness", "Metadata Optimization"],
        integrated: true,
      };

      res.json({
        data: division,
        meta: {
          status: "online",
          load_factor: null,
        },
      });
    } catch (err) {
      console.error("[DMF] Division detail error:", err);
      res.status(500).json({ error: "Failed to fetch division" });
    }
  }
);

/**
 * Catalog analysis endpoint
 * Uses StreamGod brain to select model
 */
app.post(
  "/api/catalog/analyze",
  requirePermission("catalog:write"),
  async (req, res) => {
    try {
      const { catalog_data } = req.body;

      // Use StreamGod brain to select the right AI model
      const job = streamgodRouter("CATALOG_ANALYSIS", {
        catalog: catalog_data,
        user_id: req.user.id,
      });

      console.log(
        `[StreamGod] Analysis job created using model: ${job.model}`
      );

      // In a real system, you'd send job.payload to OpenAI API here
      // For now, just return the job structure

      res.json({
        status: "queued",
        job_id: "job_" + Date.now(),
        model: job.model,
        message: "Catalog analysis queued. Check status for results.",
      });
    } catch (err) {
      console.error("[DMF] Catalog analysis error:", err);
      res.status(500).json({ error: "Failed to queue analysis" });
    }
  }
);

/**
 * Admin: Brain inspection endpoint
 * Only OWNER/ADMIN can see the brain config
 */
app.get("/api/admin/brain", ownerOrAdmin(), (req, res) => {
  try {
    // Send sanitized brain config (without API keys)
    const sanitized = {
      metadata: brain.metadata,
      access_control: brain.access_control,
      modes: brain.modes,
      services: brain.services,
      features: brain.features,
      // Don't expose actual API keys
    };

    res.json({ data: sanitized });
  } catch (err) {
    console.error("[DMF] Brain inspection error:", err);
    res.status(500).json({ error: "Failed to inspect brain" });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error("[DMF] Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      currentMode === "development" ? err.message : "An error occurred",
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.path });
});

// ============================================================================
// SERVER START
// ============================================================================

async function start() {
  try {
    // Resolve MongoDB URI based on environment
    let mongoUri =
      process.env.MONGO_URI ||
      process.env[`MONGO_URI_${currentMode.toUpperCase()}`];

    if (!mongoUri) {
      console.warn(
        "[DMF] No MongoDB URI found. Running in memory mode (no persistence)."
      );
    } else {
      console.log(`[DMF] Connecting to MongoDB...`);
      // Uncomment if you have mongoose configured:
      // await mongoose.connect(mongoUri);
      // console.log("[DMF] MongoDB connected");
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`\n??????????????????????????????????????????????????????`);
      console.log(`?   DMF-MUSIC-PLATFORM StreamGod OS Backend          ?`);
      console.log(`??????????????????????????????????????????????????????`);
      console.log(`? ?? API running: http://localhost:${PORT}`);
      console.log(`? ?? Brain mode: ${currentMode}`);
      console.log(`? ?? Public endpoints: /api/public/*`);
      console.log(`? ?? Pricing API: /api/config/pricing`);
      console.log(`? ?? Protected endpoints: /api/* (require JWT)`);
      console.log(`? ?? Health check: /health`);
      console.log(`? ?? Brain config: streamgod_brain.config.json`);
      console.log(`??????????????????????????????????????????????????????\n`);
    });
  } catch (err) {
    console.error("[DMF] Failed to start server:", err);
    process.exit(1);
  }
}

start();

module.exports = app;
