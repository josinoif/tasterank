/**
 * Trata erros de API e retorna mensagem amigável
 */
export function tratarErroAPI(error) {
  // Sem resposta do servidor (rede, timeout, etc)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'A requisição demorou muito. Tente novamente.';
    }
    if (error.message === 'Network Error') {
      return 'Erro de conexão. Verifique sua internet.';
    }
    return 'Erro ao conectar ao servidor';
  }
  
  const { status, data } = error.response;
  
  // Erros HTTP comuns
  switch (status) {
    case 400:
      return data?.error || 'Requisição inválida';
    case 401:
      return 'Não autorizado. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para esta ação';
    case 404:
      return data?.error || 'Recurso não encontrado';
    case 409:
      return data?.error || 'Conflito: registro já existe';
    case 422:
      return data?.error || 'Dados inválidos';
    case 429:
      return 'Muitas requisições. Aguarde um momento.';
    case 500:
      return 'Erro interno do servidor';
    case 503:
      return 'Servidor temporariamente indisponível';
    default:
      return data?.error || `Erro ${status}: ${error.message}`;
  }
}

/**
 * Formata erro para retorno padronizado
 */
export function formatarErro(error) {
  return {
    error: tratarErroAPI(error),
    status: error.response?.status,
    errors: error.response?.data?.errors || {}
  };
}