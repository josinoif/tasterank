const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Restaurante = sequelize.define('restaurante', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome não pode ser vazio'
      },
      len: {
        args: [3, 100],
        msg: 'Nome deve ter entre 3 e 100 caracteres'
      }
    }
  },
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Categoria não pode ser vazia'
      },
      isIn: {
        args: [['Italiana', 'Japonesa', 'Brasileira', 'Mexicana', 'Árabe', 'Hamburgueria', 'Pizzaria', 'Vegetariana', 'Outra']],
        msg: 'Categoria inválida'
      }
    }
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: {
        args: /^[\d\s\(\)\-\+]+$/i,
        msg: 'Telefone inválido'
      }
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  avaliacao_media: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  }
}, {
  tableName: 'restaurantes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['categoria'] // Busca por categoria
    },
    {
      fields: ['avaliacao_media'] // Ordenação por média
    },
    {
      fields: ['nome'] // Busca por nome
    },
    {
      fields: ['ativo'] // Filtro de ativos
    }
  ]
});

// Método de instância para recalcular média
Restaurante.prototype.recalcularMedia = async function() {
  const Avaliacao = require('./Avaliacao');
  
  const result = await Avaliacao.findOne({
    where: { restaurante_id: this.id },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('nota')), 'media'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'total']
    ],
    raw: true
  });
  
  const media = result.media ? parseFloat(result.media).toFixed(2) : 0;
  
  await this.update({ avaliacao_media: media });
  
  return media;
};

// Método estático para recalcular múltiplos
Restaurante.recalcularMedias = async function(restauranteIds) {
  for (const id of restauranteIds) {
    const restaurante = await Restaurante.findByPk(id);
    if (restaurante) {
      await restaurante.recalcularMedia();
    }
  }
};

module.exports = Restaurante;