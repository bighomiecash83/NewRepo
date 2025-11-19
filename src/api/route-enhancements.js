/**
 * DMF API Route Enhancements
 * Detail endpoints + system status for control center
 * 
 * Add these routes to your Express router (src/api/router.js or equivalent)
 */

const express = require("express");
const router = express.Router();

// Assuming you have models like:
// const { Artist } = require("../models/Artist");
// const { Division } = require("../models/Division");
// const { Engine } = require("../models/Engine");

// ============================================================================
// ARTIST DETAIL ENDPOINT
// ============================================================================

/**
 * GET /api/artists/:slug
 * 
 * Detailed view for a single artist.
 * Includes profile data + placeholder for StreamGod insights.
 * 
 * Response:
 * {
 *   "data": { ...artist object },
 *   "meta": {
 *     "insights": {
 *       "stream_score": null,
 *       "fraud_risk": null,
 *       "growth_index": null
 *     }
 *   }
 * }
 */
router.get("/artists/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // Fetch artist by slug (or ID)
    const artist = await Artist.findOne({ slug });

    if (!artist) {
      return res.status(404).json({
        error: "Artist not found",
        slug,
      });
    }

    // Log fetch
    console.log(`[DMF API] Fetched artist: ${artist.name}`);

    // Return with metadata placeholder for future analytics
    res.json({
      data: artist,
      meta: {
        // These fields are ready to be populated by StreamGod brain
        insights: {
          stream_score: null, // Future: real-time stream analytics
          fraud_risk: null,   // Future: anti-bot scoring
          growth_index: null, // Future: trend analysis
        },
      },
    });
  } catch (err) {
    console.error("[DMF API] /artists/:slug error:", err);
    res.status(500).json({
      error: "Failed to load artist",
      details: err.message,
    });
  }
});

// ============================================================================
// DIVISION DETAIL ENDPOINT
// ============================================================================

/**
 * GET /api/divisions/:slug
 * 
 * Detailed view for a DMF division.
 * Includes services, API endpoints, + operational status.
 * 
 * Response:
 * {
 *   "data": { ...division object },
 *   "meta": {
 *     "status": "online",
 *     "load_factor": null
 *   }
 * }
 */
router.get("/divisions/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const division = await Division.findOne({ slug });

    if (!division) {
      return res.status(404).json({
        error: "Division not found",
        slug,
      });
    }

    console.log(`[DMF API] Fetched division: ${division.name}`);

    res.json({
      data: division,
      meta: {
        // Status field ready for real-time monitoring
        status: "online", // Future: real-time health checks
        load_factor: null, // Future: queue depth, error rates, etc.
      },
    });
  } catch (err) {
    console.error("[DMF API] /divisions/:slug error:", err);
    res.status(500).json({
      error: "Failed to load division",
      details: err.message,
    });
  }
});

// ============================================================================
// SYSTEM STATUS ENDPOINT
// ============================================================================

/**
 * GET /api/status
 * 
 * High-level system snapshot for control center dashboard.
 * Shows counts + active engines list.
 * 
 * Response:
 * {
 *   "data": {
 *     "artists": 6,
 *     "divisions": 10,
 *     "engines": 5,
 *     "active_engines": [
 *       { "slug": "streamgod-ai", "name": "StreamGod AI" },
 *       { "slug": "dur-yia-engine", "name": "Du'ryia Engine" },
 *       ...
 *     ]
 *   },
 *   "meta": {
 *     "timestamp": "2025-01-15T14:30:00Z"
 *   }
 * }
 */
router.get("/status", async (req, res) => {
  try {
    // Fetch counts
    const [artistCount, divisionCount, engineCount, engines] = await Promise.all([
      Artist.countDocuments({}),
      Division.countDocuments({}),
      Engine.countDocuments({}),
      Engine.find({ status: "active" }).limit(10), // Top 10 active engines
    ]);

    console.log(
      `[DMF API] Status snapshot: ${artistCount} artists, ${divisionCount} divisions, ${engineCount} engines`
    );

    res.json({
      data: {
        artists: artistCount,
        divisions: divisionCount,
        engines: engineCount,
        active_engines: engines.map((e) => ({
          slug: e.slug,
          name: e.name,
          type: e.type,
          status: e.status,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
        // Future: add uptime, last_seed, build_version, etc.
      },
    });
  } catch (err) {
    console.error("[DMF API] /status error:", err);
    res.status(500).json({
      error: "Failed to fetch system status",
      details: err.message,
    });
  }
});

// ============================================================================
// CONTROL CENTER SUMMARY (Bonus)
// ============================================================================

/**
 * GET /api/control-center/summary
 * 
 * Comprehensive summary for control center page.
 * Includes: counts, engine status, health checks, last update.
 * 
 * Response:
 * {
 *   "data": {
 *     "counts": { artists, divisions, engines },
 *     "engines": [ { slug, name, type, status } ],
 *     "health": {
 *       "api": "healthy",
 *       "database": "healthy",
 *       "roster_service": "healthy"
 *     }
 *   },
 *   "meta": { timestamp }
 * }
 */
router.get("/control-center/summary", async (req, res) => {
  try {
    const [artistCount, divisionCount, engineCount, activeEngines] = await Promise.all([
      Artist.countDocuments({}),
      Division.countDocuments({}),
      Engine.countDocuments({}),
      Engine.find({ status: "active" }),
    ]);

    // Simple health checks
    const health = {
      api: "healthy",
      database: "healthy", // If we get here, DB is up
      roster_service: artistCount > 0 ? "healthy" : "unavailable",
    };

    console.log(`[DMF API] Control center summary requested`);

    res.json({
      data: {
        counts: {
          artists: artistCount,
          divisions: divisionCount,
          engines: engineCount,
        },
        engines: activeEngines.map((e) => ({
          slug: e.slug,
          name: e.name,
          type: e.type,
          status: e.status,
        })),
        health,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[DMF API] /control-center/summary error:", err);
    res.status(500).json({
      error: "Failed to fetch control center summary",
      details: err.message,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }
});

module.exports = router;
