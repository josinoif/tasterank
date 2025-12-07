import { useCallback } from 'react';
import notificacao from '@/services/notificacao';

function useNotificacao() {
  const notificarSucesso = useCallback((mensagem) => {
    notificacao.sucesso(mensagem);
  }, []);
  
  const notificarErro = useCallback((erro) => {
    const mensagem = typeof erro === 'string' ? erro : erro.error || 'Erro desconhecido';
    notificacao.erro(mensagem);
  }, []);
  
  const notificarAviso = useCallback((mensagem) => {
    notificacao.aviso(mensagem);
  }, []);
  
  const notificarInfo = useCallback((mensagem) => {
    notificacao.info(mensagem);
  }, []);
  
  return {
    sucesso: notificarSucesso,
    erro: notificarErro,
    aviso: notificarAviso,
    info: notificarInfo
  };
}

export default useNotificacao;