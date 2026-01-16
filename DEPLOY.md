# Guia de Deploy - JurisNexo (Hostinger VPS)

Este guia descreve como implantar o JurisNexo SaaS em uma VPS Hostinger usando Docker e Docker Compose.

## 📁 Estrutura de Deploy

Usamos Docker para garantir que o ambiente de produção seja idêntico ao de desenvolvimento.

### 1. Preparação da VPS

Certifique-se de que a VPS possui Docker e Docker Compose instalados:

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo apt-get install docker-compose-plugin
```

### 2. Configuração de Variáveis (Root .env)

Crie um arquivo `.env` na raiz do projeto com as credenciais de produção:

```env
# Database (Supabase)
DB_CONNECTION_STRING="Host=aws-0-us-west-2.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.xxx;Password=xxx"

# Auth
JWT_SECRET_KEY="sua_chave_secreta_longa"

# Redis
REDIS_PASSWORD="sua_senha_redis"

# WhatsApp integration
EVOLUTION_API_URL="https://api.verona.net.br"
EVOLUTION_API_KEY="seu_token"
```

### 3. Deploy com Docker Compose

Execute o comando de build e inicialização:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 4. Serviços Mapeados

- **Frontend (Next.js)**: Porta 3000 (Mapeado via Nginx para porta 80/443)
- **Backend (.NET)**: Porta 4000
- **Worker (Jobs)**: Porta 4001
- **Redis**: Porta 6379

## 🛡️ Segurança e Manutenção

- **Rate Limiting**: Já configurado nativamente no backend .NET (5 req/min no login).
- **Logs**: Logs são enviados para o Sentry e consolidados no console do Docker.
- **SSL**: Recomendamos o uso de Nginx Proxy Manager ou Certbot na VPS para gerenciar certificados SSL.

---
Para dúvidas arquiteturais, consulte o `README.md`.
