#!/bin/bash
# Production Environment Setup for DMF Portless Stack
# This script sets up all Google Cloud resources and secrets

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     DMF Portless Stack - Production Environment Setup      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Check prerequisites
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found. Install: https://cloud.google.com/sdk${NC}"
    exit 1
fi

if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found. Install: npm install -g firebase-tools${NC}"
    exit 1
fi

# Get project configuration
read -p "📋 Enter GCP Project ID (e.g., dmf-music-platform-5f1a5): " PROJECT_ID
read -p "🌍 Enter GCP Region (default: us-central1): " REGION
REGION=${REGION:-us-central1}

echo -e "${BLUE}🔐 Setting GCP Project: ${PROJECT_ID}${NC}"
gcloud config set project $PROJECT_ID

# Step 1: Create Service Accounts
echo -e "\n${BLUE}Step 1: Creating Service Accounts${NC}"

# Firebase Functions service account
echo -e "${YELLOW}Creating Firebase Functions service account...${NC}"
gcloud iam service-accounts create firebase-functions-sa \
    --display-name="Firebase Functions Service Account" \
    --quiet 2>/dev/null || echo "Account already exists"

# Cloud Run service account
echo -e "${YELLOW}Creating Cloud Run worker service account...${NC}"
gcloud iam service-accounts create streamgod-run-sa \
    --display-name="Streamgod Cloud Run Service Account" \
    --quiet 2>/dev/null || echo "Account already exists"

# GitHub Actions service account
echo -e "${YELLOW}Creating GitHub Actions service account...${NC}"
gcloud iam service-accounts create github-actions-sa \
    --display-name="GitHub Actions CI/CD Service Account" \
    --quiet 2>/dev/null || echo "Account already exists"

# Step 2: Create Pub/Sub Topics and Subscriptions
echo -e "\n${BLUE}Step 2: Setting up Pub/Sub Topics and Subscriptions${NC}"

# Releases queue
echo -e "${YELLOW}Creating releases-queue topic...${NC}"
gcloud pubsub topics create releases-queue --quiet 2>/dev/null || echo "Topic already exists"
gcloud pubsub subscriptions create releases-sub \
    --topic=releases-queue \
    --ack-deadline=60 \
    --message-retention-duration=7d \
    --quiet 2>/dev/null || echo "Subscription already exists"

# Bots commands queue
echo -e "${YELLOW}Creating bots-commands topic...${NC}"
gcloud pubsub topics create bots-commands --quiet 2>/dev/null || echo "Topic already exists"
gcloud pubsub subscriptions create bots-sub \
    --topic=bots-commands \
    --ack-deadline=30 \
    --message-retention-duration=1d \
    --quiet 2>/dev/null || echo "Subscription already exists"

# Step 3: Set up Cloud Secrets
echo -e "\n${BLUE}Step 3: Setting up Google Cloud Secrets${NC}"

# MongoDB URI
echo -e "${YELLOW}Creating MONGO_URI secret...${NC}"
read -sp "Enter MongoDB Connection URI: " MONGO_URI
echo ""
echo -n "$MONGO_URI" | gcloud secrets create MONGO_URI --data-file=- --quiet 2>/dev/null || \
  echo -n "$MONGO_URI" | gcloud secrets versions add MONGO_URI --data-file=-

# JWT Secret
echo -e "${YELLOW}Creating JWT_SECRET...${NC}"
JWT_SECRET=$(openssl rand -base64 32)
echo -n "$JWT_SECRET" | gcloud secrets create JWT_SECRET --data-file=- --quiet 2>/dev/null || \
  echo -n "$JWT_SECRET" | gcloud secrets versions add JWT_SECRET --data-file=-
echo "✅ JWT_SECRET created (auto-generated)"

# OpenAI API Key
echo -e "${YELLOW}Creating OPENAI_API_KEY secret...${NC}"
read -sp "Enter OpenAI API Key: " OPENAI_API_KEY
echo ""
echo -n "$OPENAI_API_KEY" | gcloud secrets create OPENAI_API_KEY --data-file=- --quiet 2>/dev/null || \
  echo -n "$OPENAI_API_KEY" | gcloud secrets versions add OPENAI_API_KEY --data-file=-

# Firebase Admin SDK key (optional)
echo -e "${YELLOW}Firebase Admin SDK will use Workload Identity (no key needed)${NC}"

# Step 4: Set IAM Roles
echo -e "\n${BLUE}Step 4: Configuring IAM Roles${NC}"

FUNCTIONS_SA="firebase-functions-sa@${PROJECT_ID}.iam.gserviceaccount.com"
CLOUDRUN_SA="streamgod-run-sa@${PROJECT_ID}.iam.gserviceaccount.com"
GITHUB_SA="github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com"

# Firebase Functions permissions
echo -e "${YELLOW}Granting Firebase Functions permissions...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${FUNCTIONS_SA}" \
    --role="roles/datastore.editor" \
    --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${FUNCTIONS_SA}" \
    --role="roles/pubsub.publisher" \
    --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${FUNCTIONS_SA}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

# Cloud Run permissions
echo -e "${YELLOW}Granting Cloud Run worker permissions...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUDRUN_SA}" \
    --role="roles/pubsub.subscriber" \
    --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUDRUN_SA}" \
    --role="roles/datastore.user" \
    --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUDRUN_SA}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

# GitHub Actions permissions
echo -e "${YELLOW}Granting GitHub Actions permissions...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${GITHUB_SA}" \
    --role="roles/run.admin" \
    --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${GITHUB_SA}" \
    --role="roles/cloudfunctions.developer" \
    --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${GITHUB_SA}" \
    --role="roles/firebase.admin" \
    --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${GITHUB_SA}" \
    --role="roles/artifactregistry.writer" \
    --quiet

# Step 5: Create Firestore Database
echo -e "\n${BLUE}Step 5: Setting up Firestore Database${NC}"

echo -e "${YELLOW}Creating Firestore database in ${REGION}...${NC}"
gcloud firestore databases create \
    --location=$REGION \
    --type=firestore-native \
    --quiet 2>/dev/null || echo "Database already exists"

# Set Firestore indexes for common queries
echo -e "${YELLOW}Setting up recommended Firestore indexes...${NC}"
cat > /tmp/firestore-indexes.yaml << 'EOF'
indexes:
  - collectionGroup: releases
    queryScope: Collection
    fields:
      - fieldPath: artistId
        order: ASCENDING
      - fieldPath: status
        order: ASCENDING
      - fieldPath: releaseDate
        order: DESCENDING
  - collectionGroup: artists
    queryScope: Collection
    fields:
      - fieldPath: createdAt
        order: DESCENDING
EOF
# Note: Manual index creation is required in Console for complex queries

# Step 6: Create Artifact Registry Repository
echo -e "\n${BLUE}Step 6: Setting up Artifact Registry${NC}"

echo -e "${YELLOW}Creating docker repository...${NC}"
gcloud artifacts repositories create streamgod-docker \
    --repository-format=docker \
    --location=$REGION \
    --quiet 2>/dev/null || echo "Repository already exists"

# Step 7: Configure VPC Connector for MongoDB
echo -e "\n${BLUE}Step 7: Setting up Serverless VPC Connector${NC}"

echo -e "${YELLOW}Creating VPC connector for MongoDB access...${NC}"
gcloud compute networks vpc-connectors create dmf-connector \
    --region=$REGION \
    --subnet=default \
    --machine-type=e2-micro \
    --min-instances=2 \
    --max-instances=10 \
    --quiet 2>/dev/null || echo "VPC connector already exists"

# Step 8: Set up Cloud Budget Alerts
echo -e "\n${BLUE}Step 8: Creating Budget Alerts${NC}"

BUDGET_LIMIT=500  # Monthly budget in USD
cat > /tmp/budget.json << EOF
{
  "displayName": "DMF Monthly Budget",
  "budgetFilter": {
    "projects": ["projects/$PROJECT_ID"],
    "services": [
      "services/9A19A335-A550-4925-9487-CD554858303E",
      "services/A4CC9899-82FA-44BF-8A9D-D07AC8E1A67A",
      "services/95FF-2EF5-5EA1-FD4B",
      "services/A1E8F5F1-A6D0-4FB3-80D4-41D8FF96AB57"
    ]
  },
  "amount": {
    "specifiedAmount": {
      "currencyCode": "USD",
      "units": "$BUDGET_LIMIT"
    }
  },
  "thresholdRules": [
    {
      "thresholdPercent": 0.5
    },
    {
      "thresholdPercent": 0.8
    },
    {
      "thresholdPercent": 1.0
    }
  ]
}
EOF
echo -e "${YELLOW}Budget alert template created (configure in Cloud Console)${NC}"

# Step 9: Create GitHub Actions Workload Identity
echo -e "\n${BLUE}Step 9: Setting up Workload Identity for GitHub Actions${NC}"

echo -e "${YELLOW}Creating Workload Identity Provider...${NC}"
gcloud iam workload-identity-pools create github-pool \
    --project=$PROJECT_ID \
    --location=global \
    --display-name="GitHub Actions Pool" \
    --quiet 2>/dev/null || echo "Pool already exists"

gcloud iam workload-identity-pools providers create-oidc github \
    --project=$PROJECT_ID \
    --location=global \
    --workload-identity-pool=github-pool \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,assertion.aud=assertion.aud,assertion.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --quiet 2>/dev/null || echo "Provider already exists"

# Get Workload Identity Provider resource name
WORKLOAD_IDENTITY_PROVIDER=$(gcloud iam workload-identity-pools providers describe github \
    --project=$PROJECT_ID \
    --location=global \
    --workload-identity-pool=github-pool \
    --format='value(name)')

# Bind GitHub Actions service account
echo -e "${YELLOW}Binding GitHub Actions to service account...${NC}"
gcloud iam service-accounts add-iam-policy-binding $GITHUB_SA \
    --project=$PROJECT_ID \
    --role=roles/iam.workloadIdentityUser \
    --member="principalSet://iam.googleapis.com/projects/$PROJECT_ID/locations/global/workloadIdentityPools/github-pool/attribute.repository/dmf-music-platform" \
    --quiet

# Step 10: Display configuration
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Configuration Complete - Save These Values         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "${GREEN}✅ Project Setup Complete!${NC}\n"

echo "📋 GitHub Secrets to Configure:"
echo "================================"
echo "GCP_PROJECT_ID: $PROJECT_ID"
echo "WORKLOAD_IDENTITY_PROVIDER: $WORKLOAD_IDENTITY_PROVIDER"
echo "SERVICE_ACCOUNT: $GITHUB_SA"
echo "FIREBASE_TOKEN: (Get from: firebase login:ci)"
echo "SLACK_WEBHOOK: (Optional, from Slack)"
echo "MODEL_BUDGET_LIMIT: 500 (monthly USD budget for models)"

echo -e "\n📊 Key Resources Created:"
echo "=========================="
echo "✅ Pub/Sub Topics: releases-queue, bots-commands"
echo "✅ Service Accounts: 3 created with proper IAM roles"
echo "✅ Firestore Database: Ready in $REGION"
echo "✅ Artifact Registry: streamgod-docker repository"
echo "✅ VPC Connector: dmf-connector for MongoDB access"
echo "✅ Secrets: MONGO_URI, JWT_SECRET, OPENAI_API_KEY"

echo -e "\n🚀 Next Steps:"
echo "=============="
echo "1. Configure GitHub Secrets (see values above)"
echo "2. Get Firebase Token: firebase login:ci"
echo "3. Add GitHub Secrets to: https://github.com/YOUR_ORG/dmf-music-platform/settings/secrets"
echo "4. Create MongoDB Atlas IP whitelist for Cloud Functions/Run IPs"
echo "5. Push to main branch to trigger deployment"

echo -e "\n📚 Documentation:"
echo "=================="
echo "Firestore: https://console.firebase.google.com/project/$PROJECT_ID"
echo "Cloud Run: https://console.cloud.google.com/run?project=$PROJECT_ID"
echo "Pub/Sub: https://console.cloud.google.com/cloudpubsub?project=$PROJECT_ID"

echo -e "\n${GREEN}Setup complete! Configuration saved.${NC}\n"
