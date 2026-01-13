#!/bin/bash

# JurisNexo - GCP Infrastructure Setup (Phase 4: Redis)
# Usage: ./setup-phase4-redis.sh

set -e # Exit on error

echo "🚀 Iniciando Setup do Memorystore (Redis)..."

INSTANCE_NAME="jurisnexo-redis"
REGION="southamerica-east1"
PROJECT_ID=$(gcloud config get-value project)

# 1. Validar Pré-requisitos (VPC Peering)
echo "🔍 Verificando se o VPC Peering está ativo (requisito)..."
PEERING_STATE=$(gcloud services vpc-peerings list --network=jurisnexo-vpc --service=servicenetworking.googleapis.com --format="value(state)" 2>/dev/null || echo "NOT_FOUND")

if [[ "$PEERING_STATE" != "ACTIVE" ]]; then
    echo "⚠️  VPC Peering não encontrado ou inativo. Por favor, execute a Fase 3 (Cloud SQL) antes, pois ela configura o peering."
    echo "   Ou execute manualmente: gcloud services vpc-peerings connect ..."
    # Não vamos parar o script, mas o comando abaixo pode falhar.
fi

# 2. Criar Instância Redis
echo "📦 Criando Instância Redis: $INSTANCE_NAME..."
if gcloud redis instances describe $INSTANCE_NAME --region=$REGION &>/dev/null; then
  echo "✅ Instância $INSTANCE_NAME já existe."
else
  gcloud redis instances create $INSTANCE_NAME \
  --size=5 \
  --region=$REGION \
  --redis-version=redis_7_0 \
  --tier=standard \
  --network=projects/$PROJECT_ID/global/networks/jurisnexo-vpc \
  --connect-mode=PRIVATE_SERVICE_ACCESS
fi

echo "⏳ Aguardando provisionamento para obter IP..."
REDIS_HOST=$(gcloud redis instances describe $INSTANCE_NAME --region=$REGION --format="value(host)")
REDIS_PORT=$(gcloud redis instances describe $INSTANCE_NAME --region=$REGION --format="value(port)")

echo ""
echo "✅ Fase 4 Concluída! Redis provisionado."
echo "👇 Copie e rode os comandos abaixo para configurar seu ambiente:"
echo ""
echo "export REDIS_HOST=\"$REDIS_HOST\""
echo "export REDIS_PORT=\"$REDIS_PORT\""
echo ""
