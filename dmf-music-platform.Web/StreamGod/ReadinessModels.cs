using System.Collections.Generic;

namespace dmf_music_platform.Web.StreamGod
{
    public enum Severity
    {
        Error,
        Warning
    }

    public class ReadinessIssue
    {
        public Severity Severity { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class TrackReadinessResult
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int Score { get; set; }
        public List<ReadinessIssue> Issues { get; set; } = new();
    }

    public class ReleaseReadinessResult
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int Score { get; set; }
        public List<ReadinessIssue> Issues { get; set; } = new();
    }

    public class CatalogHealthSummary
    {
        public int ArtistCount { get; set; }
        public int ReleaseCount { get; set; }
        public int TrackCount { get; set; }
        public int AvgTrackReadiness { get; set; }
        public int AvgReleaseReadiness { get; set; }
    }

    public class CatalogHealthResponse
    {
        public CatalogHealthSummary Summary { get; set; } = new();
        public List<TrackReadinessResult> Tracks { get; set; } = new();
        public List<ReleaseReadinessResult> Releases { get; set; } = new();
    }
}
