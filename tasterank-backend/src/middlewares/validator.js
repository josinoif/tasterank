const { validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');

/**
 * Middleware para processar resultados de validação
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      campo: err.path,
      mensagem: err.msg,
      valorRecebido: err.value
    }));
    
    throw new ApiError(400, 'Erro de validação', formattedErrors);
  }
  
  next();
};

module.exports = { validate };