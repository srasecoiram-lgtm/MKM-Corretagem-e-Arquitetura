require("./env").loadEnv();
const { createPool } = require("./db");
const { createSchema } = require("./schema");

async function setup() {
  const db = createPool();
  try {
    await createSchema(db);
    console.log("Tabelas do MKM verificadas.");
  } finally {
    await db.end();
  }
}

setup().catch((error) => {
  console.error("Falha ao preparar o banco:", error.code || error.message);
  process.exitCode = 1;
});
