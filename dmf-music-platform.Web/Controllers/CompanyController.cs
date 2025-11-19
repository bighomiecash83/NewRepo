using System.Collections.Generic;
using DmfMusicPlatform.Domain;
using Microsoft.AspNetCore.Mvc;

namespace DmfMusicPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompanyController : ControllerBase
    {
        private readonly DmfCompanyConfig _config;

        // Config is injected via DI from Program.cs
        public CompanyController(DmfCompanyConfig config)
        {
            _config = config ?? new DmfCompanyConfig();
        }

        [HttpGet("profile")]
        public ActionResult<CompanyProfile> GetProfile()
        {
            if (_config.CompanyProfile == null)
            {
                return StatusCode(500, new { error = "Company profile not loaded" });
            }

            return Ok(_config.CompanyProfile);
        }

        [HttpGet("services")]
        public ActionResult<IEnumerable<ServiceDivision>> GetServiceDivisions()
        {
            if (_config.ServiceDivisions == null || _config.ServiceDivisions.Count == 0)
            {
                return StatusCode(500, new { error = "Service divisions not loaded" });
            }

            return Ok(_config.ServiceDivisions);
        }

        [HttpGet("status")]
        public ActionResult<object> StatusCheck()
        {
            return Ok(new
            {
                status = "ok",
                company = _config.CompanyProfile?.Branding?.ShortName ?? "Unknown",
                serviceCount = _config.ServiceDivisions?.Count ?? 0,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
