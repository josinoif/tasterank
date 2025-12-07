const fs = require('fs');
const path = require('path');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Stream para arquivo de log
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' } // append
);

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Capturar informações da requisição
  const reqInfo = {
    timestamp,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  };
  
  // Interceptar res.json para capturar resposta
  const originalJson = res.json.bind(res);
  
  res.json = function(body) {
    const duration = Date.now() - start;
    
    // Log estruturado
    const logEntry = {
      ...reqInfo,
      status: res.statusCode,
      duration: `${duration}ms`,
      size: JSON.stringify(body).length
    };
    
    // Console log (desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
      console.log(
        `${color}[${reqInfo.method}]\x1b[0m ${reqInfo.url} - ` +
        `${res.statusCode} - ${duration}ms`
      );
    }
    
    // Arquivo log (produção)
    if (process.env.NODE_ENV === 'production') {
      accessLogStream.write(JSON.stringify(logEntry) + '\n');
    }
    
    return originalJson(body);
  };
  
  next();
};

// Log de erros
const errorLogger = (err, req, res, next) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  };
  
  const errorLogStream = fs.createWriteStream(
    path.join(logsDir, 'error.log'),
    { flags: 'a' }
  );
  
  errorLogStream.write(JSON.stringify(errorLog) + '\n');
  
  next(err);
};

module.exports = { requestLogger, errorLogger };