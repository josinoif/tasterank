'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import avaliacaoService from '@/services/avaliacaoService';
import RatingStars from './RatingStars';
import './AvaliacaoCard.css';

export default function AvaliacaoCard({ avaliacao, restauranteId, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      return;
    }
    
    setDeleting(true);
    try {
      await avaliacaoService.delete(avaliacao.id);
      alert('Avaliação excluída com sucesso!');
      onDelete?.();
    } catch (err) {
      alert(err.error || 'Erro ao excluir avaliação');
    } finally {
      setDeleting(false);
    }
  };
  
  const dataFormatada = formatDistanceToNow(new Date(avaliacao.createdAt), {
    addSuffix: true,
    locale: ptBR
  });
  
  return (
    <div className="avaliacao-card">
      <div className="avaliacao-header">
        <div>
          <div className="rating-stars">
            <RatingStars rating={avaliacao.nota} size="small" />
            <span className="nota">{avaliacao.nota.toFixed(1)}</span>
          </div>
          <p className="data">{dataFormatada}</p>
        </div>
        
        <button 
          onClick={handleDelete}
          disabled={deleting}
          className="btn-delete"
          title="Excluir avaliação"
        >
          🗑️
        </button>
      </div>
      
      <div className="avaliacao-body">
        <p className="comentario">{avaliacao.comentario}</p>
      </div>
    </div>
  );
}