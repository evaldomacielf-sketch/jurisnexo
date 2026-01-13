#!/bin/bash

# JurisNexo - CI/CD Setup (Phase 12)
# Usage: ./setup-phase12-cicd.sh
# Creates Cloud Build Trigger linked to GitHub

set -e

echo "🔄 Configurando CI/CD (Cloud Build Trigger)..."

# Configurações do Repositório
# IMPORTANTE: Substitua pelos valores reais ou exporte as variáveis antes de rodar
REPO_NAME=${REPO_NAME:-"jurisnexo-backend"}
REPO_OWNER=${REPO_OWNER:-"seu-usuario"}
TRIGGER_NAME="jurisnexo-deploy-main"

echo "ℹ️  Configurando trigger para:"
echo "   Repo: $REPO_OWNER/$REPO_NAME"
echo "   Branch: main"
echo "   Config: cloudbuild.yaml"

# Criar Trigger
if gcloud builds triggers describe $TRIGGER_NAME &>/dev/null; then
    echo "✅ Trigger $TRIGGER_NAME já existe."
else
    echo "🚀 Criando trigger..."
    
    # Nota: A conexão com GitHub precisa ser pré-autorizada no Cloud Console
    # Se falhar via CLI, faça a conexão manual em: https://console.cloud.google.com/cloud-build/triggers/connect
    
    gcloud builds triggers create github \
        --name="$TRIGGER_NAME" \
        --repo-name="$REPO_NAME" \
        --repo-owner="$REPO_OWNER" \
        --branch-pattern="^main$" \
        --build-config="cloudbuild.yaml" \
        --region="southamerica-east1"
        
    echo "✅ Trigger criado com sucesso!"
fi

echo "✅ Fase 12 Concluída! CI/CD configurado."
echo "ℹ️  Para testar, faça um push para a branch 'main'."
