const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');
const {
  updateValidation,
  idValidation,
  queryValidation
} = require('../validators/avaliacaoValidator');
const { validate } = require('../middlewares/validator');
const { asyncHandler } = require('../middlewares/errorHandler');

// Rotas standalone para avaliações
router.get('/',
  queryValidation,
  validate,
  asyncHandler(avaliacaoController.findAll)
);

router.get('/:id',
  idValidation,
  validate,
  asyncHandler(avaliacaoController.findOne)
);

router.put('/:id',
  updateValidation,
  validate,
  asyncHandler(avaliacaoController.update)
);

router.delete('/:id',
  idValidation,
  validate,
  asyncHandler(avaliacaoController.delete)
);

module.exports = router;