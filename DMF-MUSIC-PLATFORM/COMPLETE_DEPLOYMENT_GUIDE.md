# ?? COMPLETE DEPLOYMENT GUIDE

**Status:** Step-by-step deployment instructions for DMF Music Platform

---

## ?? DEPLOYMENT PHASES

```
Phase 1: Pre-Deployment (1 hour) ????????????????????????
Phase 2: Local Testing (1 hour) ?????????????????????????
Phase 3: Staging Deployment (2 hours) ???????????????????
Phase 4: Production Deployment (1 hour) ?????????????????
Phase 5: Post-Deployment (ongoing) ??????????????????????
```

---

## ?? PHASE 1: PRE-DEPLOYMENT (1 hour)

### 1.1 Verify Build Succeeds

```bash
cd C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM
dotnet clean
dotnet restore
dotnet build
```

**Expected Output:**
```
Build succeeded with 0 errors and 0 warnings
```

**If Build Fails:**
- [ ] Check all _Imports.razor files exist
- [ ] Verify NuGet packages installed: `dotnet list package`
- [ ] Check for compilation errors
- [ ] Review error messages carefully

### 1.2 Run All Tests

```bash
dotnet test
```

**Expected Output:**
```
Test Run Successful.
Total tests run: 65+
Passed: 65+
Failed: 0
```

**If Tests Fail:**
- [ ] Check error messages
- [ ] Verify test data setup
- [ ] Check mock objects configured correctly
- [ ] Review test assumptions

### 1.3 Database Migration Check

```bash
dotnet ef migrations list
```

**Expected Output:**
```
20250101000000_AddFounderAndRolesToApplicationUser
```

**If Migration Missing:**
```bash
dotnet ef migrations add AddFounderAndRolesToApplicationUser
```

### 1.4 Verify Google OAuth Setup

```
? Google Cloud Project created
? OAuth 2.0 credential created
? Redirect URI configured:
   - Local: https://localhost:5001/signin-google
   - Staging: https://staging.dmf.com/signin-google
   - Prod: https://dmf.com/signin-google
? Client ID obtained
? Client Secret obtained
```

### 1.5 Security Checklist

```
? No hardcoded passwords
? No API keys in source code
? Secrets in user-secrets (local) / environment (prod)
? SSL/TLS enabled
? CORS configured correctly
? Rate limiting enabled
? Input validation implemented
? SQL injection prevention
? XSS protection
? CSRF protection
```

---

## ?? PHASE 2: LOCAL TESTING (1 hour)

### 2.1 Start Application

```bash
dotnet run
```

**Expected:**
- Application starts without errors
- Logs show: "Listening on https://localhost:5001"

### 2.2 Test Authentication Flow

```
1. Navigate to https://localhost:5001
2. Click "Sign In with Google"
3. Sign in with bighomiecash8346@gmail.com
4. Redirected back to dashboard
5. "?? Founder" menu visible
```

### 2.3 Test Founder Pages

**Test Dashboard:**
```
URL: https://localhost:5001/founder
Expected: Dashboard loads with statistics
Status cards visible: Platform Status, Active Orgs, Releases, Revenue
```

**Test Vault:**
```
URL: https://localhost:5001/founder/vault
Expected: Vault loads with tabs
Tabs visible: Unreleased, Archived, Sensitive, Deleted
```

**Test Operations:**
```
URL: https://localhost:5001/founder/ops
Expected: Ops page loads
Components: Health cards, services, bots, logs
```

### 2.4 Test Non-Founder Access

```
1. Sign out
2. Sign in with different email
3. "?? Founder" menu should NOT appear
4. Try accessing /founder ? Should deny access
5. Verify error message displayed
```

### 2.5 Test API Endpoints

**Using Postman or curl:**

```bash
# Get current user (requires auth)
curl -H "Authorization: Bearer {token}" \
  https://localhost:5001/api/auth/me

# Check if founder (requires auth)
curl -H "Authorization: Bearer {token}" \
  https://localhost:5001/api/auth/is-founder

# Get roles (requires auth)
curl -H "Authorization: Bearer {token}" \
  https://localhost:5001/api/auth/roles

# Check for specific role (requires auth)
curl -X POST -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"role":"finance"}' \
  https://localhost:5001/api/auth/has-role
```

### 2.6 Test Database Operations

**Check User Created:**
```sql
SELECT TOP 1 Id, Email, IsFounder, Roles, DisplayName, CreatedUtc
FROM AspNetUsers
ORDER BY CreatedUtc DESC
```

**Expected Output:**
```
Id         | bighomiecash8346@gmail.com | 1 | founder | Founder Name | 2025-01-XX
```

---

## ?? PHASE 3: STAGING DEPLOYMENT (2 hours)

### 3.1 Set Up Staging Environment

```bash
# 1. Create staging database
sqlcmd -S staging-server.com -U sa -P password
> CREATE DATABASE DMF_Staging;

# 2. Update connection string
appsettings.Staging.json
```

**appsettings.Staging.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=staging-server.com;Database=DMF_Staging;User ID=sa;Password=***"
  },
  "Authentication": {
    "Google": {
      "ClientId": "STAGING-CLIENT-ID",
      "ClientSecret": "STAGING-CLIENT-SECRET"
    }
  }
}
```

### 3.2 Deploy to Staging

```bash
# 1. Publish application
dotnet publish -c Release -o ./publish

# 2. Copy to staging server
# scp -r ./publish/* staging@dmf-staging.com:/app/

# 3. Connect to staging server
# ssh staging@dmf-staging.com

# 4. Run migrations
cd /app
dotnet ef database update --environment Staging

# 5. Start application
systemctl restart dmf-staging
```

### 3.3 Staging Testing

**Smoke Tests:**
```
? Application starts
? Can navigate to homepage
? Google OAuth signin button visible
? Signin with staging Google OAuth account
? Dashboard loads
```

**Functional Tests:**
```
? Founder pages accessible
? Role-based navigation works
? API endpoints responding
? Database queries working
```

**Performance Tests:**
```
? Page load time < 2 seconds
? API response time < 500ms
? Database queries < 100ms
? No memory leaks
```

**Security Tests:**
```
? SSL certificate valid
? HTTPS enforced
? Security headers present
? No sensitive data in logs
? No unencrypted communications
```

### 3.4 Integration Testing

```bash
# Run against staging endpoints
ASPNETCORE_ENVIRONMENT=Staging dotnet test
```

### 3.5 Staging Sign-Off

```
Checklist:
? All tests pass
? No errors in logs
? Performance acceptable
? Security review passed
? Business owner approval
? Ready for production
```

---

## ?? PHASE 4: PRODUCTION DEPLOYMENT (1 hour)

### 4.1 Pre-Production Verification

**Final Checklist:**
```
? Staging tests passed
? Performance benchmarks met
? Security audit completed
? Team approval obtained
? Rollback plan in place
? Monitoring configured
? Alert thresholds set
? On-call team notified
```

### 4.2 Production Secrets Setup

```bash
# Store production secrets securely
# Option 1: Azure Key Vault
az keyvault secret set --vault-name dmf-prod-vault \
  --name "Google-ClientId" --value "PROD-CLIENT-ID"

# Option 2: AWS Secrets Manager
aws secretsmanager create-secret \
  --name dmf/google/client-id \
  --secret-string "PROD-CLIENT-ID"

# Option 3: Environment Variables
export Google__ClientId="PROD-CLIENT-ID"
export Google__ClientSecret="PROD-CLIENT-SECRET"
```

### 4.3 Database Migration to Production

```bash
# 1. Backup current database
BACKUP DATABASE DMF_Production 
TO DISK = '/backups/DMF_Production_backup.bak'

# 2. Run migrations
dotnet ef database update --environment Production

# 3. Verify migration success
SELECT @@VERSION;
SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'AspNetUsers' AND COLUMN_NAME = 'IsFounder';
```

### 4.4 Production Deployment

```bash
# 1. Build release version
dotnet publish -c Release -o ./publish

# 2. Deploy to production
# Option 1: Azure App Service
az webapp deployment source config-zip \
  --resource-group dmf-prod-rg \
  --name dmf-app \
  --src publish.zip

# Option 2: Docker
docker build -t dmf:latest .
docker push dmf-registry.com/dmf:latest
kubectl apply -f deployment.yaml

# 3. Verify deployment
curl https://dmf-music-platform.com/health
```

### 4.5 Production Verification

**Immediate Checks (First 5 minutes):**
```
? Application responding on https://dmf-music-platform.com
? Homepage loads
? Sign-in button visible
? No 500 errors
? Logs clean
? Monitoring data flowing
```

**Functional Checks (First 30 minutes):**
```
? Sign in with founder email works
? Founder menu visible
? Founder pages load
? Non-founder access denied correctly
? API endpoints working
? Database operations normal
```

**Performance Checks (First hour):**
```
? Page load time < 2 seconds
? API response time < 500ms
? Database responding normally
? No performance degradation
? Resource usage normal
```

---

## ?? PHASE 5: POST-DEPLOYMENT (Ongoing)

### 5.1 Monitoring Setup

**Key Metrics to Monitor:**

```
Application Metrics:
  ? Request rate (reqs/sec)
  ? Error rate (errors/sec)
  ? Response time (p50, p95, p99)
  ? Uptime percentage

Infrastructure Metrics:
  ? CPU usage (%)
  ? Memory usage (%)
  ? Disk usage (%)
  ? Network I/O

Database Metrics:
  ? Query execution time
  ? Connection pool usage
  ? Slow queries
  ? Lock contention

Security Metrics:
  ? Failed login attempts
  ? Unauthorized accesses
  ? API abuse attempts
```

### 5.2 Alert Configuration

```
Critical (Page immediately):
  - Application down
  - Error rate > 5%
  - Database connection failed
  - Security breach detected

High (Page within 15 min):
  - Response time > 5 seconds
  - CPU > 80%
  - Memory > 85%
  - Disk > 90%

Medium (Email notification):
  - Response time > 2 seconds
  - Error rate > 1%
  - CPU > 60%
  - Scheduled maintenance reminder
```

### 5.3 Daily Checks

```
Every Day:
? Review error logs
? Check performance metrics
? Verify all services healthy
? Review security logs
? Check for any alerts
```

### 5.4 Weekly Maintenance

```
Every Week:
? Review user statistics
? Check database growth
? Performance trend analysis
? Security audit
? Backup verification
```

### 5.5 Monthly Tasks

```
Every Month:
? Generate performance report
? Review and update capacity plan
? Security vulnerability scan
? Update dependencies
? Team review meeting
```

---

## ?? ROLLBACK PROCEDURE

**If Production Issues Occur:**

```
Step 1: Assess Severity
  ? Is service down? (P1 - Immediate rollback)
  ? Are users affected? (P2 - Rollback within 5 min)
  ? Is data corrupted? (P3 - Hotfix or rollback)

Step 2: Implement Rollback
  Option 1: Blue-Green Deployment
    kubectl set image deployment/dmf \
      dmf=dmf-registry.com/dmf:previous-version
  
  Option 2: Revert to Previous Container
    docker stop dmf-prod
    docker run -d dmf-registry.com/dmf:previous-version
  
  Option 3: Restore from Backup
    RESTORE DATABASE DMF_Production 
    FROM DISK = '/backups/DMF_Production_backup.bak'

Step 3: Verify Rollback
  ? Application responding
  ? No errors
  ? Data consistent
  ? Performance normal

Step 4: Post-Incident
  ? Document issue
  ? Root cause analysis
  ? Fix deployment
  ? Re-deploy after fix
```

---

## ?? DEPLOYMENT CHECKLIST

### Pre-Deployment
```
? All tests pass
? Code review completed
? Build succeeds
? No security issues
? Performance acceptable
? Database migration ready
? Secrets configured
? Backups current
? Team notified
? Maintenance window scheduled
```

### During Deployment
```
? Monitoring active
? Team on standby
? Communication channel open
? Deployment begins
? Status updates every 5 minutes
? Verification tests running
```

### Post-Deployment
```
? Application healthy
? All endpoints responding
? Database operational
? Users can sign in
? Founder features working
? Performance normal
? No alerts triggered
? Team debriefing
? Post-deployment tasks
```

---

## ?? DEPLOYMENT CONTACTS

```
Product Owner:  [Contact Info]
Development Lead: [Contact Info]
Infrastructure: [Contact Info]
Security: [Contact Info]
On-Call: [Contact Info]
```

---

## ?? GO LIVE COMMAND

**When everything is ready:**

```bash
# Production Deployment
kubectl apply -f production-deployment.yaml

# Or

az webapp deployment source config-zip \
  --resource-group dmf-prod-rg \
  --name dmf-music-platform \
  --src publish.zip

# Verify
curl https://dmf-music-platform.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-15T12:00:00Z"
}
```

---

**Status:** Ready for production deployment  
**Next Step:** Execute Phase 1 - Pre-Deployment checklist
