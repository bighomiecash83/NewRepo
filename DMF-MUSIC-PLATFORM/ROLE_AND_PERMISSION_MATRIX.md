# DMF Role & Permission Reference

## Role Hierarchy

```
FOUNDER (you)
  ?? IsFounder = true
  ?? Roles = "founder"
  ?? Access: EVERYTHING

ORGANIZATION (multi-tenant)
  ?? OrgOwner
  ?   ?? Roles = "org_owner"
  ?   ?? Access: Everything within their org + payouts
  ?
  ?? OrgAdmin
  ?   ?? Roles = "org_admin"
  ?   ?? Access: Manage members, releases, metadata
  ?
  ?? Finance
  ?   ?? Roles = "finance"
  ?   ?? Access: Payouts, royalties, statements
  ?
  ?? Legal
  ?   ?? Roles = "legal"
  ?   ?? Access: Contracts, claims, takedowns
  ?
  ?? A&R
  ?   ?? Roles = "a_and_r"
  ?   ?? Access: Scouting, artist notes
  ?
  ?? Artist
  ?   ?? Roles = "artist"
  ?   ?? Access: Own releases, metadata
  ?
  ?? ContentEditor
  ?   ?? Roles = "content_editor"
  ?   ?? Access: Upload assets, edit metadata
  ?
  ?? Manager
  ?   ?? Roles = "manager"
  ?   ?? Access: Manage members (no finance)
  ?
  ?? Support
  ?   ?? Roles = "support"
  ?   ?? Access: Support tickets, artist comms
  ?
  ?? Engineer
  ?   ?? Roles = "engineer"
  ?   ?? Access: Logs, health checks (no money, no masters)
  ?
  ?? Analyst
      ?? Roles = "analyst"
      ?? Access: Read-only dashboards
```

## Permission Matrix (Detailed)

### Feature Access by Role

#### Platform Management (FOUNDER ONLY)
| Feature | Founder | OrgOwner | OrgAdmin | Other |
|---------|---------|----------|----------|-------|
| Platform Settings | ?** | ? | ? | ? |
| System Health | ?** | ? | ? | ??* |
| Service Bot Control | ?** | ? | ? | ? |
| Master Vault | ?** | ? | ? | ? |
| All Organizations | ?** | ? | ? | ? |

*Engineer can see logs only (read-only)  
**MFA required for sensitive operations

#### Organization Management
| Feature | Founder | OrgOwner | OrgAdmin | Manager | Other |
|---------|---------|----------|----------|---------|-------|
| Org Settings | ? | ? | ? | ? | ? |
| Invite Members | ? | ? | ? | ? | ? |
| Remove Members | ? | ? | ? | ? | ? |
| Assign Roles | ? | ? | ? | ? | ? |
| View Members | ? | ? | ? | ? | ? |

#### Release Management
| Feature | Founder | OrgOwner | OrgAdmin | Artist | ContentEd | Analyst |
|---------|---------|----------|----------|--------|-----------|---------|
| Create Release | ? | ? | ? | ? | ? | ?? |
| Edit Metadata | ? | ? | ? | ? | ? | ?? |
| Upload Assets | ? | ? | ? | ? | ? | ?? |
| Approve Delivery | ? | ? | ? | ? | ? | ?? |
| Release Tracks | ? | ? | ? | ? | ? | ?? |

#### Distribution
| Feature | Founder | OrgOwner | OrgAdmin | Finance | Analyst |
|---------|---------|----------|----------|---------|---------|
| Schedule Distribution | ? | ? | ? | ? | ?? |
| View Stores | ? | ? | ? | ? | ?? |
| Recall Release | ? | ? | ? | ? | ? |

#### Financial & Royalties
| Feature | Founder | OrgOwner | Finance | Legal | Other |
|---------|---------|----------|---------|-------|-------|
| View Royalties | ?** | ? | ? | ? | ?? |
| Generate Payouts | ?** | ?** | ?** | ? | ? |
| Export Statements | ?** | ? | ? | ? | ? |
| Set Payout Method | ?** | ?** | ? | ? | ? |
| View Tax Forms | ?** | ? | ? | ? | ? |

**MFA Required

#### Legal & Contracts
| Feature | Founder | Legal | OrgOwner | Other |
|---------|---------|-------|----------|-------|
| Upload Contracts | ?** | ? | ? | ? |
| View Contracts | ?** | ? | ? | ?? |
| File Takedowns | ?** | ? | ? | ? |
| Dispute Claims | ?** | ? | ? | ? |

#### Content & A&R
| Feature | Founder | OrgOwner | A&R | Artist | Other |
|---------|---------|----------|-----|--------|-------|
| Scout Artists | ? | ? | ? | ? | ? |
| Add Notes | ? | ? | ? | ? | ? |
| Rate Submissions | ? | ? | ? | ? | ? |

#### Support & Communication
| Feature | Founder | Support | OrgOwner | Other |
|---------|---------|---------|----------|-------|
| View Tickets | ? | ? | ? | ?? |
| Reply to Tickets | ? | ? | ? | ? |
| Close Tickets | ? | ? | ? | ? |
| Send Bulk Messages | ? | ? | ? | ? |

#### Analytics & Dashboards
| Feature | Founder | All Roles | Analyst Only |
|---------|---------|-----------|--------------|
| Org Dashboard | ? | ? | ?? |
| Release Performance | ? | ? | ?? |
| Revenue Reports | ? | ?* | ?? |
| Artist Analytics | ? | ?* | ?? |

*Finance/OrgOwner can see org data only

#### System Operations (Internal)
| Feature | Founder | Engineer | Other |
|---------|---------|----------|-------|
| View Logs | ?** | ? | ? |
| System Alerts | ?** | ? | ? |
| Restart Services | ?** | ? | ? |
| Database Backups | ?** | ? | ? |
| Audit Trail | ?** | ? | ? |

**Founder actions logged separately

## Multiple Roles

Users can have **multiple roles** (comma-separated):

Example: `org_admin,finance,legal`

When checking access:
- All role permissions are **combined** (OR logic)
- Most restrictive rule on sensitive ops (e.g., MFA required if any role needs it)

```csharp
// Database example:
UPDATE AspNetUsers 
SET Roles = 'org_admin,finance' 
WHERE Email = 'user@example.com';

// Code check:
if (user.HasRole("finance")) 
{
    // This user can access finance features
}
```

## MFA Rules

MFA step-up required for:
- ? Founder: All sensitive operations (payouts, vault, platform settings)
- ? OrgOwner: Payouts, payout method changes
- ? Finance: Payouts, tax form submissions
- ? Others: No MFA required

```csharp
// In API:
if (user.RequiresMfaForSensitive && !userCompletedMfaRecently)
{
    return Unauthorized("MFA required for this operation");
}
```

## Organization Isolation

Non-founder users can ONLY see:
- Their organization's data (`OrganizationId` matches)
- Their own user data
- Label services (shared across org members)

Queries must filter:
```csharp
// In repository:
public async Task<Release> GetReleaseAsync(string releaseId, string userId)
{
    var user = await _userManager.FindByIdAsync(userId);
    
    // If not founder, filter by org
    if (!user.IsFounder)
    {
        return await _db.Releases
            .FirstOrDefaultAsync(r => r.Id == releaseId && r.OrganizationId == user.OrganizationId);
    }
    
    return await _db.Releases.FirstOrDefaultAsync(r => r.Id == releaseId);
}
```

## Soft Delete (Founder Feature)

Founder can soft-delete and restore organizations:

```csharp
// Founder action:
var org = await _db.Organizations.FindAsync(orgId);
org.IsDeleted = true; // Soft delete
await _db.SaveChangesAsync();

// Queries exclude soft-deleted (unless founder views explicitly):
var orgs = await _db.Organizations
    .Where(o => !o.IsDeleted || (User.IsFounder && o.Id == selectedOrgId))
    .ToListAsync();
```

## Claims Reference

User claims populated from database:

```
Claim Type: "dmf:founder"
Values: "true" | "false"

Claim Type: "dmf:roles"
Values: "founder" | "org_owner,finance" | etc (comma-separated)

Claim Type: "dmf:mfa_required"
Values: "true" | "false"

Claim Type: "dmf:orgid"
Values: "ORG_123" (only if in organization)
```

## Authorization Policy Reference

Use in `[Authorize(Policy = "...")]` attributes:

```csharp
[Authorize(Policy = "FounderOnly")]
[Authorize(Policy = "OrgOwnerOrAdmin")]
[Authorize(Policy = "HasFinance")]
[Authorize(Policy = "HasLegal")]
[Authorize(Policy = "ContentManagement")]
[Authorize(Policy = "SystemOps")]
[Authorize(Policy = "ReadOnlyAnalyst")]
[Authorize(Policy = "MfaRequired")]
```

## Role Assignment Examples

```sql
-- Make user org admin
UPDATE AspNetUsers SET Roles = 'org_admin' WHERE Email = 'admin@org.com';

-- Add finance role (multiple roles)
UPDATE AspNetUsers SET Roles = 'org_admin,finance' WHERE Email = 'admin@org.com';

-- Artist only (default)
UPDATE AspNetUsers SET Roles = 'artist' WHERE Email = 'artist@example.com';

-- Support team
UPDATE AspNetUsers SET Roles = 'support' WHERE Email = 'support@dmf.com';

-- Read-only analyst
UPDATE AspNetUsers SET Roles = 'analyst' WHERE Email = 'analyst@dmf.com';
```

---

**Legend:**
- ? = Full access
- ?** = Requires MFA
- ? = No access
- ?? = Read-only
