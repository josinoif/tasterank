const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  underscored: true
});

module.exports = Restaurante;