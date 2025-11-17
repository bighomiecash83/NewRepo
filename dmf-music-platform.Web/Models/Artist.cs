using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace dmf_music_platform.Web.Models;

[BsonIgnoreExtraElements]
public class Artist
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("bio")]
    public string Bio { get; set; } = string.Empty;

    [BsonElement("profileImageUrl")]
    public string ProfileImageUrl { get; set; } = string.Empty;

    [BsonElement("joinedDate")]
    public DateTime JoinedDate { get; set; } = DateTime.UtcNow;

    [BsonElement("releaseIds")]
    public List<string> ReleaseIds { get; set; } = new();

    [BsonElement("totalStreams")]
    public long TotalStreams { get; set; }

    [BsonElement("totalEarnings")]
    public decimal TotalEarnings { get; set; }

    [BsonElement("country")]
    public string Country { get; set; } = string.Empty;

    [BsonElement("genres")]
    public List<string> Genres { get; set; } = new();
}
