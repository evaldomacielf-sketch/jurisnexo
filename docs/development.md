# Guia de Desenvolvimento

## 🛠️ Ambiente Local

O JurisNexo é otimizado para o **Google Project IDX**, mas pode ser executado localmente.

### Iniciando o Frontend

```bash
pnpm dev --filter web
```

### Iniciando o Backend (.NET)

```bash
cd apps/api/JurisNexo.Api
dotnet run
```

### Iniciando o Worker

```bash
pnpm dev --filter worker
```

## 🧪 Testes

- **Web**: `pnpm test --filter web`
- **API**: `dotnet test apps/api/JurisNexo.Tests`
