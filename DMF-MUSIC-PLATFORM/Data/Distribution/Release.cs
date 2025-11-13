using System;
using System.Collections.Generic;

namespace DMF_MUSIC_PLATFORM.Data.Distribution
{
    /// <summary>
    /// Represents a music release (album, EP, single) ready for distribution to DSPs.
    /// </summary>
    public class Release
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        public string? Upc { get; set; }
        
        public string Title { get; set; } = string.Empty;
        
        public string? PrimaryArtistId { get; set; }
        
        public string? ReleaseType { get; set; } // Album, EP, Single, Compilation
        
        public DateTime? ReleaseDate { get; set; }
        
        public DateTime? EmbargoDate { get; set; }
        
        public string Status { get; set; } = "DRAFT"; // DRAFT, QC_PENDING, QC_PASSED, SCHEDULED, LIVE, ERROR
        
        public string? QcNotes { get; set; }
        
        public int TrackCount { get; set; } = 0;
        
        public string? CoverArtRef { get; set; } // GCS path
        
        public string? Genre { get; set; }
        
        public string? LabelName { get; set; }
        
        public string? CLine { get; set; } // Copyright line
        
        public string? PLine { get; set; } // Producer line
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public string CreatedBy { get; set; } = string.Empty;
        
        public List<string> SelectedDsps { get; set; } = new(); // ["spotify", "apple", "youtube"]
        
        public Dictionary<string, object> Metadata { get; set; } = new();
    }
}
