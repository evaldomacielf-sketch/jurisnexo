# JurisNexo SaaS - CRM Jurídico Multi-tenant

Sistema premium de gestão para escritórios de advocacia com integração WhatsApp, gestão de casos, financeiro e painel administrativo.

## 🛠️ Stack Tecnológico

### Frontend

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + Shadcn/ui
- **Autenticação**: Supabase Auth

### Backend Principal

- **Framework**: [.NET 8 (C#)](https://dotnet.microsoft.com/en-us/apps/aspnet)
- **ORM**: Entity Framework Core
- **Database**: PostgreSQL (Via Supabase)
- **Documentação**: OpenAPI/Swagger

### Worker/Jobs

- **Runtime**: Node.js
- **Queue**: BullMQ
- **Cache/Storage**: Redis

### Infraestrutura & DevOps

- **Hospedagem**: Hostinger (VPS)
- **Containerização**: Docker + Docker Compose
- **Monitoramento**: Serilog + Sentry + CloudWatch (opcional)

---

## 🚀 Como Executar Localmente

### 1. Requisitos

- Node.js >= 20.0.0
- .NET 8 SDK
- pnpm >= 9.0.0

### 2. Instalação

```bash
pnpm install
```

### 3. Execução (Turbo)

```bash
# Frontend
pnpm dev:next

# Backend (.NET)
cd JurisNexo.Backend/src/JurisNexo.API
dotnet run --urls "http://localhost:4000"
```

## 🏗️ Estrutura do Projeto

```text
jurisnexo/
├── apps/
│   ├── next/          # Frontend Principal (Next.js)
│   ├── api/           # Microservice Auxiliar (NestJS)
│   └── worker/        # Background Jobs (Node.js/BullMQ)
├── JurisNexo.Backend/ # Backend Principal (.NET 8)
├── packages/          # Pacotes Compartilhados
└── deploy/            # Scripts de Implantação e Docker
```

## 📋 Documentação Adicional

- [Guia de Deploy (VPS/Docker)](./DEPLOY.md)
- [Walkthrough de Melhorias](./docs/walkthrough.md)
