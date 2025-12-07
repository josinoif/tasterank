const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restauranteController');
const { 
  createValidation, 
  idValidation, 
  queryValidation 
} = require('../validators/restauranteValidator');
const { validate } = require('../middlewares/validator');
const { asyncHandler } = require('../middlewares/errorHandler');

// CREATE
router.post('/',
  createValidation,
  validate,
  asyncHandler(restauranteController.create)
);

// READ ALL
router.get('/',
  queryValidation,
  validate,
  asyncHandler(restauranteController.findAll)
);

// Estatísticas
router.get('/stats',
  asyncHandler(restauranteController.getStats)
);

// READ por categoria
router.get('/categoria/:categoria',
  asyncHandler(restauranteController.findByCategoria)
);

// READ ONE
router.get('/:id',
  idValidation,
  validate,
  asyncHandler(restauranteController.findOne)
);

module.exports = router;