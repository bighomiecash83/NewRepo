#!/bin/bash
# scripts/deploy-cloudrun-worker.sh
# Deploy private Cloud Run service for StreamGod worker

set -e

PROJECT_ID=${1:-$GCLOUD_PROJECT}
IMAGE=${2:-gcr.io/$PROJECT_ID/streamgod-worker:latest}
REGION=${3:-us-central1}
SERVICE_NAME=${4:-streamgod-worker}

if [ -z "$PROJECT_ID" ]; then
  echo "❌ PROJECT_ID not provided."
  echo "Usage: ./deploy-cloudrun-worker.sh <PROJECT_ID> [IMAGE] [REGION] [SERVICE_NAME]"
  exit 1
fi

echo "🚀 Deploying Cloud Run worker: $SERVICE_NAME"
echo "   Project: $PROJECT_ID"
echo "   Image: $IMAGE"
echo "   Region: $REGION"

# Create service account if it doesn't exist
SA_NAME="streamgod-run-sa"
echo "Setting up service account: $SA_NAME..."
gcloud iam service-accounts create $SA_NAME \
  --project=$PROJECT_ID \
  --display-name="StreamGod Cloud Run Service Account" \
  2>/dev/null || echo "  (service account exists)"

SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# Grant Pub/Sub subscriber role
echo "Granting Pub/Sub subscriber role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/pubsub.subscriber" \
  --quiet 2>/dev/null || echo "  (role already granted)"

# Grant Pub/Sub publisher role (for updating status)
echo "Granting Pub/Sub publisher role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/pubsub.publisher" \
  --quiet 2>/dev/null || echo "  (role already granted)"

# Grant Firestore access (for artist/release data)
echo "Granting Firestore access..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/datastore.user" \
  --quiet 2>/dev/null || echo "  (role already granted)"

# Deploy Cloud Run service (private/no public access)
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE \
  --project=$PROJECT_ID \
  --region=$REGION \
  --platform managed \
  --no-allow-unauthenticated \
  --service-account=$SA_EMAIL \
  --memory=2Gi \
  --cpu=2 \
  --concurrency=10 \
  --max-instances=100 \
  --set-env-vars="PUBSUB_SUBSCRIPTION=projects/$PROJECT_ID/subscriptions/bots-sub,RELEASES_TOPIC=projects/$PROJECT_ID/topics/releases-queue,FIREBASE_PROJECT_ID=$PROJECT_ID" \
  --timeout=3600 \
  --quiet

echo ""
echo "✅ Cloud Run worker deployed!"
echo ""
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo "Access: Private (requires service account + ID token)"
echo ""
echo "To test with authentication:"
echo "  gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)' | xargs -I {} gcloud run services call $SERVICE_NAME --region=$REGION"
