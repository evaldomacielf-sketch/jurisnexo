// server.js
const express = require("express");
const cors = require("cors");
const { addUser, verifyUser } = require("./users");

const app = express();
// Using 4001 to avoid conflict with main app (3000) and API (4000)
const PORT = process.env.PORT || 4001;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());


function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

const createMockToken = (payloadOverride = {}) => {
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
        sub: "user-123",
        email: "test@example.com",
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24h
        ...payloadOverride
    };

    const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = "mock-signature";

    return `${b64Header}.${b64Payload}.${signature}`;
};


app.post("/api/signup", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !isValidEmail(email)) {
            return res
                .status(400)
                .json({ error: "E-mail obrigatório e deve ter formato válido" });
        }

        if (!password || String(password).length < 8) {
            return res
                .status(400)
                .json({ error: "Senha obrigatória e deve ter pelo menos 8 caracteres" });
        }

        await addUser(String(email).trim().toLowerCase(), String(password));

        // Não retornar senha (nem hash)
        return res.status(201).json({ message: "Conta criada com sucesso" });
    } catch (err) {
        if (err && (err.code === "EMAIL_EXISTS" || err.message === "EMAIL_EXISTS")) {
            return res.status(409).json({ error: "E-mail já existe" });
        }

        console.error(err);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: "Email e senha são obrigatórios" });
        }

        const isValid = await verifyUser(String(email).trim().toLowerCase(), String(password));
        
        if (!isValid) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        // Criar tokens mock
        const accessToken = createMockToken({ email: email });
        const refreshToken = createMockToken({ email: email, type: "refresh" });

        return res.status(200).json({
            accessToken,
            refreshToken,
            user: {
                email: email,
                name: email.split('@')[0]
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

app.post("/api/auth/request-code", (req, res) => {
    const { email } = req.body || {};
    if (!email) {
        return res.status(400).json({ error: "Email required" });
    }
    console.log(`Code requested for ${email}`);
    // Mock success
    return res.status(200).json({ message: "Code sent" });
});

app.post("/api/auth/verify", (req, res) => {
    const { email, code } = req.body || {};
    if (!email || !code) {
        return res.status(400).json({ error: "Email and code required" });
    }
    // Mock verify
    // Return a token that decodes to NO tenant_id initially (forcing selection)
    const mockToken = createMockToken({});
    return res.status(200).json({ token: mockToken });
});

app.post("/api/auth/register", (req, res) => {
    const { name, email, password, tenantName, tenantSlug } = req.body || {};
    
    if (!email || !password || !name) {
        return res.status(400).json({ error: "Name, email and password required" });
    }

    // Create new tenant for this user
    const newTenant = {
        id: `tenant-${Date.now()}`,
        name: tenantName || name + "'s Tenant",
        slug: tenantSlug || name.toLowerCase().replace(/\s+/g, '-')
    };
    
    // Create token bound to new tenant
    const token = createMockToken({ tenant_id: newTenant.id });
    
    userTenants.push(newTenant);
    
    return res.status(201).json({
        success: true,
        token,
        user: {
            id: `user-${Date.now()}`,
            email,
            name
        },
        tenant: newTenant
    });
});

app.get("/api/tenants/me/plan", (req, res) => {
    // Mock plan data
    return res.status(200).json({
        plan: "Pro",
        status: "ACTIVE",
        daysLeft: 14,
        maxUsers: 5,
        features: {
            crm: true,
            calendar: true
        }
    });
});

// In-memory storage for tenants
const userTenants = [];

app.get("/api/tenants/me", (req, res) => {
    return res.status(200).json(userTenants);
});

app.post("/api/tenants/me/active-tenant", (req, res) => {
    const { tenantId } = req.body;
    console.log(`Setting active tenant to ${tenantId}`);

    // Issue a NEW token bound to this tenant
    const token = createMockToken({ tenant_id: tenantId });

    return res.status(200).json({ success: true, token });
});

app.get("/api/tenants/current", (req, res) => {
    // Retornar tenant padrão
    return res.status(200).json({
        id: "tenant-default",
        name: "Meu Escritório",
        slug: "meu-escritorio",
        status: "active"
    });
});

app.post("/api/tenants", (req, res) => {
    const { name } = req.body;
    const newTenant = {
        id: `mock-tenant-${Date.now()}`,
        name: name || "Novo Escritório",
        slug: (name || "novo").toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    };
    userTenants.push(newTenant);

    return res.status(201).json(newTenant);
});

app.get("/api/gamification/leaderboard", (req, res) => {
    // Mock leaderboard
    return res.status(200).json([
        {
            id: "u1",
            full_name: "Fernanda Almeida",
            avatar_url: "",
            points: 1250,
            level: 12
        },
        {
            id: "u2",
            full_name: "Carlos Eduardo",
            avatar_url: "",
            points: 980,
            level: 9
        },
        {
            id: "u3",
            full_name: "Mariana Silva",
            avatar_url: "",
            points: 850,
            level: 8
        }
    ]);
});


app.get("/api/crm/kanban", (req, res) => {
    // Mock Kanban Board Data
    return res.status(200).json({
        columns: [
            {
                id: "leads",
                title: "Leads",
                color: "blue",
                cards: [
                    {
                        id: "c1",
                        title: "João Pereira",
                        tag: "Danos Morais",
                        tagColor: "blue",
                        description: "Consulta solicitada sobre acidente de trânsito em via urbana.",
                        time: "2h atrás",
                        priority: "normal",
                        avatar: ""
                    },
                    {
                        id: "c2",
                        title: "Emília Costa",
                        tag: "Família",
                        tagColor: "orange",
                        description: "Dúvidas sobre mediação de divórcio consensual.",
                        time: "",
                        priority: "urgent",
                        avatar: "EC"
                    },
                    {
                        id: "c3",
                        title: "Novo Lead Teste",
                        tag: "Trabalhista",
                        tagColor: "green",
                        description: "Cálculo de rescisão.",
                        time: "5m atrás",
                        priority: "normal",
                        avatar: "NT"
                    },
                    {
                        id: "c4",
                        title: "Empresa X",
                        tag: "Contratos",
                        tagColor: "purple",
                        description: "Análise de contrato social.",
                        time: "1d atrás",
                        priority: "normal",
                        avatar: "EX"
                    }
                ]
            },
            {
                id: "triagem",
                title: "Triagem",
                color: "purple",
                cards: [
                    {
                        id: "c5",
                        title: "Sara Santos",
                        tag: "Imobiliário",
                        tagColor: "green",
                        description: "Revisão de contrato de compra e venda.",
                        time: "Amanhã",
                        priority: "normal",
                        avatar: "SS"
                    },
                    {
                        id: "c6",
                        title: "Pedro Alvares",
                        tag: "Criminal",
                        tagColor: "red",
                        description: "Defesa prévia.",
                        time: "Hoje",
                        priority: "high",
                        avatar: "PA"
                    }
                ]
            },
            {
                id: "contrato",
                title: "Contrato",
                color: "indigo",
                cards: [
                    {
                        id: "c7",
                        title: "Tecno S.A.",
                        tag: "Corporativo",
                        tagColor: "purple",
                        description: "Minuta de acordo de acionistas em revisão.",
                        time: "Revisão",
                        priority: "review",
                        avatar: "TS"
                    },
                    {
                        id: "c8",
                        title: "Startup Y",
                        tag: "Consultoria",
                        tagColor: "blue",
                        description: "Memorando de entendimento.",
                        time: "Revisão",
                        priority: "review",
                        avatar: "SY"
                    },
                    {
                        id: "c9",
                        title: "Jose Maria",
                        tag: "Civil",
                        tagColor: "orange",
                        description: "Ação de cobrança.",
                        time: "Assinatura",
                        priority: "normal",
                        avatar: "JM"
                    }
                ]
            },
            {
                id: "ativo",
                title: "Ativo",
                color: "green",
                cards: [
                    {
                        id: "c10",
                        title: "Miguel Soares",
                        tag: "Contencioso",
                        tagColor: "red",
                        description: "Preparação para audiência de instrução.",
                        time: "Atualizado",
                        priority: "updated",
                        avatar: "MS"
                    },
                    {
                        id: "c11",
                        title: "Ana Maria",
                        tag: "Previdenciário",
                        tagColor: "blue",
                        description: "Aguardando perícia.",
                        time: "Em andamento",
                        priority: "normal",
                        avatar: "AM"
                    },
                    {
                        id: "c12",
                        title: "Construtora Z",
                        tag: "Trabalhista",
                        tagColor: "orange",
                        description: "Defesa em reclamação.",
                        time: "Prazo: 15/10",
                        priority: "urgent",
                        avatar: "CZ"
                    },
                    {
                        id: "c13",
                        title: "Condomínio A",
                        tag: "Cível",
                        tagColor: "green",
                        description: "Cobrança de inadimplentes.",
                        time: "Regular",
                        priority: "normal",
                        avatar: "CA"
                    },
                    {
                        id: "c14",
                        title: "Roberto Carlos",
                        tag: "Família",
                        tagColor: "blue",
                        description: "Execução de alimentos.",
                        time: "Suspenso",
                        priority: "low",
                        avatar: "RC"
                    },
                    {
                        id: "c15",
                        title: "Maria Clara",
                        tag: "Criminal",
                        tagColor: "red",
                        description: "Acompanhamento de inquérito.",
                        time: "Ativo",
                        priority: "normal",
                        avatar: "MC"
                    },
                    {
                        id: "c16",
                        title: "Loja B",
                        tag: "Consumidor",
                        tagColor: "purple",
                        description: "Defesa administrativa Procon.",
                        time: "Prazo: 20/10",
                        priority: "normal",
                        avatar: "LB"
                    },
                    {
                        id: "c17",
                        title: "Transportadora C",
                        tag: "Tributário",
                        tagColor: "orange",
                        description: "Recurso administrativo.",
                        time: "Aguardando",
                        priority: "normal",
                        avatar: "TC"
                    }
                ]
            }
        ]
    });
});

// ================== FINANCE ENDPOINTS ==================
app.get("/api/finance/categories", (req, res) => {
    return res.status(200).json([
        { id: "cat-1", name: "Receita de Honorários", type: "income" },
        { id: "cat-2", name: "Receita de Custas", type: "income" },
        { id: "cat-3", name: "Despesa Operacional", type: "expense" },
    ]);
});

app.get("/api/finance/bank-accounts", (req, res) => {
    return res.status(200).json([
        { id: "acc-1", name: "Banco do Brasil", balance: 15000 },
        { id: "acc-2", name: "Caixa", balance: 2500 },
    ]);
});

app.get("/api/finance/transactions", (req, res) => {
    return res.status(200).json({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
    });
});

app.get("/api/finance/dashboard", (req, res) => {
    return res.status(200).json({
        totalReceivable: 45000,
        totalPayable: 12000,
        cashBalance: 17500,
        thisMonthReceived: 8000,
    });
});

// ================== AGENDA/CALENDAR ENDPOINTS ==================
app.get("/api/schedule/events", (req, res) => {
    return res.status(200).json([]);
});

app.post("/api/schedule/events", (req, res) => {
    return res.status(201).json({ id: "evt-1", success: true });
});

// ================== WHATSAPP ENDPOINTS ==================
app.get("/api/whatsapp/conversations", (req, res) => {
    return res.status(200).json([
        {
            id: "conv-1",
            contact: { name: "João Silva", phone: "11999999999" },
            lastMessage: "Olá, tudo bem?",
            unread: 2,
            updatedAt: new Date().toISOString(),
        },
    ]);
});

app.get("/api/whatsapp/messages/:conversationId", (req, res) => {
    return res.status(200).json([]);
});

app.post("/api/whatsapp/messages", (req, res) => {
    return res.status(201).json({ id: "msg-1", success: true });
});

// ================== REPORTS ENDPOINTS ==================
app.get("/api/reports/list", (req, res) => {
    return res.status(200).json([
        { id: "rep-1", name: "Relatório Mensal", type: "monthly" },
        { id: "rep-2", name: "Relatório de Casos", type: "cases" },
    ]);
});

app.get("/api/reports/:reportId", (req, res) => {
    return res.status(200).json({
        id: req.params.reportId,
        name: "Relatório",
        data: [],
    });
});

// ================== SETTINGS ENDPOINTS ==================
app.get("/api/settings", (req, res) => {
    return res.status(200).json({
        company_name: "Meu Escritório",
        theme: "light",
        language: "pt-BR",
    });
});

app.post("/api/settings", (req, res) => {
    return res.status(200).json({ success: true });
});

// ================== GENERIC ENDPOINTS ==================
app.get("/api/crm/kanban", (req, res) => {
    return res.status(200).json({
        columns: [
            {
                id: "col-1",
                title: "A Fazer",
                cards: [],
            },
        ],
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${PORT}`);
    console.log(`📝 Teste com: test@example.com / password123`);
});

