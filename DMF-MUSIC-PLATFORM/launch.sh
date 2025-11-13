#!/bin/bash
# DMF Music Platform - Automated Launch Script (Linux/macOS)
# Verifies all components, configures environment, and starts the app

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo -e "${BLUE}  ?? DMF MUSIC PLATFORM - LAUNCH${NC}"
echo "=========================================="
echo ""

# Step 1: Verify .NET 10
echo -e "${BLUE}Step 1: Verifying .NET 10...${NC}"
DOTNET_VERSION=$(dotnet --version)
if [[ $DOTNET_VERSION == 10* ]]; then
    echo -e "  Found: $DOTNET_VERSION"
    echo -e "${GREEN}  ? .NET 10 verified${NC}"
else
    echo -e "  Found: $DOTNET_VERSION"
    echo -e "${RED}  ? ERROR: .NET 10 required${NC}"
    exit 1
fi

# Step 2: Check project structure
echo ""
echo -e "${BLUE}Step 2: Verifying project structure...${NC}"
if [ -f "DMF-MUSIC-PLATFORM/DMF-MUSIC-PLATFORM.csproj" ]; then
    echo -e "${GREEN}  ? Backend project found${NC}"
else
    echo -e "${RED}  ? ERROR: Backend project not found${NC}"
    exit 1
fi

if [ -f "DMF-MUSIC-PLATFORM.Client/DMF-MUSIC-PLATFORM.Client.csproj" ]; then
    echo -e "${GREEN}  ? Client project found${NC}"
else
    echo -e "${RED}  ? ERROR: Client project not found${NC}"
    exit 1
fi

# Step 3: Restore packages
echo ""
echo -e "${BLUE}Step 3: Restoring NuGet packages...${NC}"
dotnet restore --no-cache > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ? Packages restored${NC}"
else
    echo -e "${RED}  ? ERROR: Package restore failed${NC}"
    exit 1
fi

# Step 4: Build project
echo ""
echo -e "${BLUE}Step 4: Building project...${NC}"
dotnet build --configuration Debug --no-restore > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ? Build successful${NC}"
else
    echo -e "${RED}  ? ERROR: Build failed${NC}"
    echo "  Run 'dotnet build' for details"
    exit 1
fi

# Step 5: Configuration check
echo ""
echo -e "${BLUE}Step 5: Checking configuration...${NC}"
if [ -f "DMF-MUSIC-PLATFORM/appsettings.json" ]; then
    echo -e "${GREEN}  ? Configuration found${NC}"
else
    echo -e "${RED}  ? ERROR: appsettings.json not found${NC}"
    exit 1
fi

# Step 6: Environment setup
echo ""
echo -e "${BLUE}Step 6: Setting up environment...${NC}"
export ASPNETCORE_ENVIRONMENT=Development
export ASPNETCORE_URLS=https://localhost:5001
echo -e "${GREEN}  ? Environment configured${NC}"

# Step 7: Trust dev certificate
echo ""
echo -e "${BLUE}Step 7: Setting up SSL certificate...${NC}"
dotnet dev-certs https --trust > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ? HTTPS certificate configured${NC}"
else
    echo -e "${YELLOW}  ??  Certificate trust failed (non-critical)${NC}"
fi

# Final check
echo ""
echo "=========================================="
echo -e "${GREEN}  ? ALL CHECKS PASSED - LAUNCHING APP${NC}"
echo "=========================================="
echo ""
echo -e "  ?? The app will be available at:"
echo -e "     ${BLUE}https://localhost:5001${NC}"
echo ""
echo -e "  ??  Press Ctrl+C to stop the app"
echo ""
sleep 3

# Launch the app
echo "Launching application..."
cd DMF-MUSIC-PLATFORM
dotnet run --no-build --configuration Debug

# If we get here, app was stopped
echo ""
echo -e "${BLUE}App stopped.${NC}"
