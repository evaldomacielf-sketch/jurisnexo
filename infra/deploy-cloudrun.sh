#!/bin/bash

# JurisNexo - Deploy to Cloud Run (Stateless Services) using Cloud Build
# Usage: ./deploy-cloudrun.sh

set -e

REGION="southamerica-east1"
PROJECT_ID=$(gcloud config get-value project)
REPO="southamerica-east1-docker.pkg.dev/$PROJECT_ID/jurisnexo"
CONNECTOR="jurisnexo-connector"

echo "🚀 Iniciando Deploy via Cloud Build..."

# Validate Connector
if ! gcloud compute networks vpc-access connectors describe $CONNECTOR --region=$REGION &>/dev/null; then
    echo "❌ Erro: VPC Connector '$CONNECTOR' não encontrado. Execute infra/setup-phase1b-serverless.sh primeiro."
    exit 1
fi

# --- 1. API Service (NestJS) ---
API_IMAGE="$REPO/jurisnexo-api:latest"
echo "🔨 [API] Submitting Build to Cloud Build..."
# Usando o Dockerfile.api na raiz
gcloud builds submit --tag $API_IMAGE --file docker/Dockerfile.api .

echo "🚀 [API] Deploying to Cloud Run..."
gcloud run deploy jurisnexo-api \
    --image=$API_IMAGE \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --min-instances=1 \
    --max-instances=20 \
    --cpu=2 \
    --memory=1Gi \
    --vpc-connector=$CONNECTOR \
    --ingress=internal-and-cloud-load-balancing \
    --set-env-vars="NODE_ENV=production" \
    --set-secrets="DATABASE_URL=DATABASE_URL:latest,REDIS_URL=REDIS_URL:latest,JWT_SECRET=jwt-secret:latest"

# --- 2. Web Service (Next.js) ---
WEB_IMAGE="$REPO/jurisnexo-web:latest"
echo "🔨 [WEB] Submitting Build to Cloud Build..."
gcloud builds submit --tag $WEB_IMAGE --file docker/Dockerfile.web .

echo "🚀 [WEB] Deploying to Cloud Run..."
gcloud run deploy jurisnexo-web \
    --image=$WEB_IMAGE \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --min-instances=1 \
    --max-instances=10 \
    --cpu=1 \
    --memory=512Mi \
    --vpc-connector=$CONNECTOR \
    --ingress=all 
    # Frontend needs public ingress usually, unless meant to be behind extensive LB logic explicitly. 'all' is default public + internal.

echo "✅ Deploy Concluído!"
