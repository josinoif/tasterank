import axios from 'axios';

// Criar instância do Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: process.env.NEXT_PUBLIC_API_TIMEOUT || 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de requisição (adicionar token, etc)
api.interceptors.request.use(
  (config) => {
    // Adicionar token se existir (usar typeof window para SSR-safe)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log da requisição em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta (tratar erros)
api.interceptors.response.use(
  (response) => {
    // Log da resposta em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    // Tratar erros comuns
    if (error.response) {
      // Servidor respondeu com erro
      const { status, data } = error.response;
      
      console.error(`❌ Erro ${status}:`, data);
      
      // Tratar códigos específicos
      switch (status) {
        case 401:
          // Não autorizado - redirecionar para login
          console.error('Não autorizado');
          if (typeof window !== 'undefined') {
            // window.location.href = '/login';
          }
          break;
        case 404:
          console.error('Recurso não encontrado');
          break;
        case 500:
          console.error('Erro interno do servidor');
          break;
      }
    } else if (error.request) {
      // Requisição foi feita mas sem resposta
      console.error('❌ Sem resposta do servidor:', error.request);
    } else {
      // Erro ao configurar requisição
      console.error('❌ Erro:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;