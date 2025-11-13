namespace DMF_MUSIC_PLATFORM.Authorization
{
    /// <summary>
    /// DMF role slug constants (canonical)
    /// </summary>
    public static class DmfRoles
    {
        public const string Founder = "founder";
        public const string OrgOwner = "org_owner";
        public const string OrgAdmin = "org_admin";
        public const string Artist = "artist";
        public const string Manager = "manager";
        public const string Finance = "finance";
        public const string Legal = "legal";
        public const string AAndR = "a_and_r";
        public const string Support = "support";
        public const string ContentEditor = "content_editor";
        public const string Engineer = "engineer";
        public const string Analyst = "analyst";

        /// <summary>
        /// All valid role slugs
        /// </summary>
        public static readonly string[] AllRoles = new[]
        {
            Founder, OrgOwner, OrgAdmin, Artist, Manager, Finance, Legal, AAndR, Support, ContentEditor, Engineer, Analyst
        };

        /// <summary>
        /// Roles that have financial access (payouts, royalty statements)
        /// </summary>
        public static readonly string[] FinancialRoles = new[] { Founder, OrgOwner, Finance };

        /// <summary>
        /// Roles that can manage organization members
        /// </summary>
        public static readonly string[] ManagementRoles = new[] { Founder, OrgOwner, OrgAdmin, Manager };

        /// <summary>
        /// Read-only roles (Analyst, Engineer for logs only)
        /// </summary>
        public static readonly string[] ReadOnlyRoles = new[] { Analyst };
    }

    /// <summary>
    /// Authorization policy names (used in [Authorize(Policy = "...")] attributes)
    /// </summary>
    public static class DmfPolicies
    {
        public const string FounderOnly = "FounderOnly";
        public const string OrgOwnerOrAdmin = "OrgOwnerOrAdmin";
        public const string HasFinance = "HasFinance";
        public const string HasLegal = "HasLegal";
        public const string ContentManagement = "ContentManagement";
        public const string SystemOps = "SystemOps";
        public const string ReadOnlyAnalyst = "ReadOnlyAnalyst";
        public const string MfaRequired = "MfaRequired";
    }

    /// <summary>
    /// Helper to check authorization based on roles
    /// </summary>
    public static class AuthorizationHelper
    {
        /// <summary>
        /// Check if user is founder (IsFounder flag set)
        /// </summary>
        public static bool IsFounder(System.Security.Claims.ClaimsPrincipal user)
        {
            return user.FindFirst("dmf:founder")?.Value == "true";
        }

        /// <summary>
        /// Check if user has a specific role
        /// </summary>
        public static bool HasRole(System.Security.Claims.ClaimsPrincipal user, string role)
        {
            var roles = user.FindFirst("dmf:roles")?.Value ?? "";
            return roles.Split(',', System.StringSplitOptions.RemoveEmptyEntries)
                       .Any(r => r.Trim().Equals(role, System.StringComparison.OrdinalIgnoreCase));
        }

        /// <summary>
        /// Check if user has any of the specified roles
        /// </summary>
        public static bool HasAnyRole(System.Security.Claims.ClaimsPrincipal user, params string[] roles)
        {
            return roles.Any(r => HasRole(user, r));
        }

        /// <summary>
        /// Get user's organization ID from claims
        /// </summary>
        public static string? GetOrganizationId(System.Security.Claims.ClaimsPrincipal user)
        {
            return user.FindFirst("dmf:orgid")?.Value;
        }

        /// <summary>
        /// Check if user requires MFA for sensitive operations
        /// </summary>
        public static bool RequiresMfaForSensitive(System.Security.Claims.ClaimsPrincipal user)
        {
            return user.FindFirst("dmf:mfa_required")?.Value == "true";
        }
    }
}
