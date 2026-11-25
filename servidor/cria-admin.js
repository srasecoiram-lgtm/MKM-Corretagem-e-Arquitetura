require("./env").loadEnv();
const { createPool } = require("./db");
const { insertAdmin } = require("./routes/auth");

async function createAdmin() {
  const db = createPool();
  try {
    const id = await insertAdmin(db, {
      nome: process.env.MKM_ADMIN_NOME,
      email: process.env.MKM_ADMIN_EMAIL,
      senha: process.env.MKM_ADMIN_SENHA,
    });
    console.log("Administrador criado. ID:", id);
  } finally {
    await db.end();
  }
}

createAdmin().catch((error) => {
  console.error("Falha ao criar administrador:", error.code || error.message);
  process.exitCode = 1;
});
