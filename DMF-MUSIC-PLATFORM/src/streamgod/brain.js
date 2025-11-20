/**
 * StreamGod Brain Loader & Helpers
 * Central nervous system for DMF-MUSIC-PLATFORM
 * 
 * Loads streamgod_brain.config.json and provides:
 * - Role-based permission resolution
 * - Plan-based feature access
 * - Route policy enforcement
 * - Model selection routing
 * - Mode configuration (dev/staging/prod)
 */

const fs = require("fs");
const path = require("path");

// Load brain config from project root
const brainPath = path.join(process.cwd(), "streamgod_brain.config.json");

let brain = null;

try {
  const brainContent = fs.readFileSync(brainPath, "utf8");
  brain = JSON.parse(brainContent);
  console.log("[StreamGod] Brain loaded successfully");
} catch (err) {
  console.error("[StreamGod] Failed to load brain config:", err.message);
  throw new Error(
    "StreamGod brain configuration not found. Create streamgod_brain.config.json in project root."
  );
}

// ============================================================================
// ROLE PERMISSIONS
// ============================================================================

/**
 * Get base permissions defined for a role.
 * OWNER is special: always returns ["*"] (full access).
 */
function getRolePermissions(role) {
  if (!role) return [];
  if (role === "OWNER") return ["*"];

  const roleDef = brain.access_control.roles[role];
  if (!roleDef) {
    console.warn(`[StreamGod] Unknown role: ${role}`);
    return [];
  }

  return roleDef.permissions || [];
}

/**
 * Get plan-based permissions from the brain.
 * Plans grant additional features based on tier.
 */
function getPlanPermissions(planKey) {
  if (!planKey) return [];

  const plan = brain.access_control.plans[planKey];
  if (!plan) {
    console.warn(`[StreamGod] Unknown plan: ${planKey}`);
    return [];
  }

  return plan.permissions || [];
}

// ============================================================================
// PERMISSION RESOLUTION
// ============================================================================

/**
 * Resolve full permission set for a user.
 * Combines: role permissions + plan permissions + overrides
 * OWNER always gets ["*"]
 */
function resolveUserPermissions(user) {
  if (!user) return [];

  // OWNER has full access by definition
  if (user.role === "OWNER") return ["*"];

  const rolePerms = getRolePermissions(user.role);
  const planPerms = getPlanPermissions(user.plan_key);
  const overrides = user.permissions_override || [];

  const all = [...rolePerms, ...planPerms, ...overrides];

  // Remove duplicates
  return Array.from(new Set(all));
}

/**
 * Check if a permission list includes a required permission.
 * Handles wildcards: "artists:*" matches "artists:read", "artists:write", etc.
 */
function hasPermission(perms, required) {
  if (!required) return true; // No requirement = allowed
  if (perms.includes("*")) return true; // OWNER always allowed

  // Check exact match
  if (perms.includes(required)) return true;

  // Check wildcard prefix match (e.g., "artists:*" matches "artists:read")
  if (required.includes(":")) {
    const prefix = required.split(":")[0] + ":";
    const wildcardPerm = prefix + "*";
    if (perms.includes(wildcardPerm)) return true;
  }

  return false;
}

// ============================================================================
// ROUTE POLICIES
// ============================================================================

/**
 * Get route policy from brain.access_control.route_policies.
 * Supports exact path matching and wildcard patterns.
 */
function getRoutePolicy(pathname) {
  const policies = brain.access_control.route_policies || {};

  // Exact match first
  if (policies[pathname]) return policies[pathname];

  // Wildcard match (e.g., /portal/** matches /portal/roster, /portal/artists, etc.)
  const wildcardKey = Object.keys(policies).find((key) => {
    if (!key.includes("**")) return false;
    const prefix = key.replace("/**", "");
    return pathname.startsWith(prefix + "/") || pathname === prefix;
  });

  if (wildcardKey) return policies[wildcardKey];

  return null;
}

/**
 * Check if a user is allowed to access a route based on brain policies.
 * Returns true if allowed, false if denied.
 */
function isRouteAllowed(pathname, user) {
  const policy = getRoutePolicy(pathname);

  // No explicit policy = allow
  if (!policy) return true;

  // If route is internal_only, only OWNER/ADMIN allowed
  if (policy.internal_only) {
    const allowed = ["OWNER", "ADMIN"].includes(user?.role);
    if (!allowed) {
      console.warn(
        `[StreamGod] User ${user?.id || "unknown"} denied internal route: ${pathname}`
      );
      return false;
    }
  }

  // Check required permission
  if (policy.required_permission) {
    const perms = resolveUserPermissions(user);
    const hasIt = hasPermission(perms, policy.required_permission);

    if (!hasIt) {
      console.warn(
        `[StreamGod] User ${user?.id || "unknown"} missing permission ${
          policy.required_permission
        } for ${pathname}`
      );
      return false;
    }
  }

  return true;
}

// ============================================================================
// MODEL ROUTING
// ============================================================================

/**
 * Select the best OpenAI model for a given task type.
 * Respects routing preferences and fallbacks defined in the brain.
 */
function selectModelForTask(taskType) {
  const ai = brain.ai_models;

  if (!ai) {
    throw new Error(
      "AI models not configured in StreamGod brain. Check streamgod_brain.config.json"
    );
  }

  const routing = ai.routing;
  const task = routing.tasks[taskType];

  if (!task) {
    throw new Error(
      `No routing task defined in StreamGod brain for: ${taskType}`
    );
  }

  const providerKey = ai.default_provider || "openai";
  const provider = ai.providers[providerKey];

  if (!provider) {
    throw new Error(`Provider not found in brain: ${providerKey}`);
  }

  // Try preferred models first, then fallbacks
  const { preferred_models = [], fallback_models = [] } = task;
  const allCandidates = [...preferred_models, ...fallback_models];

  const selectedModel = allCandidates.find((m) => !!provider.models[m]);

  if (!selectedModel) {
    throw new Error(
      `No valid model found in provider '${providerKey}' for task '${taskType}'`
    );
  }

  const modelDetails = provider.models[selectedModel];

  return {
    provider: providerKey,
    model: selectedModel,
    details: modelDetails,
    task: {
      type: taskType,
      description: task.description,
    },
  };
}

/**
 * Prepare a model routing job for a specific task.
 * Returns an object with provider, model, payload ready to send to OpenAI.
 */
function streamgodRouter(taskType, input, options = {}) {
  const { provider, model, details, task } = selectModelForTask(taskType);

  console.log(
    `[StreamGod] Router selected model '${model}' for task '${taskType}'`
  );

  // Build payload for OpenAI API
  const payload = {
    model,
    input,
    task: task.type,
    ...options,
  };

  return {
    provider,
    model,
    details,
    task,
    payload,
  };
}

// ============================================================================
// MODE CONFIGURATION
// ============================================================================

/**
 * Get mode-specific settings (dev/staging/prod).
 * Affects logging, caching, rate limits, etc.
 */
function getModeConfig(modeKey) {
  const mode = brain.modes[modeKey];
  if (!mode) {
    console.warn(`[StreamGod] Unknown mode: ${modeKey}, defaulting to development`);
    return brain.modes.development;
  }
  return mode;
}

/**
 * Get the current mode from environment.
 */
function getCurrentMode() {
  const env = process.env.NODE_ENV || "development";
  const modeMap = {
    production: "production",
    staging: "staging",
    development: "development",
    dev: "development",
  };
  return modeMap[env] || "development";
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Brain config access
  brain,
  getCurrentMode,
  getModeConfig,

  // Permissions & Access Control
  getRolePermissions,
  getPlanPermissions,
  resolveUserPermissions,
  hasPermission,

  // Route Policies
  getRoutePolicy,
  isRouteAllowed,

  // Model Routing
  selectModelForTask,
  streamgodRouter,
};
