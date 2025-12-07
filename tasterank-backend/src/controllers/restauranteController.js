const { Restaurante, Avaliacao } = require('../models');
const { ApiError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { retryDatabaseOperation } = require('../utils/retry');
const { cache } = require('../utils/cache');


/**
 * CREATE - Criar novo restaurante
 * POST /api/restaurantes
 */
exports.create = async (req, res) => {
  const { nome, categoria, endereco, telefone, descricao } = req.body;
  

  const restaurante = await retryDatabaseOperation(async () => Restaurante.create({
    nome,
    categoria,
    endereco,
    telefone,
    descricao
  }));

  
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

  const cacheKey = `restaurantes:${JSON.stringify(req.query)}`;
  
  // Verificar cache
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('✅ Retornando do cache');
    return res.json(cached);
  }

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

  result = {
    total: count,
    totalPaginas: Math.ceil(count / limit),
    paginaAtual: page,
    limite: limit,
    restaurantes: rows
  }
  
  // Armazenar no cache por 5 minutos
  cache.set(cacheKey, result, 300);
  console.log('✅ Armazenado no cache');

  res.json(result);
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


/**
 * Restaurantes mais bem avaliados
 * GET /api/restaurantes/top-rated
 */
exports.getTopRated = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const restaurantes = await Restaurante.findAll({
    where: { ativo: true },
    attributes: [
      'id',
      'nome',
      'categoria',
      [sequelize.fn('COUNT', sequelize.col('avaliacoes.id')), 'total_avaliacoes'],
      [sequelize.fn('AVG', sequelize.col('avaliacoes.nota')), 'media_notas']
    ],
    include: [{
      model: Avaliacao,
      as: 'avaliacoes',
      attributes: []
    }],
    group: ['restaurante.id'],
    having: sequelize.where(
      sequelize.fn('COUNT', sequelize.col('avaliacoes.id')),
      { [Op.gte]: 3 }  // Mínimo 3 avaliações
    ),
    order: [[sequelize.literal('media_notas'), 'DESC']],
    limit,
    subQuery: false
  });
  
  res.json({
    mensagem: `Top ${limit} restaurantes mais bem avaliados`,
    restaurantes
  });
};

/**
 * Restaurantes com mais avaliações
 * GET /api/restaurantes/mais-avaliados
 */
exports.getMostReviewed = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const restaurantes = await Restaurante.findAll({
    where: { ativo: true },
    attributes: [
      'id',
      'nome',
      'categoria',
      [sequelize.fn('COUNT', sequelize.col('avaliacoes.id')), 'total_avaliacoes']
    ],
    include: [{
      model: Avaliacao,
      as: 'avaliacoes',
      attributes: []
    }],
    group: ['restaurante.id'],
    order: [[sequelize.literal('total_avaliacoes'), 'DESC']],
    limit,
    subQuery: false
  });
  
  res.json({
    mensagem: `Top ${limit} restaurantes mais avaliados`,
    restaurantes
  });
};

/**
 * Restaurantes por categoria com estatísticas
 * GET /api/restaurantes/por-categoria
 */
exports.getByCategoria = async (req, res) => {
  const categorias = await Restaurante.findAll({
    where: { ativo: true },
    attributes: [
      'categoria',
      // total de restaurantes por categoria (DISTINCT evita contagem duplicada pelo JOIN)
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('restaurante.id'))), 'total_restaurantes'],
      // total de avaliações por categoria
      [sequelize.fn('COUNT', sequelize.col('avaliacoes.id')), 'total_avaliacoes'],
      // média de notas na categoria
      [sequelize.fn('AVG', sequelize.col('avaliacoes.nota')), 'media_categoria']
    ],
    include: [{
      model: Avaliacao,
      as: 'avaliacoes',
      attributes: []
    }],
    group: ['restaurante.categoria'],
    order: [[sequelize.literal('total_restaurantes'), 'DESC']],
    raw: true
  });
  
  res.json({
    mensagem: 'Estatísticas por categoria',
    categorias
  });
};

/**
 * Buscar restaurantes com detalhes completos
 * GET /api/restaurantes/:id/completo
 */
exports.findOneComplete = async (req, res) => {
  const { id } = req.params;
  
  const restaurante = await Restaurante.findByPk(id, {
    include: [{
      model: Avaliacao,
      as: 'avaliacoes',
      order: [['created_at', 'DESC']],
      limit: 10,
      separate: true
    }]
  });
  
  if (!restaurante) {
    throw new ApiError(404, 'Restaurante não encontrado');
  }
  
  // Calcular estatísticas manualmente
  const avaliacoes = await Avaliacao.findAll({
    where: { restaurante_id: id },
    attributes: ['nota']
  });
  
  const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  avaliacoes.forEach(a => distribuicao[a.nota]++);
  
  const stats = {
    total: avaliacoes.length,
    media: avaliacoes.length > 0 
      ? (avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length).toFixed(2)
      : 0,
    distribuicao
  };
  
  res.json({
    ...restaurante.toJSON(),
    estatisticas: stats
  });
};

exports.recalcularMedia = async (req, res) => {
  const { id } = req.params;
  
  const restaurante = await Restaurante.findByPk(id);
  
  if (!restaurante) {
    throw new ApiError(404, 'Restaurante não encontrado');
  }
  
  const mediaAtualizada = await restaurante.recalcularMedia();
  
  res.json({
    mensagem: 'Média recalculada com sucesso',
    restaurante: {
      id: restaurante.id,
      nome: restaurante.nome,
      avaliacaoMedia: mediaAtualizada
    }
  });
};

// Recalcular todas as médias (admin)
exports.recalcularTodasMedias = async (req, res) => {
  const restaurantes = await Restaurante.findAll({
    where: { ativo: true }
  });
  
  let contador = 0;
  for (const restaurante of restaurantes) {
    await restaurante.recalcularMedia();
    contador++;
  }
  
  res.json({
    mensagem: `${contador} médias recalculadas com sucesso`
  });
};


exports.getDashboardStats = async (req, res) => {
  // Total de restaurantes
  const totalRestaurantes = await Restaurante.count({
    where: { ativo: true }
  });
  
  // Total de avaliações
  const totalAvaliacoes = await Avaliacao.count();
  
  // Média geral de todas as avaliações
  const mediaGeral = await Avaliacao.findOne({
    attributes: [
      [sequelize.fn('AVG', sequelize.col('nota')), 'media']
    ],
    raw: true
  });
  
  // Distribuição de notas
  const distribuicaoNotas = await Avaliacao.findAll({
    attributes: [
      'nota',
      [sequelize.fn('COUNT', sequelize.col('id')), 'quantidade']
    ],
    group: ['nota'],
    order: [['nota', 'ASC']],
    raw: true
  });
  
  // Top 5 categorias
  const topCategorias = await Restaurante.findAll({
    where: { ativo: true },
    attributes: [
      'categoria',
      [sequelize.fn('COUNT', sequelize.col('restaurante.id')), 'quantidade'],
      [sequelize.fn('AVG', sequelize.col('avaliacao_media')), 'media']
    ],
    group: ['categoria'],
    order: [[sequelize.literal('quantidade'), 'DESC']],
    limit: 5,
    raw: true
  });
  
  // Avaliações por mês (últimos 6 meses)
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
  
  const avaliacoesPorMes = await Avaliacao.findAll({
    where: {
      created_at: { [Op.gte]: seisMesesAtras }
    },
    attributes: [
      [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'mes'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'quantidade']
    ],
    group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
    order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']],
    raw: true
  });
  
  res.json({
    resumo: {
      totalRestaurantes,
      totalAvaliacoes,
      mediaGeral: parseFloat(mediaGeral.media || 0).toFixed(2)
    },
    distribuicaoNotas,
    topCategorias,
    avaliacoesPorMes
  });
};