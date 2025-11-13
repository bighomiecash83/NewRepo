using Microsoft.AspNetCore.Identity;

namespace DMF_MUSIC_PLATFORM.Data
{
    // Add profile data for application users by adding properties to the ApplicationUser class
    public class ApplicationUser : IdentityUser
    {
        /// <summary>
        /// True if user is the founder (bighomiecash8346@gmail.com)
        /// </summary>
        public bool IsFounder { get; set; } = false;

        /// <summary>
        /// Organization ID if user belongs to an org. Null for founder-only access.
        /// </summary>
        public string? OrganizationId { get; set; }

        /// <summary>
        /// Comma-separated role slugs: founder,org_owner,org_admin,artist,manager,finance,legal,a_and_r,support,content_editor,engineer,analyst
        /// </summary>
        public string? Roles { get; set; } = "artist";

        /// <summary>
        /// User's display name (e.g., artist name, real name, org name)
        /// </summary>
        public string? DisplayName { get; set; }

        /// <summary>
        /// Indicates if user requires MFA for sensitive operations (payouts, vault).
        /// Set to true if IsFounder or Finance role with access to payouts.
        /// </summary>
        public bool RequiresMfaForSensitive { get; set; } = false;

        /// <summary>
        /// Soft delete flag. Founder can restore; tenants cannot see deleted orgs.
        /// </summary>
        public bool IsDeleted { get; set; } = false;

        /// <summary>
        /// Timestamp when user was created in DMF system.
        /// </summary>
        public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Helper: Get role list as array
        /// </summary>
        public string[] GetRoles() => string.IsNullOrEmpty(Roles) 
            ? new[] { "artist" } 
            : Roles.Split(',', System.StringSplitOptions.RemoveEmptyEntries)
                   .Select(r => r.Trim())
                   .ToArray();

        /// <summary>
        /// Helper: Check if user has a specific role
        /// </summary>
        public bool HasRole(string role) => GetRoles().Contains(role.ToLower());
    }
}
