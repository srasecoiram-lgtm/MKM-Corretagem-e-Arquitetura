// server/routes/posts.js
// Rotas CRUD para Blog e Arquitetura
// ──────────────────────────────────────────────────────────
// Como usar no server.js:
//   const postsRoutes = require("./routes/posts");
//   app.use("/posts", postsRoutes);
// ──────────────────────────────────────────────────────────

const express        = require("express");
const router         = express.Router();
const fs             = require("fs");
const multer         = require("multer");
const path           = require("path");
const jwt            = require("jsonwebtoken");
require("dotenv").config();

// ── Pool de conexão ──────────────────────────────────────
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || "127.0.0.1",
  port:               parseInt(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || "root",
  password:           process.env.DB_PASSWORD || "",
  database:           process.env.DB_NAME     || "MKM",
  charset:            "utf8mb4",
  waitForConnections: true,
  connectionLimit:    10,
});

// ── Upload de imagens ────────────────────────────────────
const ALLOWED_EXT  = /\.(jpg|jpeg|png|webp)$/i;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = "uploads/posts";
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext  = path.extname(file.originalname).toLowerCase();
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extOk  = ALLOWED_EXT.test(path.extname(file.originalname));
    const mimeOk = ALLOWED_MIME.includes(file.mimetype);
    if (extOk && mimeOk) cb(null, true);
    else cb(new Error("Apenas imagens JPG, PNG ou WebP."), false);
  },
});

// ── Middleware JWT ───────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers["authorization"];
  const token  = header && header.split(" ")[1];
  if (!token) return res.status(401).json({ erro: "Token não fornecido." });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "mkm_dev_secret");
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

// ── CRIAR TABELA (se não existir) ────────────────────────
async function criarTabela() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      secao         ENUM('blog','arquitetura') NOT NULL DEFAULT 'blog',
      titulo        VARCHAR(255) NOT NULL,
      resumo        TEXT,
      conteudo      LONGTEXT,
      categoria     VARCHAR(100),
      imagem_url    VARCHAR(500),
      tempo_leitura VARCHAR(20),
      destaque      TINYINT(1) DEFAULT 0,
      publicado     TINYINT(1) DEFAULT 1,
      criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}
criarTabela().catch(err => console.error("Erro ao criar tabela posts:", err.message));

// ════════════════════════════════════════════════════════
// ROTAS
// ════════════════════════════════════════════════════════

// GET /posts — lista posts publicados (público)
router.get("/", async (req, res) => {
  try {
    const { secao } = req.query;
    let sql    = "SELECT * FROM posts WHERE publicado = 1";
    const vals = [];
    if (secao) { sql += " AND secao = ?"; vals.push(secao); }
    sql += " ORDER BY destaque DESC, criado_em DESC";
    const [rows] = await pool.query(sql, vals);
    res.json(rows);
  } catch (err) {
    console.error("Erro GET /posts:", err.message);
    res.status(500).json({ erro: "Erro ao buscar posts." });
  }
});

// GET /posts/admin — lista TODOS incluindo rascunhos (admin)
router.get("/admin", auth, async (req, res) => {
  try {
    const { secao } = req.query;
    let sql    = "SELECT * FROM posts WHERE 1=1";
    const vals = [];
    if (secao) { sql += " AND secao = ?"; vals.push(secao); }
    sql += " ORDER BY criado_em DESC";
    const [rows] = await pool.query(sql, vals);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar posts." });
  }
});

// GET /posts/:id — detalhe de um post
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM posts WHERE id = ?",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ erro: "Post não encontrado." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro interno." });
  }
});

// POST /posts — criar post (admin)
router.post("/", auth, upload.single("imagem"), async (req, res) => {
  try {
    const d = req.body;
    if (!d.titulo || !d.titulo.trim()) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ erro: "Título obrigatório." });
    }

    const imagem_url = req.file
      ? `/uploads/posts/${req.file.filename}`
      : (d.imagem_url || null);

    const [result] = await pool.query(
      `INSERT INTO posts
        (secao, titulo, resumo, conteudo, categoria, imagem_url, tempo_leitura, destaque, publicado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.secao              || "blog",
        d.titulo.trim(),
        d.resumo             || null,
        d.conteudo           || null,
        d.categoria          || null,
        imagem_url,
        d.tempo_leitura      || null,
        d.destaque  === "true"  || d.destaque  === true  ? 1 : 0,
        d.publicado === "false" || d.publicado === false ? 0 : 1,
      ]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Erro POST /posts:", err.message);
    res.status(500).json({ erro: "Erro ao criar post." });
  }
});

// PUT /posts/:id — editar post (admin)
router.put("/:id", auth, upload.single("imagem"), async (req, res) => {
  try {
    const d = req.body;

    // Se enviou nova imagem, usa ela; senão mantém a URL existente
    const imagem_url = req.file
      ? `/uploads/posts/${req.file.filename}`
      : (d.imagem_url || null);

    await pool.query(
      `UPDATE posts SET
        secao=?, titulo=?, resumo=?, conteudo=?, categoria=?,
        imagem_url=?, tempo_leitura=?, destaque=?, publicado=?
       WHERE id=?`,
      [
        d.secao              || "blog",
        (d.titulo || "").trim(),
        d.resumo             || null,
        d.conteudo           || null,
        d.categoria          || null,
        imagem_url,
        d.tempo_leitura      || null,
        d.destaque  === "true"  || d.destaque  === true  ? 1 : 0,
        d.publicado === "false" || d.publicado === false ? 0 : 1,
        req.params.id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Erro PUT /posts:", err.message);
    res.status(500).json({ erro: "Erro ao atualizar post." });
  }
});

// DELETE /posts/:id — excluir post (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    // Remove imagem do disco se existir
    const [rows] = await pool.query(
      "SELECT imagem_url FROM posts WHERE id = ?",
      [req.params.id]
    );
    if (rows[0]?.imagem_url && rows[0].imagem_url.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "..", rows[0].imagem_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Erro DELETE /posts:", err.message);
    res.status(500).json({ erro: "Erro ao excluir post." });
  }
});

module.exports = router;