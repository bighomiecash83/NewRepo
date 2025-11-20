namespace dmf_music_platform.Domain.Distributor
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
}
