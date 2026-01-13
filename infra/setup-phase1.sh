#!/bin/bash

# JurisNexo - GCP Infrastructure Setup (Phase 1)
# Usage: ./setup-phase1.sh

set -e # Exit on error

echo "🚀 Iniciando Setup Base da Infraestrutura GCP..."

# 1. Criar projeto GCP
PROJECT_ID="jurisnexo-prod"
echo "📦 Criando Projeto: $PROJECT_ID..."
# Check if project exists first to avoid error
if gcloud projects describe $PROJECT_ID &>/dev/null; then
  echo "✅ Projeto $PROJECT_ID já existe."
else
  gcloud projects create $PROJECT_ID --name="JurisNexo Production"
fi

gcloud config set project $PROJECT_ID

echo "🔗 Vinculando Billing Account... (Isso requer intervenção manual ou permissões de Billing Admin)"
echo "⚠️  Certifique-se de que o billing está ativo para este projeto no Console GCP."

# 2. Habilitar APIs necessárias
echo "🔌 Habilitando APIs..."
gcloud services enable \
  container.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  storage-api.googleapis.com \
  cloudscheduler.googleapis.com \
  pubsub.googleapis.com \
  secretmanager.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  dns.googleapis.com

# 3. Criar VPC Network
NETWORK_NAME="jurisnexo-vpc"
echo "🌐 Criando VPC: $NETWORK_NAME..."
if gcloud compute networks describe $NETWORK_NAME &>/dev/null; then
    echo "✅ VPC $NETWORK_NAME já existe."
else
    gcloud compute networks create $NETWORK_NAME \
    --subnet-mode=custom \
    --bgp-routing-mode=regional
fi

# 4. Criar subnets
SUBNET_NAME="jurisnexo-subnet"
REGION="southamerica-east1"
echo "🕸️  Criando Subnet: $SUBNET_NAME na região $REGION..."
if gcloud compute networks subnets describe $SUBNET_NAME --region=$REGION &>/dev/null; then
     echo "✅ Subnet $SUBNET_NAME já existe."
else
    gcloud compute networks subnets create $SUBNET_NAME \
    --network=$NETWORK_NAME \
    --region=$REGION \
    --range=10.0.0.0/24 \
    --enable-private-ip-google-access
fi

# 5. Criar Cloud NAT
ROUTER_NAME="jurisnexo-router"
NAT_NAME="jurisnexo-nat"
echo "🔄 Configurando Cloud Router e NAT..."

if gcloud compute routers describe $ROUTER_NAME --region=$REGION &>/dev/null; then
    echo "✅ Router $ROUTER_NAME já existe."
else
    gcloud compute routers create $ROUTER_NAME \
    --network=$NETWORK_NAME \
    --region=$REGION
fi

if gcloud compute routers nats describe $NAT_NAME --router=$ROUTER_NAME --region=$REGION &>/dev/null; then
    echo "✅ NAT $NAT_NAME já existe."
else
    gcloud compute routers nats create $NAT_NAME \
    --router=$ROUTER_NAME \
    --region=$REGION \
    --auto-allocate-nat-external-ips \
    --nat-all-subnet-ip-ranges
fi

echo "✅ Fase 1 Concluída! Infraestrutura de rede e APIs configuradas."
