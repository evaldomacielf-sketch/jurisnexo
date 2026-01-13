#!/bin/bash

# JurisNexo - GCP Infrastructure Setup (Phase 2: GKE)
# Usage: ./setup-phase2-gke.sh

set -e # Exit on error

echo "🚀 Iniciando Setup do Cluster Kubernetes (GKE)..."

CLUSTER_NAME="jurisnexo-cluster"
REGION="southamerica-east1"
NETWORK="jurisnexo-vpc"
SUBNET="jurisnexo-subnet"

# Verificar se o projeto está configurado
PROJECT_ID=$(gcloud config get-value project)
echo "🔍 Verificando Projeto Atual: $PROJECT_ID"
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Nenhum projeto selecionado. Rode 'gcloud config set project jurisnexo-prod' primeiro."
    exit 1
fi

# 1. Criar GKE Cluster
echo "☸️  Criando Cluster GKE: $CLUSTER_NAME (Pode levar de 10 a 20 minutos)..."

if gcloud container clusters describe $CLUSTER_NAME --region=$REGION &>/dev/null; then
  echo "✅ Cluster $CLUSTER_NAME já existe."
else
  gcloud container clusters create $CLUSTER_NAME \
  --region=$REGION \
  --network=$NETWORK \
  --subnetwork=$SUBNET \
  --enable-ip-alias \
  --enable-autoscaling \
  --min-nodes=2 \
  --max-nodes=10 \
  --machine-type=e2-standard-4 \
  --disk-size=50 \
  --disk-type=pd-ssd \
  --enable-autorepair \
  --enable-autoupgrade \
  --enable-stackdriver-kubernetes \
  --addons=HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver \
  --workload-pool=$PROJECT_ID.svc.id.goog \
  --enable-shielded-nodes \
  --release-channel=regular
fi

# 2. Configurar kubectl
echo "🔑 Obtendo credenciais para kubectl..."
gcloud container clusters get-credentials $CLUSTER_NAME --region=$REGION

echo "✅ Fase 2 Concluída! Cluster GKE configurado e kubectl conectado."
echo "   Teste com: kubectl get nodes"
