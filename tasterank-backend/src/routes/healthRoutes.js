const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
// Health check
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});



// Health check específico para banco de dados
router.get('/database', async (req, res) => {
  try {
    // Testar conexão
    await sequelize.authenticate();
    
    // Fazer query simples
    await sequelize.query('SELECT 1+1 AS result');
    
    // Verificar pool de conexões
    const pool = sequelize.connectionManager.pool;
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      poolInfo: {
        size: pool.size,
        available: pool.available,
        using: pool.using,
        waiting: pool.waiting
      }
    });
  } catch (error) {
    console.error('Health check falhou:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;