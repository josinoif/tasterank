const fs = require('fs');
const path = require('path');

const dbErrorLogStream = fs.createWriteStream(
  path.join(__dirname, '../../logs/db-errors.log'),
  { flags: 'a' }
);

function logDatabaseError(error, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    errorName: error.name,
    errorMessage: error.message,
    sql: error.sql,
    parameters: error.parameters,
    context,
    stack: error.stack
  };
  
  dbErrorLogStream.write(JSON.stringify(logEntry) + '\n');
  
  // Em desenvolvimento, também logar no console
  if (process.env.NODE_ENV === 'development') {
    console.error('🗄️ Erro de BD:', logEntry);
  }
}

module.exports = { logDatabaseError };