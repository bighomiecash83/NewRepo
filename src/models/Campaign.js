/**
 * Campaign Model
 * Represents a music marketing campaign (ad pack) designed by Ryia Boss
 * Monetizable service: Generate ad campaigns for YouTube, Instagram, TikTok, Spotify, Google Display
 */

const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema(
  {
    // Artist & Track Info
    artist_name: {
      type: String,
      required: true,
      index: true
    },
    artist_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      sparse: true
    },

    track_title: {
      type: String,
      required: true,
      index: true
    },
    track_link: {
      type: String,
      sparse: true
    },

    // Campaign Configuration
    platforms: [
      {
        type: String,
        enum: ["youtube", "instagram", "tiktok", "spotify", "google_display"]
      }
    ],
    budget_usd: {
      type: Number,
      required: true,
      min: 0
    },
    goal: {
      type: String,
      enum: ["streams", "followers", "pre_saves", "playlist_adds"],
      default: "streams"
    },
    geo: {
      type: String,
      default: "US",
      index: true
    },

    // Generated Assets (from Ryia)
    assets: {
      youtube_ads: [
        {
          primary_hook: String,
          video_script: String,
          duration_seconds: Number,
          call_to_action: String,
          audience_targeting: mongoose.Schema.Types.Mixed,
          placement_notes: String
        }
      ],
      instagram_reels: [
        {
          primary_hook: String,
          video_script: String,
          duration_seconds: Number,
          trending_audio: String,
          hashtag_set: [String],
          audience_targeting: mongoose.Schema.Types.Mixed
        }
      ],
      tiktok_ads: [
        {
          primary_hook: String,
          script: String,
          trending_sounds: [String],
          hashtags: [String],
          challenge_idea: String,
          audience_targeting: mongoose.Schema.Types.Mixed
        }
      ],
      spotify_audio_ads: [
        {
          ad_copy: String,
          cta_script: String,
          audio_placement: String,
          targeting: mongoose.Schema.Types.Mixed
        }
      ],
      google_display: [
        {
          ad_copy: String,
          thumbnail_prompt: String,
          targeting_keywords: [String],
          audience_segments: [String]
        }
      ],
      thumbnail_prompts: [String],
      hashtag_sets: [String],
      funnel_notes: String, // Full generated campaign narrative
      rigged_score: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      }
    },

    // Tier & Pricing
    tier: {
      type: String,
      enum: ["starter", "pro", "elite", "empire"],
      default: "starter",
      index: true
    },
    price_usd: {
      type: Number,
      default: 25
    },

    // Ownership & Status
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["draft", "ready", "sent_to_artist", "active", "archived"],
      default: "draft",
      index: true
    },

    // Anti-Fraud & Compliance
    compliance: {
      verified_real_streams: {
        type: Boolean,
        default: false
      },
      anti_bot_checks_passed: {
        type: Boolean,
        default: false
      },
      platform_approval_status: {
        youtube: String,
        instagram: String,
        tiktok: String,
        spotify: String,
        google_display: String
      }
    },

    // Analytics & Performance (filled after campaign runs)
    performance: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      spend_usd: { type: Number, default: 0 },
      streams_attributed: { type: Number, default: 0 },
      cpm: { type: Number, default: 0 },
      cpc: { type: Number, default: 0 },
      cost_per_stream: { type: Number, default: 0 }
    },

    // Campaign History
    created_at: {
      type: Date,
      default: Date.now,
      index: true
    },
    sent_to_artist_at: Date,
    activated_at: Date,
    archived_at: Date
  },
  { timestamps: true }
);

// Index for common queries
CampaignSchema.index({ owner_id: 1, status: 1 });
CampaignSchema.index({ artist_id: 1, tier: 1 });
CampaignSchema.index({ created_at: -1 });

const Campaign = mongoose.model("Campaign", CampaignSchema);

module.exports = { Campaign };
