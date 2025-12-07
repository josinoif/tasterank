import api from './api';

const avaliacaoService = {
  // Listar avaliações de um restaurante
  getByRestaurante: async (restauranteId, params = {}) => {
    try {
      const response = await api.get(
        `/restaurantes/${restauranteId}/avaliacoes`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Criar avaliação
  create: async (restauranteId, data) => {
    try {
      const response = await api.post(
        `/restaurantes/${restauranteId}/avaliacoes`,
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Atualizar avaliação
  update: async (id, data) => {
    try {
      const response = await api.put(`/avaliacoes/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Deletar avaliação
  delete: async (id) => {
    try {
      const response = await api.delete(`/avaliacoes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default avaliacaoService;