// Data/Repositories/ISupabaseRepository.cs
// Base interface for Supabase (Postgres) repositories

using System.Collections.Generic;
using System.Threading.Tasks;

namespace DmfMusicPlatform.Data.Repositories
{
    /// <summary>
    /// Base interface for Supabase repositories.
    /// All support data (users, sessions, logs) lives here.
    /// Supabase is read/write for non-critical data only.
    /// </summary>
    public interface ISupabaseRepository<T> where T : class
    {
        Task<T> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<T> InsertAsync(T entity);
        Task<T> UpdateAsync(int id, T entity);
        Task<bool> DeleteAsync(int id);
    }

    /// <summary>
    /// User account repository - Authentication, roles, permissions.
    /// Single source of truth for "who is allowed to log in".
    /// </summary>
    public interface IUserAccountRepository : ISupabaseRepository<UserAccount>
    {
        Task<UserAccount> GetByEmailAsync(string email);
        Task<UserAccount> GetByAuthTokenAsync(string token);
        Task<IEnumerable<UserAccount>> GetByRoleAsync(string role);
        Task<bool> IsEmailVerifiedAsync(string email);
    }

    /// <summary>
    /// Session/log repository - API usage, logins, audit trail.
    /// Non-critical data for analytics and debugging.
    /// </summary>
    public interface ISessionLogRepository : ISupabaseRepository<SessionLog>
    {
        Task<IEnumerable<SessionLog>> GetByUserIdAsync(int userId);
        Task<IEnumerable<SessionLog>> GetByDateRangeAsync(DateTime start, DateTime end);
        Task<IEnumerable<SessionLog>> GetFailedLoginAttemptsAsync(int userId, int hoursBack = 24);
    }

    /// <summary>
    /// API request log repository - Every API call gets logged here.
    /// For auditing, rate limiting, and debugging.
    /// </summary>
    public interface IApiRequestLogRepository : ISupabaseRepository<ApiRequestLog>
    {
        Task<IEnumerable<ApiRequestLog>> GetByEndpointAsync(string endpoint);
        Task<IEnumerable<ApiRequestLog>> GetByUserIdAsync(int userId);
        Task<int> GetRequestCountAsync(int userId, int minutesBack = 60);
    }

    /// <summary>
    /// Event log repository - Catalog changes, distribution events, payout triggers.
    /// For real-time dashboards and audit trail.
    /// </summary>
    public interface IEventLogRepository : ISupabaseRepository<EventLog>
    {
        Task<IEnumerable<EventLog>> GetByTypeAsync(string eventType);
        Task<IEnumerable<EventLog>> GetByEntityAsync(string entityType, string entityId);
        Task<IEnumerable<EventLog>> GetRecentEventsAsync(int count = 100);
    }
}
