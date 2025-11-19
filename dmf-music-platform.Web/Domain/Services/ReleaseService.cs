using dmf_music_platform.Web.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace dmf_music_platform.Web.Domain.Services;

public interface IReleaseService
{
    Task<ReleaseV2> CreateReleaseAsync(CreateReleaseRequest request);
    Task<ReleaseV2> GetReleaseAsync(string releaseId);
    Task<List<ReleaseV2>> GetReleasesByArtistAsync(string artistId);
    Task<List<ReleaseV2>> GetReleasesByStatusAsync(string status);
    Task<ReleaseV2> AddTracksAsync(string releaseId, List<TrackV2> tracks);
    Task<QCResult> RunQcAsync(string releaseId);
    Task<ReleaseV2> UpdateReleaseStatusAsync(string releaseId, string newStatus);
}

public class MongoReleaseService : IReleaseService
{
    private readonly IMongoCollection<ReleaseV2> _releasesCollection;

    public MongoReleaseService(IMongoClient mongoClient, IMongoDatabase mongoDatabase)
    {
        _releasesCollection = mongoDatabase.GetCollection<ReleaseV2>("releases_v2");
    }

    public async Task<ReleaseV2> CreateReleaseAsync(CreateReleaseRequest request)
    {
        var release = new ReleaseV2
        {
            Id = ObjectId.GenerateNewId(),
            ArtistId = request.ArtistId,
            Title = request.Title,
            Description = request.Description ?? string.Empty,
            CoverArtUrl = request.CoverArtUrl ?? string.Empty,
            PrimaryArtist = request.PrimaryArtist,
            FeaturedArtists = request.FeaturedArtists ?? new(),
            ReleaseDate = request.ReleaseDate,
            ReleaseType = request.ReleaseType ?? "single",
            Status = "draft",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _releasesCollection.InsertOneAsync(release);
        return release;
    }

    public async Task<ReleaseV2> GetReleaseAsync(string releaseId)
    {
        if (!ObjectId.TryParse(releaseId, out var objectId))
            throw new ArgumentException("Invalid release ID format");

        return await _releasesCollection.Find(r => r.Id == objectId).FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException($"Release {releaseId} not found");
    }

    public async Task<List<ReleaseV2>> GetReleasesByArtistAsync(string artistId)
    {
        return await _releasesCollection.Find(r => r.ArtistId == artistId).ToListAsync();
    }

    public async Task<List<ReleaseV2>> GetReleasesByStatusAsync(string status)
    {
        return await _releasesCollection.Find(r => r.Status == status).ToListAsync();
    }

    public async Task<ReleaseV2> AddTracksAsync(string releaseId, List<TrackV2> tracks)
    {
        if (!ObjectId.TryParse(releaseId, out var objectId))
            throw new ArgumentException("Invalid release ID format");

        var release = await GetReleaseAsync(releaseId);

        // Set release ID on each track
        foreach (var track in tracks)
        {
            track.ReleaseId = releaseId;
        }

        // Add tracks directly to release object
        release.Tracks.AddRange(tracks);
        release.UpdatedAt = DateTime.UtcNow;

        await _releasesCollection.ReplaceOneAsync(r => r.Id == objectId, release);

        return release;
    }

    public async Task<QCResult> RunQcAsync(string releaseId)
    {
        var release = await GetReleaseAsync(releaseId);

        var findings = new List<QCFinding>();
        int score = 100;

        // QC Rule 1: All tracks must have ISRC
        foreach (var track in release.Tracks)
        {
            if (string.IsNullOrWhiteSpace(track.ISRC))
            {
                findings.Add(new QCFinding
                {
                    Code = "MISSING_ISRC",
                    Message = $"Track '{track.Title}' missing ISRC code",
                    Severity = "error",
                    AffectedTrackId = track.Id
                });
                score -= 15;
            }
        }

        // QC Rule 2: All tracks must have duration > 0
        foreach (var track in release.Tracks)
        {
            if (track.DurationSeconds <= 0)
            {
                findings.Add(new QCFinding
                {
                    Code = "INVALID_DURATION",
                    Message = $"Track '{track.Title}' has invalid duration",
                    Severity = "error",
                    AffectedTrackId = track.Id
                });
                score -= 15;
            }
        }

        // QC Rule 3: Explicit flag consistency
        foreach (var track in release.Tracks)
        {
            if (track.Title.ToLower().Contains("explicit") && !track.ExplicitFlag)
            {
                findings.Add(new QCFinding
                {
                    Code = "EXPLICIT_NOT_FLAGGED",
                    Message = $"Track '{track.Title}' appears explicit but flag not set",
                    Severity = "warning",
                    AffectedTrackId = track.Id
                });
                score -= 5;
            }
        }

        // QC Rule 4: Release must have title
        if (string.IsNullOrWhiteSpace(release.Title))
        {
            findings.Add(new QCFinding
            {
                Code = "MISSING_TITLE",
                Message = "Release title is required",
                Severity = "critical"
            });
            score -= 25;
        }

        // QC Rule 5: Release must have at least one track
        if (release.Tracks.Count == 0)
        {
            findings.Add(new QCFinding
            {
                Code = "NO_TRACKS",
                Message = "Release must contain at least one track",
                Severity = "critical"
            });
            score -= 30;
        }

        score = Math.Max(0, score);

        var qcResult = new QCResult
        {
            Status = score >= 80 ? "passed" : "failed",
            Score = score,
            Findings = findings,
            Timestamp = DateTime.UtcNow
        };

        var objectId = ObjectId.Parse(releaseId);
        var newStatus = qcResult.Status == "passed" ? "ready_for_delivery" : "qc_failed";

        var update = Builders<ReleaseV2>.Update
            .Set(r => r.QcResult, qcResult)
            .Set(r => r.Status, newStatus)
            .Set(r => r.UpdatedAt, DateTime.UtcNow);

        await _releasesCollection.UpdateOneAsync(r => r.Id == objectId, update);

        return qcResult;
    }

    public async Task<ReleaseV2> UpdateReleaseStatusAsync(string releaseId, string newStatus)
    {
        if (!ObjectId.TryParse(releaseId, out var objectId))
            throw new ArgumentException("Invalid release ID format");

        var validStatuses = new[] { "draft", "qc_in_progress", "qc_failed", "ready_for_delivery", "delivered" };
        if (!validStatuses.Contains(newStatus))
            throw new ArgumentException($"Invalid status: {newStatus}");

        var update = Builders<ReleaseV2>.Update
            .Set(r => r.Status, newStatus)
            .Set(r => r.UpdatedAt, DateTime.UtcNow);

        await _releasesCollection.UpdateOneAsync(r => r.Id == objectId, update);

        return await GetReleaseAsync(releaseId);
    }
}

// DTOs for requests
public class CreateReleaseRequest
{
    public string ArtistId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverArtUrl { get; set; }
    public string PrimaryArtist { get; set; } = string.Empty;
    public List<string>? FeaturedArtists { get; set; }
    public DateTime ReleaseDate { get; set; }
    public string? ReleaseType { get; set; }
}

public class AddTracksRequest
{
    public List<TrackV2> Tracks { get; set; } = new();
}

public class UpdateReleaseStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
