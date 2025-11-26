using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace DmfMusicPlatform.Data.Models
{
    // ===== MONGODB MODELS (DMF Core Business Data) =====

    [BsonIgnoreExtraElements]
    public class Artist
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("stage_name")]
        public string StageName { get; set; }

        [BsonElement("bio")]
        public string Bio { get; set; }

        [BsonElement("is_active")]
        public bool IsActive { get; set; }

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; }

        [BsonElement("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [BsonElement("monthly_listeners")]
        public int MonthlyListeners { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class Release
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("artist_id")]
        public ObjectId ArtistId { get; set; }

        [BsonElement("title")]
        public string Title { get; set; }

        [BsonElement("release_date")]
        public DateTime ReleaseDate { get; set; }

        [BsonElement("upc")]
        public string UPC { get; set; }

        [BsonElement("genre")]
        public string Genre { get; set; }

        [BsonElement("status")]
        public string Status { get; set; }

        [BsonElement("tracks")]
        public List<Track> Tracks { get; set; }

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; }

        [BsonElement("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class Track
    {
        [BsonElement("id")]
        public ObjectId Id { get; set; }

        [BsonElement("title")]
        public string Title { get; set; }

        [BsonElement("isrc")]
        public string ISRC { get; set; }

        [BsonElement("duration_ms")]
        public int DurationMs { get; set; }

        [BsonElement("track_number")]
        public int TrackNumber { get; set; }

        [BsonElement("status")]
        public string Status { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class RoyaltyStatement
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("artist_id")]
        public ObjectId ArtistId { get; set; }

        [BsonElement("period_start")]
        public DateTime PeriodStart { get; set; }

        [BsonElement("period_end")]
        public DateTime PeriodEnd { get; set; }

        [BsonElement("total_streams")]
        public long TotalStreams { get; set; }

        [BsonElement("gross_earnings")]
        public decimal GrossEarnings { get; set; }

        [BsonElement("fees")]
        public decimal Fees { get; set; }

        [BsonElement("net_earnings")]
        public decimal NetEarnings { get; set; }

        [BsonElement("status")]
        public string Status { get; set; }

        [BsonElement("payout_date")]
        public DateTime? PayoutDate { get; set; }

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class CatalogEntry
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("total_releases")]
        public int TotalReleases { get; set; }

        [BsonElement("total_tracks")]
        public int TotalTracks { get; set; }

        [BsonElement("releases_ready")]
        public int ReleasesReady { get; set; }

        [BsonElement("tracks_ready")]
        public int TracksReady { get; set; }

        [BsonElement("avg_release_readiness")]
        public double AvgReleaseReadiness { get; set; }

        [BsonElement("avg_track_readiness")]
        public double AvgTrackReadiness { get; set; }

        [BsonElement("analyzed_at")]
        public DateTime AnalyzedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class DspStatus
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("release_id")]
        public ObjectId ReleaseId { get; set; }

        [BsonElement("platform")]
        public string Platform { get; set; }

        [BsonElement("status")]
        public string Status { get; set; }

        [BsonElement("published_date")]
        public DateTime? PublishedDate { get; set; }

        [BsonElement("url")]
        public string Url { get; set; }

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; }
    }

    // ===== SUPABASE MODELS (Support Data) =====

    public class UserAccount
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; }
        public bool IsEmailVerified { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
    }

    public class SessionLog
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string EventType { get; set; }
        public string Description { get; set; }
        public string IpAddress { get; set; }
        public bool Success { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ApiRequestLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string Method { get; set; }
        public string Endpoint { get; set; }
        public int StatusCode { get; set; }
        public long ResponseTimeMs { get; set; }
        public string IpAddress { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class EventLog
    {
        public int Id { get; set; }
        public string EventType { get; set; }
        public string EntityType { get; set; }
        public string EntityId { get; set; }
        public string Description { get; set; }
        public string Severity { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
