import api from './api';

const restauranteService = {
  // Listar todos os restaurantes
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/restaurantes', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Buscar restaurante por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/restaurantes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Criar novo restaurante
  create: async (data) => {
    try {
      const response = await api.post('/restaurantes', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Atualizar restaurante
  update: async (id, data) => {
    try {
      const response = await api.put(`/restaurantes/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Deletar restaurante
  delete: async (id) => {
    try {
      const response = await api.delete(`/restaurantes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Buscar top rated
  getTopRated: async (limit = 10) => {
    try {
      const response = await api.get('/restaurantes/top-rated', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Buscar por categoria
  getByCategoria: async (categoria) => {
    try {
      const response = await api.get(`/restaurantes/categoria/${categoria}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default restauranteService;