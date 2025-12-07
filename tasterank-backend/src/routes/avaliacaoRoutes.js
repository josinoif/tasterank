const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');
const {
  createValidation,
  updateValidation,
  idValidation,
  restauranteIdValidation,
  queryValidation
} = require('../validators/avaliacaoValidator');
const { validate } = require('../middlewares/validator');
const { asyncHandler } = require('../middlewares/errorHandler');

// Rotas aninhadas - avaliações de um restaurante específico
router.post('/:restauranteId/avaliacoes',
  createValidation,
  validate,
  asyncHandler(avaliacaoController.create)
);

router.get('/:restauranteId/avaliacoes',
  restauranteIdValidation,
  queryValidation,
  validate,
  asyncHandler(avaliacaoController.findByRestaurante)
);

module.exports = router;