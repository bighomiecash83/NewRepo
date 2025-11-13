using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using DMF_MUSIC_PLATFORM.Data;

namespace DMF_MUSIC_PLATFORM.Authorization
{
    /// <summary>
    /// Handles Google OAuth sign-in: detects founder, creates/updates user, sets claims
    /// </summary>
    public class GoogleSignInHandler
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<GoogleSignInHandler> _logger;
        private const string FounderEmail = "bighomiecash8346@gmail.com";

        public GoogleSignInHandler(UserManager<ApplicationUser> userManager, ILogger<GoogleSignInHandler> logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        /// <summary>
        /// Handle Google OAuth callback: create/update user, detect founder, add claims
        /// Called after successful Google authentication
        /// </summary>
        public async Task OnTicketReceivedAsync(TicketReceivedContext context)
        {
            try
            {
                var principal = context.Principal;
                var email = principal?.FindFirstValue(ClaimTypes.Email);
                var name = principal?.FindFirstValue(ClaimTypes.Name);

                if (string.IsNullOrEmpty(email))
                {
                    _logger.LogWarning("Google sign-in: No email claim found");
                    return;
                }

                var user = await _userManager.FindByEmailAsync(email);
                bool isNewUser = user == null;

                if (isNewUser)
                {
                    user = new ApplicationUser
                    {
                        UserName = email,
                        Email = email,
                        EmailConfirmed = true, // Google email is verified
                        DisplayName = name ?? email.Split('@')[0],
                        CreatedUtc = DateTime.UtcNow,
                        IsFounder = email.Equals(FounderEmail, StringComparison.OrdinalIgnoreCase)
                    };

                    // Default role: founder gets founder, others get artist
                    user.Roles = user.IsFounder ? "founder" : "artist";
                    user.RequiresMfaForSensitive = user.IsFounder; // Founder needs MFA for sensitive ops

                    var result = await _userManager.CreateAsync(user);
                    if (!result.Succeeded)
                    {
                        _logger.LogError($"Failed to create user {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                        return;
                    }

                    _logger.LogInformation($"Created new user {email}, IsFounder={user.IsFounder}");
                }
                else
                {
                    // Update existing user's display name and founder status if email matches
                    if (email.Equals(FounderEmail, StringComparison.OrdinalIgnoreCase) && !user.IsFounder)
                    {
                        user.IsFounder = true;
                        user.Roles = "founder";
                        user.RequiresMfaForSensitive = true;
                        await _userManager.UpdateAsync(user);
                        _logger.LogInformation($"Updated user {email} as founder");
                    }

                    if (!string.IsNullOrEmpty(name) && string.IsNullOrEmpty(user.DisplayName))
                    {
                        user.DisplayName = name;
                        await _userManager.UpdateAsync(user);
                    }
                }

                // Add claims to principal for authorization
                var identity = new ClaimsIdentity();
                identity.AddClaim(new Claim("dmf:founder", user.IsFounder ? "true" : "false"));
                identity.AddClaim(new Claim("dmf:roles", user.Roles ?? "artist"));
                identity.AddClaim(new Claim("dmf:mfa_required", user.RequiresMfaForSensitive ? "true" : "false"));

                if (!string.IsNullOrEmpty(user.OrganizationId))
                {
                    identity.AddClaim(new Claim("dmf:orgid", user.OrganizationId));
                }

                principal?.AddIdentity(identity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Google sign-in");
            }
        }
    }
}
