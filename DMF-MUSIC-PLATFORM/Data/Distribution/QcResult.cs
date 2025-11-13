using System;
using System.Collections.Generic;

namespace DMF_MUSIC_PLATFORM.Data.Distribution
{
    /// <summary>
    /// Represents QC (Quality Control) results for a Release.
    /// </summary>
    public class QcResult
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        public string ReleaseId { get; set; } = string.Empty;
        
        public bool PassedQc { get; set; } = false;
        
        public List<QcCheck> Checks { get; set; } = new();
        
        public DateTime RunAt { get; set; } = DateTime.UtcNow;
        
        public string? Notes { get; set; }
        
        public class QcCheck
        {
            public string Name { get; set; } = string.Empty; // "loudness", "duration", "artwork_ratio", "isrc_format", etc.
            
            public bool Passed { get; set; }
            
            public string? Message { get; set; }
            
            public string? Suggestion { get; set; } // How to fix
        }
    }
}
