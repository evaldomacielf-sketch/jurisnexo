# Arquitetura JurisNexo

O JurisNexo utiliza uma arquitetura de monorepo para facilitar a gestão de múltiplos serviços e o compartilhamento de configurações.

## 🏗️ Visão Geral

```mermaid
graph TD
    User((Usuário))
    Web[Next.js App Router]
    API[.NET 8 Backend]
    Worker[Node.js Background Jobs]
    DB[(Supabase PostgreSQL)]
    Redis[(Redis Cache/Queues)]

    User --> Web
    Web --> API
    API --> DB
    API --> Redis
    Worker --> Redis
    Worker --> DB
```

## 📦 Componentes

- **apps/web**: Frontend Next.js 14 que serve a Landing Page, Dashboard e Auth.
- **apps/api**: Backend Principal em .NET 8 seguindo os princípios de Clean Architecture.
- **apps/worker**: Processamento em segundo plano (WhatsApp, Emails, Webhooks).
- **packages/**: Utilitários e configurações compartilhadas.
