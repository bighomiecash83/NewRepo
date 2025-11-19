namespace dmf_music_platform.Domain.Config
{
    public class DmfPricingConfig
    {
        public string Currency { get; set; } = "USD";

        public Dictionary<string, decimal> Distribution { get; set; } = new()
        {
            { "single", 9.99m },
            { "ep", 19.99m },
            { "album", 29.99m },
            { "mixtape", 39.99m }
        };

        public List<PayoutTierConfig> PayoutTiers { get; set; } = new();
    }

    public class PayoutTierConfig
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public decimal ArtistSharePercent { get; set; }
        public decimal DmfSharePercent { get; set; }
        public decimal? LabelSharePercent { get; set; }
    }
}
