# JurisNexo SaaS - CRM Jurídico Multi-tenant

Sistema premium de gestão para escritórios de advocacia com integração WhatsApp, gestão de casos, financeiro e painel administrativo.

## 🏗️ Estrutura do Monorepo

```text
jurisnexo/
├── .idx/              # Configuração Google Project IDX
├── apps/
│   ├── web/           # Frontend Next.js 14
│   ├── api/           # Backend Principal .NET 8
│   └── worker/        # Background Jobs Node.js/BullMQ
├── packages/          # Componentes e Configurações Shared
├── infrastructure/    # Docker, Nginx e Scripts de Deploy
└── docs/              # Documentação Técnica
```

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix UI.
- **Backend**: .NET 8 (C#), Entity Framework Core, PostgreSQL (Supabase).
- **Worker**: Node.js, BullMQ, Redis.
- **DevOps**: Docker, Docker Compose, Hostinger VPS.

---

## 🚀 Guia de Início Rápido

### 1. Requisitos

- Node.js >= 20
- .NET 8 SDK
- pnpm >= 9

### 2. Executar em Desenvolvimento

```bash
# Frontend
pnpm dev --filter web

# Backend (.NET)
cd apps/api/JurisNexo.Api
dotnet run
```

Para guias detalhados, consulte a pasta [docs/](./docs/).
