namespace dmf_music_platform.Web.Domain.Distributor
{
    public enum ReleaseType
    {
        Single,
        EP,
        Album,
        Mixtape
    }

    public class ReleaseDraft
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public ReleaseType Type { get; set; }

        public string ArtistName { get; set; } = string.Empty;
        public string ReleaseTitle { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public DateTime? ReleaseDate { get; set; }
        public List<TrackDraft> Tracks { get; set; } = new();

        // Pricing / payout
        public string PricingTier { get; set; } = "indie_basic";
        public PayoutProfile PayoutProfile { get; set; } = new();
    }

    public class TrackDraft
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public int TrackNumber { get; set; }
        public string Title { get; set; } = string.Empty;

        // In MVP this can be a path or blob URL; later real storage
        public string AudioPath { get; set; } = string.Empty;

        public string? Isrc { get; set; }
        public TimeSpan? Duration { get; set; }
    }

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
