using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace dmf_music_platform.Web.Models;

/// <summary>
/// Pricing plan stored in MongoDB.
/// Supports distribution, marketing, legal, and bundle tiers.
/// </summary>
[BsonIgnoreExtraElements]
public class PricingPlan
{
    [BsonId]
    public ObjectId Id { get; set; }

    /// <summary>Unique machine-readable identifier (e.g., "dmf-distribution-core").</summary>
    [BsonElement("planId")]
    public string PlanId { get; set; } = string.Empty;

    /// <summary>Human-friendly name to show in the UI.</summary>
    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>High-level bucket (Distribution, Marketing, Legal, Bundle, etc.).</summary>
    [BsonElement("category")]
    public string Category { get; set; } = string.Empty;

    /// <summary>Recurring monthly price in USD.</summary>
    [BsonElement("monthlyPriceUsd")]
    public decimal MonthlyPriceUsd { get; set; }

    /// <summary>One-time setup or onboarding fee in USD.</summary>
    [BsonElement("setupFeeUsd")]
    public decimal SetupFeeUsd { get; set; }

    /// <summary>Short description you can show under the plan title.</summary>
    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    /// <summary>Bullet-point list of features for the frontend.</summary>
    [BsonElement("features")]
    public List<string> Features { get; set; } = new();

    /// <summary>ISO timestamp when the plan was created.</summary>
    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>ISO timestamp when the plan was last updated.</summary>
    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Whether this plan is available for purchase.</summary>
    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;
}
