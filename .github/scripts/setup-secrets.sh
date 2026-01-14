#!/bin/bash

# Script para configurar secrets no GitHub via gh CLI
# Certifique-se de ter as variáveis de ambiente exportadas ou substitua os valores abaixo

# Repository secrets
gh secret set AWS_ACCESS_KEY_ID --body "${AWS_ACCESS_KEY_ID}"
gh secret set AWS_SECRET_ACCESS_KEY --body "${AWS_SECRET_ACCESS_KEY}"
gh secret set SONAR_TOKEN --body "${SONAR_TOKEN}"
gh secret set SNYK_TOKEN --body "${SNYK_TOKEN}"
gh secret set SLACK_WEBHOOK --body "${SLACK_WEBHOOK}"

# Environment-specific secrets
gh secret set STAGING_DB_CONNECTION --env staging --body "${STAGING_DB_CONNECTION}"
gh secret set PROD_DB_CONNECTION --env production --body "${PROD_DB_CONNECTION}"
gh secret set JWT_SECRET_KEY --env production --body "${JWT_SECRET_KEY}"

echo "✅ Secrets configured successfully"
