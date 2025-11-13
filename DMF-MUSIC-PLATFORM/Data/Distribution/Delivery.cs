using System;

namespace DMF_MUSIC_PLATFORM.Data.Distribution
{
    /// <summary>
    /// Represents the delivery of a release to a specific DSP (Spotify, Apple Music, YouTube, etc.)
    /// </summary>
    public class Delivery
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        public string ReleaseId { get; set; } = string.Empty;
        
        public string Dsp { get; set; } = string.Empty; // "spotify", "apple", "youtube", "tiktok", etc.
        
        public string Status { get; set; } = "PENDING"; // PENDING, QUEUED, SENT, ACK, LIVE, FAILED, TAKEDOWN_SENT
        
        public int RetryCount { get; set; } = 0;
        
        public string? LastError { get; set; }
        
        public DateTime? SentAt { get; set; }
        
        public DateTime? AcknowledgedAt { get; set; }
        
        public string? DspRefId { get; set; } // DSP's internal ID for tracking
        
        public string? DedupeKey { get; set; } // Unique key to prevent duplicate sends
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public string? Notes { get; set; }
    }
}
