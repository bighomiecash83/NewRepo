#!/bin/bash

echo "🚀 DMF Cloud Shell Extension Installation"
echo "=========================================="
echo ""

# Step 1: Install Gemini CLI
echo "📥 Step 1: Installing Gemini CLI..."
npm install -g @google/generative-ai-cli 2>&1 | grep -E "added|up to date"

if command -v gemini &> /dev/null; then
    echo "✅ Gemini CLI installed"
    gemini --version
else
    echo "❌ Gemini CLI installation failed"
    exit 1
fi

echo ""

# Step 2: Install Genkit extension
echo "📥 Step 2: Installing Genkit extension..."
gemini extensions install https://github.com/google/genkit

echo ""

# Step 3: Install Kubernetes MCP
echo "📥 Step 3: Installing Kubernetes MCP..."
gemini extensions install https://github.com/Flux159/mcp-server-kubernetes

echo ""

# Step 4: Verify all extensions
echo "✅ Verifying all extensions..."
gemini extensions list

echo ""
echo "✅ =========================================="
echo "✅ Installation Complete!"
echo "✅ =========================================="
echo ""
echo "You now have:"
echo "  ✅ Gemini CLI (AI chat)"
echo "  ✅ Genkit (AI workflows)"
echo "  ✅ Kubernetes MCP (deployment)"
echo ""
echo "Next: gemini chat"
echo ""
