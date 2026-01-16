# Guia de Implantação

## 🚀 Produção (Hostinger VPS)

A implantação em produção é automatizada via Docker Compose.

### Requisitos

- VPS com Docker e Docker Compose.
- Variáveis de ambiente configuradas no `.env`.

### Comandos de Deploy

```bash
cd infrastructure/scripts
./setup-hostinger.sh
./deploy.sh
```

### Estrutura de Infraestrutura

As configurações de Nginx e Docker estão localizadas em `infrastructure/`.
