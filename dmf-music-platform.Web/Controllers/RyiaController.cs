using System.Threading.Tasks;
using dmf_music_platform.Web.Domain.Config;
using dmf_music_platform.Web.Domain.Services;
using Microsoft.AspNetCore.Mvc;

namespace dmf_music_platform.Web.Controllers
{
    [ApiController]
    [Route("api/ryia")]
    public class RyiaController : ControllerBase
    {
        private readonly RyiaService _ryiaService;
        private readonly RyiaConfig _ryiaConfig;

        public RyiaController(RyiaService ryiaService, RyiaConfig ryiaConfig)
        {
            _ryiaService = ryiaService;
            _ryiaConfig = ryiaConfig;
        }

        [HttpGet("profile")]
        public IActionResult GetProfile() => Ok(_ryiaConfig);

        public class RyiaMessageRequest
        {
            public string Mode { get; set; } = "plan"; // plan | code | impact
            public string Request { get; set; } = string.Empty;
            public string? CurrentCode { get; set; }
        }

        [HttpPost("message")]
        public async Task<IActionResult> PostMessage([FromBody] RyiaMessageRequest request)
        {
            string result = request.Mode?.ToLowerInvariant() switch
            {
                "code" => await _ryiaService.SuggestCodeAsync(request.Request, request.CurrentCode),
                "impact" => await _ryiaService.ExplainImpactAsync(request.Request),
                _ => await _ryiaService.PlanFeatureAsync(request.Request)
            };

            return Ok(new { mode = request.Mode, response = result });
        }
    }
}
