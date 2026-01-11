#!/bin/bash
# Deploy JurisNexo services to Cloud Run (Staging)
# Usage: ./deploy/deploy-staging.sh <service> [project_id]
# Example: ./deploy/deploy-staging.sh api my-project-id

set -e

SERVICE=$1
PROJECT_ID=${2:-$GOOGLE_CLOUD_PROJECT}
REGION="southamerica-east1"
REPO="jurisnexo"

if [ -z "$SERVICE" ]; then
  echo "Usage: $0 <service> [project_id]"
  echo "Services: next, api, worker"
  exit 1
fi

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: PROJECT_ID not set. Pass as argument or set GOOGLE_CLOUD_PROJECT"
  exit 1
fi

echo "🚀 Deploying $SERVICE to staging..."
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION"

# Build and push image
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/jurisnexo-${SERVICE}:staging"

echo "📦 Building Docker image..."
docker build \
  -f "apps/${SERVICE}/Dockerfile" \
  -t "$IMAGE_TAG" \
  .

echo "⬆️  Pushing image to Artifact Registry..."
docker push "$IMAGE_TAG"

echo "🌐 Deploying to Cloud Run..."
gcloud run deploy "jurisnexo-${SERVICE}-staging" \
  --image "$IMAGE_TAG" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --port $([ "$SERVICE" = "next" ] && echo "3000" || [ "$SERVICE" = "api" ] && echo "4000" || echo "4001")

echo "✅ Deployed successfully!"
echo "   Run 'gcloud run services describe jurisnexo-${SERVICE}-staging --region $REGION' for URL"
