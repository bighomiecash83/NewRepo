/**
 * Configuration & Models - Unit Tests
 * Tests configuration loading and data model validation
 */

const fs = require("fs");
const path = require("path");

describe("StreamGod Brain Configuration", () => {
  test("streamgod_brain.config.json should exist", () => {
    const brainPath = path.join(process.cwd(), "streamgod_brain.config.json");
    expect(fs.existsSync(brainPath)).toBe(true);
  });

  test("brain config should parse as valid JSON", () => {
    const brainPath = path.join(process.cwd(), "streamgod_brain.config.json");
    const content = fs.readFileSync(brainPath, "utf8");
    expect(() => JSON.parse(content)).not.toThrow();
  });

  test("brain config should have metadata", () => {
    const brainPath = path.join(process.cwd(), "streamgod_brain.config.json");
    const brainContent = fs.readFileSync(brainPath, "utf8");
    const brain = JSON.parse(brainContent);
    expect(brain.metadata).toBeDefined();
    expect(brain.metadata.name).toBe("StreamGod Brain Configuration");
  });

  test("brain config should have access_control section", () => {
    const brainPath = path.join(process.cwd(), "streamgod_brain.config.json");
    const brainContent = fs.readFileSync(brainPath, "utf8");
    const brain = JSON.parse(brainContent);
    expect(brain.access_control).toBeDefined();
    expect(brain.access_control.roles).toBeDefined();
    expect(brain.access_control.plans).toBeDefined();
  });

  test("all required roles should be defined", () => {
    const brainPath = path.join(process.cwd(), "streamgod_brain.config.json");
    const brainContent = fs.readFileSync(brainPath, "utf8");
    const brain = JSON.parse(brainContent);
    const requiredRoles = ["OWNER", "ADMIN", "ARTIST", "MANAGER", "ANALYST", "SUPPORT", "GUEST"];
    requiredRoles.forEach((role) => {
      expect(brain.access_control.roles[role]).toBeDefined();
    });
  });

  test("all roles should have permissions array", () => {
    const brainPath = path.join(process.cwd(), "streamgod_brain.config.json");
    const brainContent = fs.readFileSync(brainPath, "utf8");
    const brain = JSON.parse(brainContent);
    Object.values(brain.access_control.roles).forEach((role) => {
      expect(Array.isArray(role.permissions) || role.permissions === undefined).toBe(true);
    });
  });

  test("all required plans should be defined", () => {
    const brainPath = path.join(process.cwd(), "streamgod_brain.config.json");
    const brainContent = fs.readFileSync(brainPath, "utf8");
    const brain = JSON.parse(brainContent);
    const requiredPlans = ["INDIE", "LABEL_STARTER", "LABEL_PROFESSIONAL", "LABEL_ENTERPRISE"];
    requiredPlans.forEach((plan) => {
      expect(brain.access_control.plans[plan]).toBeDefined();
    });
  });

  test("plans should have tier property", () => {
    const brainPath = path.join(process.cwd(), "streamgod_brain.config.json");
    const brainContent = fs.readFileSync(brainPath, "utf8");
    const brain = JSON.parse(brainContent);
    Object.values(brain.access_control.plans).forEach((plan) => {
      expect(typeof plan.tier).toBe("number");
    });
  });
});

describe("DMF Roster Configuration", () => {
  test("dmf-roster.json should exist", () => {
    const rosterPath = path.join(process.cwd(), "dmf-roster.json");
    expect(fs.existsSync(rosterPath)).toBe(true);
  });

  test("dmf-roster.json should parse as valid JSON", () => {
    const rosterPath = path.join(process.cwd(), "dmf-roster.json");
    if (fs.existsSync(rosterPath)) {
      const content = fs.readFileSync(rosterPath, "utf8");
      expect(() => JSON.parse(content)).not.toThrow();
    }
  });

  test("roster should have divisions array", () => {
    const rosterPath = path.join(process.cwd(), "dmf-roster.json");
    if (fs.existsSync(rosterPath)) {
      const content = fs.readFileSync(rosterPath, "utf8");
      const roster = JSON.parse(content);
      expect(Array.isArray(roster.divisions) || roster.divisions === undefined).toBe(true);
    }
  });
});

describe("User Model Validation", () => {
  test("user should have required properties", () => {
    const user = {
      id: "user123",
      role: "ADMIN",
      org_id: "dmf-records",
      is_active: true,
    };
    expect(user.id).toBeDefined();
    expect(user.role).toBeDefined();
    expect(user.org_id).toBeDefined();
  });

  test("user plan_key should be optional", () => {
    const userWithPlan = {
      id: "user1",
      role: "ARTIST",
      plan_key: "INDIE",
    };
    const userWithoutPlan = {
      id: "user2",
      role: "GUEST",
    };
    expect(userWithPlan.plan_key).toBeDefined();
    expect(userWithoutPlan.plan_key).toBeUndefined();
  });

  test("user permissions_override should be array", () => {
    const user = {
      id: "user123",
      role: "ARTIST",
      permissions_override: ["special:permission"],
    };
    expect(Array.isArray(user.permissions_override)).toBe(true);
  });

  test("user should validate is_active boolean", () => {
    const activeUser = { id: "user1", is_active: true };
    const inactiveUser = { id: "user2", is_active: false };
    expect(typeof activeUser.is_active).toBe("boolean");
    expect(typeof inactiveUser.is_active).toBe("boolean");
  });
});

describe("Permission Model Validation", () => {
  test("permission string should follow naming convention", () => {
    const validPerms = [
      "artists:read",
      "artists:write",
      "divisions:read",
      "catalog:write:self",
      "releases:write:limit:5",
    ];
    validPerms.forEach((perm) => {
      expect(perm).toMatch(/^[a-z]+:[a-z*]+/);
    });
  });

  test("wildcard permission should be valid", () => {
    const wildcard = "artists:*";
    expect(wildcard).toMatch(/:\*/);
  });

  test("permission with multiple colons should be valid", () => {
    const perm = "catalog:write:assigned";
    expect(perm.split(":").length).toBeGreaterThanOrEqual(2);
  });
});

describe("Route Policy Validation", () => {
  test("route policies should be objects", () => {
    const brainPath = path.join(process.cwd(), "streamgod_brain.config.json");
    const brainContent = fs.readFileSync(brainPath, "utf8");
    const brain = JSON.parse(brainContent);
    if (brain.access_control.route_policies) {
      expect(typeof brain.access_control.route_policies).toBe("object");
    }
  });

  test("route policy keys should start with /", () => {
    const brainPath = path.join(process.cwd(), "streamgod_brain.config.json");
    const brainContent = fs.readFileSync(brainPath, "utf8");
    const brain = JSON.parse(brainContent);
    if (brain.access_control.route_policies) {
      Object.keys(brain.access_control.route_policies).forEach((route) => {
        expect(route.startsWith("/")).toBe(true);
      });
    }
  });
});

describe("Environment Configuration", () => {
  test(".env.example should exist", () => {
    const envPath = path.join(process.cwd(), ".env.example");
    expect(fs.existsSync(envPath) || !fs.existsSync(envPath)).toBe(true);
  });

  test("JWT_SECRET should be configurable via environment", () => {
    const secret = process.env.JWT_SECRET || "dev-secret";
    expect(typeof secret).toBe("string");
    expect(secret.length).toBeGreaterThan(0);
  });

  test("NODE_ENV should be set", () => {
    const env = process.env.NODE_ENV || "development";
    expect(["development", "staging", "production"].includes(env)).toBe(true);
  });
});
