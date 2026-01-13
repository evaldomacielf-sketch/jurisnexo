#!/bin/bash

# JurisNexo - GCP Infrastructure Setup (Phase 6: Secret Manager)
# Usage: ./setup-phase6-secrets.sh

set -e # Exit on error

echo "🚀 Iniciando Setup do Secret Manager..."

PROJECT_ID=$(gcloud config get-value project)
WORKLOAD_IDENTITY_POOL="$PROJECT_ID.svc.id.goog"
K8S_NAMESPACE="default"
K8S_SA="jurisnexo-sa" # Nome da Service Account que usaremos no Kubernetes

echo "🔒 Configurando Secrets. Você será solicitado a inserir os valores."
echo "   (Pressione Enter para usar um valor de teste/placeholder se não tiver o real ainda)"

create_secret() {
    SECRET_NAME=$1
    DISPLAY_NAME=$2
    
    echo ""
    echo "--- Configurando $SECRET_NAME ($DISPLAY_NAME) ---"
    
    # Check if secret exists
    if gcloud secrets describe $SECRET_NAME &>/dev/null; then
        echo "✅ Secret $SECRET_NAME já existe."
    else
        read -s -p "Digite o valor para $SECRET_NAME: " SECRET_VALUE
        echo ""
        
        if [ -z "$SECRET_VALUE" ]; then
            echo "⚠️  Valor vazio. Criando com placeholder 'CHANGE_ME_LATER'..."
            SECRET_VALUE="CHANGE_ME_LATER"
        fi
        
        # Create secret
        gcloud secrets create $SECRET_NAME --replication-policy="automatic"
        echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=-
        echo "✅ Secret $SECRET_NAME criado com sucesso."
    fi
    
    # Grant Access to Workload Identity
    MEMBER="serviceAccount:$WORKLOAD_IDENTITY_POOL[$K8S_NAMESPACE/$K8S_SA]"
    echo "🔑 Concedendo acesso ao Workload Identity ($MEMBER)..."
    
    gcloud secrets add-iam-policy-binding $SECRET_NAME \
      --member="$MEMBER" \
      --role="roles/secretmanager.secretAccessor" > /dev/null
      
    echo "✅ Permissão concedida."
}

# Lista de Secrets
create_secret "jwt-secret" "Chave Secreta JWT"
create_secret "whatsapp-token" "Token da API do WhatsApp"
create_secret "sendgrid-key" "API Key do SendGrid"
create_secret "google-oauth-secret" "Client Secret do Google OAuth"

echo ""
echo "✅ Fase 6 Concluída! Secrets configurados."
echo "ℹ️  Nota: Certifique-se de que a Service Account do Kubernetes '$K8S_SA' no namespace '$K8S_NAMESPACE' seja criada durante o deploy."
