using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace dmf_music_platform.Web.Models;

[BsonIgnoreExtraElements]
public class User
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("username")]
    public string Username { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("passwordHash")]
    public string PasswordHash { get; set; } = string.Empty;

    [BsonElement("role")]
    public string Role { get; set; } = "artist"; // artist, distributor, owner

    [BsonElement("profileImageUrl")]
    public string ProfileImageUrl { get; set; } = string.Empty;

    [BsonElement("createdDate")]
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    [BsonElement("lastLoginDate")]
    public DateTime? LastLoginDate { get; set; }

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("preferences")]
    public UserPreferences Preferences { get; set; } = new();
}

[BsonIgnoreExtraElements]
public class UserPreferences
{
    [BsonElement("theme")]
    public string Theme { get; set; } = "dark";

    [BsonElement("emailNotifications")]
    public bool EmailNotifications { get; set; } = true;

    [BsonElement("smsNotifications")]
    public bool SmsNotifications { get; set; } = false;

    [BsonElement("language")]
    public string Language { get; set; } = "en";
}
