#!/bin/bash

# JurisNexo - GCP Infrastructure Setup (Phase 3: Cloud SQL)
# Usage: ./setup-phase3-db.sh

set -e # Exit on error

echo "🚀 Iniciando Setup do Cloud SQL (PostgreSQL)..."

INSTANCE_NAME="jurisnexo-db"
DB_NAME="jurisnexo"
DB_USER="jurisnexo_app"
REGION="southamerica-east1"
PROJECT_ID=$(gcloud config get-value project)

# 1. Configurar Private Services Access (Necessário para Cloud SQL com IP Privado)
# Isso conecta a VPC do cliente à rede do Google Services
echo "🌐 Verificando Peering de VPC para Serviços Google..."
# Nota: Isso requer alocar um range de IP. 
# Simplificação: Assumindo que o usuário pode precisar rodar isso manualmente se não existir range.
# Tentaremos alocar se não existir.
gcloud compute addresses create google-managed-services-jurisnexo-vpc \
    --global \
    --purpose=VPC_PEERING \
    --prefix-length=16 \
    --description="Peering for Google Service" \
    --network=jurisnexo-vpc || echo "⚠️  Address range may already exist, proceeding..."

gcloud services vpc-peerings connect \
    --service=servicenetworking.googleapis.com \
    --ranges=google-managed-services-jurisnexo-vpc \
    --network=jurisnexo-vpc \
    --project=$PROJECT_ID || echo "⚠️  Peering connection may already exist, proceeding..."


# 2. Criar Instância
echo "🐘 Criando Instância Cloud SQL: $INSTANCE_NAME..."
if gcloud sql instances describe $INSTANCE_NAME &>/dev/null; then
  echo "✅ Instância $INSTANCE_NAME já existe."
else
  gcloud sql instances create $INSTANCE_NAME \
  --database-version=POSTGRES_15 \
  --tier=db-custom-4-16384 \
  --region=$REGION \
  --network=projects/$PROJECT_ID/global/networks/jurisnexo-vpc \
  --no-assign-ip \
  --backup-start-time=03:00 \
  --enable-bin-log \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=4 \
  --availability-type=REGIONAL
fi

# 3. Criar Database
echo "🗄️  Criando Database: $DB_NAME..."
gcloud sql databases create $DB_NAME --instance=$INSTANCE_NAME || echo "✅ Database já existe."

# 4. Criar Usuário
echo "👤 Criando Usuário: $DB_USER..."

# Gerar senha segura se não fornecida
DB_PASSWORD=$(openssl rand -base64 16)

# Check if user exists
if gcloud sql users list --instance=$INSTANCE_NAME | grep -q $DB_USER; then
    echo "✅ Usuário $DB_USER já existe. (Nota: A senha não foi alterada)"
else
    gcloud sql users create $DB_USER \
    --instance=$INSTANCE_NAME \
    --password=$DB_PASSWORD
    
    echo "✅ Usuário criado com sucesso!"
    echo "🔑 CREDENCIAIS (SALVE AGORA):"
    echo "   User: $DB_USER"
    echo "   Pass: $DB_PASSWORD"
    echo "---------------------------------------------------"
    echo "⚠️  Guarde essa senha em um gerenciador de senhas ou no Secret Manager!"
fi
