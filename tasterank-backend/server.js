const app = require('./src/app');
const sequelize = require('./src/config/database');
const { Restaurante, Avaliacao } = require('./src/models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Sincronizar modelos com banco de dados
    // force: true -> DROP e CREATE (cuidado em produção!)
    // alter: true -> ALTER TABLE (ajusta colunas)
    await sequelize.sync({ 
      force: process.env.NODE_ENV === 'development' 
    });
    
    console.log('✅ Modelos sincronizados com banco de dados');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();