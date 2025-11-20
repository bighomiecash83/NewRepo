using dmf_music_platform.Domain.Distributor;
using dmf_music_platform.Domain.Config;

namespace dmf_music_platform.Domain.Services
{
    public class PayoutService
    {
        private readonly DmfPricingConfig _config;

        public PayoutService(DmfPricingConfig config)
        {
            _config = config;
        }

        public PayoutProfile GetPayoutProfile(string tierCode)
        {
            var tier = _config.PayoutTiers.FirstOrDefault(t => t.Code == tierCode)
                       ?? _config.PayoutTiers.First(t => t.Code == "indie_basic");

            return new PayoutProfile
            {
                TierCode = tier.Code,
                ArtistSharePercent = tier.ArtistSharePercent,
                DmfSharePercent = tier.DmfSharePercent,
                LabelSharePercent = tier.LabelSharePercent,
                Notes = tier.Description
            };
        }

        public PayoutQuoteResult Quote(PayoutQuoteRequest request)
        {
            var profile = GetPayoutProfile(request.TierCode);

            var artistAmount = request.ProjectedRevenue * (profile.ArtistSharePercent / 100m);
            var dmfAmount = request.ProjectedRevenue * (profile.DmfSharePercent / 100m);
            decimal? labelAmount = null;

            if (profile.LabelSharePercent.HasValue && profile.LabelSharePercent.Value > 0)
            {
                labelAmount = request.ProjectedRevenue * (profile.LabelSharePercent.Value / 100m);
            }

            return new PayoutQuoteResult
            {
                TierCode = profile.TierCode,
                ProjectedRevenue = request.ProjectedRevenue,
                ArtistAmount = decimal.Round(artistAmount, 2),
                DmfAmount = decimal.Round(dmfAmount, 2),
                LabelAmount = labelAmount.HasValue ? decimal.Round(labelAmount.Value, 2) : null,
                ArtistSharePercent = profile.ArtistSharePercent,
                DmfSharePercent = profile.DmfSharePercent,
                LabelSharePercent = profile.LabelSharePercent
            };
        }
    }
}
