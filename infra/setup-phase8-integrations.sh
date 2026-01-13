#!/bin/bash

# JurisNexo - GCP Integrations Setup (Pub/Sub, IAM for Calendar)
# Usage: ./setup-phase8-integrations.sh

set -e

echo "🚀 Iniciando Setup de Integrações (Pub/Sub, IAM)..."

PROJECT_ID=$(gcloud config get-value project)

# --- 1. Cloud Pub/Sub (Message Queue) ---
echo "📨 Configurando Cloud Pub/Sub..."

TOPICS=(
    "whatsapp-messages"
    "notification-events"
    "referral-events"
    "scheduling-events"
)

for TOPIC in "${TOPICS[@]}"; do
    if ! gcloud pubsub topics describe $TOPIC &>/dev/null; then
        echo "   Creating topic: $TOPIC"
        gcloud pubsub topics create $TOPIC
    else
        echo "   Topic $TOPIC already exists."
    fi
done

# Subscriptions
echo "   Verificando Subscriptions..."

if ! gcloud pubsub subscriptions describe whatsapp-processor &>/dev/null; then
    gcloud pubsub subscriptions create whatsapp-processor \
        --topic=whatsapp-messages \
        --ack-deadline=60
    echo "   Subscription 'whatsapp-processor' created."
fi

if ! gcloud pubsub subscriptions describe notification-processor &>/dev/null; then
    gcloud pubsub subscriptions create notification-processor \
        --topic=notification-events \
        --ack-deadline=30
    echo "   Subscription 'notification-processor' created."
fi


# --- 2. Google Calendar Integration (IAM) ---
echo "📅 Configurando Google Calendar Service Account..."
SA_NAME="jurisnexo-calendar"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# Criar Service Account
if ! gcloud iam service-accounts describe $SA_EMAIL &>/dev/null; then
    gcloud iam service-accounts create $SA_NAME \
        --display-name="JurisNexo Calendar Integration"
    echo "   Service Account $SA_NAME criada."
else
    echo "   Service Account $SA_NAME já existe."
fi

# Enable API
echo "   Habilitando Calendar API..."
gcloud services enable calendar-json.googleapis.com

echo "✅ Fase 8 Concluída! Integrações configuradas."
echo "ℹ️  Para o Calendar, você precisará gerar uma chave JSON se não estiver usando Workload Identity:"
echo "   gcloud iam service-accounts keys create key.json --iam-account=$SA_EMAIL"
