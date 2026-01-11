# Deploy e Execução Local - JurisNexo

## 🏠 Execução Local

### Opção 1: Dev mode (sem Docker)

```bash
# Instalar dependências
pnpm install

# Rodar todos os apps em dev mode
pnpm dev

# Ou individualmente:
pnpm dev:next   # http://localhost:3000
pnpm dev:api    # http://localhost:4000
pnpm dev:worker # http://localhost:4001
```

### Opção 2: Docker Compose

```bash
# Copiar env
cp .env.example .env
# Editar .env com suas credenciais

# Build e start
docker-compose up --build

# Ou em background
docker-compose up -d --build
```

### Health Checks Locais

```bash
# Next.js
curl http://localhost:3000/api/health

# API
curl http://localhost:4000/api/health

# Worker
curl http://localhost:4001/health
```

---

## 🚀 Deploy em Staging (Cloud Run)

### Pré-requisitos

1. Google Cloud CLI instalado e autenticado
2. Projeto GCP com APIs habilitadas:
   - Cloud Run API
   - Artifact Registry API
   - Secret Manager API

### Setup Inicial (uma vez)

```bash
# Autenticar
gcloud auth login
gcloud config set project SEU_PROJECT_ID

# Criar repositório Artifact Registry
gcloud artifacts repositories create jurisnexo \
  --repository-format=docker \
  --location=southamerica-east1

# Autenticar Docker
gcloud auth configure-docker southamerica-east1-docker.pkg.dev

# Criar secrets (substitua pelos valores reais)
echo -n "https://xxx.supabase.co" | gcloud secrets create supabase-url --data-file=-
echo -n "sua-anon-key" | gcloud secrets create supabase-anon-key --data-file=-
echo -n "sua-service-key" | gcloud secrets create supabase-service-key --data-file=-
echo -n "seu-jwt-secret-com-32-chars-min" | gcloud secrets create jwt-secret --data-file=-
```

### Deploy dos Serviços

```bash
# Tornar script executável
chmod +x deploy/deploy-staging.sh

# Deploy individual
./deploy/deploy-staging.sh next SEU_PROJECT_ID
./deploy/deploy-staging.sh api SEU_PROJECT_ID
./deploy/deploy-staging.sh worker SEU_PROJECT_ID

# Ou deploy manual
gcloud run deploy jurisnexo-next-staging \
  --source=. \
  --dockerfile=apps/next/Dockerfile \
  --region=southamerica-east1 \
  --allow-unauthenticated
```

### Verificar Deploy

```bash
# Listar serviços
gcloud run services list --region=southamerica-east1

# Ver URL do serviço
gcloud run services describe jurisnexo-api-staging \
  --region=southamerica-east1 \
  --format='value(status.url)'

# Testar health
curl $(gcloud run services describe jurisnexo-api-staging \
  --region=southamerica-east1 \
  --format='value(status.url)')/api/health
```

### Ver Logs

```bash
gcloud run logs read jurisnexo-api-staging --region=southamerica-east1 --limit=50
```

---

## 🔐 Variáveis de Ambiente

### Obrigatórias por Serviço

| Serviço | Variáveis |
|---------|-----------|
| Next.js | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| API | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` |
| Worker | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |

### Validação de Env

Se uma variável obrigatória estiver faltando, o app **não inicia** e exibe erro no log:

```
❌ [api] Invalid environment variables:
  - JWT_SECRET: JWT_SECRET must be at least 32 characters
[api] Environment validation failed. App will not start.
```
