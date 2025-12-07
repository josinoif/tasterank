const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restauranteController');

const {
  createValidation,
  updateValidation,
  partialUpdateValidation,
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

// Estatísticas e agregados (colocar ANTES das rotas com :id)
router.get('/stats',
  asyncHandler(restauranteController.getStats)
);

router.get('/top-rated',
  asyncHandler(restauranteController.getTopRated)
);

router.get('/mais-avaliados',
  asyncHandler(restauranteController.getMostReviewed)
);

router.get('/por-categoria',
  asyncHandler(restauranteController.getByCategoria)
);

// READ por categoria específica
router.get('/categoria/:categoria',
  asyncHandler(restauranteController.findByCategoria)
);

// READ ONE
router.get('/:id',
  idValidation,
  validate,
  asyncHandler(restauranteController.findOne)
);

// UPDATE (completo)
router.put('/:id',
  updateValidation,
  validate,
  asyncHandler(restauranteController.update)
);

// PATCH (parcial)
router.patch('/:id',
  partialUpdateValidation,
  validate,
  asyncHandler(restauranteController.partialUpdate)
);

// SOFT DELETE
router.delete('/:id',
  idValidation,
  validate,
  asyncHandler(restauranteController.softDelete)
);

// HARD DELETE
router.delete('/:id/permanente',
  idValidation,
  validate,
  asyncHandler(restauranteController.hardDelete)
);

// RESTORE
router.post('/:id/restaurar',
  idValidation,
  validate,
  asyncHandler(restauranteController.restore)
);

// Detalhes completos
router.get('/:id/completo',
  idValidation,
  validate,
  asyncHandler(restauranteController.findOneComplete)
);

module.exports = router;

