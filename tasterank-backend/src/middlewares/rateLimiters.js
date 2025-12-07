const rateLimit = require('express-rate-limit');

// Limiter geral
exports.generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições' }
});

// Limiter para autenticação
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Apenas 5 tentativas de login
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' }
});

// Limiter para criação
exports.createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Limite de criações excedido' }
});

// Limiter para buscas pesadas
exports.searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 20,
  message: { error: 'Muitas buscas em pouco tempo' }
});