# DMF Music Platform - Authorization & Founder System

## Overview

This document describes the role-based authorization system for DMF Music Platform, with special founder access for `bighomiecash8346@gmail.com`.

## Role Hierarchy & Permissions

### Role Slugs (Canonical)
- `founder` - Platform founder (you)
- `org_owner` - Organization owner
- `org_admin` - Organization admin
- `artist` - Artist/tenant
- `manager` - Manager (org-level)
- `finance` - Finance team (payouts, royalties)
- `legal` - Legal team (contracts, takedowns)
- `a_and_r` - A&R (scouting, notes)
- `support` - Support team
- `content_editor` - Content/metadata editor
- `engineer` - Systems engineer (logs, health checks)
- `analyst` - Read-only analyst

### Access Matrix

| Feature | Founder | OrgOwner | OrgAdmin | Artist | Manager | Finance | Legal | A&R | Support | ContentEditor | Engineer | Analyst |
|---------|---------|----------|----------|--------|---------|---------|-------|-----|---------|---------------|----------|---------|
| **Platform Settings** | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? |
| **Org Management** | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? |
| **Releases** | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ?? |
| **Distribution** | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ?? |
| **Payouts/Finance** | ?** | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ?? |
| **Legal/Contracts** | ?** | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? |
| **Metadata/Assets** | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ?? |
| **System Ops** | ?** | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ?? |
| **Dashboards** | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? |

**Legend:**
- ? = Full access
- ?** = Requires MFA step-up for payouts/vault
- ? = No access
- ?? = Read-only

## Founder Privileges

The founder (`bighomiecash8346@gmail.com`) has special access:

1. **Auto-Detection**: When signing in with Google, the system automatically detects your email and grants founder access
2. **All Platform Features**: Unrestricted access to all features, including:
   - Platform configuration
   - All organization data
   - Master vault (unreleased tracks, sensitive releases)
   - Bot/service management
   - System health & ops
3. **MFA for Sensitive Ops**: When performing payouts or vault operations, MFA is required
4. **No Org Restrictions**: Founder can access/modify data across all organizations

## Setup Instructions

### 1. Google OAuth Configuration

#### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Go to Credentials ? Create OAuth 2.0 Client ID (Web Application)
5. Set **Authorized redirect URIs**:
   - `https://localhost:5001/signin-google` (local dev)
   - `https://yourdomain.com/signin-google` (production)
6. Copy **Client ID** and **Client Secret**

#### Step 2: Configure appsettings.json

```json
{
  "Authentication": {
    "Google": {
      "ClientId": "YOUR_CLIENT_ID",
      "ClientSecret": "YOUR_CLIENT_SECRET"
    }
  }
}
```

Or use **User Secrets** (recommended for local dev):

```powershell
dotnet user-secrets init
dotnet user-secrets set "Authentication:Google:ClientId" "YOUR_CLIENT_ID"
dotnet user-secrets set "Authentication:Google:ClientSecret" "YOUR_CLIENT_SECRET"
```

### 2. Apply Database Migration

```powershell
dotnet ef database update
```

This adds the following columns to `AspNetUsers`:
- `IsFounder` (bit)
- `OrganizationId` (nvarchar)
- `Roles` (nvarchar)
- `DisplayName` (nvarchar)
- `RequiresMfaForSensitive` (bit)
- `IsDeleted` (bit)
- `CreatedUtc` (datetime2)

### 3. First Login

When you sign in with `bighomiecash8346@gmail.com`:

1. Google OAuth redirects you to DMF
2. `GoogleSignInHandler.OnTicketReceivedAsync()` is triggered
3. System detects your email matches `FounderEmail` constant
4. Your user record is created with:
   - `IsFounder = true`
   - `Roles = "founder"`
   - `RequiresMfaForSensitive = true`
5. JWT/session claims are populated:
   - `dmf:founder = "true"`
   - `dmf:roles = "founder"`
   - `dmf:mfa_required = "true"`

## Authorization in Code

### Server-Side (C#)

#### Check Authorization in Controllers

```csharp
[Authorize(Policy = "FounderOnly")]
[HttpGet("admin/platform-settings")]
public IActionResult GetPlatformSettings()
{
    // Only founder can access
}

[Authorize(Policy = "HasFinance")]
[HttpGet("finance/payouts")]
public IActionResult GetPayouts()
{
    // Founder, OrgOwner, Finance role
}
```

#### Check in Code

```csharp
var user = await _userManager.GetUserAsync(User);
if (user.IsFounder)
{
    // Founder-only logic
}

if (user.HasRole("finance"))
{
    // Finance role
}

var roles = user.GetRoles(); // Returns string[] of roles
```

### Client-Side (Blazor WebAssembly)

#### Check in Components

```razor
@using System.Security.Claims
@using DMF_MUSIC_PLATFORM.Authorization

@inject AuthenticationStateProvider AuthenticationStateProvider

@code {
    private bool isFounder = false;
    private string[] roles = Array.Empty<string>();

    protected override async Task OnInitializedAsync()
    {
        var authState = await AuthenticationStateProvider.GetAuthenticationStateAsync();
        var user = authState.User;

        isFounder = DmfAuthorizationService.IsFounder(user);
        roles = user.Claims
            .Where(c => c.Type == "dmf:roles")
            .FirstOrDefault()?
            .Value?
            .Split(',', System.StringSplitOptions.RemoveEmptyEntries)
            .Select(r => r.Trim())
            .ToArray() ?? Array.Empty<string>();
    }
}

@if (isFounder)
{
    <div>Founder-only section</div>
}

@if (DmfAuthorizationService.HasFinancialAccess(authState.User))
{
    <div>Financial data visible</div>
}
```

#### Call Auth API Endpoints

```csharp
// GET /api/auth/me ? Get current user info
// GET /api/auth/is-founder ? Check if founder
// POST /api/auth/has-role { "role": "finance" } ? Check specific role
// GET /api/auth/roles ? Get all roles
```

## Adding Roles to Users

### In Database (T-SQL)

```sql
UPDATE AspNetUsers 
SET Roles = 'org_admin,finance' 
WHERE Email = 'user@example.com'
```

### Programmatically

```csharp
var user = await _userManager.FindByEmailAsync("user@example.com");
user.Roles = "org_admin,finance";
user.RequiresMfaForSensitive = true;
await _userManager.UpdateAsync(user);
```

## Authorization Policies

| Policy | Condition |
|--------|-----------|
| `FounderOnly` | `dmf:founder = "true"` |
| `OrgOwnerOrAdmin` | Role contains `org_owner`, `org_admin`, or `founder` |
| `HasFinance` | Role contains `finance`, `org_owner`, or `founder` |
| `HasLegal` | Role contains `legal` or `founder` |
| `ContentManagement` | Role contains `content_editor`, `org_admin`, or `founder` |
| `SystemOps` | Role contains `engineer` or `founder` |
| `ReadOnlyAnalyst` | Role contains `analyst` or `founder` |
| `MfaRequired` | `dmf:mfa_required = "true"` |

## Security Notes

1. **Founder Email is Hardcoded**: The constant `FounderEmail = "bighomiecash8346@gmail.com"` is checked during sign-in
2. **MFA Step-Up**: Implement MFA flow for sensitive operations (payouts, vault changes)
3. **Org Isolation**: Tenants should only see their own org data; use `OrganizationId` in queries
4. **Soft Delete**: Founder can restore deleted organizations; use `IsDeleted` flag in queries
5. **No Role Escalation**: Users cannot self-assign roles; only founder or admin can modify

## Troubleshooting

### Google Sign-In Not Working
- Verify `ClientId` and `ClientSecret` in appsettings
- Check redirect URI is registered in Google Cloud Console
- Ensure HTTPS is enabled (Google requires it for OAuth)

### Claims Not Populated
- Check `GoogleSignInHandler.OnTicketReceivedAsync()` is being invoked
- Verify claims are added to `context.Principal`
- Check auth policies reference correct claim names

### Founder Not Detected
- Verify email matches `bighomiecash8346@gmail.com` exactly (case-insensitive)
- Check database migration was applied
- Verify `GoogleSignInHandler` is registered in `Program.cs`

## Files Added/Modified

### New Files
- `Authorization/DmfRolesAndPolicies.cs` - Role constants & authorization helpers
- `Authorization/DmfAuthorizationService.cs` - Shared auth service
- `Authorization/GoogleSignInHandler.cs` - Google OAuth callback handler
- `Components/Account/AuthController.cs` - Auth info API endpoints
- `Data/Migrations/20250101000000_AddFounderAndRolesToApplicationUser.cs` - Database migration

### Modified Files
- `Data/ApplicationUser.cs` - Added founder/roles properties
- `Program.cs` - Added Google OAuth configuration & authorization policies
- `appsettings.json` - Added Google OAuth settings section

## Next Steps

1. ? Set up Google OAuth credentials
2. ? Apply database migration
3. ? Configure `appsettings.json` with Google credentials
4. ? Test Google Sign-In with your email
5. ? Build UI for founder-only sections (pages/founder/*)
6. ? Implement MFA for sensitive operations
7. ? Create organization/user management API
