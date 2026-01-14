# Deploy Guide - JurisNexo

## 1. Clonar o repositório

```bash
git clone https://github.com/jurisnexo/jurisnexo.git
cd jurisnexo
```

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas credenciais (AWS, Database, Redis, etc.)
```

## 3. Deploy da Infraestrutura (Terraform)

Este passo irá provisionar todos os recursos na AWS (VPC, RDS, ECS, ALB, etc.).

```bash
cd terraform

# Inicializar Terraform (baixar providers e módulos)
terraform init

# Validar e planejar as mudanças
terraform plan

# Aplicar as mudanças (provisionar a infra)
# Atenção: Isso gerará custos na AWS.
terraform apply
```

Ao final, o Terraform exibirá os **Outputs** (URLs, IDs). Anote-os, pois serão usados para configurar o CI/CD ou acessar os serviços.

## 4. Deploy da Aplicação (Local / Docker Compose)

Para testar a infraestrutura completa localmente, incluindo o monitoramento:

```bash
docker-compose up -d --build
```

Serviços disponíveis localmente:

- **Frontend:** <http://localhost:3000>
- **Backend API:** <http://localhost:5000>
- **Swagger:** <http://localhost:5000/api/docs>
- **Prometheus:** <http://localhost:9090>
- **Grafana:** <http://localhost:3001>
- **Postgres:** localhost:5432
- **Redis:** localhost:6379

## 5. Executar Migrations (Banco de Dados)

Para aplicar a estrutura do banco de dados (tabelas, índices):

```bash
dotnet ef database update --project src/JurisNexo.Infrastructure
```

## 6. Acessar a Aplicação (Produção)

Após o deploy via Terraform e CI/CD:

- **Frontend:** <https://app.jurisnexo.com> (via CloudFront)
- **Backend API:** <https://api.jurisnexo.com> (via ALB)
- **Swagger:** <https://api.jurisnexo.com/api/docs>
- **Monitoring (Grafana):** <https://monitoring.jurisnexo.com>

## 7. Monitoramento Ativo

- **AWS X-Ray:** Acesse o console AWS > X-Ray > Service Map para ver o rastreamento distribuído.
- **CloudWatch:** Acesse o Dashboard personalizado criado pelo Terraform (`JurisNexo-Production-Overview`).
