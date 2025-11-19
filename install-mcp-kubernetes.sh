#!/bin/bash

echo "🚀 Installing MCP Server Kubernetes for Gemini CLI..."
echo ""

# Install the extension
gemini extensions install https://github.com/Flux159/mcp-server-kubernetes

echo ""
echo "✅ Installation complete!"
echo ""

# Verify it's there
echo "📋 Verifying installation..."
gemini extensions list | grep kubernetes

echo ""
echo "🎯 Next steps:"
echo "   1. Start Gemini chat: gemini chat"
echo "   2. Ask: 'Help me deploy DMF to Google Cloud using Kubernetes'"
echo "   3. The MCP will generate deployment manifests"
echo ""
echo "✨ You now have:"
echo "   ✓ Gemini CLI (chat with AI)"
echo "   ✓ Genkit (build AI workflows)"
echo "   ✓ MCP Kubernetes (deploy to GKE/Cloud Run)"
echo ""
