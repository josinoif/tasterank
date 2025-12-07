const { body, param, query } = require('express-validator');

exports.createValidation = [
  param('restauranteId')
    .isInt({ min: 1 }).withMessage('ID do restaurante inválido'),
  
  body('nota')
    .isInt({ min: 1, max: 5 }).withMessage('Nota deve ser entre 1 e 5'),
  
  body('comentario')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comentário deve ter no máximo 500 caracteres'),
  
  body('autor')
    .trim()
    .notEmpty().withMessage('Nome do autor é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres')
];

exports.updateValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  
  body('nota')
    .isInt({ min: 1, max: 5 }).withMessage('Nota deve ser entre 1 e 5'),
  
  body('comentario')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comentário muito longo')
];

exports.idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
];

exports.restauranteIdValidation = [
  param('restauranteId')
    .isInt({ min: 1 }).withMessage('ID do restaurante inválido')
];

exports.queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Página inválida'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limite inválido'),
  
  query('notaMin')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Nota mínima deve ser entre 1 e 5')
];