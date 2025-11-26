#!/bin/bash
# scripts/setup-pubsub.sh
# Create Pub/Sub topics and subscriptions for portless DMF

set -e

PROJECT_ID=${1:-$GCLOUD_PROJECT}
REGION=${2:-us-central1}

if [ -z "$PROJECT_ID" ]; then
  echo "❌ PROJECT_ID not provided. Usage: ./setup-pubsub.sh <PROJECT_ID> [REGION]"
  exit 1
fi

echo "📝 Setting up Pub/Sub for project: $PROJECT_ID"

# Releases topic - for creating/publishing releases
echo "Creating releases-queue topic..."
gcloud pubsub topics create releases-queue --project=$PROJECT_ID 2>/dev/null || echo "  (topic exists)"

echo "Creating releases-sub subscription..."
gcloud pubsub subscriptions create releases-sub \
  --topic=releases-queue \
  --ack-deadline=600 \
  --project=$PROJECT_ID \
  2>/dev/null || echo "  (subscription exists)"

# Bot commands topic - for streaming bot tasks
echo "Creating bots-commands topic..."
gcloud pubsub topics create bots-commands --project=$PROJECT_ID 2>/dev/null || echo "  (topic exists)"

echo "Creating bots-sub subscription..."
gcloud pubsub subscriptions create bots-sub \
  --topic=bots-commands \
  --ack-deadline=600 \
  --project=$PROJECT_ID \
  2>/dev/null || echo "  (subscription exists)"

# Revenue sync topic - for analytics updates
echo "Creating revenue-sync topic..."
gcloud pubsub topics create revenue-sync --project=$PROJECT_ID 2>/dev/null || echo "  (topic exists)"

echo "Creating revenue-sub subscription..."
gcloud pubsub subscriptions create revenue-sub \
  --topic=revenue-sync \
  --ack-deadline=300 \
  --project=$PROJECT_ID \
  2>/dev/null || echo "  (subscription exists)"

# Contracts topic - for legal workflows
echo "Creating contracts-workflows topic..."
gcloud pubsub topics create contracts-workflows --project=$PROJECT_ID 2>/dev/null || echo "  (topic exists)"

echo "Creating contracts-sub subscription..."
gcloud pubsub subscriptions create contracts-sub \
  --topic=contracts-workflows \
  --ack-deadline=300 \
  --project=$PROJECT_ID \
  2>/dev/null || echo "  (subscription exists)"

echo ""
echo "✅ Pub/Sub topics and subscriptions ready!"
echo ""
echo "Topics created:"
gcloud pubsub topics list --project=$PROJECT_ID --format="table(name)"
echo ""
echo "Subscriptions created:"
gcloud pubsub subscriptions list --project=$PROJECT_ID --format="table(name,topic)"
