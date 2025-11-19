/**
 * StreamGod-Powered Middleware
 * Auth + Permissions using the brain config
 */

const jwt = require("jsonwebtoken");
const { resolveUserPermissions, hasPermission, isRouteAllowed } = require("../streamgod/brain");

// Dummy User model for this example
// In your real system, replace with actual MongoDB User model
class User {
  static async findById(id) {
    // Stub: return a mock user for demo
    return {
      _id: id,
      role: "ADMIN",
      org_id: "dmf-records",
      plan_key: "LABEL_ENTERPRISE",
      is_active: true,
      permissions_override: [],
    };
  }
}

/**
 * Authentication Middleware
 * Verifies JWT token and loads user from database
 * Sets req.user on success, rejects on failure
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    // No token = no auth
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No JWT token provided",
      });
    }

    // Verify & decode JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");

    // Load user from database
    const user = await User.findById(payload.sub);

    // User must exist and be active
    if (!user || !user.is_active) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not found or inactive",
      });
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      role: user.role,
      org_id: user.org_id,
      plan_key: user.plan_key,
      permissions_override: user.permissions_override || [],
    };

    console.log(
      `[StreamGod] Auth: User ${req.user.id} (${req.user.role}) authenticated`
    );

    next();
  } catch (err) {
    console.error("[StreamGod] Auth error:", err.message);

    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
}

/**
 * Route Guard Middleware
 * Uses StreamGod brain policies to enforce access control
 * Checks if user is allowed to access a given route
 */
function routeGuard() {
  return (req, res, next) => {
    try {
      // Unauthenticated requests are rejected
      if (!req.user) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      const pathname = req.path;
      const allowed = isRouteAllowed(pathname, req.user);

      if (!allowed) {
        console.warn(
          `[StreamGod] Denied: User ${req.user.id} (${req.user.role}) tried to access ${pathname}`
        );

        return res.status(403).json({
          error: "Forbidden",
          message: "You do not have permission to access this resource",
          route: pathname,
        });
      }

      console.log(`[StreamGod] Allowed: User ${req.user.id} ? ${pathname}`);

      next();
    } catch (err) {
      console.error("[StreamGod] Route guard error:", err.message);

      return res.status(500).json({
        error: "Internal Server Error",
        message: "Route policy check failed",
      });
    }
  };
}

/**
 * Permission Requirement Middleware
 * Enforce a specific permission from the brain
 * Example: requirePermission("catalog:write")
 */
function requirePermission(required) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      const perms = resolveUserPermissions(req.user);

      if (!hasPermission(perms, required)) {
        console.warn(
          `[StreamGod] Permission denied: User ${req.user.id} missing '${required}'`
        );

        return res.status(403).json({
          error: "Forbidden",
          message: `Permission required: ${required}`,
          required_permission: required,
        });
      }

      console.log(
        `[StreamGod] Permission granted: User ${req.user.id} has '${required}'`
      );

      next();
    } catch (err) {
      console.error("[StreamGod] Permission check error:", err.message);

      return res.status(500).json({
        error: "Internal Server Error",
        message: "Permission check failed",
      });
    }
  };
}

/**
 * Role-Based Access Control Middleware
 * Ensure user has one of the specified roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.warn(
        `[StreamGod] Role denied: User ${req.user.id} is ${req.user.role}, requires one of ${allowedRoles.join(
          ", "
        )}`
      );

      return res.status(403).json({
        error: "Forbidden",
        message: "Insufficient role",
        required_roles: allowedRoles,
        user_role: req.user.role,
      });
    }

    next();
  };
}

/**
 * Org/Owner check
 * Ensure user is accessing only their own org's data
 */
function ownerOrAdmin() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!["OWNER", "ADMIN"].includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Admin access required",
      });
    }

    next();
  };
}

module.exports = {
  authMiddleware,
  routeGuard,
  requirePermission,
  requireRole,
  ownerOrAdmin,
};
