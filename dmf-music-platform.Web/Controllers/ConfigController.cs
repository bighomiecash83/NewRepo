using dmf_music_platform.Web.Domain.Config;
using Microsoft.AspNetCore.Mvc;

namespace dmf_music_platform.Web.Controllers
{
    [ApiController]
    [Route("api/config")]
    public class ConfigController : ControllerBase
    {
        private readonly DmfPricingConfig _pricing;

        public ConfigController(DmfPricingConfig pricing)
        {
            _pricing = pricing;
        }

        [HttpGet("pricing")]
        public IActionResult GetPricing()
        {
            return Ok(new
            {
                currency = _pricing.Currency,
                label = _pricing.Label,
                distribution = _pricing.Distribution,
                catalog_migration = _pricing.CatalogMigration,
                growth_partnership = _pricing.GrowthPartnership,
                boost_packages = _pricing.BoostPackages
            });
        }

        [HttpGet("pricing/industry")]
        public IActionResult GetIndustry()
        {
            return Ok(new { currency = _pricing.Currency, industry_products = _pricing.IndustryProducts });
        }
    }
}
