const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuração do pool de conexões
const poolConfig = {
  max: 5,           // Máximo de conexões simultâneas
  min: 0,           // Mínimo de conexões mantidas
  acquire: 30000,   // Tempo máximo para adquirir conexão (30s)
  idle: 10000,      // Tempo que conexão fica idle antes de ser liberada
  evict: 1000       // Intervalo para verificar conexões idle
};

// Configuração de logging
const logging = process.env.NODE_ENV === 'development' 
  ? (msg) => console.log(`[Sequelize] ${msg}`)
  : false;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging,
    pool: poolConfig,
    dialectOptions: {
      // Para produção com SSL
      ...(process.env.NODE_ENV === 'production' && {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      })
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Função para testar conexão com retry
async function connectWithRetry(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexão com PostgreSQL estabelecida');
      return true;
    } catch (error) {
      console.error(`❌ Tentativa ${i + 1}/${retries} falhou:`, error.message);
      
      if (i < retries - 1) {
        console.log(`⏳ Aguardando ${delay / 1000}s antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('❌ Não foi possível conectar ao banco de dados após várias tentativas');
  process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Encerrando conexões com banco de dados...');
  await sequelize.close();
  console.log('✅ Conexões fechadas');
  process.exit(0);
});

module.exports = { sequelize, connectWithRetry };