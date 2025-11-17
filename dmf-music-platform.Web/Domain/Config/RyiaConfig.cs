using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace dmf_music_platform.Web.Domain.Config
{
    public class RyiaConfig
    {
        [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
        [JsonPropertyName("short_name")] public string ShortName { get; set; } = string.Empty;
        [JsonPropertyName("role")] public string Role { get; set; } = string.Empty;
        [JsonPropertyName("owner")] public string Owner { get; set; } = string.Empty;
        [JsonPropertyName("core_purpose")] public List<string> CorePurpose { get; set; } = new();
        [JsonPropertyName("personality")] public RyiaPersonality Personality { get; set; } = new();
        [JsonPropertyName("capabilities")] public RyiaCapabilities Capabilities { get; set; } = new();
        [JsonPropertyName("constraints")] public RyiaConstraints Constraints { get; set; } = new();
    }

    public class RyiaPersonality
    {
        [JsonPropertyName("style")] public string Style { get; set; } = string.Empty;
        [JsonPropertyName("loyalty")] public string Loyalty { get; set; } = string.Empty;
        [JsonPropertyName("values")] public List<string> Values { get; set; } = new();
    }

    public class RyiaCapabilities
    {
        [JsonPropertyName("languages")] public List<string> Languages { get; set; } = new();
        [JsonPropertyName("domains")] public List<string> Domains { get; set; } = new();
    }

    public class RyiaConstraints
    {
        [JsonPropertyName("must_follow_pricing_config")] public bool MustFollowPricingConfig { get; set; }
        [JsonPropertyName("must_respect_growth_partnership_split")] public bool MustRespectGrowthSplit { get; set; }
        [JsonPropertyName("never_suggest_fake_streams_or_bots")] public bool NeverSuggestFakeStreamsOrBots { get; set; }
    }
}
