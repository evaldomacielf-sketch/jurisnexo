# Infraestrutura GCP - JurisNexo

Este diretório contém scripts para provisionamento da infraestrutura na Google Cloud Platform (GCP).

## Pré-requisitos

1. **Instalar Google Cloud SDK (gcloud CLI)**
    * Mac (via brew): `brew install --cask google-cloud-sdk`
    * Ou siga: <https://cloud.google.com/sdk/docs/install>
2. **Autenticar**:

    ```bash
    gcloud auth login
    ```

3. **Billing (Pagamento)**:
    * Garanta que você tem uma conta de faturamento ativa na GCP.
    * Ao criar o projeto, você precisará vincular essa conta.

## Executando o Setup

### Fase 1: Fundação (Rede e APIs)

Cria o Projeto, Habilita APIs (GKE, SQL, Redis, etc.), Cria VPC, Subnet e Cloud NAT.

```bash
./infra/setup-phase1.sh
```

> **Nota:** Se o script falhar na criação do projeto por questões de billing, crie o projeto manualmente no console, vincule o billing, e rode o script novamente. Ele é idempotente (verifica se recursos já existem).

### Automação de Uptime Checks (Python)

Para criar verificações de disponibilidade (Health Checks) automáticas:

```bash
pip install -r infra/requirements.txt
export PROJECT_ID="jurisnexo-prod"
python infra/monitoring.py
```

Isso cria um Uptime Check que monitora `api.jurisnexo.com/health` a cada 60s.

### Fase 12: CI/CD (Pipeline)

### Fase 2: Kubernetes (GKE)

Cria o cluster GKE com Autoscaling, Workload Identity e conecta o `kubectl`.

```bash
./infra/setup-phase2-gke.sh
```

Isso provisiona um cluster regional em `southamerica-east1` com nós `e2-standard-4`.

* **Duração estimada**: 15-20 minutos.
* **Custos**: Este cluster gera custos de nós e taxa de gerenciamento. Certifique-se de destruí-lo se for apenas um teste (`gcloud container clusters delete jurisnexo-cluster --region=southamerica-east1`).

### Fase 3: Cloud SQL (PostgreSQL)

Cria a instância de banco de dados, configura o acesso privado (VPC Peering) e gera credenciais.

```bash
./infra/setup-phase3-db.sh
```

Isso provisiona:

* Instância PostgreSQL 15 Regional (HA).
* Database `jurisnexo`.
* Usuário `jurisnexo_app` com senha gerada automaticamente (exibida no final).

### Fase 4: Memorystore (Redis)

Cria a instância Redis para cache e filas. Utiliza o mesmo VPC Peering configurado na Fase 3.

```bash
./infra/setup-phase4-redis.sh
```

Isso provisiona:

* Redis 7.0 Standard Tier (Alta Disponibilidade).
* 5 GB de capacidade.
* Conectado via IP Privado na VPC `jurisnexo-vpc`.

### Conclusão da Infraestrutura Base

Com as Fases 1 a 4 concluídas, você tem:

1. Rede (VPC/NAT).
2. Cluster Kubernetes (Compute).
3. PostgreSQL (Persistência).
4. Redis (Cache).

### Fase 5: Cloud Storage

Cria buckets para Uploads, Backups e Assets Estáticos, e configura CORS.

```bash
./infra/setup-phase5-storage.sh
```

Isso provisiona:

* `gs://jurisnexo-uploads` (com CORS configurado para app.jurisnexo.com e localhost).
* `gs://jurisnexo-backups`.
* `gs://jurisnexo-static`.

### Fase 6: Secret Manager

Cria os segredos (JWT, API Tokens) e configura permissões IAM para que a aplicação no GKE possa acessá-los via Workload Identity.

```bash
./infra/setup-phase6-secrets.sh
```

**Interativo:** O script solicitará que você digite os valores reais dos segredos (de forma segura, sem exibir na tela). Se você não tiver os valores agora, pode pressionar Enter para criar com um placeholder e atualizar depois no Console GCP.

Isso provisiona:

* `jwt-secret`
* `whatsapp-token`
* `sendgrid-key`
* `google-oauth-secret`
* Bindings de IAM para `serviceAccount:...[default/jurisnexo-sa]`

### Fase 7: Containerização e Deploy

Este projeto utiliza **Cloud Run** para serviços stateless (API e Frontend) e **GKE** para serviços stateful (WebSockets - configurado na Fase 2).

#### Arquivos de Docker

* `docker/Dockerfile.api`: Build da API NestJS.
* `docker/Dockerfile.web`: Build do Frontend Next.js.

#### Script de Deploy Automático

O script abaixo constrói as imagens Docker localmente, envia para o Google Container Registry (GCR) e faz o deploy no Cloud Run.

```bash
./infra/deploy-cloudrun.sh
```

**Pré-requisitos do Deploy:**

1. Docker instalado e autenticado (`gcloud auth configure-docker`).
2. Secrets populados no Secret Manager (DATABASE_URL, etc.).

### Fase 7b: Deploy no GKE (WebSockets)

Para os serviços stateful (WebSockets), utilizamos o Kubernetes.

#### Manifestos (`infra/k8s/`)

* `deployment.yaml`: Define o Deployment para o `jurisnexo-websocket-service` (API rodando em modo stateful).
* `service.yaml`: Expõe o deployment.
* `ingress.yaml`: Configura o Load Balancer para rotear tráfego `/socket.io`.
* `secrets.yaml`: Template para injetar variáveis de ambiente.

#### Aplicação

```bash
kubectl apply -f infra/k8s/
```

### Fase 8: Integrações Externas

Configura Tópicos/Subscriptions do Pub/Sub e Service Accounts para integrações (Calendar, etc).

```bash
./infra/setup-phase8-integrations.sh
```

Isso provisiona:

* Tópicos Pub/Sub: `whatsapp-messages`, `notification-events`, etc.
* Service Account `jurisnexo-calendar`.
* Habilita `calendar-json.googleapis.com`.

### Resumo Final

A infraestrutura agora suporta:

1. **Core**: Rede, DB, Cache, Storage.
2. **Compute**: GKE (Stateful) e Cloud Run (Stateless).
3. **Events**: Pub/Sub.
4. **Integrations**: IAM e APIs externas.
