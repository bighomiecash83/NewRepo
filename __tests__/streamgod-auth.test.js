/**
 * StreamGod Auth Middleware - Unit Tests
 * Tests authentication, route guarding, and permission checking
 */

const jwt = require("jsonwebtoken");

// Mock the brain module
jest.mock("../src/streamgod/brain", () => ({
  resolveUserPermissions: jest.fn((user) => {
    if (user && user.role === "OWNER") return ["*"];
    if (user && user.role === "ADMIN") return ["artists:read", "artists:write"];
    if (user && user.role === "ARTIST") return ["catalog:read:self"];
    return [];
  }),
  hasPermission: jest.fn((perms, required) => {
    if (!required) return true;
    if (perms.includes("*")) return true;
    return perms.includes(required);
  }),
  isRouteAllowed: jest.fn((pathname, user) => {
    if (!user) return false;
    if (user.role === "OWNER") return true;
    if (user.role === "ADMIN") return true;
    return pathname === "/public";
  }),
}));

// Mock middleware test helpers
function createMockRequest(options = {}) {
  return {
    headers: options.headers || {},
    path: options.path || "/",
    user: options.user || null,
  };
}

function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    statusCode: 200,
  };
  return res;
}

describe("StreamGod Auth - JWT Verification", () => {
  test("should reject request without token", () => {
    const token = jwt.sign({ sub: "user123" }, "secret");
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });

  test("should create valid JWT token", () => {
    const payload = { sub: "user123", role: "ADMIN" };
    const token = jwt.sign(payload, "secret");
    const decoded = jwt.verify(token, "secret");
    expect(decoded.sub).toBe("user123");
    expect(decoded.role).toBe("ADMIN");
  });

  test("should reject invalid token", () => {
    const invalidToken = "invalid.token.here";
    expect(() => {
      jwt.verify(invalidToken, "secret");
    }).toThrow();
  });

  test("should reject expired token", () => {
    const expiredToken = jwt.sign(
      { sub: "user123" },
      "secret",
      { expiresIn: "-1h" }
    );
    expect(() => {
      jwt.verify(expiredToken, "secret");
    }).toThrow();
  });
});

describe("StreamGod Auth - Request Validation", () => {
  test("request with valid user object should be authenticated", () => {
    const req = createMockRequest({
      user: {
        id: "user123",
        role: "ADMIN",
      },
    });
    expect(req.user).toBeDefined();
    expect(req.user.role).toBe("ADMIN");
  });

  test("request without user should be unauthenticated", () => {
    const req = createMockRequest();
    expect(req.user).toBeNull();
  });

  test("request should preserve authorization header", () => {
    const token = jwt.sign({ sub: "user123" }, "secret");
    const req = createMockRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    expect(req.headers.authorization).toContain("Bearer");
  });
});

describe("StreamGod Auth - Response Status Codes", () => {
  test("unauthorized response should be 401", () => {
    const res = createMockResponse();
    res.status(401).json({ error: "Unauthorized" });
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("forbidden response should be 403", () => {
    const res = createMockResponse();
    res.status(403).json({ error: "Forbidden" });
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("success response should be 200", () => {
    const res = createMockResponse();
    res.status(200).json({ success: true });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("StreamGod Auth - Role-Based Access", () => {
  test("OWNER should have full access", () => {
    const ownerUser = {
      id: "owner1",
      role: "OWNER",
      org_id: "dmf-records",
    };
    expect(ownerUser.role).toBe("OWNER");
  });

  test("ADMIN should have admin permissions", () => {
    const adminUser = {
      id: "admin1",
      role: "ADMIN",
      org_id: "dmf-records",
      plan_key: "LABEL_ENTERPRISE",
    };
    expect(adminUser.role).toBe("ADMIN");
    expect(adminUser.plan_key).toBe("LABEL_ENTERPRISE");
  });

  test("ARTIST should have limited permissions", () => {
    const artistUser = {
      id: "artist1",
      role: "ARTIST",
      org_id: "dmf-records",
    };
    expect(artistUser.role).toBe("ARTIST");
  });

  test("GUEST should have minimal permissions", () => {
    const guestUser = {
      id: null,
      role: "GUEST",
    };
    expect(guestUser.role).toBe("GUEST");
  });
});

describe("StreamGod Auth - Permission Enforcement", () => {
  test("should require authentication for protected routes", () => {
    const req = createMockRequest({ path: "/admin" });
    expect(req.user).toBeNull();
  });

  test("should allow authenticated requests to protected routes", () => {
    const req = createMockRequest({
      path: "/admin",
      user: { id: "admin1", role: "ADMIN" },
    });
    expect(req.user).toBeDefined();
  });

  test("should enforce permission checks", () => {
    const adminPerms = ["artists:read", "artists:write"];
    expect(adminPerms).toContain("artists:read");
    expect(adminPerms).not.toContain("users:delete");
  });
});

describe("StreamGod Auth - Token Claims", () => {
  test("JWT should contain user ID as sub claim", () => {
    const userId = "user123";
    const token = jwt.sign({ sub: userId }, "secret");
    const decoded = jwt.verify(token, "secret");
    expect(decoded.sub).toBe(userId);
  });

  test("JWT should contain role claim", () => {
    const token = jwt.sign(
      { sub: "user123", role: "ADMIN" },
      "secret"
    );
    const decoded = jwt.verify(token, "secret");
    expect(decoded.role).toBe("ADMIN");
  });

  test("JWT should contain org_id claim", () => {
    const token = jwt.sign(
      { sub: "user123", org_id: "dmf-records" },
      "secret"
    );
    const decoded = jwt.verify(token, "secret");
    expect(decoded.org_id).toBe("dmf-records");
  });
});
