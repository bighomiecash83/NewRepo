using dmf_music_platform.Web.Domain.Services;
using dmf_music_platform.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace dmf_music_platform.Web.Controllers;

[ApiController]
[Route("api/royalties")]
public class RoyaltyController : ControllerBase
{
    private readonly IRoyaltyService _royaltyService;
    private readonly ILogger<RoyaltyController> _logger;

    public RoyaltyController(IRoyaltyService royaltyService, ILogger<RoyaltyController> logger)
    {
        _royaltyService = royaltyService;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/royalties/summary?artistId={artistId}
    /// Get artist earnings summary (lifetime, current period, pending)
    /// </summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetEarningsSummary([FromQuery] string artistId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(artistId))
                return BadRequest(new { error = "artistId is required" });

            var summary = await _royaltyService.GetArtistEarningsSummaryAsync(artistId);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching earnings summary");
            return StatusCode(500, new { error = "Failed to fetch earnings summary" });
        }
    }

    /// <summary>
    /// GET /api/royalties/statements?artistId={artistId}
    /// Get all statements for an artist
    /// </summary>
    [HttpGet("statements")]
    public async Task<IActionResult> GetArtistStatements([FromQuery] string artistId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(artistId))
                return BadRequest(new { error = "artistId is required" });

            var statements = await _royaltyService.GetArtistStatementsAsync(artistId);
            return Ok(statements);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching statements");
            return StatusCode(500, new { error = "Failed to fetch statements" });
        }
    }

    /// <summary>
    /// GET /api/royalties/statements/{statementId}
    /// Get detailed statement with line items
    /// </summary>
    [HttpGet("statements/{statementId}")]
    public async Task<IActionResult> GetStatement(string statementId)
    {
        try
        {
            var statement = await _royaltyService.GetStatementAsync(statementId);

            var response = new StatementDetailResponse
            {
                Id = statement.Id.ToString(),
                ArtistId = statement.ArtistId,
                PeriodStart = statement.PeriodStart,
                PeriodEnd = statement.PeriodEnd,
                GrossRevenue = statement.GrossRevenue,
                DistributorCutAmount = statement.DistributorCutAmount,
                DistributorCutPercent = statement.DistributorCutPercent,
                NetToArtist = statement.NetToArtist,
                Status = statement.Status,
                CreatedAt = statement.CreatedAt,
                FinalizedAt = statement.FinalizedAt,
                LineItems = statement.LineItems
            };

            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = $"Statement {statementId} not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching statement");
            return StatusCode(500, new { error = "Failed to fetch statement" });
        }
    }

    /// <summary>
    /// POST /api/admin/royalties/generate
    /// Generate statements for a period (admin only)
    /// </summary>
    [HttpPost("admin/generate")]
    public async Task<IActionResult> GenerateStatements([FromBody] GenerateStatementsRequest request)
    {
        try
        {
            if (request.PeriodStart >= request.PeriodEnd)
                return BadRequest(new { error = "PeriodStart must be before PeriodEnd" });

            var response = await _royaltyService.GenerateStatementsAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating statements");
            return StatusCode(500, new { error = "Failed to generate statements" });
        }
    }

    /// <summary>
    /// PATCH /api/admin/royalties/statements/{statementId}/finalize
    /// Finalize a statement (marks as ready for payout)
    /// </summary>
    [HttpPatch("admin/statements/{statementId}/finalize")]
    public async Task<IActionResult> FinalizeStatement(string statementId)
    {
        try
        {
            var statement = await _royaltyService.FinalizeStatementAsync(statementId);
            return Ok(statement);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = $"Statement {statementId} not found" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finalizing statement");
            return StatusCode(500, new { error = "Failed to finalize statement" });
        }
    }

    /// <summary>
    /// POST /api/admin/royalties/statements/{statementId}/payout
    /// Create payout for a finalized statement
    /// </summary>
    [HttpPost("admin/statements/{statementId}/payout")]
    public async Task<IActionResult> CreatePayout(string statementId, [FromBody] CreatePayoutRequest request)
    {
        try
        {
            var payout = await _royaltyService.CreatePayoutAsync(statementId, request);
            return CreatedAtAction(nameof(GetPayout), new { payoutId = payout.Id }, payout);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = $"Statement {statementId} not found" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payout");
            return StatusCode(500, new { error = "Failed to create payout" });
        }
    }

    /// <summary>
    /// GET /api/admin/royalties/payouts/{payoutId}
    /// Get payout details
    /// </summary>
    [HttpGet("admin/payouts/{payoutId}")]
    public async Task<IActionResult> GetPayout(string payoutId)
    {
        try
        {
            // In production, fetch from payouts collection
            // For now, return 200 with mock data
            return Ok(new { id = payoutId, message = "Payout retrieved" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching payout");
            return StatusCode(500, new { error = "Failed to fetch payout" });
        }
    }

    /// <summary>
    /// PATCH /api/admin/royalties/payouts/{payoutId}/mark-paid
    /// Mark a payout as paid (admin only)
    /// </summary>
    [HttpPatch("admin/payouts/{payoutId}/mark-paid")]
    public async Task<IActionResult> MarkPayoutAsPaid(string payoutId)
    {
        try
        {
            var payout = await _royaltyService.MarkPayoutAsPaidAsync(payoutId);
            return Ok(payout);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = $"Payout {payoutId} not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking payout as paid");
            return StatusCode(500, new { error = "Failed to mark payout as paid" });
        }
    }
}
