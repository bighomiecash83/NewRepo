using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using DMF_MUSIC_PLATFORM.Data;
using DMF_MUSIC_PLATFORM.Authorization;
using System.Security.Claims;

namespace DMF_MUSIC_PLATFORM.Components.Account
{
    /// <summary>
    /// API endpoint for user authorization info.
    /// Used by frontend to check role/founder status and display appropriate UI.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<AuthController> _logger;

        public AuthController(UserManager<ApplicationUser> userManager, ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        /// <summary>
        /// Get current user's authorization info
        /// </summary>
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUserAsync()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            return Ok(new
            {
                userId = user.Id,
                email = user.Email,
                displayName = user.DisplayName,
                isFounder = user.IsFounder,
                roles = user.GetRoles(),
                organizationId = user.OrganizationId,
                requiresMfaForSensitive = user.RequiresMfaForSensitive,
                createdUtc = user.CreatedUtc
            });
        }

        /// <summary>
        /// Check if current user is founder
        /// </summary>
        [Authorize]
        [HttpGet("is-founder")]
        public async Task<IActionResult> IsFounderAsync()
        {
            var user = await _userManager.GetUserAsync(User);
            return Ok(new { isFounder = user?.IsFounder ?? false });
        }

        /// <summary>
        /// Check if current user has a specific role
        /// </summary>
        [Authorize]
        [HttpPost("has-role")]
        public async Task<IActionResult> HasRoleAsync([FromBody] CheckRoleRequest request)
        {
            if (string.IsNullOrEmpty(request?.Role))
                return BadRequest("Role is required");

            var user = await _userManager.GetUserAsync(User);
            var hasRole = user?.HasRole(request.Role) ?? false;
            return Ok(new { hasRole });
        }

        /// <summary>
        /// Get current user's roles as array
        /// </summary>
        [Authorize]
        [HttpGet("roles")]
        public async Task<IActionResult> GetRolesAsync()
        {
            var user = await _userManager.GetUserAsync(User);
            return Ok(new { roles = user?.GetRoles() ?? new[] { "artist" } });
        }

        public class CheckRoleRequest
        {
            public string? Role { get; set; }
        }
    }
}
