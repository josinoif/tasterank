const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TasteRank API está funcionando!' 
  });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint não encontrado' 
  });
});

// Tratamento de erros gerais
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor' 
  });
});

module.exports = app;