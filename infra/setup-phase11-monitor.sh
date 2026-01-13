#!/bin/bash

# JurisNexo - GCP Monitoring Setup (Phase 11)
# Usage: ./setup-phase11-monitor.sh
# Installs Prometheus & Grafana via Helm on GKE

set -e

echo "📊 Iniciando Setup de Monitoramento (Prometheus/Grafana)..."

# 1. Verificar Helm e Habilitar APIs
echo "🔌 Habilitando APIs de Monitoramento..."
gcloud services enable clouderrorreporting.googleapis.com

if ! command -v helm &> /dev/null; then
    echo "❌ Helm não encontrado. Por favor instale o helm (brew install helm)."
    exit 1
fi

# 2. Configurar Contexto do Kubernetes
# Garante que estamos apontando para o cluster certo
echo "   Configurando kubectl context..."
gcloud container clusters get-credentials jurisnexo-cluster --region southamerica-east1 --project $(gcloud config get-value project)

# 3. Criar Namespace
echo "   Criando namespace 'monitoring'..."
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# 4. Adicionar Repo do Prometheus
echo "   Adicionando Helm Repo..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 5. Instalar Stack
echo "   Instalando kube-prometheus-stack..."
# Usamos --upgrade --install para ser idempotente
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.adminPassword='admin' \
  --wait

echo "✅ Fase 11 Concluída! Prometheus e Grafana instalados."
echo "ℹ️  Para acessar o Grafana:"
echo "   kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring"
echo "   Acesse: http://localhost:3000 (User: admin / Pass: admin)"
