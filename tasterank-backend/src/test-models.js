const { Restaurante, Avaliacao } = require('./models');

async function testarModelos() {
  try {
    // Criar restaurante
    const restaurante = await Restaurante.create({
      nome: 'Pizza Bella',
      categoria: 'Italiana',
      endereco: 'Rua das Flores, 123',
      telefone: '(11) 98765-4321',
      descricao: 'Melhor pizza da cidade!'
    });
    
    console.log('✅ Restaurante criado:', restaurante.toJSON());
    
    // Criar avaliação
    const avaliacao = await Avaliacao.create({
      restaurante_id: restaurante.id,
      nota: 5,
      comentario: 'Excelente! Recomendo muito!',
      autor: 'João Silva'
    });
    
    console.log('✅ Avaliação criada:', avaliacao.toJSON());
    
    // Buscar restaurante com avaliações
    const restauranteComAvaliacoes = await Restaurante.findByPk(restaurante.id, {
      include: [{
        model: Avaliacao,
        as: 'avaliacoes'
      }]
    });
    
    console.log('✅ Restaurante com avaliações:', 
      JSON.stringify(restauranteComAvaliacoes, null, 2)
    );
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testarModelos();