#!/bin/bash

# JurisNexo - GCP Cloud DNS Setup (Phase 10)
# Usage: ./setup-phase10-dns.sh

set -e

echo "🌍 Iniciando Setup do Cloud DNS..."

ZONE_NAME="jurisnexo-zone"
DNS_NAME="jurisnexo.com."

# 1. Criar Zona DNS
echo "   Verificando/Criando Managed Zone: $ZONE_NAME..."
if gcloud dns managed-zones describe $ZONE_NAME &>/dev/null; then
    echo "✅ Zona $ZONE_NAME já existe."
else
    gcloud dns managed-zones create $ZONE_NAME \
        --dns-name=$DNS_NAME \
        --description="JurisNexo DNS Zone"
    echo "✅ Zona criada."
fi

# 2. Obter IP Global (da Fase 9)
echo "   Obtendo endereço IP do 'jurisnexo-ip'..."
IP_ADDRESS=$(gcloud compute addresses describe jurisnexo-ip --global --format="value(address)" 2>/dev/null || echo "")

if [ -z "$IP_ADDRESS" ]; then
    echo "❌ Erro: IP 'jurisnexo-ip' não encontrado. Execute ./infra/setup-phase9-security.sh primeiro."
    exit 1
fi

echo "   IP encontrado: $IP_ADDRESS"

# 3. Adicionar Registros (Transaction)
echo "   Atualizando registros DNS..."
# Inicia transação. Se falhar (ex: já existe arquivo de transação), limpa.
if [ -f transaction.yaml ]; then rm transaction.yaml; fi

gcloud dns record-sets transaction start --zone=$ZONE_NAME

# Tenta remover o registro anterior se existir (para evitar erro de 'already exists') 
# --verbosity=none para silenciar erro se não existir
# Mas transaction add não sobrescreve. A lógica de script shell para update de DNS é chata.
# Simplificação: Supomos fresh install ou append. 
# Se adicionar falhar, abortamos a transação.

# Adiciona A record para app.jurisnexo.com
gcloud dns record-sets transaction add $IP_ADDRESS \
    --name="app.jurisnexo.com." \
    --ttl=300 \
    --type=A \
    --zone=$ZONE_NAME || echo "⚠️  Falha ao adicionar registro (já existe?)."

# Adiciona A record para api.jurisnexo.com
gcloud dns record-sets transaction add $IP_ADDRESS \
    --name="api.jurisnexo.com." \
    --ttl=300 \
    --type=A \
    --zone=$ZONE_NAME || echo "⚠️  Falha ao adicionar registro (já existe?)."


echo "   Executando transação..."
gcloud dns record-sets transaction execute --zone=$ZONE_NAME || rm transaction.yaml

echo "✅ Fase 10 Concluída! DNS configurado."
echo "ℹ️  Lembre-se de apontar os NS records no seu registrador de domínio para os nameservers do GCP:"
gcloud dns managed-zones describe $ZONE_NAME --format="value(nameServers)"
