using MongoDB.Driver;
using MongoDB.Driver.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dmf_music_platform.Web.Domain.Services;

/// <summary>
/// StreamGod Dashboard Service v2.0
/// Provides real-time analytics for owner, artists, and releases
/// Uses royalty_imports, royalty_statements, and releases_v2 collections
/// </summary>
/// 
public class OwnerKpiDto
{
    public long TotalStreamsLast30 { get; set; }
    public decimal GrossRevenueLast30 { get; set; }
    public decimal DmfCutLast30 { get; set; }
    public decimal NetToArtistsLast30 { get; set; }

    public int ActiveArtists { get; set; }
    public int TotalReleases { get; set; }
    public int ReleasesWithQcIssues { get; set; }
}

public class TopReleaseDto
{
    public string ReleaseId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string ArtistId { get; set; } = string.Empty;
    public long StreamsLast30 { get; set; }
    public decimal RevenueLast30 { get; set; }
    public double QcScore { get; set; }
}

public class TimeSeriesPoint
{
    public DateTime Date { get; set; }
    public long Streams { get; set; }
    public decimal Revenue { get; set; }
}

public class ArtistDashboardDto
{
    public string ArtistId { get; set; } = string.Empty;
    public long StreamsLast30 { get; set; }
    public decimal RevenueLast30 { get; set; }
    public List<TopReleaseDto> TopReleases { get; set; } = new();
    public List<TimeSeriesPoint> StreamsOverTime { get; set; } = new();
    public List<TimeSeriesPoint> RevenueOverTime { get; set; } = new();
}

public interface IStreamGodDashboardService
{
    Task<OwnerKpiDto> GetOwnerKpisAsync();
    Task<List<TopReleaseDto>> GetTopReleasesAsync(int limit = 5);
    Task<ArtistDashboardDto> GetArtistDashboardAsync(string artistId);
    Task<List<TopReleaseDto>> GetReleaseTableAsync();
}

public class StreamGodDashboardService : IStreamGodDashboardService
{
    private readonly IMongoDatabase _db;
    private readonly IMongoCollection<dynamic> _royaltyImports;
    private readonly IMongoCollection<dynamic> _royaltyStatements;
    private readonly IMongoCollection<dynamic> _releases;

    public StreamGodDashboardService(IMongoDatabase db)
    {
        _db = db;
        _royaltyImports = db.GetCollection<dynamic>("royalty_imports");
        _royaltyStatements = db.GetCollection<dynamic>("royalty_statements");
        _releases = db.GetCollection<dynamic>("releases_v2");
    }

    /// <summary>
    /// Get owner KPIs: total streams, revenue, DMF cut, artist count, release count, QC issues
    /// </summary>
    public async Task<OwnerKpiDto> GetOwnerKpisAsync()
    {
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

        // Streams & revenue from royalty_imports (last 30 days)
        var importFilter = Builders<dynamic>.Filter.Gte("usageDate", thirtyDaysAgo);
        var imports = await _royaltyImports.Find(importFilter).ToListAsync();

        long totalStreams = 0;
        decimal totalRevenue = 0;
        var artistIds = new HashSet<string>();

        foreach (var imp in imports)
        {
            try
            {
                if (imp.TryGetValue("streams", out var streamsVal) && long.TryParse(streamsVal.ToString(), out var streams))
                    totalStreams += streams;

                if (imp.TryGetValue("revenue", out var revVal) && decimal.TryParse(revVal.ToString(), out var revenue))
                    totalRevenue += revenue;

                if (imp.TryGetValue("artistId", out var artistVal))
                    artistIds.Add(artistVal.ToString());
            }
            catch { /* skip malformed records */ }
        }

        // Calculate DMF cut (20% default)
        decimal dmfCut = totalRevenue * 0.20m;
        decimal netToArtists = totalRevenue - dmfCut;

        // Count releases total
        var releaseCount = await _releases.CountDocumentsAsync(_ => true);

        // Count releases with QC issues (mock: where qcStatus != "ready")
        var qcIssueFilter = Builders<dynamic>.Filter.Ne("qcStatus", "ready");
        var qcIssueCount = await _releases.CountDocumentsAsync(qcIssueFilter);

        return new OwnerKpiDto
        {
            TotalStreamsLast30 = totalStreams,
            GrossRevenueLast30 = totalRevenue,
            DmfCutLast30 = dmfCut,
            NetToArtistsLast30 = netToArtists,
            ActiveArtists = artistIds.Count,
            TotalReleases = (int)releaseCount,
            ReleasesWithQcIssues = (int)qcIssueCount
        };
    }

    /// <summary>
    /// Get top releases by streams in last 30 days
    /// </summary>
    public async Task<List<TopReleaseDto>> GetTopReleasesAsync(int limit = 5)
    {
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var importFilter = Builders<dynamic>.Filter.Gte("usageDate", thirtyDaysAgo);
        var imports = await _royaltyImports.Find(importFilter).ToListAsync();

        // Group by release
        var releaseGroups = new Dictionary<string, (string title, string artistId, long streams, decimal revenue)>();

        foreach (var imp in imports)
        {
            try
            {
                var releaseId = imp.TryGetValue("releaseId", out var rVal) ? rVal.ToString() : null;
                var artistId = imp.TryGetValue("artistId", out var aVal) ? aVal.ToString() : null;
                var title = imp.TryGetValue("trackTitle", out var tVal) ? tVal.ToString() : "Unknown";

                if (string.IsNullOrEmpty(releaseId)) continue;

                var streams = imp.TryGetValue("streams", out var sVal) && long.TryParse(sVal.ToString(), out var s) ? s : 0L;
                var revenue = imp.TryGetValue("revenue", out var vVal) && decimal.TryParse(vVal.ToString(), out var v) ? v : 0m;

                if (releaseGroups.ContainsKey(releaseId))
                {
                    var existing = releaseGroups[releaseId];
                    releaseGroups[releaseId] = (existing.title, existing.artistId ?? artistId, existing.streams + streams, existing.revenue + revenue);
                }
                else
                {
                    releaseGroups[releaseId] = (title, artistId ?? "", streams, revenue);
                }
            }
            catch { /* skip */ }
        }

        // Convert to DTOs and sort by streams
        var topReleases = releaseGroups
            .OrderByDescending(g => g.Value.streams)
            .Take(limit)
            .Select(g => new TopReleaseDto
            {
                ReleaseId = g.Key,
                Title = g.Value.title,
                ArtistId = g.Value.artistId,
                StreamsLast30 = g.Value.streams,
                RevenueLast30 = g.Value.revenue,
                QcScore = 85.0 // Mock for now
            })
            .ToList();

        return topReleases;
    }

    /// <summary>
    /// Get artist-specific dashboard with streams, revenue, top releases, and time series
    /// </summary>
    public async Task<ArtistDashboardDto> GetArtistDashboardAsync(string artistId)
    {
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var filter = Builders<dynamic>.Filter.And(
            Builders<dynamic>.Filter.Eq("artistId", artistId),
            Builders<dynamic>.Filter.Gte("usageDate", thirtyDaysAgo)
        );

        var imports = await _royaltyImports.Find(filter).ToListAsync();

        long totalStreams = 0;
        decimal totalRevenue = 0;
        var releaseGroups = new Dictionary<string, (string title, long streams, decimal revenue)>();
        var timeSeriesData = new Dictionary<DateTime, (long streams, decimal revenue)>();

        foreach (var imp in imports)
        {
            try
            {
                var releaseId = imp.TryGetValue("releaseId", out var rVal) ? rVal.ToString() : null;
                var title = imp.TryGetValue("trackTitle", out var tVal) ? tVal.ToString() : "Unknown";
                var streams = imp.TryGetValue("streams", out var sVal) && long.TryParse(sVal.ToString(), out var s) ? s : 0L;
                var revenue = imp.TryGetValue("revenue", out var vVal) && decimal.TryParse(vVal.ToString(), out var v) ? v : 0m;
                var usageDate = imp.TryGetValue("usageDate", out var dVal) && DateTime.TryParse(dVal.ToString(), out var d) ? d.Date : DateTime.UtcNow.Date;

                totalStreams += streams;
                totalRevenue += revenue;

                // Group by release
                if (!string.IsNullOrEmpty(releaseId))
                {
                    if (releaseGroups.ContainsKey(releaseId))
                    {
                        var existing = releaseGroups[releaseId];
                        releaseGroups[releaseId] = (existing.title, existing.streams + streams, existing.revenue + revenue);
                    }
                    else
                    {
                        releaseGroups[releaseId] = (title, streams, revenue);
                    }
                }

                // Time series
                if (timeSeriesData.ContainsKey(usageDate))
                {
                    var existing = timeSeriesData[usageDate];
                    timeSeriesData[usageDate] = (existing.streams + streams, existing.revenue + revenue);
                }
                else
                {
                    timeSeriesData[usageDate] = (streams, revenue);
                }
            }
            catch { /* skip */ }
        }

        var topReleases = releaseGroups
            .OrderByDescending(g => g.Value.streams)
            .Take(5)
            .Select(g => new TopReleaseDto
            {
                ReleaseId = g.Key,
                Title = g.Value.title,
                ArtistId = artistId,
                StreamsLast30 = g.Value.streams,
                RevenueLast30 = g.Value.revenue,
                QcScore = 90.0
            })
            .ToList();

        var timeSeries = timeSeriesData
            .OrderBy(t => t.Key)
            .Select(t => new TimeSeriesPoint
            {
                Date = t.Key,
                Streams = t.Value.streams,
                Revenue = t.Value.revenue
            })
            .ToList();

        return new ArtistDashboardDto
        {
            ArtistId = artistId,
            StreamsLast30 = totalStreams,
            RevenueLast30 = totalRevenue,
            TopReleases = topReleases,
            StreamsOverTime = timeSeries,
            RevenueOverTime = timeSeries
        };
    }

    /// <summary>
    /// Get all releases with aggregated metrics for the releases table
    /// </summary>
    public async Task<List<TopReleaseDto>> GetReleaseTableAsync()
    {
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var filter = Builders<dynamic>.Filter.Gte("usageDate", thirtyDaysAgo);
        var imports = await _royaltyImports.Find(filter).ToListAsync();

        var releaseGroups = new Dictionary<string, (string title, string artistId, long streams, decimal revenue)>();

        foreach (var imp in imports)
        {
            try
            {
                var releaseId = imp.TryGetValue("releaseId", out var rVal) ? rVal.ToString() : null;
                var artistId = imp.TryGetValue("artistId", out var aVal) ? aVal.ToString() : null;
                var title = imp.TryGetValue("trackTitle", out var tVal) ? tVal.ToString() : "Unknown";
                var streams = imp.TryGetValue("streams", out var sVal) && long.TryParse(sVal.ToString(), out var s) ? s : 0L;
                var revenue = imp.TryGetValue("revenue", out var vVal) && decimal.TryParse(vVal.ToString(), out var v) ? v : 0m;

                if (string.IsNullOrEmpty(releaseId)) continue;

                if (releaseGroups.ContainsKey(releaseId))
                {
                    var existing = releaseGroups[releaseId];
                    releaseGroups[releaseId] = (existing.title, existing.artistId ?? artistId, existing.streams + streams, existing.revenue + revenue);
                }
                else
                {
                    releaseGroups[releaseId] = (title, artistId ?? "", streams, revenue);
                }
            }
            catch { /* skip */ }
        }

        var table = releaseGroups
            .OrderByDescending(g => g.Value.streams)
            .Select(g => new TopReleaseDto
            {
                ReleaseId = g.Key,
                Title = g.Value.title,
                ArtistId = g.Value.artistId,
                StreamsLast30 = g.Value.streams,
                RevenueLast30 = g.Value.revenue,
                QcScore = 88.0
            })
            .ToList();

        return table;
    }
}
