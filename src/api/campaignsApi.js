/**
 * Campaigns API
 * Monetizable service: Generate ad campaigns ($25–$999 per campaign)
 * Endpoints for internal (OWNER/ADMIN) + customer portal
 */

const express = require("express");
const router = express.Router();

const { Campaign } = require("../models/Campaign");
const { generateCampaignAssets, getTierInfo } = require("../services/campaignService");
const { requirePermission, requireRole } = require("../middleware/streamgod-auth");

/**
 * POST /api/campaigns/generate
 * Generate a new campaign pack (OWNER/ADMIN internal use)
 */
router.post("/generate", requireRole("OWNER", "ADMIN"), async (req, res) => {
  try {
    const {
      artist_name,
      track_title,
      track_link,
      platforms = ["youtube", "instagram", "tiktok"],
      budget_usd = 50,
      goal = "streams",
      geo = "US",
      tier = "starter"
    } = req.body || {};

    // Validation
    if (!artist_name || !track_title) {
      return res.status(400).json({
        error: "Bad Request",
        message: "artist_name and track_title are required"
      });
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "platforms must be a non-empty array"
      });
    }

    const tierInfo = getTierInfo(tier);
    const safePrice = tierInfo.price;

    console.log(`[Campaigns API] Generating ${tier} campaign for ${artist_name} - ${track_title}`);
    console.log(`[Campaigns API] Owner: ${req.user.id}, Budget: $${budget_usd}, Platforms: ${platforms.join(", ")}`);

    // Generate the campaign pack using Ryia Boss
    const campaignResult = await generateCampaignAssets({
      artist_name,
      track_title,
      track_link,
      platforms,
      budget_usd,
      goal,
      geo,
      tier
    });

    // Save to database
    const campaign = await Campaign.create({
      artist_name,
      track_title,
      track_link,
      platforms,
      budget_usd,
      goal,
      geo,
      tier,
      price_usd: safePrice,
      owner_id: req.user.id,
      assets: {
        funnel_notes: campaignResult.text,
        youtube_ads: [],
        instagram_reels: [],
        tiktok_ads: [],
        spotify_audio_ads: [],
        google_display: []
      },
      status: "ready"
    });

    res.json({
      data: campaign,
      meta: {
        model: campaignResult.model,
        tier_info: tierInfo,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error("[Campaigns API] /generate error:", err);
    res.status(500).json({
      error: "Failed to generate campaign",
      message: err.message
    });
  }
});

/**
 * GET /api/campaigns
 * List all campaigns (OWNER/ADMIN)
 */
router.get("/", requireRole("OWNER", "ADMIN"), async (req, res) => {
  try {
    const { status, tier, limit = 50, skip = 0 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (tier) filter.tier = tier;

    const campaigns = await Campaign.find(filter)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Campaign.countDocuments(filter);

    res.json({
      data: campaigns,
      meta: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        count: campaigns.length
      }
    });
  } catch (err) {
    console.error("[Campaigns API] /campaigns error:", err);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

/**
 * GET /api/campaigns/:id
 * Get single campaign details
 */
router.get("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Check ownership or OWNER/ADMIN override
    if (
      campaign.owner_id.toString() !== req.user?.id &&
      !["OWNER", "ADMIN"].includes(req.user?.role)
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ data: campaign });
  } catch (err) {
    console.error("[Campaigns API] /:id error:", err);
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
});

/**
 * PATCH /api/campaigns/:id
 * Update campaign status (send to artist, activate, etc.)
 */
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body || {};

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Ownership check
    if (
      campaign.owner_id.toString() !== req.user?.id &&
      !["OWNER", "ADMIN"].includes(req.user?.role)
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (status) {
      campaign.status = status;

      if (status === "sent_to_artist") {
        campaign.sent_to_artist_at = new Date();
      } else if (status === "active") {
        campaign.activated_at = new Date();
      } else if (status === "archived") {
        campaign.archived_at = new Date();
      }
    }

    await campaign.save();

    res.json({ data: campaign });
  } catch (err) {
    console.error("[Campaigns API] PATCH /:id error:", err);
    res.status(500).json({ error: "Failed to update campaign" });
  }
});

/**
 * GET /api/campaigns/stats/summary
 * Campaign summary stats (OWNER/ADMIN dashboard)
 */
router.get("/stats/summary", requireRole("OWNER", "ADMIN"), async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments();
    const byCampaign = await Campaign.countDocuments({
      status: { $ne: "draft" }
    });
    const byTier = await Campaign.aggregate([
      {
        $group: {
          _id: "$tier",
          count: { $sum: 1 },
          total_revenue: { $sum: "$price_usd" }
        }
      }
    ]);

    const totalRevenue = byTier.reduce((a, b) => a + (b.total_revenue || 0), 0);

    res.json({
      data: {
        total_campaigns: totalCampaigns,
        active_campaigns: byCampaign,
        by_tier: byTier,
        total_revenue_usd: totalRevenue
      }
    });
  } catch (err) {
    console.error("[Campaigns API] /stats/summary error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/**
 * POST /api/campaigns/:id/send-to-artist
 * Notify artist about their campaign pack
 * (Later: email integration)
 */
router.post("/:id/send-to-artist", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    campaign.status = "sent_to_artist";
    campaign.sent_to_artist_at = new Date();
    await campaign.save();

    // TODO: Send email to artist with campaign details
    // TODO: Create shareable link or portal view

    res.json({
      data: campaign,
      meta: {
        message: "Campaign sent to artist (email pending implementation)"
      }
    });
  } catch (err) {
    console.error("[Campaigns API] /send-to-artist error:", err);
    res.status(500).json({ error: "Failed to send campaign to artist" });
  }
});

module.exports = router;
