// server/middleware/auth.js
// Middleware de autenticação JWT para a MKM Consultoria

const jwt = require('jsonwebtoken');

/**
 * Middleware principal de autenticação.
 * Adiciona req.user com os dados do token decodificado.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      error: 'Acesso não autorizado. Token não fornecido.',
      code: 'TOKEN_MISSING',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado. Faça login novamente.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(403).json({
      error: 'Token inválido.',
      code: 'TOKEN_INVALID',
    });
  }
};

/**
 * Middleware de autorização por role.
 * Use após authMiddleware.
 * Exemplo: router.delete('/imovel/:id', authMiddleware, requireRole('admin'), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Permissão negada. Você não tem acesso a este recurso.',
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };