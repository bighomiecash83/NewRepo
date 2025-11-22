#!/usr/bin/env bash
# generate_jwt.sh - Generate test JWT for local/dev testing
# Usage: ./scripts/generate_jwt.sh
# Output: JWT token suitable for Authorization: Bearer <token> header

set -euo pipefail

# Check if jwt-cli is installed
if ! command -v jwt &> /dev/null; then
  echo "Installing jwt-cli..."
  cargo install jwt-cli 2>/dev/null || {
    echo "⚠️  jwt-cli not available. Using Node.js fallback..."
    node - << 'EOF'
const jwt = require('jsonwebtoken');
const key = process.env.JWT_KEY || 'supersecret_long_key_replace_me_with_production_key_min_64_chars';
const token = jwt.sign(
  { 
    role: 'Admin', 
    sub: 'test-admin-user',
    email: 'test@dmf.local'
  },
  key,
  { 
    issuer: 'dmf.local', 
    audience: 'dmf.clients', 
    expiresIn: '8h' 
  }
);
console.log(token);
EOF
    exit 0
  }
fi

# Use jwt-cli if available
JWT_KEY="${JWT_KEY:-supersecret_long_key_replace_me_with_production_key_min_64_chars}"
echo '{"role":"Admin","sub":"test-admin-user","email":"test@dmf.local"}' | jwt encode --secret="$JWT_KEY" --alg=HS256 --iss="dmf.local" --aud="dmf.clients"
