using System;
using System.Collections.Generic;

namespace DMF_MUSIC_PLATFORM.Data.Distribution
{
    /// <summary>
    /// Represents a single track within a Release.
    /// </summary>
    public class Track
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        public string ReleaseId { get; set; } = string.Empty;
        
        public string Title { get; set; } = string.Empty;
        
        public string? Isrc { get; set; }
        
        public int SequenceNumber { get; set; }
        
        public int? DurationSeconds { get; set; }
        
        public bool Explicit { get; set; } = false;
        
        public string? AudioRef { get; set; } // GCS path to WAV/FLAC
        
        public string? PreviewRef { get; set; } // GCS path to MP3 preview
        
        public List<string> Contributors { get; set; } = new(); // Artist names/IDs
        
        public string? ComposerName { get; set; }
        
        public string? ProducerName { get; set; }
        
        public bool IsCover { get; set; } = false;
        
        public string? OriginalArtist { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public Dictionary<string, object> Metadata { get; set; } = new();
    }
}
