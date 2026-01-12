// server.js
const express = require("express");
const cors = require("cors");
const { addUser } = require("./users");

const app = express();
// Using 4001 to avoid conflict with main app (3000) and API (4000)
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

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

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
