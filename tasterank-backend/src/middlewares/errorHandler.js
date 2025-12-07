/**
 * Classe de erro customizada para erros de API
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Distingue erros operacionais de bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware de tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';
  
  // Log do erro
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Erro:', {
      message: err.message,
      stack: err.stack,
      statusCode
    });
  } else {
    console.error('❌ Erro:', message);
  }
  
  // Erros do Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Erro de validação';
    const errors = err.errors.map(e => ({
      campo: e.path,
      mensagem: e.message
    }));
    
    return res.status(statusCode).json({
      error: message,
      detalhes: errors
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Registro duplicado';
    
    return res.status(statusCode).json({
      error: message,
      detalhes: err.errors.map(e => e.message)
    });
  }
  
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Violação de chave estrangeira';
    
    return res.status(statusCode).json({
      error: message
    });
  }
  
  // Resposta padrão
  res.status(statusCode).json({
    error: message,
    ...(err.details && { detalhes: err.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Wrapper para funções assíncronas
 * Evita try-catch repetitivo
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { ApiError, errorHandler, asyncHandler };