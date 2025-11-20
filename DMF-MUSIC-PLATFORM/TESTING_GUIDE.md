# DMF Music Platform - Component Testing Guide

## Overview

This document describes the comprehensive test suite for all components of the DMF Music Platform, powered by StreamGod Brain and Du'ryia Engine.

## Test Structure

```
dmf-music-platform/
├── __tests__/
│   ├── streamgod-brain.test.js      # Core brain logic tests
│   ├── streamgod-auth.test.js       # Authentication & authorization tests
│   ├── config-models.test.js        # Configuration & data model tests
│   └── integration.test.js          # End-to-end integration tests
├── jest.config.js                   # Jest configuration
├── package.json                     # Dependencies & test scripts
└── run-tests.sh                     # Test runner script
```

## Test Suites

### 1. StreamGod Brain Tests (`streamgod-brain.test.js`)

Tests the core permission resolution and routing logic.

**Coverage:**
- Role-based access control (OWNER, ADMIN, ARTIST, MANAGER, ANALYST, SUPPORT, GUEST)
- Plan-based permissions (INDIE, LABEL_STARTER, LABEL_PROFESSIONAL, LABEL_ENTERPRISE)
- Permission resolution combining roles, plans, and overrides
- Wildcard permission matching
- Route policy enforcement
- Access control decisions

**Test Cases:**
```javascript
✓ OWNER role should have full access (*)
✓ ADMIN role should have correct permissions
✓ ARTIST role should have self-access permissions
✓ GUEST role should have public read access
✓ Unknown role should return empty array
✓ Plan permissions should be resolved correctly
✓ Permission arrays should not have duplicates
✓ Wildcard prefix should match specific permissions
✓ Route policies should handle exact and wildcard matches
```

### 2. StreamGod Auth Tests (`streamgod-auth.test.js`)

Tests authentication, JWT handling, and authorization middleware.

**Coverage:**
- JWT token creation and verification
- Token expiration handling
- Authentication middleware behavior
- Authorization checks
- Role-based access enforcement
- Permission validation
- Token claims validation

**Test Cases:**
```javascript
✓ JWT should reject invalid tokens
✓ JWT should reject expired tokens
✓ JWT should contain user ID as sub claim
✓ JWT should contain role claim
✓ Request without user should be unauthenticated
✓ OWNER should have full access
✓ ADMIN should have admin permissions
✓ ARTIST should have limited permissions
✓ Unauthorized response should be 401
✓ Forbidden response should be 403
```

### 3. Configuration & Models Tests (`config-models.test.js`)

Tests configuration loading, validation, and data models.

**Coverage:**
- StreamGod brain configuration loading and parsing
- Role definitions and permissions
- Plan tier structure
- DMF roster configuration
- User model validation
- Permission naming conventions
- Route policy structure
- Environment configuration

**Test Cases:**
```javascript
✓ streamgod_brain.config.json should exist
✓ Brain config should parse as valid JSON
✓ Brain config should have metadata
✓ Brain config should have access_control section
✓ All required roles should be defined
✓ All required plans should be defined
✓ Plans should have tier property
✓ User should have required properties
✓ Permission string should follow naming convention
✓ Route policy keys should start with /
✓ JWT_SECRET should be configurable via environment
```

### 4. Integration Tests (`integration.test.js`)

Tests complete workflows and system interactions.

**Coverage:**
- User authentication flow (signup, login, logout)
- Artist workflow (upload, view analytics, access control)
- Admin workflow (manage users, divisions, pricing)
- Public portal access
- Permission escalation prevention
- Data consistency
- Error handling
- Performance benchmarks

**Test Cases:**
```javascript
✓ New user signup should create user account
✓ User login should generate JWT token
✓ Artist can upload release
✓ Artist can view own analytics
✓ Artist cannot access other artists' data
✓ Admin can view all artists
✓ Admin can manage divisions
✓ Admin can create new pricing plans
✓ Guest can view public roster
✓ Guest cannot access admin sections
✓ Artist cannot grant themselves admin permissions
✓ Only owner can change user roles
✓ User role and plan should be consistent
✓ Invalid JWT should return 401
✓ Expired token should return 401
✓ Missing required fields should return 400
✓ Permission check should complete in milliseconds
✓ Role resolution should be fast
```

## Running Tests

### Prerequisites
- Node.js 14+ and npm
- All dependencies installed: `npm install`

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test Suite
```bash
npm test streamgod-brain.test.js
npm test streamgod-auth.test.js
npm test config-models.test.js
npm test integration.test.js
```

### Run Tests with Detailed Output
```bash
npm test -- --verbose
```

### Run Custom Test Script
```bash
bash run-tests.sh
```

## Test Coverage Goals

- **Statements:** 50%+
- **Branches:** 50%+
- **Functions:** 50%+
- **Lines:** 50%+

Current configuration in `jest.config.js` enforces these minimums.

## Key Testing Scenarios

### Authentication Flow
1. User submits credentials
2. System validates against database
3. JWT token is generated with claims
4. Token is returned to client
5. Client includes token in subsequent requests
6. Server verifies token signature and expiration
7. Request is processed or rejected based on permissions

### Authorization Flow
1. Authenticated request arrives at protected endpoint
2. User's role is extracted from JWT
3. Role is resolved to permissions (role + plan + overrides)
4. Required permission is checked against user permissions
5. Wildcard matching is applied if needed
6. Route policy is checked from brain config
7. Request is allowed or rejected

### Permission Hierarchy
```
OWNER (*)
  └─ ADMIN [full operational access except user management]
      ├─ MANAGER [assigned artists only]
      └─ ANALYST [read-only analytics]
ARTIST [self-access only]
SUPPORT [read + support tickets]
GUEST [public read-only]
```

### Plan Tiers
```
Tier 5: LABEL_ENTERPRISE [highest]
Tier 4: LABEL_PROFESSIONAL
Tier 3: LABEL_STARTER
Tier 2: INDIE
Tier 1: GUEST/FREE [lowest]
```

## Configuration Files Tested

### streamgod_brain.config.json
- Metadata (name, version, environment)
- Role definitions with permissions
- Plan tier definitions with features
- Route policies for access control
- Model selection routing
- Mode configuration (dev/staging/prod)

### dmf-roster.json
- Artist roster data
- Division structure
- Org hierarchy

### Environment Variables
- `JWT_SECRET` - Secret key for JWT signing
- `NODE_ENV` - Environment (development/staging/production)
- `DATABASE_URL` - Database connection (optional)
- `API_PORT` - Server port (optional)

## Mocking Strategy

Tests use Jest mocks for:
- File system operations (fs)
- JWT library for expired token scenarios
- HTTP responses (status codes)
- Database queries (User.findById)

## Performance Benchmarks

All tested operations should complete within:
- Permission checks: < 1ms
- Role resolution: < 1ms
- JWT verification: < 5ms
- Route policy lookup: < 1ms

## Continuous Integration

Tests should be run:
- **On commit:** Pre-commit hooks
- **On push:** CI/CD pipeline
- **Daily:** Automated test suite
- **Before deployment:** Pre-production verification

## Troubleshooting

### Test Fails: "Cannot find module"
```bash
npm install
npm test
```

### Test Fails: "JWT_SECRET not set"
```bash
export JWT_SECRET="test-secret"
npm test
```

### Test Timeout
Increase timeout in jest.config.js:
```javascript
testTimeout: 20000  // 20 seconds
```

### Coverage Below Threshold
Run coverage report:
```bash
npm test -- --coverage
```

Review uncovered lines and add tests.

## Adding New Tests

1. Create new test file in `__tests__/` directory
2. Name file with `.test.js` suffix
3. Follow existing test patterns
4. Run `npm test` to verify
5. Update this document with new test descriptions

Example:
```javascript
describe("New Feature", () => {
  test("should do something", () => {
    expect(result).toBe(expected);
  });
});
```

## Related Documentation

- [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) - System architecture
- [00_START_HERE.md](./00_START_HERE.md) - Getting started guide
- [STREAMGOD_OS_LAUNCH_GUIDE.md](./STREAMGOD_OS_LAUNCH_GUIDE.md) - StreamGod configuration
- [CONTROL_CENTER_LAUNCH_GUIDE.md](./CONTROL_CENTER_LAUNCH_GUIDE.md) - Control center setup

## Support

For test-related issues:
1. Check test output for specific error messages
2. Review configuration files for syntax errors
3. Verify all dependencies are installed
4. Check environment variables are set correctly
5. Review related documentation
6. Run `npm test -- --verbose` for detailed output

---

**Last Updated:** November 16, 2025  
**Test Framework:** Jest 29.5.0  
**Node.js Version:** 14+ required
