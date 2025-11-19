#!/bin/bash

# DMF Music Platform Bootstrap Launcher
# One-shot script to verify, build, and launch the backend
# Usage: ./dmf_bootstrap.sh

set -e

echo "🚀 DMF Music Platform Bootstrap Launcher"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Check .NET SDK
echo -n "🔍 Checking .NET SDK... "
if command -v dotnet &> /dev/null; then
    DOTNET_VERSION=$(dotnet --version)
    echo -e "${GREEN}✅ Found: $DOTNET_VERSION${NC}"
else
    echo -e "${RED}❌ .NET SDK not found. Install from https://dotnet.microsoft.com/download${NC}"
    exit 1
fi

echo ""

# 2. Verify backend project exists
echo -n "🔍 Checking backend project... "
if [ -d "dmf-music-platform.Web" ] && [ -f "dmf-music-platform.Web/dmf-music-platform.Web.csproj" ]; then
    echo -e "${GREEN}✅ Found dmf-music-platform.Web${NC}"
else
    echo -e "${RED}❌ Backend project not found. Run from solution root.${NC}"
    exit 1
fi

echo ""

# 3. Verify config file
echo -n "🔍 Checking DMF config file... "
if [ -f "dmf-music-platform.Web/Config/dmf_company_profile.json" ]; then
    echo -e "${GREEN}✅ Found dmf_company_profile.json${NC}"
else
    echo -e "${RED}❌ Config file not found at dmf-music-platform.Web/Config/dmf_company_profile.json${NC}"
    exit 1
fi

echo ""

# 4. Set environment variables
echo "🔧 Setting environment variables..."

# MongoDB URI
if [ -z "$DMF_MONGO_URI" ]; then
    DMF_MONGO_URI="mongodb+srv://bighomiecash8346:ENTER_YOUR_PASSWORD_HERE@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?retryWrites=true&w=majority"
    echo -e "${YELLOW}⚠️  DMF_MONGO_URI not set. Using default (UPDATE PASSWORD)${NC}"
    echo "   Export before running: export DMF_MONGO_URI='mongodb+srv://...'"
else
    echo -e "${GREEN}✅ DMF_MONGO_URI set${NC}"
fi

export DMF_MONGO_URI
export ASPNETCORE_ENVIRONMENT="Development"
export ASPNETCORE_URLS="http://localhost:5000"

echo -e "${GREEN}✅ ASPNETCORE_ENVIRONMENT = Development${NC}"
echo -e "${GREEN}✅ ASPNETCORE_URLS = http://localhost:5000${NC}"

echo ""

# 5. Restore NuGet packages
echo "📦 Restoring NuGet packages..."
cd dmf-music-platform.Web
dotnet restore
cd ..

echo -e "${GREEN}✅ Restore complete${NC}"
echo ""

# 6. Build
echo "🔨 Building backend..."
cd dmf-music-platform.Web
dotnet build --configuration Debug
cd ..

echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# 7. Launch
echo "🚀 Launching DMF backend..."
echo "========================================"
echo ""
echo "Backend running at: http://localhost:5000"
echo ""
echo "Test these endpoints:"
echo "  📄 Company Profile:"
echo "     http://localhost:5000/api/company/profile"
echo ""
echo "  🏢 Service Divisions:"
echo "     http://localhost:5000/api/company/services"
echo ""
echo "  🏥 Health Check:"
echo "     http://localhost:5000/api/company/health"
echo ""
echo "Press CTRL+C to stop."
echo "========================================"
echo ""

cd dmf-music-platform.Web
dotnet run --configuration Debug --no-build
