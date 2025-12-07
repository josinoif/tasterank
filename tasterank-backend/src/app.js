const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const restauranteRoutes = require('./routes/restauranteRoutes');

require('dotenv').config();

const { errorHandler } = require('./middlewares/errorHandler');
const { requestLogger } = require('./middlewares/logger');

const app = express();

// Segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use('/api/', limiter);



// Parsing de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Rotas da API
app.use('/api/restaurantes', restauranteRoutes);
// app.use('/api/avaliacoes', avaliacaoRoutes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.path
  });
});

app.get('/api/test-error', (req, res) => {
  throw new Error('Erro de teste!');
});

// Error handler (deve ser o último middleware)
app.use(errorHandler);

module.exports = app;