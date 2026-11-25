const path = require("node:path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const { createPool } = require("./db");
const { loadEnv, projectRoot } = require("./env");
const { createAuth } = require("./routes/auth");
const { createPropertyRouter } = require("./routes/imoveis");
const { createPostRouter } = require("./routes/post");

function createApp({ db, jwtSecret, frontendUrl = "http://localhost:3000", production = false,
  uploadsDir = path.join(projectRoot, "uploads"), trustProxy = false }) {
  if (typeof jwtSecret !== "string" || Buffer.byteLength(jwtSecret) < 32) {
    throw new Error("Configure JWT_SECRET com uma chave aleatória de pelo menos 32 bytes.");
  }

  const origin = new URL(frontendUrl);
  if (!["http:", "https:"].includes(origin.protocol) || (production && origin.protocol !== "https:")) {
    throw new Error("Configure FRONTEND_URL com a URL do site (HTTPS em produção).");
  }

  const app = express();
  app.disable("x-powered-by");
  app.set("query parser", "simple");
  app.set("trust proxy", trustProxy);
  app.use(cors({ origin: origin.origin, credentials: true }));
  app.use(helmet());
  app.use(cookieParser());
  app.use(express.json({ limit: "256kb" }));
  app.use(express.urlencoded({ extended: false, limit: "256kb" }));
  app.use("/uploads", express.static(uploadsDir, {
    setHeaders(response) {
      response.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }));

  const { router, requireAdmin } = createAuth({ db, jwtSecret, production, origin: origin.origin });
  app.get("/health", async (_req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      await db.query("SELECT 1");
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    } catch {
      res.status(503).json({ status: "indisponível" });
    }
  });
  app.use(router);
  app.use("/imoveis", createPropertyRouter({ db, requireAdmin, uploadsDir }));
  app.use("/posts", createPostRouter({ db, requireAdmin, uploadsDir }));
  app.use((_req, res) => res.status(404).json({ erro: "Rota não encontrada." }));
  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE" ? "A imagem deve ter até 5 MB." : "Envio de imagem inválido.";
      return res.status(400).json({ erro: message });
    }
    if ([400, 413, 415].includes(error.status)) {
      return res.status(error.status).json({ erro: error.expose ? error.message : "Requisição inválida." });
    }
    console.error("MKM:", error.code || error.name);
    return res.status(500).json({ erro: "Erro interno. Tente novamente." });
  });
  return app;
}

async function start() {
  loadEnv();
  const db = createPool();
  try {
    const app = createApp({
      db,
      jwtSecret: process.env.JWT_SECRET,
      frontendUrl: process.env.FRONTEND_URL,
      production: process.env.NODE_ENV === "production",
      uploadsDir: process.env.UPLOADS_DIR ? path.resolve(projectRoot, process.env.UPLOADS_DIR) : undefined,
      trustProxy: process.env.TRUST_PROXY_HOPS ? Number(process.env.TRUST_PROXY_HOPS) : false,
    });
    const port = Number(process.env.PORT || 3002);
    const host = process.env.HOST || "127.0.0.1";
    const [tables] = await db.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() " +
      "AND TABLE_NAME IN ('administradores', 'admin_sessoes', 'imoveis', 'posts')"
    );
    if (tables.length !== 4) throw new Error("Execute npm run db:setup antes de iniciar a API.");
    const server = app.listen(port, host, () => console.log("API MKM em " + host + ":" + port));
    server.on("error", async (error) => {
      console.error("Falha ao abrir a porta da API:", error.code || error.message);
      await db.end();
      process.exitCode = 1;
    });
    return server;
  } catch (error) {
    await db.end();
    throw error;
  }
}

function run() {
  start().catch((error) => {
    console.error("Não foi possível iniciar a API MKM:", error.code || error.message);
    process.exitCode = 1;
  });
}

if (require.main === module) run();

module.exports = { createApp, run };
