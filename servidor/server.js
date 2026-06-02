// server.js — MKM Consultoria Imobiliária
require("dotenv").config();
const express    = require("express");
const mysql      = require("mysql2/promise");
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const cors       = require("cors");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");
const multer     = require("multer");
const path       = require("path");
const fs         = require("fs");
const cookieParser = require("cookie-parser");

const app = express();

// ── VALIDAÇÃO DE ENV ────────────────────────────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "minhasecret") {
  console.warn("⚠️  ATENÇÃO: JWT_SECRET fraco ou ausente no .env!");
  console.warn("   Gere um seguro com: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"");
}
const JWT_SECRET         = process.env.JWT_SECRET || "mkm_dev_secret_troque_em_producao";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + "_refresh";

// ── CORS ─────────────────────────────────────────────────────
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({
  origin:      FRONTEND,
  credentials: true,
  methods:     ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));

// ── MIDDLEWARES BASE ─────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));  // CSP pode quebrar o React em dev
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

// ── RATE LIMIT ───────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 min
  max: 10,
  message: { erro: "Muitas tentativas. Aguarde 15 minutos." },
  skipSuccessfulRequests: true,
});

// ── BANCO DE DADOS ───────────────────────────────────────────
const pool = mysql.createPool({
  host:             process.env.DB_HOST          || "127.0.0.1",
  port:             parseInt(process.env.DB_PORT) || 3306,
  user:             process.env.DB_USER          || "root",
  password:         process.env.DB_PASSWORD      || "",
  database:         process.env.DB_NAME          || "MKM",
  charset:          "utf8mb4",
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
});

pool.getConnection()
  .then(c => { console.log("✅ MySQL conectado"); c.release(); })
  .catch(e => console.error("❌ MySQL erro:", e.message));

// ── MULTER (upload de imagens) ───────────────────────────────
const ALLOWED_EXT  = /\.(jpg|jpeg|png|webp)$/i;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = "uploads/imoveis";
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
    else cb(new Error("Apenas imagens JPG, PNG ou WebP são permitidas."), false);
  },
});

// ── HELPERS JWT ──────────────────────────────────────────────
const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "Strict",
  maxAge:   30 * 24 * 60 * 60 * 1000,   // 30 dias
};

function gerarTokens(admin) {
  const payload = { id: admin.id, email: admin.email, role: "admin" };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  const refreshToken = jwt.sign({ id: admin.id }, JWT_REFRESH_SECRET, { expiresIn: "30d" });
  return { accessToken, refreshToken };
}

// ── MIDDLEWARE AUTH ──────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers["authorization"];
  const token  = header && header.split(" ")[1];
  if (!token) return res.status(401).json({ erro: "Token não fornecido." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    const code = err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "TOKEN_INVALID";
    return res.status(401).json({ erro: "Token inválido ou expirado.", code });
  }
}

// ═══════════════════════════════════════════════════════════════
// ROTAS DE SETUP (somente desenvolvimento — remova em produção)
// ═══════════════════════════════════════════════════════════════

// Cria tabelas se não existirem
app.get("/setup", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS administradores (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        nome       VARCHAR(100)  NOT NULL,
        email      VARCHAR(150)  UNIQUE NOT NULL,
        senha      VARCHAR(255)  NOT NULL,
        role       VARCHAR(20)   DEFAULT 'admin',
        ativo      TINYINT(1)    DEFAULT 1,
        criado_em  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        ultimo_login TIMESTAMP   NULL
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS imoveis (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        cep            VARCHAR(20),
        uf             VARCHAR(5),
        cidade         VARCHAR(100),
        bairro         VARCHAR(100),
        logradouro     VARCHAR(150),
        numero         VARCHAR(20),
        complemento    VARCHAR(100),
        tipo_imovel    VARCHAR(50),
        finalidade     VARCHAR(50),
        edificio       VARCHAR(100),
        responsavel    VARCHAR(100),
        captador       VARCHAR(100),
        tipo_contrato  VARCHAR(50),
        valor          DECIMAL(12,2),
        data_contrato  DATE,
        frente         DECIMAL(10,2),
        largura        DECIMAL(10,2),
        profundidade   DECIMAL(10,2),
        area_total     DECIMAL(10,2),
        quartos        TINYINT,
        banheiros      TINYINT,
        vagas          TINYINT,
        descricao      TEXT,
        link_maps      TEXT,
        imagem         VARCHAR(255),
        ativo          TINYINT(1) DEFAULT 1,
        criado_em      TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
        atualizado_em  TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    res.json({ success: true, message: "✅ Tabelas criadas/verificadas com sucesso!" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// AUTENTICAÇÃO
// ═══════════════════════════════════════════════════════════════

// POST /admin/register — cadastrar novo administrador
app.post("/admin/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha)
      return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios." });
    if (senha.length < 6)
      return res.status(400).json({ erro: "Senha deve ter pelo menos 6 caracteres." });

    const hash = await bcrypt.hash(senha, 12);
    const [result] = await pool.query(
      "INSERT INTO administradores (nome, email, senha) VALUES (?, ?, ?)",
      [nome.trim(), email.toLowerCase().trim(), hash]
    );
    res.status(201).json({ success: true, id: result.insertId, message: "Administrador criado!" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
    console.error(err);
    res.status(500).json({ erro: "Erro interno." });
  }
});

// POST /login — login do administrador
app.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha)
      return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });

    const [rows] = await pool.query(
      "SELECT * FROM administradores WHERE email = ? AND ativo = 1",
      [email.toLowerCase().trim()]
    );

    const admin = rows[0];
    // Mesmo erro para e-mail não encontrado ou senha errada (evita user enumeration)
    if (!admin || !(await bcrypt.compare(senha, admin.senha)))
      return res.status(401).json({ erro: "E-mail ou senha inválidos." });

    // Atualiza último login
    await pool.query("UPDATE administradores SET ultimo_login = NOW() WHERE id = ?", [admin.id]);

    const { accessToken, refreshToken } = gerarTokens(admin);

    // refreshToken em httpOnly cookie (seguro)
    res.cookie("mkm_refresh", refreshToken, COOKIE_OPTS);

    res.json({
      success: true,
      token:   accessToken,         // compatível com o código frontend atual
      id:      admin.id,
      nome:    admin.nome,
      email:   admin.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno." });
  }
});

// POST /auth/refresh — renova accessToken usando cookie
app.post("/auth/refresh", async (req, res) => {
  const refreshToken = req.cookies?.mkm_refresh;
  if (!refreshToken) return res.status(401).json({ erro: "Sem refresh token." });

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const [rows] = await pool.query(
      "SELECT id, nome, email, role FROM administradores WHERE id = ? AND ativo = 1",
      [decoded.id]
    );
    const admin = rows[0];
    if (!admin) { res.clearCookie("mkm_refresh"); return res.status(401).json({ erro: "Usuário não encontrado." }); }

    const { accessToken, refreshToken: newRefresh } = gerarTokens(admin);
    res.cookie("mkm_refresh", newRefresh, COOKIE_OPTS);  // rotation
    res.json({ token: accessToken, nome: admin.nome, email: admin.email });
  } catch {
    res.clearCookie("mkm_refresh");
    res.status(401).json({ erro: "Refresh token inválido." });
  }
});

// GET /auth/me — dados do usuário logado
app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nome, email, role FROM administradores WHERE id = ?",
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ erro: "Usuário não encontrado." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro interno." });
  }
});

// POST /auth/logout
app.post("/auth/logout", (req, res) => {
  res.clearCookie("mkm_refresh");
  res.json({ success: true, message: "Logout realizado." });
});

// ═══════════════════════════════════════════════════════════════
// IMÓVEIS
// ═══════════════════════════════════════════════════════════════

// GET /imoveis — listar (público)
app.get("/imoveis", async (req, res) => {
  try {
    const {
      tipo,
      finalidade,
      status,
      cidade,
      q,
      metragemMin,
      metragemMax,
      precoMin,
      precoMax,
    } = req.query;

    let sql    = "SELECT * FROM imoveis WHERE ativo = 1";
    const vals = [];

    if (tipo) {
      sql += " AND tipo_imovel = ?";
      vals.push(tipo);
    }
    if (finalidade) {
      sql += " AND finalidade = ?";
      vals.push(finalidade);
    }
    if (status) {
      sql += " AND tipo_contrato = ?";
      vals.push(status);
    }
    if (cidade) {
      sql += " AND cidade LIKE ?";
      vals.push(`%${cidade}%`);
    }
    if (q) {
      sql +=
        " AND (edificio LIKE ? OR bairro LIKE ? OR cidade LIKE ? OR tipo_imovel LIKE ? OR descricao LIKE ?)";
      const like = `%${q}%`;
      vals.push(like, like, like, like, like);
    }
    if (metragemMin) {
      sql += " AND area_total >= ?";
      vals.push(Number(metragemMin));
    }
    if (metragemMax) {
      sql += " AND area_total <= ?";
      vals.push(Number(metragemMax));
    }
    if (precoMin) {
      sql += " AND valor >= ?";
      vals.push(Number(precoMin));
    }
    if (precoMax) {
      sql += " AND valor <= ?";
      vals.push(Number(precoMax));
    }

    sql += " ORDER BY criado_em DESC";
    const [rows] = await pool.query(sql, vals);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar imóveis:", err);
    res.status(500).json({ erro: "Erro ao buscar imóveis." });
  }
});

// GET /imoveis/:id
app.get("/imoveis/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM imoveis WHERE id = ? AND ativo = 1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ erro: "Imóvel não encontrado." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro interno." });
  }
});

// POST /imoveis — cadastrar (protegido)
app.post("/imoveis", authMiddleware, upload.single("imagem"), async (req, res) => {
  try {
    const d = req.body;
    if (!d.cep || !d.uf || !d.cidade)
      return res.status(400).json({ erro: "CEP, UF e Cidade são obrigatórios." });

    const imagem = req.file ? `/uploads/imoveis/${req.file.filename}` : null;
    const [result] = await pool.query(
      `INSERT INTO imoveis
       (cep,uf,cidade,bairro,logradouro,numero,complemento,tipo_imovel,finalidade,
        edificio,responsavel,captador,tipo_contrato,valor,data_contrato,
        frente,largura,profundidade,area_total,quartos,banheiros,vagas,
        descricao,link_maps,imagem)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.cep,d.uf,d.cidade,d.bairro||null,d.logradouro||null,d.numero||null,
       d.complemento||null,d.tipo_imovel||null,d.finalidade||null,d.edificio||null,
       d.responsavel||null,d.captador||null,d.tipo_contrato||null,
       d.valor||null,d.data_contrato||null,d.frente||null,d.largura||null,
       d.profundidade||null,d.area_total||null,d.quartos||null,d.banheiros||null,
       d.vagas||null,d.descricao||null,d.link_maps||null,imagem]
    );
    res.status(201).json({ success: true, id: result.insertId, imagem });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error(err);
    res.status(500).json({ erro: "Erro ao cadastrar imóvel." });
  }
});

// POST /imoveis — cadastrar (protegido)
app.post(
  "/imoveis",
  authMiddleware,
  upload.single("imagem"),
  async (req, res) => {
    try {
      const d = req.body;
      if (!d.cep || !d.uf || !d.cidade)
        return res
          .status(400)
          .json({ erro: "CEP, UF e Cidade são obrigatórios." });

      const parseNumber = (value) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
      };

      const imagem = req.file ? `/uploads/imoveis/${req.file.filename}` : null;
      const tipoContrato = d.tipo_contrato
        ? String(d.tipo_contrato).trim()
        : null;

      const [result] = await pool.query(
        `INSERT INTO imoveis
        (cep,uf,cidade,bairro,logradouro,numero,complemento,tipo_imovel,finalidade,
         edificio,responsavel,captador,tipo_contrato,valor,data_contrato,
         frente,largura,profundidade,area_total,quartos,banheiros,vagas,
         descricao,link_maps,imagem)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          String(d.cep).trim(),
          String(d.uf).trim(),
          String(d.cidade).trim(),
          d.bairro ? String(d.bairro).trim() : null,
          d.logradouro ? String(d.logradouro).trim() : null,
          d.numero ? String(d.numero).trim() : null,
          d.complemento ? String(d.complemento).trim() : null,
          d.tipo_imovel ? String(d.tipo_imovel).trim() : null,
          d.finalidade ? String(d.finalidade).trim() : null,
          d.edificio ? String(d.edificio).trim() : null,
          d.responsavel ? String(d.responsavel).trim() : null,
          d.captador ? String(d.captador).trim() : null,
          tipoContrato,
          d.valor !== undefined && d.valor !== ""
            ? parseNumber(d.valor)
            : null,
          d.data_contrato || null,
          parseNumber(d.frente),
          parseNumber(d.largura),
          parseNumber(d.profundidade),
          parseNumber(d.area_total),
          d.quartos !== undefined && d.quartos !== ""
            ? parseInt(d.quartos, 10) || null
            : null,
          d.banheiros !== undefined && d.banheiros !== ""
            ? parseInt(d.banheiros, 10) || null
            : null,
          d.vagas !== undefined && d.vagas !== ""
            ? parseInt(d.vagas, 10) || null
            : null,
          d.descricao ? String(d.descricao).trim() : null,
          d.link_maps ? String(d.link_maps).trim() : null,
          imagem,
        ]
      );
      res.status(201).json({
        success: true,
        id: result.insertId,
        imagem,
      });
    } catch (err) {
      if (req.file) fs.unlinkSync(req.file.path);
      console.error("Erro ao cadastrar imóvel:", err);
      res
        .status(500)
        .json({ erro: "Erro ao cadastrar imóvel. Tente novamente." });
    }
  }
);

// PUT /imoveis/:id (protegido)
app.put("/imoveis/:id", authMiddleware, upload.single("imagem"), async (req, res) => {
  try {
    const d = req.body;
    const parseNumber = (value) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };

    const imagem = req.file
      ? `/uploads/imoveis/${req.file.filename}`
      : undefined;

    const tipoContrato = d.tipo_contrato
      ? String(d.tipo_contrato).trim()
      : undefined;

    let sql = `UPDATE imoveis SET
      cep=?,uf=?,cidade=?,bairro=?,logradouro=?,numero=?,complemento=?,
      tipo_imovel=?,finalidade=?,edificio=?,responsavel=?,captador=?,
      tipo_contrato=?,valor,data_contrato=?,frente=?,largura=?,
      profundidade=?,area_total=?,quartos=?,banheiros=?,vagas=?,
      descricao=?,link_maps=?`;

    const vals = [
      String(d.cep).trim(),
      String(d.uf).trim(),
      String(d.cidade).trim(),
      d.bairro ? String(d.bairro).trim() : null,
      d.logradouro ? String(d.logradouro).trim() : null,
      d.numero ? String(d.numero).trim() : null,
      d.complemento ? String(d.complemento).trim() : null,
      d.tipo_imovel ? String(d.tipo_imovel).trim() : null,
      d.finalidade ? String(d.finalidade).trim() : null,
      d.edificio ? String(d.edificio).trim() : null,
      d.responsavel ? String(d.responsavel).trim() : null,
      d.captador ? String(d.captador).trim() : null,
      tipoContrato,
      d.valor !== undefined && d.valor !== ""
        ? parseNumber(d.valor)
        : null,
      d.data_contrato || null,
      parseNumber(d.frente),
      parseNumber(d.largura),
      parseNumber(d.profundidade),
      parseNumber(d.area_total),
      d.quartos !== undefined && d.quartos !== ""
        ? parseInt(d.quartos, 10) || null
        : null,
      d.banheiros !== undefined && d.banheiros !== ""
        ? parseInt(d.banheiros, 10) || null
        : null,
      d.vagas !== undefined && d.vagas !== ""
        ? parseInt(d.vagas, 10) || null
        : null,
      d.descricao ? String(d.descricao).trim() : null,
      d.link_maps ? String(d.link_maps).trim() : null,
    ];

    if (imagem) {
      sql += ",imagem=?";
      vals.push(imagem);
    }

    sql += " WHERE id=?";
    vals.push(req.params.id);

    await pool.query(sql, vals);
    res.json({ success: true });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Erro ao atualizar imóvel:", err);
    res
      .status(500)
      .json({ erro: "Erro ao atualizar imóvel. Tente novamente." });
  }
});

// DELETE /imoveis/:id (protegido)
app.delete("/imoveis/:id", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT imagem FROM imoveis WHERE id = ?", [req.params.id]);
    if (rows[0]?.imagem) {
      const filePath = path.join(__dirname, rows[0].imagem);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await pool.query("DELETE FROM imoveis WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao excluir imóvel." });
  }
});

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ── ERRO DE UPLOAD ───────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE")
    return res.status(400).json({ erro: "Arquivo muito grande. Máx 5 MB." });
  if (err?.message?.includes("permitidas"))
    return res.status(400).json({ erro: err.message });
  next(err);
});

// ── START ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`\n🚀 MKM Server — porta ${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/health`);
  console.log(`   Setup:   http://localhost:${PORT}/setup`);
  console.log(`   Imóveis: http://localhost:${PORT}/imoveis\n`);
});