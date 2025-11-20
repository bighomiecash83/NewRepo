using System.Threading;
using System.Threading.Tasks;
using DmfMusicPlatform.StreamGod.Services;
using Microsoft.AspNetCore.Mvc;

namespace DmfMusicPlatform.Web.Controllers
{
    [ApiController]
    [Route("api/ad-actions")]
    // [Authorize] // add when auth is wired
    public class AdActionExecutionController : ControllerBase
    {
        private readonly IAdActionExecutor _executor;

        public AdActionExecutionController(IAdActionExecutor executor)
        {
            _executor = executor;
        }

        /// <summary>
        /// Apply recent bot recommendations to campaigns (scale, cut, pause).
        /// Respects campaign-level AllowAutoBudgetAdjustments and AllowAutoPause flags.
        /// 
        /// Example (dry run):
        /// POST /api/ad-actions/apply?hoursBack=24&dryRun=true
        /// 
        /// Example (live):
        /// POST /api/ad-actions/apply?hoursBack=24&dryRun=false
        /// </summary>
        [HttpPost("apply")]
        public async Task<ActionResult<AdActionExecutionResult>> Apply(
            [FromQuery] int hoursBack = 24,
            [FromQuery] bool dryRun = true,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _executor.ApplyRecentActionsAsync(hoursBack, dryRun, cancellationToken);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { error = "Failed to apply actions.", detail = ex.Message });
            }
        }
    }
}
