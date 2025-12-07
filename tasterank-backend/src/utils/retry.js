async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = () => true
  } = options;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`❌ Tentativa ${attempt}/${maxAttempts} falhou:`, error.message);
      
      // Não fazer retry se não deve tentar novamente
      if (!shouldRetry(error)) {
        throw error;
      }
      
      // Última tentativa - lançar erro
      if (attempt === maxAttempts) {
        console.error(`❌ Todas as ${maxAttempts} tentativas falharam`);
        throw error;
      }
      
      // Aguardar antes de tentar novamente
      const waitTime = delay * Math.pow(backoff, attempt - 1);
      console.log(`⏳ Aguardando ${waitTime}ms antes de tentar novamente...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Função helper específica para operações de BD
async function retryDatabaseOperation(fn) {
  return retry(fn, {
    maxAttempts: 3,
    delay: 500,
    backoff: 2,
    shouldRetry: (error) => {
      // Retry apenas para erros temporários
      return error.name === 'SequelizeConnectionError' ||
             error.name === 'SequelizeTimeoutError' ||
             error.name === 'SequelizeConnectionRefusedError';
    }
  });
}

module.exports = { retry, retryDatabaseOperation };