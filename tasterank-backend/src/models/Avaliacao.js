const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Avaliacao = sequelize.define('avaliacao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: 1,
        msg: 'Nota mínima é 1'
      },
      max: {
        args: 5,
        msg: 'Nota máxima é 5'
      },
      isInt: {
        msg: 'Nota deve ser um número inteiro'
      }
    }
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Comentário deve ter no máximo 500 caracteres'
      }
    }
  },
  autor: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome do autor não pode ser vazio'
      }
    }
  },
  restaurante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'restaurantes',
      key: 'id'
    }
  }
}, {
  tableName: 'avaliacoes',
  indexes: [
    {
      fields: ['restaurante_id'] // Índice para FK
    },
    {
      fields: ['nota'] // Índice para filtros por nota
    },
    {
      fields: ['created_at'] // Índice para ordenação por data
    },
    {
      fields: ['restaurante_id', 'nota'] // Índice composto
    }
  ],
  timestamps: true,
  underscored: true,
  hooks: {
    // Após criar avaliação, atualizar média do restaurante
    afterCreate: async (avaliacao, options) => {
      await atualizarMediaRestaurante(avaliacao.restaurante_id);
    },
    
    // Após atualizar nota, recalcular média
    afterUpdate: async (avaliacao, options) => {
      if (avaliacao.changed('nota')) {
        await atualizarMediaRestaurante(avaliacao.restaurante_id);
      }
    },
    
    // Após deletar, recalcular média
    afterDestroy: async (avaliacao, options) => {
      await atualizarMediaRestaurante(avaliacao.restaurante_id);
    }
  }
});

// Função auxiliar para atualizar média
async function atualizarMediaRestaurante(restauranteId) {
  const Restaurante = require('./Restaurante');
  
  // Buscar todas as avaliações do restaurante
  const avaliacoes = await Avaliacao.findAll({
    where: { restaurante_id: restauranteId },
    attributes: ['nota']
  });
  
  // Calcular média
  let media = 0;
  if (avaliacoes.length > 0) {
    const soma = avaliacoes.reduce((acc, av) => acc + av.nota, 0);
    media = soma / avaliacoes.length;
  }
  
  // Atualizar restaurante
  await Restaurante.update(
    { avaliacao_media: media.toFixed(2) },
    { where: { id: restauranteId } }
  );
  
  console.log(`✅ Média do restaurante ${restauranteId} atualizada: ${media.toFixed(2)}`);
}

module.exports = Avaliacao;