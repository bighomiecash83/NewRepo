using System;

namespace DMF_MUSIC_PLATFORM.Data.Distribution
{
    /// <summary>
    /// Represents a single line item in a royalty statement from a DSP.
    /// </summary>
    public class RoyaltyLine
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        public string? TrackId { get; set; }
        
        public string? Isrc { get; set; }
        
        public string Dsp { get; set; } = string.Empty; // "spotify", "apple", etc.
        
        public string Territory { get; set; } = string.Empty; // ISO-3166 country code (US, GB, etc.)
        
        public string ReportingPeriod { get; set; } = string.Empty; // YYYY-MM
        
        public long StreamCount { get; set; }
        
        public decimal GrossRevenue { get; set; }
        
        public decimal NetRevenue { get; set; }
        
        public string Currency { get; set; } = "USD";
        
        public DateTime? ImportedAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
