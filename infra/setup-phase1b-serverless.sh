#!/bin/bash

# JurisNexo - GCP Serverless Infrastructure (Artifact Registry & VPC Access)
# Usage: ./setup-phase1b-serverless.sh

set -e

echo "🚀 Configurando Infraestrutura Serverless (Registry & VPC Access)..."

REGION="southamerica-east1"
PROJECT_ID=$(gcloud config get-value project)
REPO_NAME="jurisnexo"
CONNECTOR_NAME="jurisnexo-connector"

# 1. Habilitar APIs necessárias
echo "🔌 Habilitando APIs..."
gcloud services enable \
    artifactregistry.googleapis.com \
    vpcaccess.googleapis.com \
    cloudbuild.googleapis.com

# 2. Criar Artifact Registry
echo "📦 Verificando Artifact Registry: $REPO_NAME..."
if gcloud artifacts repositories describe $REPO_NAME --location=$REGION &>/dev/null; then
    echo "✅ Repositório $REPO_NAME já existe."
else
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker repository for JurisNexo"
    echo "✅ Repositório criado."
fi

# 3. Criar Serverless VPC Connector (Necessário para Cloud Run acessar Redis/SQL Privado)
echo "bridge Verificando VPC Connector: $CONNECTOR_NAME..."
if gcloud compute networks vpc-access connectors describe $CONNECTOR_NAME --region=$REGION &>/dev/null; then
    echo "✅ VPC Connector $CONNECTOR_NAME já existe."
else
    # Requer um range de IP /28 não utilizado na VPC
    # Exemplo: 10.8.0.0/28
    gcloud compute networks vpc-access connectors create $CONNECTOR_NAME \
        --region=$REGION \
        --network=jurisnexo-vpc \
        --range=10.8.0.0/28
    echo "✅ VPC Connector criado."
fi

echo "✅ Fase 1b Concluída!"
