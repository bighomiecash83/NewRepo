// DMF Gateway – Single front door, multi backend
require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Load config
const configPath = path.join(__dirname, "..", "dmf_backends.json");
const gatewayConfig = require(configPath);

const PORT = process.env.PORT || gatewayConfig.port || 5000;
const REQUIRED_API_KEY = process.env.DMF_API_KEY;
const ENVIRONMENT = process.env.NODE_ENV || "development";

// Target URLs (can override via env)
const targets = {
  firebase: process.env.FIREBASE_BACKEND_URL || "https://your-firebase-backend-url",
  lovable: process.env.LOVABLE_BACKEND_URL || "https://your-lovable-backend-url",
  dotnet: process.env.DOTNET_BRAIN_URL || "http://localhost:5183",
  payments: process.env.PAYMENTS_BACKEND_URL || "http://localhost:5200"
};

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ===== SECURITY: API Key Check (optional based on environment) =====
app.use((req, res, next) => {
  // Skip auth for health check endpoint
  if (req.path === "/health") return next();
  
  // Skip auth if DMF_API_KEY not set (local development)
  if (!REQUIRED_API_KEY) {
    if (ENVIRONMENT !== "development") {
      console.warn(
        "[DMF-GATEWAY] Warning: DMF_API_KEY not set in production environment!"
      );
    }
    return next();
  }

  // Production: require API key
  const providedKey = req.headers["x-dmf-api-key"] || req.headers["authorization"]?.replace("Bearer ", "");
  if (providedKey !== REQUIRED_API_KEY) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing DMF_API_KEY. Include header: x-dmf-api-key: <key>"
    });
  }

  next();
});

// Health check (no auth required)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "dmf-gateway",
    version: "1.0.0",
    environment: ENVIRONMENT,
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Helper to wire a proxy route
function wireProxyRoute(serviceKey, serviceConfig) {
  const backendName = serviceConfig.backend;
  const pathPrefix = serviceConfig.pathPrefix;

  const target = targets[backendName];

  if (!target) {
    console.warn(
      `[DMF-GATEWAY] No target URL configured for backend "${backendName}". Route "${pathPrefix}" will NOT be active.`
    );
    return;
  }

  console.log(
    `[DMF-GATEWAY] Routing ${pathPrefix} -> ${backendName} (${target})`
  );

  app.use(
    pathPrefix,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      // Optional: strip nothing, just pass through
      pathRewrite: (proxyPath, req) => proxyPath
    })
  );
}

// Wire all services from config
Object.entries(gatewayConfig.services || {}).forEach(
  ([serviceKey, serviceConfig]) => {
    wireProxyRoute(serviceKey, serviceConfig);
  }
);

app.listen(PORT, () => {
  console.log(`🚀 DMF Gateway running on http://localhost:${PORT}`);
});
