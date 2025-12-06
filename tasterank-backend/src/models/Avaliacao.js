const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  timestamps: true,
  underscored: true
});

module.exports = Avaliacao;