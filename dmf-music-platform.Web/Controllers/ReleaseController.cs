using dmf_music_platform.Web.Domain.Services;
using dmf_music_platform.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace dmf_music_platform.Web.Controllers;

[ApiController]
[Route("api/releases")]
public class ReleaseController : ControllerBase
{
    private readonly IReleaseService _releaseService;
    private readonly ILogger<ReleaseController> _logger;

    public ReleaseController(IReleaseService releaseService, ILogger<ReleaseController> logger)
    {
        _releaseService = releaseService;
        _logger = logger;
    }

    /// <summary>
    /// POST /api/releases
    /// Create a new release (draft state)
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateRelease([FromBody] CreateReleaseRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest(new { error = "Title is required" });

            if (string.IsNullOrWhiteSpace(request.ArtistId))
                return BadRequest(new { error = "ArtistId is required" });

            var release = await _releaseService.CreateReleaseAsync(request);
            return CreatedAtAction(nameof(GetRelease), new { releaseId = release.Id }, release);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating release");
            return StatusCode(500, new { error = "Failed to create release" });
        }
    }

    /// <summary>
    /// GET /api/releases/{releaseId}
    /// Get a specific release with full details
    /// </summary>
    [HttpGet("{releaseId}")]
    public async Task<IActionResult> GetRelease(string releaseId)
    {
        try
        {
            var release = await _releaseService.GetReleaseAsync(releaseId);
            return Ok(release);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = $"Release {releaseId} not found" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching release");
            return StatusCode(500, new { error = "Failed to fetch release" });
        }
    }

    /// <summary>
    /// GET /api/releases?artistId={artistId}
    /// Get all releases for an artist
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetReleasesByArtist([FromQuery] string? artistId, [FromQuery] string? status)
    {
        try
        {
            if (!string.IsNullOrWhiteSpace(status))
            {
                var releasesByStatus = await _releaseService.GetReleasesByStatusAsync(status);
                return Ok(releasesByStatus);
            }

            if (string.IsNullOrWhiteSpace(artistId))
                return BadRequest(new { error = "artistId or status query parameter required" });

            var releases = await _releaseService.GetReleasesByArtistAsync(artistId);
            return Ok(releases);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching releases");
            return StatusCode(500, new { error = "Failed to fetch releases" });
        }
    }

    /// <summary>
    /// POST /api/releases/{releaseId}/tracks
    /// Add tracks to a release
    /// </summary>
    [HttpPost("{releaseId}/tracks")]
    public async Task<IActionResult> AddTracks(string releaseId, [FromBody] AddTracksRequest request)
    {
        try
        {
            if (request.Tracks == null || request.Tracks.Count == 0)
                return BadRequest(new { error = "At least one track is required" });

            var release = await _releaseService.AddTracksAsync(releaseId, request.Tracks);
            return Ok(release);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = $"Release {releaseId} not found" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding tracks");
            return StatusCode(500, new { error = "Failed to add tracks" });
        }
    }

    /// <summary>
    /// POST /api/releases/{releaseId}/run-qc
    /// Run QC checks on the release
    /// </summary>
    [HttpPost("{releaseId}/run-qc")]
    public async Task<IActionResult> RunQc(string releaseId)
    {
        try
        {
            var qcResult = await _releaseService.RunQcAsync(releaseId);
            return Ok(qcResult);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = $"Release {releaseId} not found" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running QC");
            return StatusCode(500, new { error = "Failed to run QC" });
        }
    }

    /// <summary>
    /// PATCH /api/releases/{releaseId}/status
    /// Update release status (admin override)
    /// </summary>
    [HttpPatch("{releaseId}/status")]
    public async Task<IActionResult> UpdateStatus(string releaseId, [FromBody] UpdateReleaseStatusRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Status))
                return BadRequest(new { error = "Status is required" });

            var release = await _releaseService.UpdateReleaseStatusAsync(releaseId, request.Status);
            return Ok(release);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = $"Release {releaseId} not found" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status");
            return StatusCode(500, new { error = "Failed to update status" });
        }
    }
}
