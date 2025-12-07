import { toast } from 'react-toastify';

const notificacao = {
  sucesso: (mensagem) => {
    toast.success(mensagem, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
  
  erro: (mensagem) => {
    toast.error(mensagem, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
  
  aviso: (mensagem) => {
    toast.warn(mensagem, {
      position: 'top-right',
      autoClose: 4000,
    });
  },
  
  info: (mensagem) => {
    toast.info(mensagem, {
      position: 'top-right',
      autoClose: 3000,
    });
  },
  
  // Notificação de loading com promise
  comPromise: async (promise, mensagens) => {
    return toast.promise(
      promise,
      {
        pending: mensagens.pendente || 'Processando...',
        success: mensagens.sucesso || 'Operação realizada!',
        error: mensagens.erro || 'Erro na operação'
      }
    );
  }
};

export default notificacao;