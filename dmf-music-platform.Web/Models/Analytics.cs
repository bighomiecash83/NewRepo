using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace dmf_music_platform.Web.Models;

[BsonIgnoreExtraElements]
public class AnalyticsRecord
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("releaseId")]
    public string ReleaseId { get; set; } = string.Empty;

    [BsonElement("artistId")]
    public string ArtistId { get; set; } = string.Empty;

    [BsonElement("date")]
    public DateTime Date { get; set; } = DateTime.UtcNow;

    [BsonElement("streams")]
    public long Streams { get; set; }

    [BsonElement("earnings")]
    public decimal Earnings { get; set; }

    [BsonElement("platformMetrics")]
    public Dictionary<string, PlatformMetric> PlatformMetrics { get; set; } = new();

    [BsonElement("topCountries")]
    public Dictionary<string, long> TopCountries { get; set; } = new();

    [BsonElement("topTracks")]
    public Dictionary<string, long> TopTracks { get; set; } = new();
}

[BsonIgnoreExtraElements]
public class PlatformMetric
{
    [BsonElement("platform")]
    public string Platform { get; set; } = string.Empty;

    [BsonElement("streams")]
    public long Streams { get; set; }

    [BsonElement("earnings")]
    public decimal Earnings { get; set; }

    [BsonElement("listeners")]
    public long Listeners { get; set; }
}
