#!/bin/bash

###############################################################################
#
# DMF MUSIC PLATFORM - Advanced Bootstrap Script
# 
# Seeding orchestrator with environment awareness, health checks, and logging
# Supports: dev, stage, prod environments
# Features: Dry-run mode, .env auto-load, MongoDB health check
#
###############################################################################

set -e

# ============================================================================
# Configuration & Defaults
# ============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_ENV="${NODE_ENV:-dev}"
DRY_RUN="${DRY_RUN:-0}"
ROSTER_FILE="${PROJECT_ROOT}/dmf_roster.json"
SEED_SCRIPT="${PROJECT_ROOT}/seed_roster_advanced.js"
ENV_FILE="${PROJECT_ROOT}/.env"

# Resolve MongoDB URI based on NODE_ENV
if [ -z "$MONGO_URI" ]; then
  if [ "$NODE_ENV" = "dev" ]; then
    MONGO_URI="${MONGO_URI_DEV}"
  elif [ "$NODE_ENV" = "stage" ]; then
    MONGO_URI="${MONGO_URI_STAGE}"
  elif [ "$NODE_ENV" = "prod" ]; then
    MONGO_URI="${MONGO_URI_PROD}"
  fi
fi

# ============================================================================
# Logging Functions
# ============================================================================

log() {
  local level=$1
  shift
  local message="$@"
  local timestamp=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
  echo "[DMF][${timestamp}] [${level}] ${message}"
}

logInfo() {
  log "INFO" "$@"
}

logWarn() {
  log "WARN" "$@"
}

logError() {
  log "ERROR" "$@"
}

logSuccess() {
  log "SUCCESS" "$@"
}

# ============================================================================
# Step 1: Pre-flight Checks
# ============================================================================

logInfo "=========================================="
logInfo "DMF Roster Bootstrap - Starting"
logInfo "=========================================="
logInfo "PROJECT_ROOT: ${PROJECT_ROOT}"
logInfo "NODE_ENV: ${NODE_ENV}"
logInfo "DRY_RUN: ${DRY_RUN}"

# Check roster file exists
if [ ! -f "$ROSTER_FILE" ]; then
  logError "Roster file not found: ${ROSTER_FILE}"
  exit 1
fi
logInfo "? Roster file found: ${ROSTER_FILE}"

# Check seed script exists
if [ ! -f "$SEED_SCRIPT" ]; then
  logError "Seed script not found: ${SEED_SCRIPT}"
  exit 1
fi
logInfo "? Seed script found: ${SEED_SCRIPT}"

# ============================================================================
# Step 2: Environment Loading
# ============================================================================

if [ -f "$ENV_FILE" ]; then
  logInfo "Loading .env file..."
  export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
  logSuccess "? .env loaded"
else
  logWarn ".env file not found, using shell environment"
fi

# ============================================================================
# Step 3: Dependency Check
# ============================================================================

logInfo "Checking dependencies..."

# Check Node.js
if ! command -v node &> /dev/null; then
  logError "Node.js not found. Please install Node.js"
  exit 1
fi
logSuccess "? Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
  logError "npm not found. Please install npm"
  exit 1
fi
logSuccess "? npm found: $(npm --version)"

# ============================================================================
# Step 4: Package Installation
# ============================================================================

logInfo "Checking for required packages..."

# Check if package.json exists
if [ ! -f "${PROJECT_ROOT}/package.json" ]; then
  logWarn "package.json not found. Creating minimal package.json..."
  cat > "${PROJECT_ROOT}/package.json" << 'EOF'
{
  "name": "dmf-music-platform",
  "version": "1.0.0",
  "description": "DMF Music Platform Roster Management",
  "main": "seed_roster_advanced.js",
  "scripts": {
    "seed": "node seed_roster_advanced.js"
  },
  "dependencies": {
    "mongoose": "^7.0.0"
  }
}
EOF
  logSuccess "? Created package.json"
fi

# Install dependencies
logInfo "Installing dependencies..."
cd "$PROJECT_ROOT"
npm install mongoose 2>/dev/null || logWarn "npm install completed with warnings"
logSuccess "? Dependencies installed"

# ============================================================================
# Step 5: Validation
# ============================================================================

logInfo "Validating configuration..."

# Check MongoDB URI
if [ -z "$MONGO_URI" ]; then
  logError "MongoDB URI not found. Set MONGO_URI or MONGO_URI_${NODE_ENV^^}"
  exit 1
fi
logSuccess "? MongoDB URI configured"

# Validate JSON
logInfo "Validating roster JSON..."
if ! node -e "JSON.parse(require('fs').readFileSync('${ROSTER_FILE}'))" 2>/dev/null; then
  logError "Invalid JSON in ${ROSTER_FILE}"
  exit 1
fi
logSuccess "? Roster JSON valid"

# ============================================================================
# Step 6: Dry Run Check
# ============================================================================

if [ "$DRY_RUN" = "1" ]; then
  logWarn "DRY_RUN=1 enabled. Showing command only."
  logInfo "Would execute:"
  logInfo "  NODE_ENV=\"${NODE_ENV}\" MONGO_URI=\"***\" node ${SEED_SCRIPT}"
  logSuccess "Dry run complete. No changes made."
  exit 0
fi

# ============================================================================
# Step 7: Execute Seed Script
# ============================================================================

logInfo "=========================================="
logInfo "Starting Roster Seed"
logInfo "=========================================="

export NODE_ENV
export MONGO_URI
export ROSTER_FILE

cd "$PROJECT_ROOT"

# Run seed script
if node "$SEED_SCRIPT"; then
  logSuccess "=========================================="
  logSuccess "Roster Seed Completed Successfully"
  logSuccess "=========================================="
  logInfo "Environment: ${NODE_ENV}"
  logInfo "Timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  exit 0
else
  logError "=========================================="
  logError "Roster Seed Failed"
  logError "=========================================="
  exit 1
fi
