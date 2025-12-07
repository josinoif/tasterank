const app = require('./src/app');
const { sequelize, connectWithRetry } = require('./src/config/database');
const { Restaurante, Avaliacao } = require('./src/models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Conectar ao banco com retry
    await connectWithRetry();
    
    // Sincronizar modelos
    const syncOptions = {
      force: process.env.DB_FORCE_SYNC === 'true',
      alter: process.env.DB_ALTER_SYNC === 'true'
    };
    
    await sequelize.sync(syncOptions);
    console.log('✅ Modelos sincronizados');
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log('🚀 Servidor TasteRank iniciado!');
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n⚠️  SIGTERM recebido, encerrando servidor...');
      server.close(async () => {
        await sequelize.close();
        console.log('✅ Servidor encerrado');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();