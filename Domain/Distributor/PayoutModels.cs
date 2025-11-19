namespace dmf_music_platform.Domain.Distributor
{
    /// <summary>
    /// How the money is split for this release.
    /// </summary>
    public class PayoutProfile
    {
        public string TierCode { get; set; } = "indie_basic";

        // Artist vs DMF vs optional Label/Investor
        public decimal ArtistSharePercent { get; set; } = 90m;
        public decimal DmfSharePercent { get; set; } = 10m;
        public decimal? LabelSharePercent { get; set; } = 0m;

        public string Notes { get; set; } = string.Empty;
    }

    public class PayoutQuoteRequest
    {
        public string TierCode { get; set; } = "indie_basic";
        public decimal ProjectedRevenue { get; set; }
    }

    public class PayoutQuoteResult
    {
        public string TierCode { get; set; } = string.Empty;
        public decimal ProjectedRevenue { get; set; }

        public decimal ArtistAmount { get; set; }
        public decimal DmfAmount { get; set; }
        public decimal? LabelAmount { get; set; }

        public decimal ArtistSharePercent { get; set; }
        public decimal DmfSharePercent { get; set; }
        public decimal? LabelSharePercent { get; set; }
    }
}
