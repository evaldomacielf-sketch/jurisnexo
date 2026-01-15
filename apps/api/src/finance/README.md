# 💰 Módulo Financeiro - JurisNexo

## Visão Geral

Sistema completo de gestão financeira para escritórios de advocacia, incluindo:

- **Contas Bancárias** - Gestão de contas e saldos
- **Transações** - Receitas e despesas com categorização
- **Categorias** - Classificação personalizada
- **Recorrência** - Transações recorrentes automáticas
- **Orçamentos** - Planejamento mensal por categoria
- **Relatórios** - Dashboard, fluxo de caixa, análises

## 🚀 Quick Start

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar ambiente

```bash
cp apps/api/.env.example apps/api/.env
# Edite o .env com suas credenciais
```

### 3. Executar migrations

```bash
# Aplicar migrations do finance module
pnpm supabase db push
```

### 4. Iniciar desenvolvimento

```bash
# Backend (porta 4000)
cd apps/api && pnpm dev

# Frontend (porta 3000)
cd apps/next && pnpm dev
```

## 📁 Estrutura

```
apps/api/src/finance/
├── controllers/
│   ├── bank-account.controller.ts    # /finance/accounts
│   ├── transaction.controller.ts     # /finance/transactions
│   ├── recurring-transaction.controller.ts # /finance/recurring
│   ├── budget.controller.ts          # /finance/budgets
│   ├── reports.controller.ts         # /finance/reports
│   └── category.controller.ts        # /finance/categories
├── services/
│   ├── bank-account.service.ts
│   ├── transaction.service.ts
│   ├── recurring-transaction.service.ts
│   ├── budget.service.ts
│   ├── reports.service.ts
│   ├── category.service.ts
│   ├── receivables.service.ts
│   ├── payables.service.ts
│   └── reports.service.ts
├── dto/
│   ├── bank-account.dto.ts
│   ├── transaction.dto.ts
│   ├── recurring-transaction.dto.ts
│   ├── budget.dto.ts
│   ├── category.dto.ts
│   └── finance.dto.ts
├── __tests__/
│   └── bank-account.service.spec.ts
├── finance.controller.ts
├── finance.service.ts
├── finance.module.ts
└── index.ts
```

## 🔗 API Endpoints

### Contas Bancárias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/finance/accounts` | Criar conta |
| GET | `/finance/accounts` | Listar contas |
| GET | `/finance/accounts/balance` | Saldo consolidado |
| GET | `/finance/accounts/:id` | Buscar por ID |
| PUT | `/finance/accounts/:id` | Atualizar |
| DELETE | `/finance/accounts/:id` | Excluir |

### Transações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/finance/transactions` | Criar transação |
| GET | `/finance/transactions` | Listar com filtros |
| GET | `/finance/transactions/stats/monthly` | Estatísticas mensais |
| GET | `/finance/transactions/stats/by-category` | Por categoria |
| GET | `/finance/transactions/stats/cash-flow` | Fluxo de caixa |
| GET | `/finance/transactions/:id` | Buscar por ID |
| PUT | `/finance/transactions/:id` | Atualizar |
| DELETE | `/finance/transactions/:id` | Excluir |

### Categorias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/finance/categories` | Criar categoria |
| POST | `/finance/categories/seed-defaults` | Criar padrões |
| GET | `/finance/categories` | Listar |
| GET | `/finance/categories/stats` | Estatísticas |
| GET | `/finance/categories/:id` | Buscar por ID |
| PUT | `/finance/categories/:id` | Atualizar |
| DELETE | `/finance/categories/:id` | Excluir |

### Transações Recorrentes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/finance/recurring` | Criar recorrência |
| GET | `/finance/recurring` | Listar recorrências |
| GET | `/finance/recurring/:id` | Buscar por ID |
| PUT | `/finance/recurring/:id` | Atualizar |
| DELETE | `/finance/recurring/:id` | Excluir |

### Orçamentos (Budgets)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/finance/budgets` | Criar orçamento |
| GET | `/finance/budgets` | Listar (year/month) |
| GET | `/finance/budgets/:id` | Buscar por ID |
| PUT | `/finance/budgets/:id` | Atualizar |
| DELETE | `/finance/budgets/:id` | Excluir |

### Relatórios

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/finance/reports/summary` | Resumo mensal (Income/Expense) |

## 🔐 Autenticação

Todos os endpoints requerem:

- Header `Authorization: Bearer <token>`
- Token JWT válido com `tenantId` e `userId`

## 📊 Enums

### AccountType

```typescript
CHECKING | SAVINGS | INVESTMENT | CREDIT_CARD
```

### TransactionType

```typescript
INCOME | EXPENSE
```

### TransactionStatus

```typescript
PENDING | COMPLETED | CANCELLED
```

### PaymentMethod

```typescript
CASH | BANK_TRANSFER | CREDIT_CARD | DEBIT_CARD | PIX | CHECK | OTHER
```

### CategoryType

```typescript
INCOME | EXPENSE | BOTH
```

## 🧪 Testes

```bash
# Rodar todos os testes
pnpm test

# Rodar testes do módulo finance
pnpm test --testPathPattern=finance

# Com coverage
pnpm test --coverage
```

## 🐳 Docker

```bash
# Desenvolvimento
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Produção
docker-compose up -d
```

## 📖 Swagger

Documentação interativa disponível em:

```
http://localhost:4000/api/docs
```
