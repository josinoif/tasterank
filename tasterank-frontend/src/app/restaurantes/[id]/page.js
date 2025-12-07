'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import restauranteService from '@/services/restauranteService';
import avaliacaoService from '@/services/avaliacaoService';
import AvaliacaoCard from '@/components/AvaliacaoCard';
import RatingStars from '@/components/RatingStars';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import './restaurante-detail.css';

export default function RestauranteDetail({ params }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [restaurante, setRestaurante] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
  
  useEffect(() => {
    buscarDetalhes();
    buscarAvaliacoes();
  }, [id]);
  
  const buscarDetalhes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await restauranteService.getById(id);
      setRestaurante(data);
    } catch (err) {
      setError(err.error || 'Erro ao carregar restaurante');
      console.error('Erro ao buscar restaurante:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const buscarAvaliacoes = async () => {
    setLoadingAvaliacoes(true);
    
    try {
      const data = await avaliacaoService.getByRestaurante(id);
      setAvaliacoes(data);
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
    } finally {
      setLoadingAvaliacoes(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este restaurante?')) {
      return;
    }
    
    try {
      await restauranteService.delete(id);
      alert('Restaurante excluído com sucesso!');
      router.push('/restaurantes');
    } catch (err) {
      alert(err.error || 'Erro ao excluir restaurante');
    }
  };
  
  if (loading) {
    return <Loading message="Carregando detalhes..." />;
  }
  
  if (error) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={buscarDetalhes}
      />
    );
  }
  
  if (!restaurante) {
    return (
      <div className="not-found">
        <h2>Restaurante não encontrado</h2>
        <Link href="/restaurantes">← Voltar para listagem</Link>
      </div>
    );
  }
  
  return (
    <div className="restaurante-detalhe-page">
      <div className="breadcrumb">
        <Link href="/restaurantes">Restaurantes</Link>
        <span> / </span>
        <span>{restaurante.nome}</span>
      </div>
      
      <div className="restaurante-header">
        <div className="header-content">
          <h1>{restaurante.nome}</h1>
          <span className="categoria-badge">{restaurante.categoria}</span>
        </div>
        
        <div className="header-actions">
          <Link 
            href={`/restaurantes/${id}/editar`}
            className="btn btn-secondary"
          >
            ✏️ Editar
          </Link>
          <button 
            onClick={handleDelete}
            className="btn btn-danger"
          >
            🗑️ Excluir
          </button>
        </div>
      </div>
      
      <div className="restaurante-info">
        <div className="info-card rating-card">
          <h3>Avaliação Geral</h3>
          <div className="rating-display">
            <div className="rating-number">
              {parseFloat(restaurante.avaliacao_media).toFixed(1)}
            </div>
            <div>
              <RatingStars rating={parseFloat(restaurante.avaliacao_media)} />
              <p className="total-avaliacoes">
                {avaliacoes.length} avaliação(ões)
              </p>
            </div>
          </div>
        </div>
        
        {restaurante.endereco && (
          <div className="info-card">
            <h3>📍 Localização</h3>
            <p>{restaurante.endereco}</p>
          </div>
        )}
        
        {restaurante.telefone && (
          <div className="info-card">
            <h3>📞 Contato</h3>
            <p>{restaurante.telefone}</p>
          </div>
        )}
        
        {restaurante.website && (
          <div className="info-card">
            <h3>🌐 Website</h3>
            <a href={restaurante.website} target="_blank" rel="noopener noreferrer">
              Visitar site
            </a>
          </div>
        )}
      </div>
      
      <div className="avaliacoes-section">
        <div className="section-header">
          <h2>Avaliações</h2>
          <Link 
            href={`/restaurantes/${id}/avaliar`}
            className="btn btn-primary"
          >
            ⭐ Adicionar Avaliação
          </Link>
        </div>
        
        {loadingAvaliacoes ? (
          <Loading message="Carregando avaliações..." />
        ) : avaliacoes.length === 0 ? (
          <div className="no-avaliacoes">
            <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
          </div>
        ) : (
          <div className="avaliacoes-list">
            {avaliacoes.map(avaliacao => (
              <AvaliacaoCard 
                key={avaliacao.id} 
                avaliacao={avaliacao}
                restauranteId={id}
                onDelete={buscarAvaliacoes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}