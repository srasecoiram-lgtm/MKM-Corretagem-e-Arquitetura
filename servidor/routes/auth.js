const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createHash, randomBytes, randomUUID } = require("node:crypto");
const { rateLimit } = require("express-rate-limit");
const { invalid, text } = require("../validation");

const COOKIE = "mkm_refresh";
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const ISSUER = "mkm-admin";
const DUMMY_HASH = bcrypt.hashSync(randomBytes(32).toString("hex"), 12);
const hashToken = (value) => createHash("sha256").update(value).digest("hex");

function emailAddress(value) {
  const email = text(value, "E-mail", 150, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw invalid("E-mail inválido.");
  return email;
}

function password(value, creating = false) {
  if (typeof value !== "string" || !value) throw invalid("Senha obrigatória.");
  if (creating && (value.length < 12 || Buffer.byteLength(value) > 72)) {
    throw invalid("Use uma senha com pelo menos 12 caracteres e até 72 bytes.");
  }
  return value;
}

async function insertAdmin(db, body) {
  const nome = text(body.nome, "Nome", 100, true);
  const email = emailAddress(body.email);
  const hash = await bcrypt.hash(password(body.senha, true), 12);
  const [result] = await db.execute(
    "INSERT INTO administradores (nome, email, senha, role) VALUES (?, ?, ?, 'admin')",
    [nome, email, hash]
  );
  return result.insertId;
}

function createAuth({ db, jwtSecret, production, origin }) {
  const router = express.Router();
  const cookieOptions = { httpOnly: true, secure: production, sameSite: "strict", path: "/" };
  const jwtOptions = { algorithm: "HS256", issuer: ISSUER, audience: ISSUER };
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { erro: "Muitas tentativas. Aguarde 15 minutos." },
  });

  function noCache(_req, res, next) {
    res.set("Cache-Control", "no-store");
    next();
  }

  function createAccessToken(admin, session) {
    return jwt.sign({ sub: String(admin.id), sid: session }, jwtSecret, { ...jwtOptions, expiresIn: "15m" });
  }

  async function requireAdmin(req, res, next) {
    res.set("Cache-Control", "no-store");
    const match = /^Bearer ([^ ]+)$/i.exec(req.get("authorization") || "");
    if (!match) return res.status(401).json({ erro: "Autenticação necessária." });
    let claims;
    try {
      claims = jwt.verify(match[1], jwtSecret, { algorithms: ["HS256"], issuer: ISSUER, audience: ISSUER });
    } catch (error) {
      const code = error.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "TOKEN_INVALID";
      return res.status(401).json({ erro: "Sessão inválida ou expirada.", code });
    }

    try {
      const [rows] = await db.execute(
        "SELECT a.id, a.nome, a.email, a.role FROM admin_sessoes s JOIN administradores a ON a.id = s.admin_id " +
        "WHERE s.id = ? AND a.id = ? AND " + activeSession,
        [claims.sid, claims.sub]
      );
      if (!rows[0]) return res.status(401).json({ erro: "Sessão encerrada.", code: "TOKEN_INVALID" });
      req.user = rows[0];
      next();
    } catch (error) {
      next(error);
    }
  }

  const activeSession = "s.expira_em > CURRENT_TIMESTAMP AND a.ativo = 1 AND a.role = 'admin'";

  function fromFrontend(req, res, next) {
    if (req.get("origin") && req.get("origin") !== origin) {
      return res.status(403).json({ erro: "Origem não autorizada." });
    }
    next();
  }

  router.post("/login", noCache, fromFrontend, loginLimiter, async (req, res, next) => {
    try {
      const email = emailAddress(req.body?.email);
      const senha = password(req.body?.senha);
      if (Buffer.byteLength(senha) > 1024) throw invalid("Senha inválida.");
      const [rows] = await db.execute(
        "SELECT id, nome, email, senha, role FROM administradores WHERE email = ? AND ativo = 1 AND role = 'admin'",
        [email]
      );
      const admin = rows[0];
      const valid = await bcrypt.compare(senha, admin?.senha || DUMMY_HASH);
      if (!admin || !valid) return res.status(401).json({ erro: "E-mail ou senha inválidos." });

      const session = randomUUID();
      const refresh = randomBytes(32).toString("hex");
      await db.execute("DELETE FROM admin_sessoes WHERE expira_em <= CURRENT_TIMESTAMP");
      await db.execute("UPDATE administradores SET ultimo_login = NOW() WHERE id = ?", [admin.id]);
      await db.execute(
        "INSERT INTO admin_sessoes (id, admin_id, refresh_hash, expira_em) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))",
        [session, admin.id, hashToken(refresh)]
      );
      res.cookie(COOKIE, refresh, { ...cookieOptions, maxAge: SESSION_MS });
      const { id, nome, role } = admin;
      res.json({ success: true, token: createAccessToken(admin, session), id, nome, email: admin.email, role });
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/refresh", noCache, fromFrontend, async (req, res, next) => {
    const refresh = req.cookies[COOKIE];
    if (typeof refresh !== "string" || !/^[a-f0-9]{64}$/.test(refresh)) {
      return res.clearCookie(COOKIE, cookieOptions).status(401).json({ erro: "Sem sessão ativa." });
    }
    try {
      const [rows] = await db.execute(
        "SELECT s.id AS session, a.id, a.nome, a.email, a.role FROM admin_sessoes s " +
        "JOIN administradores a ON a.id = s.admin_id WHERE s.refresh_hash = ? AND " + activeSession,
        [hashToken(refresh)]
      );
      if (!rows[0]) return res.clearCookie(COOKIE, cookieOptions).status(401).json({ erro: "Sessão encerrada." });
      const { session, id, nome, email, role } = rows[0];
      res.json({ token: createAccessToken(rows[0], session), id, nome, email, role });
    } catch (error) {
      next(error);
    }
  });

  router.get("/auth/me", requireAdmin, (req, res) => res.json(req.user));
  router.post("/auth/logout", noCache, fromFrontend, async (req, res, next) => {
    try {
      const refresh = req.cookies[COOKIE];
      if (typeof refresh === "string" && /^[a-f0-9]{64}$/.test(refresh)) {
        await db.execute("DELETE FROM admin_sessoes WHERE refresh_hash = ?", [hashToken(refresh)]);
      }
      res.clearCookie(COOKIE, cookieOptions).json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  router.post("/admin/register", requireAdmin, async (req, res, next) => {
    try {
      const id = await insertAdmin(db, req.body || {});
      res.status(201).json({ success: true, id });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
      next(error);
    }
  });

  return { router, requireAdmin };
}

module.exports = { createAuth, insertAdmin };
