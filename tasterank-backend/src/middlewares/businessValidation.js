const { Restaurante } = require('../models');
const { ApiError } = require('./errorHandler');

exports.validateRestauranteUnique = async (req, res, next) => {
  const { nome, endereco } = req.body;
  const { id } = req.params;
  
  // Verificar se já existe restaurante com mesmo nome e endereço
  const where = {
    nome,
    endereco,
    ativo: true
  };
  
  // Se for update, excluir o próprio registro da busca
  if (id) {
    where.id = { [Op.ne]: id };
  }
  
  const existente = await Restaurante.findOne({ where });
  
  if (existente) {
    throw new ApiError(409, 
      'Já existe um restaurante com este nome neste endereço',
      { restauranteExistente: existente.id }
    );
  }
  
  next();
};

exports.validateAvaliacaoUnica = async (req, res, next) => {
  const { restauranteId } = req.params;
  const { autor } = req.body;
  
  const existente = await Avaliacao.findOne({
    where: {
      restaurante_id: restauranteId,
      autor: autor.trim()
    }
  });
  
  if (existente) {
    throw new ApiError(409,
      'Você já avaliou este restaurante',
      { avaliacaoExistente: existente.id }
    );
  }
  
  next();
};