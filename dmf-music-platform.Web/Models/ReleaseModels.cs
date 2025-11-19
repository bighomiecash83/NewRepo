using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace dmf_music_platform.Web.Models;

/// <summary>
/// Distribution System v1.1 - Release Pipeline Models
/// </summary>
/// 
[BsonIgnoreExtraElements]
public class ReleaseV2
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("artistId")]
    public string ArtistId { get; set; } = string.Empty;

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("coverArtUrl")]
    public string CoverArtUrl { get; set; } = string.Empty;

    [BsonElement("primaryArtist")]
    public string PrimaryArtist { get; set; } = string.Empty;

    [BsonElement("featuredArtists")]
    public List<string> FeaturedArtists { get; set; } = new();

    [BsonElement("releaseDate")]
    public DateTime ReleaseDate { get; set; }

    [BsonElement("releaseType")]
    public string ReleaseType { get; set; } = "single"; // single, ep, album, mixtape

    [BsonElement("status")]
    public string Status { get; set; } = "draft"; // draft, qc_in_progress, qc_failed, ready_for_delivery, delivered

    [BsonElement("tracks")]
    public List<TrackV2> Tracks { get; set; } = new();

    [BsonElement("qcResult")]
    public QCResult? QcResult { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[BsonIgnoreExtraElements]
public class TrackV2
{
    [BsonElement("id")]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("releaseId")]
    public string ReleaseId { get; set; } = string.Empty;

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("audioUrl")]
    public string AudioUrl { get; set; } = string.Empty;

    [BsonElement("duration")]
    public int DurationSeconds { get; set; } // in seconds

    [BsonElement("isrc")]
    public string ISRC { get; set; } = string.Empty;

    [BsonElement("explicitFlag")]
    public bool ExplicitFlag { get; set; } = false;

    [BsonElement("ownershipSplits")]
    public List<OwnershipSplit> OwnershipSplits { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[BsonIgnoreExtraElements]
public class OwnershipSplit
{
    [BsonElement("artistName")]
    public string ArtistName { get; set; } = string.Empty;

    [BsonElement("percentage")]
    public decimal Percentage { get; set; } // 0-100
}

[BsonIgnoreExtraElements]
public class QCResult
{
    [BsonElement("status")]
    public string Status { get; set; } = "pending"; // pending, passed, failed

    [BsonElement("score")]
    public int Score { get; set; } // 0-100

    [BsonElement("findings")]
    public List<QCFinding> Findings { get; set; } = new();

    [BsonElement("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

[BsonIgnoreExtraElements]
public class QCFinding
{
    [BsonElement("code")]
    public string Code { get; set; } = string.Empty; // e.g., "MISSING_ISRC", "EXPLICIT_NOT_FLAGGED"

    [BsonElement("message")]
    public string Message { get; set; } = string.Empty;

    [BsonElement("severity")]
    public string Severity { get; set; } = "warning"; // critical, error, warning, info

    [BsonElement("affectedTrackId")]
    public string? AffectedTrackId { get; set; }
}
