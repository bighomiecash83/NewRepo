/**
 * Portal API Router
 * Customer-facing endpoints for artists, labels, investors
 * All data is scoped to the authenticated user's permissions
 */

const express = require("express");
const router = express.Router();

const { resolveUserPermissions } = require("../streamgod/brain");

// Stub models - replace with actual MongoDB models
const mockArtists = [
  {
    _id: "artist_001",
    name: "Big Homie Cash",
    stage_name: "Big Homie Cash",
    role: ["Founder", "CEO"],
    label: "DMF Records",
    imprint: "Fly Hoolie ENT",
    status: "active",
    verified: true,
    bio: "Founder and CEO of DMF Records",
  },
  {
    _id: "artist_002",
    name: "Freezzo",
    stage_name: "Freezzo",
    role: ["Co-founder"],
    label: "DMF Records",
    imprint: "Fly Hoolie ENT",
    status: "active",
    verified: true,
  },
  {
    _id: "artist_003",
    name: "OBMB Delo",
    stage_name: "OBMB Delo",
    role: ["Artist"],
    label: "DMF Records",
    imprint: "Fly Hoolie ENT",
    status: "active",
    verified: true,
  },
];

// ============================================================================
// GET /api/portal/me
// Returns authenticated user's profile + permissions
// ============================================================================
router.get("/me", (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const perms = resolveUserPermissions(req.user);

    res.json({
      data: {
        id: req.user.id,
        role: req.user.role,
        plan_key: req.user.plan_key,
        org_id: req.user.org_id || null,
        permissions: perms,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[DMF Portal] /me error:", err);
    res.status(500).json({ error: "Failed to load user profile" });
  }
});

// ============================================================================
// GET /api/portal/overview
// High-level dashboard metrics tailored to the user
// ============================================================================
router.get("/overview", (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Tailor metrics based on role
    let artistCount = 0;
    let releaseCount = 0;
    let streamEstimate = 0;

    if (req.user.role === "ARTIST") {
      // Artist sees themselves + their releases
      artistCount = 1;
      releaseCount = 0; // Placeholder for future
      streamEstimate = 0; // Placeholder for future
    } else if (req.user.role === "CLIENT" || req.user.role === "LABEL_MANAGER") {
      // Client/Label sees all artists under their account
      artistCount = mockArtists.length;
      releaseCount = 0; // Placeholder
      streamEstimate = 0; // Placeholder
    } else if (req.user.role === "INVESTOR") {
      // Investor sees high-level overview
      artistCount = mockArtists.length;
      releaseCount = 0; // Placeholder
      streamEstimate = 0; // Placeholder
    }

    res.json({
      data: {
        artist_count: artistCount,
        release_count: releaseCount,
        stream_estimate: streamEstimate,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[DMF Portal] /overview error:", err);
    res.status(500).json({ error: "Failed to load overview" });
  }
});

// ============================================================================
// GET /api/portal/roster
// Roster scoped to user's permissions
// Artists see themselves, clients see their roster, etc.
// ============================================================================
router.get("/roster", (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let filteredArtists = [];

    if (req.user.role === "ARTIST") {
      // Artist sees only themselves
      // In real system, filter by req.user.artist_id or similar
      filteredArtists = mockArtists.filter((a) => a._id === "artist_001");
    } else if (
      req.user.role === "CLIENT" ||
      req.user.role === "LABEL_MANAGER"
    ) {
      // Client/Manager sees all artists (later filter by org_id)
      filteredArtists = mockArtists;
    } else if (req.user.role === "INVESTOR") {
      // Investor sees public info only
      filteredArtists = mockArtists.map((a) => ({
        _id: a._id,
        stage_name: a.stage_name,
        status: a.status,
        verified: a.verified,
        // Hide sensitive fields
      }));
    } else {
      // Default: show public artists
      filteredArtists = mockArtists.filter((a) => a.status === "active");
    }

    res.json({
      data: filteredArtists,
      meta: {
        count: filteredArtists.length,
        role: req.user.role,
      },
    });
  } catch (err) {
    console.error("[DMF Portal] /roster error:", err);
    res.status(500).json({ error: "Failed to load roster" });
  }
});

// ============================================================================
// GET /api/portal/analytics
// Analytics dashboard placeholder (scoped to user)
// ============================================================================
router.get("/analytics", (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const perms = resolveUserPermissions(req.user);

    // Check if user has analytics permission
    const canViewAnalytics = perms.includes("analytics:read") ||
      perms.includes("analytics:*") ||
      perms.includes("*");

    if (!canViewAnalytics) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to view analytics",
      });
    }

    res.json({
      data: {
        streams: {
          total: 0,
          last_30_days: 0,
          trend: "neutral",
        },
        territories: [],
        playlists: [],
        revenue: {
          total: 0,
          last_30_days: 0,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        role: req.user.role,
        message: "Analytics data placeholder - real data coming soon",
      },
    });
  } catch (err) {
    console.error("[DMF Portal] /analytics error:", err);
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

// ============================================================================
// GET /api/portal/distribution
// Distribution status for submitted releases
// ============================================================================
router.get("/distribution", (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const perms = resolveUserPermissions(req.user);

    // Check if user has distribution permission
    const canViewDistribution = perms.includes("releases:read") ||
      perms.includes("distribution:*") ||
      perms.includes("*");

    if (!canViewDistribution) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to view distribution status",
      });
    }

    res.json({
      data: {
        releases: [],
        pending: 0,
        live: 0,
        rejected: 0,
      },
      meta: {
        timestamp: new Date().toISOString(),
        role: req.user.role,
        message: "Distribution workflow coming soon",
      },
    });
  } catch (err) {
    console.error("[DMF Portal] /distribution error:", err);
    res.status(500).json({ error: "Failed to load distribution" });
  }
});

// ============================================================================
// POST /api/portal/support
// Submit support ticket (available to all portal users)
// ============================================================================
router.post("/support", (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        error: "Bad Request",
        message: "subject and message are required",
      });
    }

    // Stub: in real system, save to database
    const ticketId = "ticket_" + Date.now();

    console.log(
      `[DMF Portal] Support ticket ${ticketId} from user ${req.user.id}: ${subject}`
    );

    res.json({
      data: {
        ticket_id: ticketId,
        status: "open",
        created_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[DMF Portal] /support error:", err);
    res.status(500).json({ error: "Failed to create support ticket" });
  }
});

module.exports = router;
