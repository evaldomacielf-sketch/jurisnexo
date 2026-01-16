# 🚀 JurisNexo - Guia de Início Rápido

## ✅ Sistema Pronto para Usar

O sistema JurisNexo está totalmente funcional e pronto para entrar.

---

## 🔗 Acessar o Sistema

### URL:
```
http://localhost:3000
```

### Credenciais de Teste:
```
Email:    test@example.com
Senha:    password123
```

---

## 📡 Servidores em Execução

| Serviço | URL | Status |
|---------|-----|--------|
| **Frontend** | http://localhost:3000 | ✅ Next.js 15.5.9 |
| **API** | http://localhost:4001/api | ✅ Express.js |
| **Supabase** | https://rlurileokdetvtnobacb.supabase.co | ✅ Configurado |

---

## 🎯 O que Pode Fazer

### 1. Login
- Use as credenciais acima para fazer login
- Sistema irá redirecionar para o dashboard

### 2. Dashboard
- Visualizar visão geral do CRM
- Acessar diferentes módulos do sistema

### 3. Funcionalidades Disponíveis
- ✅ Gestão de Casos (Kanban Board)
- ✅ Gestão de Clientes
- ✅ CRM e Pipeline
- ✅ Financeiro
- ✅ Calendário
- ✅ WhatsApp Integration
- ✅ IA e Busca de Documentos
- ✅ Relatórios

---

## 📝 Comandos Úteis

### Parar os Servidores
```bash
pkill -f "next dev"
pkill -f "node server.js"
```

### Reiniciar os Servidores
```bash
# Terminal 1 - API
cd apps/simple-api
npm start

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

### Executar Testes
```bash
pnpm test
```

### Lint e Formatação
```bash
pnpm lint
pnpm format --write
```

---

## 🛠️ Estrutura do Projeto

```
jurisnexo/
├── apps/
│   ├── web/          ← Frontend (Next.js)
│   ├── simple-api/   ← API simples (Express)
│   ├── worker/       ← Background jobs
│   └── api/          ← Backend .NET (não rodando localmente)
├── packages/         ← Shared code
│   ├── @jurisnexo/config
│   ├── @jurisnexo/shared
│   ├── @jurisnexo/db
│   └── @jurisnexo/contracts
└── infrastructure/   ← Docker e deploy configs
```

---

## 🔐 Notas de Segurança

- ✅ Token de teste é apenas para desenvolvimento
- ⚠️ Nunca compartilhe credenciais reais
- ✅ Variáveis de ambiente estão configuradas em `.env`
- ⚠️ Mude as credenciais em produção

---

## 📞 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se ambos os servidores estão rodando
- Abra DevTools (F12) → Console para ver erro específico
- Verifique se a porta 4001 está disponível

### Erro: "Port already in use"
```bash
# Liberar porta
lsof -i :3000
kill -9 <PID>

# Ou
npx kill-port 3000
```

### Erro: "Module not found"
```bash
# Reinstalar dependências
pnpm install
```

---

## 📊 Status do Sistema

- ✅ Frontend compilando sem erros críticos
- ✅ API respondendo corretamente
- ✅ Autenticação funcionando
- ✅ Banco de dados configurado
- ✅ CORS habilitado
- ✅ Variáveis de ambiente carregadas

---

## 🚀 Próximas Etapas

1. Faça login com as credenciais fornecidas
2. Explore o dashboard
3. Teste as diferentes seções do sistema
4. Verifique os componentes e funcionalidades

---

**Data**: 16 de janeiro de 2026  
**Versão**: 1.0  
**Status**: ✅ PRONTO PARA USO
