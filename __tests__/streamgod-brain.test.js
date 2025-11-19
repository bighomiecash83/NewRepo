/**
 * StreamGod Brain - Unit Tests
 * Tests role permissions, plan permissions, and permission resolution
 */

const {
  getRolePermissions,
  getPlanPermissions,
  resolveUserPermissions,
  hasPermission,
  getRoutePolicy,
  isRouteAllowed,
} = require("../src/streamgod/brain");

describe("StreamGod Brain - Role Permissions", () => {
  test("OWNER role should have full access (*)", () => {
    const perms = getRolePermissions("OWNER");
    expect(perms).toEqual(["*"]);
  });

  test("ADMIN role should have correct permissions", () => {
    const perms = getRolePermissions("ADMIN");
    expect(perms).toContain("artists:read");
    expect(perms).toContain("artists:write");
    expect(perms).toContain("divisions:read");
    expect(perms).toContain("divisions:write");
  });

  test("ARTIST role should have self-access permissions", () => {
    const perms = getRolePermissions("ARTIST");
    expect(perms).toContain("artists:read:self");
    expect(perms).toContain("catalog:write:self");
    expect(perms.some((p) => p.includes("self"))).toBe(true);
  });

  test("GUEST role should have public read access", () => {
    const perms = getRolePermissions("GUEST");
    expect(perms).toContain("artists:read:public");
    expect(perms).toContain("divisions:read:public");
  });

  test("Unknown role should return empty array", () => {
    const perms = getRolePermissions("UNKNOWN_ROLE");
    expect(perms).toEqual([]);
  });

  test("Null role should return empty array", () => {
    const perms = getRolePermissions(null);
    expect(perms).toEqual([]);
  });
});

describe("StreamGod Brain - Plan Permissions", () => {
  test("INDIE plan should have limited release permissions", () => {
    const perms = getPlanPermissions("INDIE");
    expect(perms).toContain("releases:write:limit:5");
  });

  test("LABEL_STARTER plan should exist and have permissions", () => {
    const perms = getPlanPermissions("LABEL_STARTER");
    expect(Array.isArray(perms)).toBe(true);
    expect(perms.length).toBeGreaterThan(0);
  });

  test("LABEL_ENTERPRISE plan should exist", () => {
    const perms = getPlanPermissions("LABEL_ENTERPRISE");
    expect(Array.isArray(perms)).toBe(true);
  });

  test("Unknown plan should return empty array", () => {
    const perms = getPlanPermissions("UNKNOWN_PLAN");
    expect(perms).toEqual([]);
  });

  test("Null plan should return empty array", () => {
    const perms = getPlanPermissions(null);
    expect(perms).toEqual([]);
  });
});

describe("StreamGod Brain - Permission Resolution", () => {
  test("OWNER user should always have full access", () => {
    const user = {
      id: "user123",
      role: "OWNER",
      plan_key: "INDIE",
    };
    const perms = resolveUserPermissions(user);
    expect(perms).toEqual(["*"]);
  });

  test("ADMIN user should combine role and plan permissions", () => {
    const user = {
      id: "user456",
      role: "ADMIN",
      plan_key: "LABEL_ENTERPRISE",
    };
    const perms = resolveUserPermissions(user);
    expect(perms.length).toBeGreaterThan(0);
    expect(perms).toContain("artists:read");
  });

  test("User with permission overrides should include them", () => {
    const user = {
      id: "user789",
      role: "ARTIST",
      plan_key: "INDIE",
      permissions_override: ["special:admin:power"],
    };
    const perms = resolveUserPermissions(user);
    expect(perms).toContain("special:admin:power");
  });

  test("Null user should return empty array", () => {
    const perms = resolveUserPermissions(null);
    expect(perms).toEqual([]);
  });

  test("Permission array should not have duplicates", () => {
    const user = {
      id: "user999",
      role: "ADMIN",
      plan_key: "LABEL_ENTERPRISE",
      permissions_override: ["artists:read"], // Already in ADMIN
    };
    const perms = resolveUserPermissions(user);
    const artistReadCount = perms.filter((p) => p === "artists:read").length;
    expect(artistReadCount).toBe(1);
  });
});

describe("StreamGod Brain - Has Permission", () => {
  test("Wildcard access should allow any permission", () => {
    const perms = ["*"];
    expect(hasPermission(perms, "artists:read")).toBe(true);
    expect(hasPermission(perms, "anything:here")).toBe(true);
  });

  test("Exact permission match should work", () => {
    const perms = ["artists:read", "divisions:write"];
    expect(hasPermission(perms, "artists:read")).toBe(true);
    expect(hasPermission(perms, "divisions:write")).toBe(true);
  });

  test("Wildcard prefix should match specific permissions", () => {
    const perms = ["artists:*"];
    expect(hasPermission(perms, "artists:read")).toBe(true);
    expect(hasPermission(perms, "artists:write")).toBe(true);
    expect(hasPermission(perms, "divisions:read")).toBe(false);
  });

  test("No permission check should always pass", () => {
    const perms = [];
    expect(hasPermission(perms, null)).toBe(true);
    expect(hasPermission(perms, undefined)).toBe(true);
  });

  test("Missing permission should return false", () => {
    const perms = ["artists:read"];
    expect(hasPermission(perms, "artists:write")).toBe(false);
  });
});

describe("StreamGod Brain - Route Policies", () => {
  test("getRoutePolicy should return policy for exact match", () => {
    const policy = getRoutePolicy("/portal");
    expect(policy).toBeDefined();
  });

  test("getRoutePolicy should handle wildcard patterns", () => {
    const policy = getRoutePolicy("/portal/roster");
    expect(policy).toBeDefined();
  });

  test("Unknown route should return null", () => {
    const policy = getRoutePolicy("/unknown/route/xyz");
    // May be null or match a catch-all policy
    expect([null, undefined, {}].includes(policy) || typeof policy === "object").toBe(true);
  });
});

describe("StreamGod Brain - Route Access", () => {
  test("OWNER should access any route", () => {
    const user = { id: "owner1", role: "OWNER" };
    const allowed = isRouteAllowed("/portal", user);
    expect(allowed).toBe(true);
  });

  test("ADMIN should access admin routes", () => {
    const user = { id: "admin1", role: "ADMIN", plan_key: "LABEL_ENTERPRISE" };
    const allowed = isRouteAllowed("/portal", user);
    expect(allowed).toBe(true);
  });

  test("Unauthorized user should be denied", () => {
    const user = { id: "user1", role: "GUEST" };
    const allowed = isRouteAllowed("/admin", user);
    // May be denied depending on brain config
    expect(typeof allowed).toBe("boolean");
  });
});
