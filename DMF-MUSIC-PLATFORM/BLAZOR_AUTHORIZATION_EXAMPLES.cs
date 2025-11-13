// Example: Using Authorization in Blazor WebAssembly Components
// This file shows common patterns for checking founder/roles in UI

using System.Security.Claims;
using DMF_MUSIC_PLATFORM.Authorization;

namespace DMF_MUSIC_PLATFORM.Client.Example
{
    /// <summary>
    /// Example Razor component showing authorization checks
    /// Place in: DMF-MUSIC-PLATFORM.Client/Pages/AuthorizationExamples.razor
    /// </summary>
    public class AuthorizationExamplesCode
    {
        // ============================================================================
        // EXAMPLE 1: Check if User is Founder
        // ============================================================================
        
        public class FounderOnlyComponentExample
        {
            /*
@using System.Security.Claims
@using DMF_MUSIC_PLATFORM.Authorization
@inject AuthenticationStateProvider AuthenticationStateProvider

<div>
    <AuthorizeView>
        <Authorized>
            @if (isFounder)
            {
                <div class="founder-section">
                    <h2>Founder Control Panel</h2>
                    <button @onclick="ShowPlatformSettings">Platform Settings</button>
                    <button @onclick="ShowMasterVault">Master Vault</button>
                    <button @onclick="ShowSystemHealth">System Health</button>
                </div>
            }
            else
            {
                <div class="no-access">
                    <p>You do not have founder access.</p>
                </div>
            }
        </Authorized>
        <NotAuthorized>
            <p>Please log in first.</p>
        </NotAuthorized>
    </AuthorizeView>
</div>

@code {
    private bool isFounder = false;

    protected override async Task OnInitializedAsync()
    {
        var authState = await AuthenticationStateProvider.GetAuthenticationStateAsync();
        var user = authState.User;
        
        isFounder = DmfAuthorizationService.IsFounder(user);
    }

    private async Task ShowPlatformSettings()
    {
        // Navigate to founder platform settings
    }

    private async Task ShowMasterVault()
    {
        // Navigate to master vault
    }

    private async Task ShowSystemHealth()
    {
        // Navigate to system health
    }
}
            */
        }

        // ============================================================================
        // EXAMPLE 2: Check for Multiple Roles
        // ============================================================================
        
        public class MultiRoleComponentExample
        {
            /*
@using System.Security.Claims
@using DMF_MUSIC_PLATFORM.Authorization
@inject AuthenticationStateProvider AuthenticationStateProvider

<div>
    @if (canManageOrg)
    {
        <section>
            <h3>Organization Management</h3>
            <button>Add Member</button>
            <button>Assign Roles</button>
            <button>Remove Member</button>
        </section>
    }

    @if (hasFinancialAccess)
    {
        <section>
            <h3>Financial</h3>
            <button>View Payouts</button>
            <button>Generate Statements</button>
        </section>
    }

    @if (canEditContent)
    {
        <section>
            <h3>Content Management</h3>
            <button>Upload Assets</button>
            <button>Edit Metadata</button>
        </section>
    }

    @if (isReadOnlyUser)
    {
        <div class="info-box">
            You have read-only access to dashboards.
        </div>
    }
</div>

@code {
    private bool canManageOrg = false;
    private bool hasFinancialAccess = false;
    private bool canEditContent = false;
    private bool isReadOnlyUser = false;

    protected override async Task OnInitializedAsync()
    {
        var authState = await AuthenticationStateProvider.GetAuthenticationStateAsync();
        var user = authState.User;
        
        // Use service methods
        canManageOrg = DmfAuthorizationService.CanManageOrg(user);
        hasFinancialAccess = DmfAuthorizationService.HasFinancialAccess(user);
        canEditContent = DmfAuthorizationService.CanEditContent(user);
        isReadOnlyUser = DmfAuthorizationService.IsReadOnlyUser(user);
    }
}
            */
        }

        // ============================================================================
        // EXAMPLE 3: Call Auth API Endpoints from Client
        // ============================================================================
        
        public class AuthApiClientExample
        {
            /*
@using System.Net.Http.Json
@inject HttpClient Http
@inject AuthenticationStateProvider AuthenticationStateProvider

<div>
    <button @onclick="FetchUserInfo">Get User Info</button>
    <button @onclick="CheckFounderStatus">Check Founder</button>
    <button @onclick="GetRoles">Get Roles</button>

    @if (currentUser != null)
    {
        <div class="user-info">
            <p><strong>Email:</strong> @currentUser.Email</p>
            <p><strong>Display Name:</strong> @currentUser.DisplayName</p>
            <p><strong>Is Founder:</strong> @currentUser.IsFounder</p>
            <p><strong>Roles:</strong> @string.Join(", ", currentUser.Roles)</p>
            <p><strong>Organization:</strong> @(currentUser.OrganizationId ?? "None")</p>
        </div>
    }
</div>

@code {
    private UserInfoDto? currentUser;

    public class UserInfoDto
    {
        public string UserId { get; set; }
        public string Email { get; set; }
        public string DisplayName { get; set; }
        public bool IsFounder { get; set; }
        public string[] Roles { get; set; }
        public string OrganizationId { get; set; }
        public bool RequiresMfaForSensitive { get; set; }
        public DateTime CreatedUtc { get; set; }
    }

    public class FounderCheckDto
    {
        public bool IsFounder { get; set; }
    }

    public class RolesDto
    {
        public string[] Roles { get; set; }
    }

    private async Task FetchUserInfo()
    {
        try
        {
            currentUser = await Http.GetFromJsonAsync<UserInfoDto>("/api/auth/me");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task CheckFounderStatus()
    {
        try
        {
            var result = await Http.GetFromJsonAsync<FounderCheckDto>("/api/auth/is-founder");
            Console.WriteLine($"Is Founder: {result.IsFounder}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task GetRoles()
    {
        try
        {
            var result = await Http.GetFromJsonAsync<RolesDto>("/api/auth/roles");
            Console.WriteLine($"Roles: {string.Join(", ", result.Roles)}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
            */
        }

        // ============================================================================
        // EXAMPLE 4: Conditional Navigation Based on Role
        // ============================================================================
        
        public class ConditionalNavigationExample
        {
            /*
@using System.Security.Claims
@using DMF_MUSIC_PLATFORM.Authorization
@inject AuthenticationStateProvider AuthenticationStateProvider
@inject NavigationManager NavigationManager

<nav>
    <ul>
        <li><a href="/">Dashboard</a></li>
        
        @if (userRoles.Contains(DmfRoles.Artist))
        {
            <li><a href="/releases">My Releases</a></li>
        }
        
        @if (DmfAuthorizationService.CanManageOrg(user))
        {
            <li><a href="/org/members">Organization Members</a></li>
            <li><a href="/org/settings">Org Settings</a></li>
        }
        
        @if (DmfAuthorizationService.HasFinancialAccess(user))
        {
            <li><a href="/finance/payouts">Payouts</a></li>
            <li><a href="/finance/statements">Statements</a></li>
        }
        
        @if (DmfAuthorizationService.IsFounder(user))
        {
            <li><a href="/founder/platform">Platform Settings</a></li>
            <li><a href="/founder/vault">Master Vault</a></li>
            <li><a href="/founder/ops">System Ops</a></li>
        }
    </ul>
</nav>

@code {
    private ClaimsPrincipal? user;
    private string[] userRoles = Array.Empty<string>();

    protected override async Task OnInitializedAsync()
    {
        var authState = await AuthenticationStateProvider.GetAuthenticationStateAsync();
        user = authState.User;
        
        var rolesString = user?.FindFirst("dmf:roles")?.Value ?? "";
        userRoles = rolesString.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(r => r.Trim())
            .ToArray();
    }
}
            */
        }

        // ============================================================================
        // EXAMPLE 5: MFA Step-Up Check
        // ============================================================================
        
        public class MfaStepUpExample
        {
            /*
@using System.Security.Claims
@using DMF_MUSIC_PLATFORM.Authorization
@inject AuthenticationStateProvider AuthenticationStateProvider

<div>
    <h2>Sensitive Operation</h2>
    
    @if (requiresMfa && !mfaCompleted)
    {
        <div class="mfa-required">
            <p>MFA verification is required for this action.</p>
            <button @onclick="VerifyMfa">Verify with Authenticator</button>
        </div>
    }
    else
    {
        <button @onclick="PerformSensitiveAction">
            Execute Payout
        </button>
    }
</div>

@code {
    private bool requiresMfa = false;
    private bool mfaCompleted = false;

    protected override async Task OnInitializedAsync()
    {
        var authState = await AuthenticationStateProvider.GetAuthenticationStateAsync();
        var user = authState.User;
        
        requiresMfa = DmfAuthorizationService.RequiresMfaForSensitive(user);
    }

    private async Task VerifyMfa()
    {
        // Implement MFA verification flow
        // Call /api/auth/verify-mfa endpoint
        mfaCompleted = true;
    }

    private async Task PerformSensitiveAction()
    {
        // Only if MFA completed or not required
        if (!requiresMfa || mfaCompleted)
        {
            // Execute sensitive operation
        }
    }
}
            */
        }

        // ============================================================================
        // EXAMPLE 6: Display User Info in Header
        // ============================================================================
        
        public class UserHeaderExample
        {
            /*
@using System.Security.Claims
@using DMF_MUSIC_PLATFORM.Authorization
@inject AuthenticationStateProvider AuthenticationStateProvider

<header>
    <nav class="navbar">
        <div class="brand">DMF Music Platform</div>
        
        <AuthorizeView>
            <Authorized>
                <div class="user-header">
                    <span class="display-name">@userDisplayName</span>
                    
                    @if (isFounder)
                    {
                        <span class="badge founder-badge">FOUNDER</span>
                    }
                    else if (isBeta)
                    {
                        <span class="badge role-badge">@string.Join(" | ", userRoles)</span>
                    }
                    
                    <button @onclick="Logout">Logout</button>
                </div>
            </Authorized>
            <NotAuthorized>
                <div class="auth-buttons">
                    <button @onclick="@(() => NavigationManager.NavigateTo("login"))">
                        Sign In with Google
                    </button>
                </div>
            </NotAuthorized>
        </AuthorizeView>
    </nav>
</header>

@code {
    private string userDisplayName = "";
    private bool isFounder = false;
    private string[] userRoles = Array.Empty<string>();

    protected override async Task OnInitializedAsync()
    {
        var authState = await AuthenticationStateProvider.GetAuthenticationStateAsync();
        var user = authState.User;
        
        userDisplayName = DmfAuthorizationService.GetDisplayName(user) ?? "User";
        isFounder = DmfAuthorizationService.IsFounder(user);
        
        var rolesString = user?.FindFirst("dmf:roles")?.Value ?? "";
        userRoles = rolesString.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(r => r.Trim())
            .ToArray();
    }

    private async Task Logout()
    {
        // Call logout endpoint
        // NavigationManager.NavigateTo("logout");
    }
}
            */
        }

        // ============================================================================
        // USAGE REFERENCE
        // ============================================================================

        /*
AUTHORIZATION CHECKS IN BLAZOR:

1. Check if Founder:
   DmfAuthorizationService.IsFounder(user)

2. Check for specific role:
   DmfAuthorizationService.HasRole(user, DmfRoles.Finance)

3. Check for any of multiple roles:
   DmfAuthorizationService.HasAnyRole(user, DmfRoles.OrgOwner, DmfRoles.OrgAdmin)

4. Check financial access:
   DmfAuthorizationService.HasFinancialAccess(user)

5. Check org management permission:
   DmfAuthorizationService.CanManageOrg(user)

6. Check content editing permission:
   DmfAuthorizationService.CanEditContent(user)

7. Check if read-only:
   DmfAuthorizationService.IsReadOnlyUser(user)

8. Check MFA requirement:
   DmfAuthorizationService.RequiresMfaForSensitive(user)

9. Get organization ID:
   DmfAuthorizationService.GetOrganizationId(user)

10. Get display name:
    DmfAuthorizationService.GetDisplayName(user)

API ENDPOINTS TO CALL:

GET /api/auth/me
? Returns: { userId, email, displayName, isFounder, roles, organizationId, requiresMfaForSensitive, createdUtc }

GET /api/auth/is-founder
? Returns: { isFounder: bool }

POST /api/auth/has-role
Body: { "role": "finance" }
? Returns: { hasRole: bool }

GET /api/auth/roles
? Returns: { roles: string[] }
         */
    }
}
