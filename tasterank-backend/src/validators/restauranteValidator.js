const { body, param, query } = require('express-validator');

exports.createValidation = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres'),
  
  body('categoria')
    .trim()
    .notEmpty().withMessage('Categoria é obrigatória')
    .isIn(['Italiana', 'Japonesa', 'Brasileira', 'Mexicana', 'Árabe', 'Hamburgueria', 'Pizzaria', 'Vegetariana', 'Outra'])
    .withMessage('Categoria inválida'),
  
  body('endereco')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Endereço muito longo'),
  
  body('telefone')
    .optional()
    .trim()
    .matches(/^[\d\s\(\)\-\+]+$/).withMessage('Telefone inválido'),
  
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Descrição muito longa')
];

exports.idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
];

exports.queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limite deve estar entre 1 e 100'),
  
  query('categoria')
    .optional()
    .trim()
    .isIn(['Italiana', 'Japonesa', 'Brasileira', 'Mexicana', 'Árabe', 'Hamburgueria', 'Pizzaria', 'Vegetariana', 'Outra'])
    .withMessage('Categoria inválida'),
  
  query('ordenar')
    .optional()
    .isIn(['nome', 'categoria', 'avaliacao_media', 'created_at'])
    .withMessage('Campo de ordenação inválido'),
  
  query('direcao')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Direção deve ser ASC ou DESC')
];