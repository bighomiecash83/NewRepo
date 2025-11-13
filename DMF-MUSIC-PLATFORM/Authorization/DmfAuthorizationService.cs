using System.Security.Claims;

namespace DMF_MUSIC_PLATFORM.Authorization
{
    /// <summary>
    /// Shared authorization service for both server and WebAssembly client
    /// Checks user claims and roles
    /// </summary>
    public class DmfAuthorizationService
    {
        public const string FounderEmail = "bighomiecash8346@gmail.com";

        /// <summary>
        /// Check if user is founder
        /// </summary>
        public static bool IsFounder(ClaimsPrincipal user)
        {
            return user?.FindFirst("dmf:founder")?.Value == "true";
        }

        /// <summary>
        /// Check if user has a specific role
        /// </summary>
        public static bool HasRole(ClaimsPrincipal user, string role)
        {
            if (user == null) return false;
            var roles = user.FindFirst("dmf:roles")?.Value ?? "";
            return roles.Split(',', StringSplitOptions.RemoveEmptyEntries)
                       .Any(r => r.Trim().Equals(role, StringComparison.OrdinalIgnoreCase));
        }

        /// <summary>
        /// Check if user has any of the specified roles
        /// </summary>
        public static bool HasAnyRole(ClaimsPrincipal user, params string[] roles)
        {
            return roles.Any(r => HasRole(user, r));
        }

        /// <summary>
        /// Check if user has financial access (payouts, royalties)
        /// </summary>
        public static bool HasFinancialAccess(ClaimsPrincipal user)
        {
            return IsFounder(user) || HasRole(user, DmfRoles.Finance) || HasRole(user, DmfRoles.OrgOwner);
        }

        /// <summary>
        /// Check if user can manage organization members
        /// </summary>
        public static bool CanManageOrg(ClaimsPrincipal user)
        {
            return IsFounder(user) || HasAnyRole(user, DmfRoles.OrgOwner, DmfRoles.OrgAdmin, DmfRoles.Manager);
        }

        /// <summary>
        /// Check if user can edit content (metadata, assets, etc.)
        /// </summary>
        public static bool CanEditContent(ClaimsPrincipal user)
        {
            return IsFounder(user) || HasAnyRole(user, DmfRoles.ContentEditor, DmfRoles.OrgAdmin);
        }

        /// <summary>
        /// Check if user is read-only (analyst)
        /// </summary>
        public static bool IsReadOnlyUser(ClaimsPrincipal user)
        {
            return HasRole(user, DmfRoles.Analyst);
        }

        /// <summary>
        /// Check if user requires MFA for sensitive operations
        /// </summary>
        public static bool RequiresMfaForSensitive(ClaimsPrincipal user)
        {
            return user?.FindFirst("dmf:mfa_required")?.Value == "true";
        }

        /// <summary>
        /// Get user's organization ID
        /// </summary>
        public static string? GetOrganizationId(ClaimsPrincipal user)
        {
            return user?.FindFirst("dmf:orgid")?.Value;
        }

        /// <summary>
        /// Get user's display name
        /// </summary>
        public static string? GetDisplayName(ClaimsPrincipal user)
        {
            return user?.FindFirst(ClaimTypes.Name)?.Value ?? user?.FindFirst(ClaimTypes.Email)?.Value;
        }
    }
}
