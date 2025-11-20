using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using DmfMusicPlatform.StreamGod.Ads;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace DmfMusicPlatform.Web.Controllers
{
    [ApiController]
    [Route("api/ad-orchestration")]
    public class AdOrchestrationController : ControllerBase
    {
        private readonly IAdDataContext _adContext;

        public AdOrchestrationController(IAdDataContext adContext)
        {
            _adContext = adContext;
        }

        /// <summary>
        /// Get summary of the ad bot system.
        /// GET /api/ad-orchestration/summary
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<object>> GetSummary(CancellationToken cancellationToken = default)
        {
            try
            {
                var activeBots = await _adContext.AdBots
                    .CountDocumentsAsync(b => b.Status == AdBotStatus.Active, cancellationToken: cancellationToken);

                var activeCampaigns = await _adContext.AdCampaigns
                    .CountDocumentsAsync(c => c.Status == AdCampaignStatus.Active, cancellationToken: cancellationToken);

                var activeCreatives = await _adContext.AdCreatives
                    .CountDocumentsAsync(c => c.Status == AdCreativeStatus.Active, cancellationToken: cancellationToken);

                var lastRun = await _adContext.AdBotRuns
                    .Find(FilterDefinition<AdBotRun>.Empty)
                    .SortByDescending(r => r.FinishedAt)
                    .FirstOrDefaultAsync(cancellationToken);

                return Ok(new
                {
                    activeBots = activeBots,
                    activeCampaigns = activeCampaigns,
                    activeCreatives = activeCreatives,
                    lastBotRunAt = lastRun?.FinishedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch system summary.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Trigger the ad bot orchestrator to run due bots.
        /// POST /api/ad-orchestration/run-due?maxBots=50
        /// </summary>
        [HttpPost("run-due")]
        public async Task<ActionResult<object>> RunDueBots(
            [FromQuery] int maxBots = 50,
            CancellationToken cancellationToken = default)
        {
            try
            {
                if (maxBots <= 0) maxBots = 1;
                if (maxBots > 500) maxBots = 500;

                // Get bots that are due to run
                var now = DateTime.UtcNow;
                var dueBots = await _adContext.AdBots
                    .Find(b =>
                        b.Status == AdBotStatus.Active &&
                        (b.NextRunAfter == null || b.NextRunAfter <= now))
                    .Limit(maxBots)
                    .ToListAsync(cancellationToken);

                int botsRun = dueBots.Count;
                int actionsCount = 0;
                var botIds = new List<string>();
                var errors = new List<string>();

                // Simulate bot runs (in production, orchestrate actual bot logic here)
                foreach (var bot in dueBots)
                {
                    try
                    {
                        // Create a bot run record
                        var run = new AdBotRun
                        {
                            Id = $"run_{bot.Id}_{DateTime.UtcNow:O}",
                            BotId = bot.Id,
                            PlaybookId = bot.CurrentPlaybookId,
                            ArtistIds = bot.AssignedArtistIds,
                            Platform = bot.Platform,
                            StartedAt = DateTime.UtcNow,
                            FinishedAt = DateTime.UtcNow,
                            Actions = new List<AdBotAction>(),
                            Status = AdBotRunStatus.Completed,
                            Errors = new List<string>()
                        };

                        // Log the run
                        await _adContext.AdBotRuns.InsertOneAsync(run, cancellationToken: cancellationToken);

                        // Update bot's last run time
                        var update = Builders<AdBot>.Update
                            .Set(b => b.LastRunAt, DateTime.UtcNow)
                            .Set(b => b.NextRunAfter, DateTime.UtcNow.AddHours(1)); // Schedule next run

                        await _adContext.AdBots.UpdateOneAsync(
                            b => b.Id == bot.Id,
                            update,
                            cancellationToken: cancellationToken);

                        botIds.Add(bot.Id);
                        // actionsCount would be populated by actual bot logic
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Bot {bot.Id}: {ex.Message}");
                    }
                }

                return Ok(new
                {
                    botsRun = botsRun,
                    actionsCount = actionsCount,
                    errorsCount = errors.Count,
                    botIds = botIds
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to trigger bot orchestration.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Get recent bot runs and their actions.
        /// Optional filter by artistId. Limited for safety.
        /// GET /api/ad-orchestration/runs?artistId=...&limit=50
        /// </summary>
        [HttpGet("runs")]
        public async Task<ActionResult<IEnumerable<AdBotRun>>> GetRuns(
            [FromQuery] string? artistId,
            [FromQuery] int limit = 50,
            CancellationToken cancellationToken = default)
        {
            try
            {
                if (limit <= 0) limit = 20;
                if (limit > 200) limit = 200;

                var filter = FilterDefinition<AdBotRun>.Empty;

                if (!string.IsNullOrWhiteSpace(artistId))
                {
                    filter = Builders<AdBotRun>.Filter.AnyEq(r => r.ArtistIds, artistId);
                }

                var runs = await _adContext.AdBotRuns
                    .Find(filter)
                    .SortByDescending(r => r.FinishedAt)
                    .Limit(limit)
                    .ToListAsync(cancellationToken);

                return Ok(runs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch bot runs.", detail = ex.Message });
            }
        }
    }
}
