import axios from 'axios';
import { tratarErroAPI, formatarErro } from './errorHandler';
import notificacao from './notificacao';

// Criar instância do Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - adicionar token e logging
api.interceptors.request.use(
  (config) => {
    // Adicionar token se existir (SSR-safe)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log em desenvolvimento
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

// Response interceptor - tratar erros e notificar
api.interceptors.response.use(
  (response) => {
    // Log em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', error);
    
    // Mostrar notificação automática (exceto se silencioso)
    if (!error.config?.silencioso) {
      const mensagem = tratarErroAPI(error);
      notificacao.erro(mensagem);
    }
    
    // Retornar erro formatado
    return Promise.reject(formatarErro(error));
  }
);

export default api;