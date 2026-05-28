// server/middleware/security.js
// Configurações completas de segurança HTTP para MKM Consultoria

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// === CORS ===
const corsConfig = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // permite cookies (necessário para httpOnly refreshToken)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// === HELMET (Headers de Segurança) ===
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://via.placeholder.com'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

// === RATE LIMITING ===
// Geral: 100 requests por 15 min por IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas requisições deste IP. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

// Login: apenas 5 tentativas por 15 min (anti brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // não conta logins bem-sucedidos
  message: {
    error: 'Muitas tentativas de login. Aguarde 15 minutos.',
    code: 'LOGIN_RATE_LIMIT',
  },
});

// Upload: 10 uploads por hora
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    error: 'Limite de uploads atingido. Tente em 1 hora.',
    code: 'UPLOAD_RATE_LIMIT',
  },
});

module.exports = {
  corsConfig,
  helmetConfig,
  generalLimiter,
  loginLimiter,
  uploadLimiter,
};