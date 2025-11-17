using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace dmf_music_platform.Web.Domain.Config
{
    public class DmfPricingConfig
    {
        [JsonPropertyName("dmf_pricing_config_version")] public string Version { get; set; } = string.Empty;
        [JsonPropertyName("currency")] public string Currency { get; set; } = "USD";
        [JsonPropertyName("label")] public LabelConfig Label { get; set; } = new();
        [JsonPropertyName("distribution")] public Dictionary<string, DistributionTier> Distribution { get; set; } = new();
        [JsonPropertyName("catalog_migration")] public Dictionary<string, CatalogMigrationTier> CatalogMigration { get; set; } = new();
        [JsonPropertyName("growth_partnership")] public GrowthPartnershipConfig GrowthPartnership { get; set; } = new();
        [JsonPropertyName("boost_packages")] public BoostPackagesConfig BoostPackages { get; set; } = new();
        [JsonPropertyName("industry_products")] public IndustryProductsConfig IndustryProducts { get; set; } = new();
        [JsonPropertyName("payoutTiers")] public List<PayoutTierConfig> PayoutTiers { get; set; } = new();
    }

    public class LabelConfig
    {
        [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
        [JsonPropertyName("short_name")] public string ShortName { get; set; } = string.Empty;
        [JsonPropertyName("ownership_model")] public string OwnershipModel { get; set; } = string.Empty;
        [JsonPropertyName("growth_philosophy")] public string GrowthPhilosophy { get; set; } = string.Empty;
    }

    public class DistributionTier
    {
        [JsonPropertyName("type")] public string Type { get; set; } = string.Empty;
        [JsonPropertyName("price")] public decimal Price { get; set; }
        [JsonPropertyName("min_tracks")] public int? MinTracks { get; set; }
        [JsonPropertyName("max_tracks")] public int? MaxTracks { get; set; }
        [JsonPropertyName("includes")] public List<string>? Includes { get; set; }
    }

    public class CatalogMigrationTier
    {
        [JsonPropertyName("price")] public decimal Price { get; set; }
        [JsonPropertyName("min_tracks")] public int? MinTracks { get; set; }
        [JsonPropertyName("max_tracks")] public int? MaxTracks { get; set; }
    }

    public class GrowthPartnershipConfig
    {
        [JsonPropertyName("enabled")] public bool Enabled { get; set; }
        [JsonPropertyName("dmf_share_percent")] public int DmfSharePercent { get; set; }
        [JsonPropertyName("artist_share_percent")] public int ArtistSharePercent { get; set; }
        [JsonPropertyName("applies_to")] public List<string> AppliesTo { get; set; } = new();
    }

    public class BoostPackagesConfig
    {
        [JsonPropertyName("ads")] public List<AdsBoostTier> Ads { get; set; } = new();
        [JsonPropertyName("playlist")] public List<PlaylistBoostTier> Playlist { get; set; } = new();
    }

    public class AdsBoostTier
    {
        [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
        [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
        [JsonPropertyName("price")] public decimal Price { get; set; }
        [JsonPropertyName("estimated_views_min")] public int EstimatedViewsMin { get; set; }
        [JsonPropertyName("estimated_views_max")] public int EstimatedViewsMax { get; set; }
        [JsonPropertyName("channels")] public List<string> Channels { get; set; } = new();
    }

    public class PlaylistBoostTier
    {
        [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
        [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
        [JsonPropertyName("price")] public decimal Price { get; set; }
        [JsonPropertyName("min_playlists")] public int MinPlaylists { get; set; }
        [JsonPropertyName("max_playlists")] public int MaxPlaylists { get; set; }
    }

    public class IndustryProductsConfig
    {
    }

    public class PayoutTierConfig
    {
        [JsonPropertyName("code")] public string Code { get; set; } = string.Empty;
        [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
        [JsonPropertyName("description")] public string Description { get; set; } = string.Empty;
        [JsonPropertyName("artistSharePercent")] public decimal ArtistSharePercent { get; set; }
        [JsonPropertyName("dmfSharePercent")] public decimal DmfSharePercent { get; set; }
        [JsonPropertyName("labelSharePercent")] public decimal? LabelSharePercent { get; set; }
    }
}
