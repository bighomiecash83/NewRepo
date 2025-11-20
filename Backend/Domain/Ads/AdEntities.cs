using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DmfMusicPlatform.StreamGod.Ads
{
    // ---------- ENUMS ----------

    public enum AdDivision
    {
        AudienceIntel,
        CreativeLab,
        PlatformCommander,
        FunnelOffer,
        BudgetOptimizer,
        Analytics,
        Community,
        Compliance
    }

    public enum AdPlatform
    {
        Unknown,
        YouTube,
        Meta,       // Facebook + Instagram
        TikTok,
        Google,
        Display,
        All
    }

    public enum AdBotStatus
    {
        Active,
        Paused,
        Retired
    }

    public enum AdCampaignStatus
    {
        Draft,
        Active,
        Paused,
        Completed
    }

    public enum AdCreativeStatus
    {
        Draft,
        Active,
        Paused,
        Archived
    }

    public enum AdPolicySeverity
    {
        Low,
        Medium,
        High
    }

    public enum AdBotRunStatus
    {
        Completed,
        Failed,
        Partial
    }

    public enum AdBotActionType
    {
        RecommendScale,
        RecommendPause,
        RecommendDuplicateToNewAudience,
        RecommendNewCreative,
        RecommendBudgetCut
    }

    public enum AdFlagType
    {
        PolicyRisk,
        BrandRisk,
        PerformanceIssue
    }

    // ---------- AD BOT ----------

    [BsonIgnoreExtraElements]
    public class AdBot
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = string.Empty; // e.g. "bot_YT_SHORTS_SCALER_0237"

        public string BotKey { get; set; } = string.Empty; // Duplicate human-readable key

        public string Name { get; set; } = string.Empty;

        public AdDivision Division { get; set; }

        public string Role { get; set; } = string.Empty; // e.g. "youtube_shorts_scaler"

        public AdPlatform Platform { get; set; } = AdPlatform.Unknown;

        public AdBotStatus Status { get; set; } = AdBotStatus.Active;

        /// <summary>
        /// 1–10, higher = more critical for scheduling.
        /// </summary>
        public int Priority { get; set; } = 5;

        public List<string> AssignedArtistIds { get; set; } = new();

        public string? AssignedLabelId { get; set; }

        public string? PlaybookVersion { get; set; }

        public string? CurrentPlaybookId { get; set; }

        public DateTime? LastRunAt { get; set; }

        public DateTime? NextRunAfter { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // ---------- AD PLAYBOOK ----------

    [BsonIgnoreExtraElements]
    public class AdPlaybook
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = string.Empty; // e.g. "playbook_youtube_shorts_music_v1"

        public string Name { get; set; } = string.Empty;

        public string Version { get; set; } = "v1.0";

        public AdPlatform Platform { get; set; } = AdPlatform.Unknown;

        public AdDivision Division { get; set; } = AdDivision.PlatformCommander;

        /// <summary>
        /// Roles this playbook applies to (e.g. "youtube_shorts_scaler").
        /// </summary>
        public List<string> Roles { get; set; } = new();

        /// <summary>
        /// High-level goals ("maximize_watch_time", etc.).
        /// </summary>
        public List<string> Objectives { get; set; } = new();

        public AdPlaybookKpis? Kpis { get; set; }

        public List<AdPlaybookTactic> Tactics { get; set; } = new();

        public List<string> ComplianceRules { get; set; } = new();

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class AdPlaybookKpis
    {
        public decimal? TargetCpvUsd { get; set; }

        public double? MinWatchPercent { get; set; }

        public double? MinCtrPercent { get; set; }
    }

    public class AdPlaybookTactic
    {
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public List<string> Steps { get; set; } = new();
    }

    // ---------- AD CAMPAIGN ----------

    [BsonIgnoreExtraElements]
    public class AdCampaign
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = string.Empty; // e.g. "camp_freezzo_single_nov2025_youtube"

        public string ArtistId { get; set; } = string.Empty;

        public string? LabelId { get; set; }

        public string Name { get; set; } = string.Empty;

        public AdPlatform Platform { get; set; } = AdPlatform.Unknown;

        /// <summary>
        /// e.g. "views_music_video", "awareness", "conversions".
        /// </summary>
        public string Objective { get; set; } = string.Empty;

        public AdCampaignStatus Status { get; set; } = AdCampaignStatus.Draft;

        public List<string> TargetCountries { get; set; } = new();

        public List<string> TargetCities { get; set; } = new();

        public int? AgeMin { get; set; }

        public int? AgeMax { get; set; }

        public string Gender { get; set; } = "all"; // all | male | female | other

        public decimal BudgetTotalUsd { get; set; }

        public decimal BudgetDailyCapUsd { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        /// <summary>
        /// ID from platform (Google Ads, Meta, TikTok, etc.).
        /// </summary>
        public string? PlatformCampaignId { get; set; }

        public string? LinkedPlaybookId { get; set; }

        public string? CreatedByUserId { get; set; }

        /// <summary>
        /// If true, StreamGod is allowed to automatically scale or cut daily budget based on bot recommendations.
        /// </summary>
        public bool AllowAutoBudgetAdjustments { get; set; } = false;

        /// <summary>
        /// If true, StreamGod is allowed to automatically pause campaigns when bots recommend it.
        /// </summary>
        public bool AllowAutoPause { get; set; } = false;

        /// <summary>
        /// Optional current daily budget field if you want separate from cap.
        /// If 0, the system uses BudgetDailyCapUsd as the working budget.
        /// </summary>
        public decimal CurrentDailyBudgetUsd { get; set; } = 0m;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // ---------- AD CREATIVE ----------

    [BsonIgnoreExtraElements]
    public class AdCreative
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = string.Empty; // e.g. "creative_freezzo_short_hookA_01"

        public string ArtistId { get; set; } = string.Empty;

        public string CampaignId { get; set; } = string.Empty;

        public AdPlatform Platform { get; set; } = AdPlatform.Unknown;

        /// <summary>
        /// e.g. "shorts_video", "in_stream", "reel", "tiktok", "banner".
        /// </summary>
        public string Type { get; set; } = string.Empty;

        public AdAssetRefs AssetRefs { get; set; } = new();

        public string Headline { get; set; } = string.Empty;

        public string PrimaryText { get; set; } = string.Empty;

        public string Cta { get; set; } = string.Empty;

        public List<string> Tags { get; set; } = new();

        public AdCreativeStatus Status { get; set; } = AdCreativeStatus.Draft;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class AdAssetRefs
    {
        public string? VideoUrl { get; set; }

        public string? ThumbnailUrl { get; set; }

        public string? ImageUrl { get; set; }

        public string? AudioUrl { get; set; }
    }

    // ---------- AD METRICS DAILY ----------

    [BsonIgnoreExtraElements]
    public class AdMetricDaily
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = string.Empty; // e.g. "metric_freezzo_short_hookA_2025-11-18"

        public string ArtistId { get; set; } = string.Empty;

        public string CampaignId { get; set; } = string.Empty;

        public string CreativeId { get; set; } = string.Empty;

        public AdPlatform Platform { get; set; } = AdPlatform.Unknown;

        public DateTime Date { get; set; } // store date at UTC midnight

        public string Currency { get; set; } = "USD";

        public decimal SpendUsd { get; set; }

        public long Impressions { get; set; }

        public long Views { get; set; }

        public long Clicks { get; set; }

        public long Conversions { get; set; }

        public double AvgWatchPercent { get; set; }

        public double CtrPercent { get; set; }

        public decimal CpvUsd { get; set; }

        public decimal CpcUsd { get; set; }

        public long StreamsEstimated { get; set; }

        public int SubscribersGained { get; set; }

        public string DataSource { get; set; } = string.Empty; // e.g. "google_ads_api"

        public DateTime ImportedAt { get; set; } = DateTime.UtcNow;
    }

    // ---------- AD BOT RUN ----------

    [BsonIgnoreExtraElements]
    public class AdBotRun
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = string.Empty; // e.g. "run_bot_..._2025-11-19T02:00:00Z"

        public string BotId { get; set; } = string.Empty;

        public string? PlaybookId { get; set; }

        public List<string> ArtistIds { get; set; } = new();

        public AdPlatform Platform { get; set; } = AdPlatform.Unknown;

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        public DateTime FinishedAt { get; set; } = DateTime.UtcNow;

        public List<AdBotAction> Actions { get; set; } = new();

        public AdBotRunStatus Status { get; set; } = AdBotRunStatus.Completed;

        public List<string> Errors { get; set; } = new();
    }

    public class AdBotAction
    {
        public AdBotActionType Type { get; set; }

        public string? CampaignId { get; set; }

        public string? CreativeId { get; set; }

        public string Reason { get; set; } = string.Empty;

        public int? SuggestedBudgetIncreasePercent { get; set; }

        public int? SuggestedBudgetCutPercent { get; set; }
    }

    // ---------- AD POLICY FLAG ----------

    [BsonIgnoreExtraElements]
    public class AdPolicyFlag
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = string.Empty; // e.g. "flag_creative_..._2025-11-18"

        public string ArtistId { get; set; } = string.Empty;

        public string CampaignId { get; set; } = string.Empty;

        public string CreativeId { get; set; } = string.Empty;

        public AdPlatform Platform { get; set; } = AdPlatform.Unknown;

        public AdFlagType FlagType { get; set; } = AdFlagType.PolicyRisk;

        public AdPolicySeverity Severity { get; set; } = AdPolicySeverity.Medium;

        public List<string> RulesTriggered { get; set; } = new();

        public string Message { get; set; } = string.Empty;

        public DateTime DetectedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ResolvedAt { get; set; }

        public string? ResolvedByUserId { get; set; }

        public string? ResolutionNote { get; set; }
    }
}
