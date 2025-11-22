#!/usr/bin/env bash
set -euo pipefail

# ====== EDIT THESE ======
RG="dmf-pricing-rg"
LOCATION="eastus"
ACR_NAME="dmfpricingacr0123"          # must be globally unique (lowercase, alphanumeric)
APP_SERVICE_NAME="dmf-pricing-api"    # must be globally unique
IMAGE_TAG="latest"
# ========================

echo "🚀 DMF Azure Deployment Script"
echo "Resource Group: $RG"
echo "ACR: $ACR_NAME"
echo "App Service: $APP_SERVICE_NAME"
echo ""

# Log in guard
az account show >/dev/null 2>&1 || { echo "❌ az CLI not logged in. Run: az login"; exit 1; }

echo "✓ Azure CLI authenticated"

# Create resource group
echo "📦 Creating resource group..."
az group create --name "$RG" --location "$LOCATION" 2>/dev/null || echo "✓ RG already exists"

# Create ACR
echo "📦 Creating container registry..."
az acr create --resource-group "$RG" --name "$ACR_NAME" --sku Basic --admin-enabled true 2>/dev/null || echo "✓ ACR already exists"

ACR_LOGIN_SERVER=$(az acr show -n "$ACR_NAME" --query loginServer -o tsv)
echo "✓ ACR login server: $ACR_LOGIN_SERVER"

# Build and push image
echo "🐳 Building Docker image..."
docker build -t "$APP_SERVICE_NAME:$IMAGE_TAG" .
docker tag "$APP_SERVICE_NAME:$IMAGE_TAG" "$ACR_LOGIN_SERVER/$APP_SERVICE_NAME:$IMAGE_TAG"

echo "📤 Pushing to ACR..."
az acr login -n "$ACR_NAME" --expose-token | docker login "$ACR_LOGIN_SERVER" -u 00000000-0000-0000-0000-000000000000 --password-stdin
docker push "$ACR_LOGIN_SERVER/$APP_SERVICE_NAME:$IMAGE_TAG"

# App Service plan
APP_PLAN="${APP_SERVICE_NAME}-plan"
echo "📦 Ensuring App Service plan..."
az appservice plan create --name "$APP_PLAN" --resource-group "$RG" --is-linux --sku P1V2 2>/dev/null || echo "✓ Plan already exists"

# Create web app
echo "📦 Creating Web App..."
az webapp create --resource-group "$RG" --plan "$APP_PLAN" --name "$APP_SERVICE_NAME" \
  --deployment-container-image-name "$ACR_LOGIN_SERVER/$APP_SERVICE_NAME:$IMAGE_TAG" 2>/dev/null || echo "✓ Web App already exists"

# Configure ACR credentials
echo "🔐 Configuring ACR credentials..."
ACR_USER=$(az acr credential show -n "$ACR_NAME" --query username -o tsv)
ACR_PASS=$(az acr credential show -n "$ACR_NAME" --query "passwords[0].value" -o tsv)
az webapp config container set --name "$APP_SERVICE_NAME" --resource-group "$RG" \
  --docker-custom-image-name "$ACR_LOGIN_SERVER/$APP_SERVICE_NAME:$IMAGE_TAG" \
  --docker-registry-server-url "https://$ACR_LOGIN_SERVER" \
  --docker-registry-server-user "$ACR_USER" \
  --docker-registry-server-password "$ACR_PASS"

# Set app settings (IMPORTANT: replace placeholder values)
echo "⚙️  Setting environment variables..."
echo "⚠️  IMPORTANT: Update these in Azure Portal or Key Vault:"
echo "   - MONGODB_PROD_PASSWORD"
echo "   - Jwt__Key (strong 64+ char random string)"
echo "   - CORS allowed origins"

az webapp config appsettings set --resource-group "$RG" --name "$APP_SERVICE_NAME" --settings \
  ASPNETCORE_ENVIRONMENT="Production" \
  Jwt__Issuer="dmf.local" \
  Jwt__Audience="dmf.clients" \
  DOTNET_RUNNING_IN_CONTAINER="true" \
  CORS__AllowedOrigins="https://dmf-music-platform.web.app" \
  MONGODB_PROD_PASSWORD="PLACEHOLDER_REPLACE_IN_AZURE_PORTAL"

echo ""
echo "✅ Deployment complete!"
echo "🌍 App URL: https://$APP_SERVICE_NAME.azurewebsites.net"
echo "📝 Next steps:"
echo "   1. Go to Azure Portal → App Service → $APP_SERVICE_NAME → Configuration"
echo "   2. Update MONGODB_PROD_PASSWORD and Jwt__Key with real values"
echo "   3. Test: curl https://$APP_SERVICE_NAME.azurewebsites.net/api/pricing/public/plans"
