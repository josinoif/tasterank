const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { errorHandler, sequelizeErrorHandler } = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { generalLimiter } = require('./middlewares/rateLimiters');

const restauranteRoutes = require('./routes/restauranteRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const avaliacaoStandaloneRoutes = require('./routes/avaliacaoStandaloneRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Segurança
app.use(helmet());

// CORS
const getAllowedOrigins = () => {
  const origins = process.env.CORS_ORIGINS || 'http://localhost:5173';
  return origins.split(',').map(origin => origin.trim());
};

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
app.use('/api/', generalLimiter);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(requestLogger);




// Rotas
app.use('/api/restaurantes', avaliacaoRoutes); // Rotas aninhadas
app.use('/api/restaurantes', restauranteRoutes);
app.use('/api/avaliacoes', avaliacaoStandaloneRoutes); // Rotas standalone
app.use('/api/health', healthRoutes);


// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Error handlers
app.use(errorLogger);
app.use(sequelizeErrorHandler);
app.use(errorHandler);



module.exports = app;
