const Restaurante = require('./Restaurante');
const Avaliacao = require('./Avaliacao');

// Relacionamento 1:N
// Um restaurante tem muitas avaliações
Restaurante.hasMany(Avaliacao, {
  foreignKey: 'restaurante_id',
  as: 'avaliacoes',
  onDelete: 'CASCADE'  // Se restaurante for deletado, deleta avaliações
});

// Cada avaliação pertence a um restaurante
Avaliacao.belongsTo(Restaurante, {
  foreignKey: 'restaurante_id',
  as: 'restaurante'
});

module.exports = {
  Restaurante,
  Avaliacao
};