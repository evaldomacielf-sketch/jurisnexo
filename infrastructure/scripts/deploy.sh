#!/bin/bash
set -e

# =====================================
# 🚀 Deploy Script - JurisNexo
# =====================================

ENVIRONMENT=${1:-staging}
DEPLOY_DIR="/opt/jurisnexo"
REPO_URL="https://github.com/evaldomacielf-sketch/jurisnexo.git"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Deploying JurisNexo - ${ENVIRONMENT}${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. Verificar ambiente
echo -e "${YELLOW}1. Verificando ambiente...${NC}"
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}❌ Ambiente inválido. Use: staging ou production${NC}"
    exit 1
fi

# 2. Criar diretório se não existir
echo -e "${YELLOW}2. Preparando diretório...${NC}"
sudo mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# 3. Clonar ou atualizar repositório
echo -e "${YELLOW}3. Atualizando código...${NC}"
if [ -d ".git" ]; then
    git fetch origin
    git reset --hard origin/main
else
    git clone $REPO_URL .
fi

# 4. Carregar variáveis de ambiente
echo -e "${YELLOW}4. Carregando variáveis de ambiente...${NC}"
if [ -f ".env.${ENVIRONMENT}" ]; then
    export $(cat .env.${ENVIRONMENT} | grep -v '#' | xargs)
else
    echo -e "${RED}❌ Arquivo .env.${ENVIRONMENT} não encontrado${NC}"
    exit 1
fi

# 5. Build e deploy com Docker
echo -e "${YELLOW}5. Building e deployando containers...${NC}"
cd infrastructure/docker

docker-compose -f docker-compose.yml down --remove-orphans || true
docker-compose -f docker-compose.yml build --no-cache
docker-compose -f docker-compose.yml up -d

# 6. Aguardar containers
echo -e "${YELLOW}6. Aguardando containers...${NC}"
sleep 10

# 7. Verificar saúde
echo -e "${YELLOW}7. Verificando saúde dos serviços...${NC}"
if curl -s http://localhost:4000/health | grep -q "healthy"; then
    echo -e "${GREEN}✅ API está saudável${NC}"
else
    echo -e "${RED}⚠️  API pode não estar respondendo ainda${NC}"
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend está acessível${NC}"
else
    echo -e "${RED}⚠️  Frontend pode não estar respondendo ainda${NC}"
fi

# 8. Limpeza
echo -e "${YELLOW}8. Limpando imagens antigas...${NC}"
docker image prune -f

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Frontend: https://app.jurisnexo.com.br"
echo -e "API: https://api.jurisnexo.com.br"
echo -e "Swagger: https://api.jurisnexo.com.br/swagger"
