#!/bin/bash

# JurisNexo - GCP Infrastructure Setup (Phase 5: Cloud Storage)
# Usage: ./setup-phase5-storage.sh

set -e # Exit on error

echo "🚀 Iniciando Setup do Cloud Storage..."

REGION="southamerica-east1"
PROJECT_ID=$(gcloud config get-value project)

# Lista de Buckets
BUCKETS=(
    "jurisnexo-uploads"
    "jurisnexo-backups"
    "jurisnexo-static"
)

# 1. Criar Buckets
for BUCKET_NAME in "${BUCKETS[@]}"; do
    FULL_BUCKET_NAME="gs://$BUCKET_NAME"
    echo "🪣 Verificando/Criando Bucket: $FULL_BUCKET_NAME..."
    
    if gsutil ls -b $FULL_BUCKET_NAME &>/dev/null; then
        echo "✅ Bucket $FULL_BUCKET_NAME já existe."
    else
        gsutil mb -c STANDARD -l $REGION $FULL_BUCKET_NAME
        echo "✅ Bucket $FULL_BUCKET_NAME criado."
    fi
done

# 2. Configurar CORS
echo "🔄 Configurando CORS para uploads..."
cat > cors.json << EOF
[
  {
    "origin": ["https://app.jurisnexo.com", "https://*.jurisnexo.com", "http://localhost:3000"],
    "method": ["GET", "POST", "PUT"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Aplicar CORS no bucket de uploads
gsutil cors set cors.json gs://jurisnexo-uploads
echo "✅ CORS configurado em gs://jurisnexo-uploads"

# Limpeza
rm cors.json

echo "✅ Fase 5 Concluída! Storage configurado."
