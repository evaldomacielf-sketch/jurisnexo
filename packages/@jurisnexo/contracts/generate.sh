#!/bin/bash

set -e

echo "🔄 Gerando tipos TypeScript do backend .NET..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar se backend está rodando
echo -e "${BLUE}Verificando se backend está rodando...${NC}"
if ! curl -s http://localhost:5001/health > /dev/null; then
    echo "⚠️  Backend não está rodando. Iniciando..."
    cd ../../../apps/api/JurisNexo.Api
    ASPNETCORE_URLS=http://localhost:5001 ASPNETCORE_ENVIRONMENT=Development dotnet run &
    DOTNET_PID=$!
    sleep 20
else
    echo "✅ Backend já está rodando"
fi

# 2. Baixar OpenAPI spec
echo -e "${BLUE}Baixando OpenAPI spec...${NC}"
curl -s http://localhost:5001/swagger/v1/swagger.json > swagger.json

if [ ! -s swagger.json ]; then
    echo "❌ Erro ao baixar swagger.json"
    exit 1
fi

echo "✅ Swagger.json baixado com sucesso"

# 3. Gerar tipos TypeScript
echo -e "${BLUE}Gerando tipos TypeScript...${NC}"
npx openapi-typescript swagger.json -o src/generated.ts

# 4. Criar arquivo de re-export
cat > src/index.ts << 'EOF'
/**
 * Tipos TypeScript gerados automaticamente do backend .NET
 * ⚠️ NÃO EDITE ESTE ARQUIVO MANUALMENTE
 * Para atualizar: pnpm generate:types
 */

export * from './generated'

// Re-exports convenientes
export type { 
  components,
  paths,
  operations 
} from './generated'

// Tipos de DTOs mais usados
export type CaseDto = components['schemas']['CaseDto']
export type ClientDto = components['schemas']['ClientDto']
export type CreateCaseDto = components['schemas']['CreateCaseDto']
export type UpdateCaseDto = components['schemas']['UpdateCaseDto']
EOF

# 5. Limpar
rm swagger.json
if [ ! -z "$DOTNET_PID" ]; then
    kill $DOTNET_PID 2>/dev/null || true
fi

echo -e "${GREEN}✅ Tipos TypeScript gerados com sucesso!${NC}"
echo "📁 Arquivo: packages/@jurisnexo/contracts/src/generated.ts"
