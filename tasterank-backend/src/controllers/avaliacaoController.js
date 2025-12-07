const { Avaliacao, Restaurante } = require('../models');
const { ApiError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

/**
 * CREATE - Criar avaliação para um restaurante
 * POST /api/restaurantes/:restauranteId/avaliacoes
 */
exports.create = async (req, res) => {
  const { restauranteId } = req.params;
  const { nota, comentario, autor } = req.body;
  
  // Verificar se restaurante existe
  const restaurante = await Restaurante.findByPk(restauranteId);
  if (!restaurante) {
    throw new ApiError(404, 'Restaurante não encontrado');
  }
  
  if (!restaurante.ativo) {
    throw new ApiError(400, 'Não é possível avaliar um restaurante inativo');
  }
  
  // Criar avaliação
  const avaliacao = await Avaliacao.create({
    restaurante_id: restauranteId,
    nota,
    comentario,
    autor
  });

  // Recalcular média
  await restaurante.recalcularMedia();
  
  res.status(201).json({
    mensagem: 'Avaliação criada com sucesso',
    avaliacao
  });
};

/**
 * READ ALL - Listar avaliações de um restaurante
 * GET /api/restaurantes/:restauranteId/avaliacoes
 */
exports.findByRestaurante = async (req, res) => {
  const { restauranteId } = req.params;
  
  // Verificar se restaurante existe
  const restaurante = await Restaurante.findByPk(restauranteId);
  if (!restaurante) {
    throw new ApiError(404, 'Restaurante não encontrado');
  }
  
  // Paginação
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  // Filtro por nota
  const where = { restaurante_id: restauranteId };
  if (req.query.notaMin) {
    where.nota = { [Op.gte]: parseInt(req.query.notaMin) };
  }
  
  const { count, rows } = await Avaliacao.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [{
      model: Restaurante,
      as: 'restaurante',
      attributes: ['id', 'nome']
    }]
  });
  
  res.json({
    restaurante: {
      id: restaurante.id,
      nome: restaurante.nome
    },
    total: count,
    totalPaginas: Math.ceil(count / limit),
    paginaAtual: page,
    avaliacoes: rows
  });
};

/**
 * READ ONE - Buscar avaliação específica
 * GET /api/avaliacoes/:id
 */
exports.findOne = async (req, res) => {
  const { id } = req.params;
  
  const avaliacao = await Avaliacao.findByPk(id, {
    include: [{
      model: Restaurante,
      as: 'restaurante',
      attributes: ['id', 'nome', 'categoria']
    }]
  });
  
  if (!avaliacao) {
    throw new ApiError(404, 'Avaliação não encontrada');
  }
  
  res.json(avaliacao);
};

/**
 * UPDATE - Atualizar avaliação
 * PUT /api/avaliacoes/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const { nota, comentario } = req.body;
  
  const avaliacao = await Avaliacao.findByPk(id);
  
  if (!avaliacao) {
    throw new ApiError(404, 'Avaliação não encontrada');
  }
  
  await avaliacao.update({ nota, comentario });
  
  res.json({
    mensagem: 'Avaliação atualizada com sucesso',
    avaliacao
  });
};

/**
 * DELETE - Deletar avaliação
 * DELETE /api/avaliacoes/:id
 */
exports.delete = async (req, res) => {
  const { id } = req.params;
  
  const avaliacao = await Avaliacao.findByPk(id);
  
  if (!avaliacao) {
    throw new ApiError(404, 'Avaliação não encontrada');
  }
  
  await avaliacao.destroy();
  
  res.json({
    mensagem: 'Avaliação deletada com sucesso'
  });
};

/**
 * Listar todas as avaliações (admin)
 * GET /api/avaliacoes
 */
exports.findAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Avaliacao.findAndCountAll({
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [{
      model: Restaurante,
      as: 'restaurante',
      attributes: ['id', 'nome', 'categoria']
    }]
  });
  
  res.json({
    total: count,
    totalPaginas: Math.ceil(count / limit),
    paginaAtual: page,
    avaliacoes: rows
  });
};