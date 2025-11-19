using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dmf_music_platform.Web.Domain.Services;

/// <summary>
/// StreamGod Dashboard API v2.0
/// Endpoints for owner KPIs, top releases, artist dashboards, and release table
/// Authorization: Owner/Admin only for owner routes; artists can access their own data
/// </summary>
[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IStreamGodDashboardService _dashboard;
    private readonly ILogger<DashboardController> _logger;
    private readonly IAuthorizationHelper _authHelper;

    public DashboardController(
        IStreamGodDashboardService dashboard,
        ILogger<DashboardController> logger,
        IAuthorizationHelper authHelper)
    {
        _dashboard = dashboard;
        _logger = logger;
        _authHelper = authHelper;
    }

    /// <summary>
    /// GET /api/dashboard/owner
    /// Get owner KPIs: streams, revenue, cuts, artist count, release count, QC issues
    /// ⚠️ OWNER/ADMIN ONLY - Full platform visibility
    /// </summary>
    [HttpGet("owner")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<ActionResult<OwnerKpiDto>> GetOwnerKpis()
    {
        try
        {
            var kpis = await _dashboard.GetOwnerKpisAsync();
            return Ok(kpis);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching owner KPIs");
            return StatusCode(500, new { error = "Failed to fetch owner KPIs" });
        }
    }

    /// <summary>
    /// GET /api/dashboard/top-releases?limit=5
    /// Get top releases by streams in last 30 days
    /// </summary>
    [HttpGet("top-releases")]
    public async Task<ActionResult<List<TopReleaseDto>>> GetTopReleases([FromQuery] int limit = 5)
    {
        try
        {
            if (limit < 1 || limit > 100)
                limit = 5;

            var releases = await _dashboard.GetTopReleasesAsync(limit);
            return Ok(releases);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching top releases");
            return StatusCode(500, new { error = "Failed to fetch top releases" });
        }
    }

    /// <summary>
    /// GET /api/dashboard/artist/{artistId}
    /// Get artist dashboard: streams, revenue, top releases, time series
    /// ⚠️ ARTIST can only access their own data; OWNER/ADMIN can access any
    /// </summary>
    [HttpGet("artist/{artistId}")]
    public async Task<ActionResult<ArtistDashboardDto>> GetArtistDashboard([FromRoute] string artistId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(artistId))
                return BadRequest(new { error = "artistId is required" });

            // Validate artist can access their own data
            if (!_authHelper.CanAccessArtistData(User, artistId))
            {
                _logger.LogWarning(
                    "User {UserId} denied access to artist {ArtistId}",
                    _authHelper.GetUserId(User), artistId);
                return Forbid();
            }

            var dashboard = await _dashboard.GetArtistDashboardAsync(artistId);
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching artist dashboard");
            return StatusCode(500, new { error = "Failed to fetch artist dashboard" });
        }
    }

    /// <summary>
    /// GET /api/dashboard/releases-table
    /// Get all releases with aggregated metrics for the releases table
    /// </summary>
    [HttpGet("releases-table")]
    public async Task<ActionResult<List<TopReleaseDto>>> GetReleaseTable()
    {
        try
        {
            var releases = await _dashboard.GetReleaseTableAsync();
            return Ok(releases);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching release table");
            return StatusCode(500, new { error = "Failed to fetch release table" });
        }
    }
}
