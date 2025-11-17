using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace dmf_music_platform.Web.Models;

[BsonIgnoreExtraElements]
public class Release
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("artist")]
    public string Artist { get; set; } = string.Empty;

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("releaseType")]
    public string ReleaseType { get; set; } = "single"; // single, ep, album, mixtape

    [BsonElement("releaseDate")]
    public DateTime ReleaseDate { get; set; }

    [BsonElement("createdDate")]
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    [BsonElement("tracks")]
    public List<Track> Tracks { get; set; } = new();

    [BsonElement("qcStatus")]
    public string QcStatus { get; set; } = "pending"; // pending, approved, rejected

    [BsonElement("distributions")]
    public List<Distribution> Distributions { get; set; } = new();
}

[BsonIgnoreExtraElements]
public class Track
{
    [BsonElement("id")]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("duration")]
    public int DurationSeconds { get; set; }

    [BsonElement("featuring")]
    public List<string> Featuring { get; set; } = new();

    [BsonElement("isrc")]
    public string ISRC { get; set; } = string.Empty;

    [BsonElement("lyrics")]
    public string Lyrics { get; set; } = string.Empty;
}

[BsonIgnoreExtraElements]
public class Distribution
{
    [BsonElement("id")]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("platform")]
    public string Platform { get; set; } = string.Empty; // spotify, apple, youtube, etc.

    [BsonElement("status")]
    public string Status { get; set; } = "pending"; // pending, processing, live, rejected

    [BsonElement("distributedDate")]
    public DateTime? DistributedDate { get; set; }

    [BsonElement("url")]
    public string Url { get; set; } = string.Empty;

    [BsonElement("errorMessage")]
    public string ErrorMessage { get; set; } = string.Empty;
}
