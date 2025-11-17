using dmf_music_platform.Web.Domain.Services;
using dmf_music_platform.Web.Domain.Distributor;
using dmf_music_platform.Web.Domain.Distributor.Services;
using Microsoft.AspNetCore.Mvc;

namespace dmf_music_platform.Web.Controllers
{
    [ApiController]
    [Route("api/distributor")]
    public class DistributorController : ControllerBase
    {
        private readonly DistributorPricingService _pricingService;
        private readonly PayoutService _payoutService;

        public DistributorController(
            DistributorPricingService pricingService,
            PayoutService payoutService)
        {
            _pricingService = pricingService;
            _payoutService = payoutService;
        }

        [HttpPost("release/quote")]
        public IActionResult QuoteRelease([FromBody] ReleaseQuoteRequest request)
        {
            var price = _pricingService.GetReleasePrice(request.ReleaseType, request.TrackCount);
            var payoutProfile = _payoutService.GetPayoutProfile(request.PayoutTierCode ?? "indie_basic");

            var result = new
            {
                request.ReleaseType,
                request.TrackCount,
                Price = price,
                Currency = _pricingService.Currency,
                payoutProfile.ArtistSharePercent,
                payoutProfile.DmfSharePercent,
                payoutProfile.LabelSharePercent
            };

            return Ok(result);
        }

        [HttpPost("payout/quote")]
        public IActionResult QuotePayout([FromBody] PayoutQuoteRequest request)
        {
            var result = _payoutService.Quote(request);
            return Ok(result);
        }

        [HttpPost("release/draft")]
        public IActionResult CreateDraft([FromBody] ReleaseDraft draft)
        {
            // later: persist to MongoDB; for now just return it with payout profile filled
            draft.PayoutProfile = _payoutService.GetPayoutProfile(draft.PayoutProfile?.TierCode ?? "indie_basic");
            return Ok(draft);
        }

        // Legacy endpoint for backward compatibility
        [HttpPost("migration/quote")]
        public IActionResult GetMigrationQuote([FromBody] MigrationQuoteRequest request)
        {
            var price = _pricingService.GetReleasePrice(ReleaseType.Single, request.TrackCount);
            return Ok(new { trackCount = request.TrackCount, price, currency = "USD" });
        }
    }

    public class ReleaseQuoteRequest
    {
        public ReleaseType ReleaseType { get; set; }
        public int TrackCount { get; set; }
        public string? PayoutTierCode { get; set; }
    }

    public class MigrationQuoteRequest
    {
        public int TrackCount { get; set; }
    }
}
