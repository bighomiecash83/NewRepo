// Data/Repositories/IMongoRepository.cs
// Base interface for all MongoDB repositories

using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DmfMusicPlatform.Data.Repositories
{
    /// <summary>
    /// Base interface for MongoDB repositories.
    /// All DMF core data (artists, releases, royalties, etc.) lives here.
    /// </summary>
    public interface IMongoRepository<T> where T : class
    {
        Task<T> GetByIdAsync(string id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Func<T, bool> predicate);
        Task<T> InsertAsync(T entity);
        Task<T> UpdateAsync(string id, T entity);
        Task<bool> DeleteAsync(string id);
    }

    /// <summary>
    /// Artist repository - Mongo source of truth for roster.
    /// </summary>
    public interface IArtistRepository : IMongoRepository<Artist>
    {
        Task<Artist> GetByEmailAsync(string email);
        Task<IEnumerable<Artist>> GetActiveArtistsAsync();
    }

    /// <summary>
    /// Release repository - Mongo source of truth for releases, tracks, ISRC, UPC.
    /// </summary>
    public interface IReleaseRepository : IMongoRepository<Release>
    {
        Task<IEnumerable<Release>> GetByArtistIdAsync(string artistId);
        Task<IEnumerable<Release>> GetReleasesReadyForDistributionAsync();
    }

    /// <summary>
    /// Royalty repository - Mongo source of truth for statements, payouts, earnings.
    /// </summary>
    public interface IRoyaltyRepository : IMongoRepository<RoyaltyStatement>
    {
        Task<IEnumerable<RoyaltyStatement>> GetByArtistIdAsync(string artistId);
        Task<decimal> GetTotalEarningsAsync(string artistId);
        Task<IEnumerable<RoyaltyStatement>> GetUnpaidStatementsAsync();
    }

    /// <summary>
    /// Catalog repository - StreamGod Brain scoring + health data.
    /// </summary>
    public interface ICatalogRepository : IMongoRepository<CatalogEntry>
    {
        Task<CatalogEntry> GetCatalogHealthAsync();
        Task<IEnumerable<CatalogEntry>> GetEntriesByReadinessAsync(int minScore);
    }

    /// <summary>
    /// DSP Status repository - Mongo source of truth for distribution status per platform.
    /// </summary>
    public interface IDspStatusRepository : IMongoRepository<DspStatus>
    {
        Task<IEnumerable<DspStatus>> GetByReleaseIdAsync(string releaseId);
        Task<IEnumerable<DspStatus>> GetByPlatformAsync(string platform);
    }
}
