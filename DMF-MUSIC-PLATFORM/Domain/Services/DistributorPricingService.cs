using dmf_music_platform.Domain.Distributor;
using dmf_music_platform.Domain.Config;

namespace dmf_music_platform.Domain.Services
{
    public class DistributorPricingService
    {
        private readonly DmfPricingConfig _config;

        public string Currency => _config.Currency;

        public DistributorPricingService(DmfPricingConfig config)
        {
            _config = config;
        }

        public decimal GetReleasePrice(ReleaseType releaseType, int trackCount)
        {
            var basePrice = releaseType switch
            {
                ReleaseType.Single => _config.Distribution["single"],
                ReleaseType.EP => _config.Distribution["ep"],
                ReleaseType.Album => _config.Distribution["album"],
                ReleaseType.Mixtape => _config.Distribution["mixtape"],
                _ => _config.Distribution["single"]
            };

            return basePrice;
        }

        public List<PayoutTierConfig> GetPayoutTiers()
        {
            return _config.PayoutTiers;
        }
    }
}
