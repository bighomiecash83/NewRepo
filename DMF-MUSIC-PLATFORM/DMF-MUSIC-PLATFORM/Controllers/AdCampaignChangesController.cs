using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using DmfMusicPlatform.StreamGod.Ads;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace DmfMusicPlatform.Web.Controllers
{
    [ApiController]
    [Route("api/ad-campaign-changes")]
    // [Authorize] // add when auth is wired
    public class AdCampaignChangesController : ControllerBase
    {
        private readonly IAdDataContext _ctx;

        public AdCampaignChangesController(IAdDataContext ctx)
        {
            _ctx = ctx;
        }

        /// <summary>
        /// Get recent campaign change logs. Optional filter by artistId or campaignId.
        /// GET /api/ad-campaign-changes?artistId=...&campaignId=...&limit=50
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdCampaignChangeLog>>> Get(
            [FromQuery] string? artistId,
            [FromQuery] string? campaignId,
            [FromQuery] int limit = 50,
            CancellationToken cancellationToken = default)
        {
            try
            {
                if (limit <= 0) limit = 20;
                if (limit > 200) limit = 200;

                var filter = FilterDefinition<AdCampaignChangeLog>.Empty;

                if (!string.IsNullOrWhiteSpace(campaignId))
                {
                    filter = Builders<AdCampaignChangeLog>.Filter.Eq(l => l.CampaignId, campaignId);
                }
                else if (!string.IsNullOrWhiteSpace(artistId))
                {
                    filter = Builders<AdCampaignChangeLog>.Filter.Eq(l => l.ArtistId, artistId);
                }

                var logs = await _ctx.AdCampaignChangeLogs
                    .Find(filter)
                    .SortByDescending(l => l.ChangedAt)
                    .Limit(limit)
                    .ToListAsync(cancellationToken);

                return Ok(logs);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch campaign change logs.", detail = ex.Message });
            }
        }
    }
}
