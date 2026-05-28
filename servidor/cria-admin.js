// criar-admin.js
// Cria um administrador diretamente no banco MySQL.
//
// Como usar:
//   1. Coloque este arquivo na mesma pasta do server.js
//   2. node criar-admin.js
// ──────────────────────────────────────────────────

require("dotenv").config();
const mysql  = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function main() {
  console.log("\n══════════════════════════════════════");
  console.log("   MKM — Criar Administrador");
  console.log("══════════════════════════════════════\n");

  // ── DADOS DO ADMIN ──────────────────────────────
  // Edite aqui antes de rodar:
  const NOME  = "Seu Nome Aqui";
  const EMAIL = "seu@email.com";
  const SENHA = "suaSenha123";   // mínimo 6 caracteres
  // ────────────────────────────────────────────────

  if (SENHA.length < 6) {
    console.error("❌ Senha precisa ter pelo menos 6 caracteres.");
    process.exit(1);
  }

  let conn;
  try {
    conn = await mysql.createConnection({
      host:     process.env.DB_HOST     || "127.0.0.1",
      port:     parseInt(process.env.DB_PORT) || 3306,
      user:     process.env.DB_USER     || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME     || "MKM",
      charset:  "utf8mb4",
    });

    console.log("✅ Conectado ao banco MySQL\n");

    // Cria a tabela se não existir
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS administradores (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        nome         VARCHAR(100)  NOT NULL,
        email        VARCHAR(150)  UNIQUE NOT NULL,
        senha        VARCHAR(255)  NOT NULL,
        role         VARCHAR(20)   DEFAULT 'admin',
        ativo        TINYINT(1)    DEFAULT 1,
        criado_em    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        ultimo_login TIMESTAMP     NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Gera o hash da senha
    console.log("🔐 Gerando hash da senha...");
    const hash = await bcrypt.hash(SENHA, 12);

    // Insere o admin
    const [result] = await conn.execute(
      "INSERT INTO administradores (nome, email, senha) VALUES (?, ?, ?)",
      [NOME.trim(), EMAIL.toLowerCase().trim(), hash]
    );

    console.log("══════════════════════════════════════");
    console.log("✅ Administrador criado com sucesso!");
    console.log(`   ID:    ${result.insertId}`);
    console.log(`   Nome:  ${NOME.trim()}`);
    console.log(`   Email: ${EMAIL.toLowerCase().trim()}`);
    console.log("══════════════════════════════════════");
    console.log("\n🌐 Acesse: http://localhost:3000/login\n");

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      console.error("❌ Este e-mail já está cadastrado no banco.");
    } else {
      console.error("❌ Erro ao criar admin:", err.message);
      console.error("   Código:", err.code);
    }
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

main();