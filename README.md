# JurisNexo - CRM Jurídico Multi-tenant

Sistema de gestão para escritórios de advocacia com integração WhatsApp, gestão de casos, financeiro e painel administrativo.

## Pré-requisitos

- Node.js >= 20.0.0
- pnpm >= 9.0.0 (instale com `npm install -g pnpm` ou `corepack enable`)

## 🚀 Quick Start

```bash
# Instalar pnpm (se ainda não tiver)
corepack enable
corepack prepare pnpm@latest --activate

# Ou via npm (pode requerer sudo)
npm install -g pnpm

# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Executar testes
pnpm test
```

## 📦 Estrutura do Monorepo

```text
jurisnexo/
├── apps/
│   ├── next/          # Frontend (Next.js) - site/app/auth hosts
│   ├── api/           # API REST (NestJS)
│   └── worker/        # Background jobs (NestJS + BullMQ)
├── packages/
│   ├── config/        # Env schema + app config
│   ├── shared/        # DTOs, validators, utils
│   └── db/            # Supabase client + migrations
└── supabase/
    ├── migrations/
    └── functions/
```

## 🔧 Apps

### Next.js (`apps/next`)

Frontend servindo múltiplos hosts:

- `site.jurisnexo.com.br` → Landing page
- `app.jurisnexo.com.br` → Dashboard
- `auth.jurisnexo.com.br` → Login/Register

```bash
pnpm dev:next     # Porta 3000
```

### API (`apps/api`)

Backend REST com NestJS + Swagger:

```bash
pnpm dev:api      # Porta 4000
# Docs: http://localhost:4000/docs
```

### Worker (`apps/worker`)

Background jobs com NestJS + BullMQ:

```bash
pnpm dev:worker   # Porta 4001
```

## 📚 Packages

| Package | Descrição |
| :--- | :--- |
| `@jurisnexo/config` | Validação de env com Zod |
| `@jurisnexo/shared` | DTOs, validators brasileiros (CPF, CNPJ, OAB) |
| `@jurisnexo/db` | Cliente Supabase tipado + migrations |

## 🔐 Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env

### Exemplo de Configuração

### Backend (apps/api/.env)
```env
SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_key
JWT_SECRET=your_secret
```

### Frontend (apps/next/.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📋 Scripts Disponíveis

```bash
pnpm dev          # Dev mode todos os apps
pnpm build        # Build de produção
pnpm test         # Rodar testes
pnpm lint         # Lint check
pnpm lint:fix     # Auto-fix lint
pnpm typecheck    # Type checking
pnpm db:migrate   # Aplicar migrations
pnpm db:generate  # Gerar tipos Supabase
```

## Documentação

- [Plano de Execução](./docs/implementation_plan.md)
- [Definition of Done](./docs/implementation_plan.md#definition-of-done)

## 🏗️ Importando Shared Types

```typescript
// Em qualquer app
import { LoginDto, loginSchema } from '@jurisnexo/shared';
import { isValidCpf, formatCurrency } from '@jurisnexo/shared';
import { env, appConfig } from '@jurisnexo/config';
import { createClient } from '@jurisnexo/db';
```
