#!/bin/bash

# JurisNexo - Deploy to GKE (Stateful Services)
# Usage: ./deploy-k8s.sh

set -e

echo "🚀 Iniciando Deploy no Kubernetes (GKE)..."

# 1. Configurar credenciais do cluster (caso não esteja configurado)
# gcloud container clusters get-credentials jurisnexo-cluster --region southamerica-east1 --project jurisnexo-prod

# 2. Aplicar Secrets (Se houver secrets manuais, mas idealmente usa-se Secret Manager)
if [ -f "infra/k8s/secrets.yaml" ]; then
    echo "🔑 Applying Secrets..."
    kubectl apply -f infra/k8s/secrets.yaml
fi

# 3. Aplicar Inbox Service (Deployment + Service)
if [ -f "infra/k8s/inbox-deployment.yaml" ]; then
    echo "📨 Deploying Inbox Service..."
    kubectl apply -f infra/k8s/inbox-deployment.yaml
else
    echo "⚠️  infra/k8s/inbox-deployment.yaml não encontrado."
fi

# 4. Aplicar Ingress
if [ -f "infra/k8s/ingress.yaml" ]; then
    echo "🌐 Configuring Ingress..."
    kubectl apply -f infra/k8s/ingress.yaml
fi

echo "✅ Deploy GKE Concluído! Verifique status com: kubectl get all"
