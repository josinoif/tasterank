const { Restaurante, Avaliacao } = require('../models');
const { ApiError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

/**
 * CREATE - Criar novo restaurante
 * POST /api/restaurantes
 */
exports.create = async (req, res) => {
  const { nome, categoria, endereco, telefone, descricao } = req.body;
  
  const restaurante = await Restaurante.create({
    nome,
    categoria,
    endereco,
    telefone,
    descricao
  });
  
  res.status(201).json({
    mensagem: 'Restaurante criado com sucesso',
    restaurante
  });
};

/**
 * READ ALL - Listar todos os restaurantes
 * GET /api/restaurantes
 * Query params: page, limit, categoria, busca
 */
exports.findAll = async (req, res) => {
  // Paginação
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  // Filtros
  const where = { ativo: true };
  
  // Filtro por categoria
  if (req.query.categoria) {
    where.categoria = req.query.categoria;
  }
  
  // Busca por nome
  if (req.query.busca) {
    where.nome = {
      [Op.iLike]: `%${req.query.busca}%` // iLike = case-insensitive
    };
  }
  
  // Ordenação
  const order = [];
  if (req.query.ordenar) {
    const campo = req.query.ordenar;
    const direcao = req.query.direcao || 'ASC';
    order.push([campo, direcao]);
  } else {
    order.push(['avaliacao_media', 'DESC']);
  }
  
  const { count, rows } = await Restaurante.findAndCountAll({
    where,
    limit,
    offset,
    order,
    attributes: { 
      exclude: ['ativo'] // Não retornar campo ativo
    }
  });
  
  res.json({
    total: count,
    totalPaginas: Math.ceil(count / limit),
    paginaAtual: page,
    limite: limit,
    restaurantes: rows
  });
};

/**
 * READ ONE - Buscar restaurante por ID
 * GET /api/restaurantes/:id
 */
exports.findOne = async (req, res) => {
  const { id } = req.params;
  
  const restaurante = await Restaurante.findByPk(id, {
    include: [{
      model: Avaliacao,
      as: 'avaliacoes',
      attributes: ['id', 'nota', 'comentario', 'autor', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10  // Últimas 10 avaliações
    }]
  });
  
  if (!restaurante) {
    throw new ApiError(404, 'Restaurante não encontrado');
  }
  
  res.json(restaurante);
};

/**
 * Buscar por categoria
 * GET /api/restaurantes/categoria/:categoria
 */
exports.findByCategoria = async (req, res) => {
  const { categoria } = req.params;
  
  const restaurantes = await Restaurante.findAll({
    where: { 
      categoria,
      ativo: true 
    },
    order: [['avaliacao_media', 'DESC']]
  });
  
  res.json({
    categoria,
    total: restaurantes.length,
    restaurantes
  });
};

/**
 * Estatísticas gerais
 * GET /api/restaurantes/stats
 */
exports.getStats = async (req, res) => {
  const total = await Restaurante.count({ where: { ativo: true } });
  
  const porCategoria = await Restaurante.findAll({
    where: { ativo: true },
    attributes: [
      'categoria',
      [sequelize.fn('COUNT', sequelize.col('id')), 'total']
    ],
    group: ['categoria'],
    raw: true
  });
  
  res.json({
    totalRestaurantes: total,
    porCategoria
  });
};


/**
 * UPDATE - Atualizar restaurante completo
 * PUT /api/restaurantes/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const { nome, categoria, endereco, telefone, descricao } = req.body;
  
  // Buscar restaurante
  const restaurante = await Restaurante.findByPk(id);
  
  if (!restaurante) {
    throw new ApiError(404, 'Restaurante não encontrado');
  }
  
  // Atualizar todos os campos
  await restaurante.update({
    nome,
    categoria,
    endereco,
    telefone,
    descricao
  });
  
  res.json({
    mensagem: 'Restaurante atualizado com sucesso',
    restaurante
  });
};

/**
 * PATCH - Atualização parcial
 * PATCH /api/restaurantes/:id
 */
exports.partialUpdate = async (req, res) => {
  const { id } = req.params;
  const camposPermitidos = ['nome', 'categoria', 'endereco', 'telefone', 'descricao'];
  
  // Buscar restaurante
  const restaurante = await Restaurante.findByPk(id);
  
  if (!restaurante) {
    throw new ApiError(404, 'Restaurante não encontrado');
  }
  
  // Filtrar apenas campos permitidos e presentes no body
  const updates = {};
  camposPermitidos.forEach(campo => {
    if (req.body[campo] !== undefined) {
      updates[campo] = req.body[campo];
    }
  });
  
  // Verificar se há algo para atualizar
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'Nenhum campo válido para atualizar');
  }
  
  // Atualizar
  await restaurante.update(updates);
  
  res.json({
    mensagem: 'Restaurante atualizado parcialmente',
    camposAtualizados: Object.keys(updates),
    restaurante
  });
};

/**
 * DELETE - Soft delete (marca como inativo)
 * DELETE /api/restaurantes/:id
 */
exports.softDelete = async (req, res) => {
  const { id } = req.params;
  
  const restaurante = await Restaurante.findByPk(id);
  
  if (!restaurante) {
    throw new ApiError(404, 'Restaurante não encontrado');
  }
  
  if (!restaurante.ativo) {
    throw new ApiError(400, 'Restaurante já está inativo');
  }
  
  // Marcar como inativo ao invés de deletar
  await restaurante.update({ ativo: false });
  
  res.json({
    mensagem: 'Restaurante desativado com sucesso'
  });
};

/**
 * DELETE - Hard delete (remove permanentemente)
 * DELETE /api/restaurantes/:id/permanente
 */
exports.hardDelete = async (req, res) => {
  const { id } = req.params;
  
  const restaurante = await Restaurante.findByPk(id);
  
  if (!restaurante) {
    throw new ApiError(404, 'Restaurante não encontrado');
  }
  
  // Verificar se há avaliações associadas
  const avaliacoesCount = await Avaliacao.count({
    where: { restaurante_id: id }
  });
  
  if (avaliacoesCount > 0) {
    throw new ApiError(400, 
      `Não é possível deletar. Existem ${avaliacoesCount} avaliações associadas. ` +
      'Delete as avaliações primeiro ou use soft delete.'
    );
  }
  
  // Deletar permanentemente
  await restaurante.destroy();
  
  res.json({
    mensagem: 'Restaurante deletado permanentemente'
  });
};

/**
 * RESTORE - Reativar restaurante inativo
 * POST /api/restaurantes/:id/restaurar
 */
exports.restore = async (req, res) => {
  const { id } = req.params;
  
  const restaurante = await Restaurante.findByPk(id);
  
  if (!restaurante) {
    throw new ApiError(404, 'Restaurante não encontrado');
  }
  
  if (restaurante.ativo) {
    throw new ApiError(400, 'Restaurante já está ativo');
  }
  
  await restaurante.update({ ativo: true });
  
  res.json({
    mensagem: 'Restaurante restaurado com sucesso',
    restaurante
  });
};