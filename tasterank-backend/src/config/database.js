const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,           // Máximo de conexões simultâneas
      min: 0,           // Mínimo de conexões
      acquire: 30000,   // Tempo máximo para obter conexão (ms)
      idle: 10000       // Tempo máximo de conexão ociosa (ms)
    },
    define: {
      timestamps: true,        // Adiciona createdAt e updatedAt
      underscored: true,      // Usa snake_case para colunas
      freezeTableName: true   // Não pluraliza nomes de tabelas
    }
  }
);

// Testar conexão
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

testConnection();

module.exports = sequelize;
