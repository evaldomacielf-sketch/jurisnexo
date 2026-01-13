#!/bin/bash

# JurisNexo - Security Hardening & Compliance (Phase 13)
# Usage: ./setup-phase13-compliance.sh
# Enables: Audit Logs (Data Access), Security Command Center (Standard)

set -e

echo "🛡️  Iniciando Setup de Compliance e Segurança..."
PROJECT_ID=$(gcloud config get-value project)

# 1. Habilitar Security Command Center (Standard Tier)
# O scc standard é gratuito para recursos do GCP.
echo "👮 Configurando Security Command Center (Standard)..."
# Nota: A ativação via CLI pode variar dependendo do nível da organização.
# Este comando ativa o SCC no projeto atual.
gcloud scc settings services enable \
    --service=SECURITY_HEALTH_ANALYTICS \
    --project=$PROJECT_ID || echo "⚠️  Falha ao ativar SCC (Pode exigir permissões de Organização)"

gcloud scc settings services enable \
    --service=WEB_SECURITY_SCANNER \
    --project=$PROJECT_ID || echo "⚠️  Falha ao ativar Web Security Scanner"

# 2. Configurar Audit Logs (Data Access)
# Por padrão, apenas 'Admin Write' é logado. Queremos 'Data Read' e 'Data Write' para recursos críticos.
# Vamos habilitar para Cloud SQL, Cloud Storage e Secret Manager.

echo "📝 Configurando Audit Logs (Data Access)..."

# Criamos um arquivo temporário de política
cat > audit-policy.yaml <<EOF
auditConfigs:
- service: allServices
  auditLogConfigs:
  - logType: ADMIN_READ
  - logType: DATA_READ
  - logType: DATA_WRITE
EOF

# Aplicar a política (CUIDADO: Isso sobrescreve políticas existentes, ideal usar set-iam-policy com merge)
# Para segurança, vamos apenas exibir o comando que o usuário deve rodar, pois alterar IAM automaticamente é arriscado.
echo "⚠️  ATENÇÃO: Para habilitar Data Access Logs em TODOS os serviços, execute:"
echo "   gcloud projects set-iam-policy $PROJECT_ID audit-policy.yaml"
echo ""
echo "   Conteúdo de audit-policy.yaml criado:"
cat audit-policy.yaml

# 3. Revisão de Firewall (Check)
echo "🔥 Verificando Regras de Firewall (Portas Perigosas)..."
OPEN_SSH=$(gcloud compute firewall-rules list --filter="allowed:22 AND sourceRanges:0.0.0.0/0" --format="value(name)")

if [ -n "$OPEN_SSH" ]; then
    echo "❌ ALERTA: Porta SSH (22) aberta para o mundo encontrada nas regras: $OPEN_SSH"
    echo "   Recomendação: Remova o acesso 0.0.0.0/0 e use IAP (Identity-Aware Proxy)."
else
    echo "✅ Nenhuma regra SSH aberta para o mundo detectada."
fi

# 4. Habilitar reCAPTCHA Enterprise API
echo "🤖 Habilitando reCAPTCHA Enterprise API..."
gcloud services enable recaptchaenterprise.googleapis.com

echo "✅ Fase 13 (Infra) Concluída!"
echo "ℹ️  Próximos passos: Implementar CSP headers na aplicação e configurar chaves do reCAPTCHA."
