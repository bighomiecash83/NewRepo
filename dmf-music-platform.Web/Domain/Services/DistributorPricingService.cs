using dmf_music_platform.Web.Domain.Config;
using dmf_music_platform.Web.Domain.Distributor;

namespace dmf_music_platform.Web.Domain.Services
{
    public class DistributorPricingService
    {
        private readonly DmfPricingConfig _pricing;

        public string Currency => _pricing.Currency;

        public DistributorPricingService(DmfPricingConfig pricing)
        {
            _pricing = pricing;
        }

        public decimal GetReleasePrice(ReleaseType releaseType, int trackCount)
        {
            var key = releaseType switch
            {
                ReleaseType.Single => "single",
                ReleaseType.EP => "ep",
                ReleaseType.Album => "album",
                ReleaseType.Mixtape => "mixtape",
                _ => "single"
            };

            if (_pricing.Distribution.TryGetValue(key, out var tier))
                return tier.Price;

            return 0m;
        }

        public decimal GetReleasePrice(int trackCount)
        {
            if (trackCount <= 1 && _pricing.Distribution.TryGetValue("single", out var single))
                return single.Price;
            if (trackCount <= 6 && _pricing.Distribution.TryGetValue("ep", out var ep))
                return ep.Price;
            if (trackCount <= 20 && _pricing.Distribution.TryGetValue("album", out var album))
                return album.Price;
            if (_pricing.Distribution.TryGetValue("mixtape", out var mixtape))
                return mixtape.Price;
            return 0m;
        }

        public decimal GetCatalogMigrationPrice(int trackCount)
        {
            if (trackCount <= 1 && _pricing.CatalogMigration.TryGetValue("single", out var single))
                return single.Price;
            if (trackCount <= 6 && _pricing.CatalogMigration.TryGetValue("ep", out var ep))
                return ep.Price;
            if (trackCount <= 20 && _pricing.CatalogMigration.TryGetValue("album", out var album))
                return album.Price;
            if (_pricing.CatalogMigration.TryGetValue("mixtape", out var mixtape))
                return mixtape.Price;
            return 0m;
        }

        public (int artist, int dmf) GetGrowthSplit()
        {
            return (90, 10);
        }
    }
}
