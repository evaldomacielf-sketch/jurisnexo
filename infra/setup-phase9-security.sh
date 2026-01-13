#!/bin/bash

# JurisNexo - GCP Networking & Security Setup (Phase 9)
# Usage: ./setup-phase9-security.sh
# Configures: Global Static IP, Managed SSL, Cloud Armor (WAF)

set -e

echo "🛡️  Iniciando Setup de Segurança e Rede..."

PROJECT_ID=$(gcloud config get-value project)
POLICY_NAME="jurisnexo-security-policy"

# 1. Endereço IP Estático Global
echo "🌐 Criando IP Estático Global (jurisnexo-ip)..."
if gcloud compute addresses describe jurisnexo-ip --global &>/dev/null; then
  echo "✅ IP jurisnexo-ip já existe."
else
  gcloud compute addresses create jurisnexo-ip --global
  echo "✅ IP criado."
fi

# 2. Certificado SSL Gerenciado
echo "🔒 Criando Certificado SSL Gerenciado..."
DOMAINS="app.jurisnexo.com,api.jurisnexo.com,www.jurisnexo.com"
if gcloud compute ssl-certificates describe jurisnexo-ssl --global &>/dev/null; then
    echo "✅ Certificado jurisnexo-ssl já existe."
else
    gcloud compute ssl-certificates create jurisnexo-ssl \
        --domains=$DOMAINS \
        --global
    echo "✅ Certificado criado para: $DOMAINS."
fi

# 3. Cloud Armor (Security Policy)
echo "🛡️  Configurando Cloud Armor: $POLICY_NAME..."
if ! gcloud compute security-policies describe $POLICY_NAME &>/dev/null; then
    gcloud compute security-policies create $POLICY_NAME \
        --description="Security policy for JurisNexo"
    echo "✅ Policy criada."
else
    echo "✅ Policy já existe."
fi

# Regra 1000: Rate Limiting
echo "   Configurando Rate Limiting (Regra 1000)..."
if ! gcloud compute security-policies rules describe 1000 --security-policy=$POLICY_NAME &>/dev/null; then
    gcloud compute security-policies rules create 1000 \
        --security-policy=$POLICY_NAME \
        --expression="true" \
        --action=rate-based-ban \
        --rate-limit-threshold-count=100 \
        --rate-limit-threshold-interval-sec=60 \
        --ban-duration-sec=600
    echo "✅ Rate Limiting configurado."
else
    echo "✅ Regra 1000 já existe."
fi

# Regra 2000: Geo Blocking (Exemplo CN/RU)
echo "   Configurando Geo Blocking (Regra 2000)..."
if ! gcloud compute security-policies rules describe 2000 --security-policy=$POLICY_NAME &>/dev/null; then
    gcloud compute security-policies rules create 2000 \
        --security-policy=$POLICY_NAME \
        --expression="origin.region_code == 'CN' || origin.region_code == 'RU'" \
        --action=deny-403
    echo "✅ Geo Blocking configurado."
else
    echo "✅ Regra 2000 já existe."
fi

echo "✅ Fase 9 Concluída! IP, SSL e Armor configurados."
echo "ℹ️  Nota: Para que o SSL e o Cloud Armor funcionem, você deve anexá-los a um 'Backend Service' no Load Balancer Global."
