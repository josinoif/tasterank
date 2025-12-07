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


const sequelizeErrorHandler = (err, req, res, next) => {
  console.error('❌ Erro do Sequelize:', err.name);
  
  // Erro de validação
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      campo: e.path,
      mensagem: e.message,
      tipo: e.type,
      valorInvalido: e.value
    }));
    
    return res.status(400).json({
      error: 'Erro de validação',
      detalhes: errors
    });
  }
  
  // Violação de unicidade
  if (err.name === 'SequelizeUniqueConstraintError') {
    const camposDuplicados = err.errors.map(e => e.path);
    
    return res.status(409).json({
      error: 'Registro duplicado',
      mensagem: `Já existe um registro com ${camposDuplicados.join(', ')}`,
      campos: camposDuplicados
    });
  }
  
  // Violação de chave estrangeira
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    let mensagem = 'Violação de integridade referencial';
    
    // Detectar tipo de violação
    if (err.parent.code === '23503') { // PostgreSQL FK violation
      if (err.original.message.includes('insert') || err.original.message.includes('update')) {
        mensagem = 'O registro relacionado não existe';
      } else if (err.original.message.includes('delete')) {
        mensagem = 'Não é possível deletar pois existem registros relacionados';
      }
    }
    
    return res.status(400).json({
      error: 'Erro de integridade referencial',
      mensagem,
      detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // Erro de conexão
  if (err.name === 'SequelizeConnectionError' || 
      err.name === 'SequelizeConnectionRefusedError') {
    console.error('❌ Erro de conexão com banco de dados');
    
    return res.status(503).json({
      error: 'Serviço temporariamente indisponível',
      mensagem: 'Não foi possível conectar ao banco de dados. Tente novamente em instantes.'
    });
  }
  
  // Timeout
  if (err.name === 'SequelizeTimeoutError') {
    return res.status(408).json({
      error: 'Timeout',
      mensagem: 'A operação demorou muito tempo. Tente novamente.'
    });
  }
  
  // Erro de sintaxe SQL
  if (err.name === 'SequelizeDatabaseError') {
    console.error('SQL Error:', err.parent?.message);
    
    return res.status(500).json({
      error: 'Erro no banco de dados',
      mensagem: process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'Erro ao processar a operação'
    });
  }
  
  // Erro não tratado do Sequelize
  if (err.name && err.name.startsWith('Sequelize')) {
    return res.status(500).json({
      error: 'Erro no banco de dados',
      tipo: err.name,
      mensagem: process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'Erro interno do servidor'
    });
  }
  
  // Passar para o próximo handler se não for erro do Sequelize
  next(err);
};

module.exports = { ApiError, errorHandler, asyncHandler, sequelizeErrorHandler };