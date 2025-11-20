using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace DMF.Models.AdBots
{
    /// <summary>
    /// Represents a bot in the ad automation system.
    /// One document per bot (up to 10,000+).
    /// </summary>
    [BsonCollection("ad_bots")]
    public class AdBot
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; }

        [BsonElement("bot_key")]
        public string BotKey { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("division")]
        [BsonRepresentation(BsonType.String)]
        public BotDivision Division { get; set; }

        [BsonElement("role")]
        public string Role { get; set; }

        [BsonElement("platform")]
        public string Platform { get; set; }

        [BsonElement("status")]
        [BsonRepresentation(BsonType.String)]
        public BotStatus Status { get; set; }

        [BsonElement("priority")]
        public int Priority { get; set; } // 1–10, higher = more critical

        [BsonElement("assigned_artist_ids")]
        public List<string> AssignedArtistIds { get; set; }

        [BsonElement("assigned_label_id")]
        public string AssignedLabelId { get; set; }

        [BsonElement("playbook_version")]
        public string PlaybookVersion { get; set; }

        [BsonElement("current_playbook_id")]
        public string CurrentPlaybookId { get; set; }

        [BsonElement("last_run_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? LastRunAt { get; set; }

        [BsonElement("next_run_after")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? NextRunAfter { get; set; }

        [BsonElement("created_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; }

        [BsonElement("updated_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// Defines what a bot is supposed to do – the rules and logic.
    /// </summary>
    [BsonCollection("ad_playbooks")]
    public class AdPlaybook
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("version")]
        public string Version { get; set; }

        [BsonElement("platform")]
        public string Platform { get; set; }

        [BsonElement("division")]
        [BsonRepresentation(BsonType.String)]
        public BotDivision Division { get; set; }

        [BsonElement("roles")]
        public List<string> Roles { get; set; }

        [BsonElement("objectives")]
        public List<string> Objectives { get; set; }

        [BsonElement("kpis")]
        public PlaybookKpis Kpis { get; set; }

        [BsonElement("tactics")]
        public List<Tactic> Tactics { get; set; }

        [BsonElement("compliance_rules")]
        public List<string> ComplianceRules { get; set; }

        [BsonElement("created_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; }

        [BsonElement("updated_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; }

        [BsonElement("is_active")]
        public bool IsActive { get; set; }
    }

    public class PlaybookKpis
    {
        [BsonElement("target_cpv_usd")]
        public decimal? TargetCpvUsd { get; set; }

        [BsonElement("min_watch_percent")]
        public decimal? MinWatchPercent { get; set; }

        [BsonElement("min_ctr_percent")]
        public decimal? MinCtrPercent { get; set; }
    }

    public class Tactic
    {
        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("description")]
        public string Description { get; set; }

        [BsonElement("steps")]
        public List<string> Steps { get; set; }
    }

    /// <summary>
    /// High-level campaign object tied to an artist and a goal.
    /// </summary>
    [BsonCollection("ad_campaigns")]
    public class AdCampaign
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; }

        [BsonElement("artist_id")]
        public string ArtistId { get; set; }

        [BsonElement("label_id")]
        public string LabelId { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("platform")]
        public string Platform { get; set; }

        [BsonElement("objective")]
        public string Objective { get; set; } // views_music_video, awareness, conversions, list_build, etc.

        [BsonElement("status")]
        [BsonRepresentation(BsonType.String)]
        public CampaignStatus Status { get; set; }

        [BsonElement("target_countries")]
        public List<string> TargetCountries { get; set; }

        [BsonElement("target_cities")]
        public List<string> TargetCities { get; set; }

        [BsonElement("age_range")]
        public List<int> AgeRange { get; set; } // [min, max]

        [BsonElement("gender")]
        public string Gender { get; set; } // "all", "male", "female"

        [BsonElement("budget_total_usd")]
        public decimal BudgetTotalUsd { get; set; }

        [BsonElement("budget_daily_cap_usd")]
        public decimal BudgetDailyCapUsd { get; set; }

        [BsonElement("start_date")]
        public string StartDate { get; set; } // YYYY-MM-DD

        [BsonElement("end_date")]
        public string EndDate { get; set; }

        [BsonElement("platform_campaign_id")]
        public string PlatformCampaignId { get; set; }

        [BsonElement("linked_playbook_id")]
        public string LinkedPlaybookId { get; set; }

        [BsonElement("created_by_user_id")]
        public string CreatedByUserId { get; set; }

        [BsonElement("created_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; }

        [BsonElement("updated_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// Stores the actual ad assets and variants.
    /// </summary>
    [BsonCollection("ad_creatives")]
    public class AdCreative
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; }

        [BsonElement("artist_id")]
        public string ArtistId { get; set; }

        [BsonElement("campaign_id")]
        public string CampaignId { get; set; }

        [BsonElement("platform")]
        public string Platform { get; set; }

        [BsonElement("type")]
        public string Type { get; set; } // shorts_video, in_stream, reel, tiktok, banner, etc.

        [BsonElement("asset_refs")]
        public AssetRefs AssetRefs { get; set; }

        [BsonElement("headline")]
        public string Headline { get; set; }

        [BsonElement("primary_text")]
        public string PrimaryText { get; set; }

        [BsonElement("cta")]
        public string Cta { get; set; } // WATCH_NOW, LISTEN_NOW, etc.

        [BsonElement("tags")]
        public List<string> Tags { get; set; }

        [BsonElement("status")]
        [BsonRepresentation(BsonType.String)]
        public CreativeStatus Status { get; set; }

        [BsonElement("created_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; }

        [BsonElement("updated_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; }
    }

    public class AssetRefs
    {
        [BsonElement("video_url")]
        public string VideoUrl { get; set; }

        [BsonElement("thumbnail_url")]
        public string ThumbnailUrl { get; set; }
    }

    /// <summary>
    /// Aggregated performance per day per creative/adset/campaign.
    /// This is where bots learn from.
    /// </summary>
    [BsonCollection("ad_metrics_daily")]
    public class AdMetricsDaily
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; }

        [BsonElement("artist_id")]
        public string ArtistId { get; set; }

        [BsonElement("campaign_id")]
        public string CampaignId { get; set; }

        [BsonElement("creative_id")]
        public string CreativeId { get; set; }

        [BsonElement("platform")]
        public string Platform { get; set; }

        [BsonElement("date")]
        public string Date { get; set; } // YYYY-MM-DD

        [BsonElement("currency")]
        public string Currency { get; set; } // "USD"

        [BsonElement("spend_usd")]
        public decimal SpendUsd { get; set; }

        [BsonElement("impressions")]
        public long Impressions { get; set; }

        [BsonElement("views")]
        public long Views { get; set; }

        [BsonElement("clicks")]
        public long Clicks { get; set; }

        [BsonElement("conversions")]
        public long Conversions { get; set; }

        [BsonElement("avg_watch_percent")]
        public decimal AvgWatchPercent { get; set; }

        [BsonElement("ctr_percent")]
        public decimal CtrPercent { get; set; }

        [BsonElement("cpv_usd")]
        public decimal CpvUsd { get; set; }

        [BsonElement("cpc_usd")]
        public decimal CpcUsd { get; set; }

        [BsonElement("streams_estimated")]
        public long StreamsEstimated { get; set; }

        [BsonElement("subscribers_gained")]
        public long SubscribersGained { get; set; }

        [BsonElement("data_source")]
        public string DataSource { get; set; }

        [BsonElement("imported_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime ImportedAt { get; set; }
    }

    /// <summary>
    /// Logs what each bot actually did every run.
    /// For auditing, debugging, and training.
    /// </summary>
    [BsonCollection("ad_bot_runs")]
    public class AdBotRun
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; }

        [BsonElement("bot_id")]
        public string BotId { get; set; }

        [BsonElement("playbook_id")]
        public string PlaybookId { get; set; }

        [BsonElement("artist_ids")]
        public List<string> ArtistIds { get; set; }

        [BsonElement("platform")]
        public string Platform { get; set; }

        [BsonElement("started_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime StartedAt { get; set; }

        [BsonElement("finished_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? FinishedAt { get; set; }

        [BsonElement("actions")]
        public List<BotAction> Actions { get; set; }

        [BsonElement("status")]
        [BsonRepresentation(BsonType.String)]
        public BotRunStatus Status { get; set; }

        [BsonElement("errors")]
        public List<string> Errors { get; set; }
    }

    public class BotAction
    {
        [BsonElement("type")]
        public string Type { get; set; } // recommend_scale, recommend_pause, recommend_duplicate_to_new_audience

        [BsonElement("campaign_id")]
        public string CampaignId { get; set; }

        [BsonElement("creative_id")]
        public string CreativeId { get; set; }

        [BsonElement("reason")]
        public string Reason { get; set; }

        [BsonElement("suggested_budget_increase_percent")]
        public decimal? SuggestedBudgetIncreasePercent { get; set; }
    }

    /// <summary>
    /// Keeps you safe: if any creative/campaign looks risky, bots log it here.
    /// </summary>
    [BsonCollection("ad_policy_flags")]
    public class AdPolicyFlag
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; }

        [BsonElement("artist_id")]
        public string ArtistId { get; set; }

        [BsonElement("campaign_id")]
        public string CampaignId { get; set; }

        [BsonElement("creative_id")]
        public string CreativeId { get; set; }

        [BsonElement("platform")]
        public string Platform { get; set; }

        [BsonElement("flag_type")]
        public string FlagType { get; set; } // policy_risk, compliance_issue, etc.

        [BsonElement("severity")]
        [BsonRepresentation(BsonType.String)]
        public FlagSeverity Severity { get; set; }

        [BsonElement("rules_triggered")]
        public List<string> RulesTriggered { get; set; }

        [BsonElement("message")]
        public string Message { get; set; }

        [BsonElement("detected_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime DetectedAt { get; set; }

        [BsonElement("resolved_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? ResolvedAt { get; set; }

        [BsonElement("resolved_by_user_id")]
        public string ResolvedByUserId { get; set; }

        [BsonElement("resolution_note")]
        public string ResolutionNote { get; set; }
    }

    // Enums
    public enum BotDivision
    {
        [BsonRepresentation(BsonType.String)]
        audience_intel,
        creative_lab,
        platform_commander,
        funnel_offer,
        budget_optimizer,
        analytics,
        community,
        compliance
    }

    public enum BotStatus
    {
        [BsonRepresentation(BsonType.String)]
        active,
        paused,
        retired
    }

    public enum CampaignStatus
    {
        [BsonRepresentation(BsonType.String)]
        draft,
        active,
        paused,
        completed
    }

    public enum CreativeStatus
    {
        [BsonRepresentation(BsonType.String)]
        active,
        paused,
        archived
    }

    public enum BotRunStatus
    {
        [BsonRepresentation(BsonType.String)]
        running,
        completed,
        failed
    }

    public enum FlagSeverity
    {
        [BsonRepresentation(BsonType.String)]
        low,
        medium,
        high
    }
}
