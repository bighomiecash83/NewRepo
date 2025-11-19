# 🔐 DMF-MUSIC-PLATFORM v2.0 Security Checklist

**Status: PRODUCTION READINESS VALIDATION**

Complete this checklist before launch to production. All items must be ✅ to go live.

---

## 🔐 Auth & JWT

- [ ] **JWT Secret Key**
  - [ ] Secret is **long & random** (min 32 chars, use cryptographic generator)
  - [ ] Secret **only in environment variables** (never in git, code, or config files)
  - [ ] Set via: `JWT_SECRET_KEY` environment variable
  - [ ] Different secret for dev/staging/prod

- [ ] **JWT Token Claims**
  - [ ] Token includes `sub` (user/subject ID)
  - [ ] Token includes `role` (Owner | Admin | Artist)
  - [ ] Token includes `artistId` for artist accounts
  - [ ] Token includes `email` for identification
  - [ ] Token expiration is reasonable (24h default, adjustable)

- [ ] **Admin Route Protection**
  - [ ] `/api/dashboard/owner` has `[Authorize(Roles = "Owner,Admin")]`
  - [ ] All `/api/admin/*` routes require admin role
  - [ ] Any privileged endpoints explicitly check role

- [ ] **Artist Data Validation**
  - [ ] Artist endpoints compare `artistId` from token vs request
  - [ ] Artist cannot see other artists' data (enforced in service/controller)
  - [ ] Endpoint: `/api/dashboard/artist/{artistId}` validates ownership
  - [ ] Endpoint: `/api/releases?artistId=...` validates match

---

## 🌐 Network & HTTPS

- [ ] **Production URL Uses HTTPS Only**
  - [ ] No plain HTTP links in production code/config
  - [ ] HTTPS certificate valid and auto-renewing
  - [ ] Test with `curl -I https://yourdomain.com` (no 403/untrusted errors)

- [ ] **CORS Locked Down**
  - [ ] `Cors:AllowedOrigins` does **NOT** include `*` in production
  - [ ] Only your frontend domain(s) whitelisted
  - [ ] Dev/staging can be looser; prod must be strict
  - [ ] Example (prod):
    ```json
    "Cors": {
      "AllowedOrigins": ["https://yourlabel.com", "https://admin.yourlabel.com"]
    }
    ```

- [ ] **API Rate Limiting** (optional but recommended)
  - [ ] Consider adding rate limit middleware for `/api/*` endpoints
  - [ ] Prevents brute force on auth/pricing endpoints

---

## 🔑 Secrets & Configuration

- [ ] **Environment Variables Set in Hosting**
  - [ ] `JWT_SECRET_KEY` – long random string
  - [ ] `MongoDb__ConnectionString` – with real password
  - [ ] Any API keys (Google, OpenAI, etc.)
  - [ ] Verified they're **not** in git or committed code

- [ ] **Secrets Management Strategy**
  - [ ] Production secrets in secure vault (Azure Key Vault, AWS Secrets Manager, etc.)
  - [ ] Dev secrets in `.env.local` (git-ignored)
  - [ ] No secrets in `appsettings.json` (only dev defaults)

- [ ] **Database Connection String Security**
  - [ ] Connection string uses **strong password** (min 16 chars, special chars)
  - [ ] Password **only in env vars**, not in config files
  - [ ] Connection string specifies correct database name
  - [ ] Consider IP whitelisting in MongoDB Atlas

- [ ] **API Keys Rotation**
  - [ ] Any external API keys (Google, OpenAI) have rotation policy
  - [ ] Document key rotation process
  - [ ] Set reminder for quarterly rotation

---

## 💾 Data & Backups

- [ ] **MongoDB Atlas Backup Settings**
  - [ ] Automatic backups **enabled** (not just on-demand)
  - [ ] Backup frequency: **daily minimum** (hourly preferred)
  - [ ] Backup retention: **>= 7 days** (14+ recommended)
  - [ ] Test restore from backup at least once before launch

- [ ] **Critical Collections Identified**
  - [ ] `releases_v2` – all release metadata
  - [ ] `royalty_statements` – artist earnings
  - [ ] `payouts` – payout history
  - [ ] `users` – user accounts & credentials
  - [ ] `pricing_plans` – pricing configuration

- [ ] **Data Export Process Documented**
  - [ ] Can export above collections to JSON/CSV
  - [ ] Export tested at least once
  - [ ] Document stored in safe location (drive, wiki, etc.)
  - [ ] Export includes timestamps & metadata

- [ ] **GDPR/Privacy Compliance**
  - [ ] Can delete user account & associated data
  - [ ] Have data deletion process documented
  - [ ] Know what data to retain vs delete by law

---

## 📜 Logging & Monitoring

- [ ] **API Logging**
  - [ ] Errors logged with timestamp, endpoint, user (if applicable)
  - [ ] Log level: `Information` min for production (not `Debug`)
  - [ ] Logs sent to centralized location (not just console)
  - [ ] Sample log: `[2025-11-19T14:32:10Z] GET /api/releases?artistId=artist1 – User:user123 – Status:200 – 145ms`

- [ ] **Request Tracing**
  - [ ] Each request has unique correlation ID
  - [ ] Correlation ID logged and returned in response header (optional)
  - [ ] Helps debug multi-service issues

- [ ] **Error Alerting**
  - [ ] Alert on 5xx error rate > 1% (or threshold of choice)
  - [ ] Alert on database connection failures
  - [ ] Alert on repeated 401/403 (possible attack)
  - [ ] Alert recipient defined (email, Slack, PagerDuty, etc.)

- [ ] **Basic Monitoring Dashboard**
  - [ ] Endpoint response times tracked
  - [ ] Request count per endpoint visible
  - [ ] Error rates per endpoint visible
  - [ ] Can view last 24h, 7d, 30d trends

---

## 🚀 Pre-Launch Validation

- [ ] **Security Headers**
  - [ ] Response includes `X-Content-Type-Options: nosniff`
  - [ ] Response includes `X-Frame-Options: DENY` or `SAMEORIGIN`
  - [ ] CORS headers set correctly (no open wildcards)

- [ ] **SQL/NoSQL Injection Prevention**
  - [ ] All database queries use parameterized queries (MongoDB use case-insensitive)
  - [ ] User input validated before DB query
  - [ ] No raw string concatenation in queries

- [ ] **Authentication Flow Tested**
  - [ ] User can log in and receive JWT
  - [ ] JWT token decoding works correctly
  - [ ] Expired tokens rejected
  - [ ] Invalid signatures rejected
  - [ ] Token refresh (if applicable) works

- [ ] **Authorization Tested**
  - [ ] Admin cannot access `/api/pricing/admin` without role
  - [ ] Artist cannot see other artists' `/dashboard/artist/OTHER_ID`
  - [ ] Owner can access `/dashboard/owner`
  - [ ] Unauthenticated requests to protected endpoints return 401

- [ ] **Public Routes Accessible**
  - [ ] `/pricing` loads without auth
  - [ ] `/` (landing) loads without auth
  - [ ] `GET /api/pricing/plans` works without auth
  - [ ] `POST /api/auth/login` works without prior auth

---

## 📋 Deployment Checklist

- [ ] **Env Variables Deployed**
  - [ ] `JWT_SECRET_KEY` set in production hosting
  - [ ] All secrets reviewed in deployment tool
  - [ ] No secrets in version control

- [ ] **Database Migrated/Seeded**
  - [ ] Pricing plans in production DB
  - [ ] Initial admin/owner account created
  - [ ] Collections indexed for performance

- [ ] **DNS & HTTPS Ready**
  - [ ] Domain points to correct backend IP
  - [ ] SSL certificate installed and valid
  - [ ] HTTPS redirect working
  - [ ] Mixed content warnings absent

- [ ] **Smoke Tests Pass**
  - [ ] GET `/health` returns `{"status":"ok"}`
  - [ ] GET `/api/pricing/plans` returns valid JSON
  - [ ] POST `/api/auth/login` with test user works
  - [ ] GET `/dashboard/owner` with admin JWT returns data
  - [ ] GET `/dashboard/artist/ARTIST_ID` with artist JWT returns data
  - [ ] Unauthorized requests return 401/403

---

## ✅ Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Security Lead | __________ | __________ | ☐ Approved |
| DevOps Lead | __________ | __________ | ☐ Approved |
| Product Lead | __________ | __________ | ☐ Approved |

Once all items are ✅ and signed off, the platform is **production-ready**.

---

**Last Updated:** 2025-11-19
**Version:** v2.0 Production
**Classification:** Internal – Security Sensitive
