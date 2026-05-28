// server/routes/auth.js
// Rotas de autenticação JWT para MKM Consultoria

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/security');
const db = require('../config/database');

const router = express.Router();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
  return { accessToken, refreshToken };
};

const COOKIE_OPTIONS = {
  httpOnly: true,          
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',     
  maxAge: 30 * 24 * 60 * 60 * 1000, 
};

// POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('senha').notEmpty().isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, senha } = req.body;

    try {
      const result = await db.query(
        'SELECT id, nome, email, senha_hash, role FROM corretores WHERE email = $1 AND ativo = true',
        [email]
      );

      const user = result.rows[0];

      // Mesmo erro para usuário não encontrado ou senha errada (evita user enumeration)
      if (!user || !(await bcrypt.compare(senha, user.senha_hash))) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      // Atualiza último login
      await db.query('UPDATE corretores SET ultimo_login = NOW() WHERE id = $1', [user.id]);

      const { accessToken, refreshToken } = generateTokens(user);

      // refreshToken em httpOnly cookie
      res.cookie('mkm_refresh', refreshToken, COOKIE_OPTIONS);

      res.json({
        accessToken,
        user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error('Erro no login:', err);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
);

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.mkm_refresh;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token não encontrado.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const result = await db.query(
      'SELECT id, nome, email, role FROM corretores WHERE id = $1 AND ativo = true',
      [decoded.userId]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Rotation: emite novo refreshToken
    res.cookie('mkm_refresh', newRefreshToken, COOKIE_OPTIONS);

    res.json({ accessToken });
  } catch (err) {
    res.clearCookie('mkm_refresh');
    return res.status(401).json({ error: 'Refresh token inválido ou expirado.' });
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req, res) => {
  res.clearCookie('mkm_refresh');
  res.json({ message: 'Logout realizado com sucesso.' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nome, email, role FROM corretores WHERE id = $1',
      [req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

module.exports = router;