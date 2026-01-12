// users.js
// Persistência simples em memória. Troque por banco real quando for para produção.
// Ex.: MongoDB (Mongoose) ou PostgreSQL (Prisma/pg).

const bcrypt = require("bcryptjs");

const users = new Map(); // chave=email, valor={ hashedPassword }

async function addUser(email, password) {
    if (users.has(email)) {
        const err = new Error("EMAIL_EXISTS");
        err.code = "EMAIL_EXISTS";
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.set(email, { hashedPassword });
}

module.exports = { addUser };
